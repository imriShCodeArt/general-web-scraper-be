import { randomUUID } from 'crypto';
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
import { Metrics, createInitialMetrics, aggregateMetrics, createBatchMetrics, formatMetrics } from '../../helpers/metrics';
import { makePerformanceResponse } from '../../helpers/api';
import { makeCsvFilenames, generateJobId } from '../../helpers/naming';
import pino from 'pino';
import { AdapterFactory } from './adapter-factory';
import { Result, ok, err } from '../../domain/results';
import { JobQueueService } from './job-queue-service';
import { JobLifecycleService } from './job-lifecycle-service';
import { DefaultProviders } from './default-providers';

/**
 * Main scraping service that orchestrates the web scraping process.
 *
 * This service handles the complete scraping workflow from URL processing
 * to CSV generation, including job management, error handling, and performance
 * monitoring. It integrates with adapters, normalization, and CSV generation
 * to produce WooCommerce-compatible output.
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
export class ScrapingService {
  private logger: pino.Logger;
  private storage: IStorageService;
  private recipeManager: RecipeManager;
  private csvGenerator: CsvGenerator;
  private activeJobs = new Map<string, ScrapingJob<ProductOptions>>();
  private jobQueue: ScrapingJob<ProductOptions>[] = [];
  private isProcessing = false;
  private performanceMetrics: Metrics = createInitialMetrics();
  private adapterFactory?: AdapterFactory;
  private jobQueueService?: JobQueueService;
  private jobLifecycleService?: JobLifecycleService;

  /**
   * Helper method to create success ApiResponse objects
   */
  private createSuccessResponse<T>(data: T, message?: string): ApiResponse<T, string> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date(),
      requestId: randomUUID(),
    } as unknown as ApiResponse<T, string>;
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

  async getPerformanceMetricsResult(): Promise<Result<Metrics>> {
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
   * Helper method to create error ApiResponse objects
   */
  private createErrorResponse<T, E>(error: E, _message?: string): ApiResponse<T, string> {
    return {
      success: false,
      error: String(error) as unknown as string,
      timestamp: new Date(),
      requestId: randomUUID(),
    } as unknown as ApiResponse<T, string>;
  }

  constructor(
    storage?: IStorageService,
    recipeManager?: RecipeManager,
    csvGenerator?: CsvGenerator,
    logger?: pino.Logger,
    adapterFactory?: AdapterFactory,
    jobQueueService?: JobQueueService,
    jobLifecycleService?: JobLifecycleService,
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
  }

  /**
   * Normalize a raw product with proper generic constraints
   *
   * @param rawProduct - Raw product object from adapter with generic constraints
   * @param url - Optional product URL for context
   */
  private async normalizeProduct<T extends NormalizableProductData>(
    rawProduct: T,
    url?: string,
  ): Promise<NormalizedProduct> {
    return NormalizationToolkit.normalizeProduct(rawProduct, url || '');
  }

  /**
   * Generate filename for CSV outputs
   *
   * @param siteUrl - The site URL being scraped
   * @param jobId - The job identifier
   */
  private generateFilename(siteUrl: string, jobId: string): string {
    const filenames = makeCsvFilenames(siteUrl, jobId);
    return filenames.parent; // Use parent filename as the main filename
  }

  /**
   * Start a new scraping job.
   *
   * @param request - Includes `siteUrl`, `recipe`, and optional `options`.
   * @returns ApiResponse containing the created `jobId`.
   */
  async startScraping(request: ScrapingRequest<ProductOptions>): Promise<ApiResponse<{ jobId: string }>> {
    try {
      // Validate request
      if (!request.siteUrl || !request.recipe) {
        return this.createErrorResponse<{ jobId: string }, string>('Missing required fields: siteUrl and recipe');
      }

      // Create job
      const jobId = generateJobId();
      const job: ScrapingJob<ProductOptions> = {
        id: jobId,
        status: 'pending',
        createdAt: new Date(),
        totalProducts: 0,
        processedProducts: 0,
        errors: [],
        metadata: {
          siteUrl: request.siteUrl,
          recipe: request.recipe,
          categories: request.options?.categories || [],
          options: request.options, // Store the full options object for maxProducts access
        },
      };

      // Track job
      if (this.jobLifecycleService) {
        this.jobLifecycleService.add(job);
      }
      this.activeJobs.set(jobId, job);

      // Enqueue
      if (this.jobQueueService) {
        this.jobQueueService.enqueue(job);
      } else {
        this.jobQueue.push(job);
      }

      this.logger.info(`Created scraping job ${jobId} for ${request.siteUrl}`);

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }

      return this.createSuccessResponse({ jobId }, 'Scraping job created successfully');
    } catch (error) {
      this.logger.error('Failed to start scraping job:', error);
      return this.createErrorResponse<{ jobId: string }, string>(`Failed to start scraping job: ${error}`);
    }
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    const queueLength = this.jobQueueService ? this.jobQueueService.length : this.jobQueue.length;
    if (this.isProcessing || queueLength === 0) {
      return;
    }

    this.isProcessing = true;

    while ((this.jobQueueService ? this.jobQueueService.length : this.jobQueue.length) > 0) {
      const job = this.jobQueueService ? this.jobQueueService.shift() : this.jobQueue.shift();
      if (job) {
        await this.processJob(job);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process a single job
   */
  private async processJob(job: ScrapingJob<ProductOptions>): Promise<void> {
    try {
      this.logger.info(`Starting job ${job.id} for ${job.metadata.siteUrl}`);

      if (this.jobLifecycleService) {
        this.jobLifecycleService.markRunning(job.id);
      } else {
        job.status = 'running';
        job.startedAt = new Date();
      }

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
          recipe.behavior?.maxConcurrent || 10, // Increased default from 5 to 10
          productUrls.length, // Don't exceed the number of products
        );
        const rateLimit = Math.max(recipe.behavior?.rateLimit || 50, 10); // Reduced default from 200ms to 50ms, minimum 10ms

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
              const rawProduct = await adapter.extractProduct(url);
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

              this.logger.debug('Normalized product:', {
                title: normalizedProduct.title?.substring(0, 50),
                productType: normalizedProduct.productType,
                hasVariations: normalizedProduct.variations.length > 0,
                hasAttributes: Object.keys(normalizedProduct.attributes).length > 0,
              });

              // Only increment processed products for successful extractions
              job.processedProducts++;
              return normalizedProduct;
            } catch (error) {
              const errorMsg = `Failed to process product ${url}: ${error}`;
              this.logger.error(errorMsg);
              const scrapingError = ErrorFactory.createScrapingError(
                errorMsg,
                ErrorCodes.PRODUCT_NOT_FOUND,
                true,
              );
              job.errors.push(scrapingError);
              return null;
            }
          },
          {
            concurrency: maxConcurrent,
            minDelayMs: rateLimit,
          },
        );

        const products = productResults.filter((p) => p !== null) as NormalizedProduct[];

        // Generate CSV files
        const csvResult = await CsvGenerator.generateBothCsvs(products);

        this.logger.debug('Product type detection results:', {
          totalProducts: products.length,
          productTypes: products.map((p) => ({
            title: p.title.substring(0, 50),
            productType: p.productType,
            variationsCount: p.variations.length,
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

        await this.storage.storeJobResult(job.id, result);

        // Mark job as completed
        if (this.jobLifecycleService) {
          this.jobLifecycleService.markCompleted(job.id, products.length, csvResult.variationCount);
        } else {
          job.status = 'completed';
          job.completedAt = new Date();
          // totalProducts should remain as the total discovered, not just successful ones
          job.processedProducts = products.length;
        }

        // Update performance metrics using the new metrics helper
        const jobEndTime = Date.now();
        const jobStartTime = job.startedAt ? job.startedAt.getTime() : jobEndTime;
        const jobDuration = jobEndTime - jobStartTime;
        const batchMetrics = createBatchMetrics(
          products.length,
          products.length, // All products were successful
          0, // No failed products in this batch
          jobDuration,
          job.errors.map(e => e.message),
        );

        this.performanceMetrics = aggregateMetrics(this.performanceMetrics, batchMetrics);

        this.logger.info(
          `Job ${job.id} completed successfully. Processed ${products.length} products in ${jobDuration}ms.`,
        );
        this.logger.info(
          `Performance Metrics - ${formatMetrics(this.performanceMetrics)}`,
        );
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

      if (this.jobLifecycleService) {
        this.jobLifecycleService.markFailed(job.id, String(error));
      } else {
        job.status = 'failed';
        job.completedAt = new Date();
      }
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
   * @param recipe - Recipe name to prefer
   * @param siteUrl - Target website URL
   */
  private async createAdapter(recipe: string, siteUrl: string): Promise<SiteAdapter<RawProductData>> {
    if (this.adapterFactory) {
      return this.adapterFactory.createAdapter(siteUrl, recipe);
    }
    try {
      // Try to create adapter using the recipe manager (backward-compat path)
      const adapter = await this.recipeManager.createAdapter(siteUrl, recipe);
      this.logger.info(`Created adapter for ${siteUrl} using recipe: ${recipe}`);
      return adapter;
    } catch (error) {
      this.logger.warn(
        `Failed to create adapter with recipe '${recipe}', trying auto-detection: ${error}`,
      );
      const adapter = await this.recipeManager.createAdapter(siteUrl);
      this.logger.info(`Created adapter for ${siteUrl} using auto-detected recipe`);
      return adapter;
    }
  }

  /**
   * Get job status
   * @param jobId - The job identifier
   */
  async getJobStatus(jobId: string): Promise<ApiResponse<ScrapingJob<ProductOptions>>> {
    try {
      const job = this.activeJobs.get(jobId);
      if (!job) {
        return this.createErrorResponse<ScrapingJob<ProductOptions>, string>('Job not found');
      }

      return this.createSuccessResponse(job);
    } catch (error) {
      return this.createErrorResponse<ScrapingJob<ProductOptions>, string>(`Failed to get job status: ${error}`);
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<ApiResponse<ScrapingJob<ProductOptions>[]>> {
    try {
      const jobs = Array.from(this.activeJobs.values());
      return this.createSuccessResponse(jobs);
    } catch (error) {
      return this.createErrorResponse<ScrapingJob<ProductOptions>[], string>(`Failed to get jobs: ${error}`);
    }
  }

  /**
   * List all available recipes
   */
  async listRecipes(): Promise<ApiResponse<string[]>> {
    try {
      const recipes = await this.recipeManager.listRecipes();
      return this.createSuccessResponse(recipes);
    } catch (error) {
      return this.createErrorResponse<string[], string>(`Failed to list recipes: ${error}`);
    }
  }

  /**
   * Get recipe configuration by name
   * @param recipeName - Name of the recipe
   */
  async getRecipe(recipeName: string): Promise<ApiResponse<RecipeConfig>> {
    try {
      const recipe = await this.recipeManager.getRecipe(recipeName);
      return this.createSuccessResponse(recipe);
    } catch (error) {
      return this.createErrorResponse(`Failed to get recipe: ${error}`);
    }
  }

  /**
   * Get recipe configuration by site URL
   * @param siteUrl - Site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<ApiResponse<RecipeConfig>> {
    try {
      const recipe = await this.recipeManager.getRecipeBySiteUrl(siteUrl);
      if (recipe) {
        return this.createSuccessResponse(recipe);
      } else {
        return this.createErrorResponse('No recipe found for this site');
      }
    } catch (error) {
      return this.createErrorResponse(`Failed to get recipe for site: ${error}`);
    }
  }

  /**
   * Cancel a job
   * @param jobId - The job identifier
   */
  async cancelJob(jobId: string): Promise<ApiResponse<{ cancelled: boolean }>> {
    try {
      const job = this.activeJobs.get(jobId);
      if (!job) {
        return this.createErrorResponse<{ cancelled: boolean }, string>('Job not found');
      }

      if (job.status === 'completed' || job.status === 'failed') {
        return this.createErrorResponse<{ cancelled: boolean }, string>('Cannot cancel completed or failed job');
      }

      // Remove from queue if pending
      if (this.jobQueueService) {
        this.jobQueueService.cancel(jobId);
      } else {
        const queueIndex = this.jobQueue.findIndex((j) => j.id === jobId);
        if (queueIndex !== -1) {
          this.jobQueue.splice(queueIndex, 1);
        }
      }

      // Mark as cancelled
      if (this.jobLifecycleService) {
        this.jobLifecycleService.cancel(jobId);
      } else {
        job.status = 'failed';
        job.completedAt = new Date();
        const scrapingError = ErrorFactory.createScrapingError(
          'Job cancelled by user',
          ErrorCodes.UNKNOWN_ERROR,
          false,
        );
        job.errors.push(scrapingError);
      }

      return this.createSuccessResponse({ cancelled: true }, 'Job cancelled successfully');
    } catch (error) {
      return this.createErrorResponse<{ cancelled: boolean }, string>(`Failed to cancel job: ${error}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    try {
      const stats = await this.storage.getStorageStats();
      return this.createSuccessResponse(stats);
    } catch (error) {
      return this.createErrorResponse(`Failed to get storage stats: ${error}`);
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    try {
      const metrics = {
        totalJobs: this.performanceMetrics.totalJobs,
        activeJobs: this.activeJobs.size,
        completedJobs: this.performanceMetrics.successfulProducts,
        failedJobs: this.performanceMetrics.failedProducts,
        averageProcessingTime: this.performanceMetrics.averageProcessingTime,
        averageTimePerProduct: this.performanceMetrics.averageTimePerProduct,
        totalProcessingTime: this.performanceMetrics.totalProcessingTime,
        averageProductsPerJob: this.performanceMetrics.totalProducts / Math.max(this.activeJobs.size + (this.jobQueueService ? this.jobQueueService.length : this.jobQueue.length), 1),
        totalProductsProcessed: this.performanceMetrics.totalProducts,
        totalProducts: this.performanceMetrics.totalProducts,
        queuedJobs: this.jobQueueService ? this.jobQueueService.length : this.jobQueue.length,
        isProcessing: this.isProcessing,
        // Backward/compat aliases used by some tests
        currentActiveJobs: this.activeJobs.size,
        queueLength: this.jobQueueService ? this.jobQueueService.length : this.jobQueue.length,
      };

      return makePerformanceResponse(metrics, randomUUID());
    } catch (error) {
      return this.createErrorResponse(`Failed to get performance metrics: ${error}`);
    }
  }

  /**
   * Get live performance metrics with real-time data
   */
  async getLivePerformanceMetrics(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    try {
      const now = Date.now();
      const activeJobStats = Array.from(this.activeJobs.values()).map((job) => ({
        id: job.id,
        status: job.status,
        progress: job.processedProducts / Math.max(job.totalProducts, 1),
        duration: job.startedAt ? now - job.startedAt.getTime() : 0,
        productsPerSecond:
          job.startedAt && job.processedProducts > 0
            ? (job.processedProducts / ((now - job.startedAt.getTime()) / 1000)).toFixed(2)
            : 0,
      }));

      return this.createSuccessResponse({
        timestamp: now,
        activeJobs: activeJobStats,
        queueLength: this.jobQueueService ? this.jobQueueService.length : this.jobQueue.length,
        isProcessing: this.isProcessing,
        systemLoad: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          uptime: process.uptime(),
        },
      });
    } catch (error) {
      return this.createErrorResponse(`Failed to get live performance metrics: ${error}`);
    }
  }

  /**
  * Get performance recommendations based on current metrics
  */
  async getPerformanceRecommendations(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    try {
      const recommendations = [];

      // Analyze current performance and provide recommendations
      if (this.performanceMetrics.averageTimePerProduct > 5000) {
        recommendations.push({
          type: 'performance',
          priority: 'high',
          message:
            'Average processing time per product is high (>5s). Consider enabling fast mode or reducing concurrent workers.',
          suggestion: 'Set fastMode: true in recipe behavior or reduce maxConcurrent to 5-8',
        });
      }

      if (this.activeJobs.size > 3) {
        recommendations.push({
          type: 'concurrency',
          priority: 'medium',
          message: 'High number of active jobs may impact performance.',
          suggestion: 'Consider reducing maxConcurrent in recipe behavior',
        });
      }

      if (this.performanceMetrics.totalJobs > 0) {
        const avgJobTime =
          this.performanceMetrics.totalProcessingTime / this.performanceMetrics.totalJobs;
        if (avgJobTime > 300000) {
          // 5 minutes
          recommendations.push({
            type: 'optimization',
            priority: 'high',
            message: 'Average job completion time is high (>5min).',
            suggestion:
              'Review rateLimit settings and consider using HTTP client instead of Puppeteer for simple sites',
          });
        }
      }

      return this.createSuccessResponse({
        recommendations,
        currentSettings: {
          defaultMaxConcurrent: 10,
          defaultRateLimit: 50,
          fastModeAvailable: true,
        },
      });
    } catch (error) {
      return this.createErrorResponse(`Failed to get performance recommendations: ${error}`);
    }
  }

  /**
   * Clean up resources (including Puppeteer browsers)
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up ScrapingService resources...');

    // Cancel all active jobs
    for (const [jobId, job] of this.activeJobs) {
      if (job.status === 'running') {
        try {
          await this.cancelJob(jobId);
        } catch (error) {
          this.logger.warn(`Failed to cancel job ${jobId} during cleanup:`, error);
        }
      }
    }

    // Clear queues
    this.jobQueue = [];
    this.activeJobs.clear();

    this.logger.info('ScrapingService cleanup completed');
  }

  /**
   * Utility function to add delay
   * @param ms - Milliseconds to wait
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
