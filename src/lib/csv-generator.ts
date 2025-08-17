import { writeToBuffer } from 'fast-csv';
import { Product, Variation } from '@/types';

export class CSVGenerator {
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
        'tax:product_cat': product.category || 'Uncategorized'
      };

      // Add attributes if they exist
      if (product.attributes.Color && product.attributes.Color.length > 0) {
        row['attribute:Color'] = product.attributes.Color.join(' | ');
        row['attribute_data:Color'] = '1'.repeat(product.attributes.Color.length).split('').join(' | ');
      }

      if (product.attributes.Size && product.attributes.Size.length > 0) {
        row['attribute:Size'] = product.attributes.Size.join(' | ');
        row['attribute_data:Size'] = '1'.repeat(product.attributes.Size.length).split('').join(' | ');
      }

      // Add other attributes dynamically
      Object.keys(product.attributes).forEach(attrName => {
        if (attrName !== 'Color' && attrName !== 'Size' && product.attributes[attrName]) {
          const attrValues = product.attributes[attrName]!;
          if (attrValues.length > 0) {
            row[`attribute:${attrName}`] = attrValues.join(' | ');
            row[`attribute_data:${attrName}`] = '1'.repeat(attrValues.length).split('').join(' | ');
          }
        }
      });

      return row;
    });

    return writeToBuffer(csvData, { headers: true });
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

    return writeToBuffer(variations, { headers: true });
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

    return writeToBuffer(csvData, { headers: true });
  }
}
