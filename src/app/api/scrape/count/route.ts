import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ArchiveScraper } from '@/lib/archive-scraper';
import { ScrapingService } from '@/lib/scraping-service';
import { HTTPClient } from '@/lib/http-client';

const CountRequestSchema = z.object({
  archiveUrls: z.array(z.string().url()).min(1),
  maxProductsPerArchive: z.number().int().min(0).default(0),
  fast: z.boolean().optional().default(true)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { archiveUrls, maxProductsPerArchive, fast } = CountRequestSchema.parse(body);

    // Ensure host-specific adapters are registered (Shopify/WooCommerce, etc.)
    new ScrapingService();

    if (fast) {
      let total = 0;
      const perArchive: Array<{ url: string; estimate: number }> = [];
      for (const url of archiveUrls) {
        try {
          const html = await HTTPClient.fetchHTML(url);
          const estimate = ArchiveScraper.estimateTotalFromFirstPage(html, url, maxProductsPerArchive);
          total += estimate;
          perArchive.push({ url, estimate });
        } catch {
          perArchive.push({ url, estimate: 0 });
        }
      }
      return NextResponse.json({ success: true, total_product_urls: total, per_archive: perArchive, mode: 'fast' });
    } else {
      const allUrlsSet = new Set<string>();
      const perArchiveCounts: Array<{ url: string; count: number }> = [];
      for (const url of archiveUrls) {
        try {
          const urls = await ArchiveScraper.scrapeAllArchivePages(url, maxProductsPerArchive);
          urls.forEach(u => allUrlsSet.add(u));
          perArchiveCounts.push({ url, count: urls.length });
        } catch {
          perArchiveCounts.push({ url, count: 0 });
        }
      }
      return NextResponse.json({ success: true, total_product_urls: allUrlsSet.size, per_archive: perArchiveCounts, mode: 'full' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid request format', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to count products' }, { status: 500 });
  }
}


