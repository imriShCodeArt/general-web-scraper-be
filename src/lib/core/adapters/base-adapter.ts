import { SiteAdapter, RawProduct, RecipeConfig, ValidationError, RawProductData, JsonData } from '../../domain/types';
import { HttpClient } from '../../infrastructure/http/http-client';
import { PuppeteerHttpClient } from '../../infrastructure/http/puppeteer-http-client';
import { JSDOM } from 'jsdom';
import { applyTransforms } from '../../helpers/transforms';
import { resolveUrl as resolveUrlHelper } from '../../helpers/url';
import { getDomWithStrategy, createDomLoaderStrategy } from '../../helpers/dom-loader';
import { parsePrice, extractStockStatus } from '../../helpers/parse';
import { extractJsonFromScriptTags } from '../../helpers/json';
import { ErrorFactory, ErrorCodes } from '../../utils/error-handler';
import { isDebugEnabled } from '../../infrastructure/logging/logger';
import { PerformanceResilience } from '../../utils/performance-resilience';

/**
 * Base adapter class that provides common functionality for all site adapters.
 *
 * This abstract class defines the interface and common behavior for site-specific
 * scraping adapters. It handles HTTP requests, DOM parsing, element extraction,
 * and provides performance optimizations through caching and retry mechanisms.
 *
 * @see {@link ../../../woocommerce_csv_spec.md WooCommerce CSV Import Specification}
 * @see {@link ../services/scraping-service.ts ScrapingService}
 * @see {@link ../../utils/performance-resilience.ts PerformanceResilience}
 *
 * Key features:
 * - HTTP client abstraction (standard and Puppeteer)
 * - DOM parsing and element extraction
 * - Performance optimizations with caching and retry
 * - Error handling and validation
 * - Recipe-based configuration support
 *
 * Subclasses should implement:
 * - `extractProduct()`: Main product extraction logic
 * - `extractImages()`: Image URL extraction
 * - `extractAttributes()`: Product attributes extraction
 * - `extractVariations()`: Product variations extraction
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
   * Common method to extract multiple elements with error handling and performance optimization
   * Phase 8: Enhanced with retry, caching, and tightened selectors
   */
  protected async extractElements(dom: JSDOM, selector: string | string[], scope?: Element): Promise<Element[]> {
    try {
      const selectors = Array.isArray(selector) ? selector : [selector];

      // Use performance resilience utilities for element discovery
      const elements = await PerformanceResilience.discoverElements(dom, selectors, scope, {
        maxAttempts: 2,
        baseDelay: 50,
        maxDelay: 500,
      });

      if (isDebugEnabled() && elements.length > 0) {
        console.log(`🔍 DEBUG[BaseAdapter]: extractElements found ${elements.length} elements with selectors:`, selectors);
      }

      return elements;
    } catch (error) {
      console.warn(`Failed to extract elements from selector '${selector}':`, error);
      return [];
    }
  }

  /**
   * Synchronous version for backward compatibility
   */
  protected extractElementsSync(dom: JSDOM, selector: string): Element[] {
    try {
      return Array.from(dom.window.document.querySelectorAll(selector));
    } catch (error) {
      console.warn(`Failed to extract elements from selector '${selector}':`, error);
      return [];
    }
  }

  /**
   * Common method to extract image URLs with error handling and performance optimization
   * Phase 8: Enhanced with retry, caching, and tightened selectors
   */
  protected async extractImages(dom: JSDOM, selector: string | string[], scope?: Element): Promise<string[]> {
    try {
      const images = await this.extractElements(dom, selector, scope);
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
   * Synchronous version for backward compatibility
   */
  protected extractImagesSync(dom: JSDOM, selector: string): string[] {
    try {
      const images = this.extractElementsSync(dom, selector);
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
      return parsePrice(priceText);
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
      return extractStockStatus(dom, selector);
    } catch (error) {
      console.warn(`Failed to extract stock status from selector '${selector}':`, error);
      return 'instock'; // Default to in stock
    }
  }

  /**
   * Common method to extract attributes with error handling and performance optimization
   * Phase 8: Enhanced with retry, caching, and tightened selectors
   */
  protected async extractAttributes(dom: JSDOM, selector: string | string[], scope?: Element): Promise<Record<string, string[]>> {
    try {
      const attributes: Record<string, string[]> = {};

      const attributeElements = await this.extractElements(dom, selector, scope);

      for (const element of attributeElements) {
        const nameElement = element.querySelector(
          '[data-attribute-name], .attribute-name, .attr-name, .option-name',
        );
        const valueElements = element.querySelectorAll(
          '[data-attribute-value], .attribute-value, .attr-value, .option-value, option',
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
   * Synchronous version for backward compatibility
   */
  protected extractAttributesSync(dom: JSDOM, selector: string): Record<string, string[]> {
    try {
      const attributes: Record<string, string[]> = {};
      const attributeElements = this.extractElementsSync(dom, selector);

      for (const element of attributeElements) {
        const nameElement = element.querySelector(
          '[data-attribute-name], .attribute-name, .attr-name, .option-name',
        );
        const valueElements = element.querySelectorAll(
          '[data-attribute-value], .attribute-value, .attr-value, .option-value, option',
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
   * Common method to extract variations with error handling and performance optimization
   * Phase 8: Enhanced with retry, caching, and tightened selectors
   */
  protected async extractVariations(dom: JSDOM, selector: string | string[], scope?: Element): Promise<RawProductData['variations']> {
    try {
      const variations: RawProductData['variations'] = [];
      const variationElements = await this.extractElements(dom, selector, scope);

      if (isDebugEnabled()) {
        console.log('🔍 DEBUG[BaseAdapter]: extractVariations elements count', variationElements.length);
      }

      for (const element of variationElements) {
        const sku = element.querySelector('[data-sku], .sku, .product-sku')?.textContent?.trim();
        const price = element
          .querySelector('[data-price], .price, .product-price')
          ?.textContent?.trim();

        if (sku) {
          variations.push({
            sku,
            regularPrice: parsePrice(price || ''),
            taxClass: '',
            stockStatus: 'instock',
            images: [],
            attributeAssignments: {},
          });
        }
      }

      if (isDebugEnabled()) {
        console.log('🔍 DEBUG[BaseAdapter]: extracted variations', variations.length);
      }
      return variations;
    } catch (error) {
      console.warn(`Failed to extract variations from selector '${selector}':`, error);
      return [];
    }
  }

  /**
   * Synchronous version for backward compatibility
   */
  protected extractVariationsSync(dom: JSDOM, selector: string): RawProductData['variations'] {
    try {
      const variations: RawProductData['variations'] = [];
      const variationElements = this.extractElementsSync(dom, selector);

      if (isDebugEnabled()) {
        console.log('🔍 DEBUG[BaseAdapter]: extractVariations elements count', variationElements.length);
      }

      for (const element of variationElements) {
        const sku = element.querySelector('[data-sku], .sku, .product-sku')?.textContent?.trim();
        const price = element
          .querySelector('[data-price], .price, .product-price')
          ?.textContent?.trim();

        if (sku) {
          variations.push({
            sku,
            regularPrice: parsePrice(price || ''),
            taxClass: '',
            stockStatus: 'instock',
            images: [],
            attributeAssignments: {},
          });
        }
      }

      if (isDebugEnabled()) {
        console.log('🔍 DEBUG[BaseAdapter]: extracted variations', variations.length);
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
    return resolveUrlHelper(this.baseUrl, url);
  }


  /**
   * Extract embedded JSON data with error handling and proper typing
   */
  protected async extractEmbeddedJson(url: string, selectors: string[]): Promise<JsonData<unknown>[]> {
    try {
      const dom = await this.getDom(url);
      const matchers = selectors.map(selector => ({
        selector,
        attribute: 'textContent',
      }));

      const jsonData = extractJsonFromScriptTags(dom, matchers);
      return Object.entries(jsonData).map(([selector, data]) => ({
        selector,
        data,
        url,
      }));
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
    return applyTransforms(text, transformations);
  }

  /**
   * Get DOM using the appropriate method (JSDOM or Puppeteer) with error handling
   */
  protected async getDom(url: string, options?: { waitForSelectors?: string[] }): Promise<JSDOM> {
    try {
      const strategy = createDomLoaderStrategy(
        this.httpClient,
        this.puppeteerClient || undefined,
        this.config.behavior?.useHeadlessBrowser === true,
      );

      return await getDomWithStrategy(url, {
        httpClient: this.httpClient,
        puppeteerClient: this.puppeteerClient || undefined,
        useHeadless: this.config.behavior?.useHeadlessBrowser === true,
        timeout: 30000,
      }, strategy);
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
