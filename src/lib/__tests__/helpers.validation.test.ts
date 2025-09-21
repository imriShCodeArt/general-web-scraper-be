import { z } from 'zod';
import {
  ScrapeInitSchema,
  ScrapeInitInput,
  formatZodError,
  JobIdParamSchema,
  DownloadParamsSchema,
} from '../helpers/validation';

describe('helpers/validation', () => {
  describe('ScrapeInitSchema', () => {
    it('should validate valid scrape init input', () => {
      const validInput: ScrapeInitInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        options: {
          maxProducts: 100,
          categories: ['electronics', 'books'],
          retryOnFailure: true,
          maxRetries: 3,
        },
      };

      const result = ScrapeInitSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate minimal valid input', () => {
      const minimalInput: ScrapeInitInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
      };

      const result = ScrapeInitSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(minimalInput);
      }
    });

    it('should validate input with partial options', () => {
      const partialInput: ScrapeInitInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        options: {
          maxProducts: 50,
        },
      };

      const result = ScrapeInitSchema.safeParse(partialInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(partialInput);
      }
    });

    it('should reject empty siteUrl', () => {
      const invalidInput = {
        siteUrl: '',
        recipe: 'test-recipe',
      };

      const result = ScrapeInitSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('siteUrl is required');
      }
    });

    it('should reject missing siteUrl', () => {
      const invalidInput = {
        recipe: 'test-recipe',
      };

      const result = ScrapeInitSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should reject empty recipe', () => {
      const invalidInput = {
        siteUrl: 'https://example.com',
        recipe: '',
      };

      const result = ScrapeInitSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('recipe is required');
      }
    });

    it('should reject missing recipe', () => {
      const invalidInput = {
        siteUrl: 'https://example.com',
      };

      const result = ScrapeInitSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should reject invalid maxProducts', () => {
      const invalidInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        options: {
          maxProducts: -1,
        },
      };

      const result = ScrapeInitSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Number must be greater than 0');
      }
    });

    it('should reject non-integer maxProducts', () => {
      const invalidInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        options: {
          maxProducts: 1.5,
        },
      };

      const result = ScrapeInitSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Expected integer');
      }
    });

    it('should reject invalid maxRetries', () => {
      const invalidInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        options: {
          maxRetries: -1,
        },
      };

      const result = ScrapeInitSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Number must be greater than or equal to 0');
      }
    });

    it('should reject non-array categories', () => {
      const invalidInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        options: {
          categories: 'electronics',
        },
      };

      const result = ScrapeInitSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Expected array');
      }
    });

    it('should reject non-boolean retryOnFailure', () => {
      const invalidInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        options: {
          retryOnFailure: 'true',
        },
      };

      const result = ScrapeInitSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Expected boolean');
      }
    });
  });

  describe('formatZodError', () => {
    it('should format simple validation error', () => {
      const error = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['siteUrl'],
          message: 'Expected string, received number',
        },
      ]);

      const formatted = formatZodError(error);
      expect(formatted).toEqual([
        {
          path: 'siteUrl',
          message: 'Expected string, received number',
        },
      ]);
    });

    it('should format nested validation error', () => {
      const error = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['options', 'categories', 0],
          message: 'Expected string, received number',
        },
      ]);

      const formatted = formatZodError(error);
      expect(formatted).toEqual([
        {
          path: 'options.categories.0',
          message: 'Expected string, received number',
        },
      ]);
    });

    it('should format root validation error', () => {
      const error = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'object',
          received: 'string',
          path: [],
          message: 'Expected object, received string',
        },
      ]);

      const formatted = formatZodError(error);
      expect(formatted).toEqual([
        {
          path: '(root)',
          message: 'Expected object, received string',
        },
      ]);
    });

    it('should format multiple validation errors', () => {
      const error = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['siteUrl'],
          message: 'Expected string, received number',
        },
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'boolean',
          path: ['recipe'],
          message: 'Expected string, received boolean',
        },
      ]);

      const formatted = formatZodError(error);
      expect(formatted).toEqual([
        {
          path: 'siteUrl',
          message: 'Expected string, received number',
        },
        {
          path: 'recipe',
          message: 'Expected string, received boolean',
        },
      ]);
    });

    it('should handle empty errors array', () => {
      const error = new z.ZodError([]);
      const formatted = formatZodError(error);
      expect(formatted).toEqual([]);
    });
  });

  describe('JobIdParamSchema', () => {
    it('should validate valid job ID', () => {
      const validInput = { jobId: 'job-123' };
      const result = JobIdParamSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject empty job ID', () => {
      const invalidInput = { jobId: '' };
      const result = JobIdParamSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('jobId is required');
      }
    });

    it('should reject missing job ID', () => {
      const invalidInput = {};
      const result = JobIdParamSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should reject non-string job ID', () => {
      const invalidInput = { jobId: 123 };
      const result = JobIdParamSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Expected string');
      }
    });
  });

  describe('DownloadParamsSchema', () => {
    it('should validate valid download params', () => {
      const validInput = { jobId: 'job-123', type: 'parent' as const };
      const result = DownloadParamsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate variation type', () => {
      const validInput = { jobId: 'job-123', type: 'variation' as const };
      const result = DownloadParamsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject invalid type', () => {
      const invalidInput = { jobId: 'job-123', type: 'invalid' };
      const result = DownloadParamsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid enum value');
      }
    });

    it('should reject missing type', () => {
      const invalidInput = { jobId: 'job-123' };
      const result = DownloadParamsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('type is required');
      }
    });

    it('should reject empty job ID', () => {
      const invalidInput = { jobId: '', type: 'parent' as const };
      const result = DownloadParamsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('jobId is required');
      }
    });

    it('should reject missing job ID', () => {
      const invalidInput = { type: 'parent' as const };
      const result = DownloadParamsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const validInput = {
        siteUrl: `https://example.com/${longString}`,
        recipe: longString,
      };

      const result = ScrapeInitSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should handle special characters in strings', () => {
      const specialString = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const validInput = {
        siteUrl: `https://example.com/${specialString}`,
        recipe: specialString,
      };

      const result = ScrapeInitSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should handle unicode characters', () => {
      const unicodeString = '测试中文🚀';
      const validInput = {
        siteUrl: `https://example.com/${unicodeString}`,
        recipe: unicodeString,
      };

      const result = ScrapeInitSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should handle very large numbers', () => {
      const validInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        options: {
          maxProducts: Number.MAX_SAFE_INTEGER,
          maxRetries: Number.MAX_SAFE_INTEGER,
        },
      };

      const result = ScrapeInitSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should handle empty arrays', () => {
      const validInput = {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        options: {
          categories: [],
        },
      };

      const result = ScrapeInitSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });
});
