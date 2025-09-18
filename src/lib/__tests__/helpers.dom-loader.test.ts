import { getDomWithStrategy, createDomLoaderStrategy } from '../helpers/dom-loader';
import { HttpClient } from '../infrastructure/http/http-client';
import { PuppeteerHttpClient } from '../infrastructure/http/puppeteer-http-client';

// Mock the dependencies
jest.mock('../infrastructure/http/http-client');
jest.mock('../infrastructure/http/puppeteer-http-client');

describe('helpers/dom-loader', () => {
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockPuppeteerClient: jest.Mocked<PuppeteerHttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      getDom: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    mockPuppeteerClient = {
      getDom: jest.fn(),
    } as unknown as jest.Mocked<PuppeteerHttpClient>;
  });

  test('createDomLoaderStrategy creates strategy with correct settings', () => {
    const strategy = createDomLoaderStrategy(mockHttpClient, mockPuppeteerClient, true);

    expect(strategy.httpClient).toBe(mockHttpClient);
    expect(strategy.puppeteerClient).toBe(mockPuppeteerClient);
    expect(strategy.useHeadless).toBe(true);
  });

  test('getDomWithStrategy uses Puppeteer when enabled', async () => {
    const mockDom = new (require('jsdom').JSDOM)('<html><body>Test</body></html>');
    mockPuppeteerClient.getDom.mockResolvedValue(mockDom);

    const strategy = createDomLoaderStrategy(mockHttpClient, mockPuppeteerClient, true);

    const result = await getDomWithStrategy('https://example.com', {
      httpClient: mockHttpClient,
      puppeteerClient: mockPuppeteerClient,
      useHeadless: true,
      timeout: 30000,
    }, strategy);

    expect(mockPuppeteerClient.getDom).toHaveBeenCalledWith('https://example.com', { waitForSelectors: [] });
    expect(result.window.document.body.textContent).toBe('Test');
  });

  test('getDomWithStrategy falls back to HTTP client when Puppeteer fails', async () => {
    const mockDom = new (require('jsdom').JSDOM)('<html><body>Fallback</body></html>');
    mockPuppeteerClient.getDom.mockRejectedValue(new Error('Puppeteer failed'));
    mockHttpClient.getDom.mockResolvedValue(mockDom);

    const strategy = createDomLoaderStrategy(mockHttpClient, mockPuppeteerClient, true);

    const result = await getDomWithStrategy('https://example.com', {
      httpClient: mockHttpClient,
      puppeteerClient: mockPuppeteerClient,
      useHeadless: true,
      timeout: 30000,
    }, strategy);

    expect(mockHttpClient.getDom).toHaveBeenCalledWith('https://example.com');
    expect(result.window.document.body.textContent).toBe('Fallback');
  });

  test('getDomWithStrategy uses HTTP client when headless is disabled', async () => {
    const mockDom = new (require('jsdom').JSDOM)('<html><body>HTTP</body></html>');
    mockHttpClient.getDom.mockResolvedValue(mockDom);

    const strategy = createDomLoaderStrategy(mockHttpClient, mockPuppeteerClient, false);

    const result = await getDomWithStrategy('https://example.com', {
      httpClient: mockHttpClient,
      puppeteerClient: mockPuppeteerClient,
      useHeadless: false,
      timeout: 30000,
    }, strategy);

    expect(mockHttpClient.getDom).toHaveBeenCalledWith('https://example.com');
    expect(mockPuppeteerClient.getDom).not.toHaveBeenCalled();
    expect(result.window.document.body.textContent).toBe('HTTP');
  });
});
