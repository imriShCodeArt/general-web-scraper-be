import { writeToBuffer } from 'fast-csv';
import { NormalizedProduct, ProductVariation } from '../types';

export class CsvGenerator {
  /**
   * Generate Parent CSV for WooCommerce import
   */
  static async generateParentCsv(products: NormalizedProduct[]): Promise<string> {
    console.log('🔍 DEBUG: generateParentCsv called with products:', products.length);
    
    // Deduplicate products by SKU to prevent CSV duplicates
    const uniqueProducts = this.deduplicateProducts(products);
    console.log(`🔍 DEBUG: Deduplicated from ${products.length} to ${uniqueProducts.length} products`);
    
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
        id: (index + 1).toString(),
        post_title: product.title,
        post_name: product.slug && product.slug.trim() !== '' ? product.slug : (product.sku ? product.sku.toLowerCase() : `product-${index + 1}`),
        post_status: 'publish',
        post_content: product.description,
        post_excerpt: product.shortDescription,
        post_parent: '0',
        menu_order: '0',
        post_type: 'product',
        sku: product.sku,
        stock_status: product.stock_status || product.stockStatus,
        images: product.images.join('|'),
        'tax:product_type': product.productType,
        'tax:product_cat': product.category,
        description: product.description,
        regular_price: product.regularPrice || '',
        sale_price: product.salePrice || '',
      } as any;

      // Add attributes per Woo CSV Import Suite rules
      // attribute:<Name> = pipe-separated values
      // attribute_default:<Name> = default value (variable products)
      // attribute_data:<Name> = position|visible|variation (variation flag only for variable products)
      const isVariable = product.productType === 'variable';
      let position = 0;
      const firstVariation = (product.variations || [])[0];

      for (const [rawName, values] of Object.entries(aggregatedAttributes)) {
        // Preserve global attribute prefix 'pa_' when present, otherwise use cleaned local name
        const isGlobal = /^pa_/i.test(rawName);
        const cleanLocal = this.cleanAttributeName(rawName);
        const headerName = isGlobal ? `pa_${cleanLocal.toLowerCase()}` : cleanLocal;

        row[`attribute:${headerName}`] = (values || []).join(' | ');
        const visible = 1;
        const variation = isVariable ? 1 : 0;
        row[`attribute_data:${headerName}`] = `${position}|${visible}|${variation}`;

        // Default attribute per first variation when variable
        if (isVariable && firstVariation && firstVariation.attributeAssignments) {
          const fv = firstVariation.attributeAssignments[rawName] || firstVariation.attributeAssignments[cleanLocal] || firstVariation.attributeAssignments[headerName] || '';
          if (fv) {
            row[`attribute_default:${headerName}`] = fv;
          }
        }

        position++;
      }

      return row;
    });

    console.log('🔍 DEBUG: generateParentCsv completed, rows:', csvData.length);
    
    return new Promise((resolve, reject) => {
      writeToBuffer(csvData, { headers: true })
        .then(buffer => resolve(buffer.toString()))
        .catch(reject);
    });
  }

  /**
   * Generate Variation CSV for WooCommerce import
   */
  static async generateVariationCsv(products: NormalizedProduct[]): Promise<string> {
    const variationRows: Record<string, string>[] = [];
    let variationId = 1;

    // DEBUG: Log what we're processing
    console.log('🔍 DEBUG: generateVariationCsv called with products:', products.length);
    
    for (const product of products) {
      console.log('🔍 DEBUG: Processing product for variations:', {
        title: product.title.substring(0, 50),
        productType: product.productType,
        variationsCount: product.variations.length,
        attributesCount: Object.keys(product.attributes).length,
        attributes: product.attributes
      });
      
      if (product.productType === 'variable' && product.variations.length > 0) {
        console.log('✅ DEBUG: Product is variable, processing variations');
        for (const variation of product.variations) {
          const row: Record<string, string> = {
            id: variationId.toString(),
            post_type: 'product_variation',
            post_status: 'publish',
            parent_sku: product.sku,
            post_title: product.title, // Same as parent
            post_name: `${product.slug}-${variation.sku}`,
            post_content: product.description,
            post_excerpt: product.shortDescription,
            menu_order: '0',
            sku: variation.sku,
            stock_status: variation.stockStatus,
            regular_price: variation.regularPrice,
            sale_price: variation.salePrice || '',
            tax_class: variation.taxClass,
            images: variation.images.join('|'),
          };

          // Add attribute values per variation using attribute:<Name> columns
          for (const [rawName, attrValue] of Object.entries(variation.attributeAssignments)) {
            const isGlobal = /^pa_/i.test(rawName);
            const cleanLocal = this.cleanAttributeName(rawName);
            const headerName = isGlobal ? `pa_${cleanLocal.toLowerCase()}` : cleanLocal;
            row[`attribute:${headerName}`] = attrValue;
          }

          variationRows.push(row);
          variationId++;
        }
      } else {
        console.log('❌ DEBUG: Product is NOT variable or has no variations:', {
          productType: product.productType,
          variationsCount: product.variations.length
        });
      }
    }

    console.log('🔍 DEBUG: Final variation rows count:', variationRows.length);
    
    if (variationRows.length === 0) {
      return '';
    }

    console.log('🔍 DEBUG: generateVariationCsv completed, rows:', variationRows.length);
    
    return new Promise((resolve, reject) => {
      writeToBuffer(variationRows, { headers: true })
        .then(buffer => resolve(buffer.toString()))
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
    console.log('🔍 DEBUG: generateBothCsvs called with products:', products.length);
    
    const [parentCsv, variationCsv] = await Promise.all([
      this.generateParentCsv(products),
      this.generateVariationCsv(products),
    ]);

    const variationCount = products
      .filter(p => p.productType === 'variable')
      .reduce((sum, p) => sum + p.variations.length, 0);

    console.log('🔍 DEBUG: generateBothCsvs results:', {
      productCount: products.length,
      variationCount,
      parentCsvLength: parentCsv.length,
      variationCsvLength: variationCsv.length,
      productsWithVariations: products.filter(p => p.productType === 'variable').length,
      productTypes: products.map(p => p.productType)
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
        console.log(`✅ DEBUG: Added unique product: ${product.sku} - ${product.title.substring(0, 50)}`);
      } else {
        console.log(`⚠️ DEBUG: Skipping duplicate product: ${product.sku} - ${product.title.substring(0, 50)}`);
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
      .map(p => p.category)
      .filter(cat => cat && cat !== 'Uncategorized')
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
