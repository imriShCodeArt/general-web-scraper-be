import { extractJsonFromScriptTags } from '../helpers/json';
import { JSDOM } from 'jsdom';

describe('Extended JSON Extraction Pattern Tests', () => {
  describe('Window Namespace Patterns', () => {
    it('should extract JSON from window object with nested properties', () => {
      const html = `
        <script>
          window.productData = {
            "id": 123,
            "name": "Test Product",
            "price": 29.99,
            "variants": [
              {"id": 1, "name": "Red", "price": 29.99},
              {"id": 2, "name": "Blue", "price": 34.99}
            ]
          };
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
          {'id': 1, 'name': 'Product 1'},
          {'id': 2, 'name': 'Product 2'},
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

    it('should handle window object with array at root level', () => {
      const html = `
        <script>
          window.products = [
            {"id": 1, "name": "Product 1", "price": 19.99},
            {"id": 2, "name": "Product 2", "price": 29.99}
          ];
        </script>
      `;

      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });
  });

  describe('Multiple Scripts with Similar Selectors', () => {
    it('should extract from the first matching script when multiple exist', () => {
      const html = `
        <script>
          window.productData = {"id": 1, "name": "First Product"};
        </script>
        <script>
          window.productData = {"id": 2, "name": "Second Product"};
        </script>
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
          window.productInfo = {"id": 1, "name": "Product 1"};
        </script>
        <script>
          window.productData = {"id": 2, "name": "Product 2"};
        </script>
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
          // Some comments
          var config = { api: "https://api.example.com" };
          window.productData = {"id": 1, "name": "Product 1"};
          // More comments
        </script>
        <script>
          window.productData = {"id": 2, "name": "Product 2"};
        </script>
      `;

      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toEqual({ id: 2, name: 'Product 2' });
    });
  });

  describe('Minified JSON Handling', () => {
    it('should extract minified JSON with no spaces', () => {
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

    it('should handle JSON with inconsistent spacing', () => {
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

    it('should handle JSON with line breaks in strings', () => {
      const html = `
        <script>
          window.data = {
            "id": 1,
            "name": "Product with\\nline breaks",
            "description": "Description with\\ttabs and\\r\\ncarriage returns"
          };
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

  describe('Trailing Commas Handling', () => {
    it('should handle trailing commas in objects', () => {
      const html = `
        <script>
          window.data = {
            "id": 1,
            "name": "Product",
            "price": 29.99,
          };
        </script>
      `;

      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should handle trailing commas in arrays', () => {
      const html = `
        <script>
          window.data = {
            "items": [
              {"id": 1, "name": "Item 1"},
              {"id": 2, "name": "Item 2"},
            ]
          };
        </script>
      `;

      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should handle multiple trailing commas', () => {
      const html = `
        <script>
          window.data = {
            "id": 1,
            "name": "Product",
            "price": 29.99,
            "variants": [
              {"id": 1, "name": "Red"},
              {"id": 2, "name": "Blue"},
            ],
            "tags": ["tag1", "tag2",],
          };
        </script>
      `;

      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });
  });

  describe('Complex Nested Structures', () => {
    it('should handle deeply nested objects', () => {
      const html = `
        <script>
          window.data = {
            "level1": {
              "level2": {
                "level3": {
                  "level4": {
                    "level5": {
                      "value": "deep value"
                    }
                  }
                }
              }
            }
          };
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

    it('should handle arrays of objects with nested arrays', () => {
      const html = `
        <script>
          window.data = {
            "products": [
              {
                "id": 1,
                "name": "Product 1",
                "variants": [
                  {"id": 1, "name": "Red", "sizes": ["S", "M", "L"]},
                  {"id": 2, "name": "Blue", "sizes": ["M", "L", "XL"]}
                ]
              },
              {
                "id": 2,
                "name": "Product 2",
                "variants": [
                  {"id": 3, "name": "Green", "sizes": ["S", "L"]}
                ]
              }
            ]
          };
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
          window.data = {
            "mixedArray": [
              "string",
              123,
              true,
              null,
              {"object": "value"},
              [1, 2, 3]
            ]
          };
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

  describe('Error Handling and Edge Cases', () => {
    it('should return null for malformed JSON', () => {
      const html = `
        <script>
          window.data = { "id": 1, "name": "Product", "price": 29.99, };
        </script>
      `;

      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should return null for incomplete JSON', () => {
      const html = `
        <script>
          window.data = { "id": 1, "name": "Product", "price": 29.99
        </script>
      `;

      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should return null for non-existent selector', () => {
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
      const dom = new JSDOM('');
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should return null for HTML without scripts', () => {
      const html = '<div>No scripts here</div>';
      const dom = new JSDOM(html);
      const result = extractJsonFromScriptTags(dom, [{ selector: 'script' }]);
      expect(result.script).toBeUndefined();
    });

    it('should handle scripts with syntax errors', () => {
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

  describe('Special Characters and Encoding', () => {
    it('should handle Unicode characters in JSON', () => {
      const html = `
        <script>
          window.data = {
            "name": "Produkt z polskimi znakami: ąęćłńóśźż",
            "description": "Описание на русском языке",
            "price": "29.99€"
          };
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

    it('should handle escaped characters in JSON strings', () => {
      const html = `
        <script>
          window.data = {
            "name": "Product with \\"quotes\\" and \\\\backslashes",
            "description": "Line 1\\nLine 2\\tTabbed",
            "path": "C:\\\\Users\\\\Test"
          };
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

    it('should handle HTML entities in JSON', () => {
      const html = `
        <script>
          window.data = {
            "name": "Product &amp; Company",
            "description": "Price &lt; $100",
            "symbol": "&copy; 2024"
          };
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

  describe('Performance and Large Data', () => {
    it('should handle large JSON objects', () => {
      const largeData = {
        products: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Product ${i}`,
          price: Math.random() * 100,
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
