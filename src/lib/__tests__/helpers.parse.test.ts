import { JSDOM } from 'jsdom';
import { parsePrice, parseNumber, extractStockStatus } from '../helpers/parse';

describe('helpers/parse', () => {
  describe('parsePrice', () => {
    test('handles simple prices', () => {
      expect(parsePrice('$19.99')).toBe('19.99');
      expect(parsePrice('€25.50')).toBe('25.50');
      expect(parsePrice('£10.00')).toBe('10.00');
    });

    test('handles comma as thousands separator', () => {
      expect(parsePrice('$1,234.56')).toBe('1234.56');
      expect(parsePrice('€2,500.00')).toBe('2500.00');
    });

    test('handles comma as decimal separator', () => {
      expect(parsePrice('19,99')).toBe('19.99');
      expect(parsePrice('25,50')).toBe('25.50');
    });

    test('handles mixed separators', () => {
      expect(parsePrice('1.234,56')).toBe('1234.56');
      expect(parsePrice('2.500,00')).toBe('2500.00');
    });

    test('handles empty and invalid input', () => {
      expect(parsePrice('')).toBe('');
      expect(parsePrice('invalid')).toBe('');
      expect(parsePrice('abc123def')).toBe('123');
    });
  });

  describe('parseNumber', () => {
    test('converts price strings to numbers', () => {
      expect(parseNumber('$19.99')).toBe(19.99);
      expect(parseNumber('€25.50')).toBe(25.50);
      expect(parseNumber('1,234.56')).toBe(1234.56);
    });

    test('handles empty and invalid input', () => {
      expect(parseNumber('')).toBe(0);
      expect(parseNumber('invalid')).toBe(0);
      expect(parseNumber('abc')).toBe(0);
    });
  });

  describe('extractStockStatus', () => {
    const createDOM = (html: string) => new JSDOM(html);

    test('extracts stock status from simple selector', () => {
      const dom = createDOM('<div class="stock">In Stock</div>');
      expect(extractStockStatus(dom, '.stock')).toBe('instock');
    });

    test('detects out of stock', () => {
      const dom = createDOM('<div class="stock">Out of Stock</div>');
      expect(extractStockStatus(dom, '.stock')).toBe('outofstock');
    });

    test('handles missing selector', () => {
      const dom = createDOM('<div class="other">Content</div>');
      expect(extractStockStatus(dom, '.stock')).toBe('unknown');
    });

    test('uses configuration-based extraction', () => {
      const dom = createDOM(`
        <div class="in-stock">Available</div>
        <div class="out-stock">Sold Out</div>
      `);

      const config = {
        inStockSelectors: ['.in-stock'],
        outOfStockSelectors: ['.out-stock'],
      };

      expect(extractStockStatus(dom, config)).toBe('instock');
    });

    test('uses text patterns for stock detection', () => {
      const dom = createDOM('<body>This product is currently in stock and available</body>');

      const config = {
        inStockText: ['in stock', 'available'],
        outOfStockText: ['out of stock', 'sold out'],
      };

      expect(extractStockStatus(dom, config)).toBe('instock');
    });

    test('detects out of stock from text patterns', () => {
      const dom = createDOM('<body>Sorry, this item is sold out</body>');

      const config = {
        inStockText: ['in stock', 'available'],
        outOfStockText: ['out of stock', 'sold out'],
      };

      expect(extractStockStatus(dom, config)).toBe('outofstock');
    });

    test('returns unknown when no patterns match', () => {
      const dom = createDOM('<body>Some random content</body>');

      const config = {
        inStockText: ['in stock'],
        outOfStockText: ['out of stock'],
      };

      expect(extractStockStatus(dom, config)).toBe('unknown');
    });
  });
});
