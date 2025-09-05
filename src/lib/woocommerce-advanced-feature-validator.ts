import { RecipeConfig, WooCommerceValidationError, WooCommerceValidationWarning } from '../types';

export interface AdvancedFeatureValidationResult {
  isValid: boolean;
  errors: WooCommerceValidationError[];
  warnings: WooCommerceValidationWarning[];
  detectedFeatures: WooCommerceFeature[];
  compatibilityScore: number;
}

export interface WooCommerceFeature {
  name: string;
  type: 'grouped' | 'external' | 'variable' | 'simple' | 'subscription' | 'booking' | 'composite';
  confidence: number;
  selectors: string[];
  requiredFields: string[];
  optionalFields: string[];
}

export class WooCommerceAdvancedFeatureValidator {
  private readonly WOOCOMMERCE_FEATURE_PATTERNS = {
    grouped: {
      selectors: [
        '.grouped-products',
        '.woocommerce-grouped-products',
        '.product-group',
        '[data-product-type="grouped"]',
      ],
      requiredFields: ['title', 'price', 'images'],
      optionalFields: ['description', 'sku'],
    },
    external: {
      selectors: [
        '.external-product',
        '.woocommerce-external-product',
        '.product-external',
        '[data-product-type="external"]',
        'a[href*="external"]',
        'a[href*="affiliate"]',
      ],
      requiredFields: ['title', 'price', 'productLinks'],
      optionalFields: ['description', 'images', 'sku'],
    },
    variable: {
      selectors: [
        '.variations',
        '.product-variations',
        '.woocommerce-variations',
        '.variation-selector',
        'select[name*="attribute"]',
        'input[name*="attribute"]',
        '.variations_form',
      ],
      requiredFields: ['title', 'price', 'images', 'attributes', 'variations'],
      optionalFields: ['description', 'sku', 'stock'],
    },
    subscription: {
      selectors: [
        '.subscription',
        '.woocommerce-subscription',
        '.product-subscription',
        '[data-product-type="subscription"]',
        '.subscription-period',
        '.subscription-interval',
      ],
      requiredFields: ['title', 'price', 'images'],
      optionalFields: ['description', 'sku', 'subscriptionPeriod', 'subscriptionInterval'],
    },
    booking: {
      selectors: [
        '.booking',
        '.woocommerce-booking',
        '.product-booking',
        '[data-product-type="booking"]',
        '.booking-form',
        '.booking-calendar',
        '.booking-dates',
      ],
      requiredFields: ['title', 'price', 'images'],
      optionalFields: ['description', 'sku', 'bookingForm', 'bookingCalendar'],
    },
    composite: {
      selectors: [
        '.composite-product',
        '.woocommerce-composite',
        '.product-composite',
        '[data-product-type="composite"]',
        '.composite-components',
        '.composite-options',
      ],
      requiredFields: ['title', 'price', 'images'],
      optionalFields: ['description', 'sku', 'compositeComponents'],
    },
  };

  private readonly WOOCOMMERCE_THEME_SELECTORS = [
    // Storefront theme
    '.storefront',
    '.woocommerce-storefront',
    '.single-product .product',
    '.woocommerce .product',

    // Astra theme
    '.astra',
    '.woocommerce-astra',

    // OceanWP theme
    '.oceanwp',
    '.woocommerce-oceanwp',

    // Flatsome theme
    '.flatsome',
    '.woocommerce-flatsome',

    // Custom WooCommerce classes
    '.woocommerce',
    '.woocommerce-page',
    '.woocommerce-product',
    '.product',
    '.single-product',
  ];

  /**
   * Validate advanced WooCommerce features
   */
  validateAdvancedFeatures(recipe: RecipeConfig): AdvancedFeatureValidationResult {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];
    const detectedFeatures: WooCommerceFeature[] = [];

    // Detect WooCommerce features
    this.detectWooCommerceFeatures(recipe, detectedFeatures);

    // Validate feature-specific requirements
    this.validateFeatureRequirements(recipe, detectedFeatures, errors, warnings);

    // Check WooCommerce theme compatibility
    this.checkThemeCompatibility(recipe, warnings);

    // Validate WooCommerce-specific patterns
    this.validateWooCommercePatterns(recipe, warnings);

