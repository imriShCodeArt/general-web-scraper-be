import { ScrapingJob, ProductOptions } from '../../domain/types';

export interface EnqueueResult {
  jobId: string;
}

export interface QueueStats {
  queued: number;
  processing: boolean;
}

/**
 * In-memory job queue with simple processing gate.
 * Phase 1 extracts responsibilities without changing behavior.
 */
export class JobQueueService {
  private readonly queue: ScrapingJob<ProductOptions>[] = [];
  private isProcessing = false;

  enqueue(job: ScrapingJob<ProductOptions>): EnqueueResult {
    this.queue.push(job);
    return { jobId: job.id };
  }

  cancel(jobId: string): boolean {
    const index = this.queue.findIndex((j) => j.id === jobId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  shift(): ScrapingJob<ProductOptions> | undefined {
    return this.queue.shift();
  }

  get length(): number {
    return this.queue.length;
  }

  get processing(): boolean {
    return this.isProcessing;
  }

  set processing(val: boolean) {
    this.isProcessing = val;
  }

  stats(): QueueStats {
    return { queued: this.queue.length, processing: this.isProcessing };
  }
}


