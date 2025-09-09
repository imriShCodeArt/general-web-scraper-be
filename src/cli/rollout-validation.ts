#!/usr/bin/env ts-node

/**
 * Phase 10 Rollout Validation Script
 *
 * This script validates the rollout by testing on real Shuk Rehut pages
 * and verifying CSV output quality and WooCommerce compliance.
 */

import { Command } from 'commander';
import { ScrapingService } from '../lib/core/services/scraping-service';
import { RecipeManager } from '../lib/core/services/recipe-manager';
import { CsvGenerator } from '../lib/core/services/csv-generator';
import { getFeatureFlagsSummary } from '../lib/config/feature-flags';
import { info, warn, error } from '../lib/infrastructure/logging/logger';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  testName: string;
  success: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    productsScraped: number;
    variationsFound: number;
    attributesFound: number;
    csvSize: number;
    processingTime: number;
  };
}

class RolloutValidator {
  private scrapingService: ScrapingService;
  private recipeManager: RecipeManager;
  private csvGenerator: CsvGenerator;
  private results: ValidationResult[] = [];

  constructor() {
    this.scrapingService = new ScrapingService();
    this.recipeManager = new RecipeManager();
    this.csvGenerator = new CsvGenerator();
  }

  /**
   * Run all validation tests
   */
  async runValidation(): Promise<void> {
    info('🚀 Starting Phase 10 Rollout Validation');
    info('Feature flags:', getFeatureFlagsSummary());

    // Set up timeout to prevent hanging
    const timeout = setTimeout(() => {
      error('Validation timed out after 5 minutes');
      process.exit(1);
    }, 5 * 60 * 1000); // 5 minutes

    try {
      // Test 1: Shuk Rehut Samba product page
      await this.validateSambaProduct();

      // Test 2: Shuk Rehut archive sample (3 items)
      await this.validateArchiveSample();

      // Test 3: Feature flag comparison
      await this.validateFeatureFlagComparison();

      // Generate validation report
      this.generateReport();

    } catch (err) {
      error('Validation failed:', err);
      process.exit(1);
    } finally {
      clearTimeout(timeout);
      await this.cleanup();
      process.exit(0);
    }
  }

