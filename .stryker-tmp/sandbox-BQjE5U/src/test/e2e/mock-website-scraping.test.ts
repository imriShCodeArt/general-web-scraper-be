// @ts-nocheck
import { ScrapingService } from '../../lib/scraping-service';
import { CsvGenerator } from '../../lib/csv-generator';
import { rootContainer, TOKENS } from '../../lib/composition-root';
import type { Container } from '../../lib/di/container';
import { RecipeManager } from '../../lib/recipe-manager';
import { StorageService } from '../../lib/storage';
import { testUtils } from '../setup';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';

// We will override DI tokens within a request-scoped container per test

describe('E2E Mock Website Scraping Tests', () => {
  let scrapingService: ScrapingService;
  let scope: Container;
  let mockRecipeManager: jest.Mocked<RecipeManager>;
  let mockStorageService: jest.Mocked<StorageService>;
  let mockCsvGenerator: jest.Mocked<CsvGenerator>;
  let mockServer: Server;
  let mockServerUrl: string;

  beforeAll(async () => {
    // Create a mock HTTP server to simulate a real website
    mockServer = createServer((req, res) => {
      const url = req.url || '/';

      if (url === '/') {
        // Homepage with product links
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>Mock E-commerce Site</title></head>
            <body>
              <h1>Welcome to Mock Store</h1>
              <div class="products">
                <a href="/product/1" class="product-link">Product 1</a>
                <a href="/product/2" class="product-link">Product 2</a>
                <a href="/product/3" class="product-link">Product 3</a>
              </div>
            </body>
          </html>
        `);
      } else if (url.startsWith('/product/')) {
        // Individual product pages
        const productId = url.split('/').pop();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>Product ${productId}</title></head>
            <body>
              <div class="product">
                <h1 class="product-title">Product ${productId} Title</h1>
                <div class="product-price">$${99 + parseInt(productId || '1')}.99</div>
                <div class="product-sku">SKU-${productId?.padStart(3, '0')}</div>
                <div class="product-stock">In Stock</div>
                <div class="product-description">
                  <p>This is a detailed description for Product ${productId}.</p>
                  <p>It includes multiple paragraphs and detailed information.</p>
                </div>
                <div class="product-images">
                  <img src="/images/product${productId}.jpg" class="product-image" />
                  <img src="/images/product${productId}-2.jpg" class="product-image" />
                </div>
                <div class="product-attributes">
                  <div class="attribute">
                    <span class="attribute-name">Color</span>
                    <span class="attribute-value">Red</span>
                    <span class="attribute-value">Blue</span>
                  </div>
                  <div class="attribute">
                    <span class="attribute-name">Size</span>
                    <span class="attribute-value">Small</span>
                    <span class="attribute-value">Medium</span>
                    <span class="attribute-value">Large</span>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
      } else if (url.startsWith('/images/')) {
        // Mock image responses
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end('fake-image-data');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
      }
    });

    // Start the mock server
    await new Promise<void>((resolve) => {
      mockServer.listen(0, () => {
        const address = mockServer.address() as AddressInfo;
        mockServerUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Clean up mock server
    await new Promise<void>((resolve) => {
      mockServer.close(() => resolve());
    });
  });

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockRecipeManager = {
      getRecipe: jest.fn(),
      createAdapter: jest.fn(),
      listRecipes: jest.fn(),
      getRecipeBySiteUrl: jest.fn(),
      createAdapterFromFile: jest.fn(),
      listRecipesWithDetails: jest.fn(),
      loadRecipeFromFile: jest.fn(),
      validateRecipe: jest.fn(),
      clearCaches: jest.fn(),
      getCachedAdapter: jest.fn(),
      removeCachedAdapter: jest.fn(),
      getRecipeLoader: jest.fn(),
      getRecipeDetails: jest.fn(),
      // Add missing properties
      recipesDir: './recipes',
      recipeLoader: {} as any,
      adapterCache: new Map(),
      validateSiteUrl: jest.fn(),
    } as any;

    mockStorageService = {
      storeJobResult: jest.fn(),
      getJobResult: jest.fn(),
      getStorageStats: jest.fn(),
      getAllJobIds: jest.fn(),
      deleteJobResult: jest.fn(),
      stopCleanupInterval: jest.fn(),
      clearAll: jest.fn(),
      // Add missing properties
      inMemoryStorage: new Map(),
      storageDir: './storage',
      cleanupInterval: {} as any,
      ensureStorageDir: jest.fn(),
    } as any;

    mockCsvGenerator = {
      generateParentCsv: jest.fn(),
      generateVariationCsv: jest.fn(),
      generateBothCsvs: jest.fn(),
      generateFilename: jest.fn(),
      validateProducts: jest.fn(),
      csvWriter: {} as any,
      cleanAttributeName: jest.fn(),
      attributeDisplayName: jest.fn(),
      deduplicateProducts: jest.fn(),
    } as any;

    // Create request scope and register overrides
    scope = rootContainer.createScope();
    scope.register(TOKENS.RecipeManager, { lifetime: 'scoped', factory: () => mockRecipeManager });
    scope.register(TOKENS.StorageService, { lifetime: 'scoped', factory: () => mockStorageService });
    scope.register(TOKENS.CsvGenerator, { lifetime: 'scoped', factory: () => mockCsvGenerator });
    scope.register(TOKENS.ScrapingService, {
      lifetime: 'transient',
      factory: async (c) => new ScrapingService(
        await c.resolve(TOKENS.StorageService),
        await c.resolve(TOKENS.RecipeManager),
        await c.resolve(TOKENS.CsvGenerator),
        await c.resolve(TOKENS.Logger),
      ),
    });

    scrapingService = await scope.resolve(TOKENS.ScrapingService);
  });

  afterEach(async () => {
    await scrapingService.cleanup();
    await scope.dispose();
  });

  describe('Real Website Scraping Simulation', () => {
    it('should scrape a complete mock website successfully', async () => {
      // Create a recipe that matches our mock website structure
      const mockRecipe = testUtils.createMockRecipe({
        siteUrl: mockServerUrl,
        selectors: {
          title: '.product-title',
          price: '.product-price',
          images: '.product-image',
          stock: '.product-stock',
          sku: '.product-sku',
          description: '.product-description',
          productLinks: '.product-link',
          attributes: '.product-attributes .attribute',
        },
        behavior: {
          useHeadlessBrowser: false, // Use JSDOM for faster testing
          rateLimit: 50, // Fast rate limiting for testing
          maxConcurrent: 2,
        },
        validation: {
          requiredFields: ['title', 'sku', 'description'],
          minDescriptionLength: 10,
          maxTitleLength: 100,
        },
      });

      mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

      // Create a real adapter that will actually scrape the mock website
      const realAdapter = {
        discoverProducts: jest.fn().mockImplementation(async function* () {
          // Discover products from the homepage
          const response = await fetch(`${mockServerUrl}/`);
          const html = await response.text();
          const dom = new (await import('jsdom')).JSDOM(html);

          const productLinks = dom.window.document.querySelectorAll('.product-link');
          for (const link of productLinks) {
            const href = link.getAttribute('href');
            if (href) {
              yield `${mockServerUrl}${href}`;
            }
          }
        }),
        extractProduct: jest.fn().mockImplementation(async (url: string) => {
          // Actually fetch and parse the product page
          const response = await fetch(url);
          const html = await response.text();
          const dom = new (await import('jsdom')).JSDOM(html);

          const title =
            dom.window.document.querySelector('.product-title')?.textContent?.trim() || '';
          const price =
            dom.window.document.querySelector('.product-price')?.textContent?.trim() || '';
          const sku = dom.window.document.querySelector('.product-sku')?.textContent?.trim() || '';
          const stock =
            dom.window.document.querySelector('.product-stock')?.textContent?.trim() || '';
          const description =
            dom.window.document.querySelector('.product-description')?.textContent?.trim() || '';

          const images = Array.from(dom.window.document.querySelectorAll('.product-image'))
            .map((img) => img.getAttribute('src'))
            .filter((src) => src)
            .map((src) => `${mockServerUrl}${src}`);

          const attributes: Record<string, string[]> = {};
          const attributeElements = dom.window.document.querySelectorAll(
            '.product-attributes .attribute',
          );
          for (const element of attributeElements) {
            const name = element.querySelector('.attribute-name')?.textContent?.trim();
            const values = Array.from(element.querySelectorAll('.attribute-value'))
              .map((val) => val.textContent?.trim())
              .filter((val) => val);

            if (name && values.length > 0) {
              attributes[name] = values;
            }
          }

          return {
            title,
            sku,
            description,
            stockStatus: stock.toLowerCase().includes('in stock') ? 'instock' : 'outofstock',
            images,
            category: 'Test Category',
            attributes,
            variations: [],
            price: price.replace('$', ''),
          };
        }),
        validateProduct: jest.fn().mockReturnValue([]),
        getConfig: jest.fn().mockReturnValue(mockRecipe),
        cleanup: jest.fn().mockResolvedValue(undefined),
      };

      mockRecipeManager.createAdapter.mockResolvedValue(realAdapter);

      // Mock CSV generation
      const mockCsvResult = {
        parentCsv: 'parent,csv,data',
        variationCsv: 'variation,csv,data',
        variationCount: 0,
      };
      jest.spyOn(CsvGenerator, 'generateBothCsvs').mockResolvedValue({
        ...mockCsvResult,
        productCount: 3,
      });

      // Mock storage
      mockStorageService.storeJobResult.mockResolvedValue(undefined);

      // Start scraping job
      const request = {
        siteUrl: mockServerUrl,
        recipe: 'mock-website-recipe',
        options: {
          maxProducts: 10,
          categories: ['test'],
        },
      };

      const response = await scrapingService.startScraping(request);
      expect(response.success).toBe(true);
      expect(response.data?.jobId).toBeDefined();

      // Wait for job to complete
      await testUtils.wait(3000);

      // Check job status
      const jobStatus = await scrapingService.getJobStatus(response.data!.jobId);
      expect(jobStatus.success).toBe(true);
      expect(jobStatus.data?.status).toBe('completed');
      expect(jobStatus.data?.totalProducts).toBe(3);
      expect(jobStatus.data?.processedProducts).toBe(3);

      // Verify the adapter was called correctly
      expect(realAdapter.discoverProducts).toHaveBeenCalled();
      expect(realAdapter.extractProduct).toHaveBeenCalledTimes(3);

      // Verify CSV generation was called with the scraped data
      expect(CsvGenerator.generateBothCsvs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Product 1 Title',
            sku: 'SKU-001',
            description: expect.stringContaining('detailed description'),
            stockStatus: 'instock',
            images: expect.arrayContaining([
              expect.stringContaining('/images/product1.jpg'),
              expect.stringContaining('/images/product1-2.jpg'),
            ]),
            attributes: expect.objectContaining({
              Color: ['Red', 'Blue'],
              Size: ['Small', 'Medium', 'Large'],
            }),
          }),
          expect.objectContaining({
            title: 'Product 2 Title',
            sku: 'SKU-002',
          }),
          expect.objectContaining({
            title: 'Product 3 Title',
            sku: 'SKU-003',
          }),
        ]),
      );

      // Verify storage was called
      expect(mockStorageService.storeJobResult).toHaveBeenCalledWith(
        response.data!.jobId,
        expect.objectContaining({
          jobId: response.data!.jobId,
          productCount: 3,
          variationCount: 0,
        }),
      );
    });

    it('should handle network errors gracefully', async () => {
      // Create a recipe that points to a non-existent server
      const mockRecipe = testUtils.createMockRecipe({
        siteUrl: 'http://localhost:9999', // Port that won't be listening
        selectors: Object.assign({}, testUtils.createMockRecipe().selectors, {
          title: '.product-title',
          price: '.product-price',
          productLinks: '.product-link',
        }),
      });

      mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

      // Create an adapter that will fail to connect
      const failingAdapter = {
        discoverProducts: jest.fn().mockImplementation(async function* () {
          yield 'dummy-url'; // Required by require-yield rule
          throw new Error('Connection refused');
        }),
        extractProduct: jest.fn(),
        validateProduct: jest.fn().mockReturnValue([]),
        getConfig: jest.fn().mockReturnValue(mockRecipe),
        cleanup: jest.fn().mockResolvedValue(undefined),
      };

      mockRecipeManager.createAdapter.mockResolvedValue(failingAdapter);

      // Start scraping job
      const request = {
        siteUrl: 'http://localhost:9999',
        recipe: 'failing-recipe',
      };

      const response = await scrapingService.startScraping(request);
      expect(response.success).toBe(true);

      // Wait for job to fail
      await testUtils.wait(100);

      const jobStatus = await scrapingService.getJobStatus(response.data!.jobId);
      expect(jobStatus.success).toBe(true);
      expect(jobStatus.data?.status).toBe('failed');
      expect(jobStatus.data?.errors).toHaveLength(1);
      expect(jobStatus.data?.errors[0].message).toContain('Connection refused');
    });

    it('should handle malformed HTML gracefully', async () => {
      // Create a recipe for a page with malformed HTML
      const mockRecipe = testUtils.createMockRecipe({
        siteUrl: mockServerUrl,
        selectors: Object.assign({}, testUtils.createMockRecipe().selectors, {
          title: '.product-title',
          price: '.product-price',
          productLinks: '.product-link',
        }),
      });

      mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

      // Create an adapter that handles malformed HTML
      const robustAdapter = {
        discoverProducts: jest.fn().mockImplementation(async function* () {
          yield `${mockServerUrl}/product/1`;
        }),
        extractProduct: jest.fn().mockImplementation(async () => {
          // Return malformed HTML
          const malformedHtml = `
            <html>
              <body>
                <div class="product-title">Product Title
                <div class="product-price">$99.99
                <div class="product-sku">SKU-001
                <div class="product-description">Description
              </body>
            </html>
          `;

          const dom = new (await import('jsdom')).JSDOM(malformedHtml);

          // Try to extract data even from malformed HTML
          const title =
            dom.window.document.querySelector('.product-title')?.textContent?.trim() || '';
          const price =
            dom.window.document.querySelector('.product-price')?.textContent?.trim() || '';
          const sku = dom.window.document.querySelector('.product-sku')?.textContent?.trim() || '';
          const description =
            dom.window.document.querySelector('.product-description')?.textContent?.trim() || '';

          return {
            title,
            sku,
            description,
            stockStatus: 'instock',
            images: [],
            category: 'Test Category',
            attributes: {},
            variations: [],
            price: price.replace('$', ''),
          };
        }),
        validateProduct: jest.fn().mockReturnValue([]),
        getConfig: jest.fn().mockReturnValue(mockRecipe),
        cleanup: jest.fn().mockResolvedValue(undefined),
      };

      mockRecipeManager.createAdapter.mockResolvedValue(robustAdapter);

      // Mock CSV generation
      const mockCsvResult = {
        parentCsv: 'parent,csv,data',
        variationCsv: 'variation,csv,data',
        variationCount: 0,
      };
      jest.spyOn(CsvGenerator, 'generateBothCsvs').mockResolvedValue({
        ...mockCsvResult,
        productCount: 1,
      });

      // Mock storage
      mockStorageService.storeJobResult.mockResolvedValue(undefined);

      // Start scraping job
      const request = {
        siteUrl: mockServerUrl,
        recipe: 'malformed-html-recipe',
      };

      const response = await scrapingService.startScraping(request);
      expect(response.success).toBe(true);

      // Wait for job to complete
      await testUtils.wait(300);

      const jobStatus = await scrapingService.getJobStatus(response.data!.jobId);
      expect(jobStatus.success).toBe(true);
      expect(jobStatus.data?.status).toBe('completed');
      expect(jobStatus.data?.totalProducts).toBe(1);
      expect(jobStatus.data?.processedProducts).toBe(1);

      // Verify that data was extracted despite malformed HTML
      expect(CsvGenerator.generateBothCsvs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining('Product Title'),
            sku: expect.stringContaining('SKU-001'),
            regularPrice: expect.stringContaining('99.99'),
          }),
        ]),
      );
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent scraping jobs', async () => {
      const mockRecipe = testUtils.createMockRecipe({
        siteUrl: mockServerUrl,
        behavior: {
          rateLimit: 10, // Very fast for testing
          maxConcurrent: 3,
        },
      });

      mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

      // Create a fast adapter
      const fastAdapter = {
        discoverProducts: jest.fn().mockImplementation(async function* () {
          yield `${mockServerUrl}/product/1`;
        }),
        extractProduct: jest.fn().mockResolvedValue(testUtils.createMockRawProduct()),
        validateProduct: jest.fn().mockReturnValue([]),
        getConfig: jest.fn().mockReturnValue(mockRecipe),
        cleanup: jest.fn().mockResolvedValue(undefined),
      };

      mockRecipeManager.createAdapter.mockResolvedValue(fastAdapter);

      // Mock CSV generation and storage
      const mockCsvResult = {
        parentCsv: 'parent,csv,data',
        variationCsv: 'variation,csv,data',
        variationCount: 0,
      };
      jest.spyOn(CsvGenerator, 'generateBothCsvs').mockResolvedValue({
        ...mockCsvResult,
        productCount: 1,
      });
      mockStorageService.storeJobResult.mockResolvedValue(undefined);

      // Start multiple jobs simultaneously
      const startTime = Date.now();
      const jobPromises = Array.from({ length: 5 }, () =>
        scrapingService.startScraping({
          siteUrl: mockServerUrl, // Use the same mock server for all jobs
          recipe: 'concurrent-recipe',
        }),
      );

      const responses = await Promise.all(jobPromises);
      expect(responses.every((r) => r.success)).toBe(true);

      // Wait for all jobs to complete
      await testUtils.wait(500);

      // Check that all jobs completed
      for (const response of responses) {
        const jobStatus = await scrapingService.getJobStatus(response.data!.jobId);
        expect(jobStatus.data?.status).toBe('completed');
      }

      const totalTime = Date.now() - startTime;
      console.log(`Completed 5 concurrent jobs in ${totalTime}ms`);

      // Should complete relatively quickly due to concurrency
      expect(totalTime).toBeLessThan(1000);
    });
  });
});
