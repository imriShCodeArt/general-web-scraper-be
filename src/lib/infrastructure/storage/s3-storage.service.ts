import { IStorageService } from './IStorageService';
import { StorageEntry, JobResult } from '../../domain/types';

/**
 * Placeholder S3 implementation for Phase 2.
 * Implement with AWS SDK (v3) in later iteration.
 */
export class S3StorageService implements IStorageService {
  private inMemory = new Map<string, StorageEntry>();

  // Configure via env/DI in composition root later
  constructor(private readonly bucketName: string = 'placeholder-bucket') {}

  async storeJobResult(jobId: string, result: JobResult): Promise<void> {
    const entry: StorageEntry = {
      jobId,
      parentCsv: result.parentCsv,
      variationCsv: result.variationCsv,
      metadata: result,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    // For now, keep in memory; integrate S3 PutObject later
    this.inMemory.set(jobId, entry);
  }

  async getJobResult(jobId: string): Promise<StorageEntry | null> {
    // Later: fetch from S3 if not in memory
    return this.inMemory.get(jobId) || null;
  }

  async getAllJobIds(): Promise<string[]> {
    // Later: list objects from S3 prefix
    return Array.from(this.inMemory.keys());
  }

  async deleteJobResult(jobId: string): Promise<boolean> {
    // Later: delete object in S3
    return this.inMemory.delete(jobId);
  }

  stopCleanupInterval(): void {
    // No-op for S3
  }

  async getStorageStats(): Promise<{ totalJobs: number; memoryJobs: number; filesystemJobs: number; totalSize: number; }> {
    // Later: derive from S3 head/list
    return {
      totalJobs: this.inMemory.size,
      memoryJobs: this.inMemory.size,
      filesystemJobs: 0,
      totalSize: Array.from(this.inMemory.values()).reduce((acc, e) => acc + e.parentCsv.length + e.variationCsv.length, 0),
    };
  }

  async clearAll(): Promise<void> {
    this.inMemory.clear();
    // Later: delete all under prefix in S3
  }
}


