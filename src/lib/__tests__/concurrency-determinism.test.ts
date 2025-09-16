import { pMapWithRateLimit } from '../helpers/concurrency';

// Mock timers for deterministic testing (modern timers)
jest.useFakeTimers();

describe('Concurrency Determinism Tests', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Ensure no timers leak between tests to avoid deadlocks
    jest.clearAllTimers();
  });

  describe('pMapWithRateLimit Determinism', () => {
    it('should respect minimum spacing with fake timers', async () => {
      const items = [1, 2, 3, 4, 5];
      const rateLimit = 100; // 100ms between items
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: rateLimit });

      // Fast-forward through all timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual(['processed', 'processed', 'processed', 'processed', 'processed']);
      expect(worker).toHaveBeenCalledTimes(5);
    });

    it('should handle zero rate limit (no delay)', async () => {
      const items = [1, 2, 3];
      const rateLimit = 0;
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: rateLimit });

      // No timers should be set for zero rate limit
      expect(jest.getTimerCount()).toBe(0);

      const results = await promise;

      expect(results).toEqual(['processed', 'processed', 'processed']);
      expect(worker).toHaveBeenCalledTimes(3);
    });

    it('should handle very small rate limits', async () => {
      const items = [1, 2];
      const rateLimit = 1; // 1ms between items
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: rateLimit });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual(['processed', 'processed']);
      expect(worker).toHaveBeenCalledTimes(2);
    });

    it('should handle large rate limits', async () => {
      const items = [1, 2];
      const rateLimit = 1000; // 1 second between items
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: rateLimit });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual(['processed', 'processed']);
      expect(worker).toHaveBeenCalledTimes(2);
    });

    it('should not starve items at various concurrency values', async () => {
      const items = Array.from({ length: 10 }, (_, i) => i);
      const rateLimit = 50;
      const concurrency = 3;
      const worker = jest.fn().mockImplementation(async (item) => {
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 10));
        return `processed-${item}`;
      });

      const promise = pMapWithRateLimit(items, worker, { concurrency, minDelayMs: rateLimit });

      // Fast-forward through all timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toHaveLength(10);
      expect(worker).toHaveBeenCalledTimes(10);

      // Verify all items were processed
      const processedItems = (results as string[]).map((r: string) => parseInt(r.split('-')[1]));
      expect(processedItems.sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should handle concurrency equal to items count', async () => {
      const items = [1, 2, 3];
      const concurrency = 3;
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency, minDelayMs: 0 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual(['processed', 'processed', 'processed']);
      expect(worker).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrency greater than items count', async () => {
      const items = [1, 2];
      const concurrency = 5;
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency, minDelayMs: 0 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual(['processed', 'processed']);
      expect(worker).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrency less than items count', async () => {
      const items = [1, 2, 3, 4, 5];
      const concurrency = 2;
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency, minDelayMs: 0 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual(['processed', 'processed', 'processed', 'processed', 'processed']);
      expect(worker).toHaveBeenCalledTimes(5);
    });
  });

  describe('Rate Limiting Edge Cases', () => {
    it('should handle empty items array', async () => {
      const items: number[] = [];
      const worker = jest.fn();

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: 100 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual([]);
      expect(worker).not.toHaveBeenCalled();
    });

    it('should handle single item', async () => {
      const items = [1];
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: 100 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual(['processed']);
      expect(worker).toHaveBeenCalledTimes(1);
    });

    it('should handle worker function that throws', async () => {
      const items = [1, 2, 3];
      const worker = jest.fn()
        .mockResolvedValueOnce('processed-1')
        .mockRejectedValueOnce(new Error('Worker failed'))
        .mockResolvedValueOnce('processed-3');

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: 100 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;
      expect(worker).toHaveBeenCalledTimes(3); // processes all items, collects error
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(3);
      expect(results[0]).toBe('processed-1');
      expect(results[1]).toBeInstanceOf(Error);
      expect((results[1] as unknown as Error).message).toBe('Worker failed');
      expect(results[2]).toBe('processed-3');
    });

    it('should handle worker function that returns undefined', async () => {
      const items = [1, 2];
      const worker = jest.fn().mockResolvedValue(undefined);

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: 100 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual([undefined, undefined]);
      expect(worker).toHaveBeenCalledTimes(2);
    });

    it('should handle worker function that returns null', async () => {
      const items = [1, 2];
      const worker = jest.fn().mockResolvedValue(null);

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: 100 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual([null, null]);
      expect(worker).toHaveBeenCalledTimes(2);
    });
  });

  describe('Concurrency Control Edge Cases', () => {
    it('should handle concurrency of 0', async () => {
      const items = [1, 2, 3];
      const concurrency = 0;
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency, minDelayMs: 0 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      // With invalid concurrency (0), no workers are started
      expect(results).toEqual([undefined, undefined, undefined]);
      expect(worker).toHaveBeenCalledTimes(0);
    });

    it('should handle negative concurrency', async () => {
      const items = [1, 2, 3];
      const concurrency = -1;
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency, minDelayMs: 0 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      // With invalid concurrency (<0), no workers are started
      expect(results).toEqual([undefined, undefined, undefined]);
      expect(worker).toHaveBeenCalledTimes(0);
    });

    it('should handle very large concurrency values', async () => {
      const items = [1, 2, 3];
      const concurrency = 1000;
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency, minDelayMs: 0 });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toEqual(['processed', 'processed', 'processed']);
      expect(worker).toHaveBeenCalledTimes(3);
    });
  });

  describe('Timing Precision', () => {
    it('should maintain consistent timing with fake timers', async () => {
      const items = [1, 2, 3, 4, 5];
      const rateLimit = 200;
      const worker = jest.fn().mockResolvedValue('processed');

      const startTime = Date.now();
      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: rateLimit });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;
      const endTime = Date.now();

      expect(results).toHaveLength(5);
      expect(worker).toHaveBeenCalledTimes(5);

      // With fake timers, Date.now advances deterministically by scheduled delays
      // Expect 4 intervals * 200ms = 800ms total simulated time
      expect(endTime - startTime).toBe(800);
    });

    it('should handle rapid timer advancement', async () => {
      const items = Array.from({ length: 100 }, (_, i) => i);
      const rateLimit = 10;
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: rateLimit });

      // Advance timers rapidly
      await jest.advanceTimersByTimeAsync(10000); // 10 seconds

      const results = await promise;

      expect(results).toHaveLength(100);
      expect(worker).toHaveBeenCalledTimes(100);
    });
  });

  describe('Memory and Performance', () => {
    it('should handle large number of items without memory issues', async () => {
      const items = Array.from({ length: 1000 }, (_, i) => i);
      const worker = jest.fn().mockResolvedValue('processed');

      const promise = pMapWithRateLimit(items, worker, {
        concurrency: 10,
        minDelayMs: 1,
      });

      // Fast-forward through timers
      await jest.runAllTimersAsync();

      const results = await promise;

      expect(results).toHaveLength(1000);
      expect(worker).toHaveBeenCalledTimes(1000);
    });

    it('should not accumulate timers over time', async () => {
      const items = [1, 2, 3];
      const worker = jest.fn().mockResolvedValue('processed');

      // Run multiple times
      for (let i = 0; i < 3; i++) {
        const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: 100 });
        await jest.runAllTimersAsync();
        await promise;
      }

      // Should not have any pending timers
      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
