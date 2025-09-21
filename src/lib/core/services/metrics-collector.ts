import { Metrics, BatchMetrics, createInitialMetrics, aggregateMetrics, createBatchMetrics, formatMetrics } from '../../helpers/metrics';
import { makePerformanceResponse } from '../../helpers/api';
import pino from 'pino';

/**
 * Interface for metrics collection operations
 */
export interface IMetricsCollector {
  getMetrics(): Metrics;
  updateMetrics(batchMetrics: BatchMetrics): void;
  recordJobMetrics(productsProcessed: number, productsSuccessful: number, productsFailed: number, duration: number, errors: string[]): void;
  getFormattedMetrics(): string;
  getPerformanceResponse(): any;
  getLiveMetrics(): any;
  getRecommendations(): any;
  logMetrics(): void;
}

/**
 * Metrics collection service that handles performance monitoring and metrics aggregation
 */
export class MetricsCollector implements IMetricsCollector {
  private performanceMetrics: Metrics = createInitialMetrics();
  private logger: pino.Logger;

  constructor(logger: pino.Logger) {
    this.logger = logger;
  }

  /**
   * Get current metrics
   */
  getMetrics(): Metrics {
    return this.performanceMetrics;
  }

  /**
   * Update metrics with new batch data
   */
  updateMetrics(batchMetrics: BatchMetrics): void {
    this.performanceMetrics = aggregateMetrics(this.performanceMetrics, batchMetrics);
  }

  /**
   * Record metrics for a completed job
   */
  recordJobMetrics(
    productsProcessed: number,
    productsSuccessful: number,
    productsFailed: number,
    duration: number,
    errors: string[],
  ): void {
    const batchMetrics = createBatchMetrics(
      productsProcessed,
      productsSuccessful,
      productsFailed,
      duration,
      errors,
    );

    this.performanceMetrics = aggregateMetrics(this.performanceMetrics, batchMetrics);
  }

  /**
   * Get formatted metrics string
   */
  getFormattedMetrics(): string {
    return formatMetrics(this.performanceMetrics);
  }

  /**
   * Get performance response for API
   */
  getPerformanceResponse(): any {
    // Convert Metrics to the format expected by makePerformanceResponse
    const responseMetrics = {
      totalJobs: this.performanceMetrics.totalJobs,
      activeJobs: 0, // Not tracked in current Metrics
      completedJobs: this.performanceMetrics.totalJobs,
      failedJobs: 0, // Not tracked in current Metrics
      averageProcessingTime: this.performanceMetrics.averageProcessingTime,
      totalProcessingTime: this.performanceMetrics.totalProcessingTime,
      averageProductsPerJob: this.performanceMetrics.totalProducts / Math.max(this.performanceMetrics.totalJobs, 1),
      totalProductsProcessed: this.performanceMetrics.totalProducts,
    };
    return makePerformanceResponse(responseMetrics);
  }

  /**
   * Get live performance metrics
   */
  getLiveMetrics(): any {
    return {
      ...this.performanceMetrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): any {
    const metrics = this.performanceMetrics;
    const recommendations = [];

    // Check for high error rates
    if (metrics.totalProducts > 0) {
      const errorRate = (metrics.failedProducts / metrics.totalProducts) * 100;
      if (errorRate > 10) {
        recommendations.push({
          type: 'error_rate',
          severity: 'high',
          message: `High error rate detected: ${errorRate.toFixed(1)}%`,
          suggestion: 'Check recipe selectors and site structure changes',
        });
      }
    }

    // Check for slow processing
    if (metrics.totalProducts > 0) {
      const avgTimePerProduct = metrics.averageProcessingTime;
      if (avgTimePerProduct > 5000) {
        recommendations.push({
          type: 'performance',
          severity: 'medium',
          message: `Slow processing detected: ${avgTimePerProduct.toFixed(0)}ms per product`,
          suggestion: 'Consider reducing concurrency or optimizing selectors',
        });
      }
    }

    // Check for low success rate
    if (metrics.totalProducts > 0) {
      const successRate = (metrics.successfulProducts / metrics.totalProducts) * 100;
      if (successRate < 80) {
        recommendations.push({
          type: 'success_rate',
          severity: 'high',
          message: `Low success rate: ${successRate.toFixed(1)}%`,
          suggestion: 'Review recipe configuration and error handling',
        });
      }
    }

    return {
      recommendations,
      metrics: this.performanceMetrics,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.performanceMetrics = createInitialMetrics();
    this.logger.info('Metrics reset');
  }

  /**
   * Log current metrics
   */
  logMetrics(): void {
    this.logger.info(`Performance Metrics - ${this.getFormattedMetrics()}`);
  }
}
