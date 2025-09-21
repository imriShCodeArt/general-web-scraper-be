import { JobManager } from '../job-manager';
import { ScrapingRequest, JobResult } from '../../../domain/types';
import { StorageService } from '../../../infrastructure/storage/storage';
import pino from 'pino';

// Mock storage service
const mockStorage = {
  storeJobResult: jest.fn(),
  getJobResult: jest.fn(),
  getAllJobIds: jest.fn(),
  deleteJobResult: jest.fn(),
  getStorageStats: jest.fn(),
  clearAll: jest.fn(),
  stopCleanupInterval: jest.fn(),
  ensureStorageDir: jest.fn(),
  startCleanupInterval: jest.fn(),
  getStorageEntry: jest.fn(),
  storeStorageEntry: jest.fn(),
  storeToFilesystem: jest.fn(),
  loadFromFilesystem: jest.fn(),
  cleanupExpiredEntries: jest.fn(),
} as unknown as jest.Mocked<StorageService>;

describe('JobManager', () => {
  let jobManager: JobManager;

  beforeEach(() => {
    jest.clearAllMocks();
    const logger = pino({ level: 'silent' });
    jobManager = new JobManager(mockStorage, logger);
  });

  describe('createJob', () => {
    it('should create a new job with pending status', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      const job = jobManager.createJob(request);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.status).toBe('pending');
      expect(job.metadata.siteUrl).toBe('https://test.com');
      expect(job.metadata.recipe).toBe('test-recipe');
      expect(job.createdAt).toBeDefined();
    });

    it('should generate unique job IDs', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      const job1 = jobManager.createJob(request);
      const job2 = jobManager.createJob(request);

      expect(job1.id).not.toBe(job2.id);
    });
  });

  describe('getJob', () => {
    it('should return job if it exists', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      const job = jobManager.createJob(request);
      const retrievedJob = jobManager.getJob(job.id);

      expect(retrievedJob).toEqual(job);
    });

    it('should return undefined if job does not exist', () => {
      const retrievedJob = jobManager.getJob('non-existent-id');
      expect(retrievedJob).toBeUndefined();
    });
  });

  describe('getAllJobs', () => {
    it('should return all created jobs', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      const job1 = jobManager.createJob(request);
      const job2 = jobManager.createJob(request);
      const allJobs = jobManager.getAllJobs();

      expect(allJobs).toHaveLength(2);
      expect(allJobs).toContain(job1);
      expect(allJobs).toContain(job2);
    });

    it('should return empty array when no jobs exist', () => {
      const allJobs = jobManager.getAllJobs();
      expect(allJobs).toEqual([]);
    });
  });

  describe('cancelJob', () => {
    it('should cancel a pending job', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      const job = jobManager.createJob(request);
      const result = jobManager.cancelJob(job.id);

      expect(result).toBe(true);
      expect(job.status).toBe('cancelled');
    });

    it('should return false for non-existent job', () => {
      const result = jobManager.cancelJob('non-existent-id');
      expect(result).toBe(false);
    });

    it('should return false for already completed job', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      const job = jobManager.createJob(request);
      jobManager.markJobCompleted(job.id, 5, 2);

      const result = jobManager.cancelJob(job.id);
      expect(result).toBe(false);
    });
  });

  describe('storeJobResult', () => {
    it('should store job result using storage service', async () => {
      const jobId = 'test-job-id';
      const result: JobResult = {
        jobId,
        productCount: 5,
        variationCount: 2,
        parentCsv: 'test,data',
        variationCsv: 'variation,data',
        filename: 'test.csv',
        metadata: {
          siteUrl: 'https://test.com',
          recipe: 'test-recipe',
          categories: [],
        },
      };

      await jobManager.storeJobResult(jobId, result);

      expect(mockStorage.storeJobResult).toHaveBeenCalledWith(jobId, result);
    });
  });

  describe('getJobResult', () => {
    it('should retrieve job result from storage service', async () => {
      const jobId = 'test-job-id';
      const result: JobResult = {
        jobId,
        productCount: 5,
        variationCount: 2,
        parentCsv: 'test,data',
        variationCsv: 'variation,data',
        filename: 'test.csv',
        metadata: {
          siteUrl: 'https://test.com',
          recipe: 'test-recipe',
          categories: [],
        },
      };

      mockStorage.getJobResult.mockResolvedValue(result as any);

      const retrievedResult = await jobManager.getJobResult(jobId);

      expect(retrievedResult).toEqual(result);
      expect(mockStorage.getJobResult).toHaveBeenCalledWith(jobId);
    });

    it('should return null when job result not found', async () => {
      mockStorage.getJobResult.mockResolvedValue(null);

      const result = await jobManager.getJobResult('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAllJobIds', () => {
    it('should retrieve all job IDs from storage service', async () => {
      const jobIds = ['job1', 'job2', 'job3'];
      mockStorage.getAllJobIds.mockResolvedValue(jobIds);

      const result = await jobManager.getAllJobIds();

      expect(result).toEqual(jobIds);
      expect(mockStorage.getAllJobIds).toHaveBeenCalled();
    });
  });

  describe('markJobRunning', () => {
    it('should update job status to running', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      const job = jobManager.createJob(request);
      jobManager.markJobRunning(job.id);

      expect(job.status).toBe('running');
    });
  });

  describe('markJobCompleted', () => {
    it('should update job status to completed with metrics', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      const job = jobManager.createJob(request);
      jobManager.markJobCompleted(job.id, 5, 2);

      expect(job.status).toBe('completed');
      expect(job.processedProducts).toBe(5);
      expect(job.processedProducts).toBe(5);
    });
  });

  describe('markJobFailed', () => {
    it('should update job status to failed with error', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      const job = jobManager.createJob(request);
      jobManager.markJobFailed(job.id, 'Test error');

      expect(job.status).toBe('failed');
      expect(job.errors[0].message).toBe('Test error');
    });
  });

  describe('getNextJob', () => {
    it('should return the first pending job', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      const job1 = jobManager.createJob(request);
      jobManager.createJob(request);

      const nextJob = jobManager.getNextJob();

      expect(nextJob).toEqual(job1);
    });

    it('should return undefined when no pending jobs', () => {
      const nextJob = jobManager.getNextJob();
      expect(nextJob).toBeUndefined();
    });
  });

  describe('hasJobsInQueue', () => {
    it('should return true when there are pending jobs', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      jobManager.createJob(request);

      expect(jobManager.hasJobsInQueue()).toBe(true);
    });

    it('should return false when no pending jobs', () => {
      expect(jobManager.hasJobsInQueue()).toBe(false);
    });
  });

  describe('getQueueLength', () => {
    it('should return the number of pending jobs', () => {
      const request: ScrapingRequest<any> = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {},
      } as any;

      jobManager.createJob(request);
      jobManager.createJob(request);

      expect(jobManager.getQueueLength()).toBe(2);
    });

    it('should return 0 when no pending jobs', () => {
      expect(jobManager.getQueueLength()).toBe(0);
    });
  });
});
