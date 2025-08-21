// Custom adapter for wash-and-dry.eu
// This site uses Shopify with non-standard product structure

import { ArchiveScraper } from './src/lib/archive-scraper';

const washAndDryAdapter = {
  // Custom product link selectors for this Shopify site
  productLinkSelectors: [
    // Look for product links in the grid
    '.product-grid a[href*="/products/"]',
    '.collection-grid a[href*="/products/"]',
    // Fallback to any link containing /products/
    'a[href*="/products/"]'
  ],

  // Custom URL filtering - exclude non-product links
  productUrlFilter: (url, element, $, baseUrl) => {
    // Only include actual product pages
    return url.includes('/products/') && 
           !url.includes('add-to-cart') && 
           !url.includes('cart') &&
           !url.includes('collections/') &&
           !url.includes('pages/');
  },

  // Custom URL normalization for Shopify URLs
  normalizeProductUrl: (url, baseUrl) => {
    try {
      const fullUrl = new URL(url, baseUrl);
      
      // Clean up Shopify URLs - remove tracking params
      const cleanParams = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid'];
      cleanParams.forEach(param => fullUrl.searchParams.delete(param));
      
      // Ensure we have a clean product URL
      if (fullUrl.pathname.includes('/products/')) {
        return fullUrl.toString();
      }
      
      return null;
    } catch {
      return null;
    }
  },

  // Custom category extraction
  categorySelectors: [
    'h1', // The main "Bestseller" title
    '.collection-title',
    '.page-title',
    '.breadcrumb .current'
  ],

  // Custom pagination detection for Shopify
  findNextPage: ($, baseUrl, currentPage) => {
    // Look for Shopify pagination patterns
    const nextLink = $('a[rel="next"], .pagination .next a, .pagination a:contains("Next")');
    
    if (nextLink.length > 0) {
      const href = nextLink.attr('href');
      if (href) {
        try {
          const fullUrl = new URL(href, baseUrl);
          return { 
            has_next_page: true, 
            next_page_url: fullUrl.toString() 
          };
        } catch {}
      }
    }
    
    // Check for page numbers at bottom
    const pageNumbers = $('.pagination a, .page-numbers a');
    if (pageNumbers.length > 1) {
      // Look for next page number
      const currentPageNum = currentPage || 1;
      const nextPageLink = pageNumbers.filter((_, el) => {
        const text = $(el).text().trim();
        return text === String(currentPageNum + 1);
      });
      
      if (nextPageLink.length > 0) {
        const href = nextPageLink.attr('href');
        if (href) {
          try {
            const fullUrl = new URL(href, baseUrl);
            return { 
              has_next_page: true, 
              next_page_url: fullUrl.toString() 
            };
          } catch {}
        }
      }
    }
    
    return { has_next_page: false };
  },

  // Custom pagination link collection
  collectPaginationPageLinks: ($, baseUrl) => {
    const links = [];
    
    // Look for Shopify pagination
    $('.pagination a, .page-numbers a, a[rel="next"], a[rel="prev"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (href) {
        try {
          const fullUrl = new URL(href, baseUrl);
          // Clean up the URL
          const cleanParams = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid'];
          cleanParams.forEach(param => fullUrl.searchParams.delete(param));
          
          if (!links.includes(fullUrl.toString())) {
            links.push(fullUrl.toString());
          }
        } catch {}
      }
    });
    
    return links;
  }
};

// Register the adapter for wash-and-dry.eu
export function setupWashAndDryAdapter() {
  ArchiveScraper.registerAdapter('wash-and-dry.eu', washAndDryAdapter);
  console.log('✅ wash-and-dry.eu adapter registered!');
  console.log('Now when you scrape this site, custom Shopify rules will be used.');
}

// Usage:
// 1. Import and setup: import { setupWashAndDryAdapter } from './wash-and-dry-adapter';
// 2. Setup: setupWashAndDryAdapter();
// 3. Scrape normally: ArchiveScraper.scrapeAllArchivePages('https://wash-and-dry.eu/collections/bestseller');
