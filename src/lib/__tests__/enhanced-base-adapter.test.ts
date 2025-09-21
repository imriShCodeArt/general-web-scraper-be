import { EnhancedBaseAdapter } from '../core/adapters/enhanced-base-adapter';
import { RawProduct, RecipeConfig } from '../domain/types';
import { HttpClient } from '../infrastructure/http/http-client';
import { PuppeteerHttpClient } from '../infrastructure/http/puppeteer-http-client';
import { JSDOM } from 'jsdom';

// Mock dependencies
jest.mock('../infrastructure/http/http-client');
jest.mock('../infrastructure/http/puppeteer-http-client');

const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;
const MockPuppeteerHttpClient = PuppeteerHttpClient as jest.MockedClass<typeof PuppeteerHttpClient>;

// Create a concrete implementation for testing
class TestAdapter extends EnhancedBaseAdapter<RawProduct> {
  async *discoverProducts(): AsyncIterable<string> {
    yield 'https://test.com/product/1';
    yield 'https://test.com/product/2';
  }

  async extractProduct(): Promise<RawProduct> {
    return {
      id: 'test-001',
      title: 'Test Product',
      slug: 'test-product',
      description: 'Test description',
      shortDescription: 'Test description',
      sku: 'TEST-001',
      stockStatus: 'instock',
      images: ['https://test.com/image.jpg'],
      category: 'Test Category',
      productType: 'simple',
      attributes: {},
      variations: [],
      price: '99.99',
    };
  }
}

