import { pMapWithRateLimit, pMap, createRateLimiter, ConcurrencyOptions } from '../helpers/concurrency';

describe('helpers/concurrency', () => {
  describe('pMapWithRateLimit', () => {
    it('should process items with controlled concurrency', async () => {
      const items = [1, 2, 3, 4, 5];
      const worker = async (item: number) => item * 2;
      const options: ConcurrencyOptions = { concurrency: 2, minDelayMs: 0 };

      const results = await pMapWithRateLimit(items, worker, options);

      expect(results).toEqual([2, 4, 6, 8, 10]);
    });

    it('should respect concurrency limit', async () => {
      const items = [1, 2, 3, 4, 5];
      const executionOrder: number[] = [];
      const worker = async (item: number) => {
        executionOrder.push(item);
        await new Promise(resolve => setTimeout(resolve, 10));
        return item * 2;
      };
      const options: ConcurrencyOptions = { concurrency: 2, minDelayMs: 0 };

      await pMapWithRateLimit(items, worker, options);

      // Should not have more than 2 items executing at once
      expect(executionOrder.length).toBe(5);
    });

    it('should apply rate limiting', async () => {
      const items = [1, 2, 3];
      const startTimes: number[] = [];
      const worker = async (item: number) => {
        startTimes.push(Date.now());
        return item * 2;
      };
      const options: ConcurrencyOptions = { concurrency: 1, minDelayMs: 50 };

      const start = Date.now();
      await pMapWithRateLimit(items, worker, options);
      const totalTime = Date.now() - start;

      // Should take at least 100ms (50ms delay between each of 3 items)
      expect(totalTime).toBeGreaterThanOrEqual(100);
      expect(startTimes).toHaveLength(3);
    });

    it('should handle worker errors', async () => {
      const items = [1, 2, 3];
      const worker = async (item: number) => {
        if (item === 2) {
          throw new Error('Test error');
        }
        return item * 2;
      };
      const options: ConcurrencyOptions = { concurrency: 2, minDelayMs: 0 };

      const results = await pMapWithRateLimit(items, worker, options);

      expect(results[0]).toBe(2);
      expect(results[1]).toBeInstanceOf(Error);
      expect(results[2]).toBe(6);
    });

    it('should handle empty array', async () => {
      const items: number[] = [];
      const worker = async (item: number) => item * 2;
      const options: ConcurrencyOptions = { concurrency: 2, minDelayMs: 0 };

      const results = await pMapWithRateLimit(items, worker, options);

      expect(results).toEqual([]);
    });

    it('should handle single item', async () => {
      const items = [42];
      const worker = async (item: number) => item * 2;
      const options: ConcurrencyOptions = { concurrency: 2, minDelayMs: 0 };

      const results = await pMapWithRateLimit(items, worker, options);

      expect(results).toEqual([84]);
    });

    it('should pass correct index to worker', async () => {
      const items = ['a', 'b', 'c'];
      const indices: number[] = [];
      const worker = async (item: string, index: number) => {
        indices.push(index);
        return `${item}${index}`;
      };
      const options: ConcurrencyOptions = { concurrency: 2, minDelayMs: 0 };

      await pMapWithRateLimit(items, worker, options);

      expect(indices).toEqual([0, 1, 2]);
    });
  });

  describe('pMap', () => {
    it('should process items with simple concurrency control', async () => {
      const items = [1, 2, 3, 4, 5];
      const worker = async (item: number) => item * 2;

      const results = await pMap(items, worker, 2);

      expect(results).toEqual([2, 4, 6, 8, 10]);
    });

    it('should respect concurrency limit', async () => {
      const items = [1, 2, 3, 4, 5];
      const executionOrder: number[] = [];
      const worker = async (item: number) => {
        executionOrder.push(item);
        await new Promise(resolve => setTimeout(resolve, 10));
        return item * 2;
      };

      await pMap(items, worker, 2);

      expect(executionOrder.length).toBe(5);
    });

    it('should handle worker errors', async () => {
      const items = [1, 2, 3];
      const worker = async (item: number) => {
        if (item === 2) {
          throw new Error('Test error');
        }
        return item * 2;
      };

      const results = await pMap(items, worker, 2);

      expect(results[0]).toBe(2);
      expect(results[1]).toBeInstanceOf(Error);
      expect(results[2]).toBe(6);
    });
  });

  describe('createRateLimiter', () => {
    it('should create a rate limiter with minimum delay', async () => {
      const rateLimiter = createRateLimiter(50);
      const startTimes: number[] = [];

      const start = Date.now();
      await rateLimiter();
      startTimes.push(Date.now() - start);

      await rateLimiter();
      startTimes.push(Date.now() - start);

      await rateLimiter();
      startTimes.push(Date.now() - start);

      // First call should be immediate, subsequent calls should be delayed
      expect(startTimes[0]).toBeLessThan(10);
      expect(startTimes[1]).toBeGreaterThanOrEqual(45);
      expect(startTimes[2]).toBeGreaterThanOrEqual(95);
    });

    it('should handle zero delay', async () => {
      const rateLimiter = createRateLimiter(0);
      const start = Date.now();

      await rateLimiter();
      await rateLimiter();
      await rateLimiter();

      const totalTime = Date.now() - start;
      expect(totalTime).toBeLessThan(10);
    });

    it('should handle multiple rate limiters independently', async () => {
      const rateLimiter1 = createRateLimiter(50);
      const rateLimiter2 = createRateLimiter(100);
      const start = Date.now();

      await rateLimiter1();
      await rateLimiter2();
      await rateLimiter1();
      await rateLimiter2();

      const totalTime = Date.now() - start;
      // Should be limited by the slower rate limiter (100ms)
      expect(totalTime).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Edge cases', () => {
    it('should handle concurrency higher than items count', async () => {
      const items = [1, 2];
      const worker = async (item: number) => item * 2;
      const options: ConcurrencyOptions = { concurrency: 10, minDelayMs: 0 };

      const results = await pMapWithRateLimit(items, worker, options);

      expect(results).toEqual([2, 4]);
    });

    it('should handle concurrency of 1', async () => {
      const items = [1, 2, 3];
      const executionOrder: number[] = [];
      const worker = async (item: number) => {
        executionOrder.push(item);
        await new Promise(resolve => setTimeout(resolve, 10));
        return item * 2;
      };
      const options: ConcurrencyOptions = { concurrency: 1, minDelayMs: 0 };

      await pMapWithRateLimit(items, worker, options);

      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should handle very large delay', async () => {
      const items = [1, 2];
      const worker = async (item: number) => item * 2;
      const options: ConcurrencyOptions = { concurrency: 1, minDelayMs: 1000 };

      const start = Date.now();
      await pMapWithRateLimit(items, worker, options);
      const totalTime = Date.now() - start;

      expect(totalTime).toBeGreaterThanOrEqual(999);
    });
  });
});
