import { NextRequest, NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/scraping-service';
import { csvStorage } from '@/lib/csv-storage';
import { z } from 'zod';
import pino from 'pino';

const logger = pino({ name: 'scrape-init-api' });

// Validation schema for request body
const ScrapeRequestSchema = z.object({
  archiveUrls: z.array(z.string().url()).min(1, 'At least one archive URL is required'),
  maxProductsPerArchive: z.number().int().min(1).max(1000).default(100),
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  logger.info({ requestId }, 'Starting archive scraping job');

  try {
    const body = await request.json();
    const { archiveUrls, maxProductsPerArchive } = ScrapeRequestSchema.parse(body);

    logger.info({ requestId, archiveUrls, maxProductsPerArchive }, 'Validated request');

    // Initialize scraping service
    const scrapingService = new ScrapingService(requestId);
    
    // Start scraping
    const result = await scrapingService.scrapeFromArchiveUrls(archiveUrls, maxProductsPerArchive, requestId);

    if (!result.success) {
      logger.error({ requestId, error: result.error }, 'Archive scraping failed');
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          requestId 
        },
        { status: 400 }
      );
    }

    // CSV generation and storage is now handled in the scraping service
    const productCount = Array.isArray(result.data) ? result.data.length : result.data?.total_products || 0;
    logger.info({ requestId, productCount }, 'Archive scraping completed, CSV data should be stored');
    
    // Verify that CSV data was stored
    const storedJobInfo = csvStorage.getJobInfo(requestId);
    if (storedJobInfo) {
      logger.info({ requestId, storedJobInfo }, 'CSV data verified in storage');
    } else {
      logger.warn({ requestId }, 'CSV data not found in storage - this may cause download issues');
    }
   
    // Create download links
    const parentFilename = `PARENT_PRODUCTS_${requestId}.csv`;
    const variationFilename = `VARIATION_PRODUCTS_${requestId}.csv`;

    logger.info({ 
      requestId, 
      productsCount: productCount,
      processedArchives: result.processed_archives 
    }, 'Archive scraping completed successfully');

    // Don't cleanup immediately - let the data persist for downloads
    // csvStorage.cleanup();

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        total_products: productCount,
        processed_archives: result.processed_archives,
        csv_files: {
          parent_products: parentFilename,
          variation_products: variationFilename,
        },
        // In a real app, these would be S3 URLs
        download_links: {
          parent: `/api/scrape/download/${requestId}/parent`,
          variation: `/api/scrape/download/${requestId}/variation`,
        }
      }
    });

  } catch (error) {
    logger.error({ requestId, error }, 'API error');
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request format', 
          details: error.errors,
          requestId 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        requestId 
      },
      { status: 500 }
    );
  }
}
