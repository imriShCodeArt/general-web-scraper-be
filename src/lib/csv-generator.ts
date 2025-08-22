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
    let decoded = value;
    // Replace '+' with space (common in x-www-form-urlencoded)
    decoded = decoded.replace(/\+/g, ' ');
    // Try URL decoding up to 3 times if percent-encoded
    let attempts = 0;
    while (attempts < 3 && /%[0-9A-Fa-f]{2}/.test(decoded)) {
      try {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      } catch {
        break;
      }
      attempts++;
    }
    return decoded;
  }

  // Decode HTML entities (numeric decimal, numeric hex, and a few named ones)
  private static decodeHtmlEntities(value: string): string {
    if (!value) return value;
    const named: Record<string, string> = {
      amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"
    };
    let result = value.replace(/&(#\d+|#x[0-9A-Fa-f]+|[A-Za-z]+);/g, (match, entity) => {
      if (entity[0] === '#') {
        if (entity[1].toLowerCase() === 'x') {
          const code = parseInt(entity.slice(2), 16);
          return Number.isFinite(code) ? String.fromCharCode(code) : match;
        }
        const code = parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCharCode(code) : match;
      } else {
        return Object.prototype.hasOwnProperty.call(named, entity) ? named[entity] : match;
      }
    });
    return result;
  }

  // Comprehensive decode: URL (incl. '+'), then HTML entities
  private static decodeValue(value: string): string {
    const urlDecoded = this.decodeIfEncoded(value);
    return this.decodeHtmlEntities(urlDecoded);
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

  private static isPlaceholderValue(value: string): boolean {
    const v = (value || '').trim();
    return v === 'בחירת אפשרות' || v === 'בחר אפשרות' || v.toLowerCase() === 'select option';
  }

  private static transformDimensionLike(raw: string): string {
    if (!raw) return raw;
    const decoded = this.decodeIfEncoded(raw).trim();
    // Handle combined dimension + seats pattern like 220170-3-מושבים
    const seatPattern = /^(\d+)-(\d+)-מושבים$/;
    const seatMatch = decoded.match(seatPattern);
    if (seatMatch) {
      const base = seatMatch[1];
      const seats = seatMatch[2];
      const dim = (() => {
        const numericOnly = base.replace(/[^0-9]/g, '');
        const formatPair = (w: string, h: string): string | null => {
          if (!w || !h) return null;
          if (w.startsWith('0') || h.startsWith('0')) return null;
          return `${parseInt(w, 10)}*${parseInt(h, 10)}`;
        };
        const len = numericOnly.length;
        if (len >= 3) {
          if (len % 2 === 0) {
            const mid = len / 2;
            const evenW = numericOnly.slice(0, mid);
            const evenH = numericOnly.slice(mid);
            const evenFmt = formatPair(evenW, evenH);
            if (evenFmt) return evenFmt;
            const w2 = numericOnly.slice(0, len - 2);
            const h2 = numericOnly.slice(len - 2);
            const lastTwoFmt = formatPair(w2, h2);
            if (lastTwoFmt) return lastTwoFmt as string;
          } else {
            const w = numericOnly.slice(0, len - 2);
            const h = numericOnly.slice(len - 2);
            const oddFmt = formatPair(w, h);
            if (oddFmt) return oddFmt as string;
          }
        }
        return base;
      })();
      return `${dim} ${parseInt(seats, 10)} מושבים`;
    }
    // Keep only digits for size parsing
    const numericOnly = decoded.replace(/[^0-9]/g, '');
    const formatPair = (w: string, h: string): string | null => {
      if (!w || !h) return null;
      if (w.startsWith('0') || h.startsWith('0')) return null; // no leading zeros rule
      return `${parseInt(w, 10)}*${parseInt(h, 10)}`;
    };
    if (numericOnly.length >= 3) {
      const len = numericOnly.length;
      // Prefer equal split when even: e.g., 140140 -> 140*140, 5060 -> 50*60
      if (len % 2 === 0) {
        const mid = len / 2;
        const evenW = numericOnly.slice(0, mid);
        const evenH = numericOnly.slice(mid);
        const evenFmt = formatPair(evenW, evenH);
        if (evenFmt) return evenFmt;
        // Fallback: last two digits as height
        const w2 = numericOnly.slice(0, len - 2);
        const h2 = numericOnly.slice(len - 2);
        const lastTwoFmt = formatPair(w2, h2);
        if (lastTwoFmt) return lastTwoFmt;
      } else {
        // Odd lengths: use last two digits as height, e.g., 12090 -> 120*90
        const w = numericOnly.slice(0, len - 2);
        const h = numericOnly.slice(len - 2);
        const oddFmt = formatPair(w, h);
        if (oddFmt) return oddFmt;
      }
    }
    return decoded;
  }

  /**
   * Generate parent products CSV for WooCommerce import
   * Format matches: post_title,post_name,post_status,sku,stock_status,images,tax:product_type,tax:product_cat,attribute:Color,attribute_data:Color,attribute:Size,attribute_data:Size
   */
  static async generateParentProductsCSV(products: Product[]): Promise<Buffer> {
    const csvData = products.map(product => {
      // Determine product type
      const productType = product.meta?.product_type || ((product.variations && Array.isArray(product.variations) && product.variations.length > 0) ? 'variable' : 'simple');
      
      // Base row with required fields
      const row: Record<string, string> = {
        ID: '', // Leave empty for WooCommerce to auto-assign
        post_title: product.title || '',
        post_name: product.postName || '',
        post_status: 'publish',
        post_content: product.description || '',
        post_excerpt: product.shortDescription || '',
        post_parent: '0', // Top-level products
        menu_order: '0', // Top-level products
        post_type: 'product', // Product post type
        sku: product.sku || '',
        stock_status: product.stock_status || 'instock',
        images: (product.images && product.images.length > 0) ? product.images.join(' | ') : '',
        'tax:product_type': productType,
        'tax:product_cat': product.category || 'Uncategorized',
        description: product.description || ''
      };

      // Add attributes if they exist (special-case common ones, decoding values)
      if (product.attributes.Color && Array.isArray(product.attributes.Color) && product.attributes.Color.length > 0) {
        const values = product.attributes.Color
          .map(v => this.decodeIfEncoded(v))
          .filter(v => !this.isPlaceholderValue(v))
          .map(v => this.transformDimensionLike(v));
        row['attribute:Color'] = values.join(' | ');
        row['attribute_data:Color'] = '1'.repeat(values.length).split('').join(' | ');
      }

      if (product.attributes.Size && Array.isArray(product.attributes.Size) && product.attributes.Size.length > 0) {
        const values = product.attributes.Size
          .map(v => this.decodeIfEncoded(v))
          .filter(v => !this.isPlaceholderValue(v))
          .map(v => this.transformDimensionLike(v));
        row['attribute:Size'] = values.join(' | ');
        row['attribute_data:Size'] = '1'.repeat(values.length).split('').join(' | ');
      }

      // Add other attributes dynamically
      Object.keys(product.attributes).forEach(attrName => {
        if (attrName !== 'Color' && attrName !== 'Size' && product.attributes[attrName]) {
          const normalized = this.normalizeAttributeName(attrName);
          const attrValues = product.attributes[attrName]!
            .map(v => this.decodeIfEncoded(v))
            .filter(v => !this.isPlaceholderValue(v))
            .map(v => this.transformDimensionLike(v));
          if (Array.isArray(attrValues) && attrValues.length > 0) {
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
    let variationCounter = 1; // Counter for unique menu_order

    products.forEach(product => {
      // Only include products with variations
      if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
        product.variations.forEach(variation => {
                  // Base variation row
        const row: Record<string, string> = {
          ID: '', // Leave empty for WooCommerce to auto-assign
          post_type: 'product_variation',
          post_status: 'publish',
          parent_sku: product.sku || '', // Link to parent using SKU per Import Suite
          post_title: product.title || '', // Variation title (same as parent)
          post_name: `${product.postName || product.title}-${variation.sku || 'var'}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'), // Unique variation slug
          post_content: '', // Empty content for variations
          post_excerpt: '', // Empty excerpt for variations
          menu_order: variationCounter.toString(), // Set unique variation order
          sku: variation.sku || '',
          stock_status: variation.stock_status || 'instock',
          regular_price: variation.regular_price || '',
          tax_class: variation.tax_class || 'parent',
          images: (variation.images && variation.images.length > 0) ? variation.images.join(' | ') : ''
        };

          // Add attribute meta data
          if (variation.meta) {
            Object.keys(variation.meta).forEach(metaKey => {
              if (metaKey.startsWith('attribute_')) {
                const attrName = metaKey.replace('attribute_', '');
                const rawValue = variation.meta[metaKey];
                if (rawValue != null) {
                  const valueString = Array.isArray(rawValue)
                    ? rawValue.map(v => this.decodeValue(String(v))).join(' | ')
                    : this.decodeValue(String(rawValue));
                  row[`meta:attribute_${attrName}`] = valueString;
                }
              }
            });
          }

          variations.push(row);
          variationCounter++; // Increment counter for next variation
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
   * Get CSV filename without timestamp (server sets category-prefixed base)
   */
  static getCSVFilename(prefix: string): string {
    return `${prefix}.csv`;
  }

  /**
   * Generate a single combined CSV for simple products only
   */
  static async generateSimpleProductsCSV(products: Product[]): Promise<Buffer> {
    const simpleProducts = products.filter(product => 
      product.meta?.product_type === 'simple' || !product.variations || !Array.isArray(product.variations) || product.variations.length === 0
    );

    const csvData = simpleProducts.map(product => {
      const row: Record<string, string> = {
        post_title: product.title || '',
        post_name: product.postName || '',
        post_status: 'publish',
        sku: product.sku || '',
        stock_status: product.stock_status || 'instock',
        images: (product.images && product.images.length > 0) ? product.images.join(' | ') : '',
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
          if (Array.isArray(attrValues) && attrValues.length > 0) {
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