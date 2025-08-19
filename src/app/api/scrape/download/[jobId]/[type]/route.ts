import { NextRequest, NextResponse } from 'next/server';
import { csvStorage } from '@/lib/csv-storage';
import { CSVGenerator } from '@/lib/csv-generator';
import pino from 'pino';

const logger = pino({ name: 'scrape-download-api' });

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string; type: string } }
) {
  const { jobId, type } = params;
  logger.info({ jobId, type }, 'Download request');

  try {
    // Validate type parameter
    if (!['parent', 'variation'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid CSV type. Must be "parent" or "variation"' },
        { status: 400 }
      );
    }

             // Debug: Check what's in storage before getting data
         const jobInfo = csvStorage.getJobInfo(jobId);
         const allJobs = csvStorage.listAllJobs();
         logger.info({ 
           jobId, 
           type, 
           jobInfo, 
           totalStoredJobs: allJobs.length,
           allJobIds: allJobs.map(j => j.jobId)
         }, 'CSV storage lookup before getting data');
         
         // Get CSV data from storage
         const csvData = csvStorage.getCSVData(jobId, type as 'parent' | 'variation');
         
         // Debug: Check what we got
         logger.info({ 
           jobId, 
           type, 
           hasData: !!csvData,
           dataSize: csvData?.length || 0
         }, 'CSV data retrieval result');
    
    if (!csvData) {
      logger.warn({ jobId, type }, 'CSV data not found');
      return NextResponse.json(
        { error: 'CSV data not found. The scraping job may have expired or failed.' },
        { status: 404 }
      );
    }

    // Append categories slug if available
    const info = csvStorage.getJobInfo(jobId) as any;
    const base = type === 'parent' ? 'PARENT_PRODUCTS' : 'VARIATION_PRODUCTS';
    const suffix = info?.archiveTitleSlug ? info.archiveTitleSlug : info?.categoriesSlug || '';
    const withSuffix = suffix ? `${base}_${suffix}` : base;
    const filename = CSVGenerator.getCSVFilename(withSuffix);
    const asciiFilename = filename.replace(/[^\x20-\x7E]/g, '');
    const encodedUtf8 = encodeURIComponent(filename);

    logger.info({ jobId, type, filename, size: csvData.length }, 'Serving CSV download');

    // Return the actual CSV file
    return new NextResponse(new Uint8Array(csvData), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedUtf8}`,
        'Content-Length': csvData.length.toString(),
      },
    });

  } catch (error) {
    logger.error({ jobId, type, error }, 'Download failed');
    return NextResponse.json(
      { error: 'Failed to prepare download' },
      { status: 500 }
    );
  }
}
