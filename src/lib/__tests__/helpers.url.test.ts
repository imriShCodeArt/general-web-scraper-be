import { resolveUrl, normalizeUrl, isInternalUrl } from '../helpers/url';

describe('helpers/url', () => {
  const base = 'https://example.com/shop';

  test('resolveUrl handles absolute', () => {
    expect(resolveUrl(base, 'https://a.com/x')).toBe('https://a.com/x');
  });

  test('resolveUrl handles protocol-relative', () => {
    expect(resolveUrl(base, '//a.com/x')).toBe('https://a.com/x');
  });

  test('resolveUrl handles root-relative', () => {
    expect(resolveUrl(base, '/p/1')).toBe('https://example.com/p/1');
  });

  test('resolveUrl handles relative path', () => {
    expect(resolveUrl(base, 'p/1')).toBe('https://example.com/shop/p/1');
  });

  test('normalizeUrl removes hash and sorts params', () => {
    expect(normalizeUrl('https://a.com/x?b=2&a=1#hash')).toBe('https://a.com/x?a=1&b=2');
  });

  test('isInternalUrl compares host against baseHost', () => {
    expect(isInternalUrl('https://example.com/a', 'example.com')).toBe(true);
    expect(isInternalUrl('https://sub.example.com/a', 'example.com')).toBe(false);
  });
});