    // Calculate compatibility score
    const compatibilityScore = this.calculateCompatibilityScore(recipe, detectedFeatures, errors.length, warnings.length);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      detectedFeatures,
      compatibilityScore,
    };
  }

  /**
   * Detect WooCommerce features based on selectors
   */
  private detectWooCommerceFeatures(
    recipe: RecipeConfig,
    detectedFeatures: WooCommerceFeature[],
  ): void {
    const allSelectors = this.getAllSelectors(recipe);

    Object.entries(this.WOOCOMMERCE_FEATURE_PATTERNS).forEach(([featureType, pattern]) => {
      const matchingSelectors = allSelectors.filter(selector =>
        pattern.selectors.some(patternSelector =>
          selector.includes(patternSelector) ||
          this.selectorMatchesPattern(selector, patternSelector),
        ),
      );

      if (matchingSelectors.length > 0) {
        const confidence = this.calculateFeatureConfidence(matchingSelectors, pattern.selectors);

        detectedFeatures.push({
          name: this.formatFeatureName(featureType),
          type: featureType as WooCommerceFeature['type'],
          confidence,
          selectors: matchingSelectors,
          requiredFields: pattern.requiredFields,
          optionalFields: pattern.optionalFields,
        });
      }
    });
  }

  /**
   * Validate feature-specific requirements
   */
  private validateFeatureRequirements(
    recipe: RecipeConfig,
    detectedFeatures: WooCommerceFeature[],
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    detectedFeatures.forEach(feature => {
      // Check required fields for each feature
      feature.requiredFields.forEach(field => {
        const hasField = this.hasRequiredField(recipe, field);
        if (!hasField) {
          errors.push({
            code: 'MISSING_REQUIRED_FIELD_FOR_FEATURE',
            message: `Missing required field '${field}' for ${feature.name} product type`,
            field: `selectors.${field}`,
            category: 'required',
            suggestion: `Add ${field} selector for ${feature.name} product compatibility`,
            severity: 'error',
          });
        }
      });

      // Check optional fields and suggest them
      feature.optionalFields.forEach(field => {
        const hasField = this.hasRequiredField(recipe, field);
        if (!hasField) {
          warnings.push({
            code: 'MISSING_OPTIONAL_FIELD_FOR_FEATURE',
            message: `Consider adding '${field}' selector for better ${feature.name} support`,
            field: `selectors.${field}`,
            category: 'best-practice',
            suggestion: `Add ${field} selector to enhance ${feature.name} product functionality`,
          });
        }
      });

      // Feature-specific validations
      this.validateSpecificFeature(recipe, feature, errors, warnings);
    });
  }

  /**
   * Validate specific feature requirements
   */
  private validateSpecificFeature(
    recipe: RecipeConfig,
    feature: WooCommerceFeature,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    switch (feature.type) {
    case 'variable':
      this.validateVariableProduct(recipe, errors, warnings);
      break;
    case 'grouped':
      this.validateGroupedProduct(recipe, errors, warnings);
      break;
    case 'external':
      this.validateExternalProduct(recipe, errors, warnings);
      break;
    case 'subscription':
      this.validateSubscriptionProduct(recipe, errors, warnings);
      break;
    case 'booking':
      this.validateBookingProduct(recipe, errors, warnings);
      break;
    case 'composite':
      this.validateCompositeProduct(recipe, errors, warnings);
      break;
    }
  }

  /**
   * Validate variable product specific requirements
   */
  private validateVariableProduct(
    recipe: RecipeConfig,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    // Must have both variations and attributes
    if (recipe.selectors.variations && !recipe.selectors.attributes) {
      errors.push({
        code: 'VARIABLE_PRODUCT_MISSING_ATTRIBUTES',
        message: 'Variable product must have both variation and attribute selectors',
        field: 'selectors.attributes',
        category: 'required',
        suggestion: 'Add attribute selectors for variable product variations',
        severity: 'error',
      });
    }

    // Should have variation form selectors
    if (!this.hasVariationFormSelectors(recipe)) {
      warnings.push({
        code: 'VARIABLE_PRODUCT_MISSING_FORM_SELECTORS',
        message: 'Variable product should have variation form selectors',
        field: 'behavior.waitForSelectors',
        category: 'best-practice',
        suggestion: 'Add variation form selectors for better variation detection',
      });
    }
  }

  /**
   * Validate grouped product specific requirements
   */
  private validateGroupedProduct(
    recipe: RecipeConfig,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    // Should have product links for grouped items
    if (!recipe.selectors.productLinks) {
      warnings.push({
        code: 'GROUPED_PRODUCT_MISSING_LINKS',
        message: 'Grouped product should have product links for individual items',
        field: 'selectors.productLinks',
        category: 'best-practice',
        suggestion: 'Add product links selector for grouped product items',
      });
    }
  }

  /**
   * Validate external product specific requirements
   */
  private validateExternalProduct(
    recipe: RecipeConfig,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    // Must have product links
    if (!recipe.selectors.productLinks) {
      errors.push({
        code: 'EXTERNAL_PRODUCT_MISSING_LINKS',
        message: 'External product must have product links',
        field: 'selectors.productLinks',
        category: 'required',
        suggestion: 'Add product links selector for external product redirection',
        severity: 'error',
      });
    }

    // Should not have add to cart functionality
    if ((recipe.selectors as any).addToCart) {
      warnings.push({
        code: 'EXTERNAL_PRODUCT_HAS_CART_SELECTOR',
        message: 'External product should not have add to cart selector',
        field: 'selectors.addToCart',
        category: 'best-practice',
        suggestion: 'Remove add to cart selector for external products',
      });
    }
  }

  /**
   * Validate subscription product specific requirements
   */
  private validateSubscriptionProduct(
    recipe: RecipeConfig,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    // Should have subscription period selector
    if (!this.hasSubscriptionSelectors(recipe)) {
      warnings.push({
        code: 'SUBSCRIPTION_PRODUCT_MISSING_PERIOD_SELECTORS',
        message: 'Subscription product should have period and interval selectors',
        field: 'selectors',
        category: 'best-practice',
        suggestion: 'Add subscription period and interval selectors',
      });
    }
  }

  /**
   * Validate booking product specific requirements
   */
  private validateBookingProduct(
    recipe: RecipeConfig,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    // Should have booking form selectors
    if (!this.hasBookingSelectors(recipe)) {
      warnings.push({
        code: 'BOOKING_PRODUCT_MISSING_FORM_SELECTORS',
        message: 'Booking product should have booking form selectors',
        field: 'selectors',
        category: 'best-practice',
        suggestion: 'Add booking form and calendar selectors',
      });
    }
  }

  /**
   * Validate composite product specific requirements
   */
  private validateCompositeProduct(
    recipe: RecipeConfig,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    // Should have component selectors
    if (!this.hasCompositeSelectors(recipe)) {
      warnings.push({
        code: 'COMPOSITE_PRODUCT_MISSING_COMPONENT_SELECTORS',
        message: 'Composite product should have component selectors',
        field: 'selectors',
        category: 'best-practice',
        suggestion: 'Add composite component selectors',
      });
    }
  }

  /**
   * Check WooCommerce theme compatibility
   */
  private checkThemeCompatibility(
    recipe: RecipeConfig,
    warnings: WooCommerceValidationWarning[],
  ): void {
    const allSelectors = this.getAllSelectors(recipe);
    const themeSelectors = allSelectors.filter(selector =>
      this.WOOCOMMERCE_THEME_SELECTORS.some(themeSelector =>
        selector.includes(themeSelector),
      ),
    );

    if (themeSelectors.length === 0) {
      warnings.push({
        code: 'MISSING_WOOCOMMERCE_THEME_SELECTORS',
        message: 'No WooCommerce theme-specific selectors detected',
        field: 'selectors',
        category: 'best-practice',
        suggestion: 'Consider adding WooCommerce theme-specific selectors for better compatibility',
      });
    }
  }

  /**
   * Validate WooCommerce-specific patterns
   */
  private validateWooCommercePatterns(
    recipe: RecipeConfig,
    warnings: WooCommerceValidationWarning[],
  ): void {
    // Check for WooCommerce data attributes
    const hasDataAttributes = this.hasWooCommerceDataAttributes(recipe);
    if (!hasDataAttributes) {
      warnings.push({
        code: 'MISSING_WOOCOMMERCE_DATA_ATTRIBUTES',
        message: 'Consider using WooCommerce data attributes for better compatibility',
        field: 'selectors',
        category: 'best-practice',
        suggestion: 'Use data attributes like [data-product-id], [data-price], etc.',
      });
    }

    // Check for proper WooCommerce class patterns
    const hasWooCommerceClasses = this.hasWooCommerceClassPatterns(recipe);
    if (!hasWooCommerceClasses) {
      warnings.push({
        code: 'MISSING_WOOCOMMERCE_CLASS_PATTERNS',
        message: 'Consider using WooCommerce class patterns for better theme compatibility',
        field: 'selectors',
        category: 'best-practice',
        suggestion: 'Use WooCommerce classes like .woocommerce, .product, .single-product, etc.',
      });
    }
  }

  /**
   * Calculate compatibility score
   */
  private calculateCompatibilityScore(
    recipe: RecipeConfig,
    detectedFeatures: WooCommerceFeature[],
    errorCount: number,
    warningCount: number,
  ): number {
    let score = 100;

    // Deduct for errors
    score -= errorCount * 10;

    // Deduct for warnings
    score -= warningCount * 2;

    // Bonus for detected features
    score += detectedFeatures.length * 5;

    // Bonus for high confidence features
    const highConfidenceFeatures = detectedFeatures.filter(f => f.confidence > 0.8);
    score += highConfidenceFeatures.length * 3;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Helper methods
   */
  private selectorMatchesPattern(selector: string, pattern: string): boolean {
    return selector.includes(pattern) || new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(selector);
  }

  private calculateFeatureConfidence(matchingSelectors: string[], patterns: string[]): number {
    const matchCount = matchingSelectors.length;
    const patternCount = patterns.length;
    return Math.min(1, matchCount / patternCount);
  }

  private formatFeatureName(featureType: string): string {
    return featureType.charAt(0).toUpperCase() + featureType.slice(1) + ' Product';
  }

  private hasRequiredField(recipe: RecipeConfig, field: string): boolean {
    const value = recipe.selectors[field as keyof typeof recipe.selectors];
    return Boolean(value && (typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) && value.length > 0));
  }

  private hasVariationFormSelectors(recipe: RecipeConfig): boolean {
    const formSelectors = ['.variations_form', '.woocommerce-variations-form', 'form.variations'];
    const allSelectors = this.getAllSelectors(recipe);
    return formSelectors.some(formSelector =>
      allSelectors.some(selector => selector.includes(formSelector)),
    );
  }

  private hasSubscriptionSelectors(recipe: RecipeConfig): boolean {
    const subscriptionSelectors = ['.subscription-period', '.subscription-interval', '[data-subscription]'];
    const allSelectors = this.getAllSelectors(recipe);
    return subscriptionSelectors.some(selector =>
      allSelectors.some(s => s.includes(selector)),
    );
  }

  private hasBookingSelectors(recipe: RecipeConfig): boolean {
    const bookingSelectors = ['.booking-form', '.booking-calendar', '.booking-dates', '[data-booking]'];
    const allSelectors = this.getAllSelectors(recipe);
    return bookingSelectors.some(selector =>
      allSelectors.some(s => s.includes(selector)),
    );
  }

  private hasCompositeSelectors(recipe: RecipeConfig): boolean {
    const compositeSelectors = ['.composite-components', '.composite-options', '[data-composite]'];
    const allSelectors = this.getAllSelectors(recipe);
    return compositeSelectors.some(selector =>
      allSelectors.some(s => s.includes(selector)),
    );
  }

  private hasWooCommerceDataAttributes(recipe: RecipeConfig): boolean {
    const allSelectors = this.getAllSelectors(recipe);
    const dataAttributePatterns = ['[data-product-', '[data-price', '[data-sku', '[data-stock'];
    return dataAttributePatterns.some(pattern =>
      allSelectors.some(selector => selector.includes(pattern)),
    );
  }

  private hasWooCommerceClassPatterns(recipe: RecipeConfig): boolean {
    const allSelectors = this.getAllSelectors(recipe);
    const classPatterns = ['.woocommerce', '.product', '.single-product', '.shop'];
    return classPatterns.some(pattern =>
      allSelectors.some(selector => selector.includes(pattern)),
    );
  }

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
