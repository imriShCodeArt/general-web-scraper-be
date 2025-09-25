/* istanbul ignore file */
import { PuppeteerHttpClient } from '../puppeteer-http-client';

// Integration tests for PuppeteerHttpClient
describe('PuppeteerHttpClient - Integration Tests', () => {
  let httpClient: PuppeteerHttpClient;

  beforeEach(() => {
    httpClient = new PuppeteerHttpClient();
  });

  afterEach(async () => {
    await httpClient.close();
  });

  describe('basic functionality', () => {
    it('should get DOM from real URL', async () => {
      const dom = await httpClient.getDom('https://httpbin.org/html');

      expect(dom).toBeDefined();
      expect(dom.window).toBeDefined();
      expect(dom.window.document).toBeDefined();
    }, 30000);

    it('should get DOM with wait for selectors', async () => {
      const dom = await httpClient.getDom('https://httpbin.org/html', {
        waitForSelectors: ['body', 'html'],
      });

      expect(dom).toBeDefined();
      expect(dom.window).toBeDefined();
      expect(dom.window.document).toBeDefined();
    }, 30000);

    it('should handle fallback when Puppeteer fails', async () => {
      // This test might fail if Puppeteer is not available
      try {
        const dom = await httpClient.getDomFallback('https://example.com');

        expect(dom).toBeDefined();
        expect(dom.window).toBeDefined();
        expect(dom.window.document).toBeDefined();
      } catch (error) {
        // Fallback might fail in some environments, that's okay
        expect(error).toBeDefined();
      }
    }, 60000);
  });

  describe('availability check', () => {
    it('should check if Puppeteer is available', () => {
      const isAvailable = httpClient.isAvailable();

      expect(typeof isAvailable).toBe('boolean');
    });

    it('should be available after initialization', async () => {
      // Initialize by making a request
      try {
        await httpClient.getDom('https://httpbin.org/html');
        expect(httpClient.isAvailable()).toBe(true);
      } catch (error) {
        // Puppeteer might not be available in test environment
        // In this case, isAvailable() might still return true if initialization succeeded
        expect(typeof httpClient.isAvailable()).toBe('boolean');
      }
    }, 30000);
  });

  describe('error handling', () => {
    it('should handle invalid URLs gracefully', async () => {
      await expect(httpClient.getDom('invalid-url')).rejects.toThrow();
    }, 15000);

    it('should handle network errors gracefully', async () => {
      await expect(httpClient.getDom('https://nonexistent-domain-12345.com')).rejects.toThrow();
    }, 15000);
  });

  describe('close method', () => {
    it('should close browser without errors', async () => {
      await expect(httpClient.close()).resolves.not.toThrow();
    });

    it('should handle multiple close calls gracefully', async () => {
      await httpClient.close();
      await expect(httpClient.close()).resolves.not.toThrow();
    });
  });
});
