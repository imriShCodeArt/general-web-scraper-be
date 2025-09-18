import { BaseAdapter } from './base-adapter';
import { extractWithFallbacks as extractWithFallbacksHelper } from '../../helpers/dom';
import { applyTransforms as applyTransformsHelper, applyAttributeTransforms } from '../../helpers/transforms';
import { parsePrice, extractStockStatus } from '../../helpers/parse';
import { RecipeConfig, RawProduct, RawVariation, ValidationError } from '../../domain/types';
import { ValidationErrorImpl } from '../../utils/error-handler';
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
        ? (await this.extractImagesFromSelector(dom, selectors.images)).slice(0, 3)
        : await this.extractImagesFromSelector(dom, selectors.images), // Limit images in fast mode
      category: selectors.category ? this.extractWithFallbacks(dom, selectors.category) : undefined,
      productType: 'simple', // Default; will switch to 'variable' if variations are found
      attributes: fastMode ? {} : await this.extractAttributesFromSelector(dom, selectors.attributes), // Skip attributes in fast mode
      variations: fastMode
        ? []
        : await this.extractVariationsFromSelector(dom, selectors.variations || []), // Skip variations in fast mode
      price: this.extractPriceFromSelector(dom, selectors.price),
      salePrice: this.extractSalePrice(dom, selectors.price),
    };

    // Prefer archive H1 as category if configured/available
    if (!product.category && this.archiveCategory) {
      product.category = this.archiveCategory;
    }

    // If variations were found, mark as variable product
    if (product.variations && product.variations.length > 0) {
      product.productType = 'variable';
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
    return extractWithFallbacksHelper(dom, selectors, fallbacks, (t) => this.isPriceLike(t));
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
          // Support both singular and Shopify-style plural product paths, plus Hebrew URLs
          const isProduct = /(\/products\/|\/product\/|\/כיסאות\/|\/כיסא\/|\/chair)/.test(resolved);
          const isAddToCart = /[?&]add-to-cart=/.test(resolved);
          const isCategory = /\/product-category\//.test(resolved);
          const isArchivePage = /\/כיסאות$/.test(resolved); // Exclude the main category page
          if (isProduct && !isAddToCart && !isCategory && !isArchivePage && !seen.has(resolved)) {
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
  protected override async extractImages(dom: JSDOM, selector: string | string[], _scope?: Element): Promise<string[]> {
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
      const nodes = this.extractElementsSync(dom, sel);
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
      const nodes = this.extractElementsSync(dom, sel);
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
        return extractStockStatus(dom, sel);
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
        const status = extractStockStatus(dom, sel);
        if (status && status.trim()) {
          return status;
        }
      }
      return 'instock';
    }
    return extractStockStatus(dom, selector);
  }

  /**
   * Extract images from a selector that can be either a string or array of strings
   */
  private async extractImagesFromSelector(dom: JSDOM, selector: string | string[]): Promise<string[]> {
    if (Array.isArray(selector)) {
      // Try each selector until one works
      for (const sel of selector) {
        const images = await this.extractImages(dom, sel);
        if (images && images.length > 0) {
          return images;
        }
      }
      return [];
    }
    return await this.extractImages(dom, selector);
  }

  /**
   * Extract attributes from a selector that can be either a string or array of strings
   */
  private async extractAttributesFromSelector(dom: JSDOM, selector: string | string[]): Promise<Record<string, string[]>> {
    if (Array.isArray(selector)) {
      // Try each selector until one works
      for (const sel of selector) {
        const attrs = await this.extractAttributes(dom, sel);
        if (attrs && Object.keys(attrs).length > 0) {
          return attrs;
        }
      }
      return {};
    }
    return await this.extractAttributes(dom, selector);
  }

  /**
   * Extract variations from a selector that can be either a string or array of strings
   */
  private async extractVariationsFromSelector(dom: JSDOM, selector: string | string[]): Promise<RawProduct['variations']> {
    if (Array.isArray(selector)) {
      // Try each selector until one works
      for (const sel of selector) {
        const variations = await this.extractVariations(dom, sel);
        if (variations && variations.length > 0) {
          return variations;
        }
      }
      return [];
    }
    return await this.extractVariations(dom, selector) || [];
  }

  /**
   * Extract price from a selector that can be either a string or array of strings
   */
  private extractPriceFromSelector(dom: JSDOM, selector: string | string[]): string {
    if (Array.isArray(selector)) {
      // Try each selector until one works
      for (const sel of selector) {
        const priceText = this.extractText(dom, sel);
        const price = parsePrice(priceText);
        if (price && price.trim()) {
          return price;
        }
      }
      return '';
    }
    const priceText = this.extractText(dom, selector);
    return parsePrice(priceText);
  }

  /**
   * Extract attributes using the configured selector
   */
  protected override async extractAttributes(
    dom: JSDOM,
    selector: string | string[],
    _scope?: Element,
  ): Promise<Record<string, string[]>> {
    const selectorArray = Array.isArray(selector) ? selector : [selector];
    const attributes: Record<string, string[]> = {};

    for (const sel of selectorArray) {
      const attributeElements = this.extractElementsSync(dom, sel);

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
  protected override async extractVariations(dom: JSDOM, selector: string | string[], _scope?: Element): Promise<RawVariation[] | undefined> {
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
      const variationElements = this.extractElementsSync(dom, sel);

      if (variationElements.length > 0) {
        if (process.env.SCRAPER_DEBUG === '1')
          console.log(`Found ${variationElements.length} variation elements with selector: ${sel}`);

        for (const element of variationElements) {
          // Check if the element itself is a radio button
          const isRadioButton = element.tagName === 'INPUT' && element.getAttribute('type') === 'radio';
          // Look for variation options in select elements
          const selectElements = element.querySelectorAll(
            'select[name*="attribute"], select[class*="variation"], select[class*="attribute"]',
          );

          // Also look for radio button variations
          const radioElements = element.querySelectorAll(
            'input[type="radio"][name*="option"], input[type="radio"][name*="attribute"], input[type="radio"][name*="variation"]',
          );

          if (selectElements.length > 0 || radioElements.length > 0 || isRadioButton) {
            if (process.env.SCRAPER_DEBUG === '1')
              console.log(`Found ${selectElements.length} variation select elements and ${radioElements.length} radio elements`);

            // Only create variations if we have actual variation data (different prices, SKUs, etc.)
            // Don't create variations for every attribute option to avoid CSV duplication
            const basePrice = this.extractText(dom, '.price, [data-price], .product-price') || '';
            const baseSku = this.extractText(dom, '.sku, [data-sku], .product-sku') || 'SKU';

            // Check if this is a true variable product with different prices/SKUs
            const hasPriceVariations = this.checkForPriceVariations(dom);
            const hasSkuVariations = this.checkForSkuVariations(dom);

            // For radio buttons, we'll create variations even without price/SKU differences
            // since they represent different product options (like colors)
            const hasRadioVariations = radioElements.length > 0;

            if (hasPriceVariations || hasSkuVariations || hasRadioVariations) {
              if (process.env.SCRAPER_DEBUG === '1')
                console.log('Found actual price/SKU variations, creating variation records');

              // Extract options from each select
              for (const select of Array.from(selectElements)) {
                const options = select.querySelectorAll('option[value]:not([value=""])');
                const attributeName =
                  select.getAttribute('name') || select.getAttribute('data-attribute') || 'Unknown';
                // Convert to WooCommerce taxonomy format with pa_ prefix
                const taxonomyAttributeName = `pa_${attributeName.toLowerCase().replace(/\s+/g, '_')}`;

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
                        [taxonomyAttributeName]: text, // Use the text with pa_ prefix
                      },
                    });
                  }
                }
              }

              // Process single radio button (if the element itself is a radio button)
              if (isRadioButton) {
                if (process.env.SCRAPER_DEBUG === '1')
                  console.log(`Processing single radio button: ${element.getAttribute('name')} = ${element.getAttribute('value')}`);

                const name = element.getAttribute('name') || 'unknown';
                const value = element.getAttribute('value') || '';

                // Try to find the Hebrew text from associated elements
                let text = '';

                // Look for data-original-title in sibling img elements
                const parentLabel = element.closest('label');
                if (parentLabel) {
                  const img = parentLabel.querySelector('img[data-original-title]');
                  if (img) {
                    text = img.getAttribute('data-original-title') || '';
                  }
                }

                // Fallback to other attributes
                if (!text) {
                  text = element.getAttribute('data-original-title') ||
                         element.getAttribute('title') ||
                         value;
                }

                // Try to find the attribute name from the control label
                let attributeName = name.replace(/^option\[(\d+)\]$/, 'Option $1')
                  .replace(/[[\]]/g, '')
                  .replace(/[_-]/g, ' ')
                  .trim();
                // Look for the control label in the same options_group
                const optionsGroup = element.closest('.options_group');
                if (optionsGroup) {
                  const controlLabel = optionsGroup.querySelector('label.control-label');
                  if (controlLabel) {
                    attributeName = controlLabel.textContent?.trim() || attributeName;
                  }
                }

                // Convert to WooCommerce taxonomy format with pa_ prefix
                const taxonomyAttributeName = `pa_${attributeName.toLowerCase().replace(/\s+/g, '_')}`;

                if (value && text && !this.isPlaceholderValue(text)) {
                  const sku = `${baseSku}-${value}`;

                  variations.push({
                    sku,
                    regularPrice: basePrice,
                    taxClass: '',
                    stockStatus: 'instock',
                    images: [],
                    attributeAssignments: {
                      [taxonomyAttributeName]: text, // Use the Hebrew text with pa_ prefix
                    },
                  });

                  if (process.env.SCRAPER_DEBUG === '1')
                    console.log(`Created single radio variation: ${attributeName} = ${text} (value: ${value})`);
                }
              }

              // Process radio button variations
              if (radioElements.length > 0) {
                if (process.env.SCRAPER_DEBUG === '1')
                  console.log(`Processing ${radioElements.length} radio button variations`);

                // Group radio buttons by name attribute
                const radioGroups = new Map<string, HTMLInputElement[]>();
                Array.from(radioElements).forEach((radio) => {
                  const name = radio.getAttribute('name') || 'unknown';
                  if (!radioGroups.has(name)) {
                    radioGroups.set(name, []);
                  }
                  radioGroups.get(name)!.push(radio as HTMLInputElement);
                });

                // Create variations for each radio group
                for (const [groupName, radios] of radioGroups) {
                  let attributeName = groupName.replace(/^option\[(\d+)\]$/, 'Option $1')
                    .replace(/[[\]]/g, '')
                    .replace(/[_-]/g, ' ')
                    .trim();

                  // Try to find the attribute name from the control label
                  if (radios.length > 0) {
                    const optionsGroup = radios[0].closest('.options_group');
                    if (optionsGroup) {
                      const controlLabel = optionsGroup.querySelector('label.control-label');
                      if (controlLabel) {
                        attributeName = controlLabel.textContent?.trim() || attributeName;
                      }
                    }
                  }

                  // Convert to WooCommerce taxonomy format with pa_ prefix
                  const taxonomyAttributeName = `pa_${attributeName.toLowerCase().replace(/\s+/g, '_')}`;

                  for (const radio of radios) {
                    const value = radio.getAttribute('value') || '';

                    // Try to find the Hebrew text from associated elements
                    let text = '';

                    // Look for data-original-title in sibling img elements
                    const parentLabel = radio.closest('label');
                    if (parentLabel) {
                      const img = parentLabel.querySelector('img[data-original-title]');
                      if (img) {
                        text = img.getAttribute('data-original-title') || '';
                      }
                    }

                    // Fallback to other methods
                    if (!text) {
                      text = this.extractText(dom, `label:has(input[value="${value}"])`) ||
                             radio.getAttribute('data-original-title') ||
                             radio.getAttribute('title') ||
                             value;
                    }

                    if (value && text && !this.isPlaceholderValue(text)) {
                      const sku = `${baseSku}-${value}`;

                      variations.push({
                        sku,
                        regularPrice: basePrice,
                        taxClass: '',
                        stockStatus: 'instock',
                        images: [],
                        attributeAssignments: {
                          [taxonomyAttributeName]: text, // Use the Hebrew text with pa_ prefix
                        },
                      });

                      if (process.env.SCRAPER_DEBUG === '1')
                        console.log(`Created radio variation: ${attributeName} = ${text} (value: ${value})`);
                    }
                  }
                }
              }
            } else {
              if (process.env.SCRAPER_DEBUG === '1')
                console.log(
                  'No explicit price/SKU variations detected; generating variation rows from attribute options',
                );

              // Build attribute option groups from all selects within this element
              type OptionGroup = { name: string; options: { value: string; text: string }[] };
              const groups: OptionGroup[] = [];

              Array.from(selectElements).forEach((selectEl, idx) => {
                // Derive attribute name: prefer name attr; fallback to preceding label text; fallback to OptionN
                const rawName =
                  (selectEl.getAttribute('name') || selectEl.getAttribute('data-attribute') || '')
                    .toString()
                    .trim();
                let displayName = rawName
                  .replace(/^attribute_/i, '')
                  .replace(/^pa_/i, '')
                  .replace(/[_-]+/g, ' ')
                  .trim();
                if (!displayName) {
                  const label = (selectEl.previousElementSibling ||
                    element.querySelector('label')) as HTMLElement | null;
                  displayName = label?.textContent?.trim() || `Option ${idx + 1}`;
                }
                displayName = displayName.replace(/\b\w/g, (c) => c.toUpperCase());

                const options = Array.from(selectEl.querySelectorAll('option[value]'))
                  .map((o) => ({
                    value: (o.getAttribute('value') || '').trim(),
                    text: (o.textContent || '').trim(),
                  }))
                  .filter((o) => o.value && o.text && !this.isPlaceholderValue(o.text));

                if (options.length > 0) {
                  groups.push({ name: displayName, options });
                }
              });

              // Generate Cartesian product of option groups
              const combine = (
                acc: { skuSuffix: string; attrs: Record<string, string> }[],
                group: OptionGroup,
              ) => {
                const next: { skuSuffix: string; attrs: Record<string, string> }[] = [];
                for (const partial of acc) {
                  for (const opt of group.options) {
                    next.push({
                      skuSuffix: partial.skuSuffix ? `${partial.skuSuffix}-${opt.value}` : opt.value,
                      attrs: { ...partial.attrs, [group.name]: opt.text },
                    });
                  }
                }
                return next;
              };

              const combos = groups.reduce(
                (acc, g) => combine(acc, g),
                [{ skuSuffix: '', attrs: {} as Record<string, string> }],
              );

              const basePrice = this.extractText(dom, '.price, [data-price], .product-price') || '';
              const baseSku = this.extractText(dom, '.sku, [data-sku], .product-sku') || 'SKU';

              for (const c of combos) {
                variations.push({
                  sku: c.skuSuffix ? `${baseSku}-${c.skuSuffix}` : baseSku,
                  regularPrice: basePrice,
                  taxClass: '',
                  stockStatus: 'instock',
                  images: [],
                  attributeAssignments: c.attrs,
                });
              }
            }
          }

          // If there are no <select> elements, try site-specific option blocks
          if (selectElements.length === 0) {
            const optionBlocks = element.querySelectorAll('[class^="input-option"]');
            if (optionBlocks.length > 0) {
              if (process.env.SCRAPER_DEBUG === '1')
                console.log(`Found ${optionBlocks.length} input-option blocks`);

              type OptionGroup = { name: string; options: { value: string; text: string }[] };
              const groups: OptionGroup[] = [];

              for (const block of Array.from(optionBlocks)) {
                // Try to derive a group name from a heading/label within the block
                const nameCandidate =
                  block.querySelector('label, .title, .name, .attribute-name, .option-name, h3, h4, strong');
                let name = nameCandidate?.textContent?.trim() || '';
                if (!name) continue;

                // Collect option texts from common child nodes (li, label, span, a, option)
                const valueNodes = block.querySelectorAll('li, label, span, a, option');
                const opts: { value: string; text: string }[] = [];
                for (const node of Array.from(valueNodes)) {
                  const text = (node as HTMLElement).textContent?.trim() || '';
                  if (!text || this.isPlaceholderValue(text)) continue;
                  const valAttr = (node as HTMLElement).getAttribute?.('value') || text;
                  opts.push({ value: valAttr.trim(), text });
                }
                const unique = Array.from(new Map(opts.map(o => [o.text, o])).values());
                if (unique.length > 0) {
                  // Normalize group name (PascalCase from words)
                  name = name.replace(/[_-]+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase());
                  groups.push({ name, options: unique });
                }
              }

              if (groups.length > 0) {
                const combine = (
                  acc: { skuSuffix: string; attrs: Record<string, string> }[],
                  group: OptionGroup,
                ) => {
                  const next: { skuSuffix: string; attrs: Record<string, string> }[] = [];
                  for (const partial of acc) {
                    for (const opt of group.options) {
                      next.push({
                        skuSuffix: partial.skuSuffix ? `${partial.skuSuffix}-${opt.value}` : opt.value,
                        attrs: { ...partial.attrs, [group.name]: opt.text },
                      });
                    }
                  }
                  return next;
                };

                const combos = groups.reduce(
                  (acc, g) => combine(acc, g),
                  [{ skuSuffix: '', attrs: {} as Record<string, string> }],
                );

                const basePrice = this.extractText(dom, '.price, [data-price], .product-price') || '';
                const baseSku = this.extractText(dom, '.sku, [data-sku], .product-sku') || 'SKU';

                for (const c of combos) {
                  variations.push({
                    sku: c.skuSuffix ? `${baseSku}-${c.skuSuffix}` : baseSku,
                    regularPrice: basePrice,
                    taxClass: '',
                    stockStatus: 'instock',
                    images: [],
                    attributeAssignments: c.attrs,
                  });
                }
              }
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
              regularPrice: parsePrice(price || ''),
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

    // Deduplicate variations by SKU
    const uniqueVariations = new Map();
    variations.forEach(variation => {
      if (!uniqueVariations.has(variation.sku)) {
        uniqueVariations.set(variation.sku, variation);
      }
    });
    const deduplicatedVariations = Array.from(uniqueVariations.values());

    if (process.env.SCRAPER_DEBUG === '1')
      console.log(`Extracted ${variations.length} variations total, ${deduplicatedVariations.length} unique after deduplication`);
    return deduplicatedVariations;
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
    return applyTransformsHelper(text, transformations);
  }

  /**
   * Apply transformations to attributes
   */
  protected applyAttributeTransformations(
    attributes: Record<string, string[]>,
    transformations: Record<string, string[]>,
  ): Record<string, string[]> {
    return applyAttributeTransforms(attributes, transformations);
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
            return parsePrice(saleText);
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
            return parsePrice(priceText);
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
