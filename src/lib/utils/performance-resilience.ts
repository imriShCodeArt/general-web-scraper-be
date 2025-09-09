/**
 * Performance and resilience utilities for web scraping.
 *
 * This module provides utilities to improve scraping performance and reliability
 * through element caching, retry mechanisms, and selector optimization. It's
 * designed to handle dynamic content loading and network instability.
 *
 * @see {@link ../core/adapters/base-adapter.ts BaseAdapter}
 * @see {@link ../../test/performance/phase8-performance-resilience.test.ts Performance Tests}
 *
 * Key features:
 * - Element caching with TTL support
 * - Retry mechanisms with exponential backoff
 * - Selector optimization and tightening
 * - Performance monitoring and metrics
 * - Scope-based element discovery
 *
 * Phase 8: Performance & Resilience improvements
 */

import { JSDOM } from 'jsdom';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ElementCache {
  [selector: string]: {
    elements: Element[];
    timestamp: number;
    ttl: number;
  };
}

export class PerformanceResilience {
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 100,
    maxDelay: 2000,
    backoffMultiplier: 2,
  };

  private static elementCache: ElementCache = {};
  private static readonly CACHE_TTL = 5000; // 5 seconds

  /**
   * Retry element discovery with capped exponential backoff
   */
  static async retryElementDiscovery<T>(
    operation: () => T | Promise<T>,
    config: Partial<RetryConfig> = {},
  ): Promise<T> {
    const retryConfig = { ...this.DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        if (result !== null && result !== undefined) {
          return result;
        }
        throw new Error('Operation returned null/undefined');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === retryConfig.maxAttempts) {
          throw lastError;
        }

        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay,
        );

        await this.delay(delay);
      }
    }

    throw lastError || new Error('Retry failed');
  }

  /**
   * Cache label lookups per control to avoid repeated DOM queries
   */
  static getCachedElements(
    dom: JSDOM,
    selector: string,
    scope?: Element,
    ttl: number = this.CACHE_TTL,
  ): Element[] {
    const cacheKey = `${selector}${scope ? `::${scope.tagName}.${scope.className}` : ''}`;
    const now = Date.now();

    // Check cache
    if (this.elementCache[cacheKey]) {
      const cached = this.elementCache[cacheKey];
      if (now - cached.timestamp < cached.ttl) {
        return cached.elements;
      }
      // Cache expired, remove it
      delete this.elementCache[cacheKey];
    }

    // Query elements
    const elements = this.queryElements(dom, selector, scope);

    // Cache the result
    this.elementCache[cacheKey] = {
      elements,
      timestamp: now,
      ttl,
    };

    return elements;
  }

  /**
   * Query elements with proper scoping
   */
  private static queryElements(dom: JSDOM, selector: string, scope?: Element): Element[] {
    try {
      if (scope) {
        return Array.from(scope.querySelectorAll(selector));
      }
      return Array.from(dom.window.document.querySelectorAll(selector));
    } catch (error) {
      console.warn(`Failed to query selector '${selector}':`, error);
      return [];
    }
  }

  /**
   * Tighten selectors by preferring scoping inside .options_group
   */
  static createTightenedSelectors(baseSelectors: string[]): string[] {
    const tightenedSelectors: string[] = [];

    for (const selector of baseSelectors) {
      // If selector already scoped to .options_group, keep it
      if (selector.includes('.options_group')) {
        tightenedSelectors.push(selector);
        continue;
      }

      // Create scoped versions
      const scopedSelector = `.options_group ${selector}`;
      tightenedSelectors.push(scopedSelector);

      // Keep original as fallback
      tightenedSelectors.push(selector);
    }

    return tightenedSelectors;
  }

  /**
   * Optimize selectors for performance by removing redundant patterns
   */
  static optimizeSelectors(selectors: string[]): string[] {
    const optimized: string[] = [];
    const seen = new Set<string>();

    for (const selector of selectors) {
      // Skip if we've seen this exact selector
      if (seen.has(selector)) {
        continue;
      }

      // Skip overly broad selectors that might cause performance issues
      if (this.isOverlyBroadSelector(selector)) {
        continue;
      }

      // Skip selectors that are too generic
      if (this.isTooGeneric(selector)) {
        continue;
      }

      optimized.push(selector);
      seen.add(selector);
    }

    return optimized;
  }

  /**
   * Check if selector is overly broad and might cause performance issues
   */
  private static isOverlyBroadSelector(selector: string): boolean {
    const broadPatterns = [
      /^[a-z]+$/, // Single tag like "div", "span"
      /^\*$/, // Universal selector
      /^\[.*\]$/, // Attribute only selectors
      /^\.$/, // Class only
      /^#$/, // ID only
    ];

    return broadPatterns.some(pattern => pattern.test(selector.trim()));
  }

  /**
   * Check if selector is too generic
   */
  private static isTooGeneric(selector: string): boolean {
    const genericPatterns = [
      /^body$/,
      /^html$/,
      /^head$/,
      /^script$/,
      /^style$/,
    ];

    return genericPatterns.some(pattern => pattern.test(selector.trim()));
  }

  /**
   * Clear element cache
   */
  static clearCache(): void {
    this.elementCache = {};
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: Object.keys(this.elementCache).length,
      keys: Object.keys(this.elementCache),
    };
  }

  /**
   * Utility delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enhanced element discovery with retry and caching
   */
  static async discoverElements(
    dom: JSDOM,
    selectors: string[],
    scope?: Element,
    retryConfig?: Partial<RetryConfig>,
  ): Promise<Element[]> {
    const optimizedSelectors = this.optimizeSelectors(selectors);
    const tightenedSelectors = this.createTightenedSelectors(optimizedSelectors);

    for (const selector of tightenedSelectors) {
      try {
        const elements = await this.retryElementDiscovery(
          () => this.getCachedElements(dom, selector, scope),
          retryConfig,
        );

        if (elements.length > 0) {
          return elements;
        }
      } catch (error) {
        console.warn(`Failed to discover elements with selector '${selector}':`, error);
        continue;
      }
    }

    return [];
  }

  /**
   * Performance monitoring for selector execution
   */
  static async measureSelectorPerformance<T>(
    operation: () => T | Promise<T>,
    selector: string,
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;

    if (duration > 100) { // Log slow selectors
      console.warn(`Slow selector '${selector}' took ${duration.toFixed(2)}ms`);
    }

    return { result, duration };
  }
}
