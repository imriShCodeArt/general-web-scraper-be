import { ScrapingService } from '../../lib/scraping-service';
import { CsvGenerator } from '../../lib/csv-generator';
import { rootContainer, TOKENS } from '../../lib/composition-root';
import type { Container } from '../../lib/di/container';
import { RecipeManager } from '../../lib/recipe-manager';
import { StorageService } from '../../lib/storage';
import { testUtils } from '../setup';

describe('Scraping Workflow Integration Tests', () => {
  let scrapingService: ScrapingService;
  let scope: Container;
  let mockRecipeManager: jest.Mocked<RecipeManager>;
  let mockStorageService: jest.Mocked<StorageService>;
  let mockCsvGenerator: jest.Mocked<CsvGenerator>;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create request scope and override dependencies at DI level
    scope = rootContainer.createScope();

    // Create mock instances
    mockRecipeManager = {
      getRecipe: jest.fn(),
      createAdapter: jest.fn(),
      listRecipes: jest.fn(),
      getRecipeBySiteUrl: jest.fn(),
      createAdapterFromFile: jest.fn(),
      listRecipesWithDetails: jest.fn(),
      loadRecipeFromFile: jest.fn(),
      validateRecipe: jest.fn(),
      clearCaches: jest.fn(),
      getCachedAdapter: jest.fn(),
      removeCachedAdapter: jest.fn(),
      getRecipeLoader: jest.fn(),
      getRecipeDetails: jest.fn(),
      // Add missing properties
      recipesDir: './recipes',
      recipeLoader: {} as any,
      adapterCache: new Map(),
      validateSiteUrl: jest.fn(),
    } as any;

    mockStorageService = {
      storeJobResult: jest.fn(),
      getJobResult: jest.fn(),
      getStorageStats: jest.fn(),
      getAllJobIds: jest.fn(),
      deleteJobResult: jest.fn(),
      stopCleanupInterval: jest.fn(),
      clearAll: jest.fn(),
      // Add missing properties
      inMemoryStorage: new Map(),
      storageDir: './storage',
      cleanupInterval: {} as any,
      ensureStorageDir: jest.fn(),
    } as any;

    mockCsvGenerator = {
      generateParentCsv: jest.fn(),
      generateVariationCsv: jest.fn(),
      generateBothCsvs: jest.fn(),
      generateFilename: jest.fn(),
      validateProducts: jest.fn(),
    };

    scope.register(TOKENS.RecipeManager, {
      lifetime: 'scoped',
      factory: () => mockRecipeManager,
    });

    scope.register(TOKENS.StorageService, {
      lifetime: 'scoped',
      factory: () => mockStorageService,
    });

    scope.register(TOKENS.CsvGenerator, {
      lifetime: 'scoped',
      factory: () => mockCsvGenerator,
    });

    // Register a transient ScrapingService within the scope so it resolves scoped deps
    scope.register(TOKENS.ScrapingService, {
      lifetime: 'transient',
      factory: async (c) => new ScrapingService(
        await c.resolve(TOKENS.StorageService),
        await c.resolve(TOKENS.RecipeManager),
        await c.resolve(TOKENS.CsvGenerator),
        await c.resolve(TOKENS.Logger),
      ),
    });

    scrapingService = await scope.resolve(TOKENS.ScrapingService);
  });

  afterEach(async () => {
    await scrapingService.cleanup();
    await scope.dispose();
  });

  describe('Complete Scraping Workflow', () => {
    it('should complete a full scraping job successfully', async () => {
      // Mock recipe
      const mockRecipe = testUtils.createMockRecipe();
      mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

      // Mock adapter
      const mockAdapter = {
        discoverProducts: jest.fn().mockImplementation(async function* () {
          yield 'https://test.com/product/1';
          yield 'https://test.com/product/2';
        }),
        extractProduct: jest.fn().mockResolvedValue(testUtils.createMockRawProduct()),
        getConfig: jest.fn().mockReturnValue(mockRecipe),
        cleanup: jest.fn().mockResolvedValue(undefined),
        validateProduct: jest.fn().mockReturnValue([]),
      };

      mockRecipeManager.createAdapter.mockResolvedValue(mockAdapter);

      // Mock CSV generation for this test
      jest.spyOn(CsvGenerator, 'generateBothCsvs').mockResolvedValue({
        parentCsv: 'parent,csv,data',
        variationCsv: 'variation,csv,data',
        productCount: 2,
        variationCount: 0,
      });

      // Mock storage
      mockStorageService.storeJobResult.mockResolvedValue(undefined);

      // Start scraping job
      const request = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
        options: {
          maxProducts: 10,
          categories: ['electronics'],
        },
      };

      const response = await scrapingService.startScraping(request);
      expect(response.success).toBe(true);
      expect(response.data?.jobId).toBeDefined();

      // Wait for job to complete with polling
      let attempts = 0;
      const maxAttempts = 50; // Increase max attempts
      while (attempts < maxAttempts) {
        const status = await scrapingService.getJobStatus(response.data!.jobId);
        console.log(`Job status attempt ${attempts}:`, status.data?.status, status.data?.processedProducts, status.data?.totalProducts);
        if (status.data?.status === 'completed' || status.data?.status === 'failed') {
          break;
        }
        await testUtils.wait(200); // Increase wait time
        attempts++;
      }

      // Check job status
      const jobStatus = await scrapingService.getJobStatus(response.data!.jobId);
      expect(jobStatus.success).toBe(true);
      expect(jobStatus.data?.status).toBe('completed');
      expect(jobStatus.data?.totalProducts).toBe(2);
      expect(jobStatus.data?.processedProducts).toBe(2);

      // Verify adapter was called correctly
      expect(mockAdapter.discoverProducts).toHaveBeenCalled();
      expect(mockAdapter.extractProduct).toHaveBeenCalledTimes(2);
      expect(mockAdapter.cleanup).toHaveBeenCalled();

      // Verify CSV generation was called
      expect(CsvGenerator.generateBothCsvs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Product',
            sku: 'TEST-001',
          }),
        ]),
      );

      // Verify storage was called
      expect(mockStorageService.storeJobResult).toHaveBeenCalledWith(
        response.data!.jobId,
        expect.objectContaining({
          jobId: response.data!.jobId,
          productCount: 2,
          variationCount: 0,
        }),
      );
    });

    it('should handle adapter creation failures gracefully', async () => {
      // Mock recipe manager to fail
      mockRecipeManager.createAdapter.mockRejectedValue(new Error('Recipe not found'));

      const request = {
        siteUrl: 'https://test.com',
        recipe: 'nonexistent-recipe',
      };

      const response = await scrapingService.startScraping(request);
      expect(response.success).toBe(true);

      // Wait for job to fail
      await testUtils.wait(100);

      const jobStatus = await scrapingService.getJobStatus(response.data!.jobId);
      expect(jobStatus.success).toBe(true);
      expect(jobStatus.data?.status).toBe('failed');
      expect(jobStatus.data?.errors).toHaveLength(1);
      expect(jobStatus.data?.errors[0].message).toContain('Recipe not found');
    });

    it('should handle product extraction failures gracefully', async () => {
      // Mock recipe
      const mockRecipe = testUtils.createMockRecipe();
      mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

      // Mock adapter that fails on some products
      const mockAdapter = {
        discoverProducts: jest.fn().mockImplementation(async function* () {
          yield 'https://test.com/product/1';
          yield 'https://test.com/product/2';
          yield 'https://test.com/product/3';
        }),
        extractProduct: jest.fn().mockImplementation(async (url: string) => {
          if (url.includes('product/2')) {
            throw new Error('Product extraction failed');
          }
          // Add a delay to make the job take longer
          await new Promise((resolve) => setTimeout(resolve, 50));
          return Promise.resolve(testUtils.createMockRawProduct());
        }),
        getConfig: jest.fn().mockReturnValue(mockRecipe),
        cleanup: jest.fn().mockResolvedValue(undefined),
        validateProduct: jest.fn().mockReturnValue([]),
      };

      mockRecipeManager.createAdapter.mockResolvedValue(mockAdapter);

      // Mock CSV generation
      const mockCsvResult = {
        parentCsv: 'parent,csv,data',
        variationCsv: 'variation,csv,data',
        variationCount: 0,
      };
      jest.spyOn(CsvGenerator, 'generateBothCsvs').mockResolvedValue({
        ...mockCsvResult,
        productCount: 2,
      });

      // Mock storage
      mockStorageService.storeJobResult.mockResolvedValue(undefined);

      // Start scraping job
      const request = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
      };

      const response = await scrapingService.startScraping(request);
      expect(response.success).toBe(true);

      // Wait for job to complete with polling
      let attempts = 0;
      const maxAttempts = 20;
      while (attempts < maxAttempts) {
        const status = await scrapingService.getJobStatus(response.data!.jobId);
        if (status.data?.status === 'completed' || status.data?.status === 'failed') {
          break;
        }
        await testUtils.wait(100);
        attempts++;
      }

      // Check job status
      const jobStatus = await scrapingService.getJobStatus(response.data!.jobId);
      expect(jobStatus.success).toBe(true);
      expect(jobStatus.data?.status).toBe('completed');
      expect(jobStatus.data?.totalProducts).toBe(3);
      expect(jobStatus.data?.processedProducts).toBe(2); // Only 2 products were successfully processed
      expect(jobStatus.data?.errors).toHaveLength(1);
      expect(jobStatus.data?.errors[0].message).toContain('Product extraction failed');

      // Verify CSV generation was called with successful products only
      expect(CsvGenerator.generateBothCsvs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Product',
            sku: 'TEST-001',
          }),
        ]),
      );
    });

    it('should respect rate limiting and concurrency settings', async () => {
      // Mock recipe with specific rate limiting
      const mockRecipe = testUtils.createMockRecipe({
        behavior: {
          rateLimit: 200, // 200ms between requests
          maxConcurrent: 1, // Only 1 concurrent request
        },
      });
      mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

      // Mock adapter with timing verification
      const startTime = Date.now();
      const extractionTimes: number[] = [];

      const mockAdapter = {
        discoverProducts: jest.fn().mockImplementation(async function* () {
          yield 'https://test.com/product/1';
          yield 'https://test.com/product/2';
          yield 'https://test.com/product/3';
        }),
        extractProduct: jest.fn().mockImplementation(async () => {
          const extractionTime = Date.now();
          extractionTimes.push(extractionTime);
          return testUtils.createMockRawProduct();
        }),
        getConfig: jest.fn().mockReturnValue(mockRecipe),
        cleanup: jest.fn().mockResolvedValue(undefined),
        validateProduct: jest.fn().mockReturnValue([]),
      };

      mockRecipeManager.createAdapter.mockResolvedValue(mockAdapter);

      // CSV generation is mocked globally

      // Mock storage
      mockStorageService.storeJobResult.mockResolvedValue(undefined);

      // Start scraping job
      const request = {
        siteUrl: 'https://test.com',
        recipe: 'test-recipe',
      };

      const response = await scrapingService.startScraping(request);
      expect(response.success).toBe(true);

      // Wait for job to complete
      await testUtils.wait(800);

      // Verify rate limiting was respected
      // With 3 products and 200ms rate limit, should take at least 400ms
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeGreaterThan(400);

      // Verify products were processed sequentially due to maxConcurrent: 1
      expect(extractionTimes).toHaveLength(3);
      for (let i = 1; i < extractionTimes.length; i++) {
        const timeDiff = extractionTimes[i] - extractionTimes[i - 1];
        expect(timeDiff).toBeGreaterThan(150); // Allow some tolerance
      }
    });
  });

  describe('Job Management Integration', () => {
    it('should list all jobs correctly', async () => {
      // Start multiple jobs
      const request1 = { siteUrl: 'https://test1.com', recipe: 'test-recipe' };
      const request2 = { siteUrl: 'https://test2.com', recipe: 'test-recipe' };

      const response1 = await scrapingService.startScraping(request1);
      const response2 = await scrapingService.startScraping(request2);

      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);

      // Wait a bit for jobs to be created
      await testUtils.wait(50);

      // List all jobs
      const allJobs = await scrapingService.getAllJobs();
      expect(allJobs.success).toBe(true);
      expect(allJobs.data).toHaveLength(2);
      expect(allJobs.data?.map((j) => j.id)).toContain(response1.data!.jobId);
      expect(allJobs.data?.map((j) => j.id)).toContain(response2.data!.jobId);
    });

    it('should cancel jobs correctly', async () => {
      // Mock recipe
      const mockRecipe = testUtils.createMockRecipe();
      mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

      // Mock adapter that takes a long time to process
      const mockAdapter = {
        discoverProducts: jest.fn().mockImplementation(async function* () {
          yield 'https://test.com/product/1';
          yield 'https://test.com/product/2';
        }),
        extractProduct: jest.fn().mockImplementation(async () => {
          // Add a long delay to make the job take time
          await new Promise((resolve) => setTimeout(resolve, 200));
          return Promise.resolve(testUtils.createMockRawProduct());
        }),
        getConfig: jest.fn().mockReturnValue(mockRecipe),
        cleanup: jest.fn().mockResolvedValue(undefined),
        validateProduct: jest.fn().mockReturnValue([]),
      };

      mockRecipeManager.createAdapter.mockResolvedValue(mockAdapter);

      // Start a job
      const request = { siteUrl: 'https://test.com', recipe: 'test-recipe' };
      const response = await scrapingService.startScraping(request);
      expect(response.success).toBe(true);

      // Wait a bit for job to be created but not complete
      await testUtils.wait(50);

      // Cancel the job
      const cancelResponse = await scrapingService.cancelJob(response.data!.jobId);
      expect(cancelResponse.success).toBe(true);
      expect(cancelResponse.data?.cancelled).toBe(true);

      // Check job status
      const jobStatus = await scrapingService.getJobStatus(response.data!.jobId);
      expect(jobStatus.success).toBe(true);
      expect(jobStatus.data?.status).toBe('failed');
      expect(jobStatus.data?.errors[0].message).toContain('Job cancelled by user');
    });

    it('should provide performance metrics', async () => {
      // Start and complete a job
      const mockRecipe = testUtils.createMockRecipe();
      mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

      const mockAdapter = {
        discoverProducts: jest.fn().mockImplementation(async function* () {
          yield 'https://test.com/product/1';
        }),
        extractProduct: jest.fn().mockResolvedValue(testUtils.createMockRawProduct()),
        getConfig: jest.fn().mockReturnValue(mockRecipe),
        cleanup: jest.fn().mockResolvedValue(undefined),
        validateProduct: jest.fn().mockReturnValue([]),
      };

      mockRecipeManager.createAdapter.mockResolvedValue(mockAdapter);

      // CSV generation is mocked globally
      mockStorageService.storeJobResult.mockResolvedValue(undefined);

      const request = { siteUrl: 'https://test.com', recipe: 'test-recipe' };
      const response = await scrapingService.startScraping(request);
      expect(response.success).toBe(true);

      // Wait for job to complete
      await testUtils.wait(100);

      // Get performance metrics
      const metrics = await scrapingService.getPerformanceMetrics();
      expect(metrics.success).toBe(true);
      expect(metrics.data?.totalJobs).toBeGreaterThan(0);
      expect(metrics.data?.totalProducts).toBeGreaterThan(0);
      expect(metrics.data?.averageTimePerProduct).toBeGreaterThanOrEqual(0);
      expect(metrics.data?.currentActiveJobs).toBeDefined();
      expect(metrics.data?.queueLength).toBeDefined();
    });
  });

  describe('Recipe Management Integration', () => {
    it('should list available recipes', async () => {
      const mockRecipes = ['recipe1', 'recipe2', 'recipe3'];
      mockRecipeManager.listRecipes.mockResolvedValue(mockRecipes);

      const response = await scrapingService.listRecipes();
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockRecipes);
    });

    it('should get recipe by name', async () => {
      const mockRecipe = testUtils.createMockRecipe();
      mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

      const response = await scrapingService.getRecipe('test-recipe');
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockRecipe);
    });

    it('should get recipe by site URL', async () => {
      const mockRecipe = testUtils.createMockRecipe();
      mockRecipeManager.getRecipeBySiteUrl.mockResolvedValue(mockRecipe);

      const response = await scrapingService.getRecipeBySiteUrl('https://test.com');
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockRecipe);
    });

    it('should handle recipe not found', async () => {
      mockRecipeManager.getRecipeBySiteUrl.mockResolvedValue(null);

      const response = await scrapingService.getRecipeBySiteUrl('https://nonexistent.com');
      expect(response.success).toBe(false);
      expect(response.error).toBe('No recipe found for this site');
    });
  });
});
