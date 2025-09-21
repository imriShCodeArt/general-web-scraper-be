import { ProductValidator } from '../product-validator';
import { RawProduct, RecipeConfig } from '../../../domain/types';

describe('ProductValidator', () => {
  let validator: ProductValidator;

  beforeEach(() => {
    const config: RecipeConfig = {
      name: 'test-recipe',
      version: '1.0.0',
      siteUrl: 'https://test.com',
      selectors: {
        title: '.title',
        price: '.price',
        images: '.image',
        stock: '.stock',
        sku: '.sku',
        description: '.description',
        attributes: '.attributes',
        productLinks: '.product-link',
      },
    };
    validator = new ProductValidator(config);
  });

  describe('validateProduct', () => {
    it('should validate a complete product without errors', () => {
      const product: RawProduct = {
        id: 'test-1',
        sku: 'TEST-001',
        title: 'Test Product',
        slug: 'test-product',
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: '29.99',
        stockStatus: 'in-stock',
        images: ['https://example.com/image1.jpg'],
        category: 'Test Category',
        productType: 'simple',
        attributes: {
          color: ['Red'],
          size: ['M', 'L'],
        },
        variations: [
          {
            sku: 'TEST-001-RED-M',
            attributeAssignments: { color: 'Red', size: 'M' },
            regularPrice: '29.99',
            stockStatus: 'in-stock',
            images: ['https://example.com/image1.jpg'],
          },
        ],
      };

      const errors = validator.validateProduct(product);

      expect(errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const product: RawProduct = {
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

      const errors = validator.validateProduct(product);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'sku')).toBe(true);
      expect(errors.some(e => e.field === 'title')).toBe(true);
      expect(errors.some(e => e.field === 'price')).toBe(true);
    });

    it('should validate price format', () => {
      const product: RawProduct = {
        id: 'test-2',
        sku: 'TEST-001',
        title: 'Test Product',
        slug: 'test-product-2',
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: 'invalid-price',
        stockStatus: 'in-stock',
        images: ['https://example.com/image1.jpg'],
        category: 'Test Category',
        productType: 'simple',
        attributes: {},
        variations: [],
      };

      const errors = validator.validateProduct(product);

      expect(errors.some(e => e.field === 'price')).toBe(true);
    });

    it('should validate stock status', () => {
      const product: RawProduct = {
        id: 'test-3',
        sku: 'TEST-001',
        title: 'Test Product',
        slug: 'test-product-3',
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: '29.99',
        stockStatus: 'invalid-status',
        images: ['https://example.com/image1.jpg'],
        category: 'Test Category',
        productType: 'simple',
        attributes: {},
        variations: [],
      };

      const errors = validator.validateProduct(product);

      expect(errors.some(e => e.field === 'stockStatus')).toBe(true);
    });

    it('should validate image URLs', () => {
      const product: RawProduct = {
        id: 'test-4',
        sku: 'TEST-001',
        title: 'Test Product',
        slug: 'test-product-4',
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: '29.99',
        stockStatus: 'in-stock',
        images: ['invalid-url', 'https://example.com/image1.jpg'],
        category: 'Test Category',
        productType: 'simple',
        attributes: {},
        variations: [],
      };

      const errors = validator.validateProduct(product);

      expect(errors.some(e => e.field === 'images')).toBe(true);
    });

    it('should validate variations', () => {
      const product: RawProduct = {
        id: 'test-5',
        sku: 'TEST-001',
        title: 'Test Product',
        slug: 'test-product-5',
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: '29.99',
        stockStatus: 'in-stock',
        images: ['https://example.com/image1.jpg'],
        category: 'Test Category',
        productType: 'simple',
        attributes: {},
        variations: [
          {
            sku: '',
            attributeAssignments: {},
            regularPrice: 'invalid-price',
            stockStatus: 'invalid-status',
            images: ['invalid-url'],
          },
        ],
      };

      const errors = validator.validateProduct(product);

      expect(errors.some(e => e.field === 'variations')).toBe(true);
    });
  });

  describe('validateRequiredFields', () => {
    it('should validate required fields', () => {
      const product: RawProduct = {
        id: 'test-6',
        sku: '',
        title: 'Test Product',
        slug: 'test-product-6',
        description: 'Test description',
        shortDescription: 'Short description',
        price: '29.99',
        stockStatus: 'in-stock',
        images: [],
        category: 'Category',
        productType: 'simple',
        attributes: {},
        variations: [],
      };

      const errors = validator.validateRequiredFields(product, ['sku', 'name', 'price']);

      expect(errors.some(e => e.field === 'sku')).toBe(true);
      expect(errors.some(e => e.field === 'title')).toBe(false);
      expect(errors.some(e => e.field === 'price')).toBe(false);
    });
  });

  describe('validatePriceFormat', () => {
    it('should validate price with default pattern', () => {
      const errors1 = validator.validatePriceFormat('29.99');
      const errors2 = validator.validatePriceFormat('invalid-price');

      expect(errors1).toHaveLength(0);
      expect(errors2.length).toBeGreaterThan(0);
    });

    it('should validate price with custom pattern', () => {
      const customPattern = /^\d+$/;
      const errors1 = validator.validatePriceFormat('2999', customPattern);
      const errors2 = validator.validatePriceFormat('29.99', customPattern);

      expect(errors1).toHaveLength(0);
      expect(errors2.length).toBeGreaterThan(0);
    });
  });

  describe('validateStockStatus', () => {
    it('should validate stock status with default values', () => {
      const errors1 = validator.validateStockStatus('in-stock', ['in-stock', 'out-of-stock']);
      const errors2 = validator.validateStockStatus('out-of-stock', ['in-stock', 'out-of-stock']);
      const errors3 = validator.validateStockStatus('invalid-status', ['in-stock', 'out-of-stock']);

      expect(errors1).toHaveLength(0);
      expect(errors2).toHaveLength(0);
      expect(errors3.length).toBeGreaterThan(0);
    });

    it('should validate stock status with custom values', () => {
      const customStatuses = ['available', 'unavailable'];
      const errors1 = validator.validateStockStatus('available', customStatuses);
      const errors2 = validator.validateStockStatus('in-stock', customStatuses);

      expect(errors1).toHaveLength(0);
      expect(errors2.length).toBeGreaterThan(0);
    });
  });

  describe('validateImageUrls', () => {
    it('should validate image URLs', () => {
      const validImages = ['https://example.com/image1.jpg', 'https://example.com/image2.png'];
      const invalidImages = ['invalid-url', 'https://example.com/image1.jpg'];

      const errors1 = validator.validateImageUrls(validImages);
      const errors2 = validator.validateImageUrls(invalidImages);

      expect(errors1).toHaveLength(0);
      expect(errors2.length).toBeGreaterThan(0);
    });

    it('should handle empty images array', () => {
      const errors = validator.validateImageUrls([]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateAttributes', () => {
    it('should validate attributes', () => {
      const validAttributes = {
        color: ['Red', 'Blue'],
        size: ['M', 'L'],
      };
      const invalidAttributes = {
        color: [],
        size: ['M', 'L'],
      };

      const errors1 = validator.validateAttributes(validAttributes);
      const errors2 = validator.validateAttributes(invalidAttributes);

      expect(errors1).toHaveLength(0);
      expect(errors2.length).toBeGreaterThan(0);
    });
  });

  describe('validateVariations', () => {
    it('should validate variations', () => {
      const validVariations = [
        {
          sku: 'TEST-001-RED-M',
          attributeAssignments: { color: 'Red', size: 'M' },
          regularPrice: '29.99',
          stockStatus: 'in-stock',
          images: ['https://example.com/image1.jpg'],
        },
      ];
      const invalidVariations = [
        {
          sku: '',
          attributeAssignments: {},
          regularPrice: 'invalid-price',
          stockStatus: 'invalid-status',
          images: ['invalid-url'],
        },
      ];

      const errors1 = validator.validateVariations(validVariations);
      const errors2 = validator.validateVariations(invalidVariations);

      expect(errors1).toHaveLength(0);
      expect(errors2.length).toBeGreaterThan(0);
    });
  });

  describe('updateConfig', () => {
    it('should update validation configuration', () => {
      const config: RecipeConfig = {
        name: 'test-recipe',
        version: '1.0.0',
        siteUrl: 'https://test.com',
        selectors: {
          title: '.title',
          price: '.price',
          images: '.image',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          attributes: '.attributes',
          productLinks: '.product-link',
        },
        validation: {
          requiredFields: ['sku', 'name'],
          priceFormat: '^\\d+\\.\\d{2}$',
        },
      };

      expect(() => validator.updateConfig(config)).not.toThrow();
    });
  });
});
