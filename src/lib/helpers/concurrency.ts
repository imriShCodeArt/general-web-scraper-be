/**
 * Concurrency and rate limiting utilities
 */

export interface ConcurrencyOptions {
  concurrency: number;
  minDelayMs: number;
}

export interface RateLimitOptions {
  concurrency: number;
  minDelayMs: number;
}

/**
 * Process items with controlled concurrency and rate limiting
 * @param items Array of items to process
 * @param worker Function to process each item
 * @param options Concurrency and rate limiting options
 * @returns Promise that resolves to array of results
 */
export async function pMapWithRateLimit<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  options: ConcurrencyOptions,
): Promise<R[]> {
  const { concurrency, minDelayMs } = options;
  const results: R[] = new Array(items.length);
  let index = 0;
  let lastExecutionTime = 0;

  const executeNext = async (): Promise<void> => {
    while (index < items.length) {
      const currentIndex = index++;
      const item = items[currentIndex];

      // Apply rate limiting before starting the worker
      if (minDelayMs > 0) {
        const now = Date.now();
        const timeSinceLastExecution = now - lastExecutionTime;
        if (timeSinceLastExecution < minDelayMs) {
          const delay = minDelayMs - timeSinceLastExecution;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        lastExecutionTime = Date.now();
      }

      try {
        const result = await worker(item, currentIndex);
        results[currentIndex] = result;
      } catch (error) {
        // Store the error in the results array
        results[currentIndex] = error as R;
      }
    }
  };

  // Start workers up to concurrency limit
  const workers = [];
  for (let i = 0; i < Math.min(concurrency, items.length); i++) {
    workers.push(executeNext());
  }

  // Wait for all workers to complete
  await Promise.all(workers);

  return results;
}

/**
 * Process items with simple concurrency control (no rate limiting)
 * @param items Array of items to process
 * @param worker Function to process each item
 * @param concurrency Maximum number of concurrent operations
 * @returns Promise that resolves to array of results
 */
export async function pMap<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  return pMapWithRateLimit(items, worker, { concurrency, minDelayMs: 0 });
}

/**
 * Create a rate limiter that ensures minimum delay between operations
 * @param minDelayMs Minimum delay in milliseconds
 * @returns Function that can be used to rate limit operations
 */
export function createRateLimiter(minDelayMs: number) {
  let lastExecution = 0;

  return async (): Promise<void> => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecution;

    if (timeSinceLastExecution < minDelayMs) {
      const delay = minDelayMs - timeSinceLastExecution;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    lastExecution = Date.now();
  };
}

// Retry helpers moved to helpers/retry.ts in Phase 6
