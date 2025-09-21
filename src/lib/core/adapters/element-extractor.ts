import { JSDOM } from 'jsdom';
import { applyTransforms } from '../../helpers/transforms';
import { resolveUrl as resolveUrlHelper } from '../../helpers/url';
import { parsePrice, extractStockStatus } from '../../helpers/parse';
import { isDebugEnabled } from '../../infrastructure/logging/logger';

/**
 * Interface for element extraction operations
 */
export interface IElementExtractor {
  extractText(dom: JSDOM, selector: string): string;
  extractAttribute(dom: JSDOM, selector: string, attribute: string): string;
  extractElements(dom: JSDOM, selector: string | string[], scope?: Element): Promise<Element[]>;
  extractElementsSync(dom: JSDOM, selector: string): Element[];
  extractImages(dom: JSDOM, selector: string | string[], scope?: Element): Promise<string[]>;
  extractImagesSync(dom: JSDOM, selector: string): string[];
  extractPrice(dom: JSDOM, selector: string): string;
  extractStockStatus(dom: JSDOM, selector: string): string;
  extractAttributes(dom: JSDOM, selector: string | string[], scope?: Element): Promise<Record<string, string[]>>;
  extractAttributesSync(dom: JSDOM, selector: string): Record<string, string[]>;
  extractVariations(dom: JSDOM, selector: string | string[], scope?: Element): Promise<any[]>;
  extractVariationsSync(dom: JSDOM, selector: string): any[];
  extractEmbeddedJson(dom: JSDOM, selectors: string[]): Promise<any[]>;
  resolveUrl(url: string, baseUrl: string): string;
  updateBaseUrl(baseUrl: string): void;
}

/**
 * Element extraction service that handles DOM element extraction and data parsing
 */
