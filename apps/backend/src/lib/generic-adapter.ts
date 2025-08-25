import { BaseAdapter } from './base-adapter';
import { RecipeConfig, RawProduct, RawVariation } from '../types';
import { JSDOM } from 'jsdom';

export class GenericAdapter extends BaseAdapter {
  constructor(config: RecipeConfig, baseUrl: string) {
    super(config, baseUrl);
  }

  /**
   * Discover product URLs using the recipe configuration
   */
  async *discoverProducts(): AsyncIterable<string> {
    const { productLinks, pagination } = this.config.selectors;
    
    if (!productLinks) {
      throw new Error('Product links selector not configured in recipe');
    }

    let currentUrl = this.baseUrl;
    let pageCount = 0;
    const maxPages = pagination?.maxPages || 100;

    while (currentUrl && pageCount < maxPages) {
      try {
        const dom = await this.getDom(currentUrl);
        
        // Extract product URLs from current page
        const productUrls = this.extractProductUrlsWithSelector(dom, productLinks);
        
        for (const url of productUrls) {
          yield url;
        }

        // Follow pagination if configured
        if (pagination?.nextPage) {
          const nextPageElement = dom.window.document.querySelector(pagination.nextPage);
          if (nextPageElement) {
            const nextPageUrl = nextPageElement.getAttribute('href');
            if (nextPageUrl) {
              currentUrl = this.resolveUrl(nextPageUrl);
              pageCount++;
            } else {
              break;
            }
          } else {
            break;
          }
        } else {
          break;
        }
      } catch (error) {
        console.error(`Failed to process page ${currentUrl}:`, error);
        break;
      }
    }
  }

  /**
   * Extract product data using the recipe configuration
   */
  async extractProduct(url: string): Promise<RawProduct> {
    // Get waitForSelectors from behavior if configured
    const waitForSelectors = this.config.behavior?.waitForSelectors;
    
    const dom = await this.getDom(url, waitForSelectors ? { waitForSelectors } : {});
    const { selectors, transforms, fallbacks } = this.config;

    // Extract core product data
    const product: RawProduct = {
      title: this.extractWithFallbacks(dom, selectors.title, fallbacks?.title),
      sku: this.extractWithFallbacks(dom, selectors.sku, fallbacks?.sku),
      description: this.extractWithFallbacks(dom, selectors.description, fallbacks?.description),
      shortDescription: selectors.shortDescription ? this.extractWithFallbacks(dom, selectors.shortDescription) : undefined,
      stockStatus: this.extractStockStatus(dom, selectors.stock),
      images: this.extractImages(dom, selectors.images),
      category: selectors.category ? this.extractWithFallbacks(dom, selectors.category) : undefined,
      attributes: this.extractAttributes(dom, selectors.attributes),
      variations: selectors.variations ? this.extractVariations(dom, selectors.variations) : [],
    };

    // Apply transformations
    if (transforms) {
      if (transforms.title && product.title) {
        product.title = this.applyTransformations(product.title, transforms.title);
      }
      if (transforms.price && product.variations) {
        product.variations = product.variations.map(variation => ({
          ...variation,
          regularPrice: this.applyTransformations(variation.regularPrice || '', transforms.price!)
        }));
      }
      if (transforms.description && product.description) {
        product.description = this.applyTransformations(product.description, transforms.description);
      }
      if (transforms.attributes && product.attributes) {
        product.attributes = this.applyAttributeTransformations(product.attributes, transforms.attributes);
      }
    }

    // Extract embedded JSON data if configured
    if (selectors.embeddedJson && selectors.embeddedJson.length > 0) {
      const embeddedData = await this.extractEmbeddedJson(url, selectors.embeddedJson);
      if (embeddedData.length > 0) {
        // Merge embedded data with extracted data
        this.mergeEmbeddedData(product, embeddedData);
      }
    }

    return product;
  }

  /**
   * Extract data with fallback selectors
   */
  protected extractWithFallbacks(dom: JSDOM, selectors: string | string[], fallbacks?: string[]): string {
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    
    // Try primary selectors first
    for (const selector of selectorArray) {
      const result = this.extractText(dom, selector);
      if (result) {
        return result;
      }
    }

    // Try fallback selectors if available
    if (fallbacks) {
      for (const fallback of fallbacks) {
        const result = this.extractText(dom, fallback);
        if (result) {
          return result;
        }
      }
    }

    return '';
  }

