/**
 * Retry and backoff utilities
 */

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  jitterRatio?: number; // 0..1, default 0.1 (10%)
}

/**
 * Compute exponential backoff delay with jitter.
 * attempt is 1-based.
 */
export function exponentialBackoff(
  attempt: number,
  baseDelayMs: number,
  jitterRatio: number = 0.1,
): number {
  const backoff = baseDelayMs * Math.pow(2, Math.max(0, attempt - 1));
  const jitter = Math.random() * jitterRatio * backoff;
  return backoff + jitter;
}

/**
 * Execute a function with retry and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy = { maxAttempts: 1, baseDelayMs: 1000, jitterRatio: 0.1 },
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === policy.maxAttempts) {
        break;
      }
      const delay = exponentialBackoff(attempt, policy.baseDelayMs, policy.jitterRatio);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError as Error;
}


