import { JobLifecycleService } from '../job-lifecycle-service';
import { ScrapingJob, ProductOptions } from '../../../domain/types';
import { ErrorFactory, ErrorCodes } from '../../../utils/error-handler';

describe('JobLifecycleService', () => {
  let service: JobLifecycleService;
  let mockJob: ScrapingJob<ProductOptions>;

  beforeEach(() => {
    service = new JobLifecycleService();
    mockJob = {
      id: 'test-job-123',
      status: 'pending',
      metadata: {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        categories: [],
        options: {} as ProductOptions
      },
      createdAt: new Date(),
      startedAt: undefined,
      completedAt: undefined,
      errors: [],
      totalProducts: 0,
      processedProducts: 0
    };
  });

  describe('add', () => {
    it('should add a job to active jobs', () => {
      service.add(mockJob);
      
      const retrievedJob = service.get(mockJob.id);
      expect(retrievedJob).toBe(mockJob);
    });

    it('should overwrite existing job with same ID', () => {
      const updatedJob = { ...mockJob, status: 'running' as const };
      
      service.add(mockJob);
      service.add(updatedJob);
      
      const retrievedJob = service.get(mockJob.id);
      expect(retrievedJob?.status).toBe('running');
    });
  });

  describe('get', () => {
    it('should return job if it exists', () => {
      service.add(mockJob);
      
      const retrievedJob = service.get(mockJob.id);
      expect(retrievedJob).toBe(mockJob);
    });

    it('should return undefined if job does not exist', () => {
      const retrievedJob = service.get('non-existent-id');
      expect(retrievedJob).toBeUndefined();
    });
  });

  describe('all', () => {
    it('should return all active jobs', () => {
      const job1 = { ...mockJob, id: 'job-1' };
      const job2 = { ...mockJob, id: 'job-2' };
      
      service.add(job1);
      service.add(job2);
      
      const allJobs = service.all();
      expect(allJobs).toHaveLength(2);
      expect(allJobs).toContain(job1);
      expect(allJobs).toContain(job2);
    });

    it('should return empty array when no jobs', () => {
      const allJobs = service.all();
      expect(allJobs).toHaveLength(0);
    });
  });

  describe('markRunning', () => {
    it('should mark job as running and set startedAt', () => {
      service.add(mockJob);
      const beforeTime = new Date();
      
      service.markRunning(mockJob.id);
      
      const updatedJob = service.get(mockJob.id);
      expect(updatedJob?.status).toBe('running');
      expect(updatedJob?.startedAt).toBeDefined();
      expect(updatedJob?.startedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    });

    it('should not throw error if job does not exist', () => {
      expect(() => service.markRunning('non-existent-id')).not.toThrow();
    });
  });

  describe('markCompleted', () => {
    it('should mark job as completed and set completedAt', () => {
      service.add(mockJob);
      const beforeTime = new Date();
      
      service.markCompleted(mockJob.id, 10, 5);
      
      const updatedJob = service.get(mockJob.id);
      expect(updatedJob?.status).toBe('completed');
      expect(updatedJob?.completedAt).toBeDefined();
      expect(updatedJob?.completedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(updatedJob?.processedProducts).toBe(10);
    });

    it('should not throw error if job does not exist', () => {
      expect(() => service.markCompleted('non-existent-id', 0, 0)).not.toThrow();
    });
  });

  describe('markFailed', () => {
    it('should mark job as failed and add error', () => {
      service.add(mockJob);
      const beforeTime = new Date();
      
      service.markFailed(mockJob.id, 'Test error');
      
      const updatedJob = service.get(mockJob.id);
      expect(updatedJob?.status).toBe('failed');
      expect(updatedJob?.completedAt).toBeDefined();
      expect(updatedJob?.completedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(updatedJob?.errors).toHaveLength(1);
      expect(updatedJob?.errors[0].message).toBe('Test error');
    });

    it('should not throw error if job does not exist', () => {
      expect(() => service.markFailed('non-existent-id', 'Test error')).not.toThrow();
    });
  });

  describe('cancel', () => {
    it('should cancel a pending job', () => {
      service.add(mockJob);
      
      const result = service.cancel(mockJob.id);
      
      expect(result).toBe(true);
      const updatedJob = service.get(mockJob.id);
      expect(updatedJob?.status).toBe('failed');
      expect(updatedJob?.errors).toHaveLength(1);
      expect(updatedJob?.errors[0].message).toBe('Job cancelled by user');
    });

    it('should return false for non-existent job', () => {
      const result = service.cancel('non-existent-id');
      expect(result).toBe(false);
    });

    it('should return false for already completed job', () => {
      service.add(mockJob);
      service.markCompleted(mockJob.id, 5, 2);
      
      const result = service.cancel(mockJob.id);
      expect(result).toBe(false);
    });

    it('should return false for already failed job', () => {
      service.add(mockJob);
      service.markFailed(mockJob.id, 'Test error');
      
      const result = service.cancel(mockJob.id);
      expect(result).toBe(false);
    });
  });
});
