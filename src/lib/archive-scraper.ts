import * as cheerio from 'cheerio';
import { ArchivePage } from '@/types';

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
    
    // Common selectors for product links in archive pages
    const productSelectors = [
      // WooCommerce
      '.woocommerce ul.products li.product a.woocommerce-LoopProduct-link',
      '.woocommerce ul.products li.product h2.woocommerce-loop-product__title a',
      '.woocommerce ul.products li.product a',
      // Generic e-commerce
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
    
    // Try each selector to find product links
    for (const selector of productSelectors) {
      const links = $(selector);
      if (links.length > 0) {
        console.log(`Found ${links.length} products using selector: ${selector}`);
        
        links.each((_, link) => {
          const href = $(link).attr('href');
          if (href) {
            try {
              const fullUrl = new URL(href, baseUrl).toString();
              if (!productUrls.includes(fullUrl)) {
                productUrls.push(fullUrl);
                console.log(`Added product URL: ${fullUrl}`);
              }
            } catch (error) {
              console.warn(`Invalid product URL found: ${href}`, error);
            }
          }
        });
        
        // If we found products, break out of the loop
        if (productUrls.length > 0) {
          break;
        }
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
    // Common pagination selectors
    const nextPageSelectors = [
      // WooCommerce
      '.woocommerce-pagination .next a',
      '.woocommerce-pagination a.next',
      '.woocommerce-pagination .next',
      // Generic pagination
      '.pagination .next a',
      '.pagination a.next',
      '.pagination .next',
      '.pager .next a',
      '.pager a.next',
      // Common patterns
      'a[rel="next"]',
      'a[aria-label*="next"]',
      'a[title*="next"]',
      // Look for "Next" text
      'a:contains("Next")',
      'a:contains("next")',
      'a:contains(">")',
      'a:contains("→")'
    ];
    
    for (const selector of nextPageSelectors) {
      const nextLink = $(selector);
      if (nextLink.length > 0) {
        const href = nextLink.attr('href');
        if (href) {
          try {
            const fullUrl = new URL(href, baseUrl).toString();
            console.log(`Found next page URL: ${fullUrl}`);
            return { has_next_page: true, next_page_url: fullUrl };
          } catch (error) {
            console.warn(`Invalid next page URL found: ${href}`, error);
          }
        }
      }
    }
    
    // Also check if there are page numbers that suggest more pages
    const pageNumbers = $('.pagination a, .woocommerce-pagination a, .pager a');
    if (pageNumbers.length > 1) {
      // If we have multiple page numbers, there might be more pages
      const lastPageNumber = Math.max(...pageNumbers.map((_, el) => {
        const text = $(el).text().trim();
        const num = parseInt(text);
        return isNaN(num) ? 0 : num;
      }).get());
      
      if (lastPageNumber > 1) {
        console.log(`Found pagination with ${lastPageNumber} pages`);
        return { has_next_page: true };
      }
    }
    
    return { has_next_page: false };
  }
  
  /**
   * Scrape all pages of an archive to get all product URLs
   */
  static async scrapeAllArchivePages(archiveUrl: string, maxProducts: number = 100): Promise<string[]> {
    const allProductUrls: string[] = [];
    let currentUrl = archiveUrl;
    let pageNumber = 1;
    const maxPages = 50; // Safety limit to prevent infinite loops
    
    console.log(`Starting to scrape archive: ${archiveUrl}`);
    
    while (currentUrl && pageNumber <= maxPages && allProductUrls.length < maxProducts) {
      try {
        console.log(`Scraping archive page ${pageNumber}: ${currentUrl}`);
        
        // Fetch the page
        const response = await fetch(currentUrl);
        if (!response.ok) {
          console.warn(`Failed to fetch page ${pageNumber}: ${response.status}`);
          break;
        }
        
        const html = await response.text();
        const archivePage = this.parseArchivePage(html, currentUrl, pageNumber);
        
        // Add new product URLs (avoid duplicates)
        for (const productUrl of archivePage.product_urls) {
          if (!allProductUrls.includes(productUrl) && allProductUrls.length < maxProducts) {
            allProductUrls.push(productUrl);
          }
        }
        
        console.log(`Page ${pageNumber}: Found ${archivePage.product_urls.length} products, total so far: ${allProductUrls.length}`);
        
        // Check if we should continue to the next page
        if (!archivePage.has_next_page || !archivePage.next_page_url || allProductUrls.length >= maxProducts) {
          console.log(`Stopping at page ${pageNumber}: has_next_page=${archivePage.has_next_page}, reached max products=${allProductUrls.length >= maxProducts}`);
          break;
        }
        
        currentUrl = archivePage.next_page_url;
        pageNumber++;
        
        // Small delay to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error scraping archive page ${pageNumber}:`, error);
        break;
      }
    }
    
    console.log(`Finished scraping archive. Total products found: ${allProductUrls.length}`);
    return allProductUrls;
  }
}
