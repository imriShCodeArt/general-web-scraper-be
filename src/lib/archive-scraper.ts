import * as cheerio from 'cheerio';
import { ArchivePage } from '@/types';
import { HTTPClient } from '@/lib/http-client';

// Pluggable, per-host adapter rules for tricky archives
export type ArchiveAdapter = {
  extractProductUrls?: ($: cheerio.CheerioAPI, baseUrl: string, html: string) => string[];
  productLinkSelectors?: string[];
  productUrlFilter?: (url: string, element: cheerio.Element, $: cheerio.CheerioAPI, baseUrl: string) => boolean;
  normalizeProductUrl?: (url: string, baseUrl: string) => string | null;

  extractCategory?: ($: cheerio.CheerioAPI) => string | '';
  categorySelectors?: string[];

  findNextPage?: ($: cheerio.CheerioAPI, baseUrl: string, currentPageNumber: number) => { has_next_page: boolean; next_page_url?: string };
  collectPaginationPageLinks?: ($: cheerio.CheerioAPI, baseUrl: string) => string[];
  
  // Optional method to detect variable products from archive page structure
  detectVariableProducts?: ($: cheerio.CheerioAPI, baseUrl: string) => string[];
};

export class ArchiveScraper {
  // Adapter registry (ordered). First matching host wins.
  private static adapters: Array<{ test: (host: string) => boolean; adapter: ArchiveAdapter }> = [];

  /**
   * Universal product URL extraction using intelligent pattern detection
   */
  private static extractProductUrlsUniversal($: cheerio.CheerioAPI, baseUrl: string, html: string): string[] {
    const productUrls: string[] = [];
    const seenUrls = new Set<string>();

    console.log(`[Universal] Starting extraction for: ${baseUrl}`);

    // Define common e-commerce patterns in order of specificity
    const extractionStrategies = [
      // Strategy 1: Detect and extract from product grids/containers
      () => this.extractFromProductContainers($, baseUrl, seenUrls),
      
      // Strategy 2: Shopify-specific patterns
      () => this.extractShopifyProducts($, baseUrl, seenUrls),
      
      // Strategy 3: WooCommerce patterns
      () => this.extractWooCommerceProducts($, baseUrl, seenUrls),
      
      // Strategy 4: Generic e-commerce patterns
      () => this.extractGenericEcommerceProducts($, baseUrl, seenUrls),
      
      // Strategy 5: Pattern-based URL detection
      () => this.extractByUrlPatterns($, baseUrl, seenUrls)
    ];

    // Try each strategy until we find products
    for (let i = 0; i < extractionStrategies.length; i++) {
      console.log(`[Universal] Trying strategy ${i + 1}`);
      const urls = extractionStrategies[i]();
      console.log(`[Universal] Strategy ${i + 1} found ${urls.length} products`);
      
      if (urls.length > 0) {
        console.log(`[Universal] Success with strategy ${i + 1}: ${urls.length} products found`);
        return urls;
      }
    }

    console.log(`[Universal] No products found with any strategy`);
    return [];
  }

  /**
   * Extract products from common container patterns
   */
  private static extractFromProductContainers($: cheerio.CheerioAPI, baseUrl: string, seenUrls: Set<string>): string[] {
    const productUrls: string[] = [];
    
    // Common container selectors (most specific first)
    const containerSelectors = [
      // wash-and-dry.eu specific containers
      '.productgrid',
      '.productgrid--items',
      '.collection-grid',
      '.productitem',
      '[data-label-product-handle]',
      // Standard e-commerce containers
      '.collection__products',
      '.collection-products', 
      '.product-grid',
      '.products-grid',
      '.product-list',
      '.shop-products',
      '.products-container',
      '.woocommerce ul.products',
      '.products',
      '[data-products]',
      '.main-products',
      '.category-products'
    ];

    for (const containerSelector of containerSelectors) {
      const containers = $(containerSelector);
      if (containers.length > 0) {
        console.log(`[Universal] Found container: ${containerSelector}`);
        
        // Look for product links within containers
        const productLinks = containers.find('a[href]');
        productLinks.each((_, link) => {
          const url = this.extractAndValidateProductUrl($, link, baseUrl, seenUrls);
          if (url) productUrls.push(url);
        });
        
        if (productUrls.length > 0) break;
      }
    }

    return productUrls;
  }

