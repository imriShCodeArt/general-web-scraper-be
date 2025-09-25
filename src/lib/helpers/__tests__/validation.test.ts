// Validation helper tests
import {
  ScrapeInitSchema,
  formatZodError,
  JobIdParamSchema,
  DownloadParamsSchema,
} from '../validation';
import { z } from 'zod';

describe('Validation Helpers', () => {
  describe('ScrapeInitSchema', () => {
    it('should validate valid scrape init input', () => {
      const validInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        options: {
          maxProducts: 10,
          categories: ['electronics'],
          retryOnFailure: true,
          maxRetries: 3,
        },
      };

      const result = ScrapeInitSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate minimal scrape init input', () => {
      const minimalInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
      };

      const result = ScrapeInitSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid scrape init input', () => {
      const invalidInput = {
        siteUrl: '',
        recipe: 'test-recipe',
      };

      const result = ScrapeInitSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('formatZodError', () => {
    it('should format zod error correctly', () => {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
        age: z.number().min(0, 'Age must be positive'),
      });

      const result = schema.safeParse({ name: '', age: -1 });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toHaveLength(2);
        expect(formatted[0]).toHaveProperty('path', 'name');
        expect(formatted[0]).toHaveProperty('message', 'Name is required');
        expect(formatted[1]).toHaveProperty('path', 'age');
        expect(formatted[1]).toHaveProperty('message', 'Age must be positive');
      }
    });
  });

  describe('JobIdParamSchema', () => {
    it('should validate valid job ID', () => {
      const validInput = { jobId: 'test-job-123' };
      const result = JobIdParamSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject empty job ID', () => {
      const invalidInput = { jobId: '' };
      const result = JobIdParamSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('DownloadParamsSchema', () => {
    it('should validate valid download params', () => {
      const validInput = { jobId: 'test-job-123', type: 'parent' as const };
      const result = DownloadParamsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate variation type', () => {
      const validInput = { jobId: 'test-job-123', type: 'variation' as const };
      const result = DownloadParamsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const invalidInput = { jobId: 'test-job-123', type: 'invalid' as never };
      const result = DownloadParamsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
