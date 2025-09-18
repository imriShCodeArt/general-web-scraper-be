import { promises as fs } from 'fs';
import { join } from 'path';
import { StorageEntry, JobResult } from '../../domain/types';
import { IStorageService } from './IStorageService';

export class FsStorageService implements IStorageService {
  private inMemoryStorage = new Map<string, StorageEntry>();
  private storageDir: string;
  private cleanupInterval!: NodeJS.Timeout;

  constructor(storageDir: string = './storage') {
    this.storageDir = storageDir;
    this.ensureStorageDir();
    this.startCleanupInterval();
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch {
      // ignore
    }
  }

  async storeJobResult(jobId: string, result: JobResult): Promise<void> {
    const entry: StorageEntry = {
      jobId,
      parentCsv: result.parentCsv,
      variationCsv: result.variationCsv,
      metadata: result,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    this.inMemoryStorage.set(jobId, entry);
    await this.storeToFilesystem(jobId, entry);
  }

  private async storeToFilesystem(jobId: string, entry: StorageEntry): Promise<void> {
    const filePath = join(this.storageDir, `${jobId}.json`);
    const fileContent = {
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      expiresAt: entry.expiresAt.toISOString(),
    };
    await fs.writeFile(filePath, JSON.stringify(fileContent, null, 2), 'utf-8');
  }

  async getJobResult(jobId: string): Promise<StorageEntry | null> {
    const memoryEntry = this.inMemoryStorage.get(jobId);
    if (memoryEntry) return memoryEntry;
    return this.loadFromFilesystem(jobId);
  }

  private async loadFromFilesystem(jobId: string): Promise<StorageEntry | null> {
    try {
      const filePath = join(this.storageDir, `${jobId}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(fileContent);
      const entry: StorageEntry = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        expiresAt: new Date(parsed.expiresAt),
      };
      this.inMemoryStorage.set(jobId, entry);
      return entry;
    } catch {
      return null;
    }
  }

  async getAllJobIds(): Promise<string[]> {
    const memoryIds = Array.from(this.inMemoryStorage.keys());
    try {
      const files = await fs.readdir(this.storageDir);
      const fileIds = files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
      return [...new Set([...memoryIds, ...fileIds])];
    } catch {
      return memoryIds;
    }
  }

  async deleteJobResult(jobId: string): Promise<boolean> {
    const memoryRemoved = this.inMemoryStorage.delete(jobId);
    let fileRemoved = false;
    try {
      const filePath = join(this.storageDir, `${jobId}.json`);
      await fs.unlink(filePath);
      fileRemoved = true;
    } catch {
      // ignore unlink errors
    }
    return memoryRemoved || fileRemoved;
  }

  private async cleanupExpiredEntries(): Promise<void> {
    const now = new Date();
    const expiredIds: string[] = [];
    for (const [jobId, entry] of this.inMemoryStorage.entries()) {
      if (entry.expiresAt < now) expiredIds.push(jobId);
    }
    for (const id of expiredIds) await this.deleteJobResult(id);

    try {
      const files = await fs.readdir(this.storageDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const jobId = file.replace('.json', '');
        const entry = await this.loadFromFilesystem(jobId);
        if (entry && entry.expiresAt < now) await this.deleteJobResult(jobId);
      }
    } catch {
      // ignore read errors during cleanup
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries().catch(() => {
        // swallow cleanup errors in background task
      });
    }, 60 * 60 * 1000);
  }

  stopCleanupInterval(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  }

  async getStorageStats(): Promise<{
    totalJobs: number;
    memoryJobs: number;
    filesystemJobs: number;
    totalSize: number;
  }> {
    const memoryJobs = this.inMemoryStorage.size;
    let filesystemJobs = 0;
    let totalSize = 0;
    try {
      const files = await fs.readdir(this.storageDir);
      filesystemJobs = files.filter(f => f.endsWith('.json')).length;
      for (const f of files) {
        if (!f.endsWith('.json')) continue;
        const filePath = join(this.storageDir, f);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
    } catch {
      // ignore readdir/stat errors during stats calculation
    }
    return { totalJobs: memoryJobs + filesystemJobs, memoryJobs, filesystemJobs, totalSize };
  }

  async clearAll(): Promise<void> {
    this.inMemoryStorage.clear();
    try {
      const files = await fs.readdir(this.storageDir);
      for (const f of files) {
        if (f.endsWith('.json')) await fs.unlink(join(this.storageDir, f));
      }
    } catch {
      // ignore clear errors
    }
  }
}