  /**
   * Extract Shopify products using common patterns
   */
  private static extractShopifyProducts($: cheerio.CheerioAPI, baseUrl: string, seenUrls: Set<string>): string[] {
    const productUrls: string[] = [];
    
    // Shopify-specific selectors (including wash-and-dry.eu specific patterns)
    const shopifySelectors = [
      // Standard Shopify patterns
      'a[href*="/products/"]',
      '.product-card a',
      '.product-item a',
      '.card__heading a',
      '.product-title a',
      '[data-product-handle] a',
      '.product__title a',
      // wash-and-dry.eu specific patterns
      '.productgrid--item a[href*="/products/"]',
      '.productitem--image-link[href*="/products/"]',
      'a[data-product-page-link][href*="/products/"]',
      // Generic product grid patterns
      '.productgrid a[href*="/products/"]',
      '.collection-grid a[href*="/products/"]',
      '.product-grid a[href*="/products/"]'
    ];

    for (const selector of shopifySelectors) {
      const links = $(selector);
      if (links.length > 0) {
        console.log(`[Shopify] Found ${links.length} product links with selector: ${selector}`);
        
        links.each((_, link) => {
          const href = $(link).attr('href');
          if (href && href.includes('/products/')) {
            const url = this.extractAndValidateProductUrl($, link, baseUrl, seenUrls);
            if (url) productUrls.push(url);
          }
        });
        
        if (productUrls.length > 0) break;
      }
    }

    return productUrls;
  }

  /**
   * Extract WooCommerce products
   */
  private static extractWooCommerceProducts($: cheerio.CheerioAPI, baseUrl: string, seenUrls: Set<string>): string[] {
    const productUrls: string[] = [];
    
    // WooCommerce-specific patterns
    const wooSelectors = [
      '.woocommerce ul.products li.product a.woocommerce-LoopProduct-link',
      '.woocommerce ul.products li.product a',
      '.products li.product a',
      'a.woocommerce-LoopProduct-link',
      'a[href*="/product/"]'
    ];

    for (const selector of wooSelectors) {
      const links = $(selector);
      if (links.length > 0) {
        links.each((_, link) => {
          const href = $(link).attr('href');
          if (href && (href.includes('/product/') || href.includes('/shop/'))) {
            const url = this.extractAndValidateProductUrl($, link, baseUrl, seenUrls);
            if (url) productUrls.push(url);
          }
        });
        
        if (productUrls.length > 0) break;
      }
    }

    return productUrls;
  }

  /**
   * Extract from generic e-commerce patterns
   */
  private static extractGenericEcommerceProducts($: cheerio.CheerioAPI, baseUrl: string, seenUrls: Set<string>): string[] {
    const productUrls: string[] = [];
    
    // Generic e-commerce selectors
    const genericSelectors = [
      '.product a',
      '.item a',
      '.product-item a',
      '.shop-item a',
      '[data-product-id] a',
      '[data-product-url]',
      '.product-link',
      '.item-link'
    ];

    for (const selector of genericSelectors) {
      const links = $(selector);
      if (links.length > 0) {
        links.each((_, link) => {
          const url = this.extractAndValidateProductUrl($, link, baseUrl, seenUrls);
          if (url) productUrls.push(url);
        });
        
        if (productUrls.length > 0) break;
      }
    }

    return productUrls;
  }

