import { RecipeConfig, WooCommerceValidationError, WooCommerceValidationWarning } from '../types';

export interface PerformanceValidationResult {
  isValid: boolean;
  errors: WooCommerceValidationError[];
  warnings: WooCommerceValidationWarning[];
  performanceScore: number;
  optimizationSuggestions: string[];
}

export class WooCommercePerformanceValidator {
  private readonly SLOW_SELECTOR_PATTERNS = [
    /:nth-child\(\d+\)/g,           // :nth-child selectors
    /:nth-of-type\(\d+\)/g,         // :nth-of-type selectors
    /:not\([^)]+\)/g,               // :not() selectors
    /\[[^\]]*~=/g,                  // Attribute contains selectors
    /\[[^\]]*\*=/g,                 // Attribute starts with selectors
    /\[[^\]]*\$=/g,                 // Attribute ends with selectors
    /\[[^\]]*\^=/g,                 // Attribute contains word selectors
    /:has\([^)]+\)/g,               // :has() selectors (if supported)
    /::before|::after/g,            // Pseudo-elements
    /:first-child|:last-child/g,    // Child selectors
    /:first-of-type|:last-of-type/g, // Type selectors
  ];

  private readonly INEFFICIENT_PATTERNS = [
    /\s+/g,                         // Multiple spaces
    /\.\w+\s+\.\w+/g,               // Multiple class selectors
    /#\w+\s+#\w+/g,                 // Multiple ID selectors
    /\*\s+/g,                       // Universal selector with space
    /\[[^\]]*\]\s*\[[^\]]*\]/g,     // Multiple attribute selectors
  ];

  private readonly COMPLEX_SELECTOR_THRESHOLD = 3; // Max complexity score
  private readonly PERFORMANCE_WARNING_THRESHOLD = 2; // Max warnings before performance concern

  /**
   * Validate recipe performance characteristics
   */
  validatePerformance(recipe: RecipeConfig): PerformanceValidationResult {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];
    const optimizationSuggestions: string[] = [];

    const allSelectors = this.getAllSelectors(recipe);
    const performanceAnalysis = this.analyzeSelectorPerformance(allSelectors);

    // Add performance warnings based on analysis
    this.addPerformanceWarnings(performanceAnalysis, warnings, optimizationSuggestions);

    // Check for redundant selectors
    this.checkRedundantSelectors(allSelectors, warnings, optimizationSuggestions);

    // Check for conflicting selectors
    this.checkConflictingSelectors(allSelectors, warnings, optimizationSuggestions);

    // Check for missing performance optimizations
    this.checkMissingOptimizations(recipe, warnings, optimizationSuggestions);

    // Calculate performance score
    const performanceScore = this.calculatePerformanceScore(performanceAnalysis, warnings.length);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      performanceScore,
      optimizationSuggestions,
    };
  }

  /**
   * Analyze performance characteristics of selectors
   */
  private analyzeSelectorPerformance(selectors: string[]): {
    slowSelectors: string[];
    inefficientSelectors: string[];
    complexSelectors: string[];
    totalComplexity: number;
    averageComplexity: number;
  } {
    const slowSelectors: string[] = [];
    const inefficientSelectors: string[] = [];
    const complexSelectors: string[] = [];
    let totalComplexity = 0;

    selectors.forEach(selector => {
      if (!selector.trim()) return;

      const complexity = this.calculateSelectorComplexity(selector);
      totalComplexity += complexity;

      // Check for slow patterns
      if (this.hasSlowPatterns(selector)) {
        slowSelectors.push(selector);
      }

      // Check for inefficient patterns
      if (this.hasInefficientPatterns(selector)) {
        inefficientSelectors.push(selector);
      }

      // Check for complex selectors
      if (complexity > this.COMPLEX_SELECTOR_THRESHOLD) {
        complexSelectors.push(selector);
      }
    });

    return {
      slowSelectors,
      inefficientSelectors,
      complexSelectors,
      totalComplexity,
      averageComplexity: selectors.length > 0 ? totalComplexity / selectors.length : 0,
    };
  }

  /**
   * Calculate complexity score for a selector
   */
  private calculateSelectorComplexity(selector: string): number {
    let complexity = 0;

    // Base complexity
    complexity += 1;

    // Add complexity for each pattern
    this.SLOW_SELECTOR_PATTERNS.forEach(pattern => {
      const matches = selector.match(pattern);
      if (matches) {
        complexity += matches.length * 2; // Slow patterns add more complexity
      }
    });

    this.INEFFICIENT_PATTERNS.forEach(pattern => {
      const matches = selector.match(pattern);
      if (matches) {
        complexity += matches.length; // Inefficient patterns add moderate complexity
      }
    });

    // Add complexity for length
    if (selector.length > 50) {
      complexity += 1;
    }

    // Add complexity for nested selectors
    const nestedCount = (selector.match(/>/g) || []).length;
    complexity += nestedCount;

    // Add complexity for multiple selectors
    const selectorCount = selector.split(',').length;
    if (selectorCount > 1) {
      complexity += selectorCount - 1;
    }

    return complexity;
  }

  /**
   * Check if selector has slow patterns
   */
  private hasSlowPatterns(selector: string): boolean {
    return this.SLOW_SELECTOR_PATTERNS.some(pattern => pattern.test(selector));
  }

  /**
   * Check if selector has inefficient patterns
   */
  private hasInefficientPatterns(selector: string): boolean {
    return this.INEFFICIENT_PATTERNS.some(pattern => pattern.test(selector));
  }

  /**
   * Add performance warnings based on analysis
   */
  private addPerformanceWarnings(
    analysis: ReturnType<WooCommercePerformanceValidator['analyzeSelectorPerformance']>,
    warnings: WooCommerceValidationWarning[],
    suggestions: string[],
  ): void {
    if (analysis.slowSelectors.length > 0) {
      warnings.push({
        code: 'SLOW_SELECTORS',
        message: `Found ${analysis.slowSelectors.length} slow selectors that may impact performance`,
        field: 'selectors',
        category: 'performance',
        suggestion: 'Consider using more efficient selectors for better performance',
      });
      suggestions.push(`Optimize ${analysis.slowSelectors.length} slow selectors`);
    }

    if (analysis.inefficientSelectors.length > 0) {
      warnings.push({
        code: 'INEFFICIENT_SELECTORS',
        message: `Found ${analysis.inefficientSelectors.length} potentially inefficient selectors`,
        field: 'selectors',
        category: 'performance',
        suggestion: 'Avoid wildcard selectors and complex pseudo-selectors for better performance',
      });
      suggestions.push(`Simplify ${analysis.inefficientSelectors.length} inefficient selectors`);
    }

    if (analysis.complexSelectors.length > 0) {
      warnings.push({
        code: 'COMPLEX_SELECTORS',
        message: `Found ${analysis.complexSelectors.length} complex selectors that may impact performance`,
        field: 'selectors',
        category: 'performance',
        suggestion: 'Consider using simpler selectors for better performance',
      });
      suggestions.push(`Simplify ${analysis.complexSelectors.length} complex selectors`);
    }

    if (analysis.averageComplexity > 3) {
      warnings.push({
        code: 'HIGH_AVERAGE_COMPLEXITY',
        message: `Average selector complexity is high (${analysis.averageComplexity.toFixed(1)})`,
        field: 'selectors',
        category: 'performance',
        suggestion: 'Consider simplifying selectors across the recipe',
      });
      suggestions.push('Reduce overall selector complexity');
    }
  }

  /**
   * Check for redundant selectors
   */
  private checkRedundantSelectors(
    selectors: string[],
    warnings: WooCommerceValidationWarning[],
    suggestions: string[],
  ): void {
    const selectorMap = new Map<string, number>();

    selectors.forEach(selector => {
      if (selector.trim()) {
        const normalized = this.normalizeSelector(selector);
        selectorMap.set(normalized, (selectorMap.get(normalized) || 0) + 1);
      }
    });

    const redundantSelectors = Array.from(selectorMap.entries())
      .filter(([, count]) => count > 1)
      .map(([selector]) => selector);

    if (redundantSelectors.length > 0) {
      warnings.push({
        code: 'REDUNDANT_SELECTORS',
        message: `Found ${redundantSelectors.length} redundant selectors`,
        field: 'selectors',
        category: 'performance',
        suggestion: 'Remove duplicate selectors to improve performance',
      });
      suggestions.push(`Remove ${redundantSelectors.length} redundant selectors`);
    }
  }

  /**
   * Check for conflicting selectors
   */
  private checkConflictingSelectors(
    selectors: string[],
    warnings: WooCommerceValidationWarning[],
    suggestions: string[],
  ): void {
    const conflicts: string[][] = [];

    for (let i = 0; i < selectors.length; i++) {
      for (let j = i + 1; j < selectors.length; j++) {
        if (this.selectorsConflict(selectors[i], selectors[j])) {
          conflicts.push([selectors[i], selectors[j]]);
        }
      }
    }

    if (conflicts.length > 0) {
      warnings.push({
        code: 'CONFLICTING_SELECTORS',
        message: `Found ${conflicts.length} conflicting selector pairs`,
        field: 'selectors',
        category: 'performance',
        suggestion: 'Review selectors to resolve conflicts and improve performance',
      });
      suggestions.push(`Resolve ${conflicts.length} selector conflicts`);
    }
  }

  /**
   * Check for missing performance optimizations
   */
  private checkMissingOptimizations(
    recipe: RecipeConfig,
    warnings: WooCommerceValidationWarning[],
    suggestions: string[],
  ): void {
    // Check for missing wait strategies
    if (recipe.selectors.variations && !recipe.behavior?.waitForSelectors) {
      warnings.push({
        code: 'MISSING_WAIT_STRATEGY',
        message: 'Variation selectors present but no wait strategy defined',
        field: 'behavior.waitForSelectors',
        category: 'performance',
        suggestion: 'Add wait selectors to ensure elements are loaded before scraping',
      });
      suggestions.push('Add wait strategy for variation selectors');
    }

    // Check for missing pagination optimization
    if (recipe.selectors.pagination && !recipe.behavior?.waitForSelectors) {
      warnings.push({
        code: 'MISSING_PAGINATION_WAIT',
        message: 'Pagination present but no wait strategy for page transitions',
        field: 'behavior.waitForSelectors',
        category: 'performance',
        suggestion: 'Add wait selectors for pagination to ensure smooth page transitions',
      });
      suggestions.push('Add wait strategy for pagination');
    }

    // Check for missing image optimization
    if (recipe.selectors.images && !this.hasImageOptimization(recipe)) {
      warnings.push({
        code: 'MISSING_IMAGE_OPTIMIZATION',
        message: 'Image selectors present but no optimization strategy',
        field: 'selectors.images',
        category: 'performance',
        suggestion: 'Consider adding image loading optimization or lazy loading selectors',
      });
      suggestions.push('Add image loading optimization');
    }
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(
    analysis: ReturnType<WooCommercePerformanceValidator['analyzeSelectorPerformance']>,
    warningCount: number,
  ): number {
    let score = 100;

    // Deduct points for slow selectors
    score -= analysis.slowSelectors.length * 5;

    // Deduct points for inefficient selectors
    score -= analysis.inefficientSelectors.length * 3;

    // Deduct points for complex selectors
    score -= analysis.complexSelectors.length * 4;

    // Deduct points for high average complexity
    if (analysis.averageComplexity > 3) {
      score -= (analysis.averageComplexity - 3) * 10;
    }

    // Deduct points for warnings
    score -= warningCount * 2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check if selectors conflict
   */
  private selectorsConflict(selector1: string, selector2: string): boolean {
    // Simple conflict detection - can be enhanced
    const s1 = selector1.trim();
    const s2 = selector2.trim();

    if (s1 === s2) return true;

    // Check for overlapping target elements
    return this.selectorsTargetSameElement(s1, s2);
  }

  /**
   * Check if selectors target the same element
   */
  private selectorsTargetSameElement(selector1: string, selector2: string): boolean {
    // Extract element types
    const getElementType = (selector: string) => {
      const match = selector.match(/^([.#]?[a-zA-Z][a-zA-Z0-9]*)/);
      return match ? match[1] : '';
    };

    const type1 = getElementType(selector1);
    const type2 = getElementType(selector2);

    return Boolean(type1 && type2 && type1 === type2);
  }

  /**
   * Check if recipe has image optimization
   */
  private hasImageOptimization(recipe: RecipeConfig): boolean {
    // Check for lazy loading attributes
    const imageSelectors = Array.isArray(recipe.selectors.images)
      ? recipe.selectors.images
      : [recipe.selectors.images];

    return imageSelectors.some(selector =>
      selector.includes('[data-src]') ||
      selector.includes('[loading="lazy"]') ||
      selector.includes('.lazy'),
    );
  }

  /**
   * Normalize selector for comparison
   */
  private normalizeSelector(selector: string): string {
    return selector.trim().replace(/\s+/g, ' ');
  }

  /**
   * Get all selectors from recipe
   */
  private getAllSelectors(recipe: RecipeConfig): string[] {
    const selectors: string[] = [];

    Object.values(recipe.selectors).forEach(value => {
      if (typeof value === 'string') {
        selectors.push(value);
      } else if (Array.isArray(value)) {
        selectors.push(...value);
      }
    });

    if (recipe.behavior?.waitForSelectors) {
      selectors.push(...recipe.behavior.waitForSelectors);
    }

    return selectors;
  }
}
