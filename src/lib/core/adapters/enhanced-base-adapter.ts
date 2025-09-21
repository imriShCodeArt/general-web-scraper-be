import {
  SiteAdapter,
  RecipeConfig,
  ValidationError,
  RawProductData,
  JsonData,
} from '../../domain/types';
import { HttpClient } from '../../infrastructure/http/http-client';
import { PuppeteerHttpClient } from '../../infrastructure/http/puppeteer-http-client';
import { JSDOM } from 'jsdom';
import { ProductValidator, IProductValidator } from './product-validator';
import { ElementExtractor, IElementExtractor } from './element-extractor';
import { DataTransformer, IDataTransformer } from './data-transformer';
import { getDomWithStrategy, createDomLoaderStrategy } from '../../helpers/dom-loader';
import { extractJsonFromScriptTags } from '../../helpers/json';

/**
 * Refactored Enhanced Base Adapter that uses extracted components for better modularity
 */
export abstract class EnhancedBaseAdapter<T extends RawProductData = RawProductData>
implements SiteAdapter<T>
{
  protected httpClient: HttpClient;
  protected puppeteerClient: PuppeteerHttpClient | null = null;
  protected config: RecipeConfig;
  protected baseUrl: string;
  protected usePuppeteer: boolean;

  // Extracted services
  protected productValidator: IProductValidator;
  protected elementExtractor: IElementExtractor;
  protected dataTransformer: IDataTransformer;

  constructor(config: RecipeConfig, baseUrl: string) {
    this.config = config;
    this.baseUrl = baseUrl;
    this.httpClient = new HttpClient();
    this.usePuppeteer = config.behavior?.useHeadlessBrowser === true;

    // Initialize Puppeteer if needed
    if (this.usePuppeteer) {
      this.puppeteerClient = new PuppeteerHttpClient();
    }

    // Initialize extracted services
    this.productValidator = new ProductValidator(config);
    this.elementExtractor = new ElementExtractor(baseUrl);
    this.dataTransformer = new DataTransformer();
  }

  /**
   * Abstract method to discover product URLs
   */
  abstract discoverProducts(): AsyncIterable<string>;

  /**
   * Abstract method to extract product data
   */
  abstract extractProduct(url: string): Promise<T>;

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

  /**
   * Get HTTP client
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  /**
   * Validate a product using the extracted ProductValidator
   */
  validateProduct(product: T): ValidationError[] {
    return this.productValidator.validateProduct(product as any);
  }

  /**
   * Extract text content from a selector using ElementExtractor
   */
  protected extractText(dom: JSDOM, selector: string): string {
    return this.elementExtractor.extractText(dom, selector);
  }

  /**
   * Extract attribute value from a selector using ElementExtractor
   */
  protected extractAttribute(dom: JSDOM, selector: string, attribute: string): string {
    return this.elementExtractor.extractAttribute(dom, selector, attribute);
  }

  /**
   * Extract elements from DOM using ElementExtractor
   */
  protected async extractElements(dom: JSDOM, selector: string | string[], scope?: Element): Promise<Element[]> {
    return this.elementExtractor.extractElements(dom, selector, scope);
  }

  /**
   * Extract elements synchronously using ElementExtractor
   */
  protected extractElementsSync(dom: JSDOM, selector: string): Element[] {
    return this.elementExtractor.extractElementsSync(dom, selector);
  }

  /**
   * Extract image URLs using ElementExtractor (synchronous)
   */
  protected extractImagesSync(dom: JSDOM, selector: string): string[] {
    return this.elementExtractor.extractImagesSync(dom, selector);
  }

  /**
   * Extract image URLs using ElementExtractor (asynchronous)
   */
  protected async extractImages(dom: JSDOM, selector: string | string[], scope?: Element): Promise<string[]> {
    return this.elementExtractor.extractImages(dom, selector, scope);
  }


  /**
   * Extract and parse price using ElementExtractor
   */
  protected extractPrice(dom: JSDOM, selector: string): string {
    return this.elementExtractor.extractPrice(dom, selector);
  }

  /**
   * Extract stock status using ElementExtractor
   */
  protected extractStockStatus(dom: JSDOM, selector: string): string {
    return this.elementExtractor.extractStockStatus(dom, selector);
  }

  /**
   * Extract attributes using ElementExtractor
   */
  protected async extractAttributes(dom: JSDOM, selector: string | string[], scope?: Element): Promise<Record<string, string[]>> {
    return this.elementExtractor.extractAttributes(dom, selector, scope);
  }

  /**
   * Extract attributes synchronously using ElementExtractor
   */
  protected extractAttributesSync(dom: JSDOM, selector: string): Record<string, string[]> {
    return this.elementExtractor.extractAttributesSync(dom, selector);
  }

  /**
   * Extract variations using ElementExtractor
   */
  protected async extractVariations(dom: JSDOM, selector: string | string[], scope?: Element): Promise<RawProductData['variations']> {
    return this.elementExtractor.extractVariations(dom, selector, scope);
  }

  /**
   * Extract variations synchronously using ElementExtractor
   */
  protected extractVariationsSync(dom: JSDOM, selector: string): RawProductData['variations'] {
    return this.elementExtractor.extractVariationsSync(dom, selector);
  }

  /**
   * Extract embedded JSON using ElementExtractor
   */
  protected async extractEmbeddedJson(dom: JSDOM, selectors: string[]): Promise<JsonData[]> {
    return this.elementExtractor.extractEmbeddedJson(dom, selectors);
  }

  /**
   * Resolve URL using ElementExtractor
   */
  protected resolveUrl(url: string, baseUrl?: string): string {
    return this.elementExtractor.resolveUrl(url, baseUrl || this.baseUrl);
  }

  /**
   * Transform product data using DataTransformer
   */
  protected transformProduct(product: RawProductData): any {
    return this.dataTransformer.transformProduct(product);
  }

  /**
   * Transform text using DataTransformer
   */
  protected transformText(text: string, transforms?: any[]): string {
    return this.dataTransformer.transformText(text, transforms);
  }

  /**
   * Transform attributes using DataTransformer
   */
  protected transformAttributes(attributes: Record<string, (string | undefined)[]>): Record<string, (string | undefined)[]> {
    return this.dataTransformer.transformAttributes(attributes);
  }

  /**
   * Transform images using DataTransformer
   */
  protected transformImages(images: (string | undefined)[]): (string | undefined)[] {
    return this.dataTransformer.transformImages(images);
  }

  /**
   * Transform price using DataTransformer
   */
  protected transformPrice(price: string): string {
    return this.dataTransformer.transformPrice(price);
  }

  /**
   * Transform stock status using DataTransformer
   */
  protected transformStockStatus(stockStatus: string): string {
    return this.dataTransformer.transformStockStatus(stockStatus);
  }

  /**
   * Transform variations using DataTransformer
   */
  protected transformVariations(variations: RawProductData['variations']): any[] {
    return this.dataTransformer.transformVariations(variations);
  }

  /**
   * Clean price using DataTransformer
   */
  protected cleanPrice(price: string): string {
    return this.dataTransformer.cleanPrice(price);
  }

  /**
   * Normalize stock text using DataTransformer
   */
  protected normalizeStockText(stockText: string): string {
    return this.dataTransformer.normalizeStockText(stockText);
  }

  /**
   * Get DOM using the dom-loader strategy
   */
  protected async getDom(url: string): Promise<JSDOM> {
    try {
      const strategy = createDomLoaderStrategy(this.httpClient, this.puppeteerClient || undefined, this.usePuppeteer);
      return await getDomWithStrategy(url, {
        httpClient: this.httpClient,
        puppeteerClient: this.puppeteerClient || undefined,
        useHeadless: this.usePuppeteer,
      }, strategy);
    } catch (error) {
      throw new Error('Failed to get DOM');
    }
  }

  /**
   * Get DOM with fallback
   */
  protected async getDomFallback(url: string): Promise<JSDOM> {
    try {
      return await this.getDom(url);
    } catch (error) {
      // Fallback to HTTP client if Puppeteer fails
      if (this.usePuppeteer && this.puppeteerClient) {
        try {
          return await this.httpClient.getDom(url);
        } catch (fallbackError) {
          throw new Error(`Both Puppeteer and HTTP client failed: ${error}, ${fallbackError}`);
        }
      }
      throw error;
    }
  }

  /**
   * Extract product URLs from DOM (synchronous version)
   */
  protected extractProductUrls(dom: JSDOM, selectors?: string[]): string[] {
    const urls: string[] = [];
    const defaultSelectors = selectors || [
      'a[href*="/product/"]',
      'a[href*="/item/"]',
      'a[href*="/p/"]',
    ];

    for (const selector of defaultSelectors) {
      const elements = dom.window.document.querySelectorAll(selector);
      for (const element of elements) {
        const href = element.getAttribute('href');
        if (href) {
          const resolvedUrl = this.resolveUrl(href, this.baseUrl);
          urls.push(resolvedUrl);
        }
      }
    }

    return [...new Set(urls)]; // Remove duplicates
  }

  /**
   * Extract product URLs synchronously
   */
  protected extractProductUrlsSync(dom: JSDOM, selector: string): string[] {
    const urls: string[] = [];
    const elements = dom.window.document.querySelectorAll(selector);

    for (const element of elements) {
      const href = element.getAttribute('href');
      if (href) {
        const resolvedUrl = this.resolveUrl(href, this.baseUrl);
        urls.push(resolvedUrl);
      }
    }

    return [...new Set(urls)]; // Remove duplicates
  }

  /**
   * Extract JSON data from script tags
   */
  protected async extractJsonData(dom: JSDOM, selectors: string[]): Promise<JsonData[]> {
    const matchers = selectors.map(selector => ({ selector, pattern: /.*/ }));
    const results = await extractJsonFromScriptTags(dom, matchers);
    return results as unknown as JsonData[];
  }

  /**
   * Check if Puppeteer is available
   */
  protected isPuppeteerAvailable(): boolean {
    return this.puppeteerClient?.isAvailable() ?? false;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.puppeteerClient) {
        await this.puppeteerClient.close();
      }
    } catch (error) {
      // Ignore cleanup errors to prevent test failures
      // In production, you might want to log these errors
    }
  }

  /**
   * Update configuration and refresh services
   */
  updateConfig(config: RecipeConfig): void {
    this.config = config;
    this.productValidator.updateConfig(config);
    this.elementExtractor.updateBaseUrl(this.baseUrl);
  }

  /**
   * Update base URL and refresh services
   */
  updateBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.elementExtractor.updateBaseUrl(baseUrl);
  }

  /**
   * Update transforms for data transformation
   */
  updateTransforms(transforms: any[]): void {
    this.dataTransformer.updateTransforms(transforms);
  }

  /**
   * Apply text transformations with error handling
   */
  protected applyTransformations(text: string, transformations: string[]): string {
    return this.dataTransformer.transformText(text, transformations);
  }
}
