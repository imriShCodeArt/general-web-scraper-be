import { BaseAdapter } from './base-adapter';
import { RecipeConfig, RawProduct, RawVariation, ValidationError } from '../types';
import { ValidationErrorImpl } from './error-handler';
import { JSDOM } from 'jsdom';

export class GenericAdapter extends BaseAdapter {
  private archiveCategory?: string;
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

        // Capture archive/category title from H1 on listing page
        const h1 = dom.window.document.querySelector('h1');
        const archiveTitle = h1?.textContent?.trim();
        if (archiveTitle && archiveTitle.length > 0) {
          this.archiveCategory = archiveTitle;
        }

        // Extract product URLs from current page
        const productUrls = this.extractProductUrlsWithSelector(dom, productLinks);

        for (const url of productUrls) {
          yield url;
        }

        // Follow pagination if configured
        if (pagination?.nextPage) {
          const doc = dom.window.document;

          // Support multiple potential selectors for "next" including <link rel="next">
          const selectorCandidates: string[] = [
            pagination.nextPage,
            'a[rel=\'next\']',
            'link[rel=\'next\']',
            '.pagination__next',
            '.pagination .next a',
            '.pagination__item--next a',
            'a[aria-label=\'Next\']',
            'a[aria-label=\'Weiter\']',
          ];

          let nextPageHref: string | null = null;

          for (const sel of selectorCandidates) {
            const el = doc.querySelector(sel);
            if (el) {
              // If it's a <link> tag in <head>
              if (el.tagName && el.tagName.toLowerCase() === 'link') {
                nextPageHref = el.getAttribute('href');
              } else {
                nextPageHref = el.getAttribute('href');
              }
              if (nextPageHref) break;
            }
          }

          if (nextPageHref) {
            currentUrl = this.resolveUrl(nextPageHref);
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
  }

  /**
   * Extract product data using the recipe configuration
   */
  async extractProduct(url: string): Promise<RawProduct> {
    // Get waitForSelectors from behavior if configured
    const waitForSelectors = this.config.behavior?.waitForSelectors;
    const fastMode = this.config.behavior?.fastMode || false;

    const dom = await this.getDom(url, waitForSelectors ? { waitForSelectors } : {});
    const { selectors, transforms, fallbacks } = this.config;

    // Extract core product data with fast mode optimizations
    const product: RawProduct = {
      id:
        this.extractWithFallbacks(dom, selectors.sku, fallbacks?.sku) ||
        this.generateIdFromUrl(url),
      title: this.extractWithFallbacks(dom, selectors.title, fallbacks?.title),
      slug:
        this.extractWithFallbacks(dom, selectors.title, fallbacks?.title)
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '') || 'product',
      description: fastMode
        ? this.extractWithFallbacks(
          dom,
          selectors.description,
          selectors.descriptionFallbacks,
        )?.substring(0, 500)
        : this.extractWithFallbacks(dom, selectors.description, selectors.descriptionFallbacks),
      shortDescription: selectors.shortDescription
        ? this.extractWithFallbacks(dom, selectors.shortDescription)
        : undefined,
      sku: this.extractWithFallbacks(dom, selectors.sku, fallbacks?.sku),
      stockStatus: this.extractStockStatusFromSelector(dom, selectors.stock),
      images: fastMode
        ? this.extractImagesFromSelector(dom, selectors.images).slice(0, 3)
        : this.extractImagesFromSelector(dom, selectors.images), // Limit images in fast mode
      category: selectors.category ? this.extractWithFallbacks(dom, selectors.category) : undefined,
      productType: 'simple', // Default to simple, could be enhanced to detect variable products
      attributes: fastMode ? {} : this.extractAttributesFromSelector(dom, selectors.attributes), // Skip attributes in fast mode
      variations: fastMode
        ? []
        : this.extractVariationsFromSelector(dom, selectors.variations || []), // Skip variations in fast mode
      price: this.extractPriceFromSelector(dom, selectors.price),
      salePrice: this.extractSalePrice(dom, selectors.price),
    };

    // Prefer archive H1 as category if configured/available
    if (!product.category && this.archiveCategory) {
      product.category = this.archiveCategory;
    }

    // Apply transformations (simplified in fast mode)
    if (transforms && !fastMode) {
      if (transforms.title && product.title) {
        product.title = this.applyTransformations(product.title, transforms.title);
      }
      if (transforms.price && product.variations) {
        product.variations = product.variations.map((variation) => ({
          ...variation,
          regularPrice: this.applyTransformations(variation.regularPrice || '', transforms.price!),
        }));
      }
      if (transforms.description && product.description) {
        product.description = this.applyTransformations(
          product.description,
          transforms.description,
        );
      }
      if (transforms.attributes && product.attributes) {
        // Convert the attributes to the expected type for transformations
        const stringAttributes: Record<string, string[]> = {};
        for (const [key, values] of Object.entries(product.attributes)) {
          stringAttributes[key] = values.filter((v): v is string => v !== undefined);
        }
        product.attributes = this.applyAttributeTransformations(
          stringAttributes,
          transforms.attributes,
        );
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
  protected extractWithFallbacks(
    dom: JSDOM,
    selectors: string | string[],
    fallbacks?: string[],
  ): string {
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

    // Try primary selectors first
    for (const selector of selectorArray) {
      const result = this.extractText(dom, selector);
      if (result) {
        // Filter out price-like content for description fields
        if (this.isPriceLike(result)) {
          if (process.env.SCRAPER_DEBUG === '1')
            console.log(
              `Skipping price-like content for selector: ${selector} ->`,
              result.substring(0, 50),
            );
          continue;
        }
        if (process.env.SCRAPER_DEBUG === '1')
          console.log(`Found content with selector: ${selector}`, result.substring(0, 100));
        return result;
      } else {
        if (process.env.SCRAPER_DEBUG === '1')
          console.log(`No content found with selector: ${selector}`);
      }
    }

    // Try fallback selectors if available
    if (fallbacks) {
      if (process.env.SCRAPER_DEBUG === '1') console.log('Trying fallback selectors:', fallbacks);
      for (const fallback of fallbacks) {
        const result = this.extractText(dom, fallback);
        if (result) {
          // Filter out price-like content for fallback selectors too
          if (this.isPriceLike(result)) {
            if (process.env.SCRAPER_DEBUG === '1')
              console.log(
                `Skipping price-like content for fallback selector: ${fallback} ->`,
                result.substring(0, 50),
              );
            continue;
          }
          if (process.env.SCRAPER_DEBUG === '1')
            console.log(
              `Found content with fallback selector: ${fallback}`,
              result.substring(0, 100),
            );
          return result;
        } else {
          if (process.env.SCRAPER_DEBUG === '1')
            console.log(`No content found with fallback selector: ${fallback}`);
        }
      }
    }

    if (process.env.SCRAPER_DEBUG === '1')
      console.log('No content found with any selector or fallback');
    return '';
  }

  /**
   * Check if text looks like a price (should not be used for descriptions)
   */
  private isPriceLike(text: string): boolean {
    if (!text) return false;
    const t = text.trim();

    // Common currency tokens and numeric patterns
    const currencyPattern = /(₪|\$|€|£)/;
    const numberPattern = /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/;
    const containsOnlyPrice = numberPattern.test(t);
    const containsCurrencyAndNumber = currencyPattern.test(t) && /\d/.test(t) && t.length <= 20;

    // Hebrew "אין מוצרים בסל" or other cart snippets aren't product descriptions either
    const cartSnippet = /אין מוצרים בסל/;

    // Check for common price-related text patterns
    const pricePatterns = [
      /^\s*\d+[\d,.]*\s*₪?\s*$/,
      /^\s*₪\s*\d+[\d,.]*\s*$/,
      /^\s*\d+[\d,.]*\s*שח\s*$/,
      /^\s*שח\s*\d+[\d,.]*\s*$/,
      /^\s*\d+[\d,.]*\s*ILS\s*$/,
      /^\s*ILS\s*\d+[\d,.]*\s*$/,
      /^\s*\d+[\d,.]*\s*NIS\s*$/,
      /^\s*NIS\s*\d+[\d,.]*\s*$/,
    ];

    const matchesPricePattern = pricePatterns.some((pattern) => pattern.test(t));

    // Check for very short numeric content that's likely a price
    const isShortNumeric = t.length <= 15 && /^\s*\d+[\d,.]*\s*$/.test(t);

    return (
      containsOnlyPrice ||
      containsCurrencyAndNumber ||
      cartSnippet.test(t) ||
      matchesPricePattern ||
      isShortNumeric
    );
  }

  /**
   * Extract product URLs using the configured selector
   */
  protected extractProductUrlsWithSelector(dom: JSDOM, selector: string | string[]): string[] {
    const selectorArray = Array.isArray(selector) ? selector : [selector];
    const urls: string[] = [];
    const seen = new Set<string>();

    for (const sel of selectorArray) {
      const links = dom.window.document.querySelectorAll(sel);
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href) {
          const resolved = this.resolveUrl(href);
          // Accept only real product pages; exclude add-to-cart and category/archive links
          // Support both singular and Shopify-style plural product paths
          const isProduct = /(\/products\/|\/product\/)/.test(resolved);
          const isAddToCart = /[?&]add-to-cart=/.test(resolved);
          const isCategory = /\/product-category\//.test(resolved);
          if (isProduct && !isAddToCart && !isCategory && !seen.has(resolved)) {
            urls.push(resolved);
            seen.add(resolved);
          }
        }
      }
      if (urls.length > 0) break; // Use first successful selector
    }

    return urls;
  }

  /**
   * Extract images using the configured selector
   */
  protected override extractImages(dom: JSDOM, selector: string | string[]): string[] {
    const selectorArray = Array.isArray(selector) ? selector : [selector];

    // Shopify-focused gallery detection
    const doc = dom.window.document;
    const galleryScopes = [
      '.product__media',
      '.product-media',
      '.product__media-list',
      '.product__gallery',
      '[data-product-gallery]',
    ];

    // More lenient filtering - accept Shopify CDN and site-specific images
    const productCdnFilter = (u: string) => {
      // Accept Shopify CDN images
      if (/cdn\.shopify\.com\/.+\/products\//.test(u)) return true;
      // Accept wash-and-dry.eu domain images
      if (/wash-and-dry\.eu.*\/files\//.test(u)) return true;
      // Accept any https URL that looks like a product image
      if (u.startsWith('https://') && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(u)) return true;
      return false;
    };
    const notIconFilter = (u: string) => !/(icon|sprite|logo|favicon|placeholder)/i.test(u);

    const getLargestFromSrcset = (srcset: string): string | null => {
      try {
        const parts = srcset.split(',').map((s) => s.trim());
        const candidates = parts
          .map((p) => {
            const [url, size] = p.split(' ');
            const width = size && size.endsWith('w') ? parseInt(size) : 0;
            return { url, width };
          })
          .filter((c) => !!c.url);
        if (candidates.length === 0) return null;
        candidates.sort((a, b) => b.width - a.width);
        return candidates[0].url || null;
      } catch {
        return null;
      }
    };

    // 0) Try LD+JSON Product images first
    try {
      const ldScripts = Array.from(doc.querySelectorAll('script[type=\'application/ld+json\']'));
      const ldImages: string[] = [];
      for (const s of ldScripts) {
        const raw = s.textContent?.trim();
        if (!raw) continue;
        let json: Record<string, unknown>;
        try {
          json = JSON.parse(raw);
        } catch {
          continue;
        }
        const products: Record<string, unknown>[] = [];
        if (json && json['@type'] === 'Product') products.push(json);
        if (Array.isArray(json)) products.push(...json.filter((j) => j['@type'] === 'Product'));
        if (Array.isArray(json['@graph']))
          products.push(...json['@graph'].filter((g: Record<string, unknown>) => g['@type'] === 'Product'));
        for (const p of products) {
          if (p.image) {
            if (typeof p.image === 'string') {
              ldImages.push(p.image);
            } else if (Array.isArray(p.image)) {
              for (const im of p.image) if (typeof im === 'string') ldImages.push(im);
            }
          }
        }
      }
      const filteredLd = ldImages
        .map((u) => this.resolveUrl(u))
        .filter(productCdnFilter)
        .filter(notIconFilter);
      if (filteredLd.length > 0) {
        if (process.env.SCRAPER_DEBUG === '1')
          console.log(
            `[extractImages] Found ${filteredLd.length} LD+JSON images, but continuing to check configured selectors`,
          );
        // Don't return immediately - continue to check configured selectors for more images
      }
    } catch {
      // Ignore errors and continue with other methods
    }

    // 0b) Try Shopify Product JSON (script id starts with ProductJson)
    try {
      const productJsonScripts = Array.from(doc.querySelectorAll('script[id^=\'ProductJson\']'));
      const jsonImages: string[] = [];
      for (const s of productJsonScripts) {
        const raw = s.textContent?.trim();
        if (!raw) continue;
        let json: Record<string, unknown>;
        try {
          json = JSON.parse(raw);
        } catch {
          continue;
        }
        // Common Shopify product JSON: images: string[] or media: [{src|preview_image}]
        if (Array.isArray(json?.images)) {
          for (const u of json.images) if (typeof u === 'string') jsonImages.push(u);
        }
        if (Array.isArray(json?.media)) {
          for (const m of json.media) {
            const u = m?.src || m?.preview_image?.src || m?.image || m?.url;
            if (typeof u === 'string') jsonImages.push(u);
          }
        }
      }
      const filteredJson = jsonImages
        .map((u) => this.resolveUrl(u))
        .filter(productCdnFilter)
        .filter(notIconFilter);
      if (filteredJson.length > 0) {
        if (process.env.SCRAPER_DEBUG === '1')
          console.log(
            `[extractImages] Found ${filteredJson.length} Shopify JSON images, but continuing to check configured selectors`,
          );
        // Don't return immediately - continue to check configured selectors for more images
      }
    } catch {
      // Ignore errors and continue with other methods
    }

    const collectImagesFromScope = (scope: Element): string[] => {
      const urls: string[] = [];
      // Consider <img> and <source> inside <picture>
      const imgNodes = scope.querySelectorAll('img, picture source');
      imgNodes.forEach((n) => {
        let src: string | null = null;
        const srcset = n.getAttribute('srcset') || n.getAttribute('data-srcset');
        if (srcset) {
          src = getLargestFromSrcset(srcset);
        }
        if (!src) {
          src =
            n.getAttribute('data-image') ||
            n.getAttribute('data-original-src') ||
            n.getAttribute('data-src') ||
            n.getAttribute('src');
        }
        if (src) {
          urls.push(this.resolveUrl(src));
        }
      });
      // Also extract background-image URLs
      const bgNodes = scope.querySelectorAll('[style*=\'background-image\']');
      bgNodes.forEach((n) => {
        const style = (n as HTMLElement).getAttribute('style') || '';
        const match = style.match(/background-image:\s*url\((['"]?)([^)'"]+)\1\)/i);
        if (match && match[2]) {
          urls.push(this.resolveUrl(match[2]));
        }
      });
      return urls;
    };

    // 1) Try configured selectors FIRST (these are more reliable than gallery scopes)
    for (const sel of selectorArray) {
      const nodes = this.extractElements(dom, sel);
      if (nodes.length > 0) {
        const urls = nodes
          .map((img) => {
            const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
            if (srcset) {
              const largest = getLargestFromSrcset(srcset);
              if (largest) return this.resolveUrl(largest);
            }
            const src =
              img.getAttribute('data-image') ||
              img.getAttribute('data-original-src') ||
              img.getAttribute('data-src') ||
              img.getAttribute('src');
            return src ? this.resolveUrl(src) : null;
          })
          .filter((u): u is string => !!u)
          .filter(productCdnFilter)
          .filter(notIconFilter);
        if (urls.length > 0) {
          if (process.env.SCRAPER_DEBUG === '1')
            console.log(`[extractImages] Found ${urls.length} images from selector ${sel}`);
          return Array.from(new Set(urls));
        }
      }
    }

    // 2) Try gallery scopes as fallback
    for (const scopeSel of [...galleryScopes, '.product-gallery']) {
      const scope = doc.querySelector(scopeSel);
      if (scope) {
        const urls = collectImagesFromScope(scope).filter(productCdnFilter).filter(notIconFilter);
        if (urls.length > 0) {
          if (process.env.SCRAPER_DEBUG === '1')
            console.log(
              `[extractImages] Found ${urls.length} images from gallery scope ${scopeSel}`,
            );
          return Array.from(new Set(urls));
        }
      }
    }

    // 1b) Try to parse <noscript> fallbacks which often contain plain <img>
    const noscripts = Array.from(doc.querySelectorAll('noscript'));
    for (const ns of noscripts) {
      const html = ns.textContent || '';
      if (!html || html.length < 10) continue;
      try {
        const frag = new dom.window.DOMParser().parseFromString(html, 'text/html');
        const imgs = frag.querySelectorAll('img');
        const urls = Array.from(imgs)
          .map((im) => im.getAttribute('src') || im.getAttribute('data-src'))
          .filter((u): u is string => !!u)
          .map((u) => this.resolveUrl(u))
          .filter(productCdnFilter)
          .filter(notIconFilter);
        if (urls.length > 0) return Array.from(new Set(urls));
      } catch {
        // Ignore parsing errors and continue
      }
    }

    // 2) Fallback to configured selectors but apply strict filtering
    for (const sel of selectorArray) {
      const nodes = this.extractElements(dom, sel);
      if (nodes.length > 0) {
        const urls = nodes
          .map((img) => {
            const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
            if (srcset) {
              const largest = getLargestFromSrcset(srcset);
              if (largest) return this.resolveUrl(largest);
            }
            const src =
              img.getAttribute('data-original-src') ||
              img.getAttribute('data-src') ||
              img.getAttribute('src');
            return src ? this.resolveUrl(src) : null;
          })
          .filter((u): u is string => !!u)
          .filter(productCdnFilter)
          .filter(notIconFilter);
        if (urls.length > 0) {
          return Array.from(new Set(urls));
        }
      }
    }

    // 3) Last resort: OpenGraph image
    const og = doc.querySelector('meta[property=\'og:image\']')?.getAttribute('content');
    if (og && productCdnFilter(og) && notIconFilter(og)) {
      return [this.resolveUrl(og)];
    }

    return [];
  }

  /**
   * Extract stock status using the configured selector
   */
  protected override extractStockStatus(dom: JSDOM, selector: string | string[]): string {
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
   * Extract stock status from a selector that can be either a string or array of strings
   */
  private extractStockStatusFromSelector(dom: JSDOM, selector: string | string[]): string {
    if (Array.isArray(selector)) {
      // Try each selector until one works
      for (const sel of selector) {
        const status = this.extractStockStatus(dom, sel);
        if (status && status.trim()) {
          return status;
        }
      }
      return 'instock';
    }
    return this.extractStockStatus(dom, selector);
  }

  /**
   * Extract images from a selector that can be either a string or array of strings
   */
  private extractImagesFromSelector(dom: JSDOM, selector: string | string[]): string[] {
    if (Array.isArray(selector)) {
      // Try each selector until one works
      for (const sel of selector) {
        const images = this.extractImages(dom, sel);
        if (images && images.length > 0) {
          return images;
        }
      }
      return [];
    }
    return this.extractImages(dom, selector);
  }

  /**
   * Extract attributes from a selector that can be either a string or array of strings
   */
  private extractAttributesFromSelector(dom: JSDOM, selector: string | string[]): Record<string, string[]> {
    if (Array.isArray(selector)) {
      // Try each selector until one works
      for (const sel of selector) {
        const attrs = this.extractAttributes(dom, sel);
        if (attrs && Object.keys(attrs).length > 0) {
          return attrs;
        }
      }
      return {};
    }
    return this.extractAttributes(dom, selector);
  }

  /**
   * Extract variations from a selector that can be either a string or array of strings
   */
  private extractVariationsFromSelector(dom: JSDOM, selector: string | string[]): RawProduct['variations'] {
    if (Array.isArray(selector)) {
      // Try each selector until one works
      for (const sel of selector) {
        const variations = this.extractVariations(dom, sel);
        if (variations && variations.length > 0) {
          return variations;
        }
      }
      return [];
    }
    return this.extractVariations(dom, selector);
  }

  /**
   * Extract price from a selector that can be either a string or array of strings
   */
  private extractPriceFromSelector(dom: JSDOM, selector: string | string[]): string {
    if (Array.isArray(selector)) {
      // Try each selector until one works
      for (const sel of selector) {
        const price = this.extractPrice(dom, sel);
        if (price && price.trim()) {
          return price;
        }
      }
      return '';
    }
    return this.extractPrice(dom, selector);
  }

  /**
   * Extract attributes using the configured selector
   */
  protected override extractAttributes(
    dom: JSDOM,
    selector: string | string[],
  ): Record<string, string[]> {
    const selectorArray = Array.isArray(selector) ? selector : [selector];
    const attributes: Record<string, string[]> = {};

    for (const sel of selectorArray) {
      const attributeElements = this.extractElements(dom, sel);

      if (attributeElements.length > 0) {
        for (const element of attributeElements) {
          // Case 1: Structured name/value nodes present
          const nameElement = element.querySelector(
            '[data-attribute-name], .attribute-name, .attr-name, .option-name',
          );
          const valueElements = element.querySelectorAll(
            '[data-attribute-value], .attribute-value, .attr-value, .option-value',
          );
          if (nameElement && valueElements.length > 0) {
            const name = nameElement.textContent?.trim() || '';
            const values = Array.from(valueElements)
              .map((val) => (val as Element).textContent?.trim())
              .filter((val): val is string => val !== undefined && !this.isPlaceholderValue(val));
            if (name && values.length > 0) {
              attributes[name] = values;
            }
          }

          // Case 2: WooCommerce selects (no explicit name node)
          const selectNodes = element.querySelectorAll(
            'select[name*="attribute"], select[name*="pa_"], select[class*="attribute"], .variations select',
          );
          for (const select of Array.from(selectNodes)) {
            const rawName =
              select.getAttribute('name') || select.getAttribute('data-attribute') || '';
            if (!rawName) continue;
            // Derive display name: attribute_pa_color -> Color; attribute_size -> Size
            const nameClean = rawName
              .replace(/^attribute_/i, '')
              .replace(/^pa_/i, '')
              .replace(/[_-]+/g, ' ')
              .trim();
            const displayName = nameClean.replace(/\b\w/g, (c) => c.toUpperCase());

            const options = Array.from(select.querySelectorAll('option')) as HTMLOptionElement[];
            const values = options
              .map((o) => (o.textContent || '').trim())
              .filter((v) => v && !this.isPlaceholderValue(v));
            if (displayName && values.length > 0) {
              const existing = attributes[displayName] || [];
              attributes[displayName] = Array.from(new Set([...existing, ...values]));
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
  protected override extractVariations(dom: JSDOM, selector?: string | string[]): RawVariation[] {
    if (!selector) return [];

    const selectorArray = Array.isArray(selector) ? selector : [selector];
    const variations: RawVariation[] = [];

    // 0) Shopify: parse variants from Product JSON embedded in the page
    try {
      // Common Shopify script patterns - including the meta script pattern
      const scriptCandidates = [
        // Add the meta script pattern that contains variant data FIRST (most comprehensive)
        ...Array.from(dom.window.document.querySelectorAll('script:not([id]):not([type])')),
        ...Array.from(dom.window.document.querySelectorAll('script[id^=\'ProductJson\']')),
        ...Array.from(dom.window.document.querySelectorAll('script[type=\'application/ld+json\']')),
        ...Array.from(dom.window.document.querySelectorAll('script[type=\'application/json\']')),
      ] as HTMLScriptElement[];

      for (const script of scriptCandidates) {
        const raw = script.textContent?.trim();
        if (!raw) continue;

        // Try to find the meta script pattern: var meta = {...}
        if (raw.includes('var meta =') && raw.includes('variants')) {
          try {
            // Extract the JSON part after "var meta ="
            const metaMatch = raw.match(/var meta\s*=\s*({.*?});/s);
            if (metaMatch && metaMatch[1]) {
              const json = JSON.parse(metaMatch[1]);

              // Check if this has product variants
              if (json?.product?.variants && Array.isArray(json.product.variants)) {
                const variants = json.product.variants;
                if (process.env.SCRAPER_DEBUG === '1')
                  console.log(
                    `[extractVariations] Found ${variants.length} variants in meta script`,
                  );

                for (const v of variants) {
                  const price = (v.price / 100).toString(); // Shopify prices are in cents
                  const stockStatus = v.available === false ? 'outofstock' : 'instock';
                  const images: string[] = [];

                  // Extract variant-specific images if available
                  if (v.featured_image && (v.featured_image.src || v.featured_image.url)) {
                    images.push(v.featured_image.url || v.featured_image.src);
                  }

                  variations.push({
                    sku:
                      (v.sku || '').toString() ||
                      this.extractVariantSkuFromLinks(dom, v.id) ||
                      'SKU',
                    regularPrice: price,
                    salePrice: '',
                    taxClass: '',
                    stockStatus,
                    images,
                    attributeAssignments: {
                      Size: v.public_title || v.title || v.option1 || '',
                    },
                  });
                }

                if (variations.length > 0) {
                  if (process.env.SCRAPER_DEBUG === '1')
                    console.log(
                      `Extracted ${variations.length} variations from Shopify meta script`,
                    );
                  return variations;
                }
              }
            }
          } catch (e) {
            if (process.env.SCRAPER_DEBUG === '1')
              console.log('[extractVariations] Failed to parse meta script variants:', e);
          }
        }

        let json: Record<string, unknown>;
        try {
          json = JSON.parse(raw);
        } catch {
          // Some themes wrap multiple JSON objects or arrays; try to find an object with variants
          continue;
        }

        // Case A: Direct Shopify product JSON with variants
        if (json && Array.isArray(json.variants)) {
          const optionNames: string[] = Array.isArray(json.options)
            ? json.options
              .map((o: Record<string, unknown>) => (typeof o === 'string' ? o : o?.name as string))
              .filter((n: string) => !!n)
            : [];

          for (const v of json.variants) {
            const attributeAssignments: Record<string, string> = {};
            const opts = [v.option1, v.option2, v.option3].filter(
              (x: unknown) => typeof x === 'string',
            );
            for (let i = 0; i < opts.length; i++) {
              const key = optionNames[i] || `option${i + 1}`;
              attributeAssignments[key] = opts[i];
            }

            const price = (v.price ?? v.compare_at_price ?? '').toString();
            const sale = (v.compare_at_price ?? '').toString();
            const stockStatus = v.available === false ? 'outofstock' : 'instock';
            const images: string[] = [];
            if (v.featured_image && (v.featured_image.src || v.featured_image.url)) {
              images.push(v.featured_image.url || v.featured_image.src);
            }

            variations.push({
              // Try explicit SKU; fallback to variant URL query param SKU
              sku:
                (v.sku || '').toString() ||
                this.extractVariantSkuFromLinks(dom, v.id) ||
                this.extractText(dom, '.sku, [data-sku], .product-sku') ||
                'SKU',
              regularPrice: price,
              salePrice: sale,
              taxClass: '',
              stockStatus,
              images,
              attributeAssignments,
            });
          }

          if (variations.length > 0) {
            if (process.env.SCRAPER_DEBUG === '1')
              console.log(`Extracted ${variations.length} variations from Shopify Product JSON`);
            return variations;
          }
        }

        // Case B: LD+JSON with Product/offers (can be single or array)
        if (
          json &&
          (json['@type'] === 'Product' ||
            (Array.isArray(json['@graph']) &&
              json['@graph'].some((g: Record<string, unknown>) => g['@type'] === 'Product')))
        ) {
          const productObj = Array.isArray(json['@graph'])
            ? json['@graph'].find((g: Record<string, unknown>) => g['@type'] === 'Product')
            : json;
          const offers = productObj?.offers;
          const offersArray = Array.isArray(offers) ? offers : offers ? [offers] : [];
          for (const offer of offersArray) {
            // LD+JSON lacks explicit option mapping; capture price/sku and leave attributes empty
            const price = (offer.price ?? '').toString();
            const stockStatus = /InStock/i.test(offer.availability || '')
              ? 'instock'
              : 'outofstock';
            variations.push({
              sku:
                (offer.sku || '').toString() ||
                this.extractText(dom, '.sku, [data-sku], .product-sku') ||
                'SKU',
              regularPrice: price,
              taxClass: '',
              stockStatus,
              images: [],
              attributeAssignments: {},
            });
          }
          if (variations.length > 0) {
            if (process.env.SCRAPER_DEBUG === '1')
              console.log(`Extracted ${variations.length} variations from LD+JSON offers`);
            return variations;
          }
        }
      }
    } catch (e) {
      if (process.env.SCRAPER_DEBUG === '1')
        console.warn('Failed to parse Shopify/LD+JSON variants:', e);
    }

    // 1) WooCommerce: parse JSON from data-product_variations on form.variations_form
    const forms = dom.window.document.querySelectorAll(
      'form.variations_form[data-product_variations]',
    );
    if (forms && forms.length > 0) {
      for (const form of Array.from(forms)) {
        const raw = form.getAttribute('data-product_variations');
        if (raw && raw.trim() !== '') {
          try {
            // Some themes HTML-encode quotes, handle that
            const normalized = raw
              .replace(/&quot;/g, '"')
              .replace(/&#34;/g, '"')
              .replace(/&amp;/g, '&');
            const parsed = JSON.parse(normalized);
            if (Array.isArray(parsed)) {
              for (const v of parsed) {
                const attrs = v.attributes || {};
                const attributeAssignments: Record<string, string> = {};
                Object.keys(attrs).forEach((k) => {
                  // keys like attribute_pa_color -> clean to pa_color
                  const cleanKey = k.replace(/^attribute_/, '');
                  const value = attrs[k];
                  if (typeof value === 'string' && value.trim() !== '') {
                    attributeAssignments[cleanKey] = value;
                  }
                });
                const price = (
                  v.display_price ??
                  v.price ??
                  v.display_regular_price ??
                  v.regular_price ??
                  ''
                ).toString();
                const sale = (v.display_sale_price ?? v.sale_price ?? '').toString();
                const stockStatus = v.is_in_stock === false ? 'outofstock' : 'instock';
                const images: string[] = [];
                if (v.image && (v.image.src || v.image.full_src)) {
                  images.push(v.image.full_src || v.image.src);
                }
                variations.push({
                  sku:
                    (v.sku || '').toString() ||
                    this.extractText(dom, '.sku, [data-sku], .product-sku') ||
                    'SKU',
                  regularPrice: price,
                  salePrice: sale,
                  taxClass: '',
                  stockStatus,
                  images,
                  attributeAssignments,
                });
              }
            }
          } catch (e) {
            if (process.env.SCRAPER_DEBUG === '1')
              console.warn('Failed to parse data-product_variations JSON:', e);
          }
        }
      }
      if (variations.length > 0) {
        if (process.env.SCRAPER_DEBUG === '1')
          console.log(
            `Extracted ${variations.length} variations from data-product_variations JSON`,
          );
        return variations;
      }
    }

    // 2) Fallback: extract from DOM selects/prices as before
    // First, try to extract variations from variation forms (WooCommerce style)
    for (const sel of selectorArray) {
      const variationElements = this.extractElements(dom, sel);

      if (variationElements.length > 0) {
        if (process.env.SCRAPER_DEBUG === '1')
          console.log(`Found ${variationElements.length} variation elements with selector: ${sel}`);

        for (const element of variationElements) {
          // Look for variation options in select elements
          const selectElements = element.querySelectorAll(
            'select[name*="attribute"], select[class*="variation"], select[class*="attribute"]',
          );

          if (selectElements.length > 0) {
            if (process.env.SCRAPER_DEBUG === '1')
              console.log(`Found ${selectElements.length} variation select elements`);

            // Only create variations if we have actual variation data (different prices, SKUs, etc.)
            // Don't create variations for every attribute option to avoid CSV duplication
            const basePrice = this.extractText(dom, '.price, [data-price], .product-price') || '';
            const baseSku = this.extractText(dom, '.sku, [data-sku], .product-sku') || 'SKU';

            // Check if this is a true variable product with different prices/SKUs
            const hasPriceVariations = this.checkForPriceVariations(dom);
            const hasSkuVariations = this.checkForSkuVariations(dom);

            if (hasPriceVariations || hasSkuVariations) {
              if (process.env.SCRAPER_DEBUG === '1')
                console.log('Found actual price/SKU variations, creating variation records');

              // Extract options from each select
              for (const select of Array.from(selectElements)) {
                const options = select.querySelectorAll('option[value]:not([value=""])');
                const attributeName =
                  select.getAttribute('name') || select.getAttribute('data-attribute') || 'Unknown';

                if (process.env.SCRAPER_DEBUG === '1')
                  console.log(`Found ${options.length} options for attribute: ${attributeName}`);

                for (const option of Array.from(options)) {
                  const value = option.getAttribute('value');
                  const text = option.textContent?.trim();

                  if (value && text && !this.isPlaceholderValue(text)) {
                    // Create a variation for each option
                    const sku = `${baseSku}-${value}`;

                    variations.push({
                      sku,
                      regularPrice: basePrice,
                      taxClass: '',
                      stockStatus: 'instock',
                      images: [],
                      attributeAssignments: {
                        [attributeName!]: value,
                      },
                    });
                  }
                }
              }
            } else {
              if (process.env.SCRAPER_DEBUG === '1')
                console.log(
                  'No actual price/SKU variations found, treating as simple product with attributes',
                );
              // Don't create variations - this is just a simple product with attribute options
            }
          }

          // Also try traditional variation extraction
          const sku = element.querySelector('[data-sku], .sku, .product-sku')?.textContent?.trim();
          const price = element
            .querySelector('[data-price], .price, .product-price')
            ?.textContent?.trim();

          if (sku && !variations.some((v) => v.sku === sku)) {
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

    if (process.env.SCRAPER_DEBUG === '1')
      console.log(`Extracted ${variations.length} variations total`);
    return variations;
  }



  /**
   * Extract variant SKU from ?variant= links on the page
   */
  private extractVariantSkuFromLinks(dom: JSDOM, variantId?: string): string | '' {
    try {
      const anchors = dom.window.document.querySelectorAll('a[href*="?variant="]');
      for (const a of Array.from(anchors)) {
        const href = a.getAttribute('href') || '';
        const u = new URL(href, this.baseUrl);
        const v = u.searchParams.get('variant');
        if (v && (!variantId || v === String(variantId))) {
          return v;
        }
      }
    } catch {
      // Ignore URL parsing errors and continue
    }
    return '';
  }

  /**
   * Check if a value is a placeholder
   */
  protected isPlaceholderValue(value: string): boolean {
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
      'General',
      'בחירת אפשרותA',
      'בחירת אפשרותB',
      'בחירת אפשרותC',
      'בחירת אפשרותD',
      'בחירת אפשרותE',
      'בחירת אפשרותF',
      'בחירת אפשרותG',
      'בחירת אפשרותH',
      'בחירת אפשרותI',
      'בחירת אפשרותJ',
      'בחירת אפשרותK',
      'בחירת אפשרותL',
      'בחירת אפשרותM',
      'בחירת אפשרותN',
      'בחירת אפשרותO',
      'בחירת אפשרותP',
      'בחירת אפשרותQ',
      'בחירת אפשרותR',
      'בחירת אפשרותS',
      'בחירת אפשרותT',
      'בחירת אפשרותU',
      'בחירת אפשרותV',
      'בחירת אפשרותW',
      'בחירת אפשרותX',
      'בחירת אפשרותY',
      'בחירת אפשרותZ',
      'בחירת אפשרות0',
      'בחירת אפשרות1',
      'בחירת אפשרות2',
      'בחירת אפשרות3',
      'בחירת אפשרות4',
      'בחירת אפשרות5',
      'בחירת אפשרות6',
      'בחירת אפשרות7',
      'בחירת אפשרות8',
      'בחירת אפשרות9',
      'בחירת אפשרותא',
      'בחירת אפשרותב',
      'בחירת אפשרותג',
      'בחירת אפשרותד',
      'בחירת אפשרותה',
      'בחירת אפשרותו',
      'בחירת אפשרותז',
      'בחירת אפשרותח',
      'בחירת אפשרותט',
      'בחירת אפשרותי',
      'בחירת אפשרותכ',
      'בחירת אפשרותל',
      'בחירת אפשרותמ',
      'בחירת אפשרותנ',
      'בחירת אפשרותס',
      'בחירת אפשרותע',
      'בחירת אפשרותפ',
      'בחירת אפשרותצ',
      'בחירת אפשרותק',
      'בחירת אפשרותר',
      'בחירת אפשרותש',
      'בחירת אפשרותת',
    ];

    return placeholders.some((placeholder) =>
      value.toLowerCase().includes(placeholder.toLowerCase()),
    );
  }

  /**
   * Check if there are actual price variations (different prices for different options)
   */
  private checkForPriceVariations(dom: JSDOM): boolean {
    // Look for price variations in the DOM
    const priceElements = dom.window.document.querySelectorAll(
      '[data-price], .price, .product-price, .variation-price',
    );
    const prices = new Set<string>();

    priceElements.forEach((el: Element) => {
      const price = el.textContent?.trim();
      if (price && price !== '') {
        prices.add(price);
      }
    });

    // If we have more than one unique price, there are price variations
    const hasVariations = prices.size > 1;
    if (process.env.SCRAPER_DEBUG === '1')
      console.log(
        `Price variation check - found ${prices.size} unique prices:`,
        Array.from(prices),
      );
    return hasVariations;
  }

  /**
   * Check if there are actual SKU variations (different SKUs for different options)
   */
  private checkForSkuVariations(dom: JSDOM): boolean {
    // Look for SKU variations in the DOM
    const skuElements = dom.window.document.querySelectorAll(
      '[data-sku], .sku, .product-sku, .variation-sku',
    );
    const skus = new Set<string>();

    skuElements.forEach((el: Element) => {
      const sku = el.textContent?.trim();
      if (sku && sku !== '') {
        skus.add(sku);
      }
    });

    // If we have more than one unique SKU, there are SKU variations
    const hasVariations = skus.size > 1;
    if (process.env.SCRAPER_DEBUG === '1')
      console.log(`SKU variation check - found ${skus.size} unique SKUs:`, Array.from(skus));
    return hasVariations;
  }

  /**
   * Wait for selectors to be present in the DOM
   */
  protected async waitForSelectors(dom: JSDOM, selectors: string[]): Promise<void> {
    // Simple implementation - in a real scenario, you might want to use a proper wait mechanism
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const allPresent = selectors.every((selector) => dom.window.document.querySelector(selector));

      if (allPresent) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
  }

  /**
   * Apply transformations to text
   */
  protected override applyTransformations(text: string, transformations: string[]): string {
    let result = text;

    for (const transform of transformations) {
      try {
        if (transform.includes('->')) {
          const [pattern, replacement] = transform.split('->').map((s) => s.trim());
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
    transformations: Record<string, string[]>,
  ): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const [attrName, attrValues] of Object.entries(attributes)) {
      const transforms = transformations[attrName];
      if (transforms) {
        result[attrName] = attrValues.map((value) => this.applyTransformations(value, transforms));
      } else {
        result[attrName] = attrValues;
      }
    }

    return result;
  }

  /**
   * Merge embedded JSON data with extracted data
   */
  protected mergeEmbeddedData(product: RawProduct, embeddedData: Record<string, unknown>[]): void {
    // This is a basic implementation - you might want to make this more sophisticated
    for (const data of embeddedData) {
      if (data.name && !product.title && typeof data.name === 'string') {
        product.title = data.name;
      }
      if (data.description && !product.description && typeof data.description === 'string') {
        product.description = data.description;
      }
      if (data.sku && !product.sku && typeof data.sku === 'string') {
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

  /**
   * Extract sale price if available
   */
  private extractSalePrice(dom: JSDOM, priceSelectors: string | string[]): string {
    const selectorArray = Array.isArray(priceSelectors) ? priceSelectors : [priceSelectors];

    for (const selector of selectorArray) {
      // Look for sale price indicators
      const salePriceSelectors = [
        `${selector}.sale-price`,
        `${selector}.discount-price`,
        `${selector}[class*="sale"]`,
        `${selector}[class*="discount"]`,
        '.sale-price',
        '.discount-price',
        '.price .sale',
        '.price .discount',
        '[class*="sale-price"]',
        '[class*="discount-price"]',
      ];

      for (const saleSelector of salePriceSelectors) {
        const saleElement = dom.window.document.querySelector(saleSelector);
        if (saleElement) {
          const saleText = saleElement.textContent?.trim();
          if (saleText && this.isValidPrice(saleText)) {
            if (process.env.SCRAPER_DEBUG === '1') console.log(`Found sale price: ${saleText}`);
            return this.cleanPrice(saleText);
          }
        }
      }

      // Also check if the main price selector has a sale indicator
      const mainPriceElement = dom.window.document.querySelector(selector);
      if (mainPriceElement) {
        const parentElement = mainPriceElement.parentElement;
        if (
          parentElement &&
          (parentElement.classList.contains('sale') ||
            parentElement.classList.contains('discount') ||
            parentElement.querySelector('.sale, .discount, .sale-price, .discount-price'))
        ) {
          const priceText = mainPriceElement.textContent?.trim();
          if (priceText && this.isValidPrice(priceText)) {
            if (process.env.SCRAPER_DEBUG === '1')
              console.log(`Found sale price from main selector: ${priceText}`);
            return this.cleanPrice(priceText);
          }
        }
      }
    }

    return '';
  }

  /**
   * Check if text is a valid price
   */
  private isValidPrice(text: string): boolean {
    if (!text) return false;
    const t = text.trim();

    // Must contain at least one digit
    if (!/\d/.test(t)) return false;

    // Must be reasonably short (price text shouldn't be very long)
    if (t.length > 50) return false;

    // Should contain currency symbols or be numeric
    const currencyPattern = /(₪|\$|€|£)/;
    const numericPattern = /^\s*\d+[\d,.]*\s*$/;

    return currencyPattern.test(t) || numericPattern.test(t);
  }

  /**
   * Generate a simple ID from URL
   */
  private generateIdFromUrl(url: string): string {
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    return lastPart?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'PRODUCT';
  }

  /**
   * Validate product data according to recipe validation rules
   */
  validateProduct(product: RawProduct): ValidationError[] {
    const errors: ValidationError[] = [];
    const { validation } = this.config;

    if (!validation) {
      return errors;
    }

    // Check required fields
    if (validation.requiredFields) {
      for (const field of validation.requiredFields) {
        if (
          !product[field as keyof RawProduct] ||
          (typeof product[field as keyof RawProduct] === 'string' &&
            (product[field as keyof RawProduct] as string).trim() === '')
        ) {
          errors.push(
            new ValidationErrorImpl(
              field,
              product[field as keyof RawProduct],
              'required',
              `Required field '${field}' is missing or empty`,
            ),
          );
        }
      }
    }

    // Check description length
    if (validation.minDescriptionLength && product.description) {
      if (product.description.length < validation.minDescriptionLength) {
        errors.push(
          new ValidationErrorImpl(
            'description',
            product.description.length,
            validation.minDescriptionLength,
            `Description must be at least ${validation.minDescriptionLength} characters long`,
          ),
        );
      }
    }

    // Check title length
    if (validation.maxTitleLength && product.title) {
      if (product.title.length > validation.maxTitleLength) {
        errors.push(
          new ValidationErrorImpl(
            'title',
            product.title.length,
            validation.maxTitleLength,
            `Title must be no more than ${validation.maxTitleLength} characters long`,
          ),
        );
      }
    }

    return errors;
  }
}
