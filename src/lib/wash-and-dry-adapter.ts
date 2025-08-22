// Custom adapter for wash-and-dry.eu and washdrymats.com
// These sites use Shopify with non-standard product structure

import { ArchiveScraper, ArchiveAdapter } from './archive-scraper';
import { HTTPClient } from './http-client';
import * as cheerio from 'cheerio';

const washAndDryAdapter: ArchiveAdapter = {
  // Custom product link selectors for these Shopify sites
  productLinkSelectors: [
    // wash-and-dry.eu specific selectors (based on the actual HTML structure)
    '.productitem--image-link[href*="/products/"]',
    '.productgrid--item a[href*="/products/"]',
    '.productitem a[href*="/products/"]',
    // Look for product links in the grid
    '.product-grid a[href*="/products/"]',
    '.collection-grid a[href*="/products/"]',
    '.productitem a[href*="/products/"]',
    '.productgrid--item a[href*="/products/"]',
    '.productgrid--wrapper a[href*="/products/"]',
    // washdrymats.com specific selectors
    'a[href*="/products/"]',
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
    // wash-and-dry.eu specific selectors
    'h1', // The main collection title (like "New")
    '.collection-title',
    '.page-title',
    '.breadcrumb .current',
    '.collection-header h1',
    // Look for collection titles in the page content
    '.collection-description h1',
    '.collection-intro h1',
    // Fallback to any h1 that looks like a collection title
    'h1:contains("collections")',
    'h1:contains("collection")'
  ],

  // Custom pagination detection for Shopify
  findNextPage: ($, baseUrl, currentPage) => {
    console.log(`[wash-and-dry.eu] Looking for pagination on page ${currentPage}`);
    
    // Strategy 1: Look for explicit "Next" links
    const nextLink = $('a[rel="next"], .pagination .next a, .pagination a:contains("Next")');
    if (nextLink.length > 0) {
      const href = nextLink.attr('href');
      if (href) {
        try {
          const fullUrl = new URL(href, baseUrl);
          console.log(`[wash-and-dry.eu] Found next link: ${fullUrl.toString()}`);
          return { 
            has_next_page: true, 
            next_page_url: fullUrl.toString() 
          };
        } catch {}
      }
    }
    
    // Strategy 2: Look for numbered pagination (like "1, 2, 3, Next")
    const pageNumbers = $('.pagination--item, .pagination a, .page-numbers a, nav a');
    console.log(`[wash-and-dry.eu] Found ${pageNumbers.length} pagination links`);
    
    if (pageNumbers.length > 1) {
      // Look for next page number
      const currentPageNum = currentPage || 1;
      const nextPageLink = pageNumbers.filter((_, el) => {
        const text = $(el).text().trim();
        const isNextPage = text === String(currentPageNum + 1);
        console.log(`[wash-and-dry.eu] Checking link "${text}" against next page ${currentPageNum + 1}: ${isNextPage}`);
        return isNextPage;
      });
      
      if (nextPageLink.length > 0) {
        const href = nextPageLink.attr('href');
        if (href) {
          try {
            const fullUrl = new URL(href, baseUrl);
            console.log(`[wash-and-dry.eu] Found next page link: ${fullUrl.toString()}`);
            return { 
              has_next_page: true, 
              next_page_url: fullUrl.toString() 
            };
          } catch {}
        }
      }
    }
    
    // Strategy 3: Look for any pagination indicators
    const hasPagination = $('.pagination, .page-numbers, nav').length > 0;
    if (hasPagination) {
      console.log(`[wash-and-dry.eu] Found pagination indicators but no next page link`);
    }
    
    return { has_next_page: false };
  },

  // Custom method to collect all pagination page links for wash-and-dry.eu
  collectPaginationPageLinks: ($, baseUrl) => {
    const pageLinks: string[] = [];
    
    // Look for numbered pagination links
    const pageNumbers = $('.pagination--item, .pagination a, .page-numbers a, nav a');
    console.log(`[wash-and-dry.eu] Collecting pagination links: found ${pageNumbers.length} links`);
    
    pageNumbers.each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      const text = $el.text().trim();
      
      if (href && text.match(/^\d+$/)) { // Only numeric page numbers
        try {
          const fullUrl = new URL(href, baseUrl);
          pageLinks.push(fullUrl.toString());
          console.log(`[wash-and-dry.eu] Added pagination link: ${text} -> ${fullUrl.toString()}`);
        } catch {}
      }
    });
    
    console.log(`[wash-and-dry.eu] Collected ${pageLinks.length} pagination page links`);
    return pageLinks;
  },

  // Custom method to handle all pagination for wash-and-dry.eu
  scrapeAllPages: async (baseUrl: string, maxProducts: number) => {
    console.log(`[wash-and-dry.eu] Starting custom pagination for ${baseUrl}`);
    
    const allProductUrls: string[] = [];
    const visitedPages = new Set<string>();
    const queue: string[] = [baseUrl];
    const maxPages = 10; // Safety limit for wash-and-dry.eu
    
    let processed = 0;
    
    while (queue.length > 0 && processed < maxPages) {
      const currentUrl = queue.shift()!;
      if (visitedPages.has(currentUrl)) continue;
      visitedPages.add(currentUrl);
      processed++;
      
      console.log(`[wash-and-dry.eu] Processing page ${processed}: ${currentUrl}`);
      
      try {
        const html = await HTTPClient.fetchHTML(currentUrl);
        const $ = cheerio.load(html);
        
        // Extract products from current page
        const productLinks = $('.productitem--image-link[href*="/products/"], .productgrid--item a[href*="/products/"], .productitem a[href*="/products/"]');
        console.log(`[wash-and-dry.eu] Found ${productLinks.length} products on page ${processed}`);
        
        productLinks.each((_, link) => {
          const href = $(link).attr('href');
          if (href) {
            try {
              const fullUrl = new URL(href, baseUrl);
              if (fullUrl.pathname.includes('/products/')) {
                const cleanUrl = fullUrl.toString();
                if (!allProductUrls.includes(cleanUrl)) {
                  allProductUrls.push(cleanUrl);
                  console.log(`[wash-and-dry.eu] Added product: ${cleanUrl}`);
                }
              }
            } catch {}
          }
        });
        
        // Look for pagination links
        const pageNumbers = $('.pagination--item, .pagination a, .page-numbers a, nav a');
        console.log(`[wash-and-dry.eu] Found ${pageNumbers.length} pagination links on page ${processed}`);
        
        // Add next pages to queue
        pageNumbers.each((_, el) => {
          const $el = $(el);
          const href = $el.attr('href');
          const text = $el.text().trim();
          
          if (href && text.match(/^\d+$/)) { // Only numeric page numbers
            try {
              const fullUrl = new URL(href, baseUrl);
              const pageUrl = fullUrl.toString();
              if (!visitedPages.has(pageUrl) && !queue.includes(pageUrl)) {
                queue.push(pageUrl);
                console.log(`[wash-and-dry.eu] Added page to queue: ${text} -> ${pageUrl}`);
              }
            } catch {}
          }
        });
        
        // Check if we have enough products
        if (maxProducts > 0 && allProductUrls.length >= maxProducts) {
          console.log(`[wash-and-dry.eu] Reached max products limit: ${allProductUrls.length}`);
          break;
        }
        
        // Be polite between requests
        if (queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`[wash-and-dry.eu] Error processing page ${processed}:`, error);
      }
    }
    
    console.log(`[wash-and-dry.eu] Completed pagination. Found ${allProductUrls.length} products across ${processed} pages`);
    return allProductUrls;
  },


};

