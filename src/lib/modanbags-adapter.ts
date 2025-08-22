import { ArchiveAdapter } from './archive-scraper';
import { HTTPClient } from './http-client';

/**
 * Custom adapter for modanbags.co.il that handles AJAX load-more pagination
 */
export const modanbagsAdapter: ArchiveAdapter = {
  // Test if this adapter should be used
  test: (host: string) => host === 'modanbags.co.il',

  // Extract product URLs from the page
  extractProductUrls: async ($: cheerio.CheerioAPI, baseUrl: string): Promise<string[]> => {
    const productUrls: string[] = [];
    const seenUrls = new Set<string>();

    console.log('[modanbags.co.il] Starting product extraction...');

    // Look for product links in the michlol-product containers
    const productLinks = $('.michlol-product a.woocommerce-LoopProduct-link, .michlol-product a[href*="/product/"]');
    console.log(`[modanbags.co.il] Found ${productLinks.length} product links`);

    productLinks.each((_, link) => {
      const href = $(link).attr('href');
      if (!href) return;

      try {
        const u = new URL(href, baseUrl);
        if (!u.pathname.includes('/product/')) return;

        if (!seenUrls.has(u.toString())) {
          seenUrls.add(u.toString());
          productUrls.push(u.toString());
        }
      } catch (e) {
        console.log(`[modanbags.co.il] Error processing link: ${href}`, e);
      }
    });

    return productUrls;
  },

  // Handle AJAX load-more pagination
  async scrapeAllPages(baseUrl: string, maxProducts: number = 0): Promise<string[]> {
    const allProductUrls: string[] = [];
    const visitedPages = new Set<string>();
    let currentPage = 1;
    const maxPages = 50; // Safety limit

    console.log(`[modanbags.co.il] Starting AJAX load-more scraping for: ${baseUrl}`);

    while (currentPage <= maxPages) {
      try {
        // Construct the AJAX URL for this page
        let pageUrl: string;
        if (currentPage === 1) {
          pageUrl = baseUrl;
        } else {
          // The website expects URLs like /shop/page/2/
          const url = new URL(baseUrl);
          if (url.pathname.includes('/page/')) {
            url.pathname = url.pathname.replace(/\/page\/\d+/, `/page/${currentPage}`);
          } else {
            const cleanPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
            url.pathname = cleanPath + `/page/${currentPage}`;
          }
          pageUrl = url.toString();
        }

        if (visitedPages.has(pageUrl)) {
          console.log(`[modanbags.co.il] Page ${currentPage} already visited, stopping`);
          break;
        }

        visitedPages.add(pageUrl);
        console.log(`[modanbags.co.il] Fetching page ${currentPage}: ${pageUrl}`);

        // Fetch the page HTML
        const html = await HTTPClient.fetchHTML(pageUrl);
        const $ = cheerio.load(html);

        // Extract products from this page
        const pageProductUrls = await this.extractProductUrls($, pageUrl);
        console.log(`[modanbags.co.il] Page ${currentPage} has ${pageProductUrls.length} products`);

        // Add new products
        let newProductsAdded = 0;
        for (const productUrl of pageProductUrls) {
          if (!allProductUrls.includes(productUrl)) {
            allProductUrls.push(productUrl);
            newProductsAdded++;
          }
        }

        console.log(`[modanbags.co.il] Added ${newProductsAdded} new products from page ${currentPage}`);

        // Check if we've reached the product limit
        if (maxProducts > 0 && allProductUrls.length >= maxProducts) {
          console.log(`[modanbags.co.il] Reached product limit of ${maxProducts}`);
          break;
        }

        // Check if there are more pages by looking for the load-more button
        const loadMoreButton = $('.load-more-button, #load-more-products');
        if (loadMoreButton.length === 0) {
          console.log(`[modanbags.co.il] No load-more button found on page ${currentPage}, stopping`);
          break;
        }

        // Check if we've reached the total pages
        const totalPages = loadMoreButton.attr('data-total-pages');
        if (totalPages && parseInt(totalPages) <= currentPage) {
          console.log(`[modanbags.co.il] Reached total pages limit: ${totalPages}`);
          break;
        }

        // If no new products were added, we might have reached the end
        if (newProductsAdded === 0) {
          console.log(`[modanbags.co.il] No new products on page ${currentPage}, stopping`);
          break;
        }

        currentPage++;

        // Be polite - wait between requests
        if (currentPage <= maxPages) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`[modanbags.co.il] Error fetching page ${currentPage}:`, error);
        break;
      }
    }

    console.log(`[modanbags.co.il] Scraping complete. Found ${allProductUrls.length} total products across ${currentPage - 1} pages`);
    return allProductUrls;
  },

  // Extract category information
  extractCategory: ($: cheerio.CheerioAPI): string => {
    // Try to find category in the page
    const categorySelectors = [
      'h1.page-title',
      'h1.entry-title',
      '.woocommerce-products-header__title',
      '.products-content-wrapper h1',
      '.products-loop-3-4 h1'
    ];

    for (const selector of categorySelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const category = element.text().trim();
        if (category) return category;
      }
    }

    // Try to extract from URL
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
    if (canonicalUrl) {
      const urlMatch = canonicalUrl.match(/\/(?:category|product-category|shop)\/([^\/\?]+)/);
      if (urlMatch && urlMatch[1]) {
        return decodeURIComponent(urlMatch[1]).replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    return '';
  },

  // Product link selectors
  productLinkSelectors: [
    '.michlol-product a.woocommerce-LoopProduct-link',
    '.michlol-product a[href*="/product/"]',
    '.products.michlol-products a[href*="/product/"]'
  ],

  // Category selectors
  categorySelectors: [
    '.products-content-wrapper h1',
    '.products-loop-3-4 h1',
    'h1.page-title',
    'h1.entry-title'
  ]
};

/**
 * Setup function to register the modanbags adapter
 */
export function setupModanbagsAdapter(): void {
  try {
    const { ArchiveScraper } = require('./archive-scraper');
    ArchiveScraper.registerAdapter('modanbags.co.il', modanbagsAdapter);
    console.log('✅ modanbags.co.il adapter registered successfully');
  } catch (error) {
    console.warn('Could not load modanbags.co.il adapter:', error);
  }
}
