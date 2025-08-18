import * as cheerio from 'cheerio';
import { ArchivePage } from '@/types';
import { HTTPClient } from '@/lib/http-client';

export class ArchiveScraper {
  /**
   * Parse product archive page to extract product URLs and pagination info
   */
  static parseArchivePage(html: string, baseUrl: string, pageNumber: number = 1): ArchivePage {
    const $ = cheerio.load(html);
    const productUrls: string[] = [];
    
    console.log(`Parsing archive page ${pageNumber}...`);
    console.log('HTML length:', html.length);
    
    // Extract category information from the archive page
    const category = this.extractCategory($);
    if (category) {
      console.log(`Found category on archive page: ${category}`);
    }
    
    // Primary strategy: one URL per product card to avoid duplicates/misses
    const productItems = $('.woocommerce ul.products li.product');
    if (productItems.length > 0) {
      console.log(`Found ${productItems.length} product cards via li.product`);
      productItems.each((_, el) => {
        const $el = $(el);
        // Prefer the LoopProduct link, fallback to any anchor containing /product/
        const candidates = $el.find('a.woocommerce-LoopProduct-link, a[href*="/product/"]');
        let href = '';
        candidates.each((_, a) => {
          const h = ($(a).attr('href') || '').trim();
          if (h && /\/product\//.test(h) && !/add-to-cart=/.test(h)) {
            href = h;
            return false; // break
          }
          return undefined;
        });
        if (!href) return;
        try {
          const full = new URL(href, baseUrl);
          if (/\/product\//.test(full.pathname)) {
            full.search = '';
            full.hash = '';
          }
          const normalized = full.toString();
          if (!productUrls.includes(normalized)) productUrls.push(normalized);
        } catch {}
      });
    }

    // Secondary strategy: page-wide anchors (aggregate)
    const productSelectors = [
      // WooCommerce
      '.woocommerce ul.products li.product a.woocommerce-LoopProduct-link',
      '.woocommerce ul.products li.product h2.woocommerce-loop-product__title a',
      '.woocommerce ul.products li.product a',
      'a.woocommerce-LoopProduct-link',
      // Generic e-commerce
      '.products .product a',
      '.product-item a',
      '.product-link',
      '.product a',
      // Common patterns
      '[data-product-url]',
      '.product-title a',
      '.product-name a',
      // Fallback: any link that might be a product
      'a[href*="/product/"]',
      'a[href*="/shop/"]',
      'a[href*="/item/"]'
    ];
    
    // Try each selector to find product links (aggregate across selectors)
    for (const selector of productSelectors) {
      const links = $(selector);
      if (links.length > 0) {
        console.log(`Found ${links.length} links using selector: ${selector}`);
        links.each((_, link) => {
          const href = ($(link).attr('href') || '').trim();
          if (!href) return;
          // Filter to product permalinks and avoid add-to-cart or non-product links
          if (/add-to-cart=/.test(href)) return;
          // tolerate relative/encoded URLs; check path after URL resolution
          try {
            const u = new URL(href, baseUrl);
            if (!/\/product\//.test(u.pathname)) return;
            u.search = '';
            u.hash = '';
            const normalized = u.toString();
            if (!productUrls.includes(normalized)) {
              productUrls.push(normalized);
              // console.log(`Added product URL: ${normalized}`);
            }
          } catch (error) {
            console.warn(`Invalid product URL found: ${href}`, error);
          }
        });
      }
    }
    
    // Look for pagination
    const paginationInfo = this.findPagination($, baseUrl);
    
    console.log(`Archive page ${pageNumber}: Found ${productUrls.length} products, has next page: ${paginationInfo.has_next_page}`);
    
    return {
      url: baseUrl,
      page_number: pageNumber,
      product_urls: productUrls,
      has_next_page: paginationInfo.has_next_page,
      next_page_url: paginationInfo.next_page_url
    };
  }
  
  /**
   * Extract category information from archive page
   */
  private static extractCategory($: cheerio.CheerioAPI): string {
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
    
    for (const selector of categorySelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const category = element.text().trim();
        if (category) {
          console.log(`Found category using selector "${selector}": ${category}`);
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
        console.log(`Found category from canonical URL: ${category}`);
        return category;
      }
    }
    
    console.log('No category found on archive page');
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
          console.log(`Found next page URL via page-numbers after current: ${fullUrl}`);
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
          console.log(`Found next page URL via class-based selector: ${fullUrl}`);
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
          console.log(`Found next page URL via rel=next: ${fullUrl}`);
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
            console.log(`Found next page URL via numeric inference: ${fullUrl}`);
            return { has_next_page: true, next_page_url: fullUrl };
          } catch (error) {
            console.warn(`Invalid next page URL (numeric): ${href}`, error);
          }
        }
      }
      // If we could not find link for current+1 but numbers exist, synthesize URL
      const synthetic = synthesizeNextUrl(baseUrl, currentNum);
      if (synthetic) {
        console.log(`Synthesized next page URL: ${synthetic}`);
        return { has_next_page: true, next_page_url: synthetic };
      }
    }

    // Fallback: detect if multiple page numbers exist => has next page (unknown URL)
    const pageNumbers = $('.woocommerce-pagination .page-numbers a, .pagination a, .pager a');
    if (pageNumbers.length > 1) {
      console.log('Pagination detected but next URL not resolved - attempting synthesis');
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
    console.log(`Starting to scrape archive: ${archiveUrl}`);

    while (queue.length > 0 && processed < maxPages && (isUnlimited || allProductUrls.length < maxProducts)) {
      const currentUrl = queue.shift()!;
      if (visitedPages.has(currentUrl)) continue;
      visitedPages.add(currentUrl);
      processed++;

      try {
        console.log(`Scraping archive page #${processed}: ${currentUrl}`);
        const html = await HTTPClient.fetchHTML(currentUrl);
        const page = this.parseArchivePage(html, currentUrl, processed);

        // Add products
        for (const productUrl of page.product_urls) {
          if (!allProductUrls.includes(productUrl) && (isUnlimited || allProductUrls.length < maxProducts)) {
            allProductUrls.push(productUrl);
          }
        }

        // Enqueue discovered pagination pages
        const pageLinks = this.collectPaginationPageLinks(cheerio.load(html), currentUrl)
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
        const nextInfo = this.findPagination(cheerio.load(html), currentUrl);
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

    console.log(`Finished scraping archive. Total products found: ${allProductUrls.length}`);
    return allProductUrls;
  }
}
