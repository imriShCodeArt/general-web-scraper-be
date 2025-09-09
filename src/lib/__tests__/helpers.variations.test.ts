import { createAssignments, mergeVariationSources, dedupeBySku } from '../helpers/variations';
import { buildVariationSku } from '../helpers/sku';

type VariationWithAssignments = { sku: string; attributeAssignments?: Record<string, string> };

describe('variations helpers', () => {
  test('buildVariationSku combines base and assignments', () => {
    expect(buildVariationSku('ABC', { color: 'RED' })).toBe('ABC-RED');
    expect(buildVariationSku('ABC', { color: 'RED', size: 'L' })).toBe('ABC-RED-L');
  });

  test('createAssignments builds key-value object', () => {
    expect(createAssignments('pa_צבע', 'שחור')).toEqual({ 'pa_צבע': 'שחור' });
  });

  test('mergeVariationSources merges attributeAssignments', () => {
    const list = mergeVariationSources<VariationWithAssignments>(
      { sku: 'A', attributeAssignments: { pa_צבע: 'שחור' } },
      { sku: 'A', attributeAssignments: { pa_מידה: 'גדול' } },
    );
    expect(list[list.length - 1].attributeAssignments).toEqual({ pa_צבע: 'שחור', pa_מידה: 'גדול' });
  });

  test('dedupeBySku removes duplicate SKUs', () => {
    const result = dedupeBySku([{ sku: 'A' }, { sku: 'A' }, { sku: 'B' }]);
    expect(result.map(r => r.sku)).toEqual(['A', 'B']);
  });
});


