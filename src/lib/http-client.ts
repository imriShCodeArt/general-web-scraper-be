import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { JSDOM } from 'jsdom';

export class HttpClient {
  private client: AxiosInstance;
  private userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
  ];

  constructor() {
    this.client = axios.create({
      timeout: 15000, // Reduced from 30000ms to 15000ms for faster failure detection
      maxRedirects: 3, // Reduced from 5 to 3 for faster processing
      validateStatus: (status) => status < 500, // Accept 4xx status codes
      // Connection pooling and performance optimizations
      maxContentLength: 50 * 1024 * 1024, // 50MB max content length
      maxBodyLength: 50 * 1024 * 1024, // 50MB max body length
      // HTTP/2 support for better performance
      httpAgent: new (require('http').Agent)({
        keepAlive: true,
        keepAliveMsecs: 30000,
        maxSockets: 50, // Increased connection pool
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000,
      }),
      httpsAgent: new (require('https').Agent)({
        keepAlive: true,
        keepAliveMsecs: 30000,
        maxSockets: 50, // Increased connection pool
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000,
      }),
    });

    // Add request interceptor for rotating user agents
    this.client.interceptors.request.use((config) => {
      const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      if (randomUserAgent) {
        config.headers['User-Agent'] = randomUserAgent;
      }
      config.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
      config.headers['Accept-Language'] = 'en-US,en;q=0.5,he;q=0.3';
      config.headers['Accept-Encoding'] = 'gzip, deflate, br'; // Added brotli support
      config.headers['Connection'] = 'keep-alive';
      config.headers['Upgrade-Insecure-Requests'] = '1';
      // Performance headers
      config.headers['Cache-Control'] = 'no-cache';
      config.headers['Pragma'] = 'no-cache';
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
        } else if (error.request) {
          console.error('Request failed: No response received');
        } else {
          console.error('Request setup failed:', error.message);
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Make a GET request and return HTML content
   */
  async getHtml(url: string, config?: AxiosRequestConfig): Promise<string> {
    try {
      const response = await this.client.get(url, {
        ...config,
        responseType: 'text',
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch HTML from ${url}: ${error}`);
    }
  }

  /**
   * Make a GET request and return JSON content
   */
  async getJson<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get(url, {
        ...config,
        responseType: 'json',
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch JSON from ${url}: ${error}`);
    }
  }

  /**
   * Make a GET request and return JSDOM document
   */
  async getDom(url: string, config?: AxiosRequestConfig): Promise<JSDOM> {
    try {
      const html = await this.getHtml(url, config);
      return new JSDOM(html, { url });
    } catch (error) {
      throw new Error(`Failed to create DOM from ${url}: ${error}`);
    }
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to POST to ${url}: ${error}`);
    }
  }

  /**
   * Check if URL is accessible
   */
  async checkUrl(url: string): Promise<boolean> {
    try {
      await this.client.head(url, { timeout: 10000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get response headers
   */
  async getHeaders(url: string): Promise<Record<string, string>> {
    try {
      const response = await this.client.head(url);
      const headers: Record<string, string> = {};
      Object.entries(response.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          headers[key] = String(value);
        }
      });
      return headers;
    } catch (error) {
      throw new Error(`Failed to get headers from ${url}: ${error}`);
    }
  }

  /**
   * Follow redirects and get final URL
   */
  async getFinalUrl(url: string): Promise<string> {
    try {
      const response = await this.client.get(url, {
        maxRedirects: 10,
        validateStatus: (status) => status < 400,
      });
      return response.request.res.responseUrl || url;
    } catch (error) {
      return url; // Return original URL if redirect fails
    }
  }

  /**
   * Extract embedded JSON from HTML
   */
  async extractEmbeddedJson(url: string, selectors: string[]): Promise<any[]> {
    try {
      const dom = await this.getDom(url);
      const results: any[] = [];

      for (const selector of selectors) {
        const elements = dom.window.document.querySelectorAll(selector);

        for (const element of elements) {
          try {
            const text = element.textContent?.trim();
            if (text) {
              const json = JSON.parse(text);
              results.push(json);
            }
          } catch (parseError) {
            // Skip invalid JSON
            continue;
          }
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to extract embedded JSON from ${url}: ${error}`);
    }
  }

  /**
   * Extract sitemap URLs
   */
  async extractSitemapUrls(sitemapUrl: string): Promise<string[]> {
    try {
      const dom = await this.getDom(sitemapUrl);
      const urls: string[] = [];

      // Look for sitemap entries
      const locElements = dom.window.document.querySelectorAll('loc');
      for (const element of locElements) {
        const url = element.textContent?.trim();
        if (url) {
          urls.push(url);
        }
      }

      return urls;
    } catch (error) {
      throw new Error(`Failed to extract sitemap URLs from ${sitemapUrl}: ${error}`);
    }
  }

  /**
   * Set custom headers
   */
  setCustomHeaders(headers: Record<string, string>): void {
    this.client.defaults.headers.common = {
      ...this.client.defaults.headers.common,
      ...headers,
    };
  }

  /**
   * Set proxy configuration
   */
  setProxy(proxy: string): void {
    this.client.defaults.proxy = {
      host: proxy.split(':')[0] || 'localhost',
      port: parseInt(proxy.split(':')[1] || '8080'),
    };
  }

  /**
   * Set timeout
   */
  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }

  /**
   * Get request statistics
   */
  getStats(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    } {
    // This would need to be implemented with request/response interceptors
    // For now, return placeholder data
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
    };
  }
}