  /**
   * Extract by URL patterns (fallback)
   */
  private static extractByUrlPatterns($: cheerio.CheerioAPI, baseUrl: string, seenUrls: Set<string>): string[] {
    const productUrls: string[] = [];
    
    console.log(`[URL Patterns] Starting URL pattern extraction`);
    
    // Find all links with /products/ in them first
    const productLinks = $('a[href*="/products/"]');
    console.log(`[URL Patterns] Found ${productLinks.length} links containing /products/`);
    
    productLinks.each((_, link) => {
      const $link = $(link);
      const href = $link.attr('href') || '';
      
      // More lenient validation for this fallback strategy
      if (href.includes('/products/')) {
        try {
          const fullUrl = new URL(href, baseUrl);
          
          // Basic exclusions
          if (fullUrl.pathname.includes('cart') || 
              fullUrl.pathname.includes('checkout') || 
              fullUrl.search.includes('add-to-cart')) {
            return;
          }
          
          // Normalize URL
          const normalizedUrl = this.normalizeProductUrl(fullUrl);
          
          // Check for duplicates
          if (seenUrls.has(normalizedUrl)) return;
          
          seenUrls.add(normalizedUrl);
          productUrls.push(normalizedUrl);
          
        } catch (error) {
          // Skip invalid URLs
        }
      }
    });

    console.log(`[URL Patterns] Extracted ${productUrls.length} unique product URLs`);
    return productUrls;
  }

