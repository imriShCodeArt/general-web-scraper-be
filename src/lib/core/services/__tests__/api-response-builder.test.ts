import { ApiResponseBuilder } from '../api-response-builder';
import { ScrapingJob } from '../../../domain/types';
import { Metrics } from '../../../helpers/metrics';
// Remove GenericMetadata import as it's not needed

describe('ApiResponseBuilder', () => {
  let apiResponseBuilder: ApiResponseBuilder;

  beforeEach(() => {
    apiResponseBuilder = new ApiResponseBuilder();
  });

  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { message: 'test' };
      const response = apiResponseBuilder.createSuccessResponse(data, 'Success message');

      expect(response).toEqual({
        success: true,
        data,
        message: 'Success message',
        requestId: expect.any(String),
        timestamp: expect.any(Date),
      });
    });

    it('should create success response without message', () => {
      const data = { message: 'test' };
      const response = apiResponseBuilder.createSuccessResponse(data);

      expect(response).toEqual({
        success: true,
        data,
        message: undefined,
        requestId: expect.any(String),
        timestamp: expect.any(Date),
      });
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with error', () => {
      const error = 'Test error';
      const response = apiResponseBuilder.createErrorResponse(error, 'Error message');

      expect(response).toEqual({
        success: false,
        error,
        message: 'Error message',
        requestId: expect.any(String),
        timestamp: expect.any(Date),
      });
    });

    it('should create error response without message', () => {
      const error = 'Test error';
      const response = apiResponseBuilder.createErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error,
        message: undefined,
        requestId: expect.any(String),
        timestamp: expect.any(Date),
      });
    });
  });

  describe('buildJobStatusResponse', () => {
    it('should build job status response', () => {
      const job: ScrapingJob<any> = {
        id: 'test-job-id',
        url: 'https://test.com',
        recipe: 'test-recipe',
        status: 'pending',
        createdAt: new Date(),
        options: {},
      } as any;

      const response = apiResponseBuilder.buildJobStatusResponse(job);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(job);
      expect(response.message).toBe('Job status retrieved successfully');
    });
  });

  describe('buildAllJobsResponse', () => {
    it('should build all jobs response', () => {
      const jobs: ScrapingJob<any>[] = [
        {
          id: 'job1',
          url: 'https://test1.com',
          recipe: 'test-recipe',
          status: 'pending',
          createdAt: new Date(),
          options: {},
        },
        {
          id: 'job2',
          url: 'https://test2.com',
          recipe: 'test-recipe',
          status: 'completed',
          createdAt: new Date(),
          options: {},
        },
      ] as any[];

      const response = apiResponseBuilder.buildAllJobsResponse(jobs);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(jobs);
      expect(response.message).toBe('Jobs retrieved successfully');
    });
  });

  describe('buildRecipesResponse', () => {
    it('should build recipes response', () => {
      const recipes = ['recipe1', 'recipe2', 'recipe3'];
      const response = apiResponseBuilder.buildRecipesResponse(recipes);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(recipes);
      expect(response.message).toBe('Recipes retrieved successfully');
    });
  });

  describe('buildRecipeResponse', () => {
    it('should build recipe response', () => {
      const recipe = {
        name: 'test-recipe',
        version: '1.0.0',
        site: 'https://test.com',
        siteUrl: 'https://test.com',
        selectors: {
          title: '.title',
          price: '.price',
          images: '.image',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          attributes: '.attributes',
          productLinks: '.product-link',
        },
      };

      const response = apiResponseBuilder.buildRecipeResponse(recipe);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(recipe);
      expect(response.message).toBe('Recipe retrieved successfully');
    });
  });

  describe('buildStorageStatsResponse', () => {
    it('should build storage stats response', () => {
      const stats = {
        totalItems: 10,
        totalSize: 1024,
        lastUpdated: new Date(),
      };

      const response = apiResponseBuilder.buildStorageStatsResponse(stats);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(stats);
      expect(response.message).toBe('Storage statistics retrieved successfully');
    });
  });

  describe('buildPerformanceResponse', () => {
    it('should build performance response', () => {
      const metrics: Metrics = {
        totalProducts: 100,
        successfulProducts: 80,
        failedProducts: 20,
        totalProcessingTime: 5000,
        averageProcessingTime: 50,
        startTime: Date.now(),
        errors: ['Error 1', 'Error 2'],
        totalJobs: 10,
        averageTimePerProduct: 50,
      };

      const response = apiResponseBuilder.buildPerformanceResponse(metrics);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(expect.objectContaining({
        totalProducts: 100,
        successfulProducts: 80,
        failedProducts: 20,
        totalDuration: 5000,
        averageDuration: 50,
        successRate: 80,
        errorRate: 20,
      }));
      expect(response.message).toBe('Performance metrics retrieved successfully');
    });
  });

  describe('buildLiveMetricsResponse', () => {
    it('should build live metrics response', () => {
      const metrics = {
        activeJobs: 5,
        queueLength: 10,
        memoryUsage: 1024,
        uptime: 3600,
      };

      const response = apiResponseBuilder.buildLiveMetricsResponse(metrics);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(metrics);
      expect(response.message).toBe('Live metrics retrieved successfully');
    });
  });

  describe('buildRecommendationsResponse', () => {
    it('should build recommendations response', () => {
      const recommendations = [
        'Consider increasing concurrency',
        'Check for slow selectors',
        'Review error patterns',
      ];

      const response = apiResponseBuilder.buildRecommendationsResponse(recommendations);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(recommendations);
      expect(response.message).toBe('Performance recommendations retrieved successfully');
    });
  });

  describe('buildCancelJobResponse', () => {
    it('should build cancel job response for successful cancellation', () => {
      const response = apiResponseBuilder.buildCancelJobResponse(true);

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ cancelled: true });
      expect(response.message).toBe('Job cancelled successfully');
    });

    it('should build cancel job response for failed cancellation', () => {
      const response = apiResponseBuilder.buildCancelJobResponse(false);

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ cancelled: false });
      expect(response.message).toBe('Job could not be cancelled');
    });
  });

  describe('buildNotFoundResponse', () => {
    it('should build not found response', () => {
      const response = apiResponseBuilder.buildNotFoundResponse('Job');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Job not found');
      expect(response.message).toBeUndefined();
    });
  });

  describe('buildValidationErrorResponse', () => {
    it('should build validation error response', () => {
      const response = apiResponseBuilder.buildValidationErrorResponse('Invalid URL format');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid URL format');
      expect(response.message).toBe('Invalid URL format');
    });
  });

  describe('buildInternalErrorResponse', () => {
    it('should build internal error response', () => {
      const response = apiResponseBuilder.buildInternalErrorResponse('Database connection failed');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Database connection failed');
      expect(response.message).toBe('Database connection failed');
    });
  });
});
