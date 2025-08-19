import { Product, Variation } from '@/types';

export class CSVGenerator {
  /**
   * Normalize attribute names for CSV headers:
   * - strip known prefixes
   * - decode URL-encoded sequences
   * - preserve Hebrew, capitalize Latin
   */
  private static normalizeAttributeName(raw: string): string {
    if (!raw) return '';
    let key = raw.replace(/^attribute_/, '').replace(/^pa_/, '');
    if (/%[0-9A-Fa-f]{2}/.test(key)) {
      try { key = decodeURIComponent(key); } catch { /* noop */ }
    }
    if (/[\u0590-\u05FF]/.test(key)) return key;
    return key.length > 0 ? key.charAt(0).toUpperCase() + key.slice(1) : key;
  }

  private static decodeIfEncoded(value: string): string {
    if (!value) return value;
    if (/%[0-9A-Fa-f]{2}/.test(value)) {
      try { return decodeURIComponent(value); } catch { return value; }
    }
    return value;
  }
  /**
   * Generate CSV string from data array
   */
  private static generateCSVString(csvData: Record<string, string>[]): string {
    if (csvData.length === 0) return '';
    
    const headers = Object.keys(csvData[0]);
    const csvRows = [headers.join(',')];
    
    csvData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma, newline, quotes, or pipes
        const escaped = value.toString().replace(/"/g, '""');
        if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') || escaped.includes('|')) {
          return `"${escaped}"`;
        }
        return escaped;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Convert CSV string to Buffer
   */
  private static stringToBuffer(csvString: string): Buffer {
    return Buffer.from(csvString, 'utf8');
  }

  /**
   * Generate parent products CSV for WooCommerce import
   * Format matches: post_title,post_name,post_status,sku,stock_status,images,tax:product_type,tax:product_cat,attribute:Color,attribute_data:Color,attribute:Size,attribute_data:Size
   */
  static async generateParentProductsCSV(products: Product[]): Promise<Buffer> {
    const csvData = products.map(product => {
      // Determine product type
      const productType = product.meta?.product_type || (product.variations.length > 0 ? 'variable' : 'simple');
      
      // Base row with required fields
      const row: Record<string, string> = {
        post_title: product.title || '',
        post_name: product.postName || '',
        post_status: 'publish',
        sku: product.sku || '',
        stock_status: product.stock_status || 'instock',
        images: product.images.length > 0 ? product.images.join(' | ') : '',
        'tax:product_type': productType,
        'tax:product_cat': product.category || 'Uncategorized',
        description: product.description || ''
      };

      // Add attributes if they exist (special-case common ones, decoding values)
      if (product.attributes.Color && product.attributes.Color.length > 0) {
        const values = product.attributes.Color.map(v => this.decodeIfEncoded(v));
        row['attribute:Color'] = values.join(' | ');
        row['attribute_data:Color'] = '1'.repeat(values.length).split('').join(' | ');
      }

      if (product.attributes.Size && product.attributes.Size.length > 0) {
        const values = product.attributes.Size.map(v => this.decodeIfEncoded(v));
        row['attribute:Size'] = values.join(' | ');
        row['attribute_data:Size'] = '1'.repeat(values.length).split('').join(' | ');
      }

      // Add other attributes dynamically
      Object.keys(product.attributes).forEach(attrName => {
        if (attrName !== 'Color' && attrName !== 'Size' && product.attributes[attrName]) {
          const normalized = this.normalizeAttributeName(attrName);
          const attrValues = product.attributes[attrName]!.map(v => this.decodeIfEncoded(v));
          if (attrValues.length > 0) {
            row[`attribute:${normalized}`] = attrValues.join(' | ');
            row[`attribute_data:${normalized}`] = '1'.repeat(attrValues.length).split('').join(' | ');
          }
        }
      });

      return row;
    });

    const csvString = this.generateCSVString(csvData);
    return this.stringToBuffer(csvString);
  }

  /**
   * Generate variation products CSV for WooCommerce import
   * Format matches: parent_sku,sku,stock_status,regular_price,tax_class,images,meta:attribute_Color,meta:attribute_Size
   */
  static async generateVariationProductsCSV(products: Product[]): Promise<Buffer> {
    const variations: Record<string, string>[] = [];

    products.forEach(product => {
      // Only include products with variations
      if (product.variations.length > 0) {
        product.variations.forEach(variation => {
                  // Base variation row
        const row: Record<string, string> = {
          post_title: product.title || '', // Add post_title from parent product
          parent_sku: product.sku || '',
          sku: variation.sku || '',
          stock_status: variation.stock_status || 'instock',
          regular_price: variation.regular_price || '',
          tax_class: variation.tax_class || 'parent',
          images: variation.images.length > 0 ? variation.images.join(' | ') : ''
        };

          // Add attribute meta data
          if (variation.meta) {
            Object.keys(variation.meta).forEach(metaKey => {
              if (metaKey.startsWith('attribute_')) {
                const attrName = metaKey.replace('attribute_', '');
                const attrValue = variation.meta[metaKey];
                if (attrValue) {
                  row[`meta:attribute_${attrName}`] = attrValue.toString();
                }
              }
            });
          }

          variations.push(row);
        });
      }
    });

    const csvString = this.generateCSVString(variations);
    return this.stringToBuffer(csvString);
  }

  /**
   * Generate both CSV files and return as buffers
   */
  static async generateWooCommerceCSVs(products: Product[]): Promise<{
    parentProducts: Buffer;
    variationProducts: Buffer;
  }> {
    console.log(`[CSVGenerator] Generating CSVs for ${products.length} products`);
    
    const [parentProducts, variationProducts] = await Promise.all([
      this.generateParentProductsCSV(products),
      this.generateVariationProductsCSV(products)
    ]);

    console.log(`[CSVGenerator] Generated CSVs - parent: ${parentProducts.length} bytes, variation: ${variationProducts.length} bytes`);

    return {
      parentProducts,
      variationProducts
    };
  }

  /**
   * Get CSV filename with timestamp
   */
  static getCSVFilename(prefix: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}_${timestamp}.csv`;
  }

  /**
   * Generate a single combined CSV for simple products only
   */
  static async generateSimpleProductsCSV(products: Product[]): Promise<Buffer> {
    const simpleProducts = products.filter(product => 
      product.meta?.product_type === 'simple' || product.variations.length === 0
    );

    const csvData = simpleProducts.map(product => {
      const row: Record<string, string> = {
        post_title: product.title || '',
        post_name: product.postName || '',
        post_status: 'publish',
        sku: product.sku || '',
        stock_status: product.stock_status || 'instock',
        images: product.images.length > 0 ? product.images.join(' | ') : '',
        'tax:product_type': 'simple',
        'tax:product_cat': product.category || 'Uncategorized',
        description: product.description || '',
        short_description: product.shortDescription || '',
        regular_price: product.regularPrice || '',
        sale_price: product.salePrice || ''
      };

      // Add attributes if they exist
      Object.keys(product.attributes).forEach(attrName => {
        if (product.attributes[attrName]) {
          const attrValues = product.attributes[attrName]!;
          if (attrValues.length > 0) {
            row[`attribute:${attrName}`] = attrValues.join(' | ');
            row[`attribute_data:${attrName}`] = '1'.repeat(attrValues.length).split('').join(' | ');
          }
        }
      });

      return row;
    });

    return this.stringToBuffer(this.generateCSVString(csvData));
  }
}