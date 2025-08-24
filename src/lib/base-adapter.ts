import { SiteAdapter, RawProduct, RecipeConfig } from '../types';
import { HttpClient } from './http-client';
import { JSDOM } from 'jsdom';

export abstract class BaseAdapter implements SiteAdapter {
  protected httpClient: HttpClient;
  protected config: RecipeConfig;
  protected baseUrl: string;

  constructor(config: RecipeConfig, baseUrl: string) {
    this.config = config;
    this.baseUrl = baseUrl;
    this.httpClient = new HttpClient();
  }

  /**
   * Abstract method to discover product URLs
   */
  abstract discoverProducts(): AsyncIterable<string>;

  /**
   * Abstract method to extract product data
   */
  abstract extractProduct(url: string): Promise<RawProduct>;

  /**
   * Common method to extract text content using CSS selector
   */
  protected extractText(dom: JSDOM, selector: string): string {
    const element = dom.window.document.querySelector(selector);
    return element?.textContent?.trim() || '';
  }

  /**
   * Common method to extract attribute value
   */
  protected extractAttribute(dom: JSDOM, selector: string, attribute: string): string {
    const element = dom.window.document.querySelector(selector);
    return element?.getAttribute(attribute) || '';
  }

  /**
   * Common method to extract multiple elements
   */
  protected extractElements(dom: JSDOM, selector: string): Element[] {
    return Array.from(dom.window.document.querySelectorAll(selector));
  }

  /**
   * Common method to extract image URLs
   */
  protected extractImages(dom: JSDOM, selector: string): string[] {
    const images = this.extractElements(dom, selector);
    return images
      .map(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src) {
          return this.resolveUrl(src);
        }
        return null;
      })
      .filter((src): src is string => src !== null);
  }

  /**
   * Common method to extract price
   */
  protected extractPrice(dom: JSDOM, selector: string): string {
    const priceText = this.extractText(dom, selector);
    return this.cleanPrice(priceText);
  }

  /**
   * Common method to extract stock status
   */
  protected extractStockStatus(dom: JSDOM, selector: string): string {
    const stockText = this.extractText(dom, selector);
    return this.normalizeStockText(stockText);
  }

  /**
   * Common method to extract attributes
   */
  protected extractAttributes(dom: JSDOM, selector: string): Record<string, string[]> {
    const attributes: Record<string, string[]> = {};
    
    const attributeElements = this.extractElements(dom, selector);
    
    for (const element of attributeElements) {
      const nameElement = element.querySelector('[data-attribute-name], .attribute-name, .attr-name');
      const valueElements = element.querySelectorAll('[data-attribute-value], .attribute-value, .attr-value, option');
      
      if (nameElement && valueElements.length > 0) {
        const name = nameElement.textContent?.trim() || '';
        const values = Array.from(valueElements)
          .map(val => val.textContent?.trim())
          .filter(val => val && val !== 'בחר אפשרות' && val !== 'Select option');
        
        if (name && values.length > 0) {
          attributes[name] = values;
        }
      }
    }
    
    return attributes;
  }

  /**
   * Common method to extract variations
   */
  protected extractVariations(dom: JSDOM, selector: string): any[] {
    const variations: any[] = [];
    const variationElements = this.extractElements(dom, selector);
    
    for (const element of variationElements) {
      const sku = element.querySelector('[data-sku], .sku, .product-sku')?.textContent?.trim();
      const price = element.querySelector('[data-price], .price, .product-price')?.textContent?.trim();
      
      if (sku) {
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
    
    return variations;
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  protected resolveUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    
    if (url.startsWith('/')) {
      const baseUrl = new URL(this.baseUrl);
      return `${baseUrl.protocol}//${baseUrl.host}${url}`;
    }
    
    return `${this.baseUrl}/${url}`;
  }

  /**
   * Clean price text
   */
  protected cleanPrice(priceText: string): string {
    return priceText
      .replace(/[^\d.,]/g, '')
      .replace(',', '.')
      .trim();
  }

  /**
   * Normalize stock text
   */
  protected normalizeStockText(stockText: string): string {
    const text = stockText.toLowerCase();
    
    if (text.includes('out') || text.includes('unavailable') || text.includes('0')) {
      return 'outofstock';
    }
    
    if (text.includes('in') || text.includes('available') || text.includes('stock')) {
      return 'instock';
    }
    
    return 'instock'; // Default to in stock
  }

  /**
   * Extract embedded JSON data
   */
  protected async extractEmbeddedJson(url: string, selectors: string[]): Promise<any[]> {
    return await this.httpClient.extractEmbeddedJson(url, selectors);
  }

  /**
   * Follow pagination
   */
  protected async followPagination(baseUrl: string, pattern: string, nextPageSelector: string): Promise<string[]> {
    const urls: string[] = [];
    let currentUrl = baseUrl;
    let pageCount = 0;
    const maxPages = 100; // Safety limit
    
    while (currentUrl && pageCount < maxPages) {
      try {
        const dom = await this.httpClient.getDom(currentUrl);
        
        // Extract product URLs from current page
        const productUrls = this.extractProductUrls(dom);
        urls.push(...productUrls);
        
        // Find next page
        const nextPageElement = dom.window.document.querySelector(nextPageSelector);
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
      } catch (error) {
        console.error(`Failed to process page ${currentUrl}:`, error);
        break;
      }
    }
    
    return urls;
  }

  /**
   * Extract product URLs from a page
   */
  protected extractProductUrls(dom: JSDOM): string[] {
    // This is a generic implementation - subclasses should override
    const productLinks = dom.window.document.querySelectorAll('a[href*="/product/"], a[href*="/item/"], a[href*="/p/"]');
    return Array.from(productLinks)
      .map(link => link.getAttribute('href'))
      .filter((href): href is string => href !== null)
      .map(href => this.resolveUrl(href));
  }

  /**
   * Apply text transformations
   */
  protected applyTransformations(text: string, transformations: string[]): string {
    let result = text;
    
    for (const transform of transformations) {
      try {
        // Simple regex replacement for now
        // In a real implementation, this could be more sophisticated
        if (transform.includes('->')) {
          const [pattern, replacement] = transform.split('->').map(s => s.trim());
          const regex = new RegExp(pattern, 'g');
          result = result.replace(regex, replacement);
        }
      } catch (error) {
        console.warn(`Failed to apply transformation: ${transform}`, error);
      }
    }
    
    return result;
  }

  /**
   * Get HTTP client instance
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  /**
   * Get configuration
   */
  getConfig(): RecipeConfig {
    return this.config;
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
