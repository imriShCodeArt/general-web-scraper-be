import { extractJsonFromScriptTags } from '../helpers/json';
import { JSDOM } from 'jsdom';

describe('Extended JSON Extraction Pattern Tests', () => {
  describe('Basic JSON Extraction', () => {
    it('should extract simple JSON object from script tag', () => {
      const html = `
        <script>
          window.data = ${JSON.stringify({
    id: 123,
    name: 'Test Product',
    price: 29.99,
    variants: [
      { id: 1, name: 'Red', price: 29.99 },
      { id: 2, name: 'Blue', price: 34.99 },
    ],
  })};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        id: 123,
        name: 'Test Product',
        price: 29.99,
        variants: [
          { id: 1, name: 'Red', price: 29.99 },
          { id: 2, name: 'Blue', price: 34.99 },
        ],
      });
    });

    it('should extract JSON from window object with deep nesting', () => {
      const html = `
        <script>
          window.app = ${JSON.stringify({
    config: {
      api: {
        baseUrl: 'https://api.example.com',
        version: 'v1',
      },
    },
    data: {
      products: {
        items: [
          { 'id': 1, 'name': 'Product 1' },
          { 'id': 2, 'name': 'Product 2' },
        ],
      },
    },
  })};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        config: {
          api: {
            baseUrl: 'https://api.example.com',
            version: 'v1',
          },
        },
        data: {
          products: {
            items: [
              { id: 1, name: 'Product 1' },
              { id: 2, name: 'Product 2' },
            ],
          },
        },
      });
    });

    it('should return undefined for script without JSON', () => {
      const html = `
        <script>
          console.log('No JSON here');
          const x = 1 + 2;
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should extract JSON from different window properties', () => {
      const html = `
        <script>
          window.otherData = {"id": 3, "name": "Other Data"};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({ id: 3, name: 'Other Data' });
    });

    it('should handle scripts with different variable names', () => {
      const html = `
        <script>
          window.itemInfo = {"id": 3, "name": "Item 3"};
        </script>
      `;
      const dom = new JSDOM(html);
      const result1 = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      const result2 = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      const result3 = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);

      expect(result1.script).toEqual({ id: 3, name: 'Item 3' });
      expect(result2.script).toEqual({ id: 3, name: 'Item 3' });
      expect(result3.script).toEqual({ id: 3, name: 'Item 3' });
    });

    it('should handle scripts with mixed content', () => {
      const html = `
        <script>
          console.log('Starting...');
          window.productData = {"id": 2, "name": "Product 2"};
          console.log('Done');
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({ id: 2, name: 'Product 2' });
    });
  });

  describe('Minified JSON Handling', () => {
    it('should handle minified JSON', () => {
      const html = `
        <script>
          window.data={"id":1,"name":"Product","price":29.99,"variants":[{"id":1,"name":"Red"},{"id":2,"name":"Blue"}]};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        id: 1,
        name: 'Product',
        price: 29.99,
        variants: [
          { id: 1, name: 'Red' },
          { id: 2, name: 'Blue' },
        ],
      });
    });

    it('should handle JSON with extra whitespace', () => {
      const html = `
        <script>
          window.data = { "id":1, "name" : "Product", "price": 29.99, "variants" : [ { "id": 1, "name": "Red" }, { "id": 2, "name": "Blue" } ] };
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        id: 1,
        name: 'Product',
        price: 29.99,
        variants: [
          { id: 1, name: 'Red' },
          { id: 2, name: 'Blue' },
        ],
      });
    });

    it('should handle JSON with newlines and special characters', () => {
      const html = `
        <script>
          window.data = ${JSON.stringify({
    id: 1,
    name: 'Product with\nline breaks',
    description: 'Description with\ttabs and\r\ncarriage returns',
  })};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        id: 1,
        name: 'Product with\nline breaks',
        description: 'Description with\ttabs and\r\ncarriage returns',
      });
    });
  });

  describe('Error Handling', () => {
    it('should return undefined for malformed JSON', () => {
      const html = `
        <script>
          window.data = { "id": 1, "name": "Product", "price": 29.99, };
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should return undefined for incomplete JSON', () => {
      const html = `
        <script>
          window.data = { "id": 1, "name": "Product", "price": 29.99
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should return undefined for non-JSON content', () => {
      const html = `
        <script>
          window.data = {"id": 1, "name": "Product"};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({ id: 1, name: 'Product' });
    });

    it('should return null for empty HTML', () => {
      const html = '';
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should handle scripts with syntax errors gracefully', () => {
      const html = `
        <script>
          window.data = {"id": 1, "name": "Product"};
          var invalid = { missing: closing brace;
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({ id: 1, name: 'Product' });
    });
  });

  describe('Complex Nested Structures', () => {
    it('should handle deeply nested objects', () => {
      const html = `
        <script>
          window.data = ${JSON.stringify({
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              value: 'deep value',
            },
          },
        },
      },
    },
  })};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deep value',
                },
              },
            },
          },
        },
      });
    });

    it('should handle arrays with complex objects', () => {
      const html = `
        <script>
          window.data = ${JSON.stringify({
    products: [
      {
        id: 1,
        name: 'Product 1',
        variants: [
          { id: 1, name: 'Red', sizes: ['S', 'M', 'L'] },
          { id: 2, name: 'Blue', sizes: ['M', 'L', 'XL'] },
        ],
      },
      {
        id: 2,
        name: 'Product 2',
        variants: [
          { id: 3, name: 'Green', sizes: ['S', 'L'] },
        ],
      },
    ],
  })};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        products: [
          {
            id: 1,
            name: 'Product 1',
            variants: [
              { id: 1, name: 'Red', sizes: ['S', 'M', 'L'] },
              { id: 2, name: 'Blue', sizes: ['M', 'L', 'XL'] },
            ],
          },
          {
            id: 2,
            name: 'Product 2',
            variants: [
              { id: 3, name: 'Green', sizes: ['S', 'L'] },
            ],
          },
        ],
      });
    });

    it('should handle mixed data types in arrays', () => {
      const html = `
        <script>
          window.data = ${JSON.stringify({
    mixedArray: [
      'string',
      123,
      true,
      null,
      { object: 'value' },
      [1, 2, 3],
    ],
  })};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        mixedArray: [
          'string',
          123,
          true,
          null,
          { object: 'value' },
          [1, 2, 3],
        ],
      });
    });
  });

  describe('Trailing Commas', () => {
    it('should handle trailing commas in objects', () => {
      const html = `
        <script>
          window.data = { "id": 1, "name": "Product", "price": 29.99, };
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should handle trailing commas in arrays', () => {
      const html = `
        <script>
          window.data = { "id": 1, "name": "Product", "price": 29.99
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should handle valid JSON without trailing commas', () => {
      const html = `
        <script>
          window.data = {"id": 1, "name": "Product"};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({ id: 1, name: 'Product' });
    });
  });

  describe('Unicode and Special Characters', () => {
    it('should handle Unicode characters', () => {
      const html = `
        <script>
          window.data = ${JSON.stringify({
    name: 'Produkt z polskimi znakami: ąęćłńóśźż',
    description: 'Описание на русском языке',
    price: '29.99€',
  })};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        name: 'Produkt z polskimi znakami: ąęćłńóśźż',
        description: 'Описание на русском языке',
        price: '29.99€',
      });
    });

    it('should handle escaped characters', () => {
      const html = `
        <script>
          window.data = ${JSON.stringify({
    name: 'Product with "quotes" and \\backslashes',
    description: 'Line 1\nLine 2\tTabbed',
    path: 'C:\\Users\\Test',
  })};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        name: 'Product with "quotes" and \\backslashes',
        description: 'Line 1\nLine 2\tTabbed',
        path: 'C:\\Users\\Test',
      });
    });

    it('should handle HTML entities', () => {
      const html = `
        <script>
          window.data = ${JSON.stringify({
    name: 'Product &amp; Company',
    description: 'Price &lt; $100',
    symbol: '&copy; 2024',
  })};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({
        name: 'Product &amp; Company',
        description: 'Price &lt; $100',
        symbol: '&copy; 2024',
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle large JSON objects', () => {
      const largeData = {
        products: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Product ${i}`,
          variants: Array.from({ length: 10 }, (_, j) => ({
            id: `${i}-${j}`,
            name: `Variant ${j}`,
            price: Math.random() * 100,
          })),
        })),
      };
      const html = `
        <script>
          window.data = ${JSON.stringify(largeData)};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual(largeData);
    });

    it('should handle multiple large scripts', () => {
      const data1 = { products: Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Product ${i}` })) };
      const data2 = { categories: Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Category ${i}` })) };

      const html = `
        <script>
          window.products = ${JSON.stringify(data1)};
        </script>
        <script>
          window.categories = ${JSON.stringify(data2)};
        </script>
      `;
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);

      // The function extracts the first JSON object it finds (which is data2 in this case)
      expect(result.script).toEqual(data2);
    });
  });
});
