/**
 * Metrics collection and aggregation utilities
 */

export interface Metrics {
  totalProducts: number;
  successfulProducts: number;
  failedProducts: number;
  averageProcessingTime: number;
  totalProcessingTime: number;
  startTime: number;
  endTime?: number;
  errors: string[];
  // Legacy properties for backward compatibility
  totalJobs: number;
  averageTimePerProduct: number;
}

export interface BatchMetrics {
  processed: number;
  successful: number;
  failed: number;
  processingTime: number;
  errors: string[];
}

export interface Timer {
  start(): void;
  end(): number;
  getElapsed(): number;
}

/**
 * Create a timer instance
 * @returns Timer object with start, end, and getElapsed methods
 */
export function timer(): Timer {
  let startTime: number | null = null;
  let endTime: number | null = null;

  return {
    start(): void {
      startTime = Date.now();
      endTime = null;
    },

    end(): number {
      if (startTime === null) {
        throw new Error('Timer not started');
      }
      endTime = Date.now();
      return endTime - startTime;
    },

    getElapsed(): number {
      if (startTime === null) {
        return 0;
      }
      const currentTime = endTime || Date.now();
      return currentTime - startTime;
    },
  };
}

/**
 * Aggregate metrics from multiple batches
 * @param previous Previous aggregated metrics
 * @param batch New batch metrics to aggregate
 * @returns Updated aggregated metrics
 */
export function aggregateMetrics(previous: Metrics, batch: BatchMetrics): Metrics {
  const newTotal = previous.totalProducts + batch.processed;
  const newSuccessful = previous.successfulProducts + batch.successful;
  const newFailed = previous.failedProducts + batch.failed;
  const newTotalTime = previous.totalProcessingTime + batch.processingTime;
  const newErrors = [...previous.errors, ...batch.errors];

  return {
    totalProducts: newTotal,
    successfulProducts: newSuccessful,
    failedProducts: newFailed,
    averageProcessingTime: newTotal > 0 ? newTotalTime / newTotal : 0,
    totalProcessingTime: newTotalTime,
    startTime: previous.startTime,
    endTime: Date.now(),
    errors: newErrors,
    // Legacy properties for backward compatibility
    totalJobs: previous.totalJobs + 1, // Increment job count
    averageTimePerProduct: newTotal > 0 ? newTotalTime / newTotal : 0,
  };
}

/**
 * Create initial metrics
 * @returns Initial metrics object
 */
export function createInitialMetrics(): Metrics {
  return {
    totalProducts: 0,
    successfulProducts: 0,
    failedProducts: 0,
    averageProcessingTime: 0,
    totalProcessingTime: 0,
    startTime: Date.now(),
    errors: [],
    // Legacy properties for backward compatibility
    totalJobs: 0,
    averageTimePerProduct: 0,
  };
}

/**
 * Calculate processing rate (products per second)
 * @param metrics Metrics object
 * @returns Processing rate in products per second
 */
export function calculateProcessingRate(metrics: Metrics): number {
  if (metrics.endTime === undefined) {
    return 0;
  }

  const totalTimeSeconds = (metrics.endTime - metrics.startTime) / 1000;
  return totalTimeSeconds > 0 ? metrics.totalProducts / totalTimeSeconds : 0;
}

/**
 * Calculate success rate (percentage)
 * @param metrics Metrics object
 * @returns Success rate as percentage (0-100)
 */
export function calculateSuccessRate(metrics: Metrics): number {
  if (metrics.totalProducts === 0) {
    return 0;
  }

  return (metrics.successfulProducts / metrics.totalProducts) * 100;
}

/**
 * Format metrics for display
 * @param metrics Metrics object
 * @returns Formatted string representation
 */
export function formatMetrics(metrics: Metrics): string {
  const successRate = calculateSuccessRate(metrics);
  const processingRate = calculateProcessingRate(metrics);

  return [
    `Total: ${metrics.totalProducts} products`,
    `Successful: ${metrics.successfulProducts} (${successRate.toFixed(1)}%)`,
    `Failed: ${metrics.failedProducts}`,
    `Avg Time: ${metrics.averageProcessingTime.toFixed(2)}ms/product`,
    `Rate: ${processingRate.toFixed(2)} products/sec`,
    `Total Time: ${metrics.totalProcessingTime}ms`,
  ].join(', ');
}

/**
 * Create batch metrics from processing results
 * @param processed Number of items processed
 * @param successful Number of successful items
 * @param failed Number of failed items
 * @param processingTime Total processing time in milliseconds
 * @param errors Array of error messages
 * @returns Batch metrics object
 */
export function createBatchMetrics(
  processed: number,
  successful: number,
  failed: number,
  processingTime: number,
  errors: string[] = [],
): BatchMetrics {
  return {
    processed,
    successful,
    failed,
    processingTime,
    errors,
  };
}
