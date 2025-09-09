import { NormalizedProduct } from '../../domain/types';
import { debug } from '../../infrastructure/logging/logger';
import { writeToBuffer } from 'fast-csv';
import { Transform } from 'stream';
import { getFeatureFlags } from '../../config/feature-flags';
import { aggregateAttributesAcrossProducts, buildParentHeaders, buildParentRow, buildVariationRows } from '../../helpers/csv';
import { attributeDisplayName, cleanAttributeName } from '../../helpers/attrs';

/**
 * Interface for CSV writing operations
 */
export interface CsvWriter {
  writeToBuffer(data: Record<string, unknown>[], options?: Record<string, unknown>): Promise<Buffer>;
  cleanup?(): void;
}

/**
 * Default implementation using fast-csv with proper cleanup
 */
export class FastCsvWriter implements CsvWriter {
  private activeStreams: Transform[] = [];

  async writeToBuffer(data: Record<string, unknown>[], options?: Record<string, unknown>): Promise<Buffer> {
    try {
      const buffer = await writeToBuffer(data, options);
      return buffer;
    } catch (error) {
      debug('Error in writeToBuffer', { error });
      throw error;
    }
  }

  cleanup(): void {
    // Clean up any active streams
    this.activeStreams.forEach(stream => {
      if (!stream.destroyed) {
        stream.destroy();
      }
    });
    this.activeStreams = [];
  }
}

/**
 * Generates WooCommerce-compatible CSV files for product imports.
 *
 * This class handles the creation of parent and variation CSV files that conform to
 * WooCommerce's CSV import specification. For detailed information about the CSV format,
 * column requirements, and validation rules, see:
 *
 * @see {@link ../../../woocommerce_csv_spec.md WooCommerce CSV Import Specification}
 *
 * Key features:
 * - Generates parent CSV with attribute definitions and metadata
 * - Creates variation CSV with proper attribute mappings
 * - Ensures column name consistency between parent and variations
 * - Handles both custom and taxonomy attributes (pa_ prefixed)
 * - Validates attribute data flags and naming conventions
 */
export class CsvGenerator {
  private featureFlags = getFeatureFlags();

  constructor(private csvWriter: CsvWriter = new FastCsvWriter()) {
    // Log feature flags status for debugging
    if (this.featureFlags.rolloutDebugMode) {
      debug('CsvGenerator initialized with feature flags', this.featureFlags);
    }
  }

  /**
   * Clean up any resources used by the CSV generator
   */
  cleanup(): void {
    if (this.csvWriter.cleanup) {
      this.csvWriter.cleanup();
    }
  }

  /**
   * Legacy method to get attribute keys (pre-Phase 4 behavior)
   * Used when batch-wide attribute union feature flag is disabled
   */
  private getLegacyAttributeKeys(products: NormalizedProduct[]): string[] {
    const keys = new Set<string>();
    for (const product of products) {
      if (product.attributes) {
        for (const key of Object.keys(product.attributes)) {
          keys.add(key);
        }
      }
    }
    return Array.from(keys);
  }

