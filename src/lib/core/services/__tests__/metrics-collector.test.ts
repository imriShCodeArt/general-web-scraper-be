import { MetricsCollector } from '../metrics-collector';
import { Metrics, BatchMetrics } from '../../../helpers/metrics';
import pino from 'pino';

describe('MetricsCollector', () => {
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    const logger = pino({ level: 'silent' });
    metricsCollector = new MetricsCollector(logger);
  });

  describe('getMetrics', () => {
    it('should return initial metrics', () => {
      const metrics = metricsCollector.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalProducts).toBe(0);
      expect(metrics.successfulProducts).toBe(0);
      expect(metrics.failedProducts).toBe(0);
      expect(metrics.totalProcessingTime).toBe(0);
      expect(metrics.averageProcessingTime).toBe(0);
      expect(metrics.errors).toEqual([]);
    });
  });

  describe('updateMetrics', () => {
    it('should update metrics with batch data', () => {
      const batchMetrics: BatchMetrics = {
        processed: 10,
        successful: 8,
        failed: 2,
        processingTime: 1000,
        errors: ['Error 1', 'Error 2'],
      };

      metricsCollector.updateMetrics(batchMetrics);

      const metrics = metricsCollector.getMetrics();
      expect(metrics.totalProducts).toBe(10);
      expect(metrics.successfulProducts).toBe(8);
      expect(metrics.failedProducts).toBe(2);
      expect(metrics.totalProcessingTime).toBe(1000);
      expect(metrics.errors).toHaveLength(2);
    });

    it('should accumulate metrics across multiple updates', () => {
      const batch1: BatchMetrics = {
        processed: 5,
        successful: 4,
        failed: 1,
        processingTime: 500,
        errors: ['Error 1'],
      };

      const batch2: BatchMetrics = {
        processed: 3,
        successful: 2,
        failed: 1,
        processingTime: 300,
        errors: ['Error 2'],
      };

      metricsCollector.updateMetrics(batch1);
      metricsCollector.updateMetrics(batch2);

      const metrics = metricsCollector.getMetrics();
      expect(metrics.totalProducts).toBe(8);
      expect(metrics.successfulProducts).toBe(6);
      expect(metrics.failedProducts).toBe(2);
      expect(metrics.totalProcessingTime).toBe(800);
      expect(metrics.errors).toHaveLength(2);
    });
  });

  describe('recordJobMetrics', () => {
    it('should record job metrics correctly', () => {
      metricsCollector.recordJobMetrics(5, 4, 1, 1000, ['Error 1']);

      const metrics = metricsCollector.getMetrics();
      expect(metrics.totalProducts).toBe(5);
      expect(metrics.successfulProducts).toBe(4);
      expect(metrics.failedProducts).toBe(1);
      expect(metrics.totalProcessingTime).toBe(1000);
      expect(metrics.errors).toHaveLength(1);
    });

    it('should calculate average processing time correctly', () => {
      metricsCollector.recordJobMetrics(10, 8, 2, 2000, []);

      const metrics = metricsCollector.getMetrics();
      expect(metrics.averageProcessingTime).toBe(200); // 2000ms / 10 products
    });
  });

  describe('getFormattedMetrics', () => {
    it('should return formatted metrics string', () => {
      metricsCollector.recordJobMetrics(10, 8, 2, 2000, ['Error 1']);

      const formatted = metricsCollector.getFormattedMetrics();

      expect(formatted).toContain('Total: 10 products');
      expect(formatted).toContain('Successful: 8');
      expect(formatted).toContain('Failed: 2');
      expect(formatted).toContain('80.0%');
    });
  });

  describe('getPerformanceResponse', () => {
    it('should return performance response object', () => {
      metricsCollector.recordJobMetrics(10, 8, 2, 2000, ['Error 1']);

      const response = metricsCollector.getPerformanceResponse();

      expect(response.data).toHaveProperty('totalProductsProcessed', 10);
      expect(response.data).toHaveProperty('averageProcessingTime', 200);
      expect(response.data).toHaveProperty('totalProcessingTime', 2000);
      expect(response.success).toBe(true);
    });
  });

  describe('getLiveMetrics', () => {
    it('should return live metrics object', () => {
      metricsCollector.recordJobMetrics(10, 8, 2, 2000, ['Error 1']);

      const liveMetrics = metricsCollector.getLiveMetrics();

      expect(liveMetrics).toHaveProperty('totalProducts', 10);
      expect(liveMetrics).toHaveProperty('successfulProducts', 8);
      expect(liveMetrics).toHaveProperty('failedProducts', 2);
      expect(liveMetrics).toHaveProperty('totalProcessingTime', 2000);
      expect(liveMetrics).toHaveProperty('averageProcessingTime', 200);
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations based on metrics', () => {
      metricsCollector.recordJobMetrics(10, 5, 5, 2000, ['Error 1', 'Error 2']);

      const recommendations = metricsCollector.getRecommendations();

      expect(recommendations).toBeDefined();
      expect(recommendations.recommendations).toBeDefined();
      expect(Array.isArray(recommendations.recommendations)).toBe(true);
    });

    it('should provide performance recommendations for slow processing', () => {
      metricsCollector.recordJobMetrics(10, 8, 2, 60000, []);

      const recommendations = metricsCollector.getRecommendations();

      expect(recommendations.recommendations.some((r: any) => r.type === 'performance')).toBe(true);
    });

    it('should provide error recommendations for high failure rate', () => {
      metricsCollector.recordJobMetrics(10, 2, 8, 1000, ['Error 1', 'Error 2', 'Error 3']);

      const recommendations = metricsCollector.getRecommendations();

      expect(recommendations.recommendations.some((r: any) => r.type === 'error_rate' || r.type === 'success_rate')).toBe(true);
    });
  });

  describe('logMetrics', () => {
    it('should log metrics without throwing', () => {
      metricsCollector.recordJobMetrics(10, 8, 2, 2000, ['Error 1']);

      expect(() => metricsCollector.logMetrics()).not.toThrow();
    });
  });
});
