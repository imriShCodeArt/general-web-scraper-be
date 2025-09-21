import { RawProduct, RawProductData } from '../../domain/types';
import { applyTransforms } from '../../helpers/transforms';
import { applyAttributeTransforms } from '../../helpers/transforms';

/**
 * Interface for data transformation operations
 */
export interface IDataTransformer {
  transformProduct(product: RawProductData): RawProduct;
  transformText(text: string, transforms?: any[]): string;
  transformAttributes(attributes: Record<string, (string | undefined)[]>): Record<string, (string | undefined)[]>;
  transformImages(images: (string | undefined)[]): (string | undefined)[];
  transformPrice(price: string): string;
  transformStockStatus(stockStatus: string): string;
  transformVariations(variations: RawProductData['variations']): RawProduct['variations'];
  cleanPrice(price: string): string;
  normalizeStockText(stockText: string): string;
  updateTransforms(transforms: any[]): void;
}

/**
 * Data transformation service that handles data cleaning and transformation
 */
export class DataTransformer implements IDataTransformer {
  private transforms: any[] = [];

  constructor(transforms?: any[]) {
    this.transforms = transforms || [];
  }

  /**
   * Transform raw product data to normalized product
   */
  transformProduct(product: RawProductData): RawProduct {
    return {
      id: this.transformText(product.id || ''),
      title: this.transformText(product.title || ''),
      slug: this.transformText(product.slug || ''),
      description: this.transformText(product.description || ''),
      shortDescription: this.transformText(product.shortDescription || ''),
      sku: this.transformText(product.sku || ''),
      stockStatus: this.transformStockStatus(product.stockStatus || ''),
      images: this.transformImages(product.images || []),
      category: this.transformText(product.category || ''),
      productType: this.transformText(product.productType || ''),
      attributes: this.transformAttributes(product.attributes || {}),
      variations: this.transformVariations(product.variations || []),
      regularPrice: this.transformPrice(product.price || ''),
      salePrice: this.transformPrice(product.salePrice || ''),
      metadata: product.metadata || {},
    };
  }

  /**
   * Transform text using configured transforms
   */
  transformText(text: string, transforms?: any[]): string {
    const transformsToUse = transforms || this.transforms;
    
    if (!transformsToUse || transformsToUse.length === 0) {
      return text;
    }

    let result = text;
    
    for (const transform of transformsToUse) {
      if (typeof transform === 'string') {
        // Handle string-based transforms
        result = applyTransforms(result, [transform]);
      } else if (typeof transform === 'object' && transform.type) {
        // Handle object-based transforms
        switch (transform.type) {
          case 'trim':
            result = result.trim();
            break;
          case 'replace':
            if (transform.from && transform.to) {
              result = result.replace(new RegExp(transform.from, 'g'), transform.to);
            }
            break;
          case 'regex':
            if (transform.pattern && transform.replacement) {
              result = result.replace(new RegExp(transform.pattern, 'g'), transform.replacement);
            }
            break;
        }
      }
    }
    
    return result;
  }

  /**
   * Transform attributes using attribute-specific transforms
   */
  transformAttributes(attributes: Record<string, (string | undefined)[]>): Record<string, (string | undefined)[]> {
    const transformed: Record<string, (string | undefined)[]> = {};

    for (const [key, values] of Object.entries(attributes)) {
      const transformedKey = this.transformText(key);
      const transformedValues = values.map(value => 
        value ? this.transformText(value) : value
      );
      transformed[transformedKey] = transformedValues;
    }

    return transformed;
  }

  /**
   * Transform images array
   */
  transformImages(images: (string | undefined)[]): (string | undefined)[] {
    return images
      .map(image => image ? this.transformText(image) : image)
      .filter((image): image is string => image !== undefined);
  }

  /**
   * Transform price string
   */
  transformPrice(price: string): string {
    return this.cleanPrice(price);
  }

  /**
   * Transform stock status string
   */
  transformStockStatus(stockStatus: string): string {
    return this.normalizeStockText(stockStatus);
  }

  /**
   * Transform variations array
   */
  transformVariations(variations: RawProductData['variations']): RawProduct['variations'] {
    if (!Array.isArray(variations)) {
      return [];
    }

    return variations.map(variation => ({
      sku: this.transformText(variation.sku || ''),
      regularPrice: this.transformPrice(variation.regularPrice || ''),
      salePrice: variation.salePrice ? this.transformPrice(variation.salePrice) : undefined,
      taxClass: this.transformText(variation.taxClass || ''),
      stockStatus: this.transformStockStatus(variation.stockStatus || 'instock'),
      images: this.transformImages(variation.images || []).filter((img): img is string => img !== undefined),
      attributeAssignments: this.transformAttributeAssignments(variation.attributeAssignments || {}),
    }));
  }

  /**
   * Clean price string by removing non-numeric characters except decimal point
   */
  cleanPrice(price: string): string {
    if (!price) return '';

    // Remove currency symbols and extra whitespace
    let cleaned = price.replace(/[\$€£¥₹]/g, '').trim();
    
    // Keep only digits, decimal point, and comma (for thousands separator)
    cleaned = cleaned.replace(/[^\d.,]/g, '');
    
    // Handle comma as thousands separator
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Format: 1,234.56 - remove commas
      cleaned = cleaned.replace(/,/g, '');
    } else if (cleaned.includes(',') && !cleaned.includes('.')) {
      // Format: 1,234 or 1,234,56 - check if last comma is decimal separator
      const lastCommaIndex = cleaned.lastIndexOf(',');
      const afterLastComma = cleaned.substring(lastCommaIndex + 1);
      
      if (afterLastComma.length <= 2) {
        // Likely decimal separator: 1,234,56 -> 1234.56
        cleaned = cleaned.replace(/,/g, '');
        cleaned = cleaned.replace(/(\d{2})$/, '.$1');
      } else {
        // Likely thousands separator: 1,234 -> 1234
        cleaned = cleaned.replace(/,/g, '');
      }
    }

    return cleaned;
  }

  /**
   * Normalize stock status text
   */
  normalizeStockText(stockText: string): string {
    if (!stockText) return '';

    const normalized = stockText.toLowerCase().trim();
    
    // Common stock status patterns
    if (normalized.includes('out of stock') || normalized.includes('unavailable') || normalized.includes('outofstock')) {
      return 'outofstock';
    }
    
    if (normalized.includes('in stock') || normalized.includes('available') || normalized.includes('instock')) {
      return 'instock';
    }
    
    if (normalized.includes('pre-order') || normalized.includes('preorder')) {
      return 'preorder';
    }
    
    if (normalized.includes('backorder') || normalized.includes('back order')) {
      return 'backorder';
    }
    
    // Default to unknown if no pattern matches
    return 'unknown';
  }

  /**
   * Transform attribute assignments
   */
  private transformAttributeAssignments(assignments: Record<string, string>): Record<string, string> {
    const transformed: Record<string, string> = {};

    for (const [key, value] of Object.entries(assignments)) {
      const transformedKey = this.transformText(key);
      const transformedValue = this.transformText(value);
      transformed[transformedKey] = transformedValue;
    }

    return transformed;
  }

  /**
   * Update transforms
   */
  updateTransforms(transforms: any[]): void {
    this.transforms = transforms;
  }

  /**
   * Get current transforms
   */
  getTransforms(): any[] {
    return this.transforms;
  }
}
