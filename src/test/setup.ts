import { initializeServices, cleanupServices } from '../lib/composition-root';
import { RecipeConfig, RawProduct, NormalizedProduct, ScrapingJob } from '../types';
import './setup-woocommerce-matchers';

// Define the test utilities interface
interface TestUtils {
  createMockRecipe: (overrides?: Partial<RecipeConfig>) => RecipeConfig;
  createMockRawProduct: (overrides?: Partial<RawProduct>) => RawProduct;
  createMockNormalizedProduct: (overrides?: Partial<NormalizedProduct>) => NormalizedProduct;
  createMockScrapingJob: (overrides?: Partial<ScrapingJob>) => ScrapingJob;
  wait: (ms: number) => Promise<void>;
  createMockHttpResponse: (html: string, status?: number) => { body: string; status: number };
  createMockHtml: (content: string) => string;
  resetMocks: () => void;
}

// Extend global types for Jest
declare global {
  // eslint-disable-next-line no-var
  var testUtils: TestUtils;
}

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Initialize services
  await initializeServices();
});

// Global test teardown
afterAll(async () => {
  // Clean up services
  await cleanupServices();
});

// Mock console methods to reduce noise in tests

beforeEach(() => {
  // Suppress console output during tests unless explicitly needed
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console methods
  jest.restoreAllMocks();

  // Clear all mocks
  jest.clearAllMocks();

  // Clear all timers to prevent memory leaks
  jest.clearAllTimers();

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Test utilities
export const testUtils: TestUtils = {
  /**
   * Create a mock recipe configuration for testing
   */
  createMockRecipe: (overrides: Partial<RecipeConfig> = {}) => ({
    name: 'test-recipe',
    description: 'Test recipe for unit testing',
    version: '1.0.0',
    siteUrl: 'https://test-site.com',
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
    ...overrides,
  }),

  /**
   * Create a mock raw product for testing
   */
  createMockRawProduct: (overrides: Partial<RawProduct> = {}) => ({
    id: 'test-001',
    title: 'Test Product',
    slug: 'test-product',
    description: 'This is a test product description for testing purposes',
    shortDescription: 'Test product',
    sku: 'TEST-001',
    stockStatus: 'instock',
    images: ['https://test-site.com/image1.jpg'],
    category: 'Test Category',
    productType: 'simple',
    attributes: { color: ['Red', 'Blue'] },
    variations: [],
    price: '99.99',
    ...overrides,
  }),

  /**
   * Create a mock normalized product for testing
   */
  createMockNormalizedProduct: (overrides: Partial<NormalizedProduct> = {}) => ({
    id: 'test-001',
    title: 'Test Product',
    slug: 'test-product',
    description: 'This is a test product description for testing purposes',
    shortDescription: 'Test product',
    sku: 'TEST-001',
    stockStatus: 'instock',
    images: ['https://test-site.com/image1.jpg'],
    category: 'Test Category',
    productType: 'simple',
    attributes: { color: ['Red', 'Blue'] },
    variations: [],
    regularPrice: '99.99',
    normalizedAt: new Date(),
    sourceUrl: 'https://test-site.com/product/test',
    confidence: 0.95,
    ...overrides,
  }),

  /**
   * Create a mock scraping job for testing
   */
  createMockScrapingJob: (overrides: Partial<ScrapingJob> = {}) => ({
    id: 'test-job-001',
    status: 'pending',
    createdAt: new Date(),
    totalProducts: 0,
    processedProducts: 0,
    errors: [],
    metadata: {
      siteUrl: 'https://test-site.com',
      recipe: 'test-recipe',
      categories: ['test-category'],
    },
    ...overrides,
  }),

  /**
   * Wait for a specified time (useful for testing async operations)
   */
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Create a mock HTTP response
   */
  createMockHttpResponse: (html: string, status: number = 200): { body: string; status: number } => ({
    body: html,
    status,
  }),

  /**
   * Create a mock HTML document
   */
  createMockHtml: (content: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `,

  /**
   * Reset all mocks and restore original implementations
   */
  resetMocks: () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  },
};

// Attach to global for convenience in tests
(globalThis as unknown as { testUtils: TestUtils }).testUtils = testUtils;
