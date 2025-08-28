import { randomUUID } from 'crypto';
import { ScrapingJob, ScrapingRequest, NormalizedProduct, JobResult, ApiResponse } from '../types';
import { SiteAdapter } from '../types';
import { NormalizationToolkit } from './normalization';
import { CsvGenerator } from './csv-generator';
import { StorageService } from './storage';
import { RecipeManager } from './recipe-manager';
import { ErrorFactory, ErrorCodes } from './error-handler';
import pino from 'pino';

export class ScrapingService {
  private logger: pino.Logger;
  private storage: StorageService;
  private recipeManager: RecipeManager;
  private csvGenerator: CsvGenerator;
  private activeJobs = new Map<string, ScrapingJob>();
  private jobQueue: ScrapingJob[] = [];
  private isProcessing = false;
  private performanceMetrics = {
    totalJobs: 0,
    totalProducts: 0,
    averageTimePerProduct: 0,
    totalProcessingTime: 0,
  };

  /**
   * Helper method to create ApiResponse objects with required fields
   */
  private createApiResponse<T, E = string>(
    success: boolean,
    data?: T,
    error?: E,
    message?: string,
  ): ApiResponse<T, E> {
    return {
      success,
      data,
      error,
      message,
      timestamp: new Date(),
      requestId: randomUUID(),
    };
  }

  /**
   * Helper method to create success ApiResponse objects
   */
  private createSuccessResponse<T>(data: T, message?: string): ApiResponse<T, string> {
    return this.createApiResponse(true, data, '', message);
  }

  /**
   * Helper method to create error ApiResponse objects
   */
  private createErrorResponse<E>(error: E, message?: string): ApiResponse<any, E> {
    return this.createApiResponse(false, undefined, error, message);
  }

  constructor(
    storage?: StorageService,
    recipeManager?: RecipeManager,
    csvGenerator?: CsvGenerator,
    logger?: pino.Logger
  ) {
    this.logger = logger || pino({
      level: process.env.LOG_LEVEL || 'warn',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
    });

    this.storage = storage || new StorageService();
    this.recipeManager = recipeManager || new RecipeManager();
    this.csvGenerator = csvGenerator || new CsvGenerator();
  }

  /**
   * Normalize a raw product
   *
   * @param rawProduct - Raw product object from adapter
   * @param url - Optional product URL for context
   */
  private async normalizeProduct(rawProduct: any, url?: string): Promise<NormalizedProduct> {
    return NormalizationToolkit.normalizeProduct(rawProduct, url || '');
  }

  /**
   * Generate filename for CSV outputs
   *
   * @param siteUrl - The site URL being scraped
   * @param jobId - The job identifier
   */
  private generateFilename(siteUrl: string, jobId: string): string {
    const domain = new URL(siteUrl).hostname;
    return `${domain}-${jobId}.csv`;
  }

