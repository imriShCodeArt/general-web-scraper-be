import { HttpClient } from '../http-client';

// Integration tests for HttpClient - these will make real HTTP requests
describe('HttpClient - Integration Tests', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient();
  });

  describe('basic functionality', () => {
    it('should make GET request to real URL', async () => {
      const result = await httpClient.get('https://httpbin.org/get');

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    }, 10000);

    it('should make POST request to real URL', async () => {
      const postData = { test: 'data' };
      const result = await httpClient.post('https://httpbin.org/post', postData);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    }, 10000);

    it('should get DOM from real URL', async () => {
      const dom = await httpClient.getDom('https://httpbin.org/html');

      expect(dom).toBeDefined();
      expect(dom.window).toBeDefined();
      expect(dom.window.document).toBeDefined();
    }, 10000);

    it('should check if URL is accessible', async () => {
      const accessible = await httpClient.isAccessible('https://httpbin.org/get');
      const notAccessible = await httpClient.isAccessible('https://httpbin.org/status/404');

      expect(accessible).toBe(true);
      expect(notAccessible).toBe(false);
    }, 10000);

    it('should get response headers', async () => {
      const headers = await httpClient.getHeaders('https://httpbin.org/get');

      expect(headers).toBeDefined();
      expect(typeof headers).toBe('object');
      expect(headers['content-type']).toBeDefined();
    }, 10000);

    it('should get final URL after redirects', async () => {
      const finalUrl = await httpClient.getFinalUrl('https://httpbin.org/redirect/1');

      expect(finalUrl).toBeDefined();
      expect(typeof finalUrl).toBe('string');
    }, 10000);
  });

  describe('user agent management', () => {
    it('should set custom user agents', () => {
      const customAgents = ['Custom Agent 1', 'Custom Agent 2'];
      httpClient.setUserAgents(customAgents);

      expect(httpClient.getUserAgents()).toEqual(customAgents);
    });

    it('should not set empty user agents array', () => {
      const originalAgents = httpClient.getUserAgents();
      httpClient.setUserAgents([]);

      expect(httpClient.getUserAgents()).toEqual(originalAgents);
    });

    it('should add user agent', () => {
      const originalLength = httpClient.getUserAgents().length;
      httpClient.addUserAgent('New Agent');

      expect(httpClient.getUserAgents()).toHaveLength(originalLength + 1);
      expect(httpClient.getUserAgents()).toContain('New Agent');
    });

    it('should return copy of user agents', () => {
      const agents = httpClient.getUserAgents();
      agents.push('Should not affect original');

      expect(httpClient.getUserAgents()).not.toContain('Should not affect original');
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      await expect(httpClient.get('https://nonexistent-domain-12345.com')).rejects.toThrow();
    }, 10000);

    it('should handle timeout errors', async () => {
      await expect(httpClient.get('https://httpbin.org/delay/10', { timeout: 1000 })).rejects.toThrow();
    }, 15000);
  });

  describe('meta tag extraction', () => {
    it('should extract meta tags from real page', async () => {
      const metaTags = await httpClient.extractMetaTags('https://httpbin.org/html');

      expect(metaTags).toBeDefined();
      expect(typeof metaTags).toBe('object');
    }, 10000);
  });

  describe('JSON extraction', () => {
    it('should extract embedded JSON from page with JSON-LD', async () => {
      // Create a simple test page with JSON-LD

      // Mock the getDom method to return our test HTML
      const originalGetDom = httpClient.getDom.bind(httpClient);
      httpClient.getDom = jest.fn().mockResolvedValue({
        window: {
          document: {
            querySelectorAll: jest.fn().mockReturnValue([
              { textContent: '{"@type": "Product", "name": "Test Product"}' },
            ]),
          },
        },
      } as any);

      const structuredData = await httpClient.extractStructuredData('https://example.com');

      expect(structuredData).toEqual([{ '@type': 'Product', name: 'Test Product' }]);

      // Restore original method
      httpClient.getDom = originalGetDom;
    });
  });
});
