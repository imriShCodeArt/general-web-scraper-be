import { RawProduct, NormalizedProduct, RawVariation, ProductVariation } from '../types';

export class NormalizationToolkit {
  /**
   * Normalize raw product data into standardized format
   */
  static normalizeProduct(raw: RawProduct, url: string): NormalizedProduct {
    return {
      title: this.cleanText(raw.title || ''),
      slug: this.generateSlug(raw.title || url),
      description: this.cleanText(raw.description || ''),
      shortDescription: this.cleanText(raw.shortDescription || ''),
      sku: this.cleanSku(raw.sku || this.generateSku(url)),
      stockStatus: this.normalizeStockStatus(raw.stockStatus),
      images: this.normalizeImages(raw.images || []),
      category: this.cleanText(raw.category || 'Uncategorized'),
      productType: this.detectProductType(raw),
      attributes: this.normalizeAttributes(raw.attributes || {}),
      variations: this.normalizeVariations(raw.variations || [], raw.sku || ''),
    };
  }

  /**
   * Clean and decode text content
   */
  static cleanText(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      // Decode percent encoding
      .replace(/%20/g, ' ')
      .replace(/%2B/g, '+')
      .replace(/%2F/g, '/')
      .replace(/%3F/g, '?')
      .replace(/%3D/g, '=')
      .replace(/%26/g, '&')
      // Decode HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove placeholder text
      .replace(/(בחר אפשרות|בחירת אפשרות|Select option|Choose option)/gi, '')
      .trim();
  }

  /**
   * Generate a clean SKU
   */
  static cleanSku(sku: string): string {
    if (!sku) return '';
    
    return sku
      .trim()
      .replace(/[^a-zA-Z0-9\-_]/g, '')
      .toUpperCase();
  }

  /**
   * Generate SKU from URL if none provided
   */
  static generateSku(url: string): string {
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    return lastPart?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'PRODUCT';
  }

  /**
   * Generate slug from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  /**
   * Normalize stock status
   */
  static normalizeStockStatus(status?: string): 'instock' | 'outofstock' {
    if (!status) return 'instock';
    
    const normalized = status.toLowerCase().trim();
    if (normalized.includes('out') || normalized.includes('unavailable') || normalized.includes('0')) {
      return 'outofstock';
    }
    return 'instock';
  }

  /**
   * Normalize image URLs to absolute URLs
   */
  static normalizeImages(images: string[], baseUrl?: string): string[] {
    if (!images || images.length === 0) return [];
    
    return images
      .filter(img => img && img.trim())
      .map(img => {
        if (img.startsWith('http')) return img;
        if (baseUrl && img.startsWith('/')) {
          const url = new URL(baseUrl);
          return `${url.protocol}//${url.host}${img}`;
        }
        return img;
      })
      .filter(img => img.startsWith('http'));
  }

  /**
   * Detect if product is simple or variable
   */
  static detectProductType(raw: RawProduct): 'simple' | 'variable' {
    if (raw.variations && raw.variations.length > 0) {
      return 'variable';
    }
    
    if (raw.attributes && Object.keys(raw.attributes).length > 0) {
      // Check if any attribute has multiple values
      for (const values of Object.values(raw.attributes)) {
        if (values && values.length > 1) {
          return 'variable';
        }
      }
    }
    
    return 'simple';
  }

  /**
   * Normalize product attributes
   */
  static normalizeAttributes(attributes: Record<string, string[]>): Record<string, string[]> {
    const normalized: Record<string, string[]> = {};
    
    for (const [key, values] of Object.entries(attributes)) {
      if (!values || values.length === 0) continue;
      
      const cleanKey = this.cleanAttributeName(key);
      const cleanValues = values
        .map(value => this.cleanText(value))
        .filter(value => value && !this.isPlaceholder(value));
      
      if (cleanValues.length > 0) {
        normalized[cleanKey] = cleanValues;
      }
    }
    
    return normalized;
  }

  /**
   * Clean attribute names
   */
  static cleanAttributeName(name: string): string {
    return name
      .trim()
      // Remove WooCommerce prefixes
      .replace(/^(pa_|attribute_)/, '')
      // Decode percent encoding
      .replace(/%20/g, ' ')
      .replace(/%2B/g, '+')
      // Capitalize first letter (preserve Hebrew)
      .replace(/^([a-z])/, (match) => match.toUpperCase())
      .trim();
  }

  /**
   * Check if text is a placeholder
   */
  static isPlaceholder(text: string): boolean {
    const placeholders = [
      'בחר אפשרות',
      'בחירת אפשרות',
      'Select option',
      'Choose option',
      'בחר גודל',
      'בחר צבע',
      'בחר מודל',
      'Select size',
      'Select color',
      'Select model'
    ];
    
    return placeholders.some(placeholder => 
      text.toLowerCase().includes(placeholder.toLowerCase())
    );
  }

  /**
   * Normalize product variations
   */
  static normalizeVariations(variations: RawVariation[], parentSku: string): ProductVariation[] {
    return variations
      .filter(variation => variation && variation.sku)
      .map(variation => ({
        sku: this.cleanSku(variation.sku!),
        regularPrice: this.cleanText(variation.regularPrice || ''),
        taxClass: this.cleanText(variation.taxClass || ''),
        stockStatus: this.normalizeStockStatus(variation.stockStatus),
        images: this.normalizeImages(variation.images || []),
        attributeAssignments: this.cleanAttributeAssignments(variation.attributeAssignments || {}),
      }));
  }

  /**
   * Clean attribute assignments
   */
  static cleanAttributeAssignments(assignments: Record<string, string>): Record<string, string> {
    const cleaned: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(assignments)) {
      const cleanKey = this.cleanAttributeName(key);
      const cleanValue = this.cleanText(value);
      
      if (cleanValue && !this.isPlaceholder(cleanValue)) {
        cleaned[cleanKey] = cleanValue;
      }
    }
    
    return cleaned;
  }

  /**
   * Parse dimensions from text
   */
  static parseDimensions(text: string): { width?: number; height?: number; depth?: number } {
    if (!text) return {};
    
    const cleaned = this.cleanText(text);
    
    // Pattern: "140140" -> "140*140"
    const dimensionPattern = /(\d{2,4})(\d{2,4})/g;
    const match = dimensionPattern.exec(cleaned);
    
    if (match) {
      return {
        width: parseInt(match[1] || '0'),
        height: parseInt(match[2] || '0')
      };
    }
    
    // Pattern: "140 x 140" or "140*140"
    const xPattern = /(\d+)\s*[xX*]\s*(\d+)/;
    const xMatch = cleaned.match(xPattern);
    
    if (xMatch) {
      return {
        width: parseInt(xMatch[1] || '0'),
        height: parseInt(xMatch[2] || '0')
      };
    }
    
    return {};
  }
}
