import { JSDOM } from 'jsdom';
import { extractJsonFromScriptTags, mergeJsonProductData, createJsonMatcher } from '../helpers/json';

describe('helpers/json', () => {
  describe('extractJsonFromScriptTags', () => {
    const createDOM = (html: string) => new JSDOM(html);

    test('extracts JSON from script tags', () => {
      const dom = createDOM(`
        <script type="application/json">
          {"product": {"name": "Test Product", "price": 19.99}}
        </script>
      `);

      const matchers = [
        { selector: 'script[type="application/json"]', attribute: 'textContent' },
      ];

      const result = extractJsonFromScriptTags(dom, matchers);
      const selectorKey = Object.keys(result)[0];
      expect(selectorKey).toBe('script[type="application/json"]');
      expect(result[selectorKey]).toEqual({
        product: { name: 'Test Product', price: 19.99 },
      });
    });

    test('extracts JSON from window object patterns', () => {
      const dom = createDOM(`
        <script>
          window.productData = {"id": 123, "name": "Test"};
        </script>
      `);

      const matchers = [
        { selector: 'script', attribute: 'textContent' },
      ];

      const result = extractJsonFromScriptTags(dom, matchers);
      expect(result).toHaveProperty('script');
      expect(result['script']).toEqual({ id: 123, name: 'Test' });
    });

    test('applies pattern filters', () => {
      const dom = createDOM(`
        <script class="product-data">{"type": "product"}</script>
        <script class="other-data">{"type": "other"}</script>
      `);

      const matchers = [
        {
          selector: 'script',
          attribute: 'textContent',
          pattern: /product/,
        },
      ];

      const result = extractJsonFromScriptTags(dom, matchers);
      expect(Object.keys(result)).toHaveLength(1);
      expect(result['script']).toEqual({ type: 'product' });
    });

    test('applies transforms', () => {
      const dom = createDOM(`
        <script>{"raw": "data"}</script>
      `);

      const matchers = [
        {
          selector: 'script',
          attribute: 'textContent',
          transform: (data: any) => ({ processed: data.raw.toUpperCase() }),
        },
      ];

      const result = extractJsonFromScriptTags(dom, matchers);
      expect(result['script']).toEqual({ processed: 'DATA' });
    });

    test('handles multiple matchers', () => {
      const dom = createDOM(`
        <script class="product">{"product": "data"}</script>
        <div data-json='{"meta": "info"}'>Content</div>
      `);

      const matchers = [
        { selector: 'script.product', attribute: 'textContent' },
        { selector: 'div[data-json]', attribute: 'data-json' },
      ];

      const result = extractJsonFromScriptTags(dom, matchers);
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['script.product']).toEqual({ product: 'data' });
      expect(result['div[data-json]']).toEqual({ meta: 'info' });
    });

    test('handles invalid JSON gracefully', () => {
      const dom = createDOM(`
        <script>invalid json content</script>
      `);

      const matchers = [
        { selector: 'script', attribute: 'textContent' },
      ];

      const result = extractJsonFromScriptTags(dom, matchers);
      expect(result).toEqual({});
    });
  });

  describe('mergeJsonProductData', () => {
    test('merges simple objects', () => {
      const a = { name: 'Product A', price: 10 };
      const b = { name: 'Product B', category: 'Electronics' };

      const result = mergeJsonProductData(a, b);
      expect(result).toEqual({
        name: 'Product B',
        price: 10,
        category: 'Electronics',
      });
    });

    test('deep merges nested objects', () => {
      const a = {
        product: { name: 'A', price: 10 },
        meta: { id: 1 },
      };
      const b = {
        product: { name: 'B', category: 'Electronics' },
        meta: { status: 'active' },
      };

      const result = mergeJsonProductData(a, b);
      expect(result).toEqual({
        product: {
          name: 'B',
          price: 10,
          category: 'Electronics',
        },
        meta: {
          id: 1,
          status: 'active',
        },
      });
    });

    test('handles empty objects', () => {
      const a = {};
      const b = { name: 'Product' };

      const result = mergeJsonProductData(a, b);
      expect(result).toEqual({ name: 'Product' });
    });
  });

  describe('createJsonMatcher', () => {
    test('creates basic matcher', () => {
      const matcher = createJsonMatcher('script');
      expect(matcher).toEqual({
        selector: 'script',
        attribute: undefined,
        pattern: undefined,
        transform: undefined,
      });
    });

    test('creates matcher with options', () => {
      const transform = (data: any) => data;
      const matcher = createJsonMatcher('script', {
        attribute: 'data-json',
        pattern: /product/,
        transform,
      });

      expect(matcher).toEqual({
        selector: 'script',
        attribute: 'data-json',
        pattern: /product/,
        transform,
      });
    });
  });
});
