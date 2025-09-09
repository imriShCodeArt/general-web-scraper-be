import { applyTransforms, applyAttributeTransforms } from '../helpers/transforms';

describe('helpers/transforms', () => {
  test('applyTransforms supports regex replace a->b', () => {
    expect(applyTransforms('abc abc', ['abc->xyz'])).toBe('xyz xyz');
  });

  test('applyTransforms supports trim directive', () => {
    expect(applyTransforms('  hello  ', ['trim:'])).toBe('hello');
  });

  test('applyTransforms supports replace directive', () => {
    expect(applyTransforms('Price: 100NIS', ['replace:NIS|₪'])).toBe('Price: 100₪');
  });

  test('applyAttributeTransforms maps per attribute', () => {
    const attrs = { Color: [' Light Blue '], Size: ['M'] };
    const spec = { Color: ['trim:'] } as Record<string, string[]>;
    expect(applyAttributeTransforms(attrs, spec)).toEqual({ Color: ['Light Blue'], Size: ['M'] });
  });
});