  /**
   * Generate Parent CSV for WooCommerce import
   *
   * Creates a parent CSV file that defines the product structure and attribute sets.
   * Each row represents a variable product with its attribute definitions.
   *
   * @see {@link ../../../woocommerce_csv_spec.md#2-parent-csv-variable-products Parent CSV Format}
   *
   * @param products Array of normalized products
   * @returns CSV data as string
   */
  async generateParentCsv(products: NormalizedProduct[]): Promise<string> {
    debug('generateParentCsv called with products', { count: products.length });

    // Deduplicate products by SKU to prevent CSV duplicates
    const uniqueProducts = this.deduplicateProducts(products);
    debug('Deduplicated products', {
      original: products.length,
      deduplicated: uniqueProducts.length,
    });

    // Phase 4: Build batch-wide attribute union for parent CSV headers
    // Feature flag: batchWideAttributeUnion
    const unionKeys = this.featureFlags.batchWideAttributeUnion
      ? Array.from(aggregateAttributesAcrossProducts(uniqueProducts))
      : this.getLegacyAttributeKeys(uniqueProducts);
    const attributeHeaderNames = unionKeys.map((raw) => attributeDisplayName(raw));

    if (this.featureFlags.rolloutDebugMode) {
      debug('Batch-wide attribute union', {
        enabled: this.featureFlags.batchWideAttributeUnion,
        unionKeys: unionKeys.length,
        attributeHeaderNames: attributeHeaderNames.length,
      });
    }
    // Determine which attributes have defaults (only for variable products)
    const defaultEligibleRawKeys = new Set<string>();
    for (const p of uniqueProducts) {
      if (p.productType === 'variable' && p.variations && p.variations.length > 0) {
        for (const key of Object.keys(p.attributes || {})) {
          defaultEligibleRawKeys.add(key);
        }
        for (const v of p.variations) {
          for (const key of Object.keys(v.attributeAssignments || {})) {
            defaultEligibleRawKeys.add(key);
          }
        }
      }
    }

    // Build explicit headers so every row includes all attribute columns
    const baseHeaders = [
      'ID',
      'post_title',
      'post_name',
      'post_status',
      'post_content',
      'post_excerpt',
      'post_parent',
      'post_type',
      'menu_order',
      'sku',
      'stock_status',
      'images',
      'tax:product_type',
      'tax:product_cat',
      'description',
      'regular_price',
      'sale_price',
    ];
    const attributeHeaders = buildParentHeaders(attributeHeaderNames).filter((h) => {
      // Only keep attribute_default headers that are eligible
      if (!h.startsWith('attribute_default:')) return true;
      const rawName = h.replace('attribute_default:', '');
      // Map display back to raw via union arrays
      const idx = attributeHeaderNames.indexOf(rawName);
      if (idx === -1) return false;
      return defaultEligibleRawKeys.has(unionKeys[idx]);
    });
    const allHeaders = [...baseHeaders, ...attributeHeaders];

    const csvData = uniqueProducts.map((product, index) => {
      const base: Record<string, string> = {
        ID: '',
        post_title: product.title,
        post_name:
          product.slug && product.slug.trim() !== ''
            ? product.slug
            : product.sku
              ? product.sku.toLowerCase()
              : `product-${index + 1}`,
        post_status: 'publish',
        post_content: product.description || '',
        post_excerpt: product.shortDescription || '',
        post_parent: '',
        post_type: 'product',
        menu_order: '0',
        sku: product.sku,
        stock_status: product.stockStatus,
        images: product.images.join('|'),
        'tax:product_type': product.productType,
        'tax:product_cat': product.category,
        description: product.description || '',
        regular_price: product.regularPrice || '0',
        sale_price: product.salePrice || '',
      };

      return buildParentRow(
        product,
        unionKeys,
        {
          attributeDisplayName,
          cleanAttributeName,
          defaultEligibleRawKeys,
        },
        base,
      );
    });

    debug('generateParentCsv completed', { rows: csvData.length });

    try {
      const buffer = await this.csvWriter.writeToBuffer(csvData, {
        headers: allHeaders,
        quote: true,
        escape: '"',
      });
      return buffer.toString();
    } catch (error) {
      debug('Error in generateParentCsv', { error });
      throw error;
    }
  }

  /**
   * Generate Variation CSV for WooCommerce import
   *
   * Creates a variation CSV file that defines individual product variations.
   * Each row represents a specific combination of attribute values with its own
   * SKU, price, and inventory data.
   *
   * @see {@link ../../../woocommerce_csv_spec.md#3-variation-csv-child-rows Variation CSV Format}
   *
   * @param products Array of normalized products
   * @returns CSV data as string
   */
  async generateVariationCsv(products: NormalizedProduct[]): Promise<string> {
    const variationRows: Record<string, string>[] = [];
    const attributeHeadersSet = new Set<string>();

    // DEBUG: Log what we're processing
    debug('generateVariationCsv called with products', { count: products.length });

    for (const product of products) {
      debug('Processing product for variations', {
        title: product.title.substring(0, 50),
        productType: product.productType,
        variationsCount: product.variations.length,
        attributesCount: Object.keys(product.attributes).length,
        attributes: product.attributes,
      });

      if (product.productType === 'variable' && product.variations.length > 0) {
        const rows = buildVariationRows(product, attributeDisplayName);
        // collect headers from produced rows
        for (const r of rows) {
          Object.keys(r)
            .filter((k) => k.startsWith('meta:attribute_'))
            .forEach((k) => attributeHeadersSet.add(k));
        }
        variationRows.push(...rows);
      } else {
        debug('Product is NOT variable or has no variations', {
          productType: product.productType,
          variationsCount: product.variations.length,
        });
      }
    }

    debug('Final variation rows count', { count: variationRows.length });

    if (variationRows.length === 0) {
      return '';
    }

    // Deduplicate variation rows by SKU (keep first occurrence)
    const seenSku = new Set<string>();
    const dedupedRows: Record<string, string>[] = [];
    for (const row of variationRows) {
      const sku = row.sku;
      if (!sku || seenSku.has(sku)) continue;
      seenSku.add(sku);
      dedupedRows.push(row);
    }

    // Build stable headers: base columns + any dynamic meta:attribute_* columns discovered across products
    const baseHeaders = [
      'ID',
      'post_type',
      'post_status',
      'parent_sku',
      'post_title',
      'post_name',
      'post_content',
      'post_excerpt',
      'menu_order',
      'sku',
      'stock_status',
      'regular_price',
      'sale_price',
      'tax_class',
      'images',
    ];
    const dynamicHeaders = Array.from(attributeHeadersSet).sort();
    const headers = [...baseHeaders, ...dynamicHeaders];

    debug('generateVariationCsv completed', { rows: variationRows.length, headers });

    try {
      const buffer = await this.csvWriter.writeToBuffer(dedupedRows, {
        headers,
        quote: true,
        escape: '"',
      });
      return buffer.toString();
    } catch (error) {
      debug('Error in generateVariationCsv', { error });
      throw error;
    }
  }

