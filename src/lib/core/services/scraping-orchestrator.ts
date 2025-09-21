import {
  ScrapingJob,
  ScrapingRequest,
  NormalizedProduct,
  JobResult,
  ApiResponse,
  RawProductData,
  NormalizableProductData,
  ProductOptions,
  GenericMetadata,
  RecipeConfig,
  SiteAdapter,
} from '../../domain/types';
import { NormalizationToolkit } from '../normalization/normalization';
import { CsvGenerator } from './csv-generator';
import { IStorageService } from '../../infrastructure/storage/IStorageService';
import { RecipeManager } from './recipe-manager';
import { ErrorFactory, ErrorCodes } from '../../utils/error-handler';
import { pMapWithRateLimit } from '../../helpers/concurrency';
import { makeCsvFilenames } from '../../helpers/naming';
import pino from 'pino';
import { AdapterFactory } from './adapter-factory';
import { withRetry } from '../../helpers/retry';
import { Result, ok, err } from '../../domain/results';
import { JobQueueService } from './job-queue-service';
import { JobLifecycleService } from './job-lifecycle-service';
import { DefaultProviders } from './default-providers';
import { JobManager, IJobManager } from './job-manager';
import { MetricsCollector, IMetricsCollector } from './metrics-collector';
import { ApiResponseBuilder, IApiResponseBuilder } from './api-response-builder';

/**
 * Main scraping orchestrator that coordinates the web scraping process.
 *
 * This orchestrator handles the complete scraping workflow from URL processing
 * to CSV generation, using extracted services for job management, metrics collection,
 * and API response building.
 *
 * @see {@link ../../../woocommerce_csv_spec.md WooCommerce CSV Import Specification}
 * @see {@link ../adapters/README.md Site Adapters}
 * @see {@link ../normalization/normalization.ts Normalization Toolkit}
 *
 * Key features:
 * - Job queue management with concurrency control
 * - Site-specific adapter selection and execution
 * - Product data normalization and validation
 * - CSV generation for WooCommerce import
 * - Performance monitoring and metrics collection
 * - Error handling and retry logic
 */
export class ScrapingOrchestrator {
  private logger: pino.Logger;
  private storage: IStorageService;
  private recipeManager: RecipeManager;
  private csvGenerator: CsvGenerator;
  private adapterFactory?: AdapterFactory;
  private jobQueueService?: JobQueueService;
  private jobLifecycleService?: JobLifecycleService;

  // Extracted services
  private jobManager: IJobManager;
  private metricsCollector: IMetricsCollector;
  private apiResponseBuilder: IApiResponseBuilder;

  private isProcessing = false;

  constructor(
    storage?: IStorageService,
    recipeManager?: RecipeManager,
    csvGenerator?: CsvGenerator,
    logger?: pino.Logger,
    adapterFactory?: AdapterFactory,
    jobQueueService?: JobQueueService,
    jobLifecycleService?: JobLifecycleService,
    jobManager?: IJobManager,
    metricsCollector?: IMetricsCollector,
    apiResponseBuilder?: IApiResponseBuilder,
  ) {
    this.logger = logger || pino({
      level: process.env.SCRAPER_DEBUG === '1' ? 'debug' : (process.env.LOG_LEVEL || 'warn'),
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
    });

    this.storage = storage || DefaultProviders.getStorageService();
    this.recipeManager = recipeManager || DefaultProviders.getRecipeManager();
    this.csvGenerator = csvGenerator || DefaultProviders.getCsvGenerator();
    this.adapterFactory = adapterFactory;
    this.jobQueueService = jobQueueService;
    this.jobLifecycleService = jobLifecycleService;

    // Initialize extracted services
    this.jobManager = jobManager || new JobManager(this.storage, this.logger, jobQueueService, jobLifecycleService);
    this.metricsCollector = metricsCollector || new MetricsCollector(this.logger);
    this.apiResponseBuilder = apiResponseBuilder || new ApiResponseBuilder();
  }