  /**
   * Extract and validate a product URL with context checking
   */
  private static extractAndValidateProductUrl($: cheerio.CheerioAPI, link: any, baseUrl: string, seenUrls: Set<string>): string | null {
    try {
      const $link = $(link);
      const href = $link.attr('href') || $link.attr('data-product-url') || '';
      
      if (!href) return null;
      
      // Create full URL
      const fullUrl = new URL(href, baseUrl);
      
      // Basic URL validation
      if (!this.isValidProductUrl(fullUrl.toString())) return null;
      
      // Context validation - avoid navigation/menu links
      if (!this.isInProductContext($, $link)) return null;
      
      // Normalize URL
      const normalizedUrl = this.normalizeProductUrl(fullUrl);
      
      // Check for duplicates
      if (seenUrls.has(normalizedUrl)) return null;
      
      seenUrls.add(normalizedUrl);
      return normalizedUrl;
      
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if URL is a valid product URL
   */
  private static isValidProductUrl(url: string): boolean {
    // Exclude non-product URLs
    const excludePatterns = [
      /add-to-cart/,
      /cart/,
      /checkout/,
      /account/,
      /login/,
      /register/,
      /search/,
      /collections?\//,
      /categories?\//,
      /tags?\//,
      /pages?\//,
      /blog/,
      /news/,
      /about/,
      /contact/,
      /terms/,
      /privacy/,
      /shipping/,
      /returns/,
      /#/,
      /javascript:/,
      /mailto:/,
      /tel:/
    ];

    return !excludePatterns.some(pattern => pattern.test(url));
  }

  /**
   * Check if link is in a product context (not navigation)
   */
  private static isInProductContext($: cheerio.CheerioAPI, $link: any): boolean {
    // Check if the link is in navigation/header/footer
    const navigationSelectors = [
      'nav',
      '.navigation',
      '.nav',
      '.menu',
      '.header',
      '.footer',
      '.sidebar',
      '.breadcrumb',
      '.breadcrumbs',
      '.pagination',
      '.filter',
      '.sort'
    ];

    for (const selector of navigationSelectors) {
      if ($link.closest(selector).length > 0) {
        return false;
      }
    }

    // Check if the link is in a product context
    const productContextSelectors = [
      // wash-and-dry.eu specific contexts
      '.productgrid--item',
      '.productitem',
      '.collection-grid',
      '[data-label-product-handle]',
      '.product-card',
      // Standard e-commerce contexts
      '.product',
      '.item',
      '.card',
      '.grid-item',
      '.product-item',
      '.shop-item',
      '.collection',
      '.category',
      '.listing',
      '.products',
      '.main',
      '.content',
      '[data-product]'
    ];

    return productContextSelectors.some(selector => $link.closest(selector).length > 0);
  }

  /**
   * Normalize product URL
   */
  private static normalizeProductUrl(url: URL): string {
    // Remove query parameters and fragments
    url.search = '';
    url.hash = '';
    
    // Remove trailing slashes
    url.pathname = url.pathname.replace(/\/+$/, '');
    
    return url.toString();
  }

  /**
   * Universal pagination detection
   */
  private static findPaginationUniversal($: cheerio.CheerioAPI, baseUrl: string, currentPage: number): { has_next_page: boolean; next_page_url?: string } | null {
    // Strategy 1: Look for next page links
    const nextSelectors = [
      'a[rel="next"]',
      'a.next',
      '.next a',
      '.pagination .next',
      '.pagination a:contains("Next")',
      '.pagination a:contains(">")',
      '.pagination a:contains("→")',
      '.pager .next',
      '.page-next a',
      '.load-more',
      'button:contains("Load More")',
      'a:contains("Show More")',
      'a:contains("View More")'
    ];

    for (const selector of nextSelectors) {
      const nextLink = $(selector).first();
      if (nextLink.length > 0) {
        const href = nextLink.attr('href');
        if (href) {
          try {
            const nextUrl = new URL(href, baseUrl);
            return { has_next_page: true, next_page_url: nextUrl.toString() };
          } catch {}
        }
      }
    }

    // Strategy 2: Look for numbered pagination
    const currentPageNum = currentPage || 1;
    const nextPageNum = currentPageNum + 1;
    
    const numberSelectors = [
      `.pagination a:contains("${nextPageNum}")`,
      `.pager a:contains("${nextPageNum}")`,
      `.page-numbers a:contains("${nextPageNum}")`
    ];

    for (const selector of numberSelectors) {
      const pageLink = $(selector).first();
      if (pageLink.length > 0) {
        const href = pageLink.attr('href');
        if (href) {
          try {
            const nextUrl = new URL(href, baseUrl);
            return { has_next_page: true, next_page_url: nextUrl.toString() };
          } catch {}
        }
      }
    }

    // Strategy 3: Synthesize pagination URL
    try {
      const url = new URL(baseUrl);
      
      // Common pagination patterns
      const paginationPatterns = [
        // Query parameter patterns
        () => {
          url.searchParams.set('page', nextPageNum.toString());
          return url.toString();
        },
        () => {
          url.searchParams.set('p', nextPageNum.toString());
          return url.toString();
        },
        () => {
          url.searchParams.set('offset', (nextPageNum * 20).toString());
          return url.toString();
        },
        // Path patterns
        () => {
          if (url.pathname.includes('/page/')) {
            url.pathname = url.pathname.replace(/\/page\/\d+/, `/page/${nextPageNum}`);
          } else {
            url.pathname += `/page/${nextPageNum}`;
          }
          return url.toString();
        }
      ];

      // Check if we have pagination indicators on the page
      const hasPagination = $('.pagination, .pager, .page-numbers, .load-more').length > 0;
      
      if (hasPagination) {
        // Try the first pattern (query parameter)
        const synthesizedUrl = paginationPatterns[0]();
        return { has_next_page: true, next_page_url: synthesizedUrl };
      }
    } catch {}

    return null;
  }

  /** Register an adapter for hosts matching pattern (string suffix or RegExp). */
  static registerAdapter(pattern: string | RegExp, adapter: ArchiveAdapter): void {
    const tester = (host: string) => {
      if (pattern instanceof RegExp) return pattern.test(host);
      const needle = pattern.toLowerCase();
      const hay = host.toLowerCase();
      return hay === needle || hay.endsWith(`.${needle}`);
    };
    this.adapters.push({ test: tester, adapter });
  }

  /** Clear all adapters (useful for tests). */
  static clearAdapters(): void {
    this.adapters = [];
  }

  /** Get adapter for a specific host (useful for debugging). */
  static getAdapter(host: string): ArchiveAdapter | null {
    const entry = this.adapters.find(a => a.test(host));
    return entry ? entry.adapter : null;
  }

  private static getAdapterForUrl(url: string): ArchiveAdapter | null {
    try {
      const { host } = new URL(url);
      const entry = this.adapters.find(a => a.test(host));
      if (entry) {
        return entry.adapter;
      }
      return null;
    } catch {
      return null;
    }
  }
  /**
   * Parse product archive page to extract product URLs and pagination info
   */
  static parseArchivePage(html: string, baseUrl: string, pageNumber: number = 1): ArchivePage {
    const $ = cheerio.load(html);
    const productUrls: string[] = [];
    const adapter = this.getAdapterForUrl(baseUrl);
    
    // Extract category information from the archive page
    const category = this.extractCategory($, adapter);
    
    // Try adapter-specific extraction first (higher priority)
    if (adapter?.extractProductUrls) {
      try {
        const urls = adapter.extractProductUrls($, baseUrl, html) || [];
        urls.forEach((u) => {
          try {
            const normalized = adapter.normalizeProductUrl ? adapter.normalizeProductUrl(u, baseUrl) : new URL(u, baseUrl).toString();
            if (normalized && !productUrls.includes(normalized)) productUrls.push(normalized);
          } catch {}
        });
        console.log(`[ArchiveScraper] Adapter extraction found ${productUrls.length} products for ${baseUrl}`);
      } catch (e) {
        console.warn('Adapter.extractProductUrls failed:', e);
      }
    }
    
    // Universal pattern-based extraction as fallback
    if (productUrls.length === 0) {
      const extractedUrls = this.extractProductUrlsUniversal($, baseUrl, html);
      extractedUrls.forEach(url => {
        if (!productUrls.includes(url)) {
          productUrls.push(url);
        }
      });
      console.log(`[ArchiveScraper] Universal extraction found ${productUrls.length} products for ${baseUrl}`);
    }

    // If no products found with universal extraction, log for debugging
    if (productUrls.length === 0) {
      console.log('[Universal] No products found with universal extraction methods');
    }
    
    // Look for pagination (universal first, adapter as fallback)
    const paginationInfo = this.findPaginationUniversal($, baseUrl, pageNumber) || 
                           (adapter?.findNextPage ? (adapter.findNextPage($, baseUrl, pageNumber) || { has_next_page: false }) : this.findPagination($, baseUrl));
    

    
    return {
      url: baseUrl,
      page_number: pageNumber,
      product_urls: productUrls,
      has_next_page: paginationInfo.has_next_page,
      next_page_url: paginationInfo.next_page_url,
      category_title: category || undefined
    };
  }
  
  /**
   * Extract category information from archive page
   */
  private static extractCategory($: cheerio.CheerioAPI, adapter?: ArchiveAdapter | null): string {
    // Try multiple selectors for category information
    const categorySelectors = [
      // Page title
      'h1.page-title',
      'h1.archive-title',
      'h1.category-title',
      '.page-title',
      '.archive-title',
      '.category-title',
      // Breadcrumbs
      '.woocommerce-breadcrumb a:last-child',
      '.breadcrumb a:last-child',
      '.breadcrumbs a:last-child',
      // Category headers
      '.category-header h1',
      '.archive-header h1',
      '.page-header h1',
      // WooCommerce specific
      '.woocommerce-products-header__title',
      '.woocommerce-products-header h1',
      // Generic selectors
      'h1[class*="title"]',
      'h1[class*="category"]',
      'h1[class*="archive"]'
    ];
    
    // Adapter override first
    if (adapter?.extractCategory) {
      try {
        const v = adapter.extractCategory($);
        if (v) return v;
      } catch (e) {
        console.warn('Adapter.extractCategory failed:', e);
      }
    }
    const mergedSelectors = [...(adapter?.categorySelectors || []), ...categorySelectors];

    for (const selector of mergedSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const category = element.text().trim();
        if (category) {
  
          return category;
        }
      }
    }
    
    // Try to extract from URL if no category found
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
    if (canonicalUrl) {
      const urlMatch = canonicalUrl.match(/\/(?:category|product-category|shop)\/([^\/\?]+)/);
      if (urlMatch && urlMatch[1]) {
        const category = decodeURIComponent(urlMatch[1]).replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        return category;
      }
    }
    
    
    return '';
  }
  
  /**
   * Find pagination information on the archive page
   */
  private static findPagination($: cheerio.CheerioAPI, baseUrl: string): { has_next_page: boolean; next_page_url?: string } {
    const normalizePaginationUrl = (rawUrl: string): string => {
      try {
        const u = new URL(rawUrl, baseUrl);
        // If WooCommerce path-based pagination is used, strip trackers
        if (/\/page\/\d+\/?$/i.test(u.pathname)) {
          u.search = '';
          u.hash = '';
          return u.toString();
        }
        // Otherwise remove common tracking params only
        const trackedParams = ['fbclid','gclid','utm_source','utm_medium','utm_campaign','utm_id','utm_term','utm_content'];
        trackedParams.forEach((p) => u.searchParams.delete(p));
        return u.toString();
      } catch {
        return rawUrl;
      }
    };

    const synthesizeNextUrl = (fromUrl: string, currentPage?: number): string | undefined => {
      try {
        const u = new URL(fromUrl, baseUrl);
        // remove trackers
        u.searchParams.delete('fbclid');
        u.searchParams.forEach((_v, k) => {
          if (k.startsWith('utm_') || k === 'gclid') u.searchParams.delete(k);
        });
        const path = u.pathname;
        // detect /page/N/
        const m = path.match(/\/(?:page)\/(\d+)\/?$/i);
        if (m) {
          const curr = parseInt(m[1]);
          const next = isNaN(curr) ? (currentPage ? currentPage + 1 : 2) : curr + 1;
          const nextPath = path.replace(/\/(?:page)\/(\d+)\/?$/i, `/page/${next}/`);
          u.pathname = nextPath;
          u.search = '';
          u.hash = '';
          return u.toString();
        }
        // if no /page/N, try appending /page/<n>/ based on current number if we have it
        const nextNum = (currentPage && currentPage > 0) ? currentPage + 1 : 2;
        let newPath = path.endsWith('/') ? `${path}page/${nextNum}/` : `${path}/page/${nextNum}/`;
        u.pathname = newPath;
        u.search = '';
        u.hash = '';
        return u.toString();
      } catch {
        return undefined;
      }
    };
    // Strategy 1: WooCommerce page-numbers: take link after current
    const current = $('.woocommerce-pagination .page-numbers .current');
    if (current.length > 0) {
      const nextLi = current.parent().next('li');
      const nextA = nextLi.find('a.page-numbers');
      const href = nextA.attr('href');
      if (href) {
        try {
          const fullUrl = normalizePaginationUrl(href);
  
          return { has_next_page: true, next_page_url: fullUrl };
        } catch (error) {
          console.warn(`Invalid next page URL (page-numbers): ${href}`, error);
        }
      }
    }

    // Strategy 2: Explicit "next" class within common containers
    const classBased = $('.woocommerce-pagination a.next, .pagination a.next, .pager a.next');
    if (classBased.length > 0) {
      const href = classBased.first().attr('href');
      if (href) {
        try {
          const fullUrl = normalizePaginationUrl(href);
  
          return { has_next_page: true, next_page_url: fullUrl };
        } catch (error) {
          console.warn(`Invalid next page URL (class-based): ${href}`, error);
        }
      }
    }

    // Strategy 3: rel="next"
    const relNext = $('a[rel="next"]');
    if (relNext.length > 0) {
      const href = relNext.first().attr('href');
      if (href) {
        try {
          const fullUrl = normalizePaginationUrl(href);
  
          return { has_next_page: true, next_page_url: fullUrl };
        } catch (error) {
          console.warn(`Invalid next page URL (rel=next): ${href}`, error);
        }
      }
    }

    // Strategy 4: Numeric inference – find current page number and look for current+1 link
    const currentNumText = current.text().trim();
    const currentNum = parseInt(currentNumText);
    if (!isNaN(currentNum)) {
      const candidate = $(`.woocommerce-pagination .page-numbers a.page-numbers:contains(${currentNum + 1})`).first();
      if (candidate.length > 0) {
        const href = candidate.attr('href');
        if (href) {
          try {
            const fullUrl = normalizePaginationUrl(href);
    
            return { has_next_page: true, next_page_url: fullUrl };
          } catch (error) {
            console.warn(`Invalid next page URL (numeric): ${href}`, error);
          }
        }
      }
      // If we could not find link for current+1 but numbers exist, synthesize URL
      const synthetic = synthesizeNextUrl(baseUrl, currentNum);
      if (synthetic) {

        return { has_next_page: true, next_page_url: synthetic };
      }
    }

    // Fallback: detect if multiple page numbers exist => has next page (unknown URL)
    const pageNumbers = $('.woocommerce-pagination .page-numbers a, .pagination a, .pager a');
    if (pageNumbers.length > 1) {

      const synthetic = synthesizeNextUrl(baseUrl);
      if (synthetic) {
        return { has_next_page: true, next_page_url: synthetic };
      }
      return { has_next_page: true };
    }

    return { has_next_page: false };
  }

  /**
   * Collect all pagination page links visible on the page and normalize them.
   */
  private static collectPaginationPageLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const links: string[] = [];
    const normalize = (rawUrl: string): string | null => {
      try {
        const u = new URL(rawUrl, baseUrl);
        // strip tracking
        ['fbclid','gclid','utm_source','utm_medium','utm_campaign','utm_id','utm_term','utm_content']
          .forEach((p) => u.searchParams.delete(p));
        // strip query for path-based pagination
        if (/\/page\/\d+\/?$/i.test(u.pathname)) {
          u.search = '';
          u.hash = '';
        }
        return u.toString();
      } catch {
        return null;
      }
    };
    // WooCommerce page numbers
    $('.woocommerce-pagination .page-numbers a.page-numbers').each((_, a) => {
      const href = ($(a).attr('href') || '').trim();
      if (!href) return;
      const n = normalize(href);
      if (n && !links.includes(n)) links.push(n);
    });
    // Generic
    $('.pagination a, .pager a, a[rel="next"]').each((_, a) => {
      const href = ($(a).attr('href') || '').trim();
      if (!href) return;
      const n = normalize(href);
      if (n && !links.includes(n)) links.push(n);
    });
    return links;
  }
  
