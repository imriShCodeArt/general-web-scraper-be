import { RawProduct, NormalizedProduct, RawVariation, ProductVariation } from '../types';

export class NormalizationToolkit {
  /**
   * Normalize raw product data into standardized format
   */
  static normalizeProduct(raw: RawProduct, url: string): NormalizedProduct {
    console.log('🔍 DEBUG: normalizeProduct called with:', {
      url,
      rawTitle: raw.title,
      rawSku: raw.sku,
      rawDescription: raw.description,
      rawAttributes: raw.attributes,
      rawVariations: raw.variations
    });
    
    const result: NormalizedProduct = {
      id: raw.id || this.generateSku(url),
      title: this.cleanText(raw.title || ''),
      slug: this.generateSlug(raw.title || url),
      description: this.cleanText(raw.description || ''),
      shortDescription: this.cleanText(raw.shortDescription || ''),
      sku: this.cleanSku(raw.sku || this.generateSku(url)),
      stockStatus: this.normalizeStockStatus(raw.stockStatus),
      images: this.normalizeImages((raw.images || []).filter((img): img is string => img !== undefined)),
      category: this.cleanText(raw.category || 'Uncategorized'),
      productType: this.detectProductType(raw),
      attributes: this.normalizeAttributes((raw.attributes || {} as Record<string, (string | undefined)[]>)),
      variations: this.normalizeVariations(raw.variations || [], raw.sku || ''),
      regularPrice: this.cleanText(raw.price || ''),
      salePrice: this.cleanText(raw.salePrice || ''),
      normalizedAt: new Date(),
      sourceUrl: url,
      confidence: 0.8, // Default confidence score
    };
    
    console.log('🔍 DEBUG: normalizeProduct result:', {
      title: result.title,
      productType: result.productType,
      attributesCount: Object.keys(result.attributes).length,
      variationsCount: result.variations.length
    });
    
    return result;
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
    // Preserve Unicode letters/numbers (incl. Hebrew), strip punctuation, collapse spaces -> dashes
    const unicodeSlug = title
      .trim()
      .toLowerCase()
      .normalize('NFKC')
      .replace(/[^\p{L}\p{N}\s-]+/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return unicodeSlug;
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
   * Detect product type (simple vs variable)
   */
  static detectProductType(raw: RawProduct): 'simple' | 'variable' {
    console.log('🔍 DEBUG: detectProductType called with raw product:', {
      hasVariations: !!raw.variations,
      variationsLength: raw.variations?.length || 0,
      hasAttributes: !!raw.attributes,
      attributesKeys: raw.attributes ? Object.keys(raw.attributes) : [],
      attributesValues: raw.attributes ? Object.values(raw.attributes) : []
    });
    
    // If we already have parsed variations (e.g., from WooCommerce JSON), treat as variable
    if (raw.variations && raw.variations.length > 0) {
      console.log('✅ DEBUG: Product type = variable (has parsed variations)');
      return 'variable';
    }
    
    // Don't mark as variable just because of multiple attribute values
    if (raw.attributes && Object.keys(raw.attributes).length > 0) {
      console.log('ℹ️ DEBUG: Product has attributes but no variations - treating as simple');
      return 'simple';
    }
    
    console.log('❌ DEBUG: Product type = simple (no variations or attributes)');
    return 'simple';
  }

  /**
   * Normalize product attributes
   */
  static normalizeAttributes(attributes: Record<string, (string | undefined)[]>): Record<string, string[]> {
    console.log('🔍 DEBUG: normalizeAttributes called with:', attributes);
    const normalized: Record<string, string[]> = {};
    
    for (const [key, values] of Object.entries(attributes)) {
      console.log('🔍 DEBUG: Processing attribute:', key, 'values:', values);
      
      if (!values || values.length === 0) {
        console.log('❌ DEBUG: Skipping empty attribute:', key);
        continue;
      }
      
      const cleanKey = this.cleanAttributeName(key);
      const cleanValues = values
        .filter((value): value is string => value !== undefined)
        .map(value => this.cleanText(value))
        .filter(value => value && !this.isPlaceholder(value));
      
      console.log('🔍 DEBUG: Cleaned attribute:', cleanKey, 'cleanValues:', cleanValues);
      
      if (cleanValues.length > 0) {
        normalized[cleanKey] = cleanValues;
        console.log('✅ DEBUG: Added normalized attribute:', cleanKey, '=', cleanValues);
      } else {
        console.log('❌ DEBUG: No clean values for attribute:', cleanKey);
      }
    }
    
    console.log('🔍 DEBUG: Final normalized attributes:', normalized);
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
    console.log('🔍 DEBUG: Checking if text is placeholder:', text);
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
      'Select model',
      'General',  // Common in WooCommerce
      'בחירת אפשרות',  // Hebrew "Choose option"
      'בחירת אפשרותA - רינבוקורן Lets Go',  // Specific from modanbags.co.il
      'בחירת אפשרותB - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותC - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותD - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותE - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותF - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותG - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותH - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותI - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותJ - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותK - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותL - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותM - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותN - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותO - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותP - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותQ - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותR - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותS - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותT - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותU - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותV - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותW - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותX - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותY - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותZ - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרות0 - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרות1 - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרות2 - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרות3 - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרות4 - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרות5 - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרות6 - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרות7 - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרות8 - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרות9 - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותא - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותב - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותג - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותד - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותה - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותו - ריינבוקורן דמויות כחול',  // Specific from modanbags.co.il
      'בחירת אפשרותA',  // Hebrew with option prefix
      'בחירת אפשרותB',  // Hebrew with option prefix
      'בחירת אפשרותC',  // Hebrew with option prefix
      'בחירת אפשרותD',  // Hebrew with option prefix
      'בחירת אפשרותE',  // Hebrew with option prefix
      'בחירת אפשרותF',  // Hebrew with option prefix
      'בחירת אפשרותG',  // Hebrew with option prefix
      'בחירת אפשרותH',  // Hebrew with option prefix
      'בחירת אפשרותI',  // Hebrew with option prefix
      'בחירת אפשרותJ',  // Hebrew with option prefix
      'בחירת אפשרותK',  // Hebrew with option prefix
      'בחירת אפשרותL',  // Hebrew with option prefix
      'בחירת אפשרותM',  // Hebrew with option prefix
      'בחירת אפשרותN',  // Hebrew with option prefix
      'בחירת אפשרותO',  // Hebrew with option prefix
      'בחירת אפשרותP',  // Hebrew with option prefix
      'בחירת אפשרותQ',  // Hebrew with option prefix
      'בחירת אפשרותR',  // Hebrew with option prefix
      'בחירת אפשרותS',  // Hebrew with option prefix
      'בחירת אפשרותT',  // Hebrew with option prefix
      'בחירת אפשרותU',  // Hebrew with option prefix
      'בחירת אפשרותV',  // Hebrew with option prefix
      'בחירת אפשרותW',  // Hebrew with option prefix
      'בחירת אפשרותX',  // Hebrew with option prefix
      'בחירת אפשרותY',  // Hebrew with option prefix
      'בחירת אפשרותZ',  // Hebrew with option prefix
      'בחירת אפשרות0',  // Hebrew with option prefix
      'בחירת אפשרות1',  // Hebrew with option prefix
      'בחירת אפשרות2',  // Hebrew with option prefix
      'בחירת אפשרות3',  // Hebrew with option prefix
      'בחירת אפשרות4',  // Hebrew with option prefix
      'בחירת אפשרות5',  // Hebrew with option prefix
      'בחירת אפשרות6',  // Hebrew with option prefix
      'בחירת אפשרות7',  // Hebrew with option prefix
      'בחירת אפשרות8',  // Hebrew with option prefix
      'בחירת אפשרות9',  // Hebrew with option prefix
      'בחירת אפשרותא',  // Hebrew with option prefix
      'בחירת אפשרותב',  // Hebrew with option prefix
      'בחירת אפשרותג',  // Hebrew with option prefix
      'בחירת אפשרותד',  // Hebrew with option prefix
      'בחירת אפשרותה',  // Hebrew with option prefix
      'בחירת אפשרותו',  // Hebrew with option prefix
      'בחירת אפשרותז',  // Hebrew with option prefix
      'בחירת אפשרותח',  // Hebrew with option prefix
      'בחירת אפשרותט',  // Hebrew with option prefix
      'בחירת אפשרותי',  // Hebrew with option prefix
      'בחירת אפשרותכ',  // Hebrew with option prefix
      'בחירת אפשרותל',  // Hebrew with option prefix
      'בחירת אפשרותמ',  // Hebrew with option prefix
      'בחירת אפשרותנ',  // Hebrew with option prefix
      'בחירת אפשרותס',  // Hebrew with option prefix
      'בחירת אפשרותע',  // Hebrew with option prefix
      'בחירת אפשרותפ',  // Hebrew with option prefix
      'בחירת אפשרותצ',  // Hebrew with option prefix
      'בחירת אפשרותק',  // Hebrew with option prefix
      'בחירת אפשרותר',  // Hebrew with option prefix
      'בחירת אפשרותש',  // Hebrew with option prefix
      'בחירת אפשרותת',  // Hebrew with option prefix
      'בחירת אפשרותא',  // Hebrew with option prefix
      'בחירת אפשרותב',  // Hebrew with option prefix
      'בחירת אפשרותג',  // Hebrew with option prefix
      'בחירת אפשרותד',  // Hebrew with option prefix
      'בחירת אפשרותה',  // Hebrew with option prefix
      'בחירת אפשרותו',  // Hebrew with option prefix
      'בחירת אפשרותז',  // Hebrew with option prefix
      'בחירת אפשרותח',  // Hebrew with option prefix
      'בחירת אפשרותט',  // Hebrew with option prefix
      'בחירת אפשרותי',  // Hebrew with option prefix
      'בחירת אפשרותכ',  // Hebrew with option prefix
      'בחירת אפשרותל',  // Hebrew with option prefix
      'בחירת אפשרותמ',  // Hebrew with option prefix
      'בחירת אפשרותנ',  // Hebrew with option prefix
      'בחירת אפשרותס',  // Hebrew with option prefix
      'בחירת אפשרותע',  // Hebrew with option prefix
      'בחירת אפשרותפ',  // Hebrew with option prefix
      'בחירת אפשרותצ',  // Hebrew with option prefix
      'בחירת אפשרותק',  // Hebrew with option prefix
      'בחירת אפשרותר',  // Hebrew with option prefix
      'בחירת אפשרותש',  // Hebrew with option prefix
      'בחירת אפשרותת'   // Hebrew with option prefix
    ];
    
    const isPlaceholder = placeholders.some(placeholder => 
      text.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    if (isPlaceholder) {
      console.log('🔍 DEBUG: Detected placeholder text:', text);
    }
    
    return isPlaceholder;
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
