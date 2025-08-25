import { promises as fs } from 'fs';
import { join } from 'path';
import { StorageEntry, JobResult } from '../types';

export class StorageService {
  private inMemoryStorage = new Map<string, StorageEntry>();
  private storageDir: string;
  private cleanupInterval!: NodeJS.Timeout;

  constructor(storageDir: string = './storage') {
    this.storageDir = storageDir;
    this.ensureStorageDir();
    this.startCleanupInterval();
  }

  /**
   * Ensure storage directory exists
   */
  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
    }
  }

  /**
   * Store job results in both memory and filesystem
   */
  async storeJobResult(jobId: string, result: JobResult): Promise<void> {
    console.log('🔍 DEBUG: storeJobResult called with:', {
      jobId,
      parentCsvLength: result.parentCsv.length,
      variationCsvLength: result.variationCsv.length,
      productCount: result.productCount,
      variationCount: result.variationCount
    });
    
    const entry: StorageEntry = {
      jobId,
      parentCsv: result.parentCsv,
      variationCsv: result.variationCsv,
      metadata: result,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    // Store in memory
    this.inMemoryStorage.set(jobId, entry);

    // Store in filesystem
    await this.storeToFilesystem(jobId, entry);
    
    console.log('🔍 DEBUG: storeJobResult completed for jobId:', jobId);
  }

  /**
   * Store entry to filesystem
   */
  private async storeToFilesystem(jobId: string, entry: StorageEntry): Promise<void> {
    try {
      const filePath = join(this.storageDir, `${jobId}.json`);
      const fileContent = {
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        expiresAt: entry.expiresAt.toISOString(),
      };
      
      await fs.writeFile(filePath, JSON.stringify(fileContent, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to store job ${jobId} to filesystem:`, error);
    }
  }

  /**
   * Retrieve job result from memory first, then filesystem
   */
  async getJobResult(jobId: string): Promise<StorageEntry | null> {
    console.log('🔍 DEBUG: getJobResult called for jobId:', jobId);
    
    // Check memory first
    const memoryEntry = this.inMemoryStorage.get(jobId);
    if (memoryEntry) {
      console.log('🔍 DEBUG: getJobResult found in memory:', {
        hasParentCsv: !!memoryEntry.parentCsv,
        parentCsvLength: memoryEntry.parentCsv.length,
        hasVariationCsv: !!memoryEntry.variationCsv,
        variationCsvLength: memoryEntry.variationCsv.length
      });
      return memoryEntry;
    }

    console.log('🔍 DEBUG: getJobResult not found in memory, checking filesystem');
    // Check filesystem
    const filesystemEntry = await this.loadFromFilesystem(jobId);
    
    if (filesystemEntry) {
      console.log('🔍 DEBUG: getJobResult found in filesystem:', {
        hasParentCsv: !!filesystemEntry.parentCsv,
        parentCsvLength: filesystemEntry.parentCsv.length,
        hasVariationCsv: !!filesystemEntry.variationCsv,
        variationCsvLength: filesystemEntry.variationCsv.length
      });
    } else {
      console.log('🔍 DEBUG: getJobResult not found anywhere');
    }
    
    return filesystemEntry;
  }

  /**
   * Load entry from filesystem
   */
  private async loadFromFilesystem(jobId: string): Promise<StorageEntry | null> {
    try {
      const filePath = join(this.storageDir, `${jobId}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(fileContent);
      
      // Convert ISO strings back to Date objects
      const entry: StorageEntry = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        expiresAt: new Date(parsed.expiresAt),
      };

      // Cache in memory
      this.inMemoryStorage.set(jobId, entry);
      
      return entry;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all job IDs
   */
  async getAllJobIds(): Promise<string[]> {
    const memoryIds = Array.from(this.inMemoryStorage.keys());
    
    try {
      const files = await fs.readdir(this.storageDir);
      const fileIds = files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
      
      // Merge and deduplicate
      const allIds = [...new Set([...memoryIds, ...fileIds])];
      return allIds;
    } catch (error) {
      return memoryIds;
    }
  }

  /**
   * Delete job result
   */
  async deleteJobResult(jobId: string): Promise<boolean> {
    // Remove from memory
    const memoryRemoved = this.inMemoryStorage.delete(jobId);
    
    // Remove from filesystem
    let fileRemoved = false;
    try {
      const filePath = join(this.storageDir, `${jobId}.json`);
      await fs.unlink(filePath);
      fileRemoved = true;
    } catch (error) {
      // File might not exist
    }

    return memoryRemoved || fileRemoved;
  }

  /**
   * Clean up expired entries
   */
  private async cleanupExpiredEntries(): Promise<void> {
    const now = new Date();
    const expiredIds: string[] = [];

    // Check memory storage
    for (const [jobId, entry] of this.inMemoryStorage.entries()) {
      if (entry.expiresAt < now) {
        expiredIds.push(jobId);
      }
    }

    // Remove expired entries
    for (const jobId of expiredIds) {
      await this.deleteJobResult(jobId);
    }

    // Check filesystem for expired entries
    try {
      const files = await fs.readdir(this.storageDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const jobId = file.replace('.json', '');
          const entry = await this.loadFromFilesystem(jobId);
          
          if (entry && entry.expiresAt < now) {
            await this.deleteJobResult(jobId);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup filesystem:', error);
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries().catch(error => {
        console.error('Cleanup failed:', error);
      });
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Stop cleanup interval
   */
  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Get storage statistics
   */
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
      filesystemJobs = files.filter(file => file.endsWith('.json')).length;
      
      // Calculate total size
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(this.storageDir, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      console.error('Failed to get filesystem stats:', error);
    }

    return {
      totalJobs: memoryJobs + filesystemJobs,
      memoryJobs,
      filesystemJobs,
      totalSize,
    };
  }

  /**
   * Clear all storage
   */
  async clearAll(): Promise<void> {
    // Clear memory
    this.inMemoryStorage.clear();
    
    // Clear filesystem
    try {
      const files = await fs.readdir(this.storageDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(this.storageDir, file);
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to clear filesystem:', error);
    }
  }
}
