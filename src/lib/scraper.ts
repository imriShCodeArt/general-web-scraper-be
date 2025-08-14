import * as cheerio from 'cheerio';
import { Product, Variation, TableRow } from '@/types';

export class TableScraper {
  /**
   * Parse HTML table or XML sitemap to extract product URLs
   */
  static parseTablePage(html: string, baseUrl: string): string[] {
    // Check if this is XML content
    if (html.trim().startsWith('<?xml') || html.includes('<urlset')) {
      console.log('Detected XML sitemap, parsing as XML...');
      return this.parseXMLSitemap(html, baseUrl);
    }
    
    console.log('Parsing HTML for tables...');
    return this.parseHTMLTable(html, baseUrl);
  }
  
  /**
   * Parse XML sitemap to extract product URLs
   */
  private static parseXMLSitemap(xmlContent: string, baseUrl: string): string[] {
    const urls: string[] = [];
    
    try {
      // Use cheerio to parse XML
      const $ = cheerio.load(xmlContent, { xmlMode: true });
      
      console.log('Parsing XML sitemap...');
      console.log('XML length:', xmlContent.length);
      
      // Look for <url> elements
      const urlElements = $('url');
      console.log('Found URL elements:', urlElements.length);
      
      if (urlElements.length === 0) {
        // Try alternative XML structure
        const locElements = $('loc');
        console.log('Found LOC elements:', locElements.length);
        
        locElements.each((index, element) => {
          const url = $(element).text().trim();
          if (url && url.includes('http')) {
            try {
              const fullUrl = new URL(url, baseUrl).toString();
              urls.push(fullUrl);
              console.log(`Added URL from XML: ${fullUrl}`);
            } catch (error) {
              console.warn(`Invalid URL found in XML: ${url}`, error);
            }
          }
        });
      } else {
        // Standard sitemap structure with <url> elements
        urlElements.each((index, element) => {
          const $url = $(element);
          const loc = $url.find('loc').text().trim();
          
          if (loc && loc.includes('http')) {
            try {
              const fullUrl = new URL(loc, baseUrl).toString();
              urls.push(fullUrl);
              console.log(`Added URL from XML sitemap: ${fullUrl}`);
            } catch (error) {
              console.warn(`Invalid URL found in XML sitemap: ${loc}`, error);
            }
          }
        });
      }
      
      console.log('Total URLs extracted from XML:', urls.length);
      return urls;
      
    } catch (error) {
      console.error('Error parsing XML sitemap:', error);
      return [];
    }
  }
  
  /**
   * Parse HTML table to extract product URLs
   */
  private static parseHTMLTable(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const urls: string[] = [];
    
    console.log('HTML length:', html.length);
    
    // Try multiple table selectors
    const tables = $('table, #sitemap, [id*="sitemap"]');
    console.log('Found tables:', tables.length);
    
    // Also try to find the specific sitemap table
          const sitemapTable = $('#sitemap');
      if (sitemapTable.length > 0) {
        console.log('Found sitemap table with ID:', sitemapTable.attr('id'));
        const html = sitemapTable.html();
        if (html) {
          console.log('Sitemap table HTML:', html.substring(0, 200));
        }
      }
    
    if (tables.length === 0) {
      console.log('No tables found, trying alternative selectors...');
      // Try to find any table-like structure
      const tableRows = $('tr, .sitemap-row, [class*="sitemap"]');
      console.log('Found table rows:', tableRows.length);
    }
    
    tables.each((tableIndex, table) => {
      const $table = $(table);
      console.log(`Processing table ${tableIndex + 1}:`, $table.attr('id') || 'no-id');
      
      const rows = $table.find('tr, tbody tr');
      console.log(`Table ${tableIndex + 1} has ${rows.length} rows`);
      
      rows.each((rowIndex, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        // Only process rows with td cells (skip header rows with th)
        if (cells.length > 0) {
          console.log(`Processing row ${rowIndex + 1} with ${cells.length} cells`);
          
          // First column should contain the URL
          const urlCell = cells.first();
          const href = urlCell.find('a').attr('href') || urlCell.text().trim();
          
          console.log(`Row ${rowIndex + 1} href:`, href);
          
          if (href && href !== 'URL' && href !== 'Last Mod.' && href.includes('http')) {
            try {
              const fullUrl = new URL(href, baseUrl).toString();
              urls.push(fullUrl);
              console.log(`Added URL: ${fullUrl}`);
            } catch (error) {
              console.warn(`Invalid URL found: ${href}`, error);
            }
          }
        }
      });
    });
    
    console.log('Total URLs extracted from HTML:', urls.length);
    return urls;
  }

