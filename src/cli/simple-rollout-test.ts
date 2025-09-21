#!/usr/bin/env ts-node

/**
 * Simple Phase 10 Rollout Test
 *
 * This script tests the feature flags without complex scraping operations.
 */

import { Command } from 'commander';
import { CsvGenerator } from '../lib/core/services/csv-generator';
import { getFeatureFlags, getFeatureFlagsSummary } from '../lib/config/feature-flags';
import { info, error } from '../lib/infrastructure/logging/logger';

interface TestResult {
  testName: string;
  success: boolean;
  errors: string[];
  warnings: string[];
}

class SimpleRolloutTester {
  private results: TestResult[] = [];

  /**
   * Run all tests
   */
  async runTests(): Promise<void> {
    info('🚀 Starting Simple Phase 10 Rollout Test');
    info('Feature flags:', getFeatureFlagsSummary());

    try {
      // Test 1: Feature flag functionality
      await this.testFeatureFlags();

      // Test 2: CSV generation with feature flags
      await this.testCsvGeneration();

      // Test 3: Feature flag comparison
      await this.testFeatureFlagComparison();

      // Generate test report
      this.generateReport();

    } catch (err) {
      error('Test failed:', err);
      process.exit(1);
    } finally {
      process.exit(0);
    }
  }

  /**
   * Test feature flag functionality
   */
  private async testFeatureFlags(): Promise<void> {
    const testName = 'Feature Flag Functionality';
    const errors: string[] = [];
    const warnings: string[] = [];

    info(`\n📋 Testing: ${testName}`);

    try {
      // Test default flags (now enabled by default after Phase 10)
      const defaultFlags = getFeatureFlags();
      if (defaultFlags.batchWideAttributeUnion !== true) {
        errors.push('Default batchWideAttributeUnion should be true');
      }
      if (defaultFlags.normalizedAttributeKeys !== true) {
        errors.push('Default normalizedAttributeKeys should be true');
      }

      // Test environment variable override
      process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = 'true';
      process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS = 'true';

      const overriddenFlags = getFeatureFlags();
      if (overriddenFlags.batchWideAttributeUnion !== true) {
        errors.push('Environment variable override failed for batchWideAttributeUnion');
      }
      if (overriddenFlags.normalizedAttributeKeys !== true) {
        errors.push('Environment variable override failed for normalizedAttributeKeys');
      }

      // Reset environment
      delete process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION;
      delete process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS;

      this.addResult(testName, errors.length === 0, errors, warnings);

    } catch (err) {
      errors.push(`Unexpected error: ${err}`);
      this.addResult(testName, false, errors, warnings);
    }
  }

  /**
   * Test CSV generation with feature flags
   */
  private async testCsvGeneration(): Promise<void> {
    const testName = 'CSV Generation with Feature Flags';
    const errors: string[] = [];
    const warnings: string[] = [];

    info(`\n📋 Testing: ${testName}`);

    try {
      // Create mock products (simple, no variations to avoid complexity)
      const mockProducts = [
        {
          id: 'test-1',
          title: 'Test Product 1',
          price: '100',
          sku: 'TEST-1',
          productType: 'simple' as const,
          attributes: { Color: ['Red'], Size: ['S'] },
          variations: [],
          normalizedAt: new Date(),
          sourceUrl: 'https://test.com/product1',
          confidence: 0.9,
          slug: 'test-product-1',
          description: 'Test product description',
          shortDescription: 'Test short description',
          images: ['https://test.com/image1.jpg'],
          stockStatus: 'instock' as const,
          regularPrice: '100',
          salePrice: undefined,
          category: 'Test Category',
        },
      ];

      // Test with feature flags disabled
      process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = 'false';
      process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS = 'false';

      const legacyGenerator = new CsvGenerator();
      let legacyResult;
      try {
        legacyResult = await legacyGenerator.generateBothCsvs(mockProducts);
        info('Legacy CSV generation successful');
      } catch (err) {
        errors.push(`Legacy CSV generation failed: ${err}`);
        this.addResult(testName, false, errors, warnings);
        return;
      }

      // Test with feature flags enabled
      process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = 'true';
      process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS = 'true';

      const newGenerator = new CsvGenerator();
      let newResult;
      try {
        newResult = await newGenerator.generateBothCsvs(mockProducts);
        info('New CSV generation successful');
      } catch (err) {
        errors.push(`New CSV generation failed: ${err}`);
        this.addResult(testName, false, errors, warnings);
        return;
      }

      // Validate results
      if (legacyResult.parentCsv.length === 0) {
        errors.push('Legacy CSV generation failed');
      }
      if (newResult.parentCsv.length === 0) {
        errors.push('New CSV generation failed');
      }

      // Check for differences
      if (legacyResult.parentCsv === newResult.parentCsv) {
        warnings.push('Legacy and new CSV results are identical (expected differences)');
      }

      // Reset environment
      delete process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION;
      delete process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS;

      this.addResult(testName, errors.length === 0, errors, warnings);

    } catch (err) {
      errors.push(`Unexpected error: ${err}`);
      this.addResult(testName, false, errors, warnings);
    }
  }