  /**
   * Start a new scraping job.
   *
   * @param request - Includes `siteUrl`, `recipe`, and optional `options`.
   * @returns ApiResponse containing the created `jobId`.
   */
  async startScraping(request: ScrapingRequest): Promise<ApiResponse<{ jobId: string }>> {
    try {
      // Validate request
      if (!request.siteUrl || !request.recipe) {
        return this.createErrorResponse('Missing required fields: siteUrl and recipe');
      }

      // Create job
      const jobId = randomUUID();
      const job: ScrapingJob = {
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

      // Add to queue
      this.jobQueue.push(job);
      this.activeJobs.set(jobId, job);

      this.logger.info(`Created scraping job ${jobId} for ${request.siteUrl}`);

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }

      return this.createSuccessResponse({ jobId }, 'Scraping job created successfully');
    } catch (error) {
      this.logger.error('Failed to start scraping job:', error);
      return this.createErrorResponse(`Failed to start scraping job: ${error}`);
    }
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.jobQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.jobQueue.length > 0) {
      const job = this.jobQueue.shift();
      if (job) {
        await this.processJob(job);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process a single job
   */
  private async processJob(job: ScrapingJob): Promise<void> {
    try {
      this.logger.info(`Starting job ${job.id} for ${job.metadata.siteUrl}`);

      job.status = 'running';
      job.startedAt = new Date();

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
        const options = (job.metadata as any).options || {};
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
        const products: NormalizedProduct[] = [];
        const maxConcurrent = Math.min(
          recipe.behavior?.maxConcurrent || 10, // Increased default from 5 to 10
          productUrls.length, // Don't exceed the number of products
        );
        const rateLimit = Math.max(recipe.behavior?.rateLimit || 50, 10); // Reduced default from 200ms to 50ms, minimum 10ms

        this.logger.info(
          `Processing ${productUrls.length} products with ${maxConcurrent} concurrent workers and ${rateLimit}ms rate limit`,
        );

        // Process products in optimized batches with connection pooling
        const batchSize = maxConcurrent;
        for (let i = 0; i < productUrls.length; i += batchSize) {
          const batch = productUrls.slice(i, i + batchSize);
          const batchStartTime = Date.now();

          // Process batch concurrently with better error handling
          const batchPromises = batch.map(async (url, batchIndex) => {
            if (!url) return null;

            const globalIndex = i + batchIndex;
            try {
              this.logger.debug(
                `Processing product ${globalIndex + 1}/${productUrls.length}: ${url}`,
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

              job.processedProducts = globalIndex + 1;
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
          });

          // Wait for batch to complete
          const batchResults = await Promise.all(batchPromises);
          const validProducts = batchResults.filter((p) => p !== null) as NormalizedProduct[];
          products.push(...validProducts);

          const batchTime = Date.now() - batchStartTime;
          this.logger.debug(
            `Batch completed in ${batchTime}ms, processed ${validProducts.length}/${batch.length} products successfully`,
          );

          // Fixed delay between batches to respect configured rateLimit
          if (i + batchSize < productUrls.length && rateLimit > 0) {
            this.logger.debug(`Waiting ${rateLimit}ms before next batch...`);
            await this.delay(rateLimit);
          }
        }

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
        job.status = 'completed';
        job.completedAt = new Date();
        // totalProducts should remain as the total discovered, not just successful ones
        job.processedProducts = products.length;

        // Update performance metrics
        const jobDuration = job.completedAt.getTime() - job.startedAt!.getTime();
        this.performanceMetrics.totalJobs++;
        this.performanceMetrics.totalProducts += products.length;
        this.performanceMetrics.totalProcessingTime += jobDuration;
        this.performanceMetrics.averageTimePerProduct =
          this.performanceMetrics.totalProducts > 0
            ? this.performanceMetrics.totalProcessingTime / this.performanceMetrics.totalProducts
            : 0;

        this.logger.info(
          `Job ${job.id} completed successfully. Processed ${products.length} products in ${jobDuration}ms.`,
        );
        this.logger.info(
          `Performance Metrics - Avg: ${this.performanceMetrics.averageTimePerProduct.toFixed(2)}ms/product, Total: ${this.performanceMetrics.totalProducts} products`,
        );
      } finally {
        // Clean up adapter resources (including Puppeteer)
        if (adapter && typeof adapter.cleanup === 'function') {
          await adapter.cleanup();
        }
      }
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);

      job.status = 'failed';
      job.completedAt = new Date();
      const scrapingError = ErrorFactory.createScrapingError(
        `Job failed: ${error}`,
        ErrorCodes.RECIPE_ERROR,
        false,
      );
      job.errors.push(scrapingError);

      // Clean up adapter resources even on failure
      try {
        const adapter = await this.createAdapter(job.metadata.recipe, job.metadata.siteUrl);
        if (adapter && typeof adapter.cleanup === 'function') {
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
  private async createAdapter(recipe: string, siteUrl: string): Promise<SiteAdapter> {
    try {
      // Try to create adapter using the recipe manager
      const adapter = await this.recipeManager.createAdapter(siteUrl, recipe);
      this.logger.info(`Created adapter for ${siteUrl} using recipe: ${recipe}`);
      return adapter;
    } catch (error) {
      this.logger.warn(
        `Failed to create adapter with recipe '${recipe}', trying auto-detection: ${error}`,
      );

      try {
        // Fallback to auto-detection
        const adapter = await this.recipeManager.createAdapter(siteUrl);
        this.logger.info(`Created adapter for ${siteUrl} using auto-detected recipe`);
        return adapter;
      } catch (fallbackError) {
        this.logger.error(`Failed to create adapter for ${siteUrl}: ${fallbackError}`);
        throw new Error(
          `No suitable recipe found for ${siteUrl}. Please provide a valid recipe name or ensure a recipe exists for this site.`,
        );
      }
    }
  }

  /**
   * Get job status
   * @param jobId - The job identifier
   */
  async getJobStatus(jobId: string): Promise<ApiResponse<ScrapingJob>> {
    try {
      const job = this.activeJobs.get(jobId);
      if (!job) {
        return this.createErrorResponse('Job not found');
      }

      return this.createSuccessResponse(job);
    } catch (error) {
      return this.createErrorResponse(`Failed to get job status: ${error}`);
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<ApiResponse<ScrapingJob[]>> {
    try {
      const jobs = Array.from(this.activeJobs.values());
      return this.createSuccessResponse(jobs);
    } catch (error) {
      return this.createErrorResponse(`Failed to get jobs: ${error}`);
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
      return this.createErrorResponse(`Failed to list recipes: ${error}`);
    }
  }

  /**
   * Get recipe configuration by name
   * @param recipeName - Name of the recipe
   */
  async getRecipe(recipeName: string): Promise<ApiResponse<any>> {
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
  async getRecipeBySiteUrl(siteUrl: string): Promise<ApiResponse<any>> {
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
        return this.createErrorResponse('Job not found');
      }

      if (job.status === 'completed' || job.status === 'failed') {
        return this.createErrorResponse('Cannot cancel completed or failed job');
      }

      // Remove from queue if pending
      const queueIndex = this.jobQueue.findIndex((j) => j.id === jobId);
      if (queueIndex !== -1) {
        this.jobQueue.splice(queueIndex, 1);
      }

      // Mark as cancelled
      job.status = 'failed';
      job.completedAt = new Date();
      const scrapingError = ErrorFactory.createScrapingError(
        'Job cancelled by user',
        ErrorCodes.UNKNOWN_ERROR,
        false,
      );
      job.errors.push(scrapingError);

      return this.createSuccessResponse({ cancelled: true }, 'Job cancelled successfully');
    } catch (error) {
      return this.createErrorResponse(`Failed to cancel job: ${error}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<ApiResponse<any>> {
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
  async getPerformanceMetrics(): Promise<ApiResponse<any>> {
    try {
      return this.createSuccessResponse({
        ...this.performanceMetrics,
        activeJobs: this.activeJobs.size,
        queuedJobs: this.jobQueue.length,
        isProcessing: this.isProcessing,
        // Backward/compat aliases used by some tests
        currentActiveJobs: this.activeJobs.size,
        queueLength: this.jobQueue.length,
      });
    } catch (error) {
      return this.createErrorResponse(`Failed to get performance metrics: ${error}`);
    }
  }

  /**
   * Get live performance metrics with real-time data
   */
  async getLivePerformanceMetrics(): Promise<ApiResponse<any>> {
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
        queueLength: this.jobQueue.length,
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
  async getPerformanceRecommendations(): Promise<ApiResponse<any>> {
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
