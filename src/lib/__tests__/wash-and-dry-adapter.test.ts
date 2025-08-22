import { ArchiveScraper } from '../archive-scraper';
import { ProductScraper } from '../scraper';
import { setupWashAndDryAdapter, washDryMatsProductAdapter } from '../wash-and-dry-adapter';

describe('WashAndDry Adapter', () => {
  beforeEach(() => {
    // Clear any existing adapters before each test
    ArchiveScraper.clearAdapters();
    ProductScraper.clearAdapters();
  });

  afterEach(() => {
    // Clean up after each test
    ArchiveScraper.clearAdapters();
    ProductScraper.clearAdapters();
  });

  describe('setupWashAndDryAdapter', () => {
    it('should register adapters for both wash-and-dry.eu and washdrymats.com', () => {
      setupWashAndDryAdapter();
      
      // Test wash-and-dry.eu adapter
      const washAndDryAdapter = ArchiveScraper.getAdapter('wash-and-dry.eu');
      expect(washAndDryAdapter).toBeDefined();
      expect(washAndDryAdapter?.productLinkSelectors).toBeDefined();
      
      // Test washdrymats.com adapter
      const washDryMatsAdapter = ArchiveScraper.getAdapter('washdrymats.com');
      expect(washDryMatsAdapter).toBeDefined();
      expect(washDryMatsAdapter?.extractProductUrls).toBeDefined();
    });
  });

  describe('washdrymats.com archive adapter', () => {
    let adapter: any;

    beforeEach(() => {
      setupWashAndDryAdapter();
      adapter = ArchiveScraper.getAdapter('washdrymats.com');
    });

    it('should have custom product URL extraction method', () => {
      expect(adapter.extractProductUrls).toBeDefined();
      expect(typeof adapter.extractProductUrls).toBe('function');
    });

    it('should have product link selectors', () => {
      expect(adapter.productLinkSelectors).toBeDefined();
      expect(Array.isArray(adapter.productLinkSelectors)).toBe(true);
      expect(adapter.productLinkSelectors.length).toBeGreaterThan(0);
    });

    it('should have category selectors', () => {
      expect(adapter.categorySelectors).toBeDefined();
      expect(Array.isArray(adapter.categorySelectors)).toBe(true);
      expect(adapter.categorySelectors.length).toBeGreaterThan(0);
    });

    it('should have pagination methods', () => {
      expect(adapter.findNextPage).toBeDefined();
      expect(adapter.collectPaginationPageLinks).toBeDefined();
    });
  });

  describe('washdrymats.com product adapter', () => {
    let adapter: any;

    beforeEach(() => {
      ProductScraper.registerAdapter('washdrymats.com', washDryMatsProductAdapter);
      adapter = ProductScraper.getAdapter('washdrymats.com');
    });

    it('should have enhanced title extraction', () => {
      expect(adapter.extractTitle).toBeDefined();
      expect(typeof adapter.extractTitle).toBe('function');
    });

    it('should have enhanced description extraction', () => {
      expect(adapter.extractDescription).toBeDefined();
      expect(typeof adapter.extractDescription).toBe('function');
    });

    it('should have enhanced price extraction', () => {
      expect(adapter.extractRegularPrice).toBeDefined();
      expect(adapter.extractSalePrice).toBeDefined();
      expect(typeof adapter.extractRegularPrice).toBe('function');
      expect(typeof adapter.extractSalePrice).toBe('function');
    });

    it('should have enhanced image extraction', () => {
      expect(adapter.extractImages).toBeDefined();
      expect(typeof adapter.extractImages).toBe('function');
    });

    it('should have enhanced attribute extraction', () => {
      expect(adapter.extractAttributes).toBeDefined();
      expect(typeof adapter.extractAttributes).toBe('function');
    });

    it('should have enhanced variation extraction', () => {
      expect(adapter.extractVariations).toBeDefined();
      expect(typeof adapter.extractVariations).toBe('function');
    });

    it('should have enhanced SKU extraction', () => {
      expect(adapter.extractSKU).toBeDefined();
      expect(typeof adapter.extractSKU).toBe('function');
    });
  });

  describe('wash-and-dry.eu adapter', () => {
    let adapter: any;

    beforeEach(() => {
      setupWashAndDryAdapter();
      adapter = ArchiveScraper.getAdapter('wash-and-dry.eu');
    });

    it('should have product link selectors', () => {
      expect(adapter.productLinkSelectors).toBeDefined();
      expect(Array.isArray(adapter.productLinkSelectors)).toBe(true);
      expect(adapter.productLinkSelectors.length).toBeGreaterThan(0);
    });

    it('should have URL filtering', () => {
      expect(adapter.productUrlFilter).toBeDefined();
      expect(typeof adapter.productUrlFilter).toBe('function');
    });

    it('should have URL normalization', () => {
      expect(adapter.normalizeProductUrl).toBeDefined();
      expect(typeof adapter.normalizeProductUrl).toBe('function');
    });
  });

  describe('adapter functionality', () => {
    beforeEach(() => {
      setupWashAndDryAdapter();
    });

    it('should handle washdrymats.com URLs correctly', () => {
      const adapter = ArchiveScraper.getAdapter('washdrymats.com');
      expect(adapter).toBeDefined();
      
      // Test that it's the washdrymats.com specific adapter
      expect(adapter?.extractProductUrls).toBeDefined();
    });

    it('should handle wash-and-dry.eu URLs correctly', () => {
      const adapter = ArchiveScraper.getAdapter('wash-and-dry.eu');
      expect(adapter).toBeDefined();
      
      // Test that it's the base adapter (no custom extractProductUrls)
      expect(adapter?.extractProductUrls).toBeUndefined();
    });

    it('should not interfere with other websites', () => {
      const adapter = ArchiveScraper.getAdapter('example.com');
      expect(adapter).toBeNull();
    });
  });

  describe('product adapter integration', () => {
    it('should register washdrymats.com product adapter with ProductScraper', () => {
      ProductScraper.registerAdapter('washdrymats.com', washDryMatsProductAdapter);
      
      const adapter = ProductScraper.getAdapter('washdrymats.com');
      expect(adapter).toBeDefined();
      expect(adapter?.extractTitle).toBeDefined();
      expect(adapter?.extractDescription).toBeDefined();
    });
  });
});
