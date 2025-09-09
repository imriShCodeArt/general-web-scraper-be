/**
 * Phase 10 Feature Flags Tests
 */

import { getFeatureFlags, isFeatureEnabled, getFeatureFlagsSummary, validateFeatureFlags } from '../../lib/config/feature-flags';

describe('Phase 10 Feature Flags', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION;
    delete process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS;
    delete process.env.SCRAPER_PERFORMANCE_OPTIMIZATIONS;
    delete process.env.SCRAPER_ROLLOUT_DEBUG_MODE;
    delete process.env.SCRAPER_STRICT_WOOCOMMERCE_VALIDATION;
  });

  describe('getFeatureFlags', () => {
    it('should return default feature flags when no environment variables are set', () => {
      const flags = getFeatureFlags();
      
      expect(flags.batchWideAttributeUnion).toBe(true); // Enabled by default after Phase 10
      expect(flags.normalizedAttributeKeys).toBe(true); // Enabled by default after Phase 10
      expect(flags.performanceOptimizations).toBe(true);
      expect(flags.rolloutDebugMode).toBe(false);
      expect(flags.strictWooCommerceValidation).toBe(true);
    });

    it('should read feature flags from environment variables', () => {
      process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = 'true';
      process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS = 'true';
      process.env.SCRAPER_ROLLOUT_DEBUG_MODE = 'true';
      
      const flags = getFeatureFlags();
      
      expect(flags.batchWideAttributeUnion).toBe(true);
      expect(flags.normalizedAttributeKeys).toBe(true);
      expect(flags.rolloutDebugMode).toBe(true);
    });

    it('should handle various boolean representations', () => {
      const testCases = [
        { value: 'true', expected: true },
        { value: '1', expected: true },
        { value: 'false', expected: false },
        { value: '0', expected: false },
        { value: 'TRUE', expected: true },
        { value: 'FALSE', expected: false },
        { value: '', expected: true }, // default is now true
        { value: undefined, expected: true }, // default is now true
      ];

      testCases.forEach(({ value, expected }) => {
        process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = value;
        const flags = getFeatureFlags();
        expect(flags.batchWideAttributeUnion).toBe(expected);
        delete process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION;
      });
    });
  });

  describe('isFeatureEnabled', () => {
    it('should check individual feature flags', () => {
      process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = 'true';
      process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS = 'false';
      
      expect(isFeatureEnabled('batchWideAttributeUnion')).toBe(true);
      expect(isFeatureEnabled('normalizedAttributeKeys')).toBe(false);
      expect(isFeatureEnabled('performanceOptimizations')).toBe(true); // default
    });
  });

  describe('getFeatureFlagsSummary', () => {
    it('should return a summary of all feature flags', () => {
      process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = 'true';
      process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS = 'true';
      
      const summary = getFeatureFlagsSummary();
      
      expect(summary).toHaveProperty('batch-wide-attribute-union', true);
      expect(summary).toHaveProperty('normalized-attribute-keys', true);
      expect(summary).toHaveProperty('performance-optimizations', true);
      expect(summary).toHaveProperty('rollout-debug-mode', false);
      expect(summary).toHaveProperty('strict-woocommerce-validation', true);
    });
  });

  describe('validateFeatureFlags', () => {
    it('should validate feature flags configuration', () => {
      const validation = validateFeatureFlags();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should return valid for all combinations', () => {
      // Test various combinations
      const combinations = [
        { batchWide: 'true', normalized: 'true' },
        { batchWide: 'false', normalized: 'true' },
        { batchWide: 'true', normalized: 'false' },
        { batchWide: 'false', normalized: 'false' },
      ];

      combinations.forEach(({ batchWide, normalized }) => {
        process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = batchWide;
        process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS = normalized;
        
        const validation = validateFeatureFlags();
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });
    });
  });
});
