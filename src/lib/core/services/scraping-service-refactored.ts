import {
  ScrapingJob,
  ScrapingRequest,
  ApiResponse,
  ProductOptions,
  GenericMetadata,
  RecipeConfig,
} from '../../domain/types';
import { CsvGenerator } from './csv-generator';
import { IStorageService } from '../../infrastructure/storage/IStorageService';
import { RecipeManager } from './recipe-manager';
import pino from 'pino';
import { AdapterFactory } from './adapter-factory';
import { JobQueueService } from './job-queue-service';
import { JobLifecycleService } from './job-lifecycle-service';
import { ScrapingOrchestrator } from './scraping-orchestrator';

/**
 * Refactored ScrapingService that acts as a facade over the ScrapingOrchestrator.
 *
 * This service maintains backward compatibility while delegating to the new
 * modular architecture. It provides the same public API as the original
 * ScrapingService but uses the extracted components internally.
 *
 * @see {@link ../../../woocommerce_csv_spec.md WooCommerce CSV Import Specification}
 * @see {@link ../adapters/README.md Site Adapters}
 * @see {@link ../normalization/normalization.ts Normalization Toolkit}
 */
export class ScrapingService {
  private orchestrator: ScrapingOrchestrator;

  constructor(
    storage?: IStorageService,
    recipeManager?: RecipeManager,
    csvGenerator?: CsvGenerator,
    logger?: pino.Logger,
    adapterFactory?: AdapterFactory,
    jobQueueService?: JobQueueService,
    jobLifecycleService?: JobLifecycleService,
  ) {
    this.orchestrator = new ScrapingOrchestrator(
      storage,
      recipeManager,
      csvGenerator,
      logger,
      adapterFactory,
      jobQueueService,
      jobLifecycleService,
    );
  }

  /**
   * Domain-first Result-returning variants for controllers
   * These avoid HTTP-specific ApiResponse wrappers.
   */
  async startScrapingResult(request: ScrapingRequest<ProductOptions>): Promise<Result<{ jobId: string }>> {
    return this.orchestrator.startScrapingResult(request);
  }

  async getJobStatusResult(jobId: string): Promise<Result<{ status: string; processedProducts?: number; totalProducts?: number; errors?: Array<{ message: string }> }>> {
    return this.orchestrator.getJobStatusResult(jobId);
  }

  async getAllJobsResult(): Promise<Result<Array<{ id: string; status: string }>>> {
    return this.orchestrator.getAllJobsResult();
  }

  async getPerformanceMetricsResult(): Promise<Result<any>> {
    return this.orchestrator.getPerformanceMetricsResult();
  }

  async getLivePerformanceMetricsResult(): Promise<Result<unknown>> {
    return this.orchestrator.getLivePerformanceMetricsResult();
  }

  async getPerformanceRecommendationsResult(): Promise<Result<unknown>> {
    return this.orchestrator.getPerformanceRecommendationsResult();
  }

  async cancelJobResult(jobId: string): Promise<Result<{ cancelled: boolean }>> {
    return this.orchestrator.cancelJobResult(jobId);
  }

  async getStorageStatsResult(): Promise<Result<unknown>> {
    return this.orchestrator.getStorageStatsResult();
  }

  /**
   * Start a new scraping job.
   */
  async startScraping(request: ScrapingRequest<ProductOptions>): Promise<ApiResponse<{ jobId: string }>> {
    return this.orchestrator.startScraping(request);
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<ApiResponse<ScrapingJob<ProductOptions>>> {
    return this.orchestrator.getJobStatus(jobId);
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<ApiResponse<ScrapingJob<ProductOptions>[]>> {
    return this.orchestrator.getAllJobs();
  }

  /**
   * List available recipes
   */
  async listRecipes(): Promise<ApiResponse<string[]>> {
    return this.orchestrator.listRecipes();
  }

  /**
   * Get recipe by name
   */
  async getRecipe(recipeName: string): Promise<ApiResponse<RecipeConfig>> {
    return this.orchestrator.getRecipe(recipeName);
  }

  /**
   * Get recipe by site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<ApiResponse<RecipeConfig>> {
    return this.orchestrator.getRecipeBySiteUrl(siteUrl);
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<ApiResponse<{ cancelled: boolean }>> {
    return this.orchestrator.cancelJob(jobId);
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    return this.orchestrator.getStorageStats();
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    return this.orchestrator.getPerformanceMetrics();
  }

  /**
   * Get live performance metrics
   */
  async getLivePerformanceMetrics(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    return this.orchestrator.getLivePerformanceMetrics();
  }

  /**
   * Get performance recommendations
   */
  async getPerformanceRecommendations(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    return this.orchestrator.getPerformanceRecommendations();
  }
}