  /**
   * Extract product URLs using the configured selector
   */
  protected extractProductUrlsWithSelector(dom: JSDOM, selector: string | string[]): string[] {
    const selectorArray = Array.isArray(selector) ? selector : [selector];
    const urls: string[] = [];

    for (const sel of selectorArray) {
      const links = dom.window.document.querySelectorAll(sel);
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href) {
          urls.push(this.resolveUrl(href));
        }
      }
      if (urls.length > 0) break; // Use first successful selector
    }

    return urls;
  }

  /**
   * Extract images using the configured selector
   */
  protected extractImages(dom: JSDOM, selector: string | string[]): string[] {
    const selectorArray = Array.isArray(selector) ? selector : [selector];
    
    for (const sel of selectorArray) {
      const images = this.extractElements(dom, sel);
      if (images.length > 0) {
        return images
          .map(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
            if (src) {
              return this.resolveUrl(src);
            }
            return null;
          })
          .filter((src): src is string => src !== null);
      }
    }

    return [];
  }

  /**
   * Extract stock status using the configured selector
   */
  protected extractStockStatus(dom: JSDOM, selector: string | string[]): string {
    const selectorArray = Array.isArray(selector) ? selector : [selector];
    
    for (const sel of selectorArray) {
      const stockText = this.extractText(dom, sel);
      if (stockText) {
        return this.normalizeStockText(stockText);
      }
    }

    return 'instock'; // Default
  }

  /**
   * Extract attributes using the configured selector
   */
  protected extractAttributes(dom: JSDOM, selector: string | string[]): Record<string, string[]> {
    const selectorArray = Array.isArray(selector) ? selector : [selector];
    const attributes: Record<string, string[]> = {};
    
    for (const sel of selectorArray) {
      const attributeElements = this.extractElements(dom, sel);
      
      if (attributeElements.length > 0) {
        for (const element of attributeElements) {
          const nameElement = element.querySelector('[data-attribute-name], .attribute-name, .attr-name, .option-name');
          const valueElements = element.querySelectorAll('[data-attribute-value], .attribute-value, .attr-value, option, .option-value');
          
          if (nameElement && valueElements.length > 0) {
            const name = nameElement.textContent?.trim() || '';
            const values = Array.from(valueElements)
              .map(val => (val as Element).textContent?.trim())
              .filter((val): val is string => val !== undefined && !this.isPlaceholderValue(val));
            
            if (name && values.length > 0) {
              attributes[name] = values;
            }
          }
        }
        break; // Use first successful selector
      }
    }
    
    return attributes;
  }

  /**
   * Extract variations using the configured selector - improved for WooCommerce
   */
  protected extractVariations(dom: JSDOM, selector?: string | string[]): RawVariation[] {
    if (!selector) return [];
    
    const selectorArray = Array.isArray(selector) ? selector : [selector];
    const variations: RawVariation[] = [];
    
    // First, try to extract variations from variation forms (WooCommerce style)
    for (const sel of selectorArray) {
      const variationElements = this.extractElements(dom, sel);
      
      if (variationElements.length > 0) {
        console.log(`🔍 DEBUG: Found ${variationElements.length} variation elements with selector: ${sel}`);
        
        for (const element of variationElements) {
          // Look for variation options in select elements
          const selectElements = element.querySelectorAll('select[name*="attribute"], select[class*="variation"], select[class*="attribute"]');
          
          if (selectElements.length > 0) {
            console.log(`🔍 DEBUG: Found ${selectElements.length} variation select elements`);
            
            // Extract options from each select
            for (const select of selectElements) {
              const options = select.querySelectorAll('option[value]:not([value=""])');
              const attributeName = select.getAttribute('name') || select.getAttribute('data-attribute') || 'Unknown';
              
              console.log(`🔍 DEBUG: Found ${options.length} options for attribute: ${attributeName}`);
              
              for (const option of options) {
                const value = option.getAttribute('value');
                const text = option.textContent?.trim();
                
                if (value && text && !this.isPlaceholderValue(text)) {
                  // Create a variation for each option
                  const baseSku = this.extractText(dom, '.sku, [data-sku], .product-sku') || 'SKU';
                  const sku = `${baseSku}-${value}`;
                  
                  variations.push({
                    sku,
                    regularPrice: this.extractText(dom, '.price, [data-price], .product-price') || '',
                    taxClass: '',
                    stockStatus: 'instock',
                    images: [],
                    attributeAssignments: {
                      [attributeName]: value
                    },
                  });
                }
              }
            }
          }
          
          // Also try traditional variation extraction
          const sku = element.querySelector('[data-sku], .sku, .product-sku')?.textContent?.trim();
          const price = element.querySelector('[data-price], .price, .product-price')?.textContent?.trim();
          
          if (sku && !variations.some(v => v.sku === sku)) {
            variations.push({
              sku,
              regularPrice: this.cleanPrice(price || ''),
              taxClass: '',
              stockStatus: 'instock',
              images: [],
              attributeAssignments: {},
            });
          }
        }
        break; // Use first successful selector
      }
    }
    
    console.log(`🔍 DEBUG: Extracted ${variations.length} variations total`);
    return variations;
  }

  /**
   * Check if a value is a placeholder
   */
  protected isPlaceholderValue(value: string): boolean {
    const placeholders = [
      'בחר אפשרות', 'בחירת אפשרות', 'Select option', 'Choose option',
      'בחר גודל', 'בחר צבע', 'Choose size', 'Choose color',
      'בחר', 'Choose', 'בחרו', 'בחרי'
    ];
    return placeholders.some(placeholder => 
      value.toLowerCase().includes(placeholder.toLowerCase())
    );
  }

  /**
   * Wait for selectors to be present in the DOM
   */
  protected async waitForSelectors(dom: JSDOM, selectors: string[]): Promise<void> {
    // Simple implementation - in a real scenario, you might want to use a proper wait mechanism
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const allPresent = selectors.every(selector => 
        dom.window.document.querySelector(selector)
      );
      
      if (allPresent) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }

  /**
   * Apply transformations to text
   */
  protected applyTransformations(text: string, transformations: string[]): string {
    let result = text;
    
    for (const transform of transformations) {
      try {
        if (transform.includes('->')) {
          const [pattern, replacement] = transform.split('->').map(s => s.trim());
          if (pattern && replacement) {
            const regex = new RegExp(pattern, 'g');
            result = result.replace(regex, replacement);
          }
        } else if (transform.startsWith('trim:')) {
          const chars = transform.substring(5);
          result = result.trim();
          if (chars) {
            result = result.replace(new RegExp(`^[${chars}]+|[${chars}]+$`, 'g'), '');
          }
        } else if (transform.startsWith('replace:')) {
          const [search, replace] = transform.substring(8).split('|');
          if (search && replace) {
            result = result.replace(new RegExp(search, 'g'), replace);
          }
        }
      } catch (error) {
        console.warn(`Failed to apply transformation: ${transform}`, error);
      }
    }
    
    return result;
  }

  /**
   * Apply transformations to attributes
   */
  protected applyAttributeTransformations(
    attributes: Record<string, string[]>, 
    transformations: Record<string, string[]>
  ): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    
    for (const [attrName, attrValues] of Object.entries(attributes)) {
      const transforms = transformations[attrName];
      if (transforms) {
        result[attrName] = attrValues.map(value => 
          this.applyTransformations(value, transforms)
        );
      } else {
        result[attrName] = attrValues;
      }
    }
    
    return result;
  }

  /**
   * Merge embedded JSON data with extracted data
   */
  protected mergeEmbeddedData(product: RawProduct, embeddedData: any[]): void {
    // This is a basic implementation - you might want to make this more sophisticated
    for (const data of embeddedData) {
      if (data.name && !product.title) {
        product.title = data.name;
      }
      if (data.description && !product.description) {
        product.description = data.description;
      }
      if (data.sku && !product.sku) {
        product.sku = data.sku;
      }
              if (data.price && product.variations && product.variations.length > 0) {
          const firstVariation = product.variations[0];
          if (firstVariation) {
            firstVariation.regularPrice = data.price.toString();
          }
        }
    }
  }
}