export class ElementExtractor implements IElementExtractor {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Extract text content from a selector
   */
  extractText(dom: JSDOM, selector: string): string {
    try {
      const element = dom.window.document.querySelector(selector);
      if (!element) {
        return '';
      }

      const text = element.textContent?.trim() || '';
      return applyTransforms(text, this.getTransforms());
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract text from selector '${selector}':`, error);
      }
      return '';
    }
  }

  /**
   * Extract attribute value from a selector
   */
  extractAttribute(dom: JSDOM, selector: string, attribute: string): string {
    try {
      const element = dom.window.document.querySelector(selector);
      if (!element) {
        return '';
      }

      const value = element.getAttribute(attribute) || '';
      return applyTransforms(value, this.getTransforms());
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract attribute '${attribute}' from selector '${selector}':`, error);
      }
      return '';
    }
  }

  /**
   * Extract elements from DOM using selector(s)
   */
  async extractElements(dom: JSDOM, selector: string | string[], scope?: Element): Promise<Element[]> {
    try {
      const selectors = Array.isArray(selector) ? selector : [selector];
      const elements: Element[] = [];

      for (const sel of selectors) {
        const foundElements = scope
          ? Array.from(scope.querySelectorAll(sel))
          : Array.from(dom.window.document.querySelectorAll(sel));
        elements.push(...foundElements);
      }

      if (isDebugEnabled()) {
        console.log(`🔍 DEBUG[ElementExtractor]: extractElements found ${elements.length} elements with selectors:`, selectors);
      }

      return elements;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract elements with selectors '${selector}':`, error);
      }
      return [];
    }
  }

  /**
   * Extract elements synchronously
   */
  extractElementsSync(dom: JSDOM, selector: string): Element[] {
    try {
      const elements = Array.from(dom.window.document.querySelectorAll(selector));
      return elements;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract elements with selector '${selector}':`, error);
      }
      return [];
    }
  }

  /**
   * Extract image URLs from elements
   */
  async extractImages(dom: JSDOM, selector: string | string[], scope?: Element): Promise<string[]> {
    try {
      const images = await this.extractElements(dom, selector, scope);
      const urls: string[] = [];

      for (const img of images) {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
        if (src) {
          const resolvedUrl = this.resolveUrl(src, this.baseUrl);
          urls.push(resolvedUrl);
        }
      }

      return urls;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract images with selectors '${selector}':`, error);
      }
      return [];
    }
  }

  /**
   * Extract image URLs synchronously
   */
  extractImagesSync(dom: JSDOM, selector: string): string[] {
    try {
      const images = this.extractElementsSync(dom, selector);
      const urls: string[] = [];

      for (const img of images) {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
        if (src) {
          const resolvedUrl = this.resolveUrl(src, this.baseUrl);
          urls.push(resolvedUrl);
        }
      }

      return urls;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract images with selector '${selector}':`, error);
      }
      return [];
    }
  }

  /**
   * Extract and parse price from selector
   */
  extractPrice(dom: JSDOM, selector: string): string {
    try {
      const priceText = this.extractText(dom, selector);
      if (!priceText) {
        return '';
      }

      const parsedPrice = parsePrice(priceText);
      return parsedPrice || priceText;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract price from selector '${selector}':`, error);
      }
      return '';
    }
  }

  /**
   * Extract stock status from selector
   */
  extractStockStatus(dom: JSDOM, selector: string): string {
    try {
      return extractStockStatus(dom, selector);
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract stock status from selector '${selector}':`, error);
      }
      return '';
    }
  }

  /**
   * Extract attributes from elements
   */
  async extractAttributes(dom: JSDOM, selector: string | string[], scope?: Element): Promise<Record<string, string[]>> {
    try {
      const attributeElements = await this.extractElements(dom, selector, scope);
      const attributes: Record<string, string[]> = {};

      for (const element of attributeElements) {
        // Extract all data attributes
        for (const attr of element.attributes) {
          if (attr.name.startsWith('data-')) {
            const attrName = attr.name;
            const attrValue = attr.value;

            if (attrValue) {
              if (!attributes[attrName]) {
                attributes[attrName] = [];
              }
              attributes[attrName].push(attrValue);
            }
          }
        }

        // Also check for name/value pairs
        const name = element.getAttribute('name') || element.getAttribute('data-name');
        const value = element.getAttribute('value') || element.textContent?.trim();

        if (name && value) {
          if (!attributes[name]) {
            attributes[name] = [];
          }
          attributes[name].push(value);
        }
      }

      return attributes;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract attributes with selectors '${selector}':`, error);
      }
      return {};
    }
  }

  /**
   * Extract attributes synchronously
   */
  extractAttributesSync(dom: JSDOM, selector: string): Record<string, string[]> {
    try {
      const attributeElements = this.extractElementsSync(dom, selector);
      const attributes: Record<string, string[]> = {};

      for (const element of attributeElements) {
        // Extract all data attributes
        for (const attr of element.attributes) {
          if (attr.name.startsWith('data-')) {
            const attrName = attr.name;
            const attrValue = attr.value;

            if (attrValue) {
              if (!attributes[attrName]) {
                attributes[attrName] = [];
              }
              attributes[attrName].push(attrValue);
            }
          }
        }

        // Also check for name/value pairs
        const name = element.getAttribute('name') || element.getAttribute('data-name');
        const value = element.getAttribute('value') || element.textContent?.trim();

        if (name && value) {
          if (!attributes[name]) {
            attributes[name] = [];
          }
          attributes[name].push(value);
        }
      }

      return attributes;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract attributes with selector '${selector}':`, error);
      }
      return {};
    }
  }

  /**
   * Extract variations from elements
   */
  async extractVariations(dom: JSDOM, selector: string | string[], scope?: Element): Promise<any[]> {
    try {
      const variationElements = await this.extractElements(dom, selector, scope);
      const variations: any[] = [];

      if (isDebugEnabled()) {
        console.log('🔍 DEBUG[ElementExtractor]: extractVariations elements count', variationElements.length);
      }

      for (const element of variationElements) {
        const sku = element.getAttribute('data-sku') || element.querySelector('[data-sku]')?.getAttribute('data-sku');
        const price = element.getAttribute('data-price') || element.querySelector('[data-price]')?.getAttribute('data-price');
        const stockStatus = element.getAttribute('data-stock') || element.querySelector('[data-stock]')?.getAttribute('data-stock');

        if (sku && price) {
          variations.push({
            sku,
            regularPrice: price,
            stockStatus: stockStatus || 'instock',
            attributeAssignments: this.extractVariationAttributes(element),
          });
        }
      }

      return variations;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract variations with selectors '${selector}':`, error);
      }
      return [];
    }
  }

  /**
   * Extract variations synchronously
   */
  extractVariationsSync(dom: JSDOM, selector: string): any[] {
    try {
      const variationElements = this.extractElementsSync(dom, selector);
      const variations: any[] = [];

      if (isDebugEnabled()) {
        console.log('🔍 DEBUG[ElementExtractor]: extractVariations elements count', variationElements.length);
      }

      for (const element of variationElements) {
        const sku = element.getAttribute('data-sku') || element.querySelector('[data-sku]')?.getAttribute('data-sku');
        const price = element.getAttribute('data-price') || element.querySelector('[data-price]')?.getAttribute('data-price');
        const stockStatus = element.getAttribute('data-stock') || element.querySelector('[data-stock]')?.getAttribute('data-stock');

        if (sku && price) {
          variations.push({
            sku,
            regularPrice: price,
            stockStatus: stockStatus || 'instock',
            attributeAssignments: this.extractVariationAttributes(element),
          });
        }
      }

      return variations;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract variations with selector '${selector}':`, error);
      }
      return [];
    }
  }

  /**
   * Extract embedded JSON from script tags
   */
  async extractEmbeddedJson(dom: JSDOM, selectors: string[]): Promise<any[]> {
    try {
      const results: any[] = [];

      for (const selector of selectors) {
        const elements = dom.window.document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent?.trim();
          if (text) {
            try {
              const jsonData = JSON.parse(text);
              results.push(jsonData);
            } catch (parseError) {
              if (isDebugEnabled()) {
                console.warn(`Failed to parse JSON from selector '${selector}':`, parseError);
              }
            }
          }
        }
      }

      return results;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn(`Failed to extract embedded JSON with selectors '${selectors}':`, error);
      }
      return [];
    }
  }

  /**
   * Resolve URL relative to base URL
   */
  resolveUrl(url: string, baseUrl: string): string {
    return resolveUrlHelper(baseUrl, url);
  }

  /**
   * Extract variation attributes from element
   */
  private extractVariationAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attributeElements = element.querySelectorAll('[data-attribute]');

    for (const attrElement of attributeElements) {
      const name = attrElement.getAttribute('data-attribute');
      const value = attrElement.getAttribute('data-value') || attrElement.textContent?.trim();

      if (name && value) {
        attributes[name] = value;
      }
    }

    return attributes;
  }

  /**
   * Get transforms from configuration
   */
  private getTransforms(): any[] {
    // This would be injected from the adapter configuration
    // For now, return empty array
    return [];
  }

  /**
   * Update base URL
   */
  updateBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }
}
