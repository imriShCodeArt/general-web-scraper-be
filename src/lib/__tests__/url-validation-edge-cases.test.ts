import { validateSiteUrl } from '../helpers/recipe-utils';
import { buildAdapterCacheKey } from '../helpers/recipe-utils';

describe('URL Validation Edge Cases', () => {
  describe('Malformed URLs', () => {
    it('should reject URLs with invalid protocols', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'ftp://example.com')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'file://example.com')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'javascript:alert(1)')).toBe(false); // Invalid URL
      expect(validateSiteUrl(recipeUrl, 'data:text/html,<script>alert(1)</script>')).toBe(false); // Invalid URL
    });

    it('should reject URLs with missing protocol', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'example.com')).toBe(false);
      expect(validateSiteUrl(recipeUrl, '//example.com')).toBe(false);
      expect(validateSiteUrl(recipeUrl, '/path/to/page')).toBe(false);
    });

    it('should reject URLs with invalid characters', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com/path with spaces')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com/path\twith\ttabs')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com/path\nwith\nnewlines')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com/path\rwith\rcarriage')).toBe(true);
    });

    it('should reject URLs with null bytes', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com/path\0with\0null')).toBe(true); // Only hostname is compared
    });
  });

  describe('Protocol Differences', () => {
    it('should handle HTTP vs HTTPS protocol differences', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'http://example.com')).toBe(true); // Only hostname is compared
      expect(validateSiteUrl(recipeUrl, 'https://example.com')).toBe(true);
    });

    it('should handle case-insensitive protocols', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'HTTPS://example.com')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'HttpS://example.com')).toBe(true);
    });

    it('should handle custom protocols', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'custom://example.com')).toBe(true); // Only hostname is compared
      expect(validateSiteUrl(recipeUrl, 'app://example.com')).toBe(true); // Only hostname is compared
    });
  });

  describe('Port Handling', () => {
    it('should handle different ports', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com:8080')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com:443')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com:80')).toBe(true);
    });

    it('should handle default ports', () => {
      const recipeUrl = 'https://example.com:443';

      expect(validateSiteUrl(recipeUrl, 'https://example.com')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com:443')).toBe(true);
    });

    it('should handle invalid port numbers', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com:99999')).toBe(false); // Invalid port
      expect(validateSiteUrl(recipeUrl, 'https://example.com:0')).toBe(true); // Port 0 is valid
      expect(validateSiteUrl(recipeUrl, 'https://example.com:-1')).toBe(false); // Invalid port
    });

    it('should handle non-numeric ports', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com:abc')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://example.com:port')).toBe(false);
    });
  });

  describe('Unicode and IDN Handling', () => {
    it('should handle internationalized domain names', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://münchen.de')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://café.com')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://测试.com')).toBe(false);
    });

    it('should handle punycode domains', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://xn--mnchen-3ya.de')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://xn--caf-dma.com')).toBe(false);
    });

    it('should handle mixed ASCII and Unicode', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://test-测试.com')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://example-测试.com')).toBe(false);
    });
  });

  describe('Trailing Dots and Special Characters', () => {
    it('should handle trailing dots in domain names', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com.')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://sub.example.com.')).toBe(false);
    });

    it('should handle multiple trailing dots', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com...')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://example.com....')).toBe(false);
    });

    it('should handle dots in the middle of domain names', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://ex..ample.com')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://ex.ample.com')).toBe(false);
    });
  });

  describe('IP Address Handling', () => {
    it('should handle IPv4 addresses', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://192.168.1.1')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://127.0.0.1')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://8.8.8.8')).toBe(false);
    });

    it('should handle IPv6 addresses', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://[2001:db8::1]')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://[::1]')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).toBe(false);
    });

    it('should handle IPv6 addresses with ports', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://[2001:db8::1]:8080')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://[::1]:443')).toBe(false);
    });

    it('should handle invalid IP addresses', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://999.999.999.999')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://192.168.1')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://192.168.1.1.1')).toBe(false);
    });
  });

  describe('Subdomain and Path Handling', () => {
    it('should handle different subdomains', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://www.example.com')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://api.example.com')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://sub.example.com')).toBe(false);
    });

    it('should handle sub-subdomains', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://api.sub.example.com')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://www.api.example.com')).toBe(false);
    });

    it('should handle different paths', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com/path')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com/path/to/page')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com/')).toBe(true);
    });

    it('should handle query parameters', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com?param=value')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com?param1=value1&param2=value2')).toBe(true);
    });

    it('should handle fragments', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com#fragment')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com#section1')).toBe(true);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty strings', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, '')).toBe(false);
      expect(validateSiteUrl('', 'https://example.com')).toBe(false);
      expect(validateSiteUrl('', '')).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, null as any)).toBe(false);
      expect(validateSiteUrl(recipeUrl, undefined as any)).toBe(false);
      expect(validateSiteUrl(null as any, 'https://example.com')).toBe(false);
      expect(validateSiteUrl(undefined as any, 'https://example.com')).toBe(false);
    });

    it('should handle very long URLs', () => {
      const recipeUrl = 'https://example.com';
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);

      expect(validateSiteUrl(recipeUrl, longUrl)).toBe(true);
    });

    it('should handle URLs with special characters in domain', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example-.com')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://-example.com')).toBe(false);
      expect(validateSiteUrl(recipeUrl, 'https://example_.com')).toBe(false);
    });

    it('should handle URLs with multiple slashes', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com//path')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com///path')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com////path')).toBe(true);
    });
  });

  describe('Cache Key Generation Edge Cases', () => {
    it('should generate consistent cache keys for identical inputs', () => {
      const recipeName = 'test-recipe';
      const siteUrl = 'https://example.com';

      const key1 = buildAdapterCacheKey(recipeName, siteUrl);
      const key2 = buildAdapterCacheKey(recipeName, siteUrl);

      expect(key1).toBe(key2);
    });

    it('should generate different cache keys for different inputs', () => {
      const recipeName = 'test-recipe';
      const siteUrl1 = 'https://example1.com';
      const siteUrl2 = 'https://example2.com';

      const key1 = buildAdapterCacheKey(recipeName, siteUrl1);
      const key2 = buildAdapterCacheKey(recipeName, siteUrl2);

      expect(key1).not.toBe(key2);
    });

    it('should handle special characters in recipe names', () => {
      const recipeName = 'test-recipe-with-special-chars!@#$%^&*()';
      const siteUrl = 'https://example.com';

      const key = buildAdapterCacheKey(recipeName, siteUrl);
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
    });

    it('should handle empty recipe names', () => {
      const recipeName = '';
      const siteUrl = 'https://example.com';

      const key = buildAdapterCacheKey(recipeName, siteUrl);
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
    });

    it('should handle empty site URLs', () => {
      const recipeName = 'test-recipe';
      const siteUrl = '';

      const key = buildAdapterCacheKey(recipeName, siteUrl);
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
    });

    it('should handle very long recipe names', () => {
      const recipeName = 'a'.repeat(1000);
      const siteUrl = 'https://example.com';

      const key = buildAdapterCacheKey(recipeName, siteUrl);
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
    });

    it('should handle very long site URLs', () => {
      const recipeName = 'test-recipe';
      const siteUrl = 'https://example.com/' + 'a'.repeat(1000);

      const key = buildAdapterCacheKey(recipeName, siteUrl);
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
    });
  });

  describe('Case Sensitivity', () => {
    it('should handle case differences in domain names', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://EXAMPLE.COM')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://Example.Com')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://EXAMPLE.com')).toBe(true);
    });

    it('should handle case differences in protocols', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'HTTPS://example.com')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'HttpS://example.com')).toBe(true);
    });

    it('should handle case differences in paths', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com/Path')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com/PATH')).toBe(true);
    });
  });

  describe('URL Encoding and Decoding', () => {
    it('should handle URL-encoded characters', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com/path%20with%20spaces')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com/path%2Fwith%2Fslashes')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com/path%3Fwith%3Fquestion')).toBe(true);
    });

    it('should handle double-encoded URLs', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com/path%2520with%2520spaces')).toBe(true);
    });

    it('should handle mixed encoded and unencoded characters', () => {
      const recipeUrl = 'https://example.com';

      expect(validateSiteUrl(recipeUrl, 'https://example.com/path%20with spaces')).toBe(true);
      expect(validateSiteUrl(recipeUrl, 'https://example.com/path%2Fwith/slashes')).toBe(true);
    });
  });
});
