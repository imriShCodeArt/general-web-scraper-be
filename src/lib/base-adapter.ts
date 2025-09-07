import { SiteAdapter, RawProduct, RecipeConfig, ValidationError } from '../types';
import { HttpClient } from './http-client';
import { PuppeteerHttpClient } from './puppeteer-http-client';
import { JSDOM } from 'jsdom';
import { ErrorFactory, ErrorCodes } from './error-handler';
import { RawProductData, JsonData } from '../types';

/**
 * Base adapter class that provides common functionality for all site adapters
 */
export abstract class BaseAdapter implements SiteAdapter<RawProduct> {
  protected httpClient: HttpClient;
  protected puppeteerClient: PuppeteerHttpClient | null = null;
  protected config: RecipeConfig;
  protected baseUrl: string;
  protected usePuppeteer: boolean;

  constructor(config: RecipeConfig, baseUrl: string) {
    this.config = config;
    this.baseUrl = baseUrl;
    this.httpClient = new HttpClient();
    this.usePuppeteer = config.behavior?.useHeadlessBrowser === true;

    // Initialize Puppeteer if needed
    if (this.usePuppeteer) {
      this.puppeteerClient = new PuppeteerHttpClient();
    }
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
   * Get configuration
   */
  getConfig(): RecipeConfig {
    return this.config;
  }

  /**
   * Validate a product using recipe validation rules with proper generic constraints
   */
  validateProduct(product: RawProduct): ValidationError[] {
    const errors: ValidationError[] = [];
    const validation = this.config.validation;

    if (!validation) {
      return errors;
    }

    // Required fields validation
    if (validation.requiredFields) {
      for (const field of validation.requiredFields) {
        const value = (product as unknown as Record<string, unknown>)[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push({
            field,
            value,
            expected: 'non-empty value',
            message: `Required field '${field}' is missing or empty`,
          } as ValidationError);
        }
      }
    }

    // Price format validation
    if (validation.priceFormat && product.price) {
      const priceRegex = new RegExp(validation.priceFormat);
      if (!priceRegex.test(product.price)) {
        errors.push({
          field: 'price',
          value: product.price,
          expected: `format matching ${validation.priceFormat}`,
          message: `Price format validation failed for '${product.price}'`,
        } as ValidationError);
      }
    }

    // SKU format validation
    if (validation.skuFormat && product.sku) {
      const skuRegex = new RegExp(validation.skuFormat);
      if (!skuRegex.test(product.sku)) {
        errors.push({
          field: 'sku',
          value: product.sku,
          expected: `format matching ${validation.skuFormat}`,
          message: `SKU format validation failed for '${product.sku}'`,
        } as ValidationError);
      }
    }

    // Description length validation
    if (validation.minDescriptionLength && product.description) {
      if (product.description.length < validation.minDescriptionLength) {
        errors.push({
          field: 'description',
          value: product.description.length,
          expected: `at least ${validation.minDescriptionLength} characters`,
          message: `Description is too short: ${product.description.length} characters`,
        } as ValidationError);
      }
    }

    // Title length validation
    if (validation.maxTitleLength && product.title) {
      if (product.title.length > validation.maxTitleLength) {
        errors.push({
          field: 'title',
          value: product.title.length,
          expected: `at most ${validation.maxTitleLength} characters`,
          message: `Title is too long: ${product.title.length} characters`,
        } as ValidationError);
      }
    }

    return errors;
  }

  /**
   * Common method to extract text content using CSS selector with error handling
   */
  protected extractText(dom: JSDOM, selector: string): string {
    try {
      const element = dom.window.document.querySelector(selector);
      if (!element) {
        return '';
      }

      // For description fields, try to get all text content including multiple paragraphs
      if (
        selector.includes('description') ||
        selector.includes('content') ||
        selector.includes('p')
      ) {
        // Get all text nodes and paragraph content
        const textContent = element.textContent?.trim() || '';
        const innerHTML = element.innerHTML || '';

        // If we have HTML content, try to extract meaningful text
        if (innerHTML.includes('<p>') || innerHTML.includes('<br>')) {
          // Extract text from paragraphs and line breaks
          const paragraphs = element.querySelectorAll('p, br + *, div');
          if (paragraphs.length > 0) {
            const paragraphTexts = Array.from(paragraphs)
              .map((p) => p.textContent?.trim())
              .filter((text) => text && text.length > 10) // Filter out very short text
              .join('\n\n');

            if (paragraphTexts) {
              return paragraphTexts;
            }
          }
        }

        return textContent;
      }

      return element.textContent?.trim() || '';
    } catch (error) {
      console.warn(`Failed to extract text from selector '${selector}':`, error);
      return '';
    }
  }

  /**
   * Common method to extract attribute value with error handling
   */
  protected extractAttribute(dom: JSDOM, selector: string, attribute: string): string {
    try {
      const element = dom.window.document.querySelector(selector);
      return element?.getAttribute(attribute) || '';
    } catch (error) {
      console.warn(
        `Failed to extract attribute '${attribute}' from selector '${selector}':`,
        error,
      );
      return '';
    }
  }

  /**
   * Common method to extract multiple elements with error handling
   */
  protected extractElements(dom: JSDOM, selector: string): Element[] {
    try {
      return Array.from(dom.window.document.querySelectorAll(selector));
    } catch (error) {
      console.warn(`Failed to extract elements from selector '${selector}':`, error);
      return [];
    }
  }

  /**
   * Common method to extract image URLs with error handling
   */
  protected extractImages(dom: JSDOM, selector: string): string[] {
    try {
      const images = this.extractElements(dom, selector);
      return images
        .map((img) => {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          if (src) {
            return this.resolveUrl(src);
          }
          return null;
        })
        .filter((src): src is string => src !== null);
    } catch (error) {
      console.warn(`Failed to extract images from selector '${selector}':`, error);
      return [];
    }
  }

  /**
   * Common method to extract price with error handling
   */
  protected extractPrice(dom: JSDOM, selector: string): string {
    try {
      const priceText = this.extractText(dom, selector);
      return this.cleanPrice(priceText);
    } catch (error) {
      console.warn(`Failed to extract price from selector '${selector}':`, error);
      return '';
    }
  }

  /**
   * Common method to extract stock status with error handling
   */
  protected extractStockStatus(dom: JSDOM, selector: string): string {
    try {
      const stockText = this.extractText(dom, selector);
      return this.normalizeStockText(stockText);
    } catch (error) {
      console.warn(`Failed to extract stock status from selector '${selector}':`, error);
      return 'instock'; // Default to in stock
    }
  }

  /**
   * Common method to extract attributes with error handling
   */
  protected extractAttributes(dom: JSDOM, selector: string): Record<string, string[]> {
    try {
      const attributes: Record<string, string[]> = {};

      const attributeElements = this.extractElements(dom, selector);

      for (const element of attributeElements) {
        const nameElement = element.querySelector(
          '[data-attribute-name], .attribute-name, .attr-name',
        );
        const valueElements = element.querySelectorAll(
          '[data-attribute-value], .attribute-value, .attr-value, option',
        );

        if (nameElement && valueElements.length > 0) {
          const name = nameElement.textContent?.trim() || '';
          const values = Array.from(valueElements)
            .map((val) => val.textContent?.trim())
            .filter((val) => val && val !== 'בחר אפשרות' && val !== 'Select option');

          if (name && values.length > 0) {
            attributes[name] = values;
          }
        }
      }

      return attributes;
    } catch (error) {
      console.warn(`Failed to extract attributes from selector '${selector}':`, error);
      return {};
    }
  }

  /**
   * Common method to extract variations with error handling and proper typing
   */
  protected extractVariations(dom: JSDOM, selector: string): RawProductData['variations'] {
    try {
      const variations: RawProductData['variations'] = [];
      const variationElements = this.extractElements(dom, selector);

      for (const element of variationElements) {
        const sku = element.querySelector('[data-sku], .sku, .product-sku')?.textContent?.trim();
        const price = element
          .querySelector('[data-price], .price, .product-price')
          ?.textContent?.trim();

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
    } catch (error) {
      console.warn(`Failed to extract variations from selector '${selector}':`, error);
      return [];
    }
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  protected resolveUrl(url: string): string {
    try {
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
    } catch (error) {
      console.warn(`Failed to resolve URL '${url}':`, error);
      return url;
    }
  }

  /**
   * Clean price text
   */
  protected cleanPrice(priceText: string): string {
    try {
      return priceText
        .replace(/[^\d.,]/g, '')
        .replace(',', '.')
        .trim();
    } catch (error) {
      console.warn(`Failed to clean price text '${priceText}':`, error);
      return '';
    }
  }

  /**
   * Normalize stock text
   */
  protected normalizeStockText(stockText: string): string {
    try {
      const text = stockText.toLowerCase();

      if (text.includes('out') || text.includes('unavailable') || text.includes('0')) {
        return 'outofstock';
      }

      if (text.includes('in') || text.includes('available') || text.includes('stock')) {
        return 'instock';
      }

      return 'instock'; // Default to in stock
    } catch (error) {
      console.warn(`Failed to normalize stock text '${stockText}':`, error);
      return 'instock';
    }
  }

  /**
   * Extract embedded JSON data with error handling and proper typing
   */
  protected async extractEmbeddedJson(url: string, selectors: string[]): Promise<JsonData<unknown>[]> {
    try {
      return await this.httpClient.extractEmbeddedJson(url, selectors);
    } catch (error) {
      console.warn(`Failed to extract embedded JSON from '${url}':`, error);
      return [];
    }
  }

  /**
   * Follow pagination with error handling and retry
   */
  protected async followPagination(
    baseUrl: string,
    pattern: string,
    nextPageSelector: string,
  ): Promise<string[]> {
    const urls: string[] = [];
    let currentUrl = baseUrl;
    let pageCount = 0;
    const maxPages = 100; // Safety limit - could be configurable in future

    while (currentUrl && pageCount < maxPages) {
      try {
        const dom = await this.getDom(currentUrl);

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
   * Extract product URLs from a page (generic implementation)
   */
  protected extractProductUrls(dom: JSDOM): string[] {
    try {
      // This is a generic implementation - subclasses should override
      const productLinks = dom.window.document.querySelectorAll(
        'a[href*="/product/"], a[href*="/item/"], a[href*="/item/"], a[href*="/p/"]',
      );
      return Array.from(productLinks)
        .map((link) => link.getAttribute('href'))
        .filter((href): href is string => href !== null)
        .map((href) => this.resolveUrl(href));
    } catch (error) {
      console.warn('Failed to extract product URLs:', error);
      return [];
    }
  }

  /**
   * Apply text transformations with error handling
   */
  protected applyTransformations(text: string, transformations: string[]): string {
    let result = text;

    for (const transform of transformations) {
      try {
        // Simple regex replacement for now
        // In a real implementation, this could be more sophisticated
        if (transform.includes('->')) {
          const [pattern, replacement] = transform.split('->').map((s) => s.trim());
          if (pattern && replacement) {
            const regex = new RegExp(pattern, 'g');
            result = result.replace(regex, replacement);
          }
        }
      } catch (error) {
        console.warn(`Failed to apply transformation: ${transform}`, error);
      }
    }

    return result;
  }

  /**
   * Get DOM using the appropriate method (JSDOM or Puppeteer) with error handling
   */
  protected async getDom(url: string, options?: { waitForSelectors?: string[] }): Promise<JSDOM> {
    try {
      // Smart Puppeteer usage: use it when explicitly enabled in recipe
      const needsJavaScript = this.config.behavior?.useHeadlessBrowser === true;

      if (needsJavaScript && this.puppeteerClient) {
        try {
          console.log('🔍 DEBUG: Using Puppeteer for JavaScript execution:', url);
          return await this.puppeteerClient.getDom(url, options);
        } catch (error) {
          console.warn('❌ DEBUG: Puppeteer failed, falling back to JSDOM:', error);
          return await this.httpClient.getDom(url);
        }
      } else {
        console.log('🔍 DEBUG: Using JSDOM (faster, no JavaScript execution):', url);
        return await this.httpClient.getDom(url);
      }
    } catch (error) {
      throw ErrorFactory.createScrapingError(
        `Failed to get DOM for ${url}: ${error}`,
        ErrorCodes.NETWORK_ERROR,
        true,
        { url, options },
      );
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.puppeteerClient) {
        await this.puppeteerClient.close();
      }
    } catch (error) {
      console.warn('Failed to cleanup Puppeteer client:', error);
    }
  }

  /**
   * Get HTTP client instance
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