  /**
   * Domain-first Result-returning variants for controllers
   * These avoid HTTP-specific ApiResponse wrappers.
   */
  async startScrapingResult(request: ScrapingRequest<ProductOptions>): Promise<Result<{ jobId: string }>> {
    const resp = await this.startScraping(request as unknown as ScrapingRequest<ProductOptions>);
    return resp.success && resp.data?.jobId ? ok({ jobId: resp.data.jobId }) : err(String(resp.error ?? 'Failed to start job'));
  }

  async getJobStatusResult(jobId: string): Promise<Result<{ status: string; processedProducts?: number; totalProducts?: number; errors?: Array<{ message: string }> }>> {
    const resp = await this.getJobStatus(jobId);
    return resp.success && resp.data ? ok(resp.data as any) : err(String(resp.error ?? 'Not found'));
  }

  async getAllJobsResult(): Promise<Result<Array<{ id: string; status: string }>>> {
    const resp = await this.getAllJobs();
    return resp.success && resp.data ? ok(resp.data as any) : err(String(resp.error ?? 'Failed to list jobs'));
  }

  async getPerformanceMetricsResult(): Promise<Result<any>> {
    const resp = await this.getPerformanceMetrics();
    return resp.success && resp.data ? ok(resp.data as any) : err(String(resp.error ?? 'Failed to fetch metrics'));
  }

  async getLivePerformanceMetricsResult(): Promise<Result<unknown>> {
    const resp = await this.getLivePerformanceMetrics();
    return resp.success && resp.data ? ok(resp.data as any) : err(String(resp.error ?? 'Failed to fetch live metrics'));
  }

  async getPerformanceRecommendationsResult(): Promise<Result<unknown>> {
    const resp = await this.getPerformanceRecommendations();
    return resp.success && resp.data ? ok(resp.data as any) : err(String(resp.error ?? 'Failed to fetch recommendations'));
  }

  async cancelJobResult(jobId: string): Promise<Result<{ cancelled: boolean }>> {
    const resp = await this.cancelJob(jobId);
    return resp.success && resp.data ? ok(resp.data as any) : err(String(resp.error ?? 'Failed to cancel job'));
  }

  async getStorageStatsResult(): Promise<Result<unknown>> {
    const resp = await this.getStorageStats();
    return resp.success && resp.data ? ok(resp.data as any) : err(String(resp.error ?? 'Failed to get storage stats'));
  }

  /**
   * Normalize a raw product with proper generic constraints
   */
  private async normalizeProduct<T extends NormalizableProductData>(
    rawProduct: T,
    url?: string,
  ): Promise<NormalizedProduct> {
    return NormalizationToolkit.normalizeProduct(rawProduct, url || '');
  }

  /**
   * Generate filename for CSV outputs
   */
  private generateFilename(siteUrl: string, jobId: string): string {
    const filenames = makeCsvFilenames(siteUrl, jobId);
    return filenames.parent; // Use parent filename as the main filename
  }

