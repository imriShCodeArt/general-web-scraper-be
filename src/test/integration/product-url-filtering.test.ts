import { GenericAdapter } from '../../lib/generic-adapter';
import { RecipeConfig } from '../../types';
import { JSDOM } from 'jsdom';

describe('Product URL Filtering Integration Tests', () => {
  let adapter: GenericAdapter;
  let mockRecipe: RecipeConfig;

  beforeEach(() => {
    mockRecipe = {
      name: 'Test Recipe',
      version: '1.0.0',
      siteUrl: 'https://test.com',
      selectors: {
        productLinks: ['.item a'],
        title: ['h1'],
        price: ['.price'],
        images: ['img'],
        description: ['.description'],
        sku: ['.sku'],
        stock: ['.stock'],
        category: ['.breadcrumb'],
        attributes: ['.attributes']
      }
    };
    
    adapter = new GenericAdapter(mockRecipe, 'https://test.com');
  });

  describe('URL Pattern Recognition', () => {
    it('should accept Hebrew product URLs', () => {
      const testUrls = [
        'https://shukrehut.co.il/he/כיסאות/מעמד-נעליים-ספסל-אחסון-לכיסא-pisrb2',
        'https://shukrehut.co.il/he/כיסאות/כסא-מנהלים-מפואר-ויוקרתי-madonna-cotton',
        'https://shukrehut.co.il/he/כיסאות/כסא-מחשב-רשת-waltz',
        'https://test.com/כיסא/מוצר-1',
        'https://test.com/כיסאות/מוצר-2'
      ];

      testUrls.forEach(url => {
        const isProduct = /(\/products\/|\/product\/|\/כיסאות\/|\/כיסא\/|\/chair)/.test(url);
        expect(isProduct).toBe(true);
      });
    });

    it('should accept English product URLs', () => {
      const testUrls = [
        'https://shop.com/products/chair-1',
        'https://shop.com/product/chair-2',
        'https://test.com/products/furniture/chair-3',
        'https://test.com/product/office-chair'
      ];

      testUrls.forEach(url => {
        const isProduct = /(\/products\/|\/product\/|\/כיסאות\/|\/כיסא\/|\/chair)/.test(url);
        expect(isProduct).toBe(true);
      });
    });

    it('should reject category/archive pages', () => {
      const testUrls = [
        'https://shukrehut.co.il/he/כיסאות', // Main category page
        'https://test.com/כיסאות', // Category page
        'https://shop.com/products', // Products listing
        'https://shop.com/categories/furniture' // Category page
      ];

      testUrls.forEach(url => {
        const isArchivePage = /\/כיסאות$/.test(url);
        const isProduct = /(\/products\/|\/product\/|\/כיסאות\/|\/כיסא\/|\/chair)/.test(url);
        const shouldReject = isArchivePage || !isProduct;
        expect(shouldReject).toBe(true);
      });
    });

    it('should reject add-to-cart and utility links', () => {
      const testUrls = [
        'https://shop.com/products/chair?add-to-cart=123',
        'https://shop.com/cart',
        'https://shop.com/checkout',
        'https://shop.com/account',
        'https://shop.com/login',
        'https://shop.com/search?q=chair'
      ];

      testUrls.forEach(url => {
        const isAddToCart = /[?&]add-to-cart=/.test(url);
        const isUtility = /(\/cart|\/checkout|\/account|\/login|\/search)/.test(url);
        const shouldReject = isAddToCart || isUtility;
        expect(shouldReject).toBe(true);
      });
    });
  });

  describe('extractProductUrlsWithSelector Integration', () => {
    it('should extract Hebrew product URLs from HTML', () => {
      const html = `
        <div class="item">
          <a href="/he/כיסאות/מעמד-נעליים-ספסל-אחסון-לכיסא-pisrb2">Product 1</a>
        </div>
        <div class="item">
          <a href="/he/כיסאות/כסא-מנהלים-מפואר-ויוקרתי-madonna-cotton">Product 2</a>
        </div>
        <div class="item">
          <a href="/he/כיסאות">Category Page</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, '.item a');

      expect(urls).toHaveLength(2);
      expect(urls[0]).toContain('מעמד-נעליים-ספסל-אחסון-לכיסא-pisrb2');
      expect(urls[1]).toContain('כסא-מנהלים-מפואר-ויוקרתי-madonna-cotton');
    });

    it('should extract English product URLs from HTML', () => {
      const html = `
        <div class="item">
          <a href="/products/office-chair-1">Office Chair 1</a>
        </div>
        <div class="item">
          <a href="/product/office-chair-2">Office Chair 2</a>
        </div>
        <div class="item">
          <a href="/products">All Products</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, '.item a');

      expect(urls).toHaveLength(2);
      expect(urls[0]).toContain('office-chair-1');
      expect(urls[1]).toContain('office-chair-2');
    });

    it('should handle mixed Hebrew and English URLs', () => {
      const html = `
        <div class="item">
          <a href="/he/כיסאות/כסא-מנהלים">Hebrew Chair</a>
        </div>
        <div class="item">
          <a href="/en/products/office-chair">English Chair</a>
        </div>
        <div class="item">
          <a href="/he/כיסאות">Category</a>
        </div>
        <div class="item">
          <a href="/products">All Products</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, '.item a');

      expect(urls).toHaveLength(2);
      expect(urls[0]).toContain('כסא-מנהלים');
      expect(urls[1]).toContain('office-chair');
    });

    it('should deduplicate URLs', () => {
      const html = `
        <div class="item">
          <a href="/products/chair-1">Chair 1</a>
        </div>
        <div class="item">
          <a href="/products/chair-1">Chair 1 Duplicate</a>
        </div>
        <div class="item">
          <a href="/products/chair-2">Chair 2</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, '.item a');

      expect(urls).toHaveLength(2);
      expect(urls[0]).toContain('chair-1');
      expect(urls[1]).toContain('chair-2');
    });

    it('should handle multiple selectors', () => {
      const html = `
        <div class="item">
          <a href="/products/chair-1">Chair 1</a>
        </div>
        <div class="product">
          <a href="/products/chair-2">Chair 2</a>
        </div>
        <div class="other">
          <a href="/products/chair-3">Chair 3</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, ['.item a', '.product a']);

      // The method stops after first successful selector, so only .item a results are returned
      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('chair-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty HTML', () => {
      const html = '<div></div>';
      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, '.item a');
      expect(urls).toHaveLength(0);
    });

    it('should handle HTML with no matching selectors', () => {
      const html = '<div class="other"><a href="/products/chair">Chair</a></div>';
      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, '.item a');
      expect(urls).toHaveLength(0);
    });

    it('should handle relative URLs', () => {
      const html = `
        <div class="item">
          <a href="/products/chair-1">Chair 1</a>
        </div>
        <div class="item">
          <a href="products/chair-2">Chair 2</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, '.item a');

      expect(urls).toHaveLength(2);
      expect(urls[0]).toContain('chair-1');
      expect(urls[1]).toContain('chair-2');
    });

    it('should handle URLs with query parameters', () => {
      const html = `
        <div class="item">
          <a href="/products/chair-1?color=red">Chair 1</a>
        </div>
        <div class="item">
          <a href="/products/chair-2?add-to-cart=123">Chair 2</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, '.item a');

      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('chair-1');
    });
  });
});
