// Custom adapter for wash-and-dry.eu and washdrymats.com
// These sites use Shopify with non-standard product structure

import { ArchiveScraper, ArchiveAdapter } from './archive-scraper';
import { HTTPClient } from './http-client';
import * as cheerio from 'cheerio';

export const washAndDryAdapter: ArchiveAdapter = {
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

  // Detect variable products for wash-and-dry.eu
  detectVariableProducts: ($: any, baseUrl: string) => {
    console.log('[wash-and-dry] Detecting variable products...');
    
    const variableProductHandles: string[] = [];
    
    // Look for products with size variants
    const productLinks = $('a[href*="/products/"]');
    productLinks.each((_: any, link: any) => {
      const href = $(link).attr('href');
      if (href) {
        try {
          const url = new URL(href, baseUrl);
          if (url.pathname.includes('/products/')) {
            // Check if this product has size variants mentioned nearby
            const $link = $(link);
            const nearbyText = $link.closest('.productitem, .productgrid--item, .product-item').text();
            
            // Look for size indicators
            if (nearbyText.includes('50x75cm') || 
                nearbyText.includes('75x120cm') || 
                nearbyText.includes('60x180cm') || 
                nearbyText.includes('75x190cm') || 
                nearbyText.includes('115x175cm') ||
                nearbyText.includes('Wählen Sie eine Variante') ||
                nearbyText.includes('Choose a variant')) {
              
              const handle = url.pathname.split('/products/')[1];
              if (handle && !variableProductHandles.includes(handle)) {
                variableProductHandles.push(handle);
                console.log(`[wash-and-dry] Found variable product: ${handle}`);
              }
            }
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    console.log(`[wash-and-dry] Detected ${variableProductHandles.length} variable products`);
    return variableProductHandles;
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
  // Enhanced product type detection for wash-and-dry.eu
  getProductType: ($: any) => {
    console.log('[wash-and-dry] Detecting product type...');
    
    // Look for Shopify variant selectors
    const hasVariantSelector = $('select[name*="Size"], select[name*="size"], .variant-selector, .product-options select').length > 0;
    if (hasVariantSelector) {
      console.log('[wash-and-dry] Product type: variable (variant selector found)');
      return 'variable';
    }
    
    // Look for variant radio buttons
    const hasVariantButtons = $('input[type="radio"][name*="Size"], input[type="radio"][name*="size"]').length > 0;
    if (hasVariantButtons) {
      console.log('[wash-and-dry] Product type: variable (variant buttons found)');
      return 'variable';
    }
    
    // Look for size options in text
    const hasSizeOptions = $('*:contains("50x75cm"), *:contains("75x120cm"), *:contains("60x180cm"), *:contains("75x190cm"), *:contains("115x175cm")').length > 0;
    if (hasSizeOptions) {
      console.log('[wash-and-dry] Product type: variable (size options found)');
      return 'variable';
    }
    
    // Look for "Wählen Sie eine Variante" text
    const hasVariantText = $('*:contains("Wählen Sie eine Variante"), *:contains("Choose a variant")').length > 0;
    if (hasVariantText) {
      console.log('[wash-and-dry] Product type: variable (variant selection text found)');
      return 'variable';
    }
    
    console.log('[wash-and-dry] Product type: simple (no variants detected)');
    return 'simple';
  },
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

  // Enhanced variation extraction for wash-and-dry.eu
  extractVariations: ($: any) => {
    const variations: any[] = [];
    
    console.log('[wash-and-dry] Starting enhanced variation extraction...');
    
    // Method 1: Look for Shopify variant selectors (most reliable)
    const variantSelect = $('select[name*="Size"], select[name*="size"], .variant-selector, .product-options select');
    if (variantSelect.length > 0) {
      console.log('[wash-and-dry] Found variant selector, extracting options...');
      
      variantSelect.each((_: any, select: any) => {
        const $select = $(select);
        const options = $select.find('option');
        
        options.each((_: any, option: any) => {
          const $option = $(option);
          const optionText = $option.text().trim();
          const optionValue = $option.attr('value') || optionText;
          
          if (optionText && optionText !== 'Wählen Sie eine Variante' && optionText !== 'Choose a variant') {
            // Parse size and price from option text (e.g., "50x75cm - €47,50")
            const sizePriceMatch = optionText.match(/(\d+(?:\.\d+)?x\d+(?:\.\d+)?(?:cm|m)?)\s*-\s*€?(\d+(?:,\d+)?)/);
            
            if (sizePriceMatch) {
              const size = sizePriceMatch[1];
              const price = sizePriceMatch[2].replace(',', '.');
              
              variations.push({
                size: size,
                price: price,
                sku: optionValue,
                stock_status: 'instock',
                regular_price: price,
                meta: {
                  attribute_size: size
                }
              });
              
              console.log(`[wash-and-dry] Added variation: ${size} - €${price}`);
            } else {
              // Fallback: just extract size if no price found
              const sizeMatch = optionText.match(/(\d+(?:\.\d+)?x\d+(?:\.\d+)?(?:cm|m)?)/);
              if (sizeMatch) {
                variations.push({
                  size: sizeMatch[1],
                  price: '',
                  sku: optionValue,
                  stock_status: 'instock',
                  regular_price: '',
                  meta: {
                    attribute_size: sizeMatch[1]
                  }
                });
                
                console.log(`[wash-and-dry] Added variation (no price): ${sizeMatch[1]}`);
              }
            }
          }
        });
      });
    }
    
    // Method 2: Look for variant buttons or radio buttons
    if (variations.length === 0) {
      const variantButtons = $('input[type="radio"][name*="Size"], input[type="radio"][name*="size"], .variant-option input[type="radio"]');
      if (variantButtons.length > 0) {
        console.log('[wash-and-dry] Found variant radio buttons, extracting options...');
        
        variantButtons.each((_: any, button: any) => {
          const $button = $(button);
          const buttonText = $button.closest('label, .variant-option').text().trim();
          const buttonValue = $button.attr('value') || buttonText;
          
          if (buttonText && buttonText !== 'Wählen Sie eine Variante') {
            const sizePriceMatch = buttonText.match(/(\d+(?:\.\d+)?x\d+(?:\.\d+)?(?:cm|m)?)\s*-\s*€?(\d+(?:,\d+)?)/);
            
            if (sizePriceMatch) {
              const size = sizePriceMatch[1];
              const price = sizePriceMatch[2].replace(',', '.');
              
              variations.push({
                size: size,
                price: price,
                sku: buttonValue,
                stock_status: 'instock',
                regular_price: price,
                meta: {
                  attribute_size: size
                }
              });
            }
          }
        });
      }
    }
    
    // Method 3: Look for variant display elements (fallback)
    if (variations.length === 0) {
      const variantElements = $('*:contains("50x75cm"), *:contains("75x120cm"), *:contains("60x180cm"), *:contains("75x190cm"), *:contains("115x175cm")');
      if (variantElements.length > 0) {
        console.log('[wash-and-dry] Found variant elements, extracting sizes...');
        
        const sizePatterns = [
          /50x75cm/,
          /75x120cm/,
          /60x180cm/,
          /75x190cm/,
          /115x175cm/
        ];
        
        sizePatterns.forEach(pattern => {
          const matchingElements = $(`*:contains("${pattern.source}")`);
          if (matchingElements.length > 0) {
            const size = pattern.source;
            variations.push({
              size: size,
              price: '',
              sku: size,
              stock_status: 'instock',
              regular_price: '',
              meta: {
                attribute_size: size
              }
            });
          }
        });
      }
    }
    
    console.log(`[wash-and-dry] Extracted ${variations.length} variations`);
    return variations;
  },

  // Enhanced attribute extraction for wash-and-dry.eu
  extractAttributes: ($: any) => {
    const attributes: { [key: string]: string[] } = {};
    
    console.log('[wash-and-dry] Starting enhanced attribute extraction...');
    
    // Extract size information with better patterns
    const sizeElements = $('*:contains("Size:"), *:contains("size:"), *:contains("50x75cm"), *:contains("75x120cm"), *:contains("60x180cm"), *:contains("75x190cm"), *:contains("115x175cm")');
    if (sizeElements.length > 0) {
      const sizes: string[] = [];
      sizeElements.each((_: any, el: any) => {
        const text = $(el).text();
        // Look for size patterns like "50x75cm", "75x120cm", etc.
        const sizeMatch = text.match(/(\d+(?:\.\d+)?"x\d+(?:\.\d+)?(?:cm|m)?)/g);
        if (sizeMatch) {
          sizes.push(...sizeMatch);
        }
      });
      if (sizes.length > 0) {
        attributes.Size = Array.from(new Set(sizes));
        console.log(`[wash-and-dry] Extracted sizes: ${attributes.Size.join(', ')}`);
      }
    }
    
    // Extract material information with better patterns
    const materialElements = $('*:contains("Polyamid"), *:contains("polyamid"), *:contains("Nitrilgummi"), *:contains("nitrilgummi"), *:contains("nylon"), *:contains("Nylon"), *:contains("rubber"), *:contains("Rubber"), *:contains("100% Polyamid"), *:contains("100% Nitrilgummi")');
    if (materialElements.length > 0) {
      const materials: string[] = [];
      materialElements.each((_: any, el: any) => {
        const text = $(el).text();
        if (text.includes('Polyamid') || text.includes('polyamid')) {
          materials.push('100% Polyamid');
        }
        if (text.includes('Nitrilgummi') || text.includes('nitrilgummi')) {
          materials.push('100% Nitrilgummi');
        }
        if (text.includes('nylon') || text.includes('Nylon')) {
          materials.push('Nylon');
        }
        if (text.includes('rubber') || text.includes('Rubber')) {
          materials.push('Rubber');
        }
      });
      if (materials.length > 0) {
        attributes.Material = Array.from(new Set(materials));
        console.log(`[wash-and-dry] Extracted materials: ${attributes.Material.join(', ')}`);
      }
    }
    
    // Extract dimensions information
    const dimensionElements = $('*:contains("7 mm"), *:contains("7mm"), *:contains("10 mm"), *:contains("10mm"), *:contains("Gesamthöhe"), *:contains("Randbreite")');
    if (dimensionElements.length > 0) {
      const dimensions: string[] = [];
      dimensionElements.each((_: any, el: any) => {
        const text = $(el).text();
        if (text.includes('7 mm') || text.includes('7mm')) {
          dimensions.push('Height: 7mm');
        }
        if (text.includes('10 mm') || text.includes('10mm')) {
          dimensions.push('Edge Width: 10mm');
        }
        if (text.includes('Gesamthöhe')) {
          dimensions.push('Total Height: 7mm');
        }
        if (text.includes('Randbreite')) {
          dimensions.push('Edge Width: 10mm');
        }
      });
      if (dimensions.length > 0) {
        attributes.Dimensions = Array.from(new Set(dimensions));
        console.log(`[wash-and-dry] Extracted dimensions: ${attributes.Dimensions.join(', ')}`);
      }
    }
    
    // Extract warranty information
    const warrantyElements = $('*:contains("5 Year"), *:contains("5 year"), *:contains("5 Jahre"), *:contains("5 jahre"), *:contains("warranty"), *:contains("Garantie"), *:contains("Hersteller-Garantie")');
    if (warrantyElements.length > 0) {
      attributes.Warranty = ['5 Year Manufacturer Warranty'];
      console.log('[wash-and-dry] Extracted warranty: 5 Year Manufacturer Warranty');
    }
    
    // Extract features with better patterns
    const features: string[] = [];
    const featureElements = $('*:contains("washable"), *:contains("Washable"), *:contains("maschinenwaschbar"), *:contains("Maschinenwaschbar"), *:contains("slip resistant"), *:contains("rutschfest"), *:contains("Rutschfest"), *:contains("low profile"), *:contains("flach"), *:contains("Flach"), *:contains("trocknergeeignet"), *:contains("Trocknergeeignet")');
    featureElements.each((_: any, el: any) => {
      const text = $(el).text();
      if (text.includes('washable') || text.includes('Washable') || text.includes('maschinenwaschbar') || text.includes('Maschinenwaschbar')) {
        features.push('Machine Washable up to 60°C');
      }
      if (text.includes('slip resistant') || text.includes('rutschfest') || text.includes('Rutschfest')) {
        features.push('Slip Resistant');
      }
      if (text.includes('low profile') || text.includes('flach') || text.includes('Flach')) {
        features.push('Low Profile (7mm height)');
      }
      if (text.includes('trocknergeeignet') || text.includes('Trocknergeeignet')) {
        features.push('Tumble Dryer Safe');
      }
    });
    
    // Look for specific feature mentions
    const specificFeatures = $('*:contains("PVC-frei"), *:contains("pvc-frei"), *:contains("Fußbodenheizungsgeeignet"), *:contains("fußbodenheizungsgeeignet"), *:contains("Licht-Echtheit"), *:contains("licht-echtheit")');
    specificFeatures.each((_: any, el: any) => {
      const text = $(el).text();
      if (text.includes('PVC-frei') || text.includes('pvc-frei')) {
        features.push('100% PVC-Free');
      }
      if (text.includes('Fußbodenheizungsgeeignet') || text.includes('fußbodenheizungsgeeignet')) {
        features.push('Underfloor Heating Compatible');
      }
      if (text.includes('Licht-Echtheit') || text.includes('licht-echtheit')) {
        features.push('Light Fastness');
      }
    });
    
    if (features.length > 0) {
      attributes.Features = Array.from(new Set(features));
      console.log(`[wash-and-dry] Extracted features: ${attributes.Features.join(', ')}`);
    }
    
    // Extract usage areas
    const usageElements = $('*:contains("Einsatzbereiche"), *:contains("einsatzbereiche"), *:contains("Hinter der Eingangstüre"), *:contains("Vor der Eingangstüre"), *:contains("Küche"), *:contains("Wohnzimmer"), *:contains("Hausflur"), *:contains("Schlafzimmer"), *:contains("Kinderzimmer")');
    if (usageElements.length > 0) {
      const usageAreas: string[] = [];
      const usagePatterns = [
        'Hinter der Eingangstüre',
        'Vor der Eingangstüre im überdachten Außenbereich',
        'Küche',
        'Wohnzimmer',
        'Hausflur',
        'Schlafzimmer',
        'Kinderzimmer',
        'Terrassentüre',
        'Kofferraum'
      ];
      
      usagePatterns.forEach(area => {
        if ($(`*:contains("${area}")`).length > 0) {
          usageAreas.push(area);
        }
      });
      
      if (usageAreas.length > 0) {
        attributes['Usage Areas'] = usageAreas;
        console.log(`[wash-and-dry] Extracted usage areas: ${usageAreas.join(', ')}`);
      }
    }
    
    console.log(`[wash-and-dry] Final attributes:`, attributes);
    return attributes;
  },

  // Enhanced price extraction for wash-and-dry.eu
  extractRegularPrice: ($: any) => {
    console.log('[wash-and-dry] Starting regular price extraction...');
    
    // Look for original price (crossed out) - most reliable
    const priceSelectors = [
      '.original-price',
      '.price .original',
      '.price del',
      '.price .crossed-out',
      '.product-price .original',
      '.product-price del',
      'del .price',
      '.price del .amount',
      '.price del .woocommerce-Price-amount'
    ];
    
    for (const selector of priceSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const priceText = element.text().trim();
        const priceMatch = priceText.match(/€?(\d+(?:,\d+)?)/);
        if (priceMatch) {
          const price = priceMatch[1].replace(',', '.');
          console.log(`[wash-and-dry] Found regular price: €${price}`);
          return price;
        }
      }
    }
    
    // Look for price range in variant options
    const variantOptions = $('select option, .variant-option');
    let lowestPrice: number | null = null;
    let highestPrice: number | null = null;
    
    variantOptions.each((_: any, option: any) => {
      const optionText = $(option).text().trim();
      const priceMatch = optionText.match(/€?(\d+(?:,\d+)?)/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(',', '.'));
        if (!lowestPrice || price < lowestPrice) {
          lowestPrice = price;
        }
        if (!highestPrice || price > highestPrice) {
          highestPrice = price;
        }
      }
    });
    
    if (lowestPrice !== null && highestPrice !== null) {
          if (lowestPrice === highestPrice) {
      console.log(`[wash-and-dry] Found single price: €${lowestPrice}`);
      return String(lowestPrice);
    } else {
      console.log(`[wash-and-dry] Found price range: €${lowestPrice} - €${highestPrice}`);
      return String(lowestPrice); // Return lowest price as regular price
    }
    }
    
    // Look for any price mention in the page
    const priceElements = $('*:contains("€")');
    if (priceElements.length > 0) {
      for (const el of priceElements) {
        const text = $(el).text();
        const priceMatch = text.match(/€?(\d+(?:,\d+)?)/);
        if (priceMatch) {
          const price = priceMatch[1].replace(',', '.');
          console.log(`[wash-and-dry] Found price in text: €${price}`);
          return price;
        }
      }
    }
    
    console.log('[wash-and-dry] No regular price found');
    return '';
  },

  extractSalePrice: ($: any) => {
    console.log('[wash-and-dry] Starting sale price extraction...');
    
    // Look for current/sale price
    const priceSelectors = [
      '.current-price',
      '.price .current',
      '.price .sale',
      '.product-price .current',
      '.product-price .sale',
      '.price .amount',
      '.woocommerce-Price-amount',
      '.product-price .amount'
    ];
    
    for (const selector of priceSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const priceText = element.text().trim();
        const priceMatch = priceText.match(/€?(\d+(?:,\d+)?)/);
        if (priceMatch) {
          const price = priceMatch[1].replace(',', '.');
          console.log(`[wash-and-dry] Found sale price: €${price}`);
          return price;
        }
      }
    }
    
    // Look for price in variant selector (current selection)
    const selectedVariant = $('select option:selected, .variant-option.selected, .variant-option.active');
    if (selectedVariant.length > 0) {
      const variantText = selectedVariant.text().trim();
      const priceMatch = variantText.match(/€?(\d+(?:,\d+)?)/);
      if (priceMatch) {
        const price = priceMatch[1].replace(',', '.');
        console.log(`[wash-and-dry] Found price in selected variant: €${price}`);
        return price;
      }
    }
    
    // If no specific sale price found, try to get the first available price
    const variantOptions = $('select option, .variant-option');
    for (const option of variantOptions) {
      const optionText = $(option).text().trim();
      const priceMatch = optionText.match(/€?(\d+(?:,\d+)?)/);
      if (priceMatch) {
        const price = priceMatch[1].replace(',', '.');
        console.log(`[wash-and-dry] Found price in variant option: €${price}`);
        return price;
      }
    }
    
    console.log('[wash-and-dry] No sale price found');
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
  // Register with ArchiveScraper for archive page parsing
  ArchiveScraper.registerAdapter('wash-and-dry.eu', washAndDryAdapter);
  ArchiveScraper.registerAdapter('washdrymats.com', washDryMatsAdapter);
  
  // Register with ProductScraper for product page parsing
  try {
    const { ProductScraper } = require('./scraper');
    ProductScraper.registerAdapter('wash-and-dry.eu', washDryMatsProductAdapter);
    ProductScraper.registerAdapter('washdrymats.com', washDryMatsProductAdapter);
    console.log('✅ wash-and-dry.eu and washdrymats.com product adapters registered with ProductScraper!');
  } catch (error) {
    console.warn('Could not register with ProductScraper:', error);
  }
  
  console.log('✅ wash-and-dry.eu and washdrymats.com adapters registered!');
  console.log('Now when you scrape these sites, custom Shopify rules will be used for both archive and product pages.');
}

// Usage:
// 1. Import and setup: import { setupWashAndDryAdapter } from './wash-and-dry-adapter';
// 2. Setup: setupWashAndDryAdapter();
// 3. Scrape normally: ArchiveScraper.scrapeAllArchivePages('https://washdrymats.com/collections/clearance');