  /**
   * Start a new scraping job.
   */
  async startScraping(request: ScrapingRequest<ProductOptions>): Promise<ApiResponse<{ jobId: string }>> {
    try {
      // Validate request
      if (!request.siteUrl || !request.recipe) {
        return this.apiResponseBuilder.createErrorResponse<{ jobId: string }, string>('Missing required fields: siteUrl and recipe');
      }

      // Create job using JobManager
      const job = this.jobManager.createJob(request);

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processJobs();
      }

      return this.apiResponseBuilder.createSuccessResponse({ jobId: job.id }, 'Job created successfully');
    } catch (error) {
      this.logger.error('Failed to start scraping job:', error);
      return this.apiResponseBuilder.createErrorResponse<{ jobId: string }, string>(String(error));
    }
  }

  /**
   * Process jobs from the queue
   */
  private async processJobs(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.jobManager.hasJobsInQueue()) {
        const job = this.jobManager.getNextJob();
        if (job) {
          await this.processJob(job);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: ScrapingJob<ProductOptions>): Promise<void> {
    try {
      this.logger.info(`Starting job ${job.id} for ${job.metadata.siteUrl}`);

      // Mark job as running
      this.jobManager.markJobRunning(job.id);

      // Get recipe configuration
      const recipe = await this.recipeManager.getRecipe(job.metadata.recipe);
      if (!recipe) {
        throw new Error(`Recipe not found: ${job.metadata.recipe}`);
      }

      // Create adapter
      const adapter = await this.createAdapter(job.metadata.recipe, job.metadata.siteUrl);

      try {
        // Discover products with optional limit
        const productUrls: string[] = [];
        const options = job.metadata.options || {};
        const maxProducts: number | undefined =
          typeof options.maxProducts === 'number' ? options.maxProducts : undefined;

        for await (const url of adapter.discoverProducts()) {
          productUrls.push(url);

          // Stop discovering if we've reached the limit
          if (maxProducts && productUrls.length >= maxProducts) {
            this.logger.info(`Reached product limit of ${maxProducts}, stopping discovery`);
            break;
          }
        }

        job.totalProducts = productUrls.length;
        this.logger.info(
          `Discovered ${productUrls.length} products for job ${job.id}${maxProducts ? ` (limited to ${maxProducts})` : ''}`,
        );

        if (productUrls.length === 0) {
          throw new Error('No products found');
        }

        // Enhanced concurrent processing with optimized settings
        const maxConcurrent = Math.min(
          recipe.behavior?.maxConcurrent || 10,
          productUrls.length,
        );
        const rateLimit = Math.max(recipe.behavior?.rateLimit || 50, 10);

        this.logger.info(
          `Processing ${productUrls.length} products with ${maxConcurrent} concurrent workers and ${rateLimit}ms rate limit`,
        );

        // Process products using the new concurrency helper
        const productResults = await pMapWithRateLimit(
          productUrls,
          async (url, index) => {
            if (!url) return null;

            try {
              this.logger.debug(
                `Processing product ${index + 1}/${productUrls.length}: ${url}`,
              );

              const startTime = Date.now();
              const retryAttempts = recipe.behavior?.retryAttempts ?? 3;
              const retryDelayMs = recipe.behavior?.retryDelay ?? 250;
              const hasAdapterRetry = typeof (adapter as unknown as { extractProductWithRetry?: (u: string) => Promise<RawProductData> }).extractProductWithRetry === 'function';
              const rawProduct = hasAdapterRetry
                ? await (adapter as unknown as { extractProductWithRetry: (u: string) => Promise<RawProductData> }).extractProductWithRetry(url)
                : await withRetry(() => adapter.extractProduct(url), {
                  maxAttempts: Math.max(1, retryAttempts),
                  baseDelayMs: Math.max(0, retryDelayMs),
                  jitterRatio: 0.1,
                });
              const extractionTime = Date.now() - startTime;

              this.logger.debug(`Raw product data extracted in ${extractionTime}ms:`, {
                title: rawProduct.title?.substring(0, 50),
                hasAttributes: Object.keys(rawProduct.attributes || {}).length > 0,
                hasVariations: (rawProduct.variations || []).length > 0,
                hasShortDescription: rawProduct.shortDescription,
                hasStockStatus: rawProduct.stockStatus,
                hasImages: (rawProduct.images || []).length > 0,
                hasCategory: rawProduct.category,
              });

              const normalizedProduct = await this.normalizeProduct(rawProduct, url);

              return {
                product: normalizedProduct,
                url,
                extractionTime,
                success: true,
              };
            } catch (error) {
              this.logger.error(`Failed to process product ${url}:`, error);
              const scrapingError = ErrorFactory.createScrapingError(
                `Failed to process ${url}`,
                ErrorCodes.RECIPE_ERROR,
                false,
              );
              job.errors.push(scrapingError);

              return {
                product: null,
                url,
                extractionTime: 0,
                success: false,
                error: String(error),
              };
            }
          },
          {
            concurrency: maxConcurrent,
            minDelayMs: rateLimit,
          },
        );

        // Filter successful products
        const products = productResults
          .filter(result => result?.success && result.product)
          .map(result => result!.product) as NormalizedProduct[];

        const failedCount = productResults.filter(result => !result?.success).length;

        this.logger.info(
          `Job ${job.id} processed ${productResults.length} products: ${products.length} successful, ${failedCount} failed`,
        );

        if (products.length === 0) {
          throw new Error('No products were successfully processed');
        }

        // Generate CSV
        const csvResult = await this.csvGenerator.generateBothCsvs(products);

        this.logger.info(`Generated CSV for job ${job.id}:`, {
          productCount: products.length,
          productsWithAttributes: products.filter(p => Object.keys(p.attributes).length > 0).length,
          productsWithVariations: products.filter(p => p.variations && p.variations.length > 0).length,
          productsWithImages: products.filter(p => p.images && p.images.length > 0).length,
          productsWithCategories: products.filter(p => p.category).length,
          productsWithShortDescriptions: products.filter(p => p.shortDescription).length,
          productsWithStockStatus: products.filter(p => p.stockStatus).length,
          productsWithPrices: products.filter(p => p.regularPrice).length,
          productsWithSkus: products.filter(p => p.sku).length,
          productsWithTitles: products.filter(p => p.title).length,
          productsWithDescriptions: products.filter(p => p.description).length,
          productsWithAttributesDetails: products.map(p => ({
            sku: p.sku,
            attributesCount: Object.keys(p.attributes).length,
            hasAttributes: Object.keys(p.attributes).length > 0,
            attributes: p.attributes,
          })),
          variationCsvLength: csvResult.variationCsv.length,
          parentCsvLength: csvResult.parentCsv.length,
          variationCount: csvResult.variationCount,
        });

        // Store results
        const result: JobResult = {
          jobId: job.id,
          parentCsv: csvResult.parentCsv,
          variationCsv: csvResult.variationCsv,
          productCount: products.length,
          variationCount: csvResult.variationCount,
          filename: this.generateFilename(job.metadata.siteUrl, job.id),
          metadata: job.metadata,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        };

        await this.jobManager.storeJobResult(job.id, result);

        // Mark job as completed
        this.jobManager.markJobCompleted(job.id, products.length, csvResult.variationCount);

        // Record metrics
        const jobEndTime = Date.now();
        const jobStartTime = job.startedAt ? job.startedAt.getTime() : jobEndTime;
        const jobDuration = jobEndTime - jobStartTime;

        this.metricsCollector.recordJobMetrics(
          products.length,
          products.length, // All products were successful
          0, // No failed products in this batch
          jobDuration,
          job.errors.map(e => e.message),
        );

        this.logger.info(
          `Job ${job.id} completed successfully. Processed ${products.length} products in ${jobDuration}ms.`,
        );
        this.metricsCollector.logMetrics();
      } finally {
        // Clean up adapter resources (including Puppeteer)
        if (this.adapterFactory) {
          await this.adapterFactory.cleanupAdapter(adapter);
        } else if (adapter && typeof adapter.cleanup === 'function') {
          await adapter.cleanup();
        }
      }
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);

      this.jobManager.markJobFailed(job.id, String(error));

      const scrapingError = ErrorFactory.createScrapingError(
        `Job failed: ${error}`,
        ErrorCodes.RECIPE_ERROR,
        false,
      );
      job.errors.push(scrapingError);

      // Clean up adapter resources even on failure
      try {
        const adapter = await this.createAdapter(job.metadata.recipe, job.metadata.siteUrl);
        if (this.adapterFactory) {
          await this.adapterFactory.cleanupAdapter(adapter);
        } else if (adapter && typeof adapter.cleanup === 'function') {
          await adapter.cleanup();
        }
      } catch (cleanupError) {
        this.logger.warn(`Failed to cleanup adapter for failed job ${job.id}:`, cleanupError);
      }
    }
  }

  /**
   * Create adapter based on recipe or auto-detection.
   */
  private async createAdapter(recipe: string, siteUrl: string): Promise<SiteAdapter<RawProductData>> {
    if (this.adapterFactory) {
      return this.adapterFactory.createAdapter(siteUrl, recipe);
    }

    try {
      return await this.recipeManager.createAdapter(siteUrl, recipe);
    } catch (error) {
      this.logger.warn(`Failed to create adapter with recipe '${recipe}', trying auto-detection:`, error);
      return await this.recipeManager.createAdapter(siteUrl);
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<ApiResponse<ScrapingJob<ProductOptions>>> {
    try {
      const job = this.jobManager.getJob(jobId);
      if (!job) {
        return this.apiResponseBuilder.buildNotFoundResponse('Job');
      }

      return this.apiResponseBuilder.buildJobStatusResponse(job);
    } catch (error) {
      this.logger.error('Failed to get job status:', error);
      return this.apiResponseBuilder.createErrorResponse<ScrapingJob<ProductOptions>, string>(String(error));
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<ApiResponse<ScrapingJob<ProductOptions>[]>> {
    try {
      const jobs = this.jobManager.getAllJobs();
      return this.apiResponseBuilder.buildAllJobsResponse(jobs);
    } catch (error) {
      this.logger.error('Failed to get all jobs:', error);
      return this.apiResponseBuilder.createErrorResponse<ScrapingJob<ProductOptions>[], string>(String(error));
    }
  }

  /**
   * List available recipes
   */
  async listRecipes(): Promise<ApiResponse<string[]>> {
    try {
      const recipes = await this.recipeManager.listRecipes();
      return this.apiResponseBuilder.buildRecipesResponse(recipes);
    } catch (error) {
      this.logger.error('Failed to list recipes:', error);
      return this.apiResponseBuilder.createErrorResponse<string[], string>(String(error));
    }
  }

  /**
   * Get recipe by name
   */
  async getRecipe(recipeName: string): Promise<ApiResponse<RecipeConfig>> {
    try {
      const recipe = await this.recipeManager.getRecipe(recipeName);
      if (!recipe) {
        return this.apiResponseBuilder.buildNotFoundResponse('Recipe');
      }

      return this.apiResponseBuilder.buildRecipeResponse(recipe);
    } catch (error) {
      this.logger.error('Failed to get recipe:', error);
      return this.apiResponseBuilder.createErrorResponse<RecipeConfig, string>(String(error));
    }
  }

  /**
   * Get recipe by site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<ApiResponse<RecipeConfig>> {
    try {
      const recipe = await this.recipeManager.getRecipeBySiteUrl(siteUrl);
      if (!recipe) {
        return this.apiResponseBuilder.buildNotFoundResponse('Recipe');
      }

      return this.apiResponseBuilder.buildRecipeResponse(recipe);
    } catch (error) {
      this.logger.error('Failed to get recipe by site URL:', error);
      return this.apiResponseBuilder.createErrorResponse<RecipeConfig, string>(String(error));
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<ApiResponse<{ cancelled: boolean }>> {
    try {
      const cancelled = this.jobManager.cancelJob(jobId);
      return this.apiResponseBuilder.buildCancelJobResponse(cancelled);
    } catch (error) {
      this.logger.error('Failed to cancel job:', error);
      return this.apiResponseBuilder.createErrorResponse<{ cancelled: boolean }, string>(String(error));
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    try {
      const stats = await this.storage.getStorageStats();
      return this.apiResponseBuilder.buildStorageStatsResponse(stats);
    } catch (error) {
      this.logger.error('Failed to get storage stats:', error);
      return this.apiResponseBuilder.createErrorResponse<GenericMetadata<unknown>, string>(String(error));
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    try {
      const metrics = this.metricsCollector.getMetrics();
      return this.apiResponseBuilder.buildPerformanceResponse(metrics);
    } catch (error) {
      this.logger.error('Failed to get performance metrics:', error);
      return this.apiResponseBuilder.createErrorResponse<GenericMetadata<unknown>, string>(String(error));
    }
  }

  /**
   * Get live performance metrics
   */
  async getLivePerformanceMetrics(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    try {
      const metrics = this.metricsCollector.getLiveMetrics();
      return this.apiResponseBuilder.buildLiveMetricsResponse(metrics);
    } catch (error) {
      this.logger.error('Failed to get live performance metrics:', error);
      return this.apiResponseBuilder.createErrorResponse<GenericMetadata<unknown>, string>(String(error));
    }
  }

  /**
   * Get performance recommendations
   */
  async getPerformanceRecommendations(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    try {
      const recommendations = this.metricsCollector.getRecommendations();
      return this.apiResponseBuilder.buildRecommendationsResponse(recommendations);
    } catch (error) {
      this.logger.error('Failed to get performance recommendations:', error);
      return this.apiResponseBuilder.createErrorResponse<GenericMetadata<unknown>, string>(String(error));
    }
  }
}
