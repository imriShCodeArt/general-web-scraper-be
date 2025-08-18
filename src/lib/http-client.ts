import axios, { AxiosResponse } from 'axios';

export class HTTPClient {
  /**
   * Fetch HTML content from URL using axios
   */
  static async fetchHTML(url: string): Promise<string> {
    try {
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
      console.error(`Failed to fetch ${url}:`, error);
      throw new Error(`Failed to fetch ${url}: ${error}`);
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
   * Check if URL is accessible
   */
  static async isAccessible(url: string): Promise<boolean> {
    try {
      await axios.head(url, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}
