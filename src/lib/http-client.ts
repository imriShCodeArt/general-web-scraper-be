import axios, { AxiosResponse } from 'axios';
import { chromium, Browser, Page } from 'playwright';

export class HTTPClient {
  private static browser: Browser | null = null;

  /**
   * Fetch HTML content from URL with fallback to Playwright
   */
  static async fetchHTML(url: string): Promise<string> {
    try {
      // First try with axios (faster for static HTML)
      const response: AxiosResponse = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        maxRedirects: 5,
      });

      return response.data;
    } catch (error) {
      console.log(`Axios failed for ${url}, trying Playwright...`);
      
      // Fallback to Playwright for JS-rendered pages
      return this.fetchWithPlaywright(url);
    }
  }

  /**
   * Fetch HTML using Playwright (for JS-rendered pages)
   */
  private static async fetchWithPlaywright(url: string): Promise<string> {
    try {
      if (!this.browser) {
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      }

      const page: Page = await this.browser.newPage();
      
      // Set viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      // Note: setUserAgent is not available in this Playwright version, using default

      // Navigate to the page
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait a bit for any dynamic content
      await page.waitForTimeout(2000);

      // Get the HTML content
      const html = await page.content();
      
      await page.close();
      
      return html;
    } catch (error) {
      console.error(`Playwright failed for ${url}:`, error);
      throw new Error(`Failed to fetch ${url}: ${error}`);
    }
  }

  /**
   * Clean up browser resources
   */
  static async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Validate URL format
   */
  static validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract base URL from a URL
   */
  static getBaseURL(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return '';
    }
  }
}
