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
  
  // Optional method for custom pagination handling (e.g., AJAX load-more)
  scrapeAllPages?: (baseUrl: string, maxProducts: number) => Promise<string[]>;
};

export class ArchiveScraper {
  // Adapter registry (ordered). First matching host wins.
  private static adapters: Array<{ test: (host: string) => boolean; adapter: ArchiveAdapter }> = [];

  /**
   * Universal product URL extraction using intelligent pattern detection
   */
  private static extractProductUrlsUniversal($: cheerio.CheerioAPI, baseUrl: string, html: string): string[] {
    // Use our new universal extraction method
    return this.extractProductUrls(html, baseUrl);
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
      '.productgrid--wrapper',
      '.collection-grid',
      '.productitem',
      '[data-label-product-handle]',
      // washdrymats.com specific containers
      '.product-item',
      '.product-card',
      '[data-product-id]',
      '.product',
      '.item',
      '.grid-item',
      // WooCommerce custom theme containers
      '.michlol-products',
      '.products.michlol-products',
      '.products-loop-3-4',
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
    
    // Shopify-specific selectors (including wash-and-dry.eu and washdrymats.com specific patterns)
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
      // washdrymats.com specific patterns
      '.product-item a[href*="/products/"]',
      '.product-card a[href*="/products/"]',
      '[data-product-id] a[href*="/products/"]',
      '.product a[href*="/products/"]',
      '.item a[href*="/products/"]',
      '.grid-item a[href*="/products/"]',
      // Generic product grid patterns
      '.productgrid a[href*="/products/"]',
      '.productgrid--wrapper a[href*="/products/"]',
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
      'a[href*="/product/"]',
      // Custom WooCommerce themes
      '.michlol-product a.woocommerce-LoopProduct-link',
      '.michlol-product a[href*="/product/"]',
      '.products.michlol-products a[href*="/product/"]'
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
      // washdrymats.com specific contexts
      '.product-item',
      '.product-card',
      '[data-product-id]',
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
        'a:contains("View More")',
        'a:contains("הצג עוד")' // Hebrew "Show More"
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

    // Strategy 3: Check for custom load-more pagination with data attributes
    const loadMoreButton = $('.load-more-button, #load-more-products');
    if (loadMoreButton.length > 0) {
      // Try multiple ways to get total pages
      const totalPages = loadMoreButton.data('total-pages') || 
                        loadMoreButton.attr('data-total-pages') || 
                        loadMoreButton.attr('data-total-pages');
      
      console.log(`[ArchiveScraper] Load-more button found, total pages: ${totalPages}, current page: ${currentPage}`);
      
      if (totalPages && parseInt(totalPages) > currentPage) {
        try {
          const url = new URL(baseUrl);
          // Add page number to path for load-more sites
          if (url.pathname.includes('/page/')) {
            url.pathname = url.pathname.replace(/\/page\/\d+/, `/page/${nextPageNum}`);
          } else {
            // Ensure we don't create double slashes
            const cleanPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
            url.pathname = cleanPath + `/page/${nextPageNum}`;
          }
          
          console.log(`[ArchiveScraper] Generated next page URL: ${url.toString()}`);
          return { has_next_page: true, next_page_url: url.toString() };
        } catch (e) {
          console.log(`[ArchiveScraper] Error generating load-more URL:`, e);
        }
      } else {
        console.log(`[ArchiveScraper] Load-more: total pages (${totalPages}) <= current page (${currentPage})`);
      }
    }

    // Strategy 4: Synthesize pagination URL
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
            // Ensure we don't create double slashes
            const cleanPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
            url.pathname = cleanPath + `/page/${nextPageNum}`;
          }
          return url.toString();
        }
      ];

      // Check if we have pagination indicators on the page
      const hasPagination = $('.pagination, .pager, .page-numbers, .load-more, .load-more-button, #load-more-products').length > 0;
      
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
    console.log(`[ArchiveScraper] Checking pagination for page ${pageNumber}...`);
    const paginationInfo = this.findPaginationUniversal($, baseUrl, pageNumber) || 
                           (adapter?.findNextPage ? (adapter.findNextPage($, baseUrl, pageNumber) || { has_next_page: false }) : this.findPagination($, baseUrl));
    
    console.log(`[ArchiveScraper] Pagination result:`, paginationInfo);
    

    
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
      // Custom WooCommerce theme selectors
      '.products-content-wrapper h1',
      '.products-loop-3-4 h1',
      'section.products-content-wrapper h1',
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
    // Check if there's a custom adapter with its own pagination logic
    const adapter = this.getAdapterForUrl(archiveUrl);
    if (adapter?.scrapeAllPages) {
      console.log(`[ArchiveScraper] Using custom adapter's scrapeAllPages method for ${archiveUrl}`);
      try {
        const result = await adapter.scrapeAllPages(archiveUrl, maxProducts);
        console.log(`[ArchiveScraper] Custom adapter returned ${result.length} products`);
        return result;
      } catch (error) {
        console.error(`[ArchiveScraper] Custom adapter failed, falling back to universal method:`, error);
      }
    }

    // Fallback to universal pagination handling
    console.log(`[ArchiveScraper] Using universal pagination method for ${archiveUrl}`);
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
        
        // Extract actual page number from URL
        let actualPageNumber = 1;
        try {
          const url = new URL(currentUrl);
          const pageMatch = url.pathname.match(/\/page\/(\d+)\/?$/);
          if (pageMatch) {
            actualPageNumber = parseInt(pageMatch[1]);
          }
        } catch {}
        
        console.log(`[ArchiveScraper] Processing URL: ${currentUrl}, actual page: ${actualPageNumber}, processed: ${processed}`);
        
        const page = this.parseArchivePage(html, currentUrl, actualPageNumber);

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

        // As a fallback, if page suggests next via findPaginationUniversal, enqueue it too
        const nextInfo = adapter?.findNextPage ? adapter.findNextPage($, currentUrl, actualPageNumber) : this.findPaginationUniversal($, currentUrl, actualPageNumber);
        console.log(`[ArchiveScraper] Pagination info for page ${actualPageNumber}:`, nextInfo);
        
        if (nextInfo.has_next_page && nextInfo.next_page_url) {
          const nextUrl = nextInfo.next_page_url;
          console.log(`[ArchiveScraper] Adding next page to queue: ${nextUrl}`);
          if (!visitedPages.has(nextUrl) && !queue.includes(nextUrl)) {
            queue.push(nextUrl);
            console.log(`[ArchiveScraper] Queue now has ${queue.length} URLs`);
          } else {
            console.log(`[ArchiveScraper] Next URL already in queue or visited`);
          }
        } else {
          console.log(`[ArchiveScraper] No next page found for page ${actualPageNumber}`);
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

  /**
   * Extract product URLs from any archive/collection page using intelligent pattern recognition
   */
  static extractProductUrls(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const productUrls = new Set<string>(); // Use Set to automatically handle duplicates
    const seenUrls = new Set<string>();

    console.log(`[Universal] Starting intelligent extraction for: ${baseUrl}`);

    // Strategy 1: Smart container-based extraction with context validation
    console.log(`[Universal] Starting extraction with ${$('a[href]').length} total links found`);
    const containerResults = this.extractFromSmartContainers($, baseUrl, seenUrls);
    console.log(`[Universal] Container strategy found ${containerResults.length} products`);
    containerResults.forEach(url => productUrls.add(url));

    // Strategy 2: Pattern-based extraction with deduplication
    if (productUrls.size === 0) {
      const patternResults = this.extractByIntelligentPatterns($, baseUrl, seenUrls);
      console.log(`[Universal] Pattern strategy found ${patternResults.length} products`);
      patternResults.forEach(url => productUrls.add(url));
    }

    // Strategy 3: Fallback to comprehensive link analysis
    if (productUrls.size === 0) {
      const fallbackResults = this.extractByComprehensiveAnalysis($, baseUrl, seenUrls);
      console.log(`[Universal] Comprehensive strategy found ${fallbackResults.length} products`);
      fallbackResults.forEach(url => productUrls.add(url));
    }
    
    // Strategy 4: Last resort - try to find any links that look like products
    if (productUrls.size === 0) {
      console.log(`[Universal] No products found with intelligent strategies, trying last resort...`);
      const lastResortResults = this.extractByLastResort($, baseUrl, seenUrls);
      console.log(`[Universal] Last resort strategy found ${lastResortResults.length} products`);
      lastResortResults.forEach(url => productUrls.add(url));
    }

    const finalUrls = Array.from(productUrls);
    console.log(`[Universal] Final extraction result: ${finalUrls.length} unique product URLs`);
    
    return finalUrls;
  }

  /**
   * Smart container-based extraction that analyzes page structure
   */
  private static extractFromSmartContainers($: cheerio.CheerioAPI, baseUrl: string, seenUrls: Set<string>): string[] {
    const productUrls: string[] = [];
    
    // Analyze page structure to find the most likely product containers
    const pageStructure = this.analyzePageStructure($);
    console.log(`[Smart Containers] Page structure analysis:`, pageStructure);

    // Use the most promising container based on analysis
    const bestContainer = this.findBestProductContainer($, pageStructure);
    
    if (bestContainer) {
      console.log(`[Smart Containers] Using best container: ${bestContainer.selector} (score: ${bestContainer.score})`);
      
      const containers = $(bestContainer.selector);
      if (containers.length > 0) {
        const productLinks = this.extractProductLinksFromContainer($, containers, baseUrl, seenUrls);
        productUrls.push(...productLinks);
      }
    }

    return productUrls;
  }

  /**
   * Analyze page structure to understand the layout
   */
  private static analyzePageStructure($: cheerio.CheerioAPI): any {
    const structure = {
      hasProductGrid: false,
      hasProductList: false,
      hasCollectionHeader: false,
      productLinkCount: 0,
      totalLinkCount: 0,
      likelyContainers: [] as Array<{selector: string, score: number, linkCount: number}>
    };

    // Count total links
    structure.totalLinkCount = $('a[href]').length;

    // Analyze potential product containers
    const containerCandidates = [
      '.productgrid', '.productgrid--items', '.collection-grid', '.productitem',
      '.collection__products', '.collection-products', '.product-grid', '.products-grid',
      '.product-list', '.shop-products', '.products-container', '.woocommerce ul.products',
      '.products', '[data-products]', '.main-products', '.category-products',
      '.product-card', '.product-item', '.card', '.item', '.product',
      // washdrymats.com specific containers
      '.product-item', '.product-card', '[data-product-id]',
      '.grid', '.list', '.container', '.content', '.main', '.products-section'
    ];

    containerCandidates.forEach(selector => {
      const containers = $(selector);
      if (containers.length > 0) {
        const productLinks = containers.find('a[href*="/products/"], a[href*="/product/"], a[href*="/shop/"]');
        const score = this.calculateContainerScore(containers, productLinks);
        
        if (score > 0) {
          structure.likelyContainers.push({
            selector,
            score,
            linkCount: productLinks.length
          });
        }
      }
    });

    // Sort by score (highest first)
    structure.likelyContainers.sort((a, b) => b.score - a.score);

    return structure;
  }

  /**
   * Calculate how likely a container is to hold products
   */
  private static calculateContainerScore(containers: cheerio.CheerioAPI, productLinks: cheerio.CheerioAPI): number {
    let score = 0;
    
    // Base score for having product links
    if (productLinks.length > 0) {
      score += productLinks.length * 10;
    }

    // Bonus for container characteristics
    const container = containers.first();
    
    // Check for product-related classes
    const classes = container.attr('class') || '';
    if (classes.includes('product') || classes.includes('grid') || classes.includes('collection')) {
      score += 20;
    }

    // Check for product-related data attributes
    if (container.attr('data-products') || container.attr('data-product-grid')) {
      score += 30;
    }

    // Check for product-related IDs
    const id = container.attr('id') || '';
    if (id.includes('product') || id.includes('collection') || id.includes('grid')) {
      score += 15;
    }

    // Reduced penalty for many links (some sites have many products)
    if (productLinks.length > 100) {
      score -= 10; // Reduced from -20
    } else if (productLinks.length > 50) {
      score -= 5;  // Reduced from -20
    }

    // Bonus for having a reasonable number of links (typical for product pages)
    if (productLinks.length >= 10 && productLinks.length <= 50) {
      score += 15;
    }

    return score;
  }

  /**
   * Find the best product container based on analysis
   */
  private static findBestProductContainer($: cheerio.CheerioAPI, structure: any): {selector: string, score: number} | null {
    if (structure.likelyContainers.length === 0) return null;
    
    // Return the highest scoring container
    return structure.likelyContainers[0];
  }

  /**
   * Extract product links from a specific container with intelligent filtering
   */
  private static extractProductLinksFromContainer($: cheerio.CheerioAPI, containers: cheerio.CheerioAPI, baseUrl: string, seenUrls: Set<string>): string[] {
    const productUrls: string[] = [];
    
    containers.each((_, container) => {
      const $container = $(container);
      
      // Look for product links with intelligent filtering
      const allLinks = $container.find('a[href]');
      
      allLinks.each((_, link) => {
        const $link = $(link);
        const href = $link.attr('href');
        
        if (href && this.isLikelyProductLink(href, $link)) {
          const url = this.normalizeUrl(href, baseUrl);
          
          if (url && !seenUrls.has(url)) {
            seenUrls.add(url);
            productUrls.push(url);
            console.log(`[Smart Containers] ✅ Added product URL: ${url}`);
          }
        }
      });
    });

    return productUrls;
  }

  /**
   * Intelligent pattern-based extraction that adapts to the site structure
   */
  private static extractByIntelligentPatterns($: cheerio.CheerioAPI, baseUrl: string, seenUrls: Set<string>): string[] {
    const productUrls: string[] = [];
    
    // Detect the site type and use appropriate patterns
    const siteType = this.detectSiteType($);
    console.log(`[Intelligent Patterns] Detected site type: ${siteType}`);

    const patterns = this.getPatternsForSiteType(siteType);
    
    for (const pattern of patterns) {
      const links = $(pattern.selector);
      if (links.length > 0) {
        console.log(`[Intelligent Patterns] Found ${links.length} links with: ${pattern.selector}`);
        
        let addedCount = 0;
        links.each((_, link) => {
          const $link = $(link);
          const href = $link.attr('href');
          
          if (href && pattern.validator(href, $link)) {
            const url = this.normalizeUrl(href, baseUrl);
            
            if (url && !seenUrls.has(url)) {
              seenUrls.add(url);
              productUrls.push(url);
              addedCount++;
              console.log(`[Intelligent Patterns] ✅ Added: ${url}`);
            }
          }
        });
        
        // Don't break after first pattern - try all patterns to get more products
        if (addedCount > 0) {
          console.log(`[Intelligent Patterns] Successfully added ${addedCount} products with pattern: ${pattern.selector}`);
        }
      }
    }

    return productUrls;
  }

  /**
   * Detect the type of e-commerce platform
   */
  private static detectSiteType($: cheerio.CheerioAPI): string {
    // Check for platform-specific indicators
    if ($('body').hasClass('shopify') || $('[data-shopify]').length > 0 || $('script[src*="shopify"]').length > 0) {
      return 'shopify';
    }
    
    if ($('body').hasClass('woocommerce') || $('.woocommerce').length > 0 || $('script[src*="woocommerce"]').length > 0) {
      return 'woocommerce';
    }
    
    if ($('body').hasClass('magento') || $('[data-mage-init]').length > 0) {
      return 'magento';
    }
    
    if ($('body').hasClass('bigcommerce') || $('[data-bc-product]').length > 0) {
      return 'bigcommerce';
    }
    
    // Check for common patterns
    if ($('a[href*="/products/"]').length > 0) {
      return 'shopify-like';
    }
    
    if ($('a[href*="/product/"]').length > 0) {
      return 'woocommerce-like';
    }
    
    return 'generic';
  }

  /**
   * Get extraction patterns based on detected site type
   */
  private static getPatternsForSiteType(siteType: string): Array<{selector: string, validator: (href: string, $link: cheerio.CheerioAPI) => boolean}> {
    const basePatterns = [
      {
        selector: 'a[href*="/products/"]',
        validator: (href: string) => href.includes('/products/') && !href.includes('/collections/')
      },
      {
        selector: 'a[href*="/product/"]',
        validator: (href: string) => href.includes('/product/') && !href.includes('/category/')
      },
      {
        selector: 'a[href*="/shop/"]',
        validator: (href: string) => href.includes('/shop/') && !href.includes('/category/')
      }
    ];

    switch (siteType) {
      case 'shopify':
      case 'shopify-like':
        return [
          ...basePatterns,
          {
            selector: '.product-card a, .product-item a, .card__heading a',
            validator: (href: string, $link: cheerio.CheerioAPI) => {
              const parent = $link.closest('.product-card, .product-item, .card');
              return parent.length > 0 && href.includes('/products/');
            }
          }
        ];
      
      case 'woocommerce':
      case 'woocommerce-like':
        return [
          ...basePatterns,
          {
            selector: '.woocommerce ul.products li.product a, .products li.product a',
            validator: (href: string, $link: cheerio.CheerioAPI) => {
              const parent = $link.closest('li.product');
              return parent.length > 0;
            }
          }
        ];
      
      default:
        return basePatterns;
    }
  }

  /**
   * Comprehensive fallback analysis for difficult sites
   */
  private static extractByComprehensiveAnalysis($: cheerio.CheerioAPI, baseUrl: string, seenUrls: Set<string>): string[] {
    const productUrls: string[] = [];
    
    console.log(`[Comprehensive Analysis] Performing deep analysis...`);
    
    // Look for any links that might be products
    const allLinks = $('a[href]');
    const potentialProducts: Array<{url: string, score: number}> = [];
    
    allLinks.each((_, link) => {
      const $link = $(link);
      const href = $link.attr('href');
      
      if (href) {
        const score = this.calculateLinkScore($link, href);
        // Lower threshold to be more inclusive
        if (score > -10) { // Changed from > 0 to > -10
          const url = this.normalizeUrl(href, baseUrl);
          if (url) {
            potentialProducts.push({ url, score });
          }
        }
      }
    });
    
    // Sort by score and take the highest scoring links
    potentialProducts.sort((a, b) => b.score - a.score);
    
    // Take more candidates to be more inclusive
    const topCandidates = potentialProducts.slice(0, 50); // Increased from 20 to 50
    
    topCandidates.forEach(({ url, score }) => {
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        productUrls.push(url);
        console.log(`[Comprehensive Analysis] ✅ Added (score: ${score}): ${url}`);
      }
    });
    
    return productUrls;
  }

  /**
   * Calculate how likely a link is to be a product
   */
  private static calculateLinkScore($link: cheerio.CheerioAPI, href: string): number {
    let score = 0;
    
    // Base score for product-like URLs
    if (href.includes('/products/') || href.includes('/product/') || href.includes('/shop/')) {
      score += 50;
    }
    
    // Check link context
    const parent = $link.parent();
    const grandparent = parent.parent();
    
    // Product-related parent classes
    const parentClasses = parent.attr('class') || '';
    if (parentClasses.includes('product') || parentClasses.includes('item') || parentClasses.includes('card')) {
      score += 30;
    }
    
    // Product-related grandparent classes
    const grandparentClasses = grandparent.attr('class') || '';
    if (grandparentClasses.includes('product') || grandparentClasses.includes('grid') || grandparentClasses.includes('list')) {
      score += 20;
    }
    
    // Check for product-related attributes
    if ($link.attr('data-product') || $link.attr('data-product-id')) {
      score += 40;
    }
    
    // Check link text for product indicators
    const linkText = $link.text().toLowerCase();
    if (linkText.includes('view') || linkText.includes('details') || linkText.includes('buy')) {
      score += 15;
    }
    
    // Penalty for navigation-like links
    if (href.includes('/collections/') || href.includes('/category/') || href.includes('/search')) {
      score -= 30;
    }
    
    return score;
  }

  /**
   * Check if a link is likely to be a product link
   */
  private static isLikelyProductLink(href: string, $link: cheerio.CheerioAPI): boolean {
    // Must contain product indicators
    if (!href.includes('/products/') && !href.includes('/product/') && !href.includes('/shop/')) {
      return false;
    }
    
    // Must not be collection/category links
    if (href.includes('/collections/') || href.includes('/category/') || href.includes('/search')) {
      return false;
    }
    
    // More permissive context checking - look for any product-related context
    const parent = $link.closest('.product-card, .product-item, .card, .item, .product, .productgrid--item, .productitem, .collection-grid, .product-grid');
    if (parent.length === 0) {
      // If no specific product container found, check if we're in a general product area
      const grandparent = $link.closest('.collection, .products, .shop, .catalog, .grid, .list');
      if (grandparent.length === 0) {
        // Last resort: check if the link itself has product-like characteristics
        const linkClasses = $link.attr('class') || '';
        const linkText = $link.text().toLowerCase();
        
        // Allow if link has product-related classes or text
        if (linkClasses.includes('product') || 
            linkClasses.includes('item') || 
            linkText.includes('view') || 
            linkText.includes('details') ||
            linkText.includes('buy')) {
          return true;
        }
        
        return false;
      }
      return true;
    }
    
    return true;
  }

  /**
   * Normalize and validate URLs
   */
  private static normalizeUrl(href: string, baseUrl: string): string | null {
    try {
      // Convert relative URLs to absolute
      const url = href.startsWith('http') ? href : new URL(href, baseUrl).href;
      
      // Basic validation
      if (!url || url === baseUrl || url === `${baseUrl}/`) {
        return null;
      }
      
      // Must be from the same domain
      const urlObj = new URL(url);
      const baseObj = new URL(baseUrl);
      if (urlObj.hostname !== baseObj.hostname) {
        return null;
      }
      
      return url;
    } catch {
      return null;
    }
  }

  /**
   * Last resort extraction - very permissive approach
   */
  private static extractByLastResort($: cheerio.CheerioAPI, baseUrl: string, seenUrls: Set<string>): string[] {
    const productUrls: string[] = [];
    
    console.log(`[Last Resort] Trying very permissive extraction...`);
    
    // Look for any links that might be products with minimal filtering
    const allLinks = $('a[href]');
    
    allLinks.each((_, link) => {
      const $link = $(link);
      const href = $link.attr('href');
      
      if (href) {
        // Very permissive filtering - just avoid obvious non-products
        if (!href.includes('/collections/') && 
            !href.includes('/category/') && 
            !href.includes('/search') &&
            !href.includes('/cart') &&
            !href.includes('/checkout') &&
            !href.includes('/account') &&
            !href.includes('/login') &&
            !href.includes('/register') &&
            !href.includes('/about') &&
            !href.includes('/contact') &&
            !href.includes('/help') &&
            !href.includes('/faq')) {
          
          const url = this.normalizeUrl(href, baseUrl);
          if (url && !seenUrls.has(url)) {
            seenUrls.add(url);
            productUrls.push(url);
            console.log(`[Last Resort] ✅ Added: ${url}`);
          }
        }
      }
    });
    
    return productUrls;
  }

  /**
   * Legacy method for backward compatibility
   */
  static extractProducts(html: string, baseUrl: string): string[] {
    return this.extractProductUrls(html, baseUrl);
  }
}
