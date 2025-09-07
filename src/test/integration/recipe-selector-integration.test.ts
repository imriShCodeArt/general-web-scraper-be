import { GenericAdapter } from '../../lib/generic-adapter';
import { RecipeConfig } from '../../types';
import { JSDOM } from 'jsdom';

describe('Recipe Selector Integration Tests', () => {
  let adapter: GenericAdapter;
  let mockRecipe: RecipeConfig;

  beforeEach(() => {
    mockRecipe = {
      name: 'Test Recipe',
      version: '1.0.0',
      siteUrl: 'https://test.com',
      selectors: {
        productLinks: ['.item a', '.product a', 'a[href*="product"]'],
        title: ['h1', '.product-title'],
        price: ['.price', '.amount'],
        images: ['img', '.gallery img'],
        description: ['.description', '.content'],
        sku: ['.sku'],
        stock: ['.stock'],
        category: ['.breadcrumb'],
        attributes: ['.attributes'],
      },
    };

    adapter = new GenericAdapter(mockRecipe, 'https://test.com');
  });

  describe('Product Discovery with Recipe Selectors', () => {
    it('should use recipe productLinks selectors in order', () => {
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
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, mockRecipe.selectors.productLinks);

      // The method stops after first successful selector, so only .item a results are returned
      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('chair-1');
    });

    it('should try multiple selectors until one succeeds', () => {
      const html = `
        <div class="other">
          <a href="/products/chair-1">Chair 1</a>
        </div>
        <div class="product">
          <a href="/products/chair-2">Chair 2</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, ['.item a', '.product a']);

      // Should find chair-2 using .product a selector
      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('chair-2');
    });

    it('should handle attribute selectors', () => {
      const html = `
        <div class="item">
          <a href="/products/chair-1">Chair 1</a>
        </div>
        <div class="other">
          <a href="/products/chair-2">Chair 2</a>
        </div>
        <a href="/products/chair-3">Chair 3</a>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, ['.item a', 'a[href*="product"]']);

      // The method stops after first successful selector, so only .item a results are returned
      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('chair-1');
    });

    it('should handle Hebrew selectors', () => {
      const html = `
        <div class="item">
          <a href="/he/כיסאות/כסא-1">כסא 1</a>
        </div>
        <div class="product">
          <a href="/he/כיסאות/כסא-2">כסא 2</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, ['.item a', '.product a']);

      // The method stops after first successful selector, so only .item a results are returned
      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('כסא-1');
    });
  });

  describe('Selector Fallback Behavior', () => {
    it('should return empty array when no selectors match', () => {
      const html = `
        <div class="other">
          <a href="/products/chair-1">Chair 1</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, ['.item a', '.product a']);

      expect(urls).toHaveLength(0);
    });

    it('should handle invalid selectors gracefully', () => {
      const html = `
        <div class="item">
          <a href="/products/chair-1">Chair 1</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, ['.invalid-selector', '.item a']);

      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('chair-1');
    });

    it('should handle empty selector array', () => {
      const html = `
        <div class="item">
          <a href="/products/chair-1">Chair 1</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, []);

      expect(urls).toHaveLength(0);
    });
  });

  describe('Recipe Configuration Validation', () => {
    it('should throw error when productLinks selector is missing', async () => {
      const invalidRecipe = {
        ...mockRecipe,
        selectors: {
          ...mockRecipe.selectors,
          productLinks: undefined as any,
        },
      };

      const adapter = new GenericAdapter(invalidRecipe, 'https://test.com');

      // The error is thrown when discoverProducts is called, not in constructor
      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _url of adapter.discoverProducts()) {
          // This should not execute
        }
      }).rejects.toThrow('Product links selector not configured in recipe');
    });

    it('should work with single selector string', () => {
      const singleSelectorRecipe = {
        ...mockRecipe,
        selectors: {
          ...mockRecipe.selectors,
          productLinks: '.item a',
        },
      };

      const adapter = new GenericAdapter(singleSelectorRecipe, 'https://test.com');
      const html = `
        <div class="item">
          <a href="/products/chair-1">Chair 1</a>
        </div>
      `;

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, singleSelectorRecipe.selectors.productLinks);

      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('chair-1');
    });
  });

  describe('Performance with Large Numbers of Links', () => {
    it('should handle large numbers of product links efficiently', () => {
      // Generate HTML with many product links
      let html = '';
      for (let i = 1; i <= 1000; i++) {
        html += `<div class="item"><a href="/products/chair-${i}">Chair ${i}</a></div>`;
      }

      const dom = new JSDOM(html);
      const startTime = Date.now();
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, mockRecipe.selectors.productLinks);
      const endTime = Date.now();

      expect(urls).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should deduplicate URLs efficiently', () => {
      // Generate HTML with duplicate links
      let html = '';
      for (let i = 1; i <= 100; i++) {
        html += `<div class="item"><a href="/products/chair-${i}">Chair ${i}</a></div>`;
        html += `<div class="item"><a href="/products/chair-${i}">Chair ${i} Duplicate</a></div>`;
      }

      const dom = new JSDOM(html);
      const urls = (adapter as any).extractProductUrlsWithSelector(dom, mockRecipe.selectors.productLinks);

      expect(urls).toHaveLength(100); // Should deduplicate to 100 unique URLs
    });
  });
});
