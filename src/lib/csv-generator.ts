import { writeToBuffer } from 'fast-csv';
import { NormalizedProduct } from '../types';
import { debug } from './logger';

export class CsvGenerator {
  /**
   * Generate Parent CSV for WooCommerce import
   */
  static async generateParentCsv(products: NormalizedProduct[]): Promise<string> {
    debug('🔍 DEBUG: generateParentCsv called with products:', products.length);

    // Deduplicate products by SKU to prevent CSV duplicates
    const uniqueProducts = this.deduplicateProducts(products);
    debug(`🔍 DEBUG: Deduplicated from ${products.length} to ${uniqueProducts.length} products`);

    const csvData = uniqueProducts.map((product, index) => {
      // Build attributes from product.attributes plus union of variation attributeAssignments
      const aggregatedAttributes: Record<string, string[]> = {};
      // Seed from normalized product.attributes
      for (const [key, vals] of Object.entries(product.attributes || {})) {
        const values = Array.from(new Set((vals || []).filter(Boolean)));
        aggregatedAttributes[key] = values;
      }
      // Merge from variations
      for (const v of product.variations || []) {
        for (const [key, val] of Object.entries(v.attributeAssignments || {})) {
          const existing = aggregatedAttributes[key] || [];
          if (val && !existing.includes(val)) existing.push(val);
          aggregatedAttributes[key] = existing;
        }
      }

      const row: Record<string, string> = {
        post_title: product.title,
        post_name:
          product.slug && product.slug.trim() !== ''
            ? product.slug
            : product.sku
              ? product.sku.toLowerCase()
              : `product-${index + 1}`,
        post_status: 'publish',
        sku: product.sku,
        stock_status: product.stockStatus,
        images: product.images.join('|'),
        'tax:product_type': product.productType,
        'tax:product_cat': product.category,
      };

      // Add attributes per Woo CSV Import Suite rules
      // attribute:<Name> = pipe-separated values
      // attribute_default:<Name> = default value (variable products)
      // attribute_data:<Name> = position|visible|variation (variation flag only for variable products)
      const isVariable = product.productType === 'variable';
      let position = 0;
      const firstVariation = (product.variations || [])[0];

      for (const [rawName, values] of Object.entries(aggregatedAttributes)) {
        const displayName = this.attributeDisplayName(rawName);
        const headerName = displayName; // use local attribute naming like in examples (e.g., Color, Size)

        row[`attribute:${headerName}`] = (values || []).join(' | ');
        const visible = 1;
        const isTaxonomy = /^pa_/i.test(rawName) ? 1 : 0;
        const inVariations = isVariable ? 1 : 0;
        // position|visible|is_taxonomy|in_variations
        row[`attribute_data:${headerName}`] =
          `${position}|${visible}|${isTaxonomy}|${inVariations}`;

        // Default attribute per first variation when variable
        if (isVariable && firstVariation && firstVariation.attributeAssignments) {
          const fv =
            firstVariation.attributeAssignments[rawName] ||
            firstVariation.attributeAssignments[this.cleanAttributeName(rawName)] ||
            firstVariation.attributeAssignments[`pa_${this.cleanAttributeName(rawName)}`] ||
            '';
          if (fv) {
            row[`attribute_default:${headerName}`] = fv;
          }
        }

        position++;
      }

      return row;
    });

    debug('🔍 DEBUG: generateParentCsv completed, rows:', csvData.length);

    return new Promise((resolve, reject) => {
      writeToBuffer(csvData, { headers: true })
        .then((buffer) => resolve(buffer.toString()))
        .catch(reject);
    });
  }

