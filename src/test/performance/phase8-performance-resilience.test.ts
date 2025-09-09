/**
 * Phase 8 Performance & Resilience Tests
 * Tests for tightened selectors, retry mechanisms, and caching
 */

import { JSDOM } from 'jsdom';
import { PerformanceResilience } from '../../lib/utils/performance-resilience';

describe('Phase 8: Performance & Resilience', () => {
  let dom: JSDOM;

  beforeEach(() => {
    const html = `
      <html>
        <body>
          <div class="options_group">
            <div class="input-option386">
              <label>צבע (Color)</label>
              <input type="radio" name="option386" value="red" id="color-red">
              <input type="radio" name="option386" value="blue" id="color-blue">
            </div>
            <div class="input-option387">
              <label>מידה (Size)</label>
              <select name="option387">
                <option value="small">קטן</option>
                <option value="medium">בינוני</option>
                <option value="large">גדול</option>
              </select>
            </div>
          </div>
          <div class="other-content">
            <div class="unrelated-option">
              <input type="checkbox" name="unrelated" value="test">
            </div>
          </div>
        </body>
      </html>
    `;
    dom = new JSDOM(html);
  });

  afterEach(() => {
    PerformanceResilience.clearCache();
  });

  describe('Tightened Selectors', () => {
    it('should prefer scoping inside .options_group', () => {
      const baseSelectors = [
        'input[type="radio"]',
        'select[name*="option"]',
        'input[name*="option"]',
      ];

      const tightened = PerformanceResilience.createTightenedSelectors(baseSelectors);

      expect(tightened).toContain('.options_group input[type="radio"]');
      expect(tightened).toContain('.options_group select[name*="option"]');
      expect(tightened).toContain('.options_group input[name*="option"]');
      
      // Should also keep original as fallback
      expect(tightened).toContain('input[type="radio"]');
      expect(tightened).toContain('select[name*="option"]');
      expect(tightened).toContain('input[name*="option"]');
    });

    it('should not duplicate already scoped selectors', () => {
      const baseSelectors = [
        '.options_group input[type="radio"]',
        'input[type="radio"]',
      ];

      const tightened = PerformanceResilience.createTightenedSelectors(baseSelectors);

      // Should not duplicate the already scoped selector
      const scopedCount = tightened.filter(s => s === '.options_group input[type="radio"]').length;
      expect(scopedCount).toBe(2); // One original + one from tightening the second selector
    });
  });

  describe('Selector Optimization', () => {
    it('should remove overly broad selectors', () => {
      const selectors = [
        'div',
        'span',
        '*',
        '.options_group input[type="radio"]',
        'input[name*="option"]',
      ];

      const optimized = PerformanceResilience.optimizeSelectors(selectors);

      expect(optimized).not.toContain('div');
      expect(optimized).not.toContain('span');
      expect(optimized).not.toContain('*');
      expect(optimized).toContain('.options_group input[type="radio"]');
      expect(optimized).toContain('input[name*="option"]');
    });

    it('should remove too generic selectors', () => {
      const selectors = [
        'body',
        'html',
        'head',
        'script',
        'style',
        '.options_group input[type="radio"]',
      ];

      const optimized = PerformanceResilience.optimizeSelectors(selectors);

      expect(optimized).not.toContain('body');
      expect(optimized).not.toContain('html');
      expect(optimized).not.toContain('head');
      expect(optimized).not.toContain('script');
      expect(optimized).not.toContain('style');
      expect(optimized).toContain('.options_group input[type="radio"]');
    });

    it('should remove duplicate selectors', () => {
      const selectors = [
        '.options_group input[type="radio"]',
        '.options_group input[type="radio"]',
        'input[name*="option"]',
        'input[name*="option"]',
      ];

      const optimized = PerformanceResilience.optimizeSelectors(selectors);

      expect(optimized).toHaveLength(2);
      expect(optimized).toContain('.options_group input[type="radio"]');
      expect(optimized).toContain('input[name*="option"]');
    });
  });

  describe('Element Caching', () => {
    it('should cache elements and return cached results', () => {
      const selector = '.options_group input[type="radio"]';
      
      // First call should query DOM
      const elements1 = PerformanceResilience.getCachedElements(dom, selector);
      expect(elements1).toHaveLength(2);

      // Second call should return cached result
      const elements2 = PerformanceResilience.getCachedElements(dom, selector);
      expect(elements2).toBe(elements1); // Same reference
    });

    it('should respect cache TTL', async () => {
      const selector = '.options_group input[type="radio"]';
      const shortTtl = 10; // 10ms
      
      // First call
      const elements1 = PerformanceResilience.getCachedElements(dom, selector, undefined, shortTtl);
      expect(elements1).toHaveLength(2);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 20));

      // Second call should query DOM again
      const elements2 = PerformanceResilience.getCachedElements(dom, selector, undefined, shortTtl);
      expect(elements2).toHaveLength(2);
      expect(elements2).not.toBe(elements1); // Different reference
    });

    it('should cache elements with different scopes separately', () => {
      const selector = 'input[type="radio"]';
      const scope = dom.window.document.querySelector('.options_group');
      
      // Query without scope
      const elements1 = PerformanceResilience.getCachedElements(dom, selector);
      
      // Query with scope
      const elements2 = PerformanceResilience.getCachedElements(dom, selector, scope!);
      
      expect(elements1).toHaveLength(2); // All radio inputs
      expect(elements2).toHaveLength(2); // Radio inputs in scope
      expect(elements1).not.toBe(elements2); // Different cached results
    });

    it('should provide cache statistics', () => {
      const selector1 = '.options_group input[type="radio"]';
      const selector2 = '.options_group select[name*="option"]';
      
      PerformanceResilience.getCachedElements(dom, selector1);
      PerformanceResilience.getCachedElements(dom, selector2);
      
      const stats = PerformanceResilience.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain(selector1);
      expect(stats.keys).toContain(selector2);
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry failed operations with exponential backoff', async () => {
      let attemptCount = 0;
      const operation = async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Simulated failure');
        }
        return 'success';
      };

      const result = await PerformanceResilience.retryElementDiscovery(operation, {
        maxAttempts: 3,
        baseDelay: 10,
        maxDelay: 100,
      });

      expect(result).toBe('success');
      expect(attemptCount).toBe(3);
    });

    it('should fail after max attempts', async () => {
      const operation = async () => {
        throw new Error('Always fails');
      };

      await expect(
        PerformanceResilience.retryElementDiscovery(operation, {
          maxAttempts: 2,
          baseDelay: 10,
          maxDelay: 100,
        })
      ).rejects.toThrow('Always fails');
    });

    it('should succeed on first attempt', async () => {
      const operation = async () => 'success';

      const result = await PerformanceResilience.retryElementDiscovery(operation);
      expect(result).toBe('success');
    });
  });

  describe('Element Discovery', () => {
    it('should discover elements with tightened selectors', async () => {
      const selectors = [
        'input[type="radio"]',
        'select[name*="option"]',
      ];

      const elements = await PerformanceResilience.discoverElements(dom, selectors);

      expect(elements).toHaveLength(2); // 2 radio inputs (select not found with current selector)
    });

    it('should prefer scoped selectors over broad ones', async () => {
      const selectors = [
        'input[type="radio"]', // Broad
        '.options_group input[type="radio"]', // Scoped
      ];

      const elements = await PerformanceResilience.discoverElements(dom, selectors);

      // Should find elements using the scoped selector
      expect(elements).toHaveLength(2);
      expect(elements.every(el => el.closest('.options_group'))).toBe(true);
    });

    it('should return empty array when no selectors match', async () => {
      const selectors = [
        '.non-existent-selector',
        'div.also-non-existent',
      ];

      const elements = await PerformanceResilience.discoverElements(dom, selectors);

      expect(elements).toHaveLength(0);
    });
  });

  describe('Performance Monitoring', () => {
    it('should measure selector performance', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      };

      const { result, duration } = await PerformanceResilience.measureSelectorPerformance(
        operation,
        'test-selector'
      );

      expect(result).toBe('result');
      expect(duration).toBeGreaterThan(40);
      expect(duration).toBeLessThan(100);
    });

    it('should warn about slow selectors', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
        return 'result';
      };

      await PerformanceResilience.measureSelectorPerformance(operation, 'slow-selector');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow selector \'slow-selector\' took')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      const selector = '.options_group input[type="radio"]';
      
      PerformanceResilience.getCachedElements(dom, selector);
      expect(PerformanceResilience.getCacheStats().size).toBe(1);

      PerformanceResilience.clearCache();
      expect(PerformanceResilience.getCacheStats().size).toBe(0);
    });
  });
});