// Create a specific adapter for washdrymats.com
const washDryMatsAdapter: ArchiveAdapter = {
  ...washAndDryAdapter,
  
  // Override product URL extraction for washdrymats.com
  extractProductUrls: ($, baseUrl, html) => {
    const productUrls: string[] = [];
    const seenHandles = new Set<string>();

    console.log('[washdrymats.com] Starting custom extraction');

    // Strategy 1: Look for product cards/containers first
    const productCards = $('.product-item, .product-card, [data-product-id], .product, .productgrid--item, .productitem');
    console.log(`[washdrymats.com] Found ${productCards.length} product cards`);

    if (productCards.length > 0) {
      // Extract from product cards to avoid duplicate counting
      productCards.each((_, card) => {
        const $card = $(card);
        
        // Look for the main product link within this card
        const productLink = $card.find('a[href*="/products/"]').first();
        if (productLink.length === 0) return;
        
        const href = productLink.attr('href');
        if (!href) return;
        
        try {
          const u = new URL(href, baseUrl);
          if (!u.pathname.includes('/products/')) return;
          
          // Extract Shopify handle and canonicalize
          const m = u.pathname.match(/\/products\/([^\/?#]+)/);
          if (!m) return;
          
          const handle = m[1].toLowerCase();
          if (seenHandles.has(handle)) return;
          
          seenHandles.add(handle);
          const canonical = `${u.origin}/products/${handle}`;
          productUrls.push(canonical);
          
        } catch (e) {
          console.log(`[washdrymats.com] Error processing card link: ${href}`, e);
        }
      });
    }

    // Strategy 2: Look for product links in the main content area
    if (productUrls.length === 0) {
      console.log('[washdrymats.com] No product cards found, looking for main content product links');
      
      // Look for product links in the main content area, excluding navigation
      const mainContent = $('main, .main, .content, .collection-products, .products-grid, .productgrid--wrapper');
      if (mainContent.length > 0) {
        const productLinks = mainContent.find('a[href*="/products/"]');
        console.log(`[washdrymats.com] Found ${productLinks.length} product links in main content`);

        productLinks.each((_, link) => {
          const href = $(link).attr('href');
          if (!href) return;
          
          try {
            const u = new URL(href, baseUrl);
            if (!u.pathname.includes('/products/')) return;
            
            // Skip cart/checkout links
            if (u.pathname.includes('cart') || u.pathname.includes('checkout') || u.search.includes('add-to-cart')) {
              return;
            }
            
            // Extract Shopify handle and canonicalize
            const m = u.pathname.match(/\/products\/([^\/?#]+)/);
            if (!m) return;
            
            const handle = m[1].toLowerCase();
            if (seenHandles.has(handle)) return;
            
            seenHandles.add(handle);
            const canonical = `${u.origin}/products/${handle}`;
            productUrls.push(canonical);
            
          } catch (e) {
            console.log(`[washdrymats.com] Error processing link: ${href}`, e);
          }
        });
      }
    }

    // Strategy 3: Fallback to comprehensive link scanning
    if (productUrls.length === 0) {
      console.log('[washdrymats.com] No products found in main content, trying comprehensive scan');
      
      const productLinks = $('a[href*="/products/"]');
      console.log(`[washdrymats.com] Found ${productLinks.length} total product links`);

      productLinks.each((_, link) => {
        const href = $(link).attr('href');
        if (!href) return;
        
        try {
          const u = new URL(href, baseUrl);
          if (!u.pathname.includes('/products/')) return;
          
          // Skip cart/checkout links
          if (u.pathname.includes('cart') || u.pathname.includes('checkout') || u.search.includes('add-to-cart')) {
            return;
          }
          
          // Extract Shopify handle and canonicalize
          const m = u.pathname.match(/\/products\/([^\/?#]+)/);
          if (!m) return;
          
          const handle = m[1].toLowerCase();
          if (seenHandles.has(handle)) return;
          
          seenHandles.add(handle);
          const canonical = `${u.origin}/products/${handle}`;
          productUrls.push(canonical);
          
        } catch (e) {
          console.log(`[washdrymats.com] Error processing link: ${href}`, e);
        }
      });
    }

    console.log(`[washdrymats.com] Extracted ${productUrls.length} unique product URLs`);
    return productUrls;
  }
};

// Create a product scraper adapter for washdrymats.com product pages
export const washDryMatsProductAdapter = {
  // Enhanced title extraction for washdrymats.com
  extractTitle: ($: any) => {
    // Look for the main product title
    const titleSelectors = [
      'h1:contains("Floor Mats"), h1:contains("Floor Mat"), h1:contains("Mats"), h1:contains("Mat")',
      'h1',
      '.product-title',
      '[data-product-title]',
      '.product__title'
    ];
    
    for (const selector of titleSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const title = element.text().trim();
        if (title && title.length > 0) {
          return title;
        }
      }
    }
    
    return '';
  },

  // Enhanced description extraction
  extractDescription: ($: any) => {
    // Look for the main product description
    const descSelectors = [
      '.description',
      '[data-product-description]',
      '.product__description',
      '.product-description',
      'section:contains("Description")',
      'div:contains("Description")'
    ];
    
    for (const selector of descSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const description = element.text().trim();
        if (description && description.length > 10) {
          return description;
        }
      }
    }
    
    // Fallback: look for any text content that might be description
    const mainContent = $('main, .main, .content');
    if (mainContent.length > 0) {
      const paragraphs = mainContent.find('p');
      const descriptions: string[] = [];
      
      paragraphs.each((_: any, p: any) => {
        const text = $(p).text().trim();
        if (text.length > 20 && !text.includes('$') && !text.includes('Add to cart')) {
          descriptions.push(text);
        }
      });
      
      if (descriptions.length > 0) {
        return descriptions.join('\n\n');
      }
    }
    
    return '';
  },

  // Enhanced price extraction
  extractRegularPrice: ($: any) => {
    // Look for original price (crossed out)
    const priceSelectors = [
      '.original-price',
      '.price .original',
      '.price del',
      '.price .strike',
      '[data-original-price]',
      'span:contains("Original price")'
    ];
    
    for (const selector of priceSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const price = element.text().trim();
        if (price && price.includes('$')) {
          const cleanPrice = price.replace(/[^\d.]/g, '');
          if (cleanPrice && parseFloat(cleanPrice) > 0) {
            return cleanPrice;
          }
        }
      }
    }
    
    return '';
  },

  extractSalePrice: ($: any) => {
    // Look for current/sale price
    const priceSelectors = [
      '.current-price',
      '.price .current',
      '.price .sale',
      '[data-current-price]',
      'span:contains("Current price")',
      '.price:not(.original)'
    ];
    
    for (const selector of priceSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const price = element.text().trim();
        if (price && price.includes('$')) {
          const cleanPrice = price.replace(/[^\d.]/g, '');
          if (cleanPrice && parseFloat(cleanPrice) > 0) {
            return cleanPrice;
          }
        }
      }
    }
    
    return '';
  },

  // Enhanced image extraction
  extractImages: ($: any) => {
    const images: string[] = [];
    
    // Look for product images in various selectors
    const imageSelectors = [
      '.product-images img',
      '.product__images img',
      '[data-product-images] img',
      '.product-gallery img',
      '.product__gallery img',
      'img[alt*="Floor Mat"], img[alt*="Floor Mats"]',
      'img[alt*="Mat"], img[alt*="Mats"]'
    ];
    
    for (const selector of imageSelectors) {
      const imgElements = $(selector);
      imgElements.each((_: any, img: any) => {
        const src = $(img).attr('src');
        const dataSrc = $(img).attr('data-src');
        const srcset = $(img).attr('srcset');
        
        if (src && !images.includes(src)) {
          images.push(src);
        }
        if (dataSrc && !images.includes(dataSrc)) {
          images.push(dataSrc);
        }
        if (srcset) {
          // Extract first image from srcset
          const firstSrc = srcset.split(',')[0].split(' ')[0];
          if (firstSrc && !images.includes(firstSrc)) {
            images.push(firstSrc);
          }
        }
      });
    }
    
    return images;
  },

  // Enhanced attribute extraction
  extractAttributes: ($: any) => {
    const attributes: { [key: string]: string[] } = {};
    
    // Extract size information
    const sizeElements = $('*:contains("Size:"), *:contains("size:"), *:contains("20"x"27.5"), *:contains("S68")');
    if (sizeElements.length > 0) {
      const sizes: string[] = [];
      sizeElements.each((_: any, el: any) => {
        const text = $(el).text();
        const sizeMatch = text.match(/(\d+(?:\.\d+)?"x\d+(?:\.\d+)?")/g);
        if (sizeMatch) {
          sizes.push(...sizeMatch);
        }
        const codeMatch = text.match(/S\d+/g);
        if (codeMatch) {
          sizes.push(...codeMatch);
        }
      });
      if (sizes.length > 0) {
        attributes.Size = Array.from(new Set(sizes));
      }
    }
    
    // Extract material information
    const materialElements = $('*:contains("nylon"), *:contains("Nylon"), *:contains("rubber"), *:contains("Rubber")');
    if (materialElements.length > 0) {
      const materials: string[] = [];
      materialElements.each((_: any, el: any) => {
        const text = $(el).text();
        if (text.includes('nylon') || text.includes('Nylon')) {
          materials.push('Nylon');
        }
        if (text.includes('rubber') || text.includes('Rubber')) {
          materials.push('Rubber');
        }
      });
      if (materials.length > 0) {
        attributes.Material = Array.from(new Set(materials));
      }
    }
    
    // Extract warranty information
    const warrantyElements = $('*:contains("5 Year"), *:contains("5 year"), *:contains("warranty")');
    if (warrantyElements.length > 0) {
      attributes.Warranty = ['5 Year Warranty'];
    }
    
    // Extract features
    const features: string[] = [];
    const featureElements = $('*:contains("washable"), *:contains("Washable"), *:contains("machine wash"), *:contains("slip resistant")');
    featureElements.each((_: any, el: any) => {
      const text = $(el).text();
      if (text.includes('washable') || text.includes('Washable')) {
        features.push('Machine Washable');
      }
      if (text.includes('slip resistant')) {
        features.push('Slip Resistant');
      }
      if (text.includes('low profile')) {
        features.push('Low Profile');
      }
    });
    if (features.length > 0) {
      attributes.Features = Array.from(new Set(features));
    }
    
    return attributes;
  },

  // Enhanced variation extraction
  extractVariations: ($: any) => {
    const variations: any[] = [];
    
    // Look for size variants
    const variantElements = $('*:contains("Choose a variant"), *:contains("Size:"), *:contains("S68")');
    if (variantElements.length > 0) {
      variantElements.each((_: any, el: any) => {
        const text = $(el).text();
        const sizeMatch = text.match(/(\d+(?:\.\d+)?"x\d+(?:\.\d+)?")/g);
        const codeMatch = text.match(/S\d+/g);
        
        if (sizeMatch && codeMatch) {
          variations.push({
            size: sizeMatch[0],
            code: codeMatch[0],
            price: '', // Will be filled by price extraction
            sku: codeMatch[0]
          });
        }
      });
    }
    
    return variations;
  },

  // Enhanced SKU extraction
  extractSKU: ($: any) => {
    // Look for product codes like S68
    const skuElements = $('*:contains("S68"), *:contains("S-68"), *:contains("SKU:")');
    if (skuElements.length > 0) {
      for (const el of skuElements) {
        const text = $(el).text();
        const skuMatch = text.match(/S\d+/);
        if (skuMatch) {
          return skuMatch[0];
        }
      }
    }
    
    return '';
  }
};

// Register the adapters for both sites
export function setupWashAndDryAdapter(): void {
  ArchiveScraper.registerAdapter('wash-and-dry.eu', washAndDryAdapter);
  ArchiveScraper.registerAdapter('washdrymats.com', washDryMatsAdapter);
  console.log('✅ wash-and-dry.eu and washdrymats.com adapters registered!');
  console.log('Now when you scrape these sites, custom Shopify rules will be used.');
}

// Usage:
// 1. Import and setup: import { setupWashAndDryAdapter } from './wash-and-dry-adapter';
// 2. Setup: setupWashAndDryAdapter();
// 3. Scrape normally: ArchiveScraper.scrapeAllArchivePages('https://washdrymats.com/collections/clearance');