  /**
   * Scrape all pages of an archive to get all product URLs
   */
  static async scrapeAllArchivePages(archiveUrl: string, maxProducts: number = 0): Promise<string[]> {
    const allProductUrls: string[] = [];
    const visitedPages = new Set<string>();
    const queue: string[] = [];
    const maxPages = 50; // Safety limit
    const isUnlimited = !maxProducts || maxProducts <= 0;

    // Seed queue with the first page
    queue.push(archiveUrl);
    let processed = 0;


    while (queue.length > 0 && processed < maxPages && (isUnlimited || allProductUrls.length < maxProducts)) {
      const currentUrl = queue.shift()!;
      if (visitedPages.has(currentUrl)) continue;
      visitedPages.add(currentUrl);
      processed++;

      try {

        const html = await HTTPClient.fetchHTML(currentUrl);
        const page = this.parseArchivePage(html, currentUrl, processed);

        // Add products
        for (const productUrl of page.product_urls) {
          if (!allProductUrls.includes(productUrl) && (isUnlimited || allProductUrls.length < maxProducts)) {
            allProductUrls.push(productUrl);
          }
        }

        // Enqueue discovered pagination pages (adapter-aware)
        const $ = cheerio.load(html);
        const adapter = this.getAdapterForUrl(currentUrl);
        const pageLinks = (adapter?.collectPaginationPageLinks ? adapter.collectPaginationPageLinks($, currentUrl) : this.collectPaginationPageLinks($, currentUrl))
          .sort((a, b) => {
            const ma = a.match(/\/page\/(\d+)\/?$/);
            const mb = b.match(/\/page\/(\d+)\/?$/);
            const na = ma ? parseInt(ma[1]) : 0;
            const nb = mb ? parseInt(mb[1]) : 0;
            return na - nb;
          });
        for (const link of pageLinks) {
          if (!visitedPages.has(link) && !queue.includes(link)) {
            queue.push(link);
          }
        }

        // As a fallback, if page suggests next via findPagination, enqueue it too
        const nextInfo = adapter?.findNextPage ? adapter.findNextPage($, currentUrl, processed) : this.findPagination($, currentUrl);
        if (nextInfo.has_next_page && nextInfo.next_page_url) {
          const nextUrl = nextInfo.next_page_url;
          if (!visitedPages.has(nextUrl) && !queue.includes(nextUrl)) {
            queue.push(nextUrl);
          }
        }

        // Be polite
        if (queue.length > 0 && (isUnlimited || allProductUrls.length < maxProducts)) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error scraping archive page ${processed}:`, error);
      }
    }


    return allProductUrls;
  }

  /**
   * Quickly estimate total product count using only the first page HTML.
   * - Prefer WooCommerce result count text (e.g., "Showing 1–12 of 120 results").
   * - Otherwise, use max numeric page number times first-page product count.
   * - Fall back to first-page product count when nothing else is available.
   */
  static estimateTotalFromFirstPage(html: string, baseUrl: string, maxProducts: number = 0): number {
    const $ = cheerio.load(html);
    const adapter = this.getAdapterForUrl(baseUrl);

    // 1) WooCommerce result count text
    const resultCountText = $('.woocommerce-result-count').first().text().trim();
    if (resultCountText) {
      const nums = (resultCountText.match(/\d+/g) || []).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
      // Common patterns: "1 – 12 of 120" -> take last number
      const total = nums.length > 0 ? nums[nums.length - 1] : 0;
      if (total > 0) {
        return maxProducts > 0 ? Math.min(total, maxProducts) : total;
      }
    }

    // Count products on first page
    const firstPage = this.parseArchivePage(html, baseUrl, 1);
    const firstCount = Array.isArray(firstPage.product_urls) ? firstPage.product_urls.length : 0;

    // 2) Use numeric pagination to infer total pages
    let totalPages = 0;
    const pageNumbers = $('.woocommerce-pagination .page-numbers a.page-numbers')
      .map((_, a) => parseInt(($(a).text() || '').trim(), 10))
      .get()
      .filter((n: number) => !isNaN(n));
    if (pageNumbers.length > 0) {
      totalPages = Math.max(...pageNumbers);
    }

    // Some themes render the last page in a span.current; include it if larger
    const currentNum = parseInt(($('.woocommerce-pagination .page-numbers .current').text() || '').trim(), 10);
    if (!isNaN(currentNum)) {
      totalPages = Math.max(totalPages, currentNum);
    }

    if (totalPages > 0 && firstCount > 0) {
      const estimated = totalPages * firstCount;
      return maxProducts > 0 ? Math.min(estimated, maxProducts) : estimated;
    }

    // 3) If adapter indicates next page exists, conservatively assume at least two pages
    const hasNext = adapter?.findNextPage ? adapter.findNextPage($, baseUrl, 1).has_next_page : this.findPagination($, baseUrl).has_next_page;
    if (hasNext && firstCount > 0) {
      const estimated = firstCount * 2; // conservative lower-bound estimate
      return maxProducts > 0 ? Math.min(estimated, maxProducts) : estimated;
    }

    // Fallback
    return maxProducts > 0 ? Math.min(firstCount, maxProducts) : firstCount;
  }
}
