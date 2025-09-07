import {
  WooCommerceVariationDetectionRules,
  WooCommerceValidationError,
  WooCommerceValidationWarning,
  RecipeConfig,
} from '../../domain/types';
import { WOOCOMMERCE_VARIATION_DETECTION_RULES } from './woocommerce-validation-schema';

/**
 * WooCommerce Variation Detection Validator
 * Validates variation detection configuration in recipes
 */
export class WooCommerceVariationValidator {
  private rules: WooCommerceVariationDetectionRules;

  constructor(rules: WooCommerceVariationDetectionRules = WOOCOMMERCE_VARIATION_DETECTION_RULES) {
    this.rules = rules;
  }

  /**
   * Validate variation detection configuration in a recipe
   */
  validateVariationDetection(recipe: RecipeConfig): {
    isValid: boolean;
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    // Check if recipe has variations
    const hasVariations = this.hasVariationSelectors(recipe);
    const hasAttributes = this.hasAttributeSelectors(recipe);

    // If no variations or attributes, skip validation
    if (!hasVariations && !hasAttributes) {
      return { isValid: true, errors, warnings };
    }

    // Validate variation selectors
    if (hasVariations) {
      const variationResult = this.validateVariationSelectors(recipe);
      errors.push(...variationResult.errors);
      warnings.push(...variationResult.warnings);
    }

    // Validate attribute selectors
    if (hasAttributes) {
      const attributeResult = this.validateAttributeSelectors(recipe);
      errors.push(...attributeResult.errors);
      warnings.push(...attributeResult.warnings);
    }

    // Validate variation form selectors
    const formResult = this.validateVariationFormSelectors(recipe);
    errors.push(...formResult.errors);
    warnings.push(...formResult.warnings);

    // Validate attribute mapping
    const mappingResult = this.validateAttributeMapping(recipe);
    errors.push(...mappingResult.errors);
    warnings.push(...mappingResult.warnings);

    // Validate performance
    const performanceResult = this.validatePerformance(recipe);
    warnings.push(...performanceResult.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if recipe has variation selectors
   */
  private hasVariationSelectors(recipe: RecipeConfig): boolean {
    return !!(recipe.selectors.variations &&
      ((Array.isArray(recipe.selectors.variations) && recipe.selectors.variations.length > 0) ||
       (typeof recipe.selectors.variations === 'string' && recipe.selectors.variations.trim() !== '')));
  }

  /**
   * Check if recipe has attribute selectors
   */
  private hasAttributeSelectors(recipe: RecipeConfig): boolean {
    return !!(recipe.selectors.attributes &&
      ((Array.isArray(recipe.selectors.attributes) && recipe.selectors.attributes.length > 0) ||
       (typeof recipe.selectors.attributes === 'string' && recipe.selectors.attributes.trim() !== '')));
  }

  /**
   * Validate variation selectors
   */
  private validateVariationSelectors(recipe: RecipeConfig): {
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    if (!recipe.selectors.variations) {
      errors.push({
        code: 'MISSING_VARIATION_SELECTORS',
        message: 'Variation selectors are required for variable products',
        field: 'selectors.variations',
        suggestion: 'Add variation selectors like .variations or .product-variations',
        severity: 'error',
        category: 'variation',
      });
      return { errors, warnings };
    }

    const variationSelectors = Array.isArray(recipe.selectors.variations)
      ? recipe.selectors.variations
      : [recipe.selectors.variations];

    // Check if selectors match recommended patterns
    const hasRecommendedSelectors = variationSelectors.some(selector =>
      this.rules.requiredSelectors.variationContainer.some(pattern =>
        selector.includes(pattern) || this.matchesPattern(selector, pattern),
      ),
    );

    if (!hasRecommendedSelectors) {
      warnings.push({
        code: 'NON_STANDARD_VARIATION_SELECTORS',
        message: 'Variation selectors do not match WooCommerce patterns',
        field: 'selectors.variations',
        suggestion: `Consider using: ${this.rules.requiredSelectors.variationContainer.join(', ')}`,
        category: 'best-practice',
      });
    }

    // Check selector count
    if (variationSelectors.length > this.rules.performanceRules.maxVariationSelectors) {
      warnings.push({
        code: 'TOO_MANY_VARIATION_SELECTORS',
        message: `Too many variation selectors (${variationSelectors.length})`,
        field: 'selectors.variations',
        suggestion: `Consider reducing to ${this.rules.performanceRules.maxVariationSelectors} or fewer`,
        category: 'performance',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate attribute selectors
   */
  private validateAttributeSelectors(recipe: RecipeConfig): {
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    if (!recipe.selectors.attributes) {
      errors.push({
        code: 'MISSING_ATTRIBUTE_SELECTORS',
        message: 'Attribute selectors are required for variable products',
        field: 'selectors.attributes',
        suggestion: 'Add attribute selectors like .product-attributes or .attributes',
        severity: 'error',
        category: 'variation',
      });
      return { errors, warnings };
    }

    const attributeSelectors = Array.isArray(recipe.selectors.attributes)
      ? recipe.selectors.attributes
      : [recipe.selectors.attributes];

    // Check if selectors match recommended patterns
    const hasRecommendedSelectors = attributeSelectors.some(selector =>
      this.rules.requiredSelectors.attributeSelectors.some(pattern =>
        selector.includes(pattern) || this.matchesPattern(selector, pattern),
      ),
    );

    if (!hasRecommendedSelectors) {
      warnings.push({
        code: 'NON_STANDARD_ATTRIBUTE_SELECTORS',
        message: 'Attribute selectors do not match WooCommerce patterns',
        field: 'selectors.attributes',
        suggestion: `Consider using: ${this.rules.requiredSelectors.attributeSelectors.join(', ')}`,
        category: 'best-practice',
      });
    }

    // Check selector count
    if (attributeSelectors.length > this.rules.performanceRules.maxAttributeSelectors) {
      warnings.push({
        code: 'TOO_MANY_ATTRIBUTE_SELECTORS',
        message: `Too many attribute selectors (${attributeSelectors.length})`,
        field: 'selectors.attributes',
        suggestion: `Consider reducing to ${this.rules.performanceRules.maxAttributeSelectors} or fewer`,
        category: 'performance',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate variation form selectors
   */
  private validateVariationFormSelectors(recipe: RecipeConfig): {
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    // Check if recipe has variation form selectors in behavior or other fields
    const hasFormSelectors = this.hasVariationFormSelectors(recipe);

    if (!hasFormSelectors) {
      warnings.push({
        code: 'MISSING_VARIATION_FORM_SELECTORS',
        message: 'Variation form selectors are recommended for better variation detection',
        field: 'selectors',
        suggestion: `Add form selectors like: ${this.rules.requiredSelectors.variationForm.join(', ')}`,
        category: 'best-practice',
      });
    }

    return { errors, warnings };
  }

  /**
   * Check if recipe has variation form selectors
   */
  private hasVariationFormSelectors(recipe: RecipeConfig): boolean {
    // Check in waitForSelectors
    if (recipe.behavior?.waitForSelectors) {
      const hasFormInWaitFor = recipe.behavior.waitForSelectors.some(selector =>
        this.rules.requiredSelectors.variationForm.some(pattern =>
          selector.includes(pattern) || this.matchesPattern(selector, pattern),
        ),
      );
      if (hasFormInWaitFor) return true;
    }

    // Check in other selector fields
    const allSelectors = this.getAllSelectors(recipe);
    return allSelectors.some(selector =>
      this.rules.requiredSelectors.variationForm.some(pattern =>
        selector.includes(pattern) || this.matchesPattern(selector, pattern),
      ),
    );
  }

  /**
   * Validate attribute mapping
   */
  private validateAttributeMapping(recipe: RecipeConfig): {
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    // Check if transforms have attribute mappings
    if (recipe.transforms?.attributes) {
      const attributeNames = Object.keys(recipe.transforms.attributes);

      if (attributeNames.length === 0) {
        warnings.push({
          code: 'NO_ATTRIBUTE_TRANSFORMS',
          message: 'No attribute transforms defined',
          field: 'transforms.attributes',
          suggestion: 'Define transforms for each attribute to ensure proper data cleaning',
          category: 'best-practice',
        });
      }

      // Check for common attribute names
      const commonAttributes = ['Color', 'Size', 'Material', 'Brand'];
      const hasCommonAttributes = commonAttributes.some(attr =>
        attributeNames.some(name => name.toLowerCase() === attr.toLowerCase()),
      );

      if (!hasCommonAttributes) {
        warnings.push({
          code: 'NO_COMMON_ATTRIBUTES',
          message: 'No common product attributes found in transforms',
          field: 'transforms.attributes',
          suggestion: 'Consider adding common attributes like Color, Size, Material, Brand',
          category: 'best-practice',
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate performance aspects
   */
  private validatePerformance(recipe: RecipeConfig): {
    warnings: WooCommerceValidationWarning[];
  } {
    const warnings: WooCommerceValidationWarning[] = [];

    // Check for complex selectors
    const allSelectors = this.getAllSelectors(recipe);
    const complexSelectors = allSelectors.filter(selector =>
      selector.includes(' ') || selector.includes('>') || selector.includes('+') || selector.includes('~'),
    );

    if (complexSelectors.length > 0) {
      warnings.push({
        code: 'COMPLEX_SELECTORS',
        message: `Found ${complexSelectors.length} complex selectors that may impact performance`,
        field: 'selectors',
        suggestion: 'Consider using simpler selectors for better performance',
        category: 'performance',
      });
    }

    // Check for inefficient selectors
    const inefficientSelectors = allSelectors.filter(selector =>
      selector.includes('*') || selector.includes(':nth-child') || selector.includes(':last-child'),
    );

    if (inefficientSelectors.length > 0) {
      warnings.push({
        code: 'INEFFICIENT_SELECTORS',
        message: `Found ${inefficientSelectors.length} potentially inefficient selectors`,
        field: 'selectors',
        suggestion: 'Avoid wildcard selectors and complex pseudo-selectors for better performance',
        category: 'performance',
      });
    }

    return { warnings };
  }

  /**
   * Get all selectors from recipe
   */
  private getAllSelectors(recipe: RecipeConfig): string[] {
    const selectors: string[] = [];

    // Add all selector values
    Object.values(recipe.selectors).forEach(value => {
      if (typeof value === 'string') {
        selectors.push(value);
      } else if (Array.isArray(value)) {
        selectors.push(...value);
      }
    });

    // Add waitForSelectors
    if (recipe.behavior?.waitForSelectors) {
      selectors.push(...recipe.behavior.waitForSelectors);
    }

    return selectors;
  }

  /**
   * Check if selector matches pattern
   */
  private matchesPattern(selector: string, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(selector);
    } catch {
      return selector.includes(pattern);
    }
  }

  /**
   * Get recommended variation selectors for a site type
   */
  getRecommendedVariationSelectors(siteType: string): string[] {
    const recommendations: Record<string, string[]> = {
      'woocommerce': [
        '.variations',
        '.woocommerce-variations',
        'select[name*="attribute"]',
        '.variation-select',
      ],
      'shopify': [
        '.product-form__variants',
        'select[name*="id"]',
        '.variant-input',
        '.product-options',
      ],
      'magento': [
        '.product-options-wrapper',
        '.swatch-option',
        '.configurable-swatch-list',
        '.product-options',
      ],
      'generic': [
        '.variations',
        '.product-variations',
        '.product-options',
        'select[name*="attribute"]',
      ],
    };

    return recommendations[siteType.toLowerCase()] || recommendations['generic'];
  }

  /**
   * Get recommended attribute selectors for a site type
   */
  getRecommendedAttributeSelectors(siteType: string): string[] {
    const recommendations: Record<string, string[]> = {
      'woocommerce': [
        '.product-attributes',
        '.woocommerce-product-attributes',
        '.product-attributes-table',
        '.attributes',
      ],
      'shopify': [
        '.product-single__description',
        '.product-description',
        '.product-details',
        '.product-info',
      ],
      'magento': [
        '.product-attributes',
        '.product-attribute',
        '.additional-attributes',
        '.product-details',
      ],
      'generic': [
        '.product-attributes',
        '.attributes',
        '.product-options',
        '.product-details',
      ],
    };

    return recommendations[siteType.toLowerCase()] || recommendations['generic'];
  }
}
