import { NextRequest, NextResponse } from 'next/server';
import { HTTPClient } from '@/lib/http-client';
import { ArchiveScraper } from '@/lib/archive-scraper';
import { ScrapingService } from '@/lib/scraping-service';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Missing URL parameter' },
        { status: 400 }
      );
    }

    // Initialize the scraping service to register adapters
    new ScrapingService();

    // Fetch the HTML
    const html = await HTTPClient.fetchHTML(url);
    
    // Parse the archive page
    const parsedPage = ArchiveScraper.parseArchivePage(html, url, 1);
    
    // Get the adapter for this host
    const host = new URL(url).hostname;
    const adapter = ArchiveScraper.getAdapter(host);
    
    // Extract product URLs using the adapter
    let adapterProductUrls: string[] = [];
    if (adapter && adapter.extractProductUrls) {
      const $ = require('cheerio').load(html);
      adapterProductUrls = adapter.extractProductUrls($, url, html);
    }

    return NextResponse.json({
      success: true,
      url,
      host,
      hasAdapter: !!adapter,
      adapterName: adapter?.constructor?.name || 'None',
      parsedPage: {
        product_urls: parsedPage.product_urls,
        category_title: parsedPage.category_title,
        has_next_page: parsedPage.has_next_page,
        next_page_url: parsedPage.next_page_url
      },
      adapterProductUrls,
      htmlLength: html.length,
      htmlPreview: html.substring(0, 1000) + '...'
    });

  } catch (error) {
    console.error('SportOnline debug error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
