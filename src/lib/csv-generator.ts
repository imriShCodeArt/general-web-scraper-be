import { writeToBuffer } from 'fast-csv';
import { NormalizedProduct, ProductVariation } from '../types';

export class CsvGenerator {
  /**
   * Generate Parent CSV for WooCommerce import
   */
  static async generateParentCsv(products: NormalizedProduct[]): Promise<string> {
    const csvData = products.map((product, index) => {
      const row: Record<string, string> = {
        ID: (index + 1).toString(),
        post_title: product.title,
        post_name: product.slug,
        post_status: 'publish',
        post_content: product.description,
        post_excerpt: product.shortDescription,
        post_parent: '0',
        menu_order: '0',
        post_type: 'product',
        sku: product.sku,
        stock_status: product.stockStatus,
        images: product.images.join('|'),
        'tax:product_type': product.productType,
        'tax:product_cat': product.category,
        description: product.description,
      };

      // Add attributes
      for (const [attrName, attrValues] of Object.entries(product.attributes)) {
        const cleanName = this.cleanAttributeName(attrName);
        row[`attribute:${cleanName}`] = attrValues.join(' | ');
        row[`attribute_data:${cleanName}`] = '1 | 1'; // Visible flags
      }

      return row;
    });

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

    for (const product of products) {
      if (product.productType === 'variable' && product.variations.length > 0) {
        for (const variation of product.variations) {
          const row: Record<string, string> = {
            ID: variationId.toString(),
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
            tax_class: variation.taxClass,
            images: variation.images.join('|'),
          };

          // Add attribute meta
          for (const [attrName, attrValue] of Object.entries(variation.attributeAssignments)) {
            const cleanName = this.cleanAttributeName(attrName);
            row[`meta:attribute_${cleanName}`] = attrValue;
          }

          variationRows.push(row);
          variationId++;
        }
      }
    }

    if (variationRows.length === 0) {
      return '';
    }

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
    const [parentCsv, variationCsv] = await Promise.all([
      this.generateParentCsv(products),
      this.generateVariationCsv(products),
    ]);

    const variationCount = products
      .filter(p => p.productType === 'variable')
      .reduce((sum, p) => sum + p.variations.length, 0);

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
      
      if (!product.sku) {
        errors.push(`Product ${i + 1}: Missing SKU`);
      }
      
      if (!product.title) {
        errors.push(`Product ${i + 1}: Missing title`);
      }

      if (product.productType === 'variable') {
        for (let j = 0; j < product.variations.length; j++) {
          const variation = product.variations[j];
          if (!variation.sku) {
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
