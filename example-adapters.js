// Example: How to use the new Archive Adapter system
// This file shows how to register custom scraping rules for specific websites

import { ArchiveScraper } from './src/lib/archive-scraper';

// Example 1: Custom product link selectors for a non-standard e-commerce site
const customSiteAdapter = {
  // Override the default product link selectors
  productLinkSelectors: [
    '.product-grid .item a.product-link',
    '.catalog .product a',
    '[data-product-url]'
  ],
  
  // Custom URL filtering (e.g., exclude certain types of links)
  productUrlFilter: (url, element, $, baseUrl) => {
    // Only include product pages, exclude cart/add-to-cart
    return !url.includes('add-to-cart') && 
           !url.includes('cart') && 
           (url.includes('/product/') || url.includes('/item/'));
  },
  
  // Custom URL normalization
  normalizeProductUrl: (url, baseUrl) => {
    try {
      const fullUrl = new URL(url, baseUrl);
      // Remove tracking parameters
      fullUrl.searchParams.delete('utm_source');
      fullUrl.searchParams.delete('utm_medium');
      fullUrl.searchParams.delete('gclid');
      return fullUrl.toString();
    } catch {
      return null;
    }
  },
  
  // Custom category extraction
  categorySelectors: [
    '.breadcrumb .current',
    '.page-header h1',
    '.category-title'
  ],
  
  // Custom pagination detection
  findNextPage: ($, baseUrl, currentPage) => {
    const nextLink = $('a.next, .pagination .next a, a[rel="next"]');
    if (nextLink.length > 0) {
      const href = nextLink.attr('href');
      if (href) {
        return { 
          has_next_page: true, 
          next_page_url: new URL(href, baseUrl).toString() 
        };
      }
    }
    return { has_next_page: false };
  }
};

// Example 2: Adapter for a site with JavaScript-heavy pagination
const jsPaginationAdapter = {
  // Custom pagination link collection
  collectPaginationPageLinks: ($, baseUrl) => {
    const links = [];
    // Look for pagination in data attributes or custom classes
    $('[data-page], .page-link, .pagination-item').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || $el.attr('data-url');
      if (href) {
        try {
          const fullUrl = new URL(href, baseUrl);
          links.push(fullUrl.toString());
        } catch {}
      }
    });
    return links;
  }
};

// Example 3: Adapter for a site with completely custom structure
const customStructureAdapter = {
  // Full custom extraction logic
  extractProductUrls: ($, baseUrl, html) => {
    const urls = [];
    
    // Look for products in a custom data structure
    $('[data-product]').each((_, el) => {
      const $el = $(el);
      const productId = $el.attr('data-product');
      if (productId) {
        // Construct product URL from ID
        const productUrl = `${baseUrl}/product/${productId}`;
        urls.push(productUrl);
      }
    });
    
    // Also check for JSON-LD structured data
    $('script[type="application/ld+json"]').each((_, script) => {
      try {
        const data = JSON.parse($(script).html());
        if (data['@type'] === 'ItemList' && data.itemListElement) {
          data.itemListElement.forEach(item => {
            if (item.url) {
              urls.push(new URL(item.url, baseUrl).toString());
            }
          });
        }
      } catch {}
    });
    
    return urls;
  }
};

// Register the adapters
export function setupExampleAdapters() {
  // Register for specific domains
  ArchiveScraper.registerAdapter('customsite.com', customSiteAdapter);
  ArchiveScraper.registerAdapter('jspagination.com', jsPaginationAdapter);
  ArchiveScraper.registerAdapter('customstructure.com', customStructureAdapter);
  
  // Register for multiple subdomains
  ArchiveScraper.registerAdapter('shop.example.com', customSiteAdapter);
  
  // Register using regex for pattern matching
  ArchiveScraper.registerAdapter(/\.mystore\.com$/, customSiteAdapter);
  
  console.log('✅ Example adapters registered!');
  console.log('Now when you scrape archives from these sites, custom rules will be used.');
}

// Usage in your scraping code:
// 1. Import and setup adapters
// import { setupExampleAdapters } from './example-adapters';
// setupExampleAdapters();
//
// 2. Then use ArchiveScraper normally - it will automatically use custom rules
// const urls = await ArchiveScraper.scrapeAllArchivePages('https://customsite.com/shop');
