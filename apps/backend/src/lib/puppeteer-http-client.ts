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
      
      // Navigate to the page with faster settings
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', // Faster than networkidle2
        timeout: 15000 // Reduced timeout
      });

      // Wait for specific selectors if provided (with shorter timeout)
      if (options?.waitForSelectors && options.waitForSelectors.length > 0) {
        for (const selector of options.waitForSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 }); // Reduced timeout
          } catch (error) {
            console.warn(`Selector ${selector} not found within timeout`);
          }
        }
      }

      // Wait for variations to load (WooCommerce specific) - faster
      await this.waitForWooCommerceVariations(page);

      // Get the final HTML after JavaScript execution
      const html = await page.content();
      
      // Create JSDOM from the rendered HTML
      return new JSDOM(html, { url });
      
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
        }, { timeout: 3000 }); // Much shorter timeout
        
        // Minimal wait for dynamic content
        await new Promise(resolve => setTimeout(resolve, 500));
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
