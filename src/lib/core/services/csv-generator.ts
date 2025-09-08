import { NormalizedProduct } from '../../domain/types';
import { debug, warn } from '../../infrastructure/logging/logger';
import { writeToBuffer } from 'fast-csv';
import { Transform } from 'stream';

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

export class CsvGenerator {
  constructor(private csvWriter: CsvWriter = new FastCsvWriter()) {}

  /**
   * Clean up any resources used by the CSV generator
   */
  cleanup(): void {
    if (this.csvWriter.cleanup) {
      this.csvWriter.cleanup();
    }
  }

  /**
   * Generate Parent CSV for WooCommerce import
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
    const unionKeys = Array.from(this.aggregateAttributesAcrossProducts(uniqueProducts));
    const attributeHeaderNames = unionKeys.map((raw) => this.attributeDisplayName(raw));
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
    const attributeHeaders: string[] = [];
    for (let idx = 0; idx < attributeHeaderNames.length; idx++) {
      const name = attributeHeaderNames[idx];
      const rawKey = unionKeys[idx];
      attributeHeaders.push(`attribute:${name}`);
      attributeHeaders.push(`attribute_data:${name}`);
      if (defaultEligibleRawKeys.has(rawKey)) {
        attributeHeaders.push(`attribute_default:${name}`);
      }
    }
    const allHeaders = [...baseHeaders, ...attributeHeaders];

    const csvData = uniqueProducts.map((product, index) => {
      // Build attributes from product.attributes plus union of variation attributeAssignments
      const aggregatedAttributes: Record<string, string[]> = {};
      // Seed from normalized product.attributes
      for (const [key, vals] of Object.entries(product.attributes || {})) {
        const values = Array.from(new Set((vals || []).filter(Boolean)));
        aggregatedAttributes[key] = values;
      }
      // Merge from variations - this is the main source of attributes for variable products
      for (const v of product.variations || []) {
        for (const [key, val] of Object.entries(v.attributeAssignments || {})) {
          // Runtime guardrails for attribute keys
          if (!/^pa_/i.test(key)) {
            warn('⚠️ Runtime check (CSV parent): variation attribute key without pa_ prefix', {
              productSku: product.sku,
              key,
            });
          }
          if (/\s/.test(key)) {
            warn('⚠️ Runtime check (CSV parent): variation attribute key contains spaces', {
              productSku: product.sku,
              key,
            });
          }
          const existing = aggregatedAttributes[key] || [];
          if (val && !existing.includes(val)) existing.push(val);
          aggregatedAttributes[key] = existing;
        }
      }

      debug('Aggregated attributes for product', {
        productTitle: product.title,
        productType: product.productType,
        attributesFromProduct: Object.keys(product.attributes || {}),
        attributesFromVariations: product.variations?.map(v => Object.keys(v.attributeAssignments || {})) || [],
        finalAggregatedAttributes: Object.keys(aggregatedAttributes),
      });

      const row: Record<string, string> = {
        ID: '', // Will be auto-generated by WooCommerce
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
        post_parent: '', // Empty for parent products
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

      // Add attributes per Woo CSV Import Suite rules using the union keys
      // attribute:<Name>, attribute_data:<Name>, attribute_default:<Name>
      const isVariable = product.productType === 'variable';
      const firstVariation = (product.variations || [])[0];
      for (let i = 0; i < unionKeys.length; i++) {
        const rawName = unionKeys[i];
        const headerName = this.attributeDisplayName(rawName);
        const values = aggregatedAttributes[rawName] || [];

        // position|visible|is_taxonomy|in_variations
        const visible = 1;
        const isTaxonomy = /^pa_/i.test(rawName) ? 1 : 0;
        const inVariations = isVariable ? 1 : 0;

        row[`attribute:${headerName}`] = values.join(' | ');
        row[`attribute_data:${headerName}`] = `${i}|${visible}|${isTaxonomy}|${inVariations}`;

        if (defaultEligibleRawKeys.has(rawName) && isVariable && firstVariation && firstVariation.attributeAssignments) {
          const fv =
            firstVariation.attributeAssignments[rawName] ||
            firstVariation.attributeAssignments[this.attributeDisplayName(rawName)] ||
            firstVariation.attributeAssignments[this.cleanAttributeName(rawName)] ||
            firstVariation.attributeAssignments[`pa_${this.cleanAttributeName(rawName)}`] ||
            '';
          if (fv) {
            row[`attribute_default:${headerName}`] = fv;
          }
        }
      }

      return row;
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
        // Collect attribute header names from product + variations
        const aggregatedAttributes: Record<string, string[]> = {};
        for (const [key, vals] of Object.entries(product.attributes || {})) {
          aggregatedAttributes[key] = Array.from(new Set((vals || []).filter(Boolean)));
        }
        for (const v of product.variations || []) {
          for (const k of Object.keys(v.attributeAssignments || {})) {
            if (!/^pa_/i.test(k)) {
              warn('⚠️ Runtime check (CSV variation): variation attribute key without pa_ prefix', {
                productSku: product.sku,
                key: k,
              });
            }
            if (/\s/.test(k)) {
              warn('⚠️ Runtime check (CSV variation): variation attribute key contains spaces', {
                productSku: product.sku,
                key: k,
              });
            }
            const list = aggregatedAttributes[k] || [];
            aggregatedAttributes[k] = list;
          }
        }
        for (const rawName of Object.keys(aggregatedAttributes)) {
          // Use display name and, when applicable, raw pa_* name in meta attribute headers
          const displayName = this.attributeDisplayName(rawName);
          if (!/^pa_/i.test(rawName)) {
            warn('⚠️ Runtime check (CSV variation headers): non pa_ attribute encountered', {
              rawName,
              productSku: product.sku,
            });
          }
          attributeHeadersSet.add(`meta:attribute_${displayName}`);
          if (/^pa_/i.test(rawName)) {
            attributeHeadersSet.add(`meta:attribute_${rawName}`);
          }
        }
        debug('Product is variable, processing variations');
        for (const variation of product.variations) {
          const row: Record<string, string> = {
            ID: '', // Will be auto-generated by WooCommerce
            post_type: 'product_variation',
            post_status: 'publish',
            parent_sku: product.sku,
            post_title: `${product.title} - ${Object.values(variation.attributeAssignments || {}).join(', ')}`,
            post_name: `${product.slug || product.sku}-${variation.sku}`.toLowerCase(),
            post_content: product.description || '',
            post_excerpt: product.shortDescription || '',
            menu_order: '0',
            sku: variation.sku,
            stock_status: variation.stockStatus,
            regular_price: variation.regularPrice,
            sale_price: variation.salePrice || '',
            tax_class: variation.taxClass || 'parent',
            images: ((variation.images[0] || product.images[0] || '') as string).toString(),
          };

          // Add attribute values per variation using meta:attribute_<Name> columns
          const assignments = variation.attributeAssignments || {};
          // Ensure all known attribute headers exist on this row (fill missing as empty)
          for (const header of attributeHeadersSet) {
            row[header] = row[header] || '';
          }
          for (const [rawName, attrValue] of Object.entries(assignments)) {
            // Populate display-name header and, when applicable, raw pa_* header
            const displayName = this.attributeDisplayName(rawName);
            row[`meta:attribute_${displayName}`] = attrValue as string;
            if (/^pa_/i.test(rawName)) {
              row[`meta:attribute_${rawName}`] = attrValue as string;
            }
          }

          variationRows.push(row);
        }
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
