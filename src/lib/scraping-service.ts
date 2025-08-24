import { randomUUID } from 'crypto';
import { 
  ScrapingJob, 
  ScrapingRequest, 
  NormalizedProduct, 
  JobResult,
  ApiResponse 
} from '../types';
import { SiteAdapter } from '../types';
import { NormalizationToolkit } from './normalization';
import { CsvGenerator } from './csv-generator';
import { StorageService } from './storage';
import { RecipeManager } from './recipe-manager';
import pino from 'pino';

export class ScrapingService {
  private logger: pino.Logger;
  private storage: StorageService;
  private recipeManager: RecipeManager;
  private activeJobs = new Map<string, ScrapingJob>();
  private jobQueue: ScrapingJob[] = [];
  private isProcessing = false;

  constructor() {
    this.logger = pino({
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
    });
    
    this.storage = new StorageService();
    this.recipeManager = new RecipeManager();
  }

  /**
   * Start a new scraping job
   */
  async startScraping(request: ScrapingRequest): Promise<ApiResponse<{ jobId: string }>> {
    try {
      // Validate request
      if (!request.siteUrl || !request.recipe) {
        return {
          success: false,
          error: 'Missing required fields: siteUrl and recipe',
        };
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

      return {
        success: true,
        data: { jobId },
        message: 'Scraping job created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to start scraping job:', error);
      return {
        success: false,
        error: `Failed to start scraping job: ${error}`,
      };
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
   * Process a single scraping job
   */
  private async processJob(job: ScrapingJob): Promise<void> {
    try {
      this.logger.info(`Starting job ${job.id}`);
      
      job.status = 'running';
      job.startedAt = new Date();

      // Create adapter based on recipe
      const adapter = await this.createAdapter(job.metadata.recipe, job.metadata.siteUrl);
      
      // Discover products
      const productUrls: string[] = [];
      for await (const url of adapter.discoverProducts()) {
        productUrls.push(url);
        if (job.metadata.categories.length > 0) {
          // Filter by categories if specified
          // This is a simple implementation - could be enhanced
          break;
        }
      }

      job.totalProducts = productUrls.length;
      this.logger.info(`Discovered ${productUrls.length} products for job ${job.id}`);

      // Extract and normalize products
      const normalizedProducts: NormalizedProduct[] = [];
      
      for (let i = 0; i < productUrls.length; i++) {
        try {
          const url = productUrls[i];
          if (!url) continue;
          
          this.logger.debug(`Processing product ${i + 1}/${productUrls.length}: ${url}`);
          
          const rawProduct = await adapter.extractProduct(url);
          const normalizedProduct = NormalizationToolkit.normalizeProduct(rawProduct, url);
          
          normalizedProducts.push(normalizedProduct);
          job.processedProducts = i + 1;
          
          // Add small delay to be respectful
          await this.delay(100);
        } catch (error) {
          const errorMsg = `Failed to process product ${productUrls[i]}: ${error}`;
          job.errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      // Generate CSVs
      this.logger.info(`Generating CSVs for job ${job.id}`);
      const csvResult = await CsvGenerator.generateBothCsvs(normalizedProducts);
      
      // Create job result
      const jobResult: JobResult = {
        jobId: job.id,
        parentCsv: csvResult.parentCsv,
        variationCsv: csvResult.variationCsv,
        productCount: csvResult.productCount,
        variationCount: csvResult.variationCount,
        filename: CsvGenerator.generateFilename(normalizedProducts, job.id),
      };

      // Store result
      await this.storage.storeJobResult(job.id, jobResult);

      // Mark job as completed
      job.status = 'completed';
      job.completedAt = new Date();

      this.logger.info(`Completed job ${job.id}: ${csvResult.productCount} products, ${csvResult.variationCount} variations`);

    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);
      
      job.status = 'failed';
      job.completedAt = new Date();
      job.errors.push(`Job failed: ${error}`);
    }
  }

  /**
   * Create adapter based on recipe
   */
  private async createAdapter(recipe: string, siteUrl: string): Promise<SiteAdapter> {
    try {
      // Try to create adapter using the recipe manager
      const adapter = await this.recipeManager.createAdapter(siteUrl, recipe);
      this.logger.info(`Created adapter for ${siteUrl} using recipe: ${recipe}`);
      return adapter;
    } catch (error) {
      this.logger.warn(`Failed to create adapter with recipe '${recipe}', trying auto-detection: ${error}`);
      
      try {
        // Fallback to auto-detection
        const adapter = await this.recipeManager.createAdapter(siteUrl);
        this.logger.info(`Created adapter for ${siteUrl} using auto-detected recipe`);
        return adapter;
      } catch (fallbackError) {
        this.logger.error(`Failed to create adapter for ${siteUrl}: ${fallbackError}`);
        throw new Error(`No suitable recipe found for ${siteUrl}. Please provide a valid recipe name or ensure a recipe exists for this site.`);
      }
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<ApiResponse<ScrapingJob>> {
    try {
      const job = this.activeJobs.get(jobId);
      if (!job) {
        return {
          success: false,
          error: 'Job not found',
        };
      }

      return {
        success: true,
        data: job,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get job status: ${error}`,
      };
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<ApiResponse<ScrapingJob[]>> {
    try {
      const jobs = Array.from(this.activeJobs.values());
      return {
        success: true,
        data: jobs,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get jobs: ${error}`,
      };
    }
  }

  /**
   * List all available recipes
   */
  async listRecipes(): Promise<ApiResponse<string[]>> {
    try {
      const recipes = await this.recipeManager.listRecipes();
      return {
        success: true,
        data: recipes,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to list recipes: ${error}`,
      };
    }
  }

  /**
   * Get recipe configuration by name
   */
  async getRecipe(recipeName: string): Promise<ApiResponse<any>> {
    try {
      const recipe = await this.recipeManager.getRecipe(recipeName);
      return {
        success: true,
        data: recipe,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get recipe: ${error}`,
      };
    }
  }

  /**
   * Get recipe configuration by site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<ApiResponse<any>> {
    try {
      const recipe = await this.recipeManager.getRecipeBySiteUrl(siteUrl);
      if (recipe) {
        return {
          success: true,
          data: recipe,
        };
      } else {
        return {
          success: false,
          error: 'No recipe found for this site',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get recipe for site: ${error}`,
      };
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<ApiResponse<{ cancelled: boolean }>> {
    try {
      const job = this.activeJobs.get(jobId);
      if (!job) {
        return {
          success: false,
          error: 'Job not found',
        };
      }

      if (job.status === 'completed' || job.status === 'failed') {
        return {
          success: false,
          error: 'Cannot cancel completed or failed job',
        };
      }

      // Remove from queue if pending
      const queueIndex = this.jobQueue.findIndex(j => j.id === jobId);
      if (queueIndex !== -1) {
        this.jobQueue.splice(queueIndex, 1);
      }

      // Mark as cancelled
      job.status = 'failed';
      job.completedAt = new Date();
      job.errors.push('Job cancelled by user');

      return {
        success: true,
        data: { cancelled: true },
        message: 'Job cancelled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to cancel job: ${error}`,
      };
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await this.storage.getStorageStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get storage stats: ${error}`,
      };
    }
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Generic adapter for demonstration
class GenericAdapter implements SiteAdapter {
  constructor(
    private config: any,
    private baseUrl: string
  ) {}

  getConfig(): any {
    return this.config;
  }

  async *discoverProducts(): AsyncIterable<string> {
    // This is a placeholder implementation
    // Real adapters would implement proper product discovery
    yield `${this.baseUrl}/product/1`;
    yield `${this.baseUrl}/product/2`;
  }

  async extractProduct(url: string): Promise<any> {
    // This is a placeholder implementation
    // Real adapters would implement proper product extraction
    return {
      title: 'Sample Product',
      sku: 'SAMPLE-001',
      description: 'Sample product description',
      price: '99.99',
      stockStatus: 'instock',
    };
  }
}
