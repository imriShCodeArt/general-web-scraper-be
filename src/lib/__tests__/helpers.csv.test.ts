import { aggregateAttributesAcrossProducts, buildParentHeaders, formatAttributeDataFlags } from '../helpers/csv';

describe('csv helpers', () => {
  test('aggregateAttributesAcrossProducts unions keys', () => {
    const keys = aggregateAttributesAcrossProducts([
      { attributes: { 'pa_צבע': ['שחור'] }, variations: [{ attributeAssignments: { 'pa_מידה': 'גדול' } }] },
      { attributes: { 'pa_חומר': ['בד'] }, variations: [] },
    ]);
    expect(Array.from(keys).sort()).toEqual(['pa_חומר', 'pa_מידה', 'pa_צבע'].sort());
  });

  test('buildParentHeaders returns 3 columns per key', () => {
    const headers = buildParentHeaders(['pa_צבע']);
    expect(headers).toEqual(['attribute:pa_צבע', 'attribute_data:pa_צבע', 'attribute_default:pa_צבע']);
  });

  test('formatAttributeDataFlags formats correctly', () => {
    expect(formatAttributeDataFlags(0, 1, 1, 1)).toBe('0|1|1|1');
  });
});


