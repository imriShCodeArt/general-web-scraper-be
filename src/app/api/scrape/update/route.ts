import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// logging removed
import { Product } from '@/types';
import { CSVGenerator } from '@/lib/csv-generator';
import { csvStorage } from '@/lib/csv-storage';

// const logger = pino({ name: 'scrape-update-api' });

const UpdateRequestSchema = z.object({
  requestId: z.string().uuid(),
  products: z.array(z.any())
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, products } = UpdateRequestSchema.parse(body);

    // logging removed

    // Regenerate CSVs from edited products
    const typedProducts = products as Product[];
    const { parentProducts, variationProducts } = await CSVGenerator.generateWooCommerceCSVs(typedProducts);

    // Store CSVs back under same requestId so existing download links are updated
    // Preserve archive/category slug for filenames on updated CSVs
    const info = csvStorage.getJobInfo(requestId);
    await csvStorage.storeCSVData(requestId, typedProducts, parentProducts, variationProducts, { archiveTitle: info?.archiveTitleSlug });

    // logging removed

    return NextResponse.json({ success: true });
  } catch (error) {
    // logging removed
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid request format', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}