describe('EnhancedBaseAdapter', () => {
  let adapter: TestAdapter;
  let mockConfig: RecipeConfig;
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockPuppeteerClient: jest.Mocked<PuppeteerHttpClient>;

  beforeEach(() => {
    mockConfig = {
      name: 'test-recipe',
      version: '1.0.0',
      siteUrl: 'https://test.com',
      selectors: {
        title: '.product-title',
        price: '.product-price',
        images: '.product-image',
        stock: '.product-stock',
        sku: '.product-sku',
        description: '.product-description',
        productLinks: '.product-link',
        attributes: '.product-attributes',
      },
      behavior: {
        useHeadlessBrowser: false,
        rateLimit: 100,
        maxConcurrent: 2,
        retryAttempts: 2,
        retryDelay: 100,
      },
      validation: {
        requiredFields: ['title', 'sku'],
        minDescriptionLength: 10,
        maxTitleLength: 100,
      },
    };

    mockHttpClient = {
      getDom: jest.fn(),
      getHtml: jest.fn(),
      getJson: jest.fn(),
      post: jest.fn(),
      extractEmbeddedJson: jest.fn(),
      checkUrl: jest.fn(),
      getStats: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    mockPuppeteerClient = {
      getDom: jest.fn(),
      getDomFallback: jest.fn(),
      isAvailable: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<PuppeteerHttpClient>;

    // Mock the constructors to return our mock instances
    MockHttpClient.mockImplementation(() => mockHttpClient);
    MockPuppeteerHttpClient.mockImplementation(() => mockPuppeteerClient);

    adapter = new TestAdapter(mockConfig, 'https://test.com');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with configuration', () => {
      expect(adapter.getConfig()).toBe(mockConfig);
      expect(adapter.getBaseUrl()).toBe('https://test.com');
      expect(adapter.getHttpClient()).toBe(mockHttpClient);
    });

    it('should initialize Puppeteer when useHeadlessBrowser is true', () => {
      const puppeteerConfig = {
        ...mockConfig,
        behavior: { ...mockConfig.behavior, useHeadlessBrowser: true },
      };
      const puppeteerAdapter = new TestAdapter(puppeteerConfig, 'https://test.com');

      expect(puppeteerAdapter['puppeteerClient']).toBe(mockPuppeteerClient);
    });
  });

  describe('Product Validation', () => {
    it('should validate product successfully', () => {
      const validProduct = {
        id: 'valid-001',
        title: 'Valid Product',
        slug: 'valid-product',
        description: 'This is a valid product description',
        shortDescription: 'Valid product',
        sku: 'VALID-001',
        stockStatus: 'instock',
        images: ['https://test.com/image.jpg'],
        category: 'Test Category',
        productType: 'simple' as const,
        attributes: {},
        variations: [],
        price: '99.99',
      };

      const errors = adapter.validateProduct(validProduct);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidProduct = {
        id: 'invalid-001',
        title: '', // Missing title
        slug: 'invalid-product',
        description: 'Valid description',
        shortDescription: 'Valid description',
        sku: 'VALID-001',
        stockStatus: 'instock',
        images: ['https://test.com/image.jpg'],
        category: 'Test Category',
        productType: 'simple' as const,
        attributes: {},
        variations: [],
        price: '99.99',
      };

      const errors = adapter.validateProduct(invalidProduct);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('title');
      expect(errors[0].message).toContain('Required field');
    });

    it('should validate description length', () => {
      const invalidProduct = {
        id: 'invalid-002',
        title: 'Valid Title',
        slug: 'valid-title',
        description: 'Short', // Too short
        shortDescription: 'Short',
        sku: 'VALID-001',
        stockStatus: 'instock',
        images: ['https://test.com/image.jpg'],
        category: 'Test Category',
        productType: 'simple' as const,
        attributes: {},
        variations: [],
        price: '99.99',
      };

      const errors = adapter.validateProduct(invalidProduct);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('description');
      expect(errors[0].message).toContain('too short');
    });

    it('should validate title length', () => {
      const longTitle = 'A'.repeat(101); // Too long
      const invalidProduct = {
        id: 'invalid-003',
        title: longTitle,
        slug: 'long-title',
        description: 'Valid description that is long enough',
        shortDescription: 'Valid description',
        sku: 'VALID-001',
        stockStatus: 'instock',
        images: ['https://test.com/image.jpg'],
        category: 'Test Category',
        productType: 'simple' as const,
        attributes: {},
        variations: [],
        price: '99.99',
      };

      const errors = adapter.validateProduct(invalidProduct);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('title');
      expect(errors[0].message).toContain('too long');
    });
  });

  describe('Text Extraction', () => {
    let mockDom: JSDOM;

    beforeEach(() => {
      mockDom = new JSDOM(`
        <html>
          <body>
            <div class="product-title">Test Product Title</div>
            <div class="product-description">
              <p>First paragraph of description</p>
              <p>Second paragraph of description</p>
            </div>
            <div class="product-price">$99.99</div>
            <img class="product-image" src="image1.jpg" />
            <img class="product-image" src="image2.jpg" />
          </body>
        </html>
      `);
    });

    it('should extract text from selector', () => {
      const text = adapter['extractText'](mockDom, '.product-title');
      expect(text).toBe('Test Product Title');
    });

    it('should extract description with paragraphs', () => {
      const description = adapter['extractText'](mockDom, '.product-description');
      expect(description).toContain('First paragraph of description');
      expect(description).toContain('Second paragraph of description');
    });

    it('should handle missing selector gracefully', () => {
      const text = adapter['extractText'](mockDom, '.nonexistent');
      expect(text).toBe('');
    });

    it('should extract images', () => {
      const images = adapter['extractImagesSync'](mockDom, '.product-image');
      expect(images).toHaveLength(2);
      expect(images[0]).toContain('image1.jpg');
      expect(images[1]).toContain('image2.jpg');
    });

    it('should extract price and clean it', () => {
      const price = adapter['extractPrice'](mockDom, '.product-price');
      expect(price).toBe('99.99');
    });

    it('should normalize stock status', () => {
      const inStock = adapter['normalizeStockText']('In Stock');
      const outOfStock = adapter['normalizeStockText']('Out of Stock');
      const unavailable = adapter['normalizeStockText']('Unavailable');

      expect(inStock).toBe('instock');
      expect(outOfStock).toBe('outofstock');
      expect(unavailable).toBe('outofstock');
    });
  });

  describe('URL Resolution', () => {
    it('should resolve absolute URLs', () => {
      const absoluteUrl = 'https://example.com/image.jpg';
      const resolved = adapter['resolveUrl'](absoluteUrl);
      expect(resolved).toBe(absoluteUrl);
    });

    it('should resolve protocol-relative URLs', () => {
      const protocolRelative = '//cdn.example.com/image.jpg';
      const resolved = adapter['resolveUrl'](protocolRelative);
      expect(resolved).toBe('https://cdn.example.com/image.jpg');
    });

    it('should resolve root-relative URLs', () => {
      const rootRelative = '/images/product.jpg';
      const resolved = adapter['resolveUrl'](rootRelative);
      expect(resolved).toBe('https://test.com/images/product.jpg');
    });

    it('should resolve relative URLs', () => {
      const relative = 'images/product.jpg';
      const resolved = adapter['resolveUrl'](relative);
      expect(resolved).toBe('https://test.com/images/product.jpg');
    });

    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'invalid:url';
      const resolved = adapter['resolveUrl'](invalidUrl);
      expect(resolved).toBe('https://test.com/invalid:url');
    });
  });

  describe('DOM Handling', () => {
    it('should use JSDOM by default', async () => {
      const mockDom = new JSDOM('<html><body>Test</body></html>');
      mockHttpClient.getDom.mockResolvedValue(mockDom);

      const result = await adapter['getDom']('https://test.com');
      expect(result).toBe(mockDom);
      expect(mockHttpClient.getDom).toHaveBeenCalledWith('https://test.com');
    });

    it('should use Puppeteer when enabled', async () => {
      const puppeteerConfig = {
        ...mockConfig,
        behavior: { ...mockConfig.behavior, useHeadlessBrowser: true },
      };
      const puppeteerAdapter = new TestAdapter(puppeteerConfig, 'https://test.com');

      const mockDom = new JSDOM('<html><body>Test</body></html>');
      mockPuppeteerClient.getDom.mockResolvedValue(mockDom);

      const result = await puppeteerAdapter['getDom']('https://test.com');
      expect(result).toBe(mockDom);
      expect(mockPuppeteerClient.getDom).toHaveBeenCalledWith('https://test.com', { waitForSelectors: [] });
    });

    it('should fallback to JSDOM when Puppeteer fails', async () => {
      const puppeteerConfig = {
        ...mockConfig,
        behavior: { ...mockConfig.behavior, useHeadlessBrowser: true },
      };
      const puppeteerAdapter = new TestAdapter(puppeteerConfig, 'https://test.com');

      const mockDom = new JSDOM('<html><body>Test</body></html>');
      mockPuppeteerClient.getDom.mockRejectedValue(new Error('Puppeteer failed'));
      mockHttpClient.getDom.mockResolvedValue(mockDom);

      const result = await puppeteerAdapter['getDom']('https://test.com');
      expect(result).toBe(mockDom);
      expect(mockHttpClient.getDom).toHaveBeenCalledWith('https://test.com');
    });
  });

  describe('Product URL Extraction', () => {
    it('should extract product URLs from DOM', () => {
      const mockDom = new JSDOM(`
        <html>
          <body>
            <a href="/product/1">Product 1</a>
            <a href="/product/2">Product 2</a>
            <a href="/category/electronics">Category</a>
          </body>
        </html>
      `);

      const urls = adapter['extractProductUrls'](mockDom);
      expect(urls).toHaveLength(2);
      expect(urls[0]).toContain('/product/1');
      expect(urls[1]).toContain('/product/2');
    });

    it('should handle missing product links gracefully', () => {
      const mockDom = new JSDOM(`
        <html>
          <body>
            <a href="/category/electronics">Category</a>
          </body>
        </html>
      `);

      const urls = adapter['extractProductUrls'](mockDom);
      expect(urls).toHaveLength(0);
    });
  });

  describe('Text Transformations', () => {
    it('should apply regex transformations', () => {
      const text = 'Hello World';
      const transformations = ['Hello->Hi', 'World->Universe'];

      const result = adapter['applyTransformations'](text, transformations);
      expect(result).toBe('Hi Universe');
    });

    it('should handle invalid transformations gracefully', () => {
      const text = 'Hello World';
      const transformations = ['Invalid->', '->Invalid', 'Invalid'];

      const result = adapter['applyTransformations'](text, transformations);
      expect(result).toBe('Hello World'); // No changes
    });
  });

  describe('Cleanup', () => {
    it('should cleanup Puppeteer client when available', async () => {
      const puppeteerConfig = {
        ...mockConfig,
        behavior: { ...mockConfig.behavior, useHeadlessBrowser: true },
      };
      const puppeteerAdapter = new TestAdapter(puppeteerConfig, 'https://test.com');

      await puppeteerAdapter.cleanup();
      expect(mockPuppeteerClient.close).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      const puppeteerConfig = {
        ...mockConfig,
        behavior: { ...mockConfig.behavior, useHeadlessBrowser: true },
      };
      const puppeteerAdapter = new TestAdapter(puppeteerConfig, 'https://test.com');

      mockPuppeteerClient.close.mockRejectedValue(new Error('Cleanup failed'));

      // Should not throw
      await expect(puppeteerAdapter.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle DOM extraction errors gracefully', async () => {
      mockHttpClient.getDom.mockRejectedValue(new Error('Network error'));

      await expect(adapter['getDom']('https://test.com')).rejects.toThrow('Failed to get DOM');
    });

    it('should handle text extraction errors gracefully', () => {
      const mockDom = new JSDOM('<html><body>Test</body></html>');

      // Mock querySelector to throw an error
      jest.spyOn(mockDom.window.document, 'querySelector').mockImplementation(() => {
        throw new Error('DOM error');
      });

      const result = adapter['extractText'](mockDom, '.test');
      expect(result).toBe('');
    });
  });
});
