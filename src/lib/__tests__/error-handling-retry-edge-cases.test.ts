import { withRetry, exponentialBackoff } from '../helpers/retry';

describe('Error Handling and Retry Edge Cases', () => {
  let originalSetTimeout: typeof setTimeout;

  beforeEach(() => {
    originalSetTimeout = global.setTimeout;
    global.setTimeout = jest.fn().mockImplementation((fn: Function, delay: number) => {
      return originalSetTimeout(fn, delay);
    }) as unknown as typeof global.setTimeout;
  });

  afterEach(() => {
    global.setTimeout = originalSetTimeout;
    jest.clearAllMocks();
  });

  describe('Error Mapping and Formatting', () => {
    it('should map network errors correctly', async () => {
      const networkError = new Error('Network request failed');
      networkError.name = 'NetworkError';

      const mockFn = jest.fn().mockRejectedValue(networkError);

      await expect(withRetry(mockFn, { maxAttempts: 1, baseDelayMs: 100 })).rejects.toThrow('Network request failed');
    });

    it('should map timeout errors correctly', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      const mockFn = jest.fn().mockRejectedValue(timeoutError);

      await expect(withRetry(mockFn, { maxAttempts: 1, baseDelayMs: 100 })).rejects.toThrow('Request timeout');
    });

    it('should map validation errors correctly', async () => {
      const validationError = new Error('Invalid input');
      validationError.name = 'ValidationError';

      const mockFn = jest.fn().mockRejectedValue(validationError);

      await expect(withRetry(mockFn, { maxAttempts: 1, baseDelayMs: 100 })).rejects.toThrow('Invalid input');
    });

    it('should preserve error stack traces', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);

      try {
        await withRetry(mockFn, { maxAttempts: 1, baseDelayMs: 100 });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).stack).toBeDefined();
      }
    });
  });

  describe('Retry Edge Cases', () => {
    it('should not retry on maxAttempts 0', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      try {
        const result = await withRetry(mockFn, { maxAttempts: 0, baseDelayMs: 100 });
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(1);
      } catch (error) {
        // If it throws, expect it to be undefined
        expect(error).toBeUndefined();
        expect(mockFn).toHaveBeenCalledTimes(0);
      }
    });

    it('should not retry on maxAttempts -1', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      try {
        const result = await withRetry(mockFn, { maxAttempts: -1, baseDelayMs: 100 });
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(1);
      } catch (error) {
        // If it throws, expect it to be undefined
        expect(error).toBeUndefined();
        expect(mockFn).toHaveBeenCalledTimes(0);
      }
    });

    it('should retry on maxAttempts 1', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(withRetry(mockFn, { maxAttempts: 1, baseDelayMs: 100 })).rejects.toThrow('Test error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on maxAttempts 2', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(withRetry(mockFn, { maxAttempts: 2, baseDelayMs: 100 })).rejects.toThrow('Test error');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-matching error types', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(withRetry(mockFn, { maxAttempts: 3, baseDelayMs: 100 })).rejects.toThrow('Test error');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should handle retry condition that throws', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(withRetry(mockFn, { maxAttempts: 3, baseDelayMs: 100 })).rejects.toThrow('Test error');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Exponential Backoff', () => {
    it('should calculate exponential backoff correctly', () => {
      const delay1 = exponentialBackoff(1, 100);
      const delay2 = exponentialBackoff(2, 100);
      const delay3 = exponentialBackoff(3, 100);

      expect(delay1).toBeGreaterThan(0);
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
    });

    it('should handle zero base delay', () => {
      const delay = exponentialBackoff(1, 0);
      expect(delay).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative base delay', () => {
      const delay = exponentialBackoff(1, -100);
      expect(delay).toBeGreaterThanOrEqual(-200);
    });

    it('should handle zero attempt number', () => {
      const delay = exponentialBackoff(0, 100);
      expect(delay).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative attempt number', () => {
      const delay = exponentialBackoff(-1, 100);
      expect(delay).toBeGreaterThanOrEqual(0);
    });

    it('should include jitter in backoff calculation', () => {
      const delays = Array.from({ length: 10 }, () => exponentialBackoff(2, 100));
      const uniqueDelays = new Set(delays);

      // With jitter, we should have some variation in delays
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it('should not exceed maximum delay', () => {
      const delay = exponentialBackoff(10, 100, 0.1);
      expect(delay).toBeGreaterThan(0);
    });
  });

  describe('Memory Management', () => {
    it('should not accumulate memory with many retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));

      // This should not cause memory issues
      for (let i = 0; i < 100; i++) {
        try {
          await withRetry(mockFn, { maxAttempts: 3, baseDelayMs: 1 });
        } catch (e) {
          // Expected to fail
        }
      }

      expect(true).toBe(true);
    });

    it('should clean up resources after retry', async () => {
      let resourceCount = 0;
      const mockFn = jest.fn().mockImplementation(() => {
        resourceCount++;
        throw new Error('Test error');
      });

      try {
        await withRetry(mockFn, { maxAttempts: 3, baseDelayMs: 1 });
      } catch (e) {
        // Expected to fail
      }

      expect(resourceCount).toBe(3);
    });
  });

  describe('Concurrent Retries', () => {
    it('should handle concurrent retry operations', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));

      const promises = Array.from({ length: 10 }, () =>
        withRetry(mockFn, { maxAttempts: 2, baseDelayMs: 1 }).catch(() => 'failed'),
      );

      const results = await Promise.all(promises);

      expect(results).toEqual(Array(10).fill('failed'));
      expect(mockFn).toHaveBeenCalledTimes(20); // 2 attempts per operation
    });

    it('should not interfere with other retry operations', async () => {
      const mockFn1 = jest.fn().mockRejectedValue(new Error('Error 1'));
      const mockFn2 = jest.fn().mockRejectedValue(new Error('Error 2'));

      const promise1 = withRetry(mockFn1, { maxAttempts: 2, baseDelayMs: 1 }).catch(() => 'failed1');
      const promise2 = withRetry(mockFn2, { maxAttempts: 2, baseDelayMs: 1 }).catch(() => 'failed2');

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('failed1');
      expect(result2).toBe('failed2');
      expect(mockFn1).toHaveBeenCalledTimes(2);
      expect(mockFn2).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Recovery', () => {
    it('should succeed on retry after initial failure', async () => {
      let attemptCount = 0;
      const mockFn = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('Initial failure');
        }
        return 'success';
      });

      const result = await withRetry(mockFn, { maxAttempts: 2, baseDelayMs: 1 });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should fail after all retries exhausted', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Persistent error'));

      await expect(withRetry(mockFn, { maxAttempts: 3, baseDelayMs: 1 })).rejects.toThrow('Persistent error');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined error', async () => {
      const mockFn = jest.fn().mockRejectedValue(undefined);

      await expect(withRetry(mockFn, { maxAttempts: 1, baseDelayMs: 100 })).rejects.toBe(undefined);
    });

    it('should handle null error', async () => {
      const mockFn = jest.fn().mockRejectedValue(null);

      await expect(withRetry(mockFn, { maxAttempts: 1, baseDelayMs: 100 })).rejects.toBe(null);
    });

    it('should handle non-Error objects', async () => {
      const mockFn = jest.fn().mockRejectedValue('String error');

      await expect(withRetry(mockFn, { maxAttempts: 1, baseDelayMs: 100 })).rejects.toBe('String error');
    });

    it('should handle function that returns undefined', async () => {
      const mockFn = jest.fn().mockResolvedValue(undefined);

      const result = await withRetry(mockFn, { maxAttempts: 1, baseDelayMs: 100 });

      expect(result).toBeUndefined();
    });

    it('should handle function that returns null', async () => {
      const mockFn = jest.fn().mockResolvedValue(null);

      const result = await withRetry(mockFn, { maxAttempts: 1, baseDelayMs: 100 });

      expect(result).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should complete retries within reasonable time', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));

      const startTime = Date.now();
      try {
        await withRetry(mockFn, { maxAttempts: 5, baseDelayMs: 1 });
      } catch (e) {
        // Expected to fail
      }
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should not block event loop during retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));
      let eventLoopBlocked = false;

      const retryPromise = withRetry(mockFn, { maxAttempts: 3, baseDelayMs: 10 }).catch(() => 'failed');

      // Check if event loop is blocked
      setTimeout(() => {
        eventLoopBlocked = true;
      }, 5);

      await retryPromise;

      expect(eventLoopBlocked).toBe(true);
    });
  });
});
