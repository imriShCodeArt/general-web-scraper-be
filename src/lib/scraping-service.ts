import { HTTPClient } from './http-client';
import { ArchiveScraper } from './archive-scraper';
import { ProductScraper, ProductScraperAdapter } from './scraper';
import { CSVGenerator } from './csv-generator';
import { csvStorage } from './csv-storage';
import { Product, ScrapingResult, DetailedProgress, ProductValidationReport, Variation } from '@/types';
// logging removed
import { ProductValidator } from './product-validator';

// Setup custom adapters for websites that need special handling
function setupCustomAdapters() {
  console.log('[ScrapingService] Setting up universal extraction with specific fallbacks');
  
        // Import and setup the wash-and-dry adapter for both wash-and-dry.eu and washdrymats.com
      try {
        const { setupWashAndDryAdapter } = require('./wash-and-dry-adapter');
        setupWashAndDryAdapter();
        console.log('[ScrapingService] wash-and-dry adapters registered successfully');
      } catch (error) {
        console.warn('[ScrapingService] Could not load wash-and-dry adapter:', error instanceof Error ? error.message : String(error));
      }

      // Register wash-and-dry product scraper adapters
      try {
        const { washDryMatsProductAdapter } = require('./wash-and-dry-adapter');
        console.log('[ScrapingService] Loaded washDryMatsProductAdapter:', !!washDryMatsProductAdapter);
        console.log('[ScrapingService] washDryMatsProductAdapter methods:', Object.keys(washDryMatsProductAdapter || {}));
        
        ProductScraper.registerAdapter('wash-and-dry.eu', washDryMatsProductAdapter);
        ProductScraper.registerAdapter('washdrymats.com', washDryMatsProductAdapter);
        
        // Verify registration
        const testAdapter = ProductScraper.getAdapter('wash-and-dry.eu');
        console.log('[ScrapingService] wash-and-dry.eu adapter registered successfully:', !!testAdapter);
        console.log('[ScrapingService] washdrymats.com product adapters registered successfully');
      } catch (error) {
        console.warn('[ScrapingService] Could not load wash-and-dry product adapters:', error instanceof Error ? error.message : String(error));
        console.error('[ScrapingService] Full error:', error);
      }

      // Register modanbags.co.il adapter for AJAX load-more pagination
      try {
        const { setupModanbagsAdapter } = require('./modanbags-adapter');
        setupModanbagsAdapter();
        console.log('[ScrapingService] modanbags.co.il adapter registered successfully');
      } catch (error) {
        console.warn('[ScrapingService] Could not load modanbags.co.il adapter:', error instanceof Error ? error.message : String(error));
      }
  
  // The universal scraper now handles common e-commerce patterns automatically
  // Site-specific adapters are kept as fallbacks only for truly unique cases
}

export class ScrapingService {
  private logger = {
    info: (..._args: unknown[]) => {},
    warn: (..._args: unknown[]) => {},
    error: (..._args: unknown[]) => {},
  };
  private startTime: number = 0;
  private lastProgressUpdate: number = 0;

  constructor(requestId?: string) {
    // logger removed
    
    // Setup custom adapters for tricky websites
    setupCustomAdapters();
  }

  private updateDetailedProgress(
    requestId: string,
    stage: 'initializing' | 'fetching_archives' | 'scraping_products' | 'generating_csv' | 'complete',
    overall: number,
    message: string,
    archives?: { total: number; processed: number; current: number },
    currentArchive?: { url: string; index: number; total: number; progress: number },
    products?: { total: number; processed: number; current: number },
    currentProduct?: { url: string; index: number; total: number; title?: string }
  ) {
    const now = Date.now();
    const elapsed = (now - this.startTime) / 1000;
    
    let remaining = 0;
    let rate = 0;
    
    if (this.lastProgressUpdate > 0 && products) {
      const timeDiff = (now - this.lastProgressUpdate) / 1000;
      if (timeDiff > 0) {
        rate = products.processed / elapsed;
        if (rate > 0) {
          remaining = (products.total - products.processed) / rate;
        }
      }
    }
    
    this.lastProgressUpdate = now;
    
    const detailedProgress = {
      overall,
      stage,
      message,
      archives: archives || { total: 0, processed: 0, current: 0 },
      currentArchive,
      products: products || { total: 0, processed: 0, current: 0 },
      currentProduct,
      timeEstimate: {
        elapsed,
        remaining,
        rate
      }
    };
    
    // removed live logging
  }

  /**
   * Main scraping pipeline for archive pages
   */
  async scrapeFromArchiveUrls(archiveUrls: string[], maxProductsPerArchive: number = 100, requestId?: string): Promise<ScrapingResult> {
    this.startTime = Date.now();
    
    if (requestId) {
      // removed live logging
      this.updateDetailedProgress(requestId, 'initializing', 1, 'Initializing scraping process');
    }

    try {
      // Step 1: Parse archive pages to extract product URLs (with pagination)
      if (requestId) {
        this.updateDetailedProgress(
          requestId, 
          'fetching_archives', 
          5, 
          'Fetching archive pages',
          { total: archiveUrls.length, processed: 0, current: 0 }
        );
      }
      
      const { productUrls, archiveTitles, initialProductCount } = await this.extractProductUrlsFromArchives(archiveUrls, maxProductsPerArchive, requestId);
      
      if (requestId) {
        // removed live logging
        this.updateDetailedProgress(
          requestId, 
          'fetching_archives', 
          10, 
          `Found ${productUrls.length} product URLs${initialProductCount ? ` (initially ${initialProductCount} on first page)` : ''}`,
          { total: archiveUrls.length, processed: archiveUrls.length, current: archiveUrls.length }
        );
      }

      if (productUrls.length === 0) {
        return {
          success: false,
          data: [],
          error: 'No product URLs found in the provided archive pages',
          total_archives: archiveUrls.length,
          processed_archives: 0,
        };
      }

      // Step 2: Scrape each product page
      if (requestId) {
        this.updateDetailedProgress(
          requestId, 
          'scraping_products', 
          15, 
          'Starting product scraping',
          { total: archiveUrls.length, processed: archiveUrls.length, current: archiveUrls.length },
          undefined,
          { total: productUrls.length, processed: 0, current: 0 }
        );
      }
      
      const products = await this.scrapeProductPages(productUrls, requestId);
      
      // Step 2.5: Validate products
      let validation: ProductValidationReport | undefined = undefined;
      try {
        validation = ProductValidator.validate(products);
        if (requestId) {
          // removed live logging
        }
      } catch (e) {
        // validation failed silently
      }

      if (requestId) {
        // removed live logging
        this.updateDetailedProgress(
          requestId, 
          'scraping_products', 
          90, 
          `Scraped ${products.length} products`,
          { total: archiveUrls.length, processed: archiveUrls.length, current: archiveUrls.length },
          undefined,
          { total: productUrls.length, processed: productUrls.length, current: productUrls.length }
        );
      }

      // Step 3: Generate CSV files and store them if requestId is provided
      if (requestId) {
        this.updateDetailedProgress(
          requestId, 
          'generating_csv', 
          95, 
          'Generating CSV files',
          { total: archiveUrls.length, processed: archiveUrls.length, current: archiveUrls.length },
          undefined,
          { total: productUrls.length, processed: productUrls.length, current: productUrls.length }
        );
      }
      
      const { parentProducts, variationProducts } = await CSVGenerator.generateWooCommerceCSVs(products);
      
      if (requestId) {
        // Store CSV data for download
        const beforeStorage = csvStorage.listAllJobs().length;
        
        await csvStorage.storeCSVData(requestId, products, parentProducts, variationProducts, { archiveTitle: archiveTitles[0] });
        
        const storedJobInfo = csvStorage.getJobInfo(requestId);
        const allJobs = csvStorage.listAllJobs();
        
        if (storedJobInfo) {
          // CSV data was stored successfully
        } else {
          // CSV data was not stored successfully
        }
      } else {
        // No requestId provided, CSV data will not be stored for download
      }

      return {
        success: true,
        data: requestId ? {
          total_products: products.length,
          processed_archives: archiveUrls.length,
          products: products, // Always include products for attribute editing
          download_links: {
            parent: `/api/scrape/download/${requestId}/parent`,
            variation: `/api/scrape/download/${requestId}/variation`
          },
          // Include validation in response for UI reporting
          validation: validation,
          // Include initial product count for frontend display
          initial_product_count: initialProductCount
        } : products,
        total_archives: archiveUrls.length,
        processed_archives: archiveUrls.length,
      };
    } catch (error) {
      // Archive scraping pipeline failed
      if (requestId) {
        this.updateDetailedProgress(requestId, 'complete', 100, 'Scraping failed');
      }
      
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : String(error),
        total_archives: archiveUrls.length,
        processed_archives: 0,
      };
    } finally {
      // Clean up resources
      // HTTPClient.cleanup() removed - no longer needed
    }
  }

  /**
   * Extract product URLs from archive pages (with pagination support)
   */
  private async extractProductUrlsFromArchives(archiveUrls: string[], maxProductsPerArchive: number, requestId?: string): Promise<{ productUrls: string[]; archiveTitles: string[]; initialProductCount?: number }> {
    const allProductUrls: string[] = [];
    const archiveTitles: string[] = [];
    let initialProductCount: number | undefined;

    for (let i = 0; i < archiveUrls.length; i++) {
      const archiveUrl = archiveUrls[i];
      try {
        if (requestId) {
          this.updateDetailedProgress(
            requestId,
            'fetching_archives',
            Math.min(10, 5 + ((i + 1) / archiveUrls.length) * 5),
            `Processing archive ${i + 1}/${archiveUrls.length}`,
            { total: archiveUrls.length, processed: i, current: i + 1 },
            { url: archiveUrl, index: i, total: archiveUrls.length, progress: ((i + 1) / archiveUrls.length) * 100 }
          );
        }
        
        // Use the new ArchiveScraper to handle pagination
        const productUrls = await ArchiveScraper.scrapeAllArchivePages(archiveUrl, maxProductsPerArchive);
        
        // Add the found product URLs
        allProductUrls.push(...productUrls);
        
        // Try to fetch first page and parse title for naming
        try {
          const html = await HTTPClient.fetchHTML(archiveUrl);
          const page = ArchiveScraper.parseArchivePage(html, archiveUrl, 1);
          if (page.category_title) archiveTitles.push(page.category_title);
          
          // Update progress with total products found (not just first page)
          if (requestId) {
            this.updateDetailedProgress(
              requestId,
              'fetching_archives',
              6,
              `Found ${productUrls.length} total products across all pages`,
              { total: archiveUrls.length, processed: i, current: i + 1 },
              { url: archiveUrl, index: i, total: archiveUrls.length, progress: ((i + 1) / archiveUrls.length) * 100 }
            );
          }
          
          // Capture initial product count from first archive page for frontend display
          if (i === 0 && !initialProductCount) {
            initialProductCount = productUrls.length;
          }
        } catch {}
        
        // Archive processed successfully
      } catch (error) {
        // Failed to process archive page, continue with others
      }
    }

    // Remove duplicates
    return { 
      productUrls: Array.from(new Set(allProductUrls)), 
      archiveTitles: Array.from(new Set(archiveTitles)),
      initialProductCount 
    };
  }

  /**
   * Scrape individual product pages
   */
  private async scrapeProductPages(productUrls: string[], requestId?: string): Promise<Product[]> {
    const products: Product[] = [];
    const batchSize = 5; // Process in batches to avoid overwhelming servers

    for (let i = 0; i < productUrls.length; i += batchSize) {
      const batch = productUrls.slice(i, i + batchSize);
      
      if (requestId) {
        const overallProgress = Math.min(85, Math.round(((i + batch.length) / productUrls.length) * 80) + 15);
        this.updateDetailedProgress(
          requestId,
          'scraping_products',
          overallProgress,
          `Processing batch ${i / batchSize + 1}/${Math.ceil(productUrls.length / batchSize)}`,
          undefined,
          undefined,
          { total: productUrls.length, processed: i, current: i + batch.length }
        );
      }

      const batchPromises = batch.map(async (url, batchIndex) => {
        try {
          const html = await HTTPClient.fetchHTML(url);
          const productData = await ProductScraper.scrapeProductPage(url, html);
          
          // Validate and complete product data
          const completeProduct = this.completeProductData(productData);
          if (completeProduct) {
            products.push(completeProduct);
            
            if (requestId) {
              // Update progress for individual product
              const currentIndex = i + batchIndex;
              this.updateDetailedProgress(
                requestId,
                'scraping_products',
                Math.min(85, Math.round(((currentIndex + 1) / productUrls.length) * 80) + 15),
                `Scraped: ${completeProduct.title}`,
                undefined,
                undefined,
                { total: productUrls.length, processed: currentIndex + 1, current: currentIndex + 1 },
                { url, index: currentIndex, total: productUrls.length, title: completeProduct.title }
              );
            }
          }
        } catch (error) {
          // Failed to scrape product page
        }
      });

      await Promise.allSettled(batchPromises);
      
      // Small delay between batches
      if (i + batchSize < productUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return products;
  }

  /**
   * Complete and validate product data
   */
  private completeProductData(productData: Partial<Product>): Product | null {
    // Ensure required fields are present
    if (!productData.title || !productData.url) {
      return null;
    }

    // Set defaults for missing fields, but prioritize extracted data
    const product: Product = {
      url: productData.url,
      title: productData.title,
      slug: productData.slug || this.generateSlug(productData.title),
      sku: productData.sku || this.generateSKU(productData.title),
      stock_status: productData.stock_status || 'instock',
      images: productData.images || [],
      description: productData.description || '',
      shortDescription: productData.shortDescription || '',
      category: productData.category || 'Uncategorized',
      attributes: productData.attributes || {},
      variations: productData.variations || [],
      // Use the extracted postName from ProductScraper, don't override it
      postName: productData.postName || this.generateSlug(productData.title),
      regularPrice: productData.regularPrice || '',
      salePrice: productData.salePrice || '',
    };

    // Only create variations if the product actually has variation data
    // For simple products, leave variations array empty
    if (product.variations.length === 0 && ((product.attributes.Color && Array.isArray(product.attributes.Color) && product.attributes.Color.length > 0) || (product.attributes.Size && Array.isArray(product.attributes.Size) && product.attributes.Size.length > 0))) {
      // This product has attributes but no variations, so it's likely a simple product
      // Don't create artificial variations
    }

    return product;
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Generate SKU from title
   */
  private generateSKU(title: string): string {
    const prefix = title
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, 'X');
    
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }
}
