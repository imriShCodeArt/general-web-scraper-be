import { NextRequest, NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/scraping-service';
import { csvStorage } from '@/lib/csv-storage';
import { z } from 'zod';
import { Product } from '@/types';

// Validation schema for request body
const ScrapeRequestSchema = z.object({
	archiveUrls: z.array(z.string().url()).min(1, 'At least one archive URL is required'),
	// 0 means unlimited, any non-negative integer is accepted, no upper cap
	maxProductsPerArchive: z.number().int().min(0).default(0),
	requestId: z.string().uuid().optional()
});

export async function POST(request: NextRequest) {
	const provisionalRequestId = crypto.randomUUID();

	try {
		const body = await request.json();
		const { archiveUrls, maxProductsPerArchive, requestId: clientRequestId } = ScrapeRequestSchema.parse(body);
		const requestId = clientRequestId || provisionalRequestId;

		// Initialize scraping service
		const scrapingService = new ScrapingService(requestId);
		

		// Start scraping
		const result = await scrapingService.scrapeFromArchiveUrls(archiveUrls, maxProductsPerArchive, requestId);

		if (!result.success) {
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
		const productCount = Array.isArray(result.data) ? result.data.length : (result.data as any)?.total_products || 0;
		
		// Get the scraped products for attribute editing
		let scrapedProducts: Product[] = [];
		if (Array.isArray(result.data)) {
			// Legacy case: result.data is the products array
			scrapedProducts = result.data as Product[];
		} else if (result.data && Array.isArray((result.data as any).products)) {
			// Normal case: data contains products alongside metadata
			scrapedProducts = (result.data as any).products as Product[];
		}
		
		// Verify that CSV data was stored
		const storedJobInfo = csvStorage.getJobInfo(requestId);
		if (storedJobInfo) {
		} else {
		}
	 
		// Create download links
		const parentFilename = `PARENT_PRODUCTS_${requestId}.csv`;
		const variationFilename = `VARIATION_PRODUCTS_${requestId}.csv`;

		// Include validation in response when available
		const validation = !Array.isArray(result.data) ? (result.data as any)?.validation : undefined;

		return NextResponse.json({
			success: true,
			requestId,
			data: {
				total_products: productCount,
				processed_archives: result.processed_archives,
				products: scrapedProducts, // Add products for attribute editing
				// Add initial product count when available for early UI logging
				initial_product_count: Array.isArray(result.data) ? undefined : (result.data as any)?.initial_product_count,
				csv_files: {
					parent_products: parentFilename,
					variation_products: variationFilename,
				},
				// In a real app, these would be S3 URLs
				download_links: {
					parent: `/api/scrape/download/${requestId}/parent`,
					variation: `/api/scrape/download/${requestId}/variation`,
				},
				validation
			},
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ 
					success: false, 
					error: 'Invalid request format', 
					details: error.errors,
					requestId: undefined
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ 
				success: false, 
				error: 'Internal server error',
				requestId: undefined
			},
			{ status: 500 }
		);
	}
}
