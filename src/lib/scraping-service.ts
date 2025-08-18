import { HTTPClient } from './http-client';
import { ArchiveScraper } from './archive-scraper';
import { ProductScraper } from './scraper';
import { CSVGenerator } from './csv-generator';
import { csvStorage } from './csv-storage';
import { Product, ScrapingResult } from '@/types';
import pino from 'pino';

export class ScrapingService {
  private logger: pino.Logger;

  constructor(requestId?: string) {
    this.logger = pino({
      name: 'ScrapingService',
      level: process.env.LOG_LEVEL || 'info',
      ...(requestId && { mixin: () => ({ requestId }) }),
    });
  }

  /**
   * Main scraping pipeline for archive pages
   */
  async scrapeFromArchiveUrls(archiveUrls: string[], maxProductsPerArchive: number = 100, requestId?: string): Promise<ScrapingResult> {
    this.logger.info({ archiveUrls, maxProductsPerArchive, requestId }, 'Starting archive scraping pipeline');

    try {
      // Step 1: Parse archive pages to extract product URLs (with pagination)
      const productUrls = await this.extractProductUrlsFromArchives(archiveUrls, maxProductsPerArchive);
      this.logger.info({ count: productUrls.length, maxProductsPerArchive }, 'Extracted product URLs from archives');

      if (productUrls.length === 0) {
        return {
          success: false,
          error: 'No product URLs found in the provided archive pages',
          total_archives: archiveUrls.length,
          processed_archives: 0,
        };
      }

      // Step 2: Scrape each product page
      const products = await this.scrapeProductPages(productUrls);
      this.logger.info({ count: products.length }, 'Scraped product pages');

      // Step 3: Generate CSV files and store them if requestId is provided
      const csvs = await CSVGenerator.generateWooCommerceCSVs(products);
      this.logger.info('Generated CSV files');
      
      // Store CSV data for download if we have a requestId
      if (requestId) {
        this.logger.info({ requestId, productCount: products.length }, 'About to store CSV data for download');
        
        // Check storage before storing
        const beforeStorage = csvStorage.getJobInfo(requestId);
        this.logger.info({ requestId, beforeStorage }, 'Storage state before storing');
        
        await csvStorage.storeCSVData(requestId, products, csvs.parentProducts, csvs.variationProducts);
        this.logger.info({ requestId }, 'CSV data stored successfully');
        
        // Verify storage immediately
        const storedJobInfo = csvStorage.getJobInfo(requestId);
        this.logger.info({ requestId, storedJobInfo }, 'Verification: CSV storage lookup after storing');
        
        // Also check all jobs in storage
        const allJobs = csvStorage.listAllJobs();
        this.logger.info({ requestId, allJobsCount: allJobs.length, allJobIds: allJobs.map(j => j.jobId) }, 'All jobs in storage after storing');
        
        if (!storedJobInfo) {
          this.logger.error({ requestId }, 'CSV data was not stored successfully!');
        }
      } else {
        this.logger.warn('No requestId provided, CSV data will not be stored for download');
      }

      return {
        success: true,
        data: requestId ? {
          total_products: products.length,
          processed_archives: archiveUrls.length,
          download_links: {
            parent: `/api/scrape/download/${requestId}/parent`,
            variation: `/api/scrape/download/${requestId}/variation`
          }
        } : products,
        total_archives: archiveUrls.length,
        processed_archives: archiveUrls.length,
      };
    } catch (error) {
      this.logger.error({ error }, 'Archive scraping pipeline failed');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
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
  private async extractProductUrlsFromArchives(archiveUrls: string[], maxProductsPerArchive: number): Promise<string[]> {
    const allProductUrls: string[] = [];

    for (const archiveUrl of archiveUrls) {
      try {
        this.logger.info({ archiveUrl }, 'Processing archive page');
        
        console.log('Processing archive:', archiveUrl);
        console.log('Max products per archive:', maxProductsPerArchive);
        
        // Use the new ArchiveScraper to handle pagination
        const productUrls = await ArchiveScraper.scrapeAllArchivePages(archiveUrl, maxProductsPerArchive);
        
        // Add the found product URLs
        allProductUrls.push(...productUrls);
        
        this.logger.info({ 
          archiveUrl, 
          totalFound: productUrls.length,
          maxLimit: maxProductsPerArchive 
        }, 'Extracted URLs from archive');
      } catch (error) {
        this.logger.error({ archiveUrl, error }, 'Failed to process archive page');
        // Continue with other archives
      }
    }

    // Remove duplicates
    return Array.from(new Set(allProductUrls));
  }

  /**
   * Scrape individual product pages
   */
  private async scrapeProductPages(productUrls: string[]): Promise<Product[]> {
    const products: Product[] = [];
    const batchSize = 5; // Process in batches to avoid overwhelming servers

    for (let i = 0; i < productUrls.length; i += batchSize) {
      const batch = productUrls.slice(i, i + batchSize);
      this.logger.info({ batch: i / batchSize + 1, total: Math.ceil(productUrls.length / batchSize) }, 'Processing batch');

      const batchPromises = batch.map(async (url) => {
        try {
          const html = await HTTPClient.fetchHTML(url);
          const productData = await ProductScraper.scrapeProductPage(url, html);
          
          // Validate and complete product data
          const completeProduct = this.completeProductData(productData);
          if (completeProduct) {
            products.push(completeProduct);
            this.logger.info({ url, title: completeProduct.title }, 'Successfully scraped product');
          }
        } catch (error) {
          this.logger.error({ url, error }, 'Failed to scrape product page');
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
    if (product.variations.length === 0 && ((product.attributes.Color && product.attributes.Color.length > 0) || (product.attributes.Size && product.attributes.Size.length > 0))) {
      // This product has attributes but no variations, so it's likely a simple product
      // Don't create artificial variations
      this.logger.info({ url: product.url, title: product.title }, 'Product has attributes but no variations - treating as simple product');
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
