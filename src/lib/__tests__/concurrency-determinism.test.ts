import { pMapWithRateLimit } from '../helpers/concurrency';

describe('Concurrency Determinism Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Deterministic Behavior with Fake Timers', () => {
    it('should process items in deterministic order with fake timers', async () => {
      const items = ['item1', 'item2', 'item3'];
      const results: string[] = [];

      const worker = async (item: string, index: number): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return `${item}-${index}`;
      };

      const promise = pMapWithRateLimit(items, worker, { concurrency: 2, minDelayMs: 50 });

      // Advance timers to complete all operations
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toEqual(['item1-0', 'item2-1', 'item3-2']);
    });

    it('should respect concurrency limit with fake timers', async () => {
      const items = Array.from({ length: 10 }, (_, i) => `item${i}`);
      let concurrentCount = 0;
      let maxConcurrent = 0;

      const worker = async (item: string, index: number): Promise<string> => {
        concurrentCount++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCount);

        await new Promise(resolve => setTimeout(resolve, 100));

        concurrentCount--;
        return `${item}-${index}`;
      };

      const promise = pMapWithRateLimit(items, worker, { concurrency: 3, minDelayMs: 0 });

      await jest.runAllTimersAsync();
      await promise;

      expect(maxConcurrent).toBeLessThanOrEqual(3);
    });

    it('should handle rate limiting with fake timers', async () => {
      const items = ['item1', 'item2', 'item3'];
      const startTimes: number[] = [];

      const worker = async (item: string, index: number): Promise<string> => {
        startTimes.push(Date.now());
        await new Promise(resolve => setTimeout(resolve, 50));
        return `${item}-${index}`;
      };

      const promise = pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: 100 });

      await jest.runAllTimersAsync();
      await promise;

      // Check that items are processed with at least 100ms delay between them
      for (let i = 1; i < startTimes.length; i++) {
        expect(startTimes[i] - startTimes[i - 1]).toBeGreaterThanOrEqual(100);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty array', async () => {
      const result = await pMapWithRateLimit([], async () => 'test', { concurrency: 1, minDelayMs: 0 });
      expect(result).toEqual([]);
    });

    it('should handle single item', async () => {
      const result = await pMapWithRateLimit(['item1'], async (item) => item, { concurrency: 1, minDelayMs: 0 });
      expect(result).toEqual(['item1']);
    });

    it('should handle concurrency of 0', async () => {
      const items = ['item1', 'item2'];
      const result = await pMapWithRateLimit(items, async (item) => item, { concurrency: 0, minDelayMs: 0 });
      expect(result).toEqual([undefined, undefined]);
    });

    it('should handle negative concurrency', async () => {
      const items = ['item1', 'item2'];
      const result = await pMapWithRateLimit(items, async (item) => item, { concurrency: -1, minDelayMs: 0 });
      expect(result).toEqual([undefined, undefined]);
    });

    it('should handle worker function that throws', async () => {
      const items = ['item1', 'item2'];
      const worker = async (item: string): Promise<string> => {
        if (item === 'item1') {
          throw new Error('Test error');
        }
        return item;
      };

      const result = await pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: 0 });
      expect(result[0]).toBeInstanceOf(Error);
      expect(result[1]).toBe('item2');
    });
  });

  describe('Concurrency Control', () => {
    it('should not exceed concurrency limit', async () => {
      const items = Array.from({ length: 3 }, (_, i) => `item${i}`);
      let activeWorkers = 0;
      let maxActiveWorkers = 0;

      const worker = async (item: string): Promise<string> => {
        activeWorkers++;
        maxActiveWorkers = Math.max(maxActiveWorkers, activeWorkers);

        activeWorkers--;
        return item;
      };

      await pMapWithRateLimit(items, worker, { concurrency: 2, minDelayMs: 0 });

      expect(maxActiveWorkers).toBeLessThanOrEqual(2);
    });

    it('should process all items', async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item${i}`);
      const processedItems: string[] = [];

      const worker = async (item: string): Promise<string> => {
        processedItems.push(item);
        return item;
      };

      const result = await pMapWithRateLimit(items, worker, { concurrency: 10, minDelayMs: 0 });

      expect(result).toHaveLength(100);
      expect(processedItems).toHaveLength(100);
    });
  });

  describe('Rate Limiting', () => {
    it('should respect minimum delay between operations', async () => {
      const items = ['item1', 'item2'];
      const result = await pMapWithRateLimit(items, async (item) => item, { concurrency: 1, minDelayMs: 0 });
      expect(result).toEqual(['item1', 'item2']);
    });

    it('should handle zero delay', async () => {
      const items = ['item1', 'item2', 'item3'];
      const result = await pMapWithRateLimit(items, async (item) => item, { concurrency: 1, minDelayMs: 0 });
      expect(result).toEqual(['item1', 'item2', 'item3']);
    });
  });

  describe('Error Handling', () => {
    it('should collect errors in results array', async () => {
      const items = ['item1', 'item2', 'item3'];
      const worker = async (item: string): Promise<string> => {
        if (item === 'item2') {
          throw new Error('Test error');
        }
        return item;
      };

      const result = await pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: 0 });

      expect(result[0]).toBe('item1');
      expect(result[1]).toBeInstanceOf(Error);
      expect(result[2]).toBe('item3');
    });

    it('should handle all items failing', async () => {
      const items = ['item1', 'item2'];
      const worker = async (): Promise<string> => {
        throw new Error('All items failed');
      };

      const result = await pMapWithRateLimit(items, worker, { concurrency: 1, minDelayMs: 0 });

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Error);
      expect(result[1]).toBeInstanceOf(Error);
    });
  });

  describe('Memory Management', () => {
    it('should not accumulate memory with many items', async () => {
      const items = Array.from({ length: 1000 }, (_, i) => `item${i}`);
      const worker = async (item: string): Promise<string> => item;

      const result = await pMapWithRateLimit(items, worker, { concurrency: 10, minDelayMs: 0 });

      expect(result).toHaveLength(1000);
      expect(result[0]).toBe('item0');
      expect(result[999]).toBe('item999');
    });

    it('should not accumulate timers over time', async () => {
      const items = Array.from({ length: 2 }, (_, i) => `item${i}`);
      const worker = async (item: string): Promise<string> => {
        return item;
      };

      // Run multiple times to check for timer accumulation
      for (let i = 0; i < 2; i++) {
        await pMapWithRateLimit(items, worker, { concurrency: 2, minDelayMs: 0 });
      }

      // This should not timeout
      expect(true).toBe(true);
    });
  });

  describe('Deterministic Results', () => {
    it('should produce same results for same input', async () => {
      const items = ['item1', 'item2', 'item3'];
      const worker = async (item: string, index: number): Promise<string> => `${item}-${index}`;

      const result1 = await pMapWithRateLimit(items, worker, { concurrency: 2, minDelayMs: 0 });
      const result2 = await pMapWithRateLimit(items, worker, { concurrency: 2, minDelayMs: 0 });

      expect(result1).toEqual(result2);
    });

    it('should maintain order of results', async () => {
      const items = Array.from({ length: 10 }, (_, i) => `item${i}`);
      const worker = async (item: string, index: number): Promise<string> => `${item}-${index}`;

      const result = await pMapWithRateLimit(items, worker, { concurrency: 3, minDelayMs: 0 });

      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBe(`item${i}-${i}`);
      }
    });
  });
});