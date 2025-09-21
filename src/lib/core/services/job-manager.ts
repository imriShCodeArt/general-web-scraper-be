import { ScrapingJob, ScrapingRequest, ProductOptions, JobResult } from '../../domain/types';
import { IStorageService } from '../../infrastructure/storage/IStorageService';
import { JobQueueService } from './job-queue-service';
import { JobLifecycleService } from './job-lifecycle-service';
import { generateJobId } from '../../helpers/naming';
import pino from 'pino';

/**
 * Interface for job management operations
 */
export interface IJobManager {
  createJob(request: ScrapingRequest<ProductOptions>): ScrapingJob<ProductOptions>;
  getJob(jobId: string): ScrapingJob<ProductOptions> | undefined;
  getAllJobs(): ScrapingJob<ProductOptions>[];
  cancelJob(jobId: string): boolean;
  storeJobResult(jobId: string, result: JobResult): Promise<void>;
  getJobResult(jobId: string): Promise<JobResult | null>;
  getAllJobIds(): Promise<string[]>;
  markJobRunning(jobId: string): void;
  markJobCompleted(jobId: string, processedProducts: number, variationCount: number): void;
  markJobFailed(jobId: string, error: string): void;
  getNextJob(): ScrapingJob<ProductOptions> | undefined;
  hasJobsInQueue(): boolean;
  getQueueLength(): number;
}

/**
 * Job management service that handles job lifecycle, storage, and retrieval
 */
export class JobManager implements IJobManager {
  private activeJobs = new Map<string, ScrapingJob<ProductOptions>>();
  private jobQueue: ScrapingJob<ProductOptions>[] = [];
  private logger: pino.Logger;
  private storage: IStorageService;
  private jobQueueService?: JobQueueService;
  private jobLifecycleService?: JobLifecycleService;

  constructor(
    storage: IStorageService,
    logger: pino.Logger,
    jobQueueService?: JobQueueService,
    jobLifecycleService?: JobLifecycleService,
  ) {
    this.storage = storage;
    this.logger = logger;
    this.jobQueueService = jobQueueService;
    this.jobLifecycleService = jobLifecycleService;
  }

  /**
   * Create a new scraping job
   */
  createJob(request: ScrapingRequest<ProductOptions>): ScrapingJob<ProductOptions> {
    const jobId = generateJobId();
    const job: ScrapingJob<ProductOptions> = {
      id: jobId,
      status: 'pending',
      metadata: {
        siteUrl: request.siteUrl,
        recipe: request.recipe,
        categories: (request as any).categories || [],
        options: request.options || {},
      },
      createdAt: new Date(),
      totalProducts: 0,
      processedProducts: 0,
      errors: [],
    };

    this.activeJobs.set(jobId, job);
    this.jobQueue.push(job);

    this.logger.info(`Created job ${jobId} for ${request.siteUrl}`);
    return job;
  }

  /**
   * Get a job by ID
   */
  getJob(jobId: string): ScrapingJob<ProductOptions> | undefined {
    return this.activeJobs.get(jobId);
  }

  /**
   * Get all active jobs
   */
  getAllJobs(): ScrapingJob<ProductOptions>[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === 'running') {
      job.status = 'cancelled';
      job.completedAt = new Date();
      this.logger.info(`Cancelled job ${jobId}`);
      return true;
    }

    if (job.status === 'pending') {
      job.status = 'cancelled';
      job.completedAt = new Date();
      // Remove from queue
      const index = this.jobQueue.findIndex(j => j.id === jobId);
      if (index !== -1) {
        this.jobQueue.splice(index, 1);
      }
      this.logger.info(`Cancelled pending job ${jobId}`);
      return true;
    }

    return false;
  }

  /**
   * Store job result
   */
  async storeJobResult(jobId: string, result: JobResult): Promise<void> {
    await this.storage.storeJobResult(jobId, result);
  }

  /**
   * Get job result
   */
  async getJobResult(jobId: string): Promise<JobResult | null> {
    const result = await this.storage.getJobResult(jobId);
    return result as JobResult | null;
  }

  /**
   * Get all job IDs
   */
  async getAllJobIds(): Promise<string[]> {
    return await this.storage.getAllJobIds();
  }

  /**
   * Mark job as running
   */
  markJobRunning(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      if (this.jobLifecycleService) {
        this.jobLifecycleService.markRunning(jobId);
      } else {
        job.status = 'running';
        job.startedAt = new Date();
      }
    }
  }

  /**
   * Mark job as completed
   */
  markJobCompleted(jobId: string, processedProducts: number, variationCount: number): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      if (this.jobLifecycleService) {
        this.jobLifecycleService.markCompleted(jobId, processedProducts, variationCount);
      } else {
        job.status = 'completed';
        job.completedAt = new Date();
        job.processedProducts = processedProducts;
      }
    }
  }

  /**
   * Mark job as failed
   */
  markJobFailed(jobId: string, error: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      if (this.jobLifecycleService) {
        this.jobLifecycleService.markFailed(jobId, error);
      } else {
        job.status = 'failed';
        job.completedAt = new Date();
        job.errors.push({
          name: 'ScrapingError',
          message: error,
          code: 'JOB_FAILED',
          retryable: false,
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Get next job from queue
   */
  getNextJob(): ScrapingJob<ProductOptions> | undefined {
    return this.jobQueue.shift();
  }

  /**
   * Check if there are jobs in queue
   */
  hasJobsInQueue(): boolean {
    return this.jobQueue.length > 0;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.jobQueue.length;
  }
}
