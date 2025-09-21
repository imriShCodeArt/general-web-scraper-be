import {
  makeCsvFilenames,
  makeTimestampedFilename,
} from '../helpers/naming';

describe('helpers/naming', () => {
  describe('makeCsvFilenames', () => {
    it('should generate CSV filenames with job ID', () => {
      const result = makeCsvFilenames('https://example.com', 'job-123');

      expect(result).toEqual({
        parent: 'parent-job-123.csv',
        variation: 'variation-job-123.csv',
      });
    });

    it('should generate CSV filenames with different job IDs', () => {
      const result1 = makeCsvFilenames('https://example.com', 'job-456');
      const result2 = makeCsvFilenames('https://test.com', 'job-789');

      expect(result1.parent).toBe('parent-job-456.csv');
      expect(result1.variation).toBe('variation-job-456.csv');
      expect(result2.parent).toBe('parent-job-789.csv');
      expect(result2.variation).toBe('variation-job-789.csv');
    });

    it('should handle different URL formats', () => {
      const result1 = makeCsvFilenames('https://example.com', 'job-1');
      const result2 = makeCsvFilenames('http://test.org', 'job-2');
      const result3 = makeCsvFilenames('https://subdomain.example.com/path', 'job-3');

      expect(result1.parent).toBe('parent-job-1.csv');
      expect(result2.parent).toBe('parent-job-2.csv');
      expect(result3.parent).toBe('parent-job-3.csv');
    });

    it('should handle custom timestamp parameter', () => {
      const customDate = new Date('2023-01-01T00:00:00Z');
      const result = makeCsvFilenames('https://example.com', 'job-123', customDate);

      expect(result.parent).toBe('parent-job-123.csv');
      expect(result.variation).toBe('variation-job-123.csv');
    });
  });

  describe('makeTimestampedFilename', () => {
    it('should generate timestamped filename', () => {
      const result = makeTimestampedFilename('test', 'csv');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^test-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.csv$/);
    });

    it('should generate filename with custom timestamp', () => {
      const customDate = new Date('2023-01-01T12:00:00.000Z');
      const result = makeTimestampedFilename('test', 'csv', customDate);

      expect(result).toBe('test-2023-01-01-12-00-00.csv');
    });

    it('should handle different prefixes and extensions', () => {
      const result1 = makeTimestampedFilename('parent', 'csv');
      const result2 = makeTimestampedFilename('variation', 'json');

      expect(result1).toMatch(/^parent-.*\.csv$/);
      expect(result2).toMatch(/^variation-.*\.json$/);
    });

    it('should handle empty prefix and extension', () => {
      const result = makeTimestampedFilename('', '');

      expect(result).toMatch(/^-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.$/);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty and null inputs', () => {
      expect(makeCsvFilenames('', '')).toEqual({
        parent: 'parent-.csv',
        variation: 'variation-.csv',
      });
    });

    it('should handle very long job IDs', () => {
      const longJobId = 'a'.repeat(1000);
      const result = makeCsvFilenames('https://example.com', longJobId);

      expect(result.parent).toBe(`parent-${longJobId}.csv`);
      expect(result.variation).toBe(`variation-${longJobId}.csv`);
    });
  });
});