  /**
   * Generate both CSVs in parallel
   */
  async generateBothCsvs(products: NormalizedProduct[]): Promise<{
    parentCsv: string;
    variationCsv: string;
    productCount: number;
    variationCount: number;
  }> {
    debug('generateBothCsvs called with products', { count: products.length });

    const [parentCsv, variationCsv] = await Promise.all([
      this.generateParentCsv(products),
      this.generateVariationCsv(products),
    ]);

    const variationCount = products
      .filter((p) => p.productType === 'variable')
      .reduce((sum, p) => sum + p.variations.length, 0);

    debug('generateBothCsvs results', {
      productCount: products.length,
      variationCount,
      parentCsvLength: parentCsv.length,
      variationCsvLength: variationCsv.length,
      productsWithVariations: products.filter((p) => p.productType === 'variable').length,
      productTypes: products.map((p) => p.productType),
    });

    return {
      parentCsv,
      variationCsv,
      productCount: products.length,
      variationCount,
    };
  }

  /**
   * Clean attribute names for CSV headers
   */
  private cleanAttributeName(name: string): string {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  /**
   * Turn raw attribute keys into display names like in examples (Color, Size)
   */
  private attributeDisplayName(rawName: string): string {
    const withoutPrefix = rawName.replace(/^pa_/i, '');
    const cleaned = withoutPrefix.replace(/[_-]+/g, ' ').trim().toLowerCase();
    return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Aggregate attributes across products (union) - exposed for instrumentation
   */
  // eslint-disable-next-line class-methods-use-this
  private aggregateAttributesAcrossProducts(products: NormalizedProduct[]): Set<string> {
    const keys = new Set<string>();
    for (const product of products) {
      for (const key of Object.keys(product.attributes || {})) {
        keys.add(key);
      }
      for (const variation of product.variations || []) {
        for (const key of Object.keys(variation.attributeAssignments || {})) {
          keys.add(key);
        }
      }
    }
    debug('🔍 DEBUG: aggregateAttributesAcrossProducts keys', Array.from(keys));
    return keys;
  }

  /**
   * Deduplicate products based on SKU and title
   */
  private deduplicateProducts(products: NormalizedProduct[]): NormalizedProduct[] {
    const seen = new Map<string, NormalizedProduct>();
    const uniqueProducts: NormalizedProduct[] = [];

    for (const product of products) {
      if (!product.sku || !product.title) {
        // Skip products without SKU or title silently
        continue;
      }

      const key = `${product.sku}-${product.title}`;
      if (!seen.has(key)) {
        seen.set(key, product);
        uniqueProducts.push(product);
      }
      // Skip duplicate products silently
    }

    return uniqueProducts;
  }

  /**
   * Generate smart filename based on products
   */
  generateFilename(products: NormalizedProduct[], jobId: string): string {
    if (products.length === 0) {
      return `scraped-products-${jobId}.csv`;
    }

    // Try to extract category from products
    const categories = products
      .map((p) => p.category)
      .filter((cat) => cat && cat !== 'Uncategorized')
      .slice(0, 3); // Take first 3 categories

    if (categories.length > 0) {
      const categoryPart = categories.join('-').toLowerCase();
      return `${categoryPart}-${jobId}.csv`;
    }

    // Fallback to product count
    return `products-${products.length}-${jobId}.csv`;
  }

  /**
   * Validate CSV data before generation
   */
  validateProducts(products: NormalizedProduct[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      if (!product?.sku) {
        errors.push(`Product ${i + 1}: Missing SKU`);
      }

      if (!product?.title) {
        errors.push(`Product ${i + 1}: Missing title`);
      }

      if (product?.productType === 'variable') {
        for (let j = 0; j < (product?.variations?.length || 0); j++) {
          const variation = product?.variations?.[j];
          if (!variation?.sku) {
            errors.push(`Product ${i + 1}, Variation ${j + 1}: Missing SKU`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Static methods for backward compatibility (deprecated)
  /**
   * @deprecated Use instance method instead
   */
  static async generateParentCsv(products: NormalizedProduct[]): Promise<string> {
    const generator = new CsvGenerator();
    return generator.generateParentCsv(products);
  }

  /**
   * @deprecated Use instance method instead
   */
  static async generateVariationCsv(products: NormalizedProduct[]): Promise<string> {
    const generator = new CsvGenerator();
    return generator.generateVariationCsv(products);
  }

  /**
   * @deprecated Use instance method instead
   */
  static async generateBothCsvs(products: NormalizedProduct[]): Promise<{
    parentCsv: string;
    variationCsv: string;
    productCount: number;
    variationCount: number;
  }> {
    const generator = new CsvGenerator();
    return generator.generateBothCsvs(products);
  }

  /**
   * @deprecated Use instance method instead
   */
  static generateFilename(products: NormalizedProduct[], jobId: string): string {
    const generator = new CsvGenerator();
    return generator.generateFilename(products, jobId);
  }

  /**
   * @deprecated Use instance method instead
   */
  static validateProducts(products: NormalizedProduct[]): {
    valid: boolean;
    errors: string[];
  } {
    const generator = new CsvGenerator();
    return generator.validateProducts(products);
  }
}
