import {
  timer,
  aggregateMetrics,
  createInitialMetrics,
  calculateProcessingRate,
  calculateSuccessRate,
  formatMetrics,
  createBatchMetrics,
  Metrics,
  BatchMetrics,
} from '../helpers/metrics';

describe('helpers/metrics', () => {
  describe('timer', () => {
    it('should create a timer instance', () => {
      const t = timer();
      expect(t).toHaveProperty('start');
      expect(t).toHaveProperty('end');
      expect(t).toHaveProperty('getElapsed');
    });

    it('should measure elapsed time correctly', () => {
      const t = timer();
      t.start();

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait
      }

      const elapsed = t.end();
      expect(elapsed).toBeGreaterThanOrEqual(10);
      expect(elapsed).toBeLessThan(50);
    });

    it('should return 0 for getElapsed before start', () => {
      const t = timer();
      expect(t.getElapsed()).toBe(0);
    });

    it('should return elapsed time without ending', () => {
      const t = timer();
      t.start();

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait
      }

      const elapsed = t.getElapsed();
      expect(elapsed).toBeGreaterThanOrEqual(10);
      expect(elapsed).toBeLessThan(50);
    });

    it('should throw error when ending before starting', () => {
      const t = timer();
      expect(() => t.end()).toThrow('Timer not started');
    });

    it('should handle multiple start calls', () => {
      const t = timer();
      t.start();

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 5) {
        // Busy wait
      }

      t.start(); // Reset timer

      const start2 = Date.now();
      while (Date.now() - start2 < 5) {
        // Busy wait
      }

      const elapsed = t.end();
      expect(elapsed).toBeGreaterThanOrEqual(5);
      expect(elapsed).toBeLessThan(20);
    });
  });

  describe('createInitialMetrics', () => {
    it('should create initial metrics with correct defaults', () => {
      const metrics = createInitialMetrics();

      expect(metrics.totalProducts).toBe(0);
      expect(metrics.successfulProducts).toBe(0);
      expect(metrics.failedProducts).toBe(0);
      expect(metrics.averageProcessingTime).toBe(0);
      expect(metrics.totalProcessingTime).toBe(0);
      expect(metrics.startTime).toBeGreaterThan(0);
      expect(metrics.errors).toEqual([]);
      expect(metrics.totalJobs).toBe(0);
      expect(metrics.averageTimePerProduct).toBe(0);
      expect(metrics.endTime).toBeUndefined();
    });

    it('should have startTime close to current time', () => {
      const before = Date.now();
      const metrics = createInitialMetrics();
      const after = Date.now();

      expect(metrics.startTime).toBeGreaterThanOrEqual(before);
      expect(metrics.startTime).toBeLessThanOrEqual(after);
    });
  });

  describe('createBatchMetrics', () => {
    it('should create batch metrics with provided values', () => {
      const batch = createBatchMetrics(10, 8, 2, 1000, ['error1', 'error2']);

      expect(batch.processed).toBe(10);
      expect(batch.successful).toBe(8);
      expect(batch.failed).toBe(2);
      expect(batch.processingTime).toBe(1000);
      expect(batch.errors).toEqual(['error1', 'error2']);
    });

    it('should create batch metrics with empty errors array by default', () => {
      const batch = createBatchMetrics(5, 5, 0, 500);

      expect(batch.processed).toBe(5);
      expect(batch.successful).toBe(5);
      expect(batch.failed).toBe(0);
      expect(batch.processingTime).toBe(500);
      expect(batch.errors).toEqual([]);
    });
  });

  describe('aggregateMetrics', () => {
    it('should aggregate metrics correctly', () => {
      const previous: Metrics = {
        totalProducts: 10,
        successfulProducts: 8,
        failedProducts: 2,
        averageProcessingTime: 100,
        totalProcessingTime: 1000,
        startTime: Date.now() - 5000,
        errors: ['error1'],
        totalJobs: 1,
        averageTimePerProduct: 100,
      };

      const batch: BatchMetrics = {
        processed: 5,
        successful: 4,
        failed: 1,
        processingTime: 500,
        errors: ['error2'],
      };

      const result = aggregateMetrics(previous, batch);

      expect(result.totalProducts).toBe(15);
      expect(result.successfulProducts).toBe(12);
      expect(result.failedProducts).toBe(3);
      expect(result.totalProcessingTime).toBe(1500);
      expect(result.averageProcessingTime).toBe(100); // 1500 / 15
      expect(result.errors).toEqual(['error1', 'error2']);
      expect(result.totalJobs).toBe(2);
      expect(result.averageTimePerProduct).toBe(100);
      expect(result.startTime).toBe(previous.startTime);
      expect(result.endTime).toBeGreaterThan(0);
    });

    it('should handle zero total products', () => {
      const previous: Metrics = createInitialMetrics();
      const batch: BatchMetrics = createBatchMetrics(0, 0, 0, 0);

      const result = aggregateMetrics(previous, batch);

      expect(result.averageProcessingTime).toBe(0);
      expect(result.averageTimePerProduct).toBe(0);
    });

    it('should preserve start time from previous metrics', () => {
      const startTime = Date.now() - 10000;
      const previous: Metrics = {
        ...createInitialMetrics(),
        startTime,
      };
      const batch: BatchMetrics = createBatchMetrics(5, 5, 0, 1000);

      const result = aggregateMetrics(previous, batch);

      expect(result.startTime).toBe(startTime);
    });
  });

  describe('calculateProcessingRate', () => {
    it('should calculate processing rate correctly', () => {
      const metrics: Metrics = {
        totalProducts: 100,
        successfulProducts: 90,
        failedProducts: 10,
        averageProcessingTime: 50,
        totalProcessingTime: 5000,
        startTime: Date.now() - 10000,
        endTime: Date.now(),
        errors: [],
        totalJobs: 1,
        averageTimePerProduct: 50,
      };

      const rate = calculateProcessingRate(metrics);
      expect(rate).toBeCloseTo(10, 1); // 100 products in 10 seconds = 10 products/sec
    });

    it('should return 0 when endTime is undefined', () => {
      const metrics: Metrics = {
        ...createInitialMetrics(),
        totalProducts: 100,
      };

      const rate = calculateProcessingRate(metrics);
      expect(rate).toBe(0);
    });

    it('should return 0 when total time is 0', () => {
      const now = Date.now();
      const metrics: Metrics = {
        ...createInitialMetrics(),
        totalProducts: 100,
        startTime: now,
        endTime: now,
      };

      const rate = calculateProcessingRate(metrics);
      expect(rate).toBe(0);
    });
  });

  describe('calculateSuccessRate', () => {
    it('should calculate success rate correctly', () => {
      const metrics: Metrics = {
        ...createInitialMetrics(),
        totalProducts: 100,
        successfulProducts: 85,
        failedProducts: 15,
      };

      const rate = calculateSuccessRate(metrics);
      expect(rate).toBe(85);
    });

    it('should return 0 when total products is 0', () => {
      const metrics: Metrics = createInitialMetrics();
      const rate = calculateSuccessRate(metrics);
      expect(rate).toBe(0);
    });

    it('should handle 100% success rate', () => {
      const metrics: Metrics = {
        ...createInitialMetrics(),
        totalProducts: 50,
        successfulProducts: 50,
        failedProducts: 0,
      };

      const rate = calculateSuccessRate(metrics);
      expect(rate).toBe(100);
    });

    it('should handle 0% success rate', () => {
      const metrics: Metrics = {
        ...createInitialMetrics(),
        totalProducts: 50,
        successfulProducts: 0,
        failedProducts: 50,
      };

      const rate = calculateSuccessRate(metrics);
      expect(rate).toBe(0);
    });
  });

  describe('formatMetrics', () => {
    it('should format metrics correctly', () => {
      const metrics: Metrics = {
        totalProducts: 100,
        successfulProducts: 85,
        failedProducts: 15,
        averageProcessingTime: 50.5,
        totalProcessingTime: 5050,
        startTime: Date.now() - 10000,
        endTime: Date.now(),
        errors: ['error1', 'error2'],
        totalJobs: 1,
        averageTimePerProduct: 50.5,
      };

      const formatted = formatMetrics(metrics);

      expect(formatted).toContain('Total: 100 products');
      expect(formatted).toContain('Successful: 85 (85.0%)');
      expect(formatted).toContain('Failed: 15');
      expect(formatted).toContain('Avg Time: 50.50ms/product');
      expect(formatted).toContain('Total Time: 5050ms');
      expect(formatted).toContain('Rate:');
    });

    it('should handle metrics with no end time', () => {
      const metrics: Metrics = {
        ...createInitialMetrics(),
        totalProducts: 50,
        successfulProducts: 45,
        failedProducts: 5,
        averageProcessingTime: 25,
        totalProcessingTime: 1250,
      };

      const formatted = formatMetrics(metrics);

      expect(formatted).toContain('Total: 50 products');
      expect(formatted).toContain('Successful: 45 (90.0%)');
      expect(formatted).toContain('Failed: 5');
      expect(formatted).toContain('Avg Time: 25.00ms/product');
      expect(formatted).toContain('Total Time: 1250ms');
      expect(formatted).toContain('Rate: 0.00 products/sec');
    });

    it('should handle zero total products', () => {
      const metrics: Metrics = createInitialMetrics();
      const formatted = formatMetrics(metrics);

      expect(formatted).toContain('Total: 0 products');
      expect(formatted).toContain('Successful: 0 (0.0%)');
      expect(formatted).toContain('Failed: 0');
      expect(formatted).toContain('Avg Time: 0.00ms/product');
      expect(formatted).toContain('Total Time: 0ms');
    });
  });

  describe('Edge cases', () => {
    it('should handle very large numbers', () => {
      const metrics: Metrics = {
        totalProducts: 1000000,
        successfulProducts: 999999,
        failedProducts: 1,
        averageProcessingTime: 0.001,
        totalProcessingTime: 1000,
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        errors: [],
        totalJobs: 1,
        averageTimePerProduct: 0.001,
      };

      const rate = calculateSuccessRate(metrics);
      expect(rate).toBeCloseTo(99.9999, 4);
    });

    it('should handle very small processing times', () => {
      const metrics: Metrics = {
        totalProducts: 1000,
        successfulProducts: 1000,
        failedProducts: 0,
        averageProcessingTime: 0.001,
        totalProcessingTime: 1,
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        errors: [],
        totalJobs: 1,
        averageTimePerProduct: 0.001,
      };

      const rate = calculateProcessingRate(metrics);
      expect(rate).toBeCloseTo(1000, 0); // 1000 products in 1 second = 1000 products/sec
    });
  });
});