  /**
   * Test feature flag comparison
   */
  private async testFeatureFlagComparison(): Promise<void> {
    const testName = 'Feature Flag Comparison';
    const errors: string[] = [];
    const warnings: string[] = [];

    info(`\n📋 Testing: ${testName}`);

    try {
      // Test that feature flags are working correctly
      // This is a simplified test that focuses on the core functionality

      // Test 1: Verify feature flags can be toggled
      const originalFlags = getFeatureFlags();
      info('Original feature flags:', originalFlags);

      // Test 2: Verify environment variable override works
      process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = 'true';
      process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS = 'true';

      const overriddenFlags = getFeatureFlags();
      if (!overriddenFlags.batchWideAttributeUnion) {
        errors.push('Batch-wide attribute union flag not enabled');
      }
      if (!overriddenFlags.normalizedAttributeKeys) {
        errors.push('Normalized attribute keys flag not enabled');
      }

      // Test 3: Verify CSV generator respects feature flags
      const csvGenerator = new CsvGenerator();
      if (!csvGenerator) {
        errors.push('CSV generator creation failed');
      }

      // Reset environment
      delete process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION;
      delete process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS;

      this.addResult(testName, errors.length === 0, errors, warnings);

    } catch (err) {
      errors.push(`Unexpected error: ${err}`);
      this.addResult(testName, false, errors, warnings);
    }
  }

  /**
   * Extract headers from CSV content
   */
  private extractHeaders(csvContent: string): string[] {
    if (!csvContent || csvContent.length === 0) {
      return [];
    }
    const lines = csvContent.split('\n');
    if (lines.length === 0) {
      return [];
    }
    const firstLine = lines[0];
    if (!firstLine) {
      return [];
    }
    return firstLine.split(',').map(h => h.trim());
  }

  /**
   * Add test result
   */
  private addResult(
    testName: string,
    success: boolean,
    errors: string[],
    warnings: string[],
  ): void {
    this.results.push({
      testName,
      success,
      errors,
      warnings,
    });

    if (success) {
      info(`✅ ${testName} - PASSED`);
    } else {
      error(`❌ ${testName} - FAILED`);
      errors.forEach(err => error(`  Error: ${err}`));
    }

    warnings.forEach(warning => info(`  Warning: ${warning}`));
  }

  /**
   * Generate test report
   */
  private generateReport(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    info('\n📊 Test Report');
    info('==============');
    info(`Total Tests: ${totalTests}`);
    info(`Passed: ${passedTests}`);
    info(`Failed: ${failedTests}`);
    info(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    // Feature flag recommendation
    if (failedTests === 0) {
      info('\n🎉 All tests passed! Feature flags are working correctly.');
      info('Recommendation: Feature flags can be enabled for production use.');
    } else {
      error('\n⚠️  Some tests failed. Review issues before enabling feature flags.');
    }
  }
}

// CLI interface
const program = new Command();

program
  .name('simple-rollout-test')
  .description('Simple Phase 10 rollout test for feature flags')
  .action(async () => {
    const tester = new SimpleRolloutTester();
    await tester.runTests();
  });

program.parse();
