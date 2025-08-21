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
    let variableProductHandles: string[] = [];
    
    if (adapter) {
      const $ = require('cheerio').load(html);
      
      if (adapter.extractProductUrls) {
        adapterProductUrls = adapter.extractProductUrls($, url, html);
      }
      
      // Test variable product detection if available
      if (adapter.detectVariableProducts) {
        variableProductHandles = adapter.detectVariableProducts($, url);
      }
    }

    // Test universal extraction
    const $ = require('cheerio').load(html);
    
    // Test container detection
    const containers = $('.productgrid, .productgrid--items, .collection-grid, .collection__products, .collection-products, .product-grid');
    const containerInfo = containers.map((_: any, el: any) => {
      const $el = $(el);
      return {
        selector: $el.attr('class') || 'unknown',
        children: $el.children().length,
        productLinks: $el.find('a[href*="/products/"]').length
      };
    }).get();

    // Test product link extraction
    const productLinks = $('a[href*="/products/"]');
    const linkInfo = productLinks.slice(0, 10).map((_: any, link: any) => {
      const $link = $(link);
      const href = $link.attr('href');
      const context = $link.closest('.productgrid--item, .productitem, .collection-grid, .product, .item, .card').length > 0 ? 'product-context' : 'other';
      return { href, context };
    }).get();

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
      variableProductHandles,
      universalExtraction: {
        totalProductLinks: productLinks.length,
        containerInfo,
        sampleLinks: linkInfo,
        htmlLength: html.length
      },
      htmlPreview: html.substring(0, 2000) + '...'
    });

  } catch (error) {
    console.error('Wash-and-dry debug error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