  /**
   * Generate Variation CSV for WooCommerce import
   */
  static async generateVariationCsv(products: NormalizedProduct[]): Promise<string> {
    const variationRows: Record<string, string>[] = [];
    const attributeHeadersSet = new Set<string>();

    // DEBUG: Log what we're processing
    debug('🔍 DEBUG: generateVariationCsv called with products:', products.length);

    for (const product of products) {
      debug('🔍 DEBUG: Processing product for variations:', {
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
            const list = aggregatedAttributes[k] || [];
            aggregatedAttributes[k] = list;
          }
        }
        for (const rawName of Object.keys(aggregatedAttributes)) {
          const displayName = this.attributeDisplayName(rawName);
          attributeHeadersSet.add(`meta:attribute_${displayName}`);
        }
        debug('✅ DEBUG: Product is variable, processing variations');
        for (const variation of product.variations) {
          const row: Record<string, string> = {
            parent_sku: product.sku,
            sku: variation.sku,
            stock_status: variation.stockStatus,
            regular_price: variation.regularPrice,
            tax_class: variation.taxClass || 'parent',
            images: ((variation.images[0] || product.images[0] || '') as string).toString(),
          };

          // Add attribute values per variation using meta:attribute_Name columns as in examples
          const assignments = variation.attributeAssignments || {};
          // Ensure all known attribute headers exist on this row (fill missing as empty)
          for (const header of attributeHeadersSet) {
            row[header] = row[header] || '';
          }
          for (const [rawName, attrValue] of Object.entries(assignments)) {
            const displayName = this.attributeDisplayName(rawName);
            const header = `meta:attribute_${displayName}`;
            row[header] = attrValue;
          }

          variationRows.push(row);
        }
      } else {
        debug('❌ DEBUG: Product is NOT variable or has no variations:', {
          productType: product.productType,
          variationsCount: product.variations.length,
        });
      }
    }

    debug('🔍 DEBUG: Final variation rows count:', variationRows.length);

    if (variationRows.length === 0) {
      return '';
    }

    // Build stable headers: base columns + any dynamic meta:attribute_* columns discovered across products
    const baseHeaders = [
      'parent_sku',
      'sku',
      'stock_status',
      'regular_price',
      'tax_class',
      'images',
    ];
    const dynamicHeaders = Array.from(attributeHeadersSet).sort();
    const headers = [...baseHeaders, ...dynamicHeaders];

    debug(
      '🔍 DEBUG: generateVariationCsv completed, rows:',
      variationRows.length,
      'headers:',
      headers,
    );

    return new Promise((resolve, reject) => {
      writeToBuffer(variationRows, { headers })
        .then((buffer) => resolve(buffer.toString()))
        .catch(reject);
    });
  }

  /**
   * Generate both CSVs in parallel
   */
  static async generateBothCsvs(products: NormalizedProduct[]): Promise<{
    parentCsv: string;
    variationCsv: string;
    productCount: number;
    variationCount: number;
  }> {
    debug('🔍 DEBUG: generateBothCsvs called with products:', products.length);

    const [parentCsv, variationCsv] = await Promise.all([
      this.generateParentCsv(products),
      this.generateVariationCsv(products),
    ]);

    const variationCount = products
      .filter((p) => p.productType === 'variable')
      .reduce((sum, p) => sum + p.variations.length, 0);

    debug('🔍 DEBUG: generateBothCsvs results:', {
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
  private static cleanAttributeName(name: string): string {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  /**
   * Turn raw attribute keys into display names like in examples (Color, Size)
   */
  private static attributeDisplayName(rawName: string): string {
    const withoutPrefix = rawName.replace(/^pa_/i, '');
    const cleaned = withoutPrefix.replace(/[_-]+/g, ' ').trim().toLowerCase();
    return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Deduplicate products based on SKU and title
   */
  private static deduplicateProducts(products: NormalizedProduct[]): NormalizedProduct[] {
    const seen = new Map<string, NormalizedProduct>();
    const uniqueProducts: NormalizedProduct[] = [];

    for (const product of products) {
      if (!product.sku || !product.title) {
        console.warn('⚠️ DEBUG: Skipping product without SKU or title:', product);
        continue;
      }

      const key = `${product.sku}-${product.title}`;
      if (!seen.has(key)) {
        seen.set(key, product);
        uniqueProducts.push(product);
        console.log(
          `✅ DEBUG: Added unique product: ${product.sku} - ${product.title.substring(0, 50)}`,
        );
      } else {
        console.log(
          `⚠️ DEBUG: Skipping duplicate product: ${product.sku} - ${product.title.substring(0, 50)}`,
        );
      }
    }

    return uniqueProducts;
  }

  /**
   * Generate smart filename based on products
   */
  static generateFilename(products: NormalizedProduct[], jobId: string): string {
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
  static validateProducts(products: NormalizedProduct[]): {
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
}
