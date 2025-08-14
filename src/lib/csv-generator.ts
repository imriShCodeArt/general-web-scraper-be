import { writeToBuffer } from 'fast-csv';
import { Product, Variation } from '@/types';

export class CSVGenerator {
  /**
   * Generate parent products CSV for WooCommerce import
   */
  static async generateParentProductsCSV(products: Product[]): Promise<Buffer> {
    const csvData = products.map(product => {
      // Better product type detection
      const hasRealVariations = product.variations.length > 0 && 
        product.variations.some(v => v.sku !== product.sku); // Check if variations are different from parent
      
      const productType = hasRealVariations ? 'variable' : 'simple';
      
      const row: Record<string, string> = {
        post_title: product.title,
        post_name: product.slug,
        post_status: 'publish',
        sku: product.sku,
        stock_status: product.stock_status,
        images: product.images.join(' | '),
        'tax:product_type': productType,
        'tax:product_cat': product.category,
        post_content: product.description,
        post_excerpt: product.description.substring(0, 200) + (product.description.length > 200 ? '...' : ''),
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

        // Add additional WooCommerce fields
        row['_regular_price'] = '0.00'; // Default price for parent products
        row['_sale_price'] = '';
        row['_manage_stock'] = 'no';
        row['_stock'] = '';
        row['_weight'] = '';
        row['_length'] = '';
        row['_width'] = '';
        row['_height'] = '';

      return row;
    });

    return writeToBuffer(csvData, { headers: true });
  }

  /**
   * Generate variation products CSV for WooCommerce import
   */
  static async generateVariationProductsCSV(products: Product[]): Promise<Buffer> {
    const variations: Record<string, string>[] = [];

    products.forEach(product => {
      // Only include products with real variations (not artificial ones)
      const hasRealVariations = product.variations.length > 0 && 
        product.variations.some(v => v.sku !== product.sku);
      
      if (hasRealVariations) {
        product.variations.forEach(variation => {
          // Skip artificial variations (where SKU is the same as parent)
          if (variation.sku === product.sku) return;
          
          const row: Record<string, string> = {
            parent_sku: product.sku,
            sku: variation.sku,
            stock_status: variation.stock_status,
            regular_price: variation.regular_price,
            tax_class: variation.tax_class,
            images: variation.images.join(' | '),
            _regular_price: variation.regular_price,
            _sale_price: '',
            _manage_stock: 'no',
            _stock: '',
            _weight: '',
            _length: '',
            _width: '',
            _height: '',
          };

          // Add attribute meta
          if (variation.meta.attribute_Color) {
            row['meta:attribute_Color'] = variation.meta.attribute_Color;
          }

          if (variation.meta.attribute_Size) {
            row['meta:attribute_Size'] = variation.meta.attribute_Size;
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
}
