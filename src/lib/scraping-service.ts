import { HTTPClient } from './http-client';
import { ArchiveScraper } from './archive-scraper';
import { ProductScraper } from './scraper';
import { CSVGenerator } from './csv-generator';
import { csvStorage } from './csv-storage';
import { Product, ScrapingResult, DetailedProgress, ProductValidationReport } from '@/types';
import { jobLogger } from '@/lib/job-logger';
import pino from 'pino';
import { ProductValidator } from './product-validator';

export class ScrapingService {
  private logger: pino.Logger;
  private startTime: number = 0;
  private lastProgressUpdate: number = 0;

  constructor(requestId?: string) {
    this.logger = pino({
      name: 'ScrapingService',
      level: process.env.LOG_LEVEL || 'info',
      ...(requestId && { mixin: () => ({ requestId }) }),
    });
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
    
    jobLogger.detailedProgress(requestId, detailedProgress);
  }

  /**
   * Main scraping pipeline for archive pages
   */
  async scrapeFromArchiveUrls(archiveUrls: string[], maxProductsPerArchive: number = 100, requestId?: string): Promise<ScrapingResult> {
    this.startTime = Date.now();
    this.logger.info({ archiveUrls, maxProductsPerArchive, requestId }, 'Starting archive scraping pipeline');
    
    if (requestId) {
      jobLogger.log(requestId, 'info', 'Starting archive scraping');
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
      
      const { productUrls, archiveTitles } = await this.extractProductUrlsFromArchives(archiveUrls, maxProductsPerArchive, requestId);
      this.logger.info({ count: productUrls.length, maxProductsPerArchive }, 'Extracted product URLs from archives');
      
      if (requestId) {
        jobLogger.log(requestId, 'info', `Found ${productUrls.length} product URLs`);
        this.updateDetailedProgress(
          requestId, 
          'fetching_archives', 
          10, 
          `Found ${productUrls.length} product URLs`,
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
      this.logger.info({ count: products.length }, 'Scraped product pages');
      
      // Step 2.5: Validate products
      let validation: ProductValidationReport | undefined = undefined;
      try {
        validation = ProductValidator.validate(products);
        this.logger.info({ validationSummary: validation?.totals, duplicates: validation?.duplicates?.length }, 'Product validation completed');
        if (requestId) {
          jobLogger.log(requestId, 'info', `Validation: avg score ${validation.totals.averageScore}, duplicates ${validation.duplicates.length}`);
        }
      } catch (e) {
        this.logger.warn({ e }, 'Product validation failed');
      }

      if (requestId) {
        jobLogger.log(requestId, 'info', `Scraped ${products.length} products`);
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
          'Generating CSV files'
        );
      }
      
      const csvs = await CSVGenerator.generateWooCommerceCSVs(products);
      this.logger.info('Generated CSV files');
      
      if (requestId) {
        jobLogger.log(requestId, 'info', 'CSV files generated');
        this.updateDetailedProgress(
          requestId, 
          'generating_csv', 
          98, 
          'CSV files generated'
        );
      }
      
      // Store CSV data for download if we have a requestId
      if (requestId) {
        this.logger.info({ requestId, productCount: products.length }, 'About to store CSV data for download');
        
        // Check storage before storing
        const beforeStorage = csvStorage.getJobInfo(requestId);
        this.logger.info({ requestId, beforeStorage }, 'Storage state before storing');
        
        // Prefer first non-empty archive title for naming
        const firstTitle = archiveTitles.find(t => t && t.trim().length > 0);
        await csvStorage.storeCSVData(requestId, products, csvs.parentProducts, csvs.variationProducts, { archiveTitle: firstTitle });
        this.logger.info({ requestId }, 'CSV data stored successfully');
        
        this.updateDetailedProgress(
          requestId, 
          'complete', 
          100, 
          'Scraping completed successfully'
        );
        
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
          products: products, // Always include products for attribute editing
          download_links: {
            parent: `/api/scrape/download/${requestId}/parent`,
            variation: `/api/scrape/download/${requestId}/variation`
          },
          // Include validation in response for UI reporting
          validation: validation
        } : products,
        total_archives: archiveUrls.length,
        processed_archives: archiveUrls.length,
      };
    } catch (error) {
      this.logger.error({ error }, 'Archive scraping pipeline failed');
      if (requestId) jobLogger.log(requestId, 'error', 'Scraping failed', { error: error instanceof Error ? error.message : String(error) });
      return {
        success: false,
        data: [],
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
  private async extractProductUrlsFromArchives(archiveUrls: string[], maxProductsPerArchive: number, requestId?: string): Promise<{ productUrls: string[]; archiveTitles: string[] }> {
    const allProductUrls: string[] = [];
    const archiveTitles: string[] = [];

    for (let i = 0; i < archiveUrls.length; i++) {
      const archiveUrl = archiveUrls[i];
      try {
        this.logger.info({ archiveUrl }, 'Processing archive page');
        
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
        
        console.log('Processing archive:', archiveUrl);
        console.log('Max products per archive:', maxProductsPerArchive);
        
        // Use the new ArchiveScraper to handle pagination
        const productUrls = await ArchiveScraper.scrapeAllArchivePages(archiveUrl, maxProductsPerArchive);
        
        // Add the found product URLs
        allProductUrls.push(...productUrls);
        
        // Try to fetch first page and parse title for naming
        try {
          const html = await HTTPClient.fetchHTML(archiveUrl);
          const page = ArchiveScraper.parseArchivePage(html, archiveUrl, 1);
          if (page.category_title) archiveTitles.push(page.category_title);
        } catch {}
        
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
    return { productUrls: Array.from(new Set(allProductUrls)), archiveTitles: Array.from(new Set(archiveTitles)) };
  }

  /**
   * Scrape individual product pages
   */
  private async scrapeProductPages(productUrls: string[], requestId?: string): Promise<Product[]> {
    const products: Product[] = [];
    const batchSize = 5; // Process in batches to avoid overwhelming servers

    for (let i = 0; i < productUrls.length; i += batchSize) {
      const batch = productUrls.slice(i, i + batchSize);
      this.logger.info({ batch: i / batchSize + 1, total: Math.ceil(productUrls.length / batchSize) }, 'Processing batch');
      
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
            this.logger.info({ url, title: completeProduct.title }, 'Successfully scraped product');
            
            if (requestId) {
              jobLogger.log(requestId, 'info', `Scraped product: ${completeProduct.title}`);
              
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
          this.logger.error({ url, error }, 'Failed to scrape product page');
          if (requestId) jobLogger.log(requestId, 'error', 'Failed to scrape product page', { url, error: error instanceof Error ? error.message : String(error) });
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
