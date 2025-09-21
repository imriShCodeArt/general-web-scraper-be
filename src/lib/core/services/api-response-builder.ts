import { randomUUID } from 'crypto';
import { ApiResponse, ScrapingJob, RecipeConfig, GenericMetadata, ProductOptions } from '../../domain/types';
import { Metrics } from '../../helpers/metrics';

/**
 * Interface for API response building operations
 */
export interface IApiResponseBuilder {
  createSuccessResponse<T>(data: T, message?: string): ApiResponse<T, string>;
  createErrorResponse<T, E>(error: E, message?: string): ApiResponse<T, string>;
  buildJobStatusResponse(job: ScrapingJob<ProductOptions>): ApiResponse<ScrapingJob<ProductOptions>>;
  buildAllJobsResponse(jobs: ScrapingJob<ProductOptions>[]): ApiResponse<ScrapingJob<ProductOptions>[]>;
  buildRecipesResponse(recipes: string[]): ApiResponse<string[]>;
  buildRecipeResponse(recipe: RecipeConfig): ApiResponse<RecipeConfig>;
  buildStorageStatsResponse(stats: GenericMetadata<unknown>): ApiResponse<GenericMetadata<unknown>>;
  buildPerformanceResponse(metrics: Metrics): ApiResponse<GenericMetadata<unknown>>;
  buildLiveMetricsResponse(metrics: any): ApiResponse<GenericMetadata<unknown>>;
  buildRecommendationsResponse(recommendations: any): ApiResponse<GenericMetadata<unknown>>;
  buildCancelJobResponse(cancelled: boolean): ApiResponse<{ cancelled: boolean }>;
  buildNotFoundResponse(resource: string): ApiResponse<never, string>;
  buildValidationErrorResponse(message: string): ApiResponse<never, string>;
  buildInternalErrorResponse(error: string): ApiResponse<never, string>;
}

/**
 * API response builder service that creates standardized API responses
 */
export class ApiResponseBuilder implements IApiResponseBuilder {
  /**
   * Create a success response
   */
  createSuccessResponse<T>(data: T, message?: string): ApiResponse<T, string> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date(),
      requestId: randomUUID(),
    } as unknown as ApiResponse<T, string>;
  }

  /**
   * Create an error response
   */
  createErrorResponse<T, E>(error: E, message?: string): ApiResponse<T, string> {
    return {
      success: false,
      error: String(error) as unknown as string,
      message,
      timestamp: new Date(),
      requestId: randomUUID(),
    } as unknown as ApiResponse<T, string>;
  }

  /**
   * Build job status response
   */
  buildJobStatusResponse(job: ScrapingJob<ProductOptions>): ApiResponse<ScrapingJob<ProductOptions>> {
    return this.createSuccessResponse(job, 'Job status retrieved successfully');
  }

  /**
   * Build all jobs response
   */
  buildAllJobsResponse(jobs: ScrapingJob<ProductOptions>[]): ApiResponse<ScrapingJob<ProductOptions>[]> {
    return this.createSuccessResponse(jobs, 'Jobs retrieved successfully');
  }

  /**
   * Build recipes list response
   */
  buildRecipesResponse(recipes: string[]): ApiResponse<string[]> {
    return this.createSuccessResponse(recipes, 'Recipes retrieved successfully');
  }

  /**
   * Build single recipe response
   */
  buildRecipeResponse(recipe: RecipeConfig): ApiResponse<RecipeConfig> {
    return this.createSuccessResponse(recipe, 'Recipe retrieved successfully');
  }

  /**
   * Build storage stats response
   */
  buildStorageStatsResponse(stats: GenericMetadata<unknown>): ApiResponse<GenericMetadata<unknown>> {
    return this.createSuccessResponse(stats, 'Storage statistics retrieved successfully');
  }

  /**
   * Build performance metrics response
   */
  buildPerformanceResponse(metrics: Metrics): ApiResponse<GenericMetadata<unknown>> {
    const response = {
      totalProducts: metrics.totalProducts,
      successfulProducts: metrics.successfulProducts,
      failedProducts: metrics.failedProducts,
      totalDuration: metrics.totalProcessingTime,
      averageDuration: metrics.averageProcessingTime,
      successRate: metrics.totalProducts > 0 ? (metrics.successfulProducts / metrics.totalProducts) * 100 : 0,
      errorRate: metrics.totalProducts > 0 ? (metrics.failedProducts / metrics.totalProducts) * 100 : 0,
      timestamp: new Date().toISOString(),
    };

    return this.createSuccessResponse(response, 'Performance metrics retrieved successfully');
  }

  /**
   * Build live metrics response
   */
  buildLiveMetricsResponse(metrics: any): ApiResponse<GenericMetadata<unknown>> {
    return this.createSuccessResponse(metrics, 'Live metrics retrieved successfully');
  }

  /**
   * Build recommendations response
   */
  buildRecommendationsResponse(recommendations: any): ApiResponse<GenericMetadata<unknown>> {
    return this.createSuccessResponse(recommendations, 'Performance recommendations retrieved successfully');
  }

  /**
   * Build cancel job response
   */
  buildCancelJobResponse(cancelled: boolean): ApiResponse<{ cancelled: boolean }> {
    return this.createSuccessResponse(
      { cancelled },
      cancelled ? 'Job cancelled successfully' : 'Job could not be cancelled',
    );
  }

  /**
   * Build not found response
   */
  buildNotFoundResponse(resource: string): ApiResponse<never, string> {
    return this.createErrorResponse<never, string>(`${resource} not found`);
  }

  /**
   * Build validation error response
   */
  buildValidationErrorResponse(message: string): ApiResponse<never, string> {
    return this.createErrorResponse<never, string>(message, message);
  }

  /**
   * Build internal error response
   */
  buildInternalErrorResponse(error: string): ApiResponse<never, string> {
    return this.createErrorResponse<never, string>(error, error);
  }
}
