// CSV helper tests
import {
  buildParentHeaders,
  formatAttributeDataFlags,
  aggregateAttributesAcrossProducts,
  buildParentRow,
  buildVariationRows,
} from '../csv';

describe('CSV Helpers', () => {
  describe('buildParentHeaders', () => {
    it('should build parent headers correctly', () => {
      const attrKeys = ['color', 'size'];
      const headers = buildParentHeaders(attrKeys);

      expect(headers).toEqual([
        'attribute:color',
        'attribute_data:color',
        'attribute_default:color',
        'attribute:size',
        'attribute_data:size',
        'attribute_default:size',
      ]);
    });
  });

  describe('formatAttributeDataFlags', () => {
    it('should format attribute data flags with default values', () => {
      const result = formatAttributeDataFlags(0);
      expect(result).toBe('0|1|1|1');
    });

    it('should format attribute data flags with custom values', () => {
      const result = formatAttributeDataFlags(1, 0, 0, 0);
      expect(result).toBe('1|0|0|0');
    });
  });

  describe('aggregateAttributesAcrossProducts', () => {
    it('should aggregate attributes from products and variations', () => {
      const products = [
        {
          attributes: { color: ['red', 'blue'], size: ['large'] } as Record<string, string[]>,
          variations: [{ attributeAssignments: { color: 'green' } }],
        },
        {
          attributes: { material: ['cotton'] } as Record<string, string[]>,
          variations: [{ attributeAssignments: { size: 'medium' } }],
        },
      ];

      const result = aggregateAttributesAcrossProducts(products);

      expect(result).toEqual(new Set(['color', 'size', 'material']));
    });
  });

  describe('buildParentRow', () => {
    it('should build parent row with attributes', () => {
      const product = {
        title: 'Test Product',
        sku: 'TEST-001',
        productType: 'variable',
        description: 'Test Description',
        shortDescription: 'Short Description',
        stockStatus: 'instock',
        images: ['image1.jpg'],
        category: 'Test Category',
        regularPrice: '10.00',
        salePrice: '8.00',
        attributes: { color: ['red', 'blue'] },
        variations: [{ attributeAssignments: { color: 'red' } }],
      };

      const unionKeys = ['color'];
      const options = {
        attributeDisplayName: (raw: string) => raw,
        cleanAttributeName: (raw: string) => raw,
        defaultEligibleRawKeys: new Set(['color']),
      };
      const rowBase = { ID: '1', post_type: 'product' };

      const result = buildParentRow(product, unionKeys, options, rowBase);

      expect(result).toHaveProperty('attribute:color', 'red | blue');
      expect(result).toHaveProperty('attribute_data:color', '0|1|0|1');
      expect(result).toHaveProperty('attribute_default:color', 'red');
    });
  });

  describe('buildVariationRows', () => {
    it('should build variation rows for variable product', () => {
      const product = {
        title: 'Test Product',
        sku: 'TEST-001',
        productType: 'variable',
        description: 'Test Description',
        shortDescription: 'Short Description',
        images: ['image1.jpg'],
        attributes: { color: ['red', 'blue'] },
        variations: [
          {
            sku: 'TEST-001-RED',
            regularPrice: '10.00',
            salePrice: '8.00',
            taxClass: 'standard',
            stockStatus: 'instock',
            images: ['image1.jpg'],
            attributeAssignments: { color: 'red' },
          },
        ],
      };

      const result = buildVariationRows(product, (raw: string) => raw);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('post_type', 'product_variation');
      expect(result[0]).toHaveProperty('parent_sku', 'TEST-001');
      expect(result[0]).toHaveProperty('sku', 'TEST-001-RED');
      expect(result[0]).toHaveProperty('meta:attribute_color', 'red');
    });

    it('should return empty array for simple product', () => {
      const product = {
        title: 'Test Product',
        sku: 'TEST-001',
        productType: 'simple',
        description: 'Test Description',
        shortDescription: 'Short Description',
        images: ['image1.jpg'],
        attributes: {},
        variations: [],
      };

      const result = buildVariationRows(product, (raw: string) => raw);

      expect(result).toHaveLength(0);
    });
  });
});
