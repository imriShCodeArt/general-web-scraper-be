import { ensurePaPrefixed, normalizeAttrKey, isPlaceholderValue, attributeDisplayName, cleanAttributeName } from '../helpers/attrs';

describe('attrs helpers', () => {
  test('ensurePaPrefixed', () => {
    expect(ensurePaPrefixed('צבע')).toBe('pa_צבע');
    expect(ensurePaPrefixed('pa_מידה')).toBe('pa_מידה');
  });

  test('normalizeAttrKey', () => {
    expect(normalizeAttrKey(' attribute_pa_צבע ')).toBe('pa_צבע');
    expect(normalizeAttrKey('מידה גדולה')).toBe('pa_מידה_גדולה');
  });

  test('isPlaceholderValue', () => {
    expect(isPlaceholderValue('בחר אפשרות')).toBe(true);
    expect(isPlaceholderValue('שחור')).toBe(false);
  });

  test('attributeDisplayName and cleanAttributeName', () => {
    expect(attributeDisplayName('pa_color')).toBe('Color');
    expect(attributeDisplayName('pa_size')).toBe('Size');
    expect(cleanAttributeName('Color Name!')).toBe('color_name');
  });
});


