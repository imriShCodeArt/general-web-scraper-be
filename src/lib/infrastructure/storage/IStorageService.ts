import { StorageEntry, JobResult } from '../../domain/types';

export interface IStorageService {
  storeJobResult(jobId: string, result: JobResult): Promise<void>;
  getJobResult(jobId: string): Promise<StorageEntry | null>;
  getAllJobIds(): Promise<string[]>;
  deleteJobResult(jobId: string): Promise<boolean>;
  getStorageStats(): Promise<{
    totalJobs: number;
    memoryJobs: number;
    filesystemJobs: number;
    totalSize: number;
  }>;
  clearAll(): Promise<void>;
  stopCleanupInterval(): void;
}