  /**
   * Validate Shuk Rehut Samba product page
   */
  private async validateSambaProduct(): Promise<void> {
    const testName = 'Shuk Rehut Samba Product';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    info(`\n📋 Testing: ${testName}`);

    try {
      const sambaUrl = 'https://shukrehut.co.il/he/כיסאות/כיסא-למשרד-samba';

      // Initialize scraping job
      const job = await this.scrapingService.startScraping({
        siteUrl: sambaUrl,
        recipe: 'Shuk Rehut Furniture',
        options: {
          maxProducts: 1,
          rateLimit: 2000,
        },
      });

      if (!job.success) {
        errors.push(`Failed to initialize scraping: ${job.error}`);
        this.addResult(testName, false, errors, warnings, startTime, 0, 0, 0, 0);
        return;
      }

      // Wait for job completion with shorter timeout
      let jobResult;
      let attempts = 0;
      const maxAttempts = 10; // 10 seconds timeout for validation

      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        jobResult = await this.scrapingService.getJobStatus(job.data!.jobId);
        attempts++;
      } while (jobResult.data?.status === 'running' && attempts < maxAttempts);

      if (jobResult.data?.status !== 'completed') {
        errors.push(`Job did not complete: ${jobResult.data?.status} (timeout after ${maxAttempts}s)`);
        this.addResult(testName, false, errors, warnings, startTime, 0, 0, 0, 0);
        return;
      }

      // Validate results
      const products = (jobResult.data as any)?.products || [];
      if (products.length === 0) {
        errors.push('No products scraped');
      } else {
        const product = products[0];

        // Check required fields
        if (!product.title) errors.push('Missing product title');
        if (!product.price) errors.push('Missing product price');
        if (!product.images || product.images.length === 0) warnings.push('No product images found');

        // Check variations
        const variations = product.variations || [];
        if (variations.length === 0) warnings.push('No variations found (expected for Samba chair)');

        // Check attributes
        const attributes = product.attributes || {};
        const attributeCount = Object.keys(attributes).length;
        if (attributeCount === 0) warnings.push('No attributes found');

        // Generate CSV and validate
        const csvResult = await this.csvGenerator.generateBothCsvs(products);
        const csvSize = csvResult.parentCsv.length + csvResult.variationCsv.length;

        // Validate CSV content
        this.validateCsvContent(csvResult.parentCsv, csvResult.variationCsv, errors, warnings);

        this.addResult(testName, errors.length === 0, errors, warnings, startTime,
          products.length, variations.length, attributeCount, csvSize);
      }

    } catch (err) {
      errors.push(`Unexpected error: ${err}`);
      this.addResult(testName, false, errors, warnings, startTime, 0, 0, 0, 0);
    }
  }

  /**
   * Validate Shuk Rehut archive sample
   */
  private async validateArchiveSample(): Promise<void> {
    const testName = 'Shuk Rehut Archive Sample';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    info(`\n📋 Testing: ${testName}`);

    try {
      const archiveUrl = 'https://shukrehut.co.il/he/כיסאות';

      // Initialize scraping job
      const job = await this.scrapingService.startScraping({
        siteUrl: archiveUrl,
        recipe: 'Shuk Rehut Furniture',
        options: {
          maxProducts: 3,
          rateLimit: 2000,
        },
      });

      if (!job.success) {
        errors.push(`Failed to initialize scraping: ${job.error}`);
        this.addResult(testName, false, errors, warnings, startTime, 0, 0, 0, 0);
        return;
      }

      // Wait for job completion with shorter timeout
      let jobResult;
      let attempts = 0;
      const maxAttempts = 15; // 15 seconds timeout for archive validation

      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        jobResult = await this.scrapingService.getJobStatus(job.data!.jobId);
        attempts++;
      } while (jobResult.data?.status === 'running' && attempts < maxAttempts);

      if (jobResult.data?.status !== 'completed') {
        errors.push(`Job did not complete: ${jobResult.data?.status} (timeout after ${maxAttempts}s)`);
        this.addResult(testName, false, errors, warnings, startTime, 0, 0, 0, 0);
        return;
      }

      // Validate results
      const products = (jobResult.data as any)?.products || [];
      if (products.length === 0) {
        errors.push('No products scraped from archive');
      } else {
        // Check batch-wide attribute union
        const allAttributes = new Set<string>();
        let totalVariations = 0;

        for (const product of products) {
          if (product.attributes) {
            Object.keys(product.attributes).forEach(key => allAttributes.add(key));
          }
          if (product.variations) {
            totalVariations += product.variations.length;
          }
        }

        // Generate CSV and validate batch-wide union
        const csvResult = await this.csvGenerator.generateBothCsvs(products);
        this.validateBatchWideUnion(csvResult.parentCsv, allAttributes, errors, warnings);

        this.addResult(testName, errors.length === 0, errors, warnings, startTime,
          products.length, totalVariations, allAttributes.size,
          csvResult.parentCsv.length + csvResult.variationCsv.length);
      }

    } catch (err) {
      errors.push(`Unexpected error: ${err}`);
      this.addResult(testName, false, errors, warnings, startTime, 0, 0, 0, 0);
    }
  }

  /**
   * Validate feature flag comparison
   */
  private async validateFeatureFlagComparison(): Promise<void> {
    const testName = 'Feature Flag Comparison';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    info(`\n📋 Testing: ${testName}`);

    try {
      // Create mock products for testing
      const mockProducts = [
        {
          id: 'test-1',
          title: 'Test Product 1',
          price: '100',
          sku: 'TEST-1',
          productType: 'variable' as const,
          attributes: { Color: ['Red', 'Blue'], Size: ['S', 'M'] },
          variations: [
            { sku: 'TEST-1-RED-S', attributeAssignments: { Color: 'Red', Size: 'S' } },
            { sku: 'TEST-1-BLUE-M', attributeAssignments: { Color: 'Blue', Size: 'M' } },
          ],
          normalizedAt: new Date(),
          sourceUrl: 'https://test.com/product1',
          confidence: 0.9,
          slug: 'test-product-1',
          description: 'Test product description',
          shortDescription: 'Test short description',
          images: ['https://test.com/image1.jpg'],
          stockStatus: 'instock',
          regularPrice: '100',
          salePrice: undefined,
          category: 'Test Category',
        },
        {
          id: 'test-2',
          title: 'Test Product 2',
          price: '200',
          sku: 'TEST-2',
          productType: 'variable' as const,
          attributes: { Material: ['Wood', 'Metal'], Weight: ['Light', 'Heavy'] },
          variations: [
            { sku: 'TEST-2-WOOD-LIGHT', attributeAssignments: { Material: 'Wood', Weight: 'Light' } },
          ],
          normalizedAt: new Date(),
          sourceUrl: 'https://test.com/product2',
          confidence: 0.9,
          slug: 'test-product-2',
          description: 'Test product description 2',
          shortDescription: 'Test short description 2',
          images: ['https://test.com/image2.jpg'],
          stockStatus: 'instock',
          regularPrice: '200',
          salePrice: undefined,
          category: 'Test Category',
        },
      ];

      // Test with feature flags disabled (legacy behavior)
      process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = 'false';
      process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS = 'false';

      const legacyGenerator = new CsvGenerator();
      const legacyResult = await legacyGenerator.generateBothCsvs(mockProducts as any);

      // Test with feature flags enabled (new behavior)
      process.env.SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION = 'true';
      process.env.SCRAPER_NORMALIZED_ATTRIBUTE_KEYS = 'true';

      const newGenerator = new CsvGenerator();
      const newResult = await newGenerator.generateBothCsvs(mockProducts as any);

      // Compare results
      const legacyHeaders = this.extractHeaders(legacyResult.parentCsv);
      const newHeaders = this.extractHeaders(newResult.parentCsv);

      if (legacyHeaders.length >= newHeaders.length) {
        warnings.push('Legacy headers should be fewer than new headers (batch-wide union)');
      }

      // Check for pa_ prefixes in new result
      const hasPaPrefixes = newHeaders.some(header => header.includes('pa_'));
      if (!hasPaPrefixes) {
        warnings.push('Expected pa_ prefixed attributes in normalized result');
      }

      // Validate CSV content
      this.validateCsvContent(legacyResult.parentCsv, legacyResult.variationCsv, errors, warnings);
      this.validateCsvContent(newResult.parentCsv, newResult.variationCsv, errors, warnings);

      this.addResult(testName, errors.length === 0, errors, warnings, startTime,
        mockProducts.length, 3, 4,
        legacyResult.parentCsv.length + newResult.parentCsv.length);

    } catch (err) {
      errors.push(`Unexpected error: ${err}`);
      this.addResult(testName, false, errors, warnings, startTime, 0, 0, 0, 0);
    }
  }

  /**
   * Validate CSV content for WooCommerce compliance
   */
  private validateCsvContent(parentCsv: string, variationCsv: string, errors: string[], warnings: string[]): void {
    // Check required columns
    const requiredParentColumns = ['post_title', 'sku', 'tax:product_type'];
    const requiredVariationColumns = ['parent_sku', 'sku', 'stock_status'];

    for (const col of requiredParentColumns) {
      if (!parentCsv.includes(col)) {
        errors.push(`Missing required parent column: ${col}`);
      }
    }

    for (const col of requiredVariationColumns) {
      if (!variationCsv.includes(col)) {
        errors.push(`Missing required variation column: ${col}`);
      }
    }

    // Check for attribute column pairs
    const attributePattern = /attribute:[^,]+/g;
    const attributeDataPattern = /attribute_data:[^,]+/g;

    const parentAttributes = parentCsv.match(attributePattern) || [];
    const parentAttributeData = parentCsv.match(attributeDataPattern) || [];

    if (parentAttributes.length !== parentAttributeData.length) {
      errors.push('Mismatch between attribute and attribute_data columns');
    }

    // Check for meta attribute columns in variations
    const metaAttributePattern = /meta:attribute_[^,]+/g;
    const metaAttributes = variationCsv.match(metaAttributePattern) || [];

    if (parentAttributes.length > 0 && metaAttributes.length === 0) {
      warnings.push('No meta attribute columns found in variations');
    }
  }

  /**
   * Validate batch-wide attribute union
   */
  private validateBatchWideUnion(parentCsv: string, allAttributes: Set<string>, errors: string[], warnings: string[]): void {
    const attributePattern = /attribute:([^,]+)/g;
    const csvAttributes = new Set<string>();

    let match;
    while ((match = attributePattern.exec(parentCsv)) !== null) {
      csvAttributes.add(match[1]);
    }

    // Check if all discovered attributes are in CSV
    for (const attr of allAttributes) {
      if (!csvAttributes.has(attr) && !csvAttributes.has(`pa_${attr}`)) {
        warnings.push(`Attribute ${attr} not found in CSV headers (batch-wide union issue)`);
      }
    }
  }

  /**
   * Extract headers from CSV content
   */
  private extractHeaders(csvContent: string): string[] {
    const firstLine = csvContent.split('\n')[0];
    return firstLine.split(',').map(h => h.trim());
  }

  /**
   * Add validation result
   */
  private addResult(
    testName: string,
    success: boolean,
    errors: string[],
    warnings: string[],
    startTime: number,
    productsScraped: number,
    variationsFound: number,
    attributesFound: number,
    csvSize: number,
  ): void {
    const processingTime = Date.now() - startTime;

    this.results.push({
      testName,
      success,
      errors,
      warnings,
      metrics: {
        productsScraped,
        variationsFound,
        attributesFound,
        csvSize,
        processingTime,
      },
    });

    if (success) {
      info(`✅ ${testName} - PASSED`);
    } else {
      error(`❌ ${testName} - FAILED`);
      errors.forEach(err => error(`  Error: ${err}`));
    }

    warnings.forEach(warning => warn(`  Warning: ${warning}`));
  }

  /**
   * Generate validation report
   */
  private generateReport(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    info('\n📊 Validation Report');
    info('==================');
    info(`Total Tests: ${totalTests}`);
    info(`Passed: ${passedTests}`);
    info(`Failed: ${failedTests}`);
    info(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'rollout-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    info(`\n📄 Detailed report saved to: ${reportPath}`);

    // Feature flag recommendation
    if (failedTests === 0) {
      info('\n🎉 All tests passed! Feature flags can be enabled by default.');
      info('Recommendation: Set SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION=true and SCRAPER_NORMALIZED_ATTRIBUTE_KEYS=true');
    } else {
      warn('\n⚠️  Some tests failed. Review issues before enabling feature flags.');
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    try {
      await this.scrapingService.cleanup();
    } catch (err) {
      warn('Cleanup error:', err);
    }
  }
}

// CLI interface
const program = new Command();

program
  .name('rollout-validation')
  .description('Validate Phase 10 rollout on real Shuk Rehut pages')
  .option('--debug', 'Enable debug mode')
  .action(async (options) => {
    if (options.debug) {
      process.env.SCRAPER_ROLLOUT_DEBUG_MODE = 'true';
    }

    const validator = new RolloutValidator();
    await validator.runValidation();
  });

program.parse();