  /**
   * Parse table rows with additional data
   */
  static parseTableRows(html: string, baseUrl: string): TableRow[] {
    const $ = cheerio.load(html);
    const rows: TableRow[] = [];
    
    $('table tr').each((_, row) => {
      const $row = $(row);
      const cells = $row.find('td');
      
      if (cells.length >= 1) {
        const urlCell = cells.first();
        const href = urlCell.find('a').attr('href') || urlCell.text().trim();
        
        if (href) {
          try {
            const fullUrl = new URL(href, baseUrl).toString();
            const rowData: TableRow = { url: fullUrl };
            
            // Extract images if available (second column)
            if (cells.length > 1) {
              const imagesCell = cells.eq(1);
              const images = imagesCell.find('img').map((_, img) => $(img).attr('src')).get();
              if (images.length > 0) {
                rowData.images = images.join(', ');
              }
            }
            
            // Extract last modified if available (third column)
            if (cells.length > 2) {
              const lastModCell = cells.eq(2);
              rowData.lastModified = lastModCell.text().trim();
            }
            
            rows.push(rowData);
          } catch (error) {
            console.warn(`Invalid URL found: ${href}`);
          }
        }
      }
    });
    
    return rows;
  }
}

export class ProductScraper {
  /**
   * Scrape product page for metadata
   */
  static async scrapeProductPage(url: string, html: string): Promise<Partial<Product>> {
    const $ = cheerio.load(html);
    
    const product: Partial<Product> = {
      url,
      title: '',
      slug: '',
      sku: '',
      stock_status: 'instock',
      images: [],
      description: '',
      category: '',
      attributes: {},
      variations: []
    };

    // Extract title
    product.title = $('h1').first().text().trim() || 
                   $('title').text().trim() ||
                   $('[data-product-title]').text().trim();
    
    console.log(`[ProductScraper] Extracted title: "${product.title}"`);

    // Extract slug from URL or title
    product.slug = this.generateSlug(product.title || url);

    // Extract SKU
    product.sku = $('[data-sku]').text().trim() ||
                  $('.sku').text().trim() ||
                  $('.product-sku').text().trim() ||
                  this.generateSKU(product.title || 'product');

    // Extract images
    product.images = this.extractImages($);

    // Extract description - try multiple selectors
    product.description = $('.product-description, .description, [data-product-description], .product-summary, .product-details').text().trim() ||
                         $('meta[name="description"]').attr('content') ||
                         $('.woocommerce-product-details__short-description').text().trim() ||
                         $('.product-short-description').text().trim() ||
                         $('.entry-content').text().trim() ||
                         '';
    
    console.log(`[ProductScraper] Extracted description length: ${product.description.length}`);
    if (product.description.length > 0) {
      console.log(`[ProductScraper] Description preview: "${product.description.substring(0, 100)}..."`);
    }

    // Extract category from breadcrumbs
    product.category = this.extractCategory($);
    console.log(`[ProductScraper] Extracted category: "${product.category}"`);

    // Extract attributes
    product.attributes = this.extractAttributes($);

    // Extract variations
    product.variations = this.extractVariations($, product.sku || '');

    return product;
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private static generateSKU(title: string): string {
    const prefix = title
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, 'X');
    
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  private static extractImages($: cheerio.CheerioAPI, context?: cheerio.Cheerio<any>): string[] {
    const images: string[] = [];
    
    if (context) {
      // Extract images from a specific context (like a variation)
      context.find('img').each((_, img) => {
        const src = $(img).attr('src');
        if (src && !images.includes(src)) {
          images.push(src);
        }
      });
    } else {
      // Extract images from the entire document
      $('img[src*="product"], .product-image img, .gallery img, [data-product-image], .woocommerce-product-gallery img, .product-gallery img').each((_, img) => {
        const src = $(img).attr('src');
        if (src && !images.includes(src)) {
          images.push(src);
        }
      });

      // Fallback to any image that might be a product image
      if (images.length === 0) {
        $('img').each((_, img) => {
          const src = $(img).attr('src');
          if (src && src.includes('http') && !images.includes(src)) {
            images.push(src);
          }
        });
      }
    }

    return images.slice(0, 10); // Limit to 10 images
  }

  private static extractCategory($: cheerio.CheerioAPI): string {
    // Try breadcrumbs first
    const breadcrumbs = $('.breadcrumb a, .breadcrumbs a, nav[aria-label="breadcrumb"] a, .breadcrumb-nav a');
    if (breadcrumbs.length > 0) {
      return breadcrumbs.last().text().trim();
    }

    // Try category links
    const categoryLink = $('a[href*="category"], .category a, .product-category a, .product-cat a');
    if (categoryLink.length > 0) {
      return categoryLink.first().text().trim();
    }

    // Try to extract from URL path
    const urlPath = $('meta[property="og:url"]').attr('content') || 
                   $('link[rel="canonical"]').attr('href') || '';
    
    if (urlPath) {
      const urlMatch = urlPath.match(/\/([^\/]+)\/?$/);
      if (urlMatch && urlMatch[1] && !urlMatch[1].includes('product')) {
        return urlMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    return 'Uncategorized';
  }

  private static extractAttributes($: cheerio.CheerioAPI): Product['attributes'] {
    const attributes: Product['attributes'] = {};

    // Look for color variations
    $('[data-attribute="color"], .color-option, .attribute-color').each((_, el) => {
      const color = $(el).text().trim() || $(el).attr('data-value');
      if (color) {
        if (!attributes.Color) attributes.Color = [];
        attributes.Color.push(color);
      }
    });

    // Look for size variations
    $('[data-attribute="size"], .size-option, .attribute-size').each((_, el) => {
      const size = $(el).text().trim() || $(el).attr('data-value');
      if (size) {
        if (!attributes.Size) attributes.Size = [];
        attributes.Size.push(size);
      }
    });

    return attributes;
  }

  private static extractVariations($: cheerio.CheerioAPI, parentSku: string): Variation[] {
    const variations: Variation[] = [];

    // Look for variation containers
    $('.variation, .product-variation, [data-variation]').each((_, variationElement) => {
      const $variation = $(variationElement);
      
      const sku = $variation.find('[data-sku]').text().trim() ||
                  $variation.find('.sku').text().trim() ||
                  `${parentSku}-${variations.length + 1}`;

      const price = $variation.find('.price, [data-price]').text().trim() ||
                    $variation.find('.variation-price').text().trim() ||
                    '0.00';

      const color = $variation.find('[data-color], .color').text().trim() ||
                    $variation.find('.variation-color').text().trim();

      const size = $variation.find('[data-size], .size').text().trim() ||
                   $variation.find('.variation-size').text().trim();

      const stockStatus = $variation.find('.stock-status').text().trim() ||
                          $variation.find('[data-stock]').text().trim() ||
                          'instock';

      const variationImages = this.extractImages($, $variation);

      const variation: Variation = {
        parent_sku: parentSku,
        sku,
        stock_status: stockStatus,
        regular_price: this.cleanPrice(price),
        tax_class: 'parent',
        images: variationImages,
        meta: {}
      };

      if (color) variation.meta.attribute_Color = color;
      if (size) variation.meta.attribute_Size = size;

      variations.push(variation);
    });

    return variations;
  }

  private static cleanPrice(price: string): string {
    return price.replace(/[^\d.,]/g, '').replace(',', '.') || '0.00';
  }
}
