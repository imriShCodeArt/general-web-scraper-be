import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { JSDOM } from 'jsdom';
import { JsonData } from '../../domain/types';

export class HttpClient {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  ];

  constructor() {
    // Set default axios configuration
    axios.defaults.timeout = 30000;
    axios.defaults.maxRedirects = 5;
    axios.defaults.validateStatus = (status) => status < 400;
  }

  /**
   * Get a random user agent
   */
  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Make a GET request with proper generic typing
   */
  async get<T = string>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(url, {
        ...config,
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...config?.headers,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`HTTP GET request failed: ${error.message} (${error.response?.status})`);
      }
      throw new Error(`HTTP GET request failed: ${error}`);
    }
  }

  /**
   * Make a POST request with proper generic typing
   */
  async post<T = JsonData<unknown>>(url: string, data?: JsonData<unknown>, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.post(url, data, {
        ...config,
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          ...config?.headers,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`HTTP POST request failed: ${error.message} (${error.response?.status})`);
      }
      throw new Error(`HTTP POST request failed: ${error}`);
    }
  }

  /**
   * Get DOM from URL with proper error handling
   */
  async getDom(url: string): Promise<JSDOM> {
    try {
      const html = await this.get<string>(url);
      return new JSDOM(html, { url });
    } catch (error) {
      throw new Error(`Failed to get DOM from ${url}: ${error}`);
    }
  }

  /**
   * Extract embedded JSON data with proper generic typing
   */
  async extractEmbeddedJson(url: string, selectors: string[]): Promise<JsonData<unknown>[]> {
    try {
      const dom = await this.getDom(url);
      const results: JsonData<unknown>[] = [];

      for (const selector of selectors) {
        try {
          const elements = dom.window.document.querySelectorAll(selector);

          for (const element of elements) {
            const textContent = element.textContent?.trim();
            if (textContent) {
              try {
                const json = JSON.parse(textContent);
                results.push(json);
              } catch (parseError) {
                // Skip invalid JSON
                console.warn(`Failed to parse JSON from selector '${selector}':`, parseError);
              }
            }
          }
        } catch (selectorError) {
          console.warn(`Failed to process selector '${selector}':`, selectorError);
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to extract embedded JSON from ${url}: ${error}`);
    }
  }

  /**
   * Extract structured data (JSON-LD) with proper generic typing
   */
  async extractStructuredData(url: string): Promise<JsonData<unknown>[]> {
    try {
      const dom = await this.getDom(url);
      const results: JsonData<unknown>[] = [];

      const scripts = dom.window.document.querySelectorAll('script[type="application/ld+json"]');

      for (const script of scripts) {
        const textContent = script.textContent?.trim();
        if (textContent) {
          try {
            const json = JSON.parse(textContent);
            if (Array.isArray(json)) {
              results.push(...json);
            } else {
              results.push(json);
            }
          } catch (parseError) {
            console.warn('Failed to parse JSON-LD:', parseError);
          }
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to extract structured data from ${url}: ${error}`);
    }
  }

  /**
   * Extract meta tags with proper typing
   */
  async extractMetaTags(url: string): Promise<Record<string, string>> {
    try {
      const dom = await this.getDom(url);
      const metaTags: Record<string, string> = {};

      const metaElements = dom.window.document.querySelectorAll('meta');

      for (const meta of metaElements) {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');

        if (name && content) {
          metaTags[name] = content;
        }
      }

      return metaTags;
    } catch (error) {
      throw new Error(`Failed to extract meta tags from ${url}: ${error}`);
    }
  }

  /**
   * Check if a URL is accessible
   */
  async isAccessible(url: string): Promise<boolean> {
    try {
      await this.get(url, { timeout: 10000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get response headers for a URL
   */
  async getHeaders(url: string): Promise<Record<string, string>> {
    try {
      const response = await axios.head(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
        },
        timeout: 10000,
      });

      return response.headers as Record<string, string>;
    } catch (error) {
      throw new Error(`Failed to get headers from ${url}: ${error}`);
    }
  }

  /**
   * Follow redirects and get final URL
   */
  async getFinalUrl(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': this.getRandomUserAgent(),
        },
      });

      return response.request.res.responseUrl || url;
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 301 || error.response?.status === 302)) {
        const location = error.response?.headers?.location;
        if (location) {
          return this.resolveUrl(location, url);
        }
      }
      return url;
    }
  }

  /**
   * Resolve relative URL to absolute URL
   */
  private resolveUrl(relativeUrl: string, baseUrl: string): string {
    try {
      if (relativeUrl.startsWith('http')) {
        return relativeUrl;
      }

      if (relativeUrl.startsWith('//')) {
        const base = new URL(baseUrl);
        return `${base.protocol}${relativeUrl}`;
      }

      if (relativeUrl.startsWith('/')) {
        const base = new URL(baseUrl);
        return `${base.protocol}//${base.host}${relativeUrl}`;
      }

      const base = new URL(baseUrl);
      return `${base.protocol}//${base.host}${base.pathname.replace(/\/[^/]*$/, '')}/${relativeUrl}`;
    } catch (error) {
      console.warn(`Failed to resolve URL '${relativeUrl}' with base '${baseUrl}':`, error);
      return relativeUrl;
    }
  }

  /**
   * Set custom user agents
   */
  setUserAgents(userAgents: string[]): void {
    if (userAgents.length > 0) {
      this.userAgents = [...userAgents];
    }
  }

  /**
   * Add custom user agent
   */
  addUserAgent(userAgent: string): void {
    this.userAgents.push(userAgent);
  }

  /**
   * Get current user agents
   */
  getUserAgents(): string[] {
    return [...this.userAgents];
  }
}
