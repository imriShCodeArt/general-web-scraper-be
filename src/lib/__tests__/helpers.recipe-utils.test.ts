import { validateSiteUrl, buildAdapterCacheKey } from '../helpers/recipe-utils';

describe('helpers/recipe-utils', () => {
  it('builds adapter cache key', () => {
    expect(buildAdapterCacheKey('name', 'https://x.com')).toBe('name:https://x.com');
  });

  it('validates wildcard any', () => {
    expect(validateSiteUrl('*', 'https://shop.example.com')).toBe(true);
  });

  it('validates wildcard subdomain', () => {
    expect(validateSiteUrl('*.example.com', 'https://shop.example.com')).toBe(true);
    expect(validateSiteUrl('*.example.com', 'https://example.com')).toBe(true);
    expect(validateSiteUrl('*.example.com', 'https://example.org')).toBe(false);
  });

  it('validates exact host', () => {
    expect(validateSiteUrl('https://example.com', 'https://example.com')).toBe(true);
    expect(validateSiteUrl('https://example.com', 'https://shop.example.com')).toBe(false);
  });
});


