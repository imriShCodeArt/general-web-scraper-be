import { DataTransformer } from '../data-transformer';
import { RawProductData } from '../../../domain/types';

describe('DataTransformer', () => {
  let transformer: DataTransformer;

  beforeEach(() => {
    transformer = new DataTransformer();
  });

  describe('transformProduct', () => {
    it('should transform raw product data to normalized product', () => {
      const rawData: RawProductData = {
        id: 'test-1',
        sku: 'TEST-001',
        title: 'Test Product',
        slug: 'test-product',
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: '$29.99',
        stockStatus: 'In Stock',
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        category: 'Test Category',
        productType: 'simple',
        attributes: {
          color: ['Red', 'Blue'],
          size: ['M', 'L'],
        },
        variations: [
          {
            sku: 'TEST-001-RED-M',
            attributeAssignments: { color: 'Red', size: 'M' },
            regularPrice: '$29.99',
            stockStatus: 'In Stock',
            images: ['https://example.com/image1.jpg'],
          },
        ],
      };

      const transformed = transformer.transformProduct(rawData);

      expect(transformed.sku).toBe('TEST-001');
      expect(transformed.title).toBe('Test Product');
      expect(transformed.regularPrice).toBe('29.99');
      expect(transformed.stockStatus).toBe('instock');
      expect(transformed.images).toHaveLength(2);
      expect(transformed.attributes).toEqual(rawData.attributes);
      expect(transformed.variations).toHaveLength(1);
    });

    it('should handle empty product data', () => {
      const rawData: RawProductData = {
        id: '',
        sku: '',
        title: '',
        slug: '',
        description: '',
        shortDescription: '',
        price: '',
        stockStatus: '',
        images: [],
        category: '',
        productType: '',
        attributes: {},
        variations: [],
      };

      const transformed = transformer.transformProduct(rawData);

      expect(transformed.sku).toBe('');
      expect(transformed.title).toBe('');
      expect(transformed.regularPrice).toBe('');
      expect(transformed.stockStatus).toBe('');
      expect(transformed.images).toEqual([]);
      expect(transformed.attributes).toEqual({});
      expect(transformed.variations).toEqual([]);
    });
  });

  describe('transformText', () => {
    it('should transform text with no transforms', () => {
      const result = transformer.transformText('  Test Text  ');
      expect(result).toBe('  Test Text  ');
    });

    it('should transform text with trim transform', () => {
      transformer.updateTransforms([{ type: 'trim' }]);
      const result = transformer.transformText('  Test Text  ');
      expect(result).toBe('Test Text');
    });

    it('should transform text with replace transform', () => {
      transformer.updateTransforms([{ type: 'replace', from: 'Test', to: 'New' }]);
      const result = transformer.transformText('Test Text');
      expect(result).toBe('New Text');
    });

    it('should transform text with regex replace', () => {
      transformer.updateTransforms([{ type: 'regex', pattern: '\\s+', replacement: '-' }]);
      const result = transformer.transformText('Test   Text');
      expect(result).toBe('Test-Text');
    });
  });

  describe('transformAttributes', () => {
    it('should transform attributes', () => {
      const attributes = {
        color: ['Red', 'Blue'],
        size: ['M', 'L'],
      };

      const transformed = transformer.transformAttributes(attributes);

      expect(transformed).toEqual(attributes);
    });

    it('should handle empty attributes', () => {
      const attributes = {};
      const transformed = transformer.transformAttributes(attributes);
      expect(transformed).toEqual({});
    });
  });

  describe('transformImages', () => {
    it('should transform images array', () => {
      const images = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];
      const transformed = transformer.transformImages(images);

      expect(transformed).toEqual(images);
    });

    it('should handle empty images array', () => {
      const images: (string | undefined)[] = [];
      const transformed = transformer.transformImages(images);
      expect(transformed).toEqual([]);
    });

    it('should filter out undefined images', () => {
      const images: (string | undefined)[] = ['https://example.com/image1.jpg', undefined, 'https://example.com/image2.jpg'];
      const transformed = transformer.transformImages(images);

      expect(transformed).toEqual(['https://example.com/image1.jpg', 'https://example.com/image2.jpg']);
    });
  });

  describe('transformPrice', () => {
    it('should clean price string', () => {
      const price1 = transformer.transformPrice('$29.99');
      const price2 = transformer.transformPrice('€25.50');
      const price3 = transformer.transformPrice('29.99 USD');

      expect(price1).toBe('29.99');
      expect(price2).toBe('25.50');
      expect(price3).toBe('29.99');
    });

    it('should handle empty price', () => {
      const price = transformer.transformPrice('');
      expect(price).toBe('');
    });
  });

  describe('transformStockStatus', () => {
    it('should normalize stock status', () => {
      const status1 = transformer.transformStockStatus('In Stock');
      const status2 = transformer.transformStockStatus('OUT OF STOCK');
      const status3 = transformer.transformStockStatus('available');

      expect(status1).toBe('instock');
      expect(status2).toBe('outofstock');
      expect(status3).toBe('instock');
    });

    it('should handle unknown stock status', () => {
      const status = transformer.transformStockStatus('Unknown Status');
      expect(status).toBe('unknown');
    });
  });

  describe('transformVariations', () => {
    it('should transform variations', () => {
      const variations = [
        {
          sku: 'TEST-001-RED-M',
          attributeAssignments: { color: 'Red', size: 'M' },
          regularPrice: '$29.99',
          stockStatus: 'In Stock',
          images: ['https://example.com/image1.jpg'],
        },
      ];

      const transformed = transformer.transformVariations(variations);

      expect(transformed).toHaveLength(1);
      expect(transformed[0].sku).toBe('TEST-001-RED-M');
      expect(transformed[0].regularPrice).toBe('29.99');
      expect(transformed[0].stockStatus).toBe('instock');
      expect(transformed[0].images).toEqual(['https://example.com/image1.jpg']);
    });

    it('should handle empty variations', () => {
      const variations: any[] = [];
      const transformed = transformer.transformVariations(variations);
      expect(transformed).toEqual([]);
    });
  });

  describe('cleanPrice', () => {
    it('should clean price string', () => {
      const price1 = transformer.cleanPrice('$29.99');
      const price2 = transformer.cleanPrice('€25.50');
      const price3 = transformer.cleanPrice('29.99 USD');
      const price4 = transformer.cleanPrice('Price: $19.99');

      expect(price1).toBe('29.99');
      expect(price2).toBe('25.50');
      expect(price3).toBe('29.99');
      expect(price4).toBe('19.99');
    });

    it('should handle empty price', () => {
      const price = transformer.cleanPrice('');
      expect(price).toBe('');
    });
  });

  describe('normalizeStockText', () => {
    it('should normalize stock text', () => {
      const text1 = transformer.normalizeStockText('In Stock');
      const text2 = transformer.normalizeStockText('OUT OF STOCK');
      const text3 = transformer.normalizeStockText('available');
      const text4 = transformer.normalizeStockText('unavailable');

      expect(text1).toBe('instock');
      expect(text2).toBe('outofstock');
      expect(text3).toBe('instock');
      expect(text4).toBe('outofstock');
    });

    it('should handle unknown stock text', () => {
      const text = transformer.normalizeStockText('Unknown Status');
      expect(text).toBe('unknown');
    });
  });

  describe('updateTransforms', () => {
    it('should update transforms', () => {
      const transforms = [
        { type: 'trim' },
        { type: 'replace', from: 'Test', to: 'New' },
      ];

      transformer.updateTransforms(transforms);

      const result = transformer.transformText('  Test Text  ');
      expect(result).toBe('New Text');
    });
  });
});
