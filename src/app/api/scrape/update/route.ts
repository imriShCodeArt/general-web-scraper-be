import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import pino from 'pino';
import { Product } from '@/types';
import { CSVGenerator } from '@/lib/csv-generator';
import { csvStorage } from '@/lib/csv-storage';

const logger = pino({ name: 'scrape-update-api' });

const UpdateRequestSchema = z.object({
  requestId: z.string().uuid(),
  products: z.array(z.any())
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, products } = UpdateRequestSchema.parse(body);

    logger.info({ requestId, productsCount: Array.isArray(products) ? products.length : 0 }, 'Received attribute update payload');

    // Regenerate CSVs from edited products
    const typedProducts = products as Product[];
    const { parentProducts, variationProducts } = await CSVGenerator.generateWooCommerceCSVs(typedProducts);

    // Store CSVs back under same requestId so existing download links are updated
    // Preserve archive/category slug for filenames on updated CSVs
    const info = csvStorage.getJobInfo(requestId);
    await csvStorage.storeCSVData(requestId, typedProducts, parentProducts, variationProducts, { archiveTitle: info?.archiveTitleSlug });

    logger.info({ requestId }, 'Updated CSVs stored successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to update CSVs with edited attributes');
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid request format', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}


