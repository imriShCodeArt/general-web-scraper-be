import { RecipeConfig } from '../../types';

/**
 * Shared test utilities to reduce code duplication across test files
 */
export class TestHelpers {
  /**
   * Create a standard mock configuration for testing
   */
  static createMockConfig(): RecipeConfig {
    return {
      name: 'test-recipe',
      description: 'Test recipe for unit testing',
      version: '1.0.0',
      siteUrl: 'https://example.com',
      selectors: {
        title: '.product-title',
        price: '.product-price',
        images: '.product-image',
        stock: '.product-stock',
        sku: '.product-sku',
        description: '.product-description',
        productLinks: '.product-link',
        attributes: '.product-attributes',
        pagination: {
          nextPage: '.next-page',
          maxPages: 5,
        },
      },
      behavior: {
        waitForSelectors: ['.product-loaded'],
        scrollToLoad: false,
        useHeadlessBrowser: false,
        rateLimit: 1000,
        maxConcurrent: 3,
        retryAttempts: 3,
        retryDelay: 1000,
        timeout: 30000,
        fastMode: false,
        skipImages: false,
        skipStyles: false,
        skipScripts: false,
      },
      validation: {
        requiredFields: ['title', 'price'],
        priceFormat: '^\\d+(\\.\\d{2})?$',
        skuFormat: '^[A-Z0-9-]+$',
        minDescriptionLength: 10,
        maxTitleLength: 100,
      },
    };
  }

  /**
   * Create a mock configuration with custom overrides
   */
  static createMockConfigWithOverrides(overrides: Partial<RecipeConfig>): RecipeConfig {
    return {
      ...this.createMockConfig(),
      ...overrides,
    };
  }

  /**
   * Clean up adapter resources after tests
   */
  static async cleanupAdapters(adapters: any[]): Promise<void> {
    for (const adapter of adapters) {
      if (adapter && typeof adapter.cleanup === 'function') {
        try {
          await adapter.cleanup();
        } catch (error) {
          // Ignore cleanup errors in tests
          console.warn('Test cleanup warning:', error);
        }
      }
    }
  }

  /**
   * Create a mock logger for testing
   */
  static createMockLogger() {
    return {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
  }

  /**
   * Create a mock storage service for testing
   */
  static createMockStorageService() {
    return {
      storeJobResult: jest.fn(),
      getJobResult: jest.fn(),
      deleteJobResult: jest.fn(),
      listJobResults: jest.fn(),
    };
  }

  /**
   * Create a mock recipe manager for testing
   */
  static createMockRecipeManager() {
    return {
      createAdapter: jest.fn(),
      loadRecipe: jest.fn(),
      listRecipes: jest.fn(),
      validateRecipe: jest.fn(),
    };
  }

  /**
   * Create a mock CSV generator for testing
   */
  static createMockCsvGenerator() {
    return {
      generateParentCsv: jest.fn(),
      generateVariationCsv: jest.fn(),
      validateProducts: jest.fn(),
    };
  }

  /**
   * Setup console mocks for testing
   */
  static setupConsoleMocks() {
    return {
      mockConsoleLog: jest.spyOn(console, 'log').mockImplementation(() => {}),
      mockConsoleError: jest.spyOn(console, 'error').mockImplementation(() => {}),
      mockConsoleWarn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      mockConsoleInfo: jest.spyOn(console, 'info').mockImplementation(() => {}),
    };
  }

  /**
   * Restore console mocks after testing
   */
  static restoreConsoleMocks(mocks: any) {
    Object.values(mocks).forEach((mock: any) => mock.mockRestore());
  }

  /**
   * Create a mock DOM for testing
   */
  static createMockDom(html: string) {
    const { JSDOM } = require('jsdom');
    return new JSDOM(html);
  }

  /**
   * Create a mock product data object
   */
  static createMockProduct(overrides: any = {}) {
    return {
      title: 'Premium Test Product',
      price: '29.99',
      sku: 'TEST-001',
      description:
        'This is a comprehensive test product description that provides detailed information about features, benefits, and specifications. It includes realistic content for testing purposes and validation scenarios.',
      shortDescription: 'High-quality test product with advanced features',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      stockStatus: 'instock',
      category: 'Electronics',
      attributes: {
        color: ['Red', 'Blue', 'Green'],
        size: ['Small', 'Medium', 'Large'],
        material: ['Cotton', 'Polyester'],
      },
      variations: [],
      regularPrice: '29.99',
      salePrice: '24.99',
      ...overrides,
    };
  }

  /**
   * Create a mock variable product with variations
   */
  static createMockVariableProduct(overrides: any = {}) {
    return {
      title: 'Variable Test Product Collection',
      price: '34.99',
      sku: 'VTP-001',
      description:
        'A comprehensive variable product with multiple variations. Each variation offers different combinations of attributes while maintaining consistent quality and design. Perfect for testing complex product structures.',
      shortDescription: 'Multi-variation test product with extensive options',
      images: ['https://example.com/variable1.jpg', 'https://example.com/variable2.jpg'],
      stockStatus: 'instock',
      category: 'Clothing',
      productType: 'variable',
      attributes: {
        color: ['Red', 'Blue', 'Green', 'Black', 'White'],
        size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        material: ['Cotton', 'Polyester', 'Wool'],
      },
      variations: [
        {
          sku: 'VTP-001-RED-S',
          regularPrice: '34.99',
          salePrice: '29.99',
          taxClass: 'standard',
          stockStatus: 'instock',
          images: ['https://example.com/red-s.jpg'],
          attributeAssignments: {
            color: 'Red',
            size: 'S',
            material: 'Cotton',
          },
        },
        {
          sku: 'VTP-001-BLUE-M',
          regularPrice: '34.99',
          salePrice: '29.99',
          taxClass: 'standard',
          stockStatus: 'instock',
          images: ['https://example.com/blue-m.jpg'],
          attributeAssignments: {
            color: 'Blue',
            size: 'M',
            material: 'Polyester',
          },
        },
      ],
      regularPrice: '34.99',
      salePrice: '29.99',
      ...overrides,
    };
  }
}
