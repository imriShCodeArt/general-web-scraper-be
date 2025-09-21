import { ScrapingJob, ProductOptions } from '../../domain/types';
import { ErrorFactory, ErrorCodes } from '../../utils/error-handler';

/**
 * Tracks job state, progress, and aggregates basic metrics.
 * Extracted in Phase 1 to decouple from orchestration.
 */
export class JobLifecycleService {
  private readonly activeJobs = new Map<string, ScrapingJob<ProductOptions>>();

  add(job: ScrapingJob<ProductOptions>): void {
    this.activeJobs.set(job.id, job);
  }

  get(jobId: string): ScrapingJob<ProductOptions> | undefined {
    return this.activeJobs.get(jobId);
  }

  all(): ScrapingJob<ProductOptions>[] {
    return Array.from(this.activeJobs.values());
  }

  markRunning(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'running';
      job.startedAt = new Date();
    }
  }

  markCompleted(jobId: string, productCount: number, _variationCount: number): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.completedAt = new Date();
      job.processedProducts = productCount;
    }
  }

  markFailed(jobId: string, errorMessage: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.completedAt = new Date();
      job.errors.push(
        ErrorFactory.createScrapingError(errorMessage, ErrorCodes.UNKNOWN_ERROR, false),
      );
    }
  }

  cancel(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (!job) return false;
    if (job.status === 'completed' || job.status === 'failed') return false;
    job.status = 'failed';
    job.completedAt = new Date();
    job.errors.push(
      ErrorFactory.createScrapingError('Job cancelled by user', ErrorCodes.UNKNOWN_ERROR, false),
    );
    return true;
  }
}


