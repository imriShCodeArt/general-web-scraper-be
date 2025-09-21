import { ElementExtractor } from '../element-extractor';
import { JSDOM } from 'jsdom';

describe('ElementExtractor', () => {
  let extractor: ElementExtractor;
  let dom: JSDOM;

  beforeEach(() => {
    extractor = new ElementExtractor('https://example.com');
    dom = new JSDOM(`
      <html>
        <body>
          <div class="product">
            <h1 class="title">Test Product</h1>
            <span class="price">$29.99</span>
            <div class="stock">In Stock</div>
            <img src="https://example.com/image1.jpg" alt="Product Image">
            <div class="attributes">
              <span data-color="red">Red</span>
              <span data-size="M">Medium</span>
            </div>
            <script type="application/json">
              {"productId": "123", "name": "Test Product"}
            </script>
          </div>
        </body>
      </html>
    `);
  });

  describe('extractText', () => {
    it('should extract text from element', () => {
      const text = extractor.extractText(dom, '.title');
      expect(text).toBe('Test Product');
    });

    it('should return empty string for non-existent element', () => {
      const text = extractor.extractText(dom, '.non-existent');
      expect(text).toBe('');
    });
  });

  describe('extractAttribute', () => {
    it('should extract attribute from element', () => {
      const color = extractor.extractAttribute(dom, '[data-color]', 'data-color');
      expect(color).toBe('red');
    });

    it('should return empty string for non-existent element', () => {
      const value = extractor.extractAttribute(dom, '.non-existent', 'data-value');
      expect(value).toBe('');
    });
  });

  describe('extractElements', () => {
    it('should extract elements asynchronously', async () => {
      const elements = await extractor.extractElements(dom, '.product');
      expect(elements).toHaveLength(1);
      expect(elements[0].classList.contains('product')).toBe(true);
    });

    it('should extract elements with multiple selectors', async () => {
      const elements = await extractor.extractElements(dom, ['.title', '.price']);
      expect(elements).toHaveLength(2);
    });

    it('should return empty array for non-existent elements', async () => {
      const elements = await extractor.extractElements(dom, '.non-existent');
      expect(elements).toHaveLength(0);
    });
  });

  describe('extractElementsSync', () => {
    it('should extract elements synchronously', () => {
      const elements = extractor.extractElementsSync(dom, '.product');
      expect(elements).toHaveLength(1);
      expect(elements[0].classList.contains('product')).toBe(true);
    });

    it('should return empty array for non-existent elements', () => {
      const elements = extractor.extractElementsSync(dom, '.non-existent');
      expect(elements).toHaveLength(0);
    });
  });

  describe('extractImages', () => {
    it('should extract image URLs asynchronously', async () => {
      const images = await extractor.extractImages(dom, 'img');
      expect(images).toHaveLength(1);
      expect(images[0]).toBe('https://example.com/image1.jpg');
    });

    it('should extract images with multiple selectors', async () => {
      const images = await extractor.extractImages(dom, ['img', '.product-image']);
      expect(images).toHaveLength(1);
    });

    it('should return empty array for non-existent images', async () => {
      const images = await extractor.extractImages(dom, '.non-existent');
      expect(images).toHaveLength(0);
    });
  });

  describe('extractImagesSync', () => {
    it('should extract image URLs synchronously', () => {
      const images = extractor.extractImagesSync(dom, 'img');
      expect(images).toHaveLength(1);
      expect(images[0]).toBe('https://example.com/image1.jpg');
    });

    it('should return empty array for non-existent images', () => {
      const images = extractor.extractImagesSync(dom, '.non-existent');
      expect(images).toHaveLength(0);
    });
  });

  describe('extractPrice', () => {
    it('should extract price from element', () => {
      const price = extractor.extractPrice(dom, '.price');
      expect(price).toBe('29.99');
    });

    it('should return empty string for non-existent element', () => {
      const price = extractor.extractPrice(dom, '.non-existent');
      expect(price).toBe('');
    });
  });

  describe('extractStockStatus', () => {
    it('should extract stock status from element', () => {
      const stockStatus = extractor.extractStockStatus(dom, '.stock');
      expect(stockStatus).toBe('instock');
    });

    it('should return empty string for non-existent element', () => {
      const stockStatus = extractor.extractStockStatus(dom, '.non-existent');
      expect(stockStatus).toBe('unknown');
    });
  });

  describe('extractAttributes', () => {
    it('should extract attributes asynchronously', async () => {
      const attributes = await extractor.extractAttributes(dom, '[data-color], [data-size]');
      expect(attributes).toHaveProperty('data-color');
      expect(attributes).toHaveProperty('data-size');
      expect(attributes['data-color']).toContain('red');
      expect(attributes['data-size']).toContain('M');
    });

    it('should extract attributes with multiple selectors', async () => {
      const attributes = await extractor.extractAttributes(dom, ['[data-color]', '[data-size]']);
      expect(attributes).toHaveProperty('data-color');
      expect(attributes).toHaveProperty('data-size');
    });

    it('should return empty object for non-existent elements', async () => {
      const attributes = await extractor.extractAttributes(dom, '.non-existent');
      expect(attributes).toEqual({});
    });
  });

  describe('extractAttributesSync', () => {
    it('should extract attributes synchronously', () => {
      const attributes = extractor.extractAttributesSync(dom, '[data-color]');
      expect(attributes).toHaveProperty('data-color');
      expect(attributes['data-color']).toContain('red');
    });

    it('should return empty object for non-existent elements', () => {
      const attributes = extractor.extractAttributesSync(dom, '.non-existent');
      expect(attributes).toEqual({});
    });
  });

  describe('extractVariations', () => {
    it('should extract variations asynchronously', async () => {
      const variations = await extractor.extractVariations(dom, '.product');
      expect(Array.isArray(variations)).toBe(true);
    });

    it('should extract variations with multiple selectors', async () => {
      const variations = await extractor.extractVariations(dom, ['.product', '.variation']);
      expect(Array.isArray(variations)).toBe(true);
    });

    it('should return empty array for non-existent elements', async () => {
      const variations = await extractor.extractVariations(dom, '.non-existent');
      expect(variations).toEqual([]);
    });
  });

  describe('extractVariationsSync', () => {
    it('should extract variations synchronously', () => {
      const variations = extractor.extractVariationsSync(dom, '.product');
      expect(Array.isArray(variations)).toBe(true);
    });

    it('should return empty array for non-existent elements', () => {
      const variations = extractor.extractVariationsSync(dom, '.non-existent');
      expect(variations).toEqual([]);
    });
  });

  describe('extractEmbeddedJson', () => {
    it('should extract JSON from script tags', async () => {
      const jsonData = await extractor.extractEmbeddedJson(dom, ['script[type="application/json"]']);
      expect(jsonData).toHaveLength(1);
      expect(jsonData[0]).toEqual({ productId: '123', name: 'Test Product' });
    });

    it('should return empty array for non-existent script tags', async () => {
      const jsonData = await extractor.extractEmbeddedJson(dom, ['.non-existent']);
      expect(jsonData).toEqual([]);
    });
  });

  describe('resolveUrl', () => {
    it('should resolve relative URLs', () => {
      const resolved = extractor.resolveUrl('/image.jpg', 'https://example.com');
      expect(resolved).toBe('https://example.com/image.jpg');
    });

    it('should return absolute URLs as-is', () => {
      const resolved = extractor.resolveUrl('https://other.com/image.jpg', 'https://example.com');
      expect(resolved).toBe('https://other.com/image.jpg');
    });

    it('should handle protocol-relative URLs', () => {
      const resolved = extractor.resolveUrl('//example.com/image.jpg', 'https://example.com');
      expect(resolved).toBe('https://example.com/image.jpg');
    });
  });

  describe('updateBaseUrl', () => {
    it('should update base URL', () => {
      extractor.updateBaseUrl('https://newbase.com');
      const resolved = extractor.resolveUrl('/image.jpg', 'https://newbase.com');
      expect(resolved).toBe('https://newbase.com/image.jpg');
    });
  });
});
