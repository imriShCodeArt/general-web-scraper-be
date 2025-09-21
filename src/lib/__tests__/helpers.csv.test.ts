import { aggregateAttributesAcrossProducts, buildParentHeaders, formatAttributeDataFlags, buildParentRow, buildVariationRows } from '../helpers/csv';
import { attributeDisplayName, cleanAttributeName } from '../helpers/attrs';

describe('csv helpers', () => {
  test('aggregateAttributesAcrossProducts unions keys', () => {
    const keys = aggregateAttributesAcrossProducts([
      { attributes: { 'pa_צבע': ['שחור'] }, variations: [{ attributeAssignments: { 'pa_מידה': 'גדול' } }] },
      { attributes: { 'pa_חומר': ['בד'] }, variations: [] },
    ] as const);
    expect(Array.from(keys).sort()).toEqual(['pa_חומר', 'pa_מידה', 'pa_צבע'].sort());
  });

  test('buildParentHeaders returns 3 columns per key', () => {
    const headers = buildParentHeaders(['pa_צבע']);
    expect(headers).toEqual(['attribute:pa_צבע', 'attribute_data:pa_צבע', 'attribute_default:pa_צבע']);
  });

  test('formatAttributeDataFlags formats correctly', () => {
    expect(formatAttributeDataFlags(0, 1, 1, 1)).toBe('0|1|1|1');
  });

  test('buildParentRow constructs attribute columns and defaults correctly', () => {
    const product = {
      title: 'Tee', slug: 'tee', sku: 'SKU', productType: 'variable',
      description: 'desc', shortDescription: 'short', stockStatus: 'instock',
      images: ['http://img'], category: 'cat', regularPrice: '10', salePrice: '',
      attributes: { pa_color: ['Red', 'Blue'] },
      variations: [{ sku: 'SKU-RED', regularPrice: '10', salePrice: '', taxClass: '', stockStatus: 'instock', images: [], attributeAssignments: { pa_color: 'Red' } }],
    };
    const union = ['pa_color'];
    const row = buildParentRow(
      product,
      union,
      { attributeDisplayName, cleanAttributeName, defaultEligibleRawKeys: new Set(union) },
      { ID: '', post_title: product.title },
    );
    expect(row['attribute:Color']).toBe('Red | Blue');
    expect(row['attribute_data:Color']).toBe('0|1|1|1');
    expect(row['attribute_default:Color']).toBe('Red');
  });

  test('buildVariationRows outputs meta attribute columns', () => {
    const product = {
      title: 'Tee', slug: 'tee', sku: 'SKU', productType: 'variable',
      description: 'd', shortDescription: 's',
      images: ['http://img'],
      attributes: { pa_size: ['S', 'M'] },
      variations: [
        { sku: 'SKU-S', regularPrice: '9', salePrice: '', taxClass: '', stockStatus: 'instock', images: [], attributeAssignments: { pa_size: 'S' } },
        { sku: 'SKU-M', regularPrice: '10', salePrice: '', taxClass: '', stockStatus: 'instock', images: [], attributeAssignments: { pa_size: 'M' } },
      ],
    };
    const rows = buildVariationRows(product, attributeDisplayName);
    expect(rows.length).toBe(2);
    expect(rows[0]['meta:attribute_Size']).toBe('S');
    expect(rows[0]['meta:attribute_pa_size']).toBe('S');
  });
});


