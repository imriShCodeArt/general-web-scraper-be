import puppeteer, { Browser, Page } from 'puppeteer';
import { JSDOM } from 'jsdom';

export class PuppeteerHttpClient {
  private browser: Browser | null = null;
  private isInitialized = false;

  /**
   * Initialize the Puppeteer browser
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Puppeteer browser:', error);
      throw error;
    }
  }

  /**
   * Get DOM using Puppeteer (with JavaScript execution)
   */
  async getDom(url: string, options?: { waitForSelectors?: string[] }): Promise<JSDOM> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Performance optimizations (allow images/styles; block heavy fonts/media)
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        if (['font', 'media'].includes(type)) {
          return req.abort();
        }
        return req.continue();
      });
      
      // Navigate to the page with more reliable readiness
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Smart selector waiting
      if (options?.waitForSelectors && options.waitForSelectors.length > 0) {
        for (const selector of options.waitForSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 10000 });
          } catch (error) {
            console.warn(`Selector ${selector} not found within timeout`);
          }
        }
      }

      // Explicit wait for common Shopify gallery containers
      try {
        await page.waitForSelector('.product-gallery, .product__media-list, .product__media-item img, picture source', { timeout: 10000 });
      } catch {}

      // Scroll to trigger lazy loading of images
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
        window.scrollTo(0, 0);
      });
      
      // Wait for images to load after scrolling
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extra: dump selector counts when debugging
      if (process.env.SCRAPER_DEBUG === '1') {
        const counts = await page.evaluate(() => ({
          gallery: document.querySelectorAll('.product-gallery').length,
          mediaList: document.querySelectorAll('.product__media-list').length,
          mediaItemImg: document.querySelectorAll('.product__media-item img').length,
          pictureSrc: document.querySelectorAll('picture source').length,
          imgTotal: document.querySelectorAll('img').length,
        }));
        // eslint-disable-next-line no-console
        console.log('[puppeteer] selector counts', counts);
      }

      // Wait for variations to load (WooCommerce specific) - optimized for speed
      await this.waitForWooCommerceVariations(page);

      // Get the final HTML after JavaScript execution
      const html = await page.content();
      
      // Create JSDOM from the rendered HTML
      const dom = new JSDOM(html, { url });

      // Optional HTML snapshot when debugging
      if (process.env.SCRAPER_DEBUG === '1') {
        try {
          const { writeFileSync, mkdirSync, existsSync } = await import('fs');
          if (!existsSync('./debug')) mkdirSync('./debug');
          const ts = Date.now();
          writeFileSync(`./debug/page-${ts}.html`, html);
          // eslint-disable-next-line no-console
          console.log(`[puppeteer] HTML snapshot saved: debug/page-${ts}.html`);
        } catch (e) {
          console.warn('Failed to write HTML snapshot', e);
        }
      }

      return dom;
      
    } finally {
      await page.close();
    }
  }

  /**
   * Wait for WooCommerce variations to load - optimized for speed
   */
  private async waitForWooCommerceVariations(page: Page): Promise<void> {
    try {
      // Quick check for variation forms (most common case)
      const hasVariations = await page.evaluate(() => {
        const variationForms = document.querySelectorAll('.variations_form, .woocommerce-variations, form[class*="variations"]');
        return variationForms.length > 0;
      });
      
      if (hasVariations) {
        // Only wait for essential elements if variations exist
        await page.waitForFunction(() => {
          const forms = document.querySelectorAll('.variations_form, .woocommerce-variations');
          return forms.length > 0;
        }, { timeout: 2000 }); // Reduced from 3000
        
        // Minimal wait for dynamic content
        await new Promise(resolve => setTimeout(resolve, 200)); // Reduced from 500
      }
      
    } catch (error) {
      console.warn('WooCommerce variations not detected, continuing without waiting');
    }
  }

  /**
   * Get DOM using traditional JSDOM (fallback)
   */
  async getDomFallback(url: string): Promise<JSDOM> {
    const response = await fetch(url);
    const html = await response.text();
    return new JSDOM(html, { url });
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if Puppeteer is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.browser !== null;
  }
}
