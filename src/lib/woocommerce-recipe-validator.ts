import {
  RecipeConfig,
  WooCommerceValidationResult,
  WooCommerceValidationError,
  WooCommerceValidationWarning,
  WooCommerceValidationConfig,
} from '../types';
import { WooCommerceValidationSchema } from './woocommerce-validation-schema';
import { WooCommerceAttributeValidator } from './woocommerce-attribute-validator';
import { WooCommerceVariationValidator } from './woocommerce-variation-validator';
import { WooCommerceCrossFieldValidator } from './woocommerce-cross-field-validator';
import { WooCommercePerformanceValidator } from './woocommerce-performance-validator';
import { WooCommerceAdvancedFeatureValidator } from './woocommerce-advanced-feature-validator';

/**
 * Main WooCommerce Recipe Validator
 * Orchestrates all validation rules and provides comprehensive recipe validation
 */
export class WooCommerceRecipeValidator {
  private attributeValidator: WooCommerceAttributeValidator;
  private variationValidator: WooCommerceVariationValidator;
  private crossFieldValidator: WooCommerceCrossFieldValidator;
  private performanceValidator: WooCommercePerformanceValidator;
  private advancedFeatureValidator: WooCommerceAdvancedFeatureValidator;
  private validationConfig: WooCommerceValidationConfig;

  constructor(validationConfig?: WooCommerceValidationConfig) {
    this.attributeValidator = new WooCommerceAttributeValidator();
    this.variationValidator = new WooCommerceVariationValidator();
    this.crossFieldValidator = new WooCommerceCrossFieldValidator();
    this.performanceValidator = new WooCommercePerformanceValidator();
    this.advancedFeatureValidator = new WooCommerceAdvancedFeatureValidator();
    this.validationConfig = validationConfig || WooCommerceValidationSchema.getStrictConfig();
  }

  /**
   * Validate a complete recipe for WooCommerce compliance
   */
  validateRecipe(recipe: RecipeConfig): WooCommerceValidationResult {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    try {
      // 1. Validate required selectors
      const requiredSelectorResult = this.validateRequiredSelectors(recipe);
      errors.push(...requiredSelectorResult.errors);
      warnings.push(...requiredSelectorResult.warnings);

      // 2. Validate attribute naming
      const attributeResult = this.validateAttributeNaming(recipe);
      errors.push(...attributeResult.errors);
      warnings.push(...attributeResult.warnings);

      // 3. Validate variation detection
      const variationResult = this.variationValidator.validateVariationDetection(recipe);
      errors.push(...variationResult.errors);
      warnings.push(...variationResult.warnings);

      // 4. Validate price format
      const priceResult = this.validatePriceFormat(recipe);
      errors.push(...priceResult.errors);
      warnings.push(...priceResult.warnings);

      // 5. Validate SKU format
      const skuResult = this.validateSkuFormat(recipe);
      errors.push(...skuResult.errors);
      warnings.push(...skuResult.warnings);

      // 6. Validate cross-field consistency
      const crossFieldResult = this.validateCrossFieldConsistency(recipe);
      errors.push(...crossFieldResult.errors);
      warnings.push(...crossFieldResult.warnings);

      // 7. Validate performance aspects
      const performanceResult = this.validatePerformance(recipe);
      warnings.push(...performanceResult.warnings);

      // 8. Validate advanced WooCommerce features
      const advancedFeatureResult = this.validateAdvancedFeatures(recipe);
      errors.push(...advancedFeatureResult.errors);
      warnings.push(...advancedFeatureResult.warnings);

      // Calculate compliance score
      const score = this.calculateComplianceScore(errors, warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        score,
        timestamp: new Date(),
      };

    } catch (error) {
      // Handle unexpected validation errors
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Unexpected error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        field: 'recipe',
        suggestion: 'Check recipe configuration and try again',
        severity: 'error',
        category: 'consistency',
      });

      return {
        isValid: false,
        errors,
        warnings,
        score: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate required selectors
   */
  private validateRequiredSelectors(recipe: RecipeConfig): {
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    if (!this.validationConfig.requiredSelectors) {
      return { errors, warnings };
    }

    const requiredFields = this.validationConfig.requiredSelectors;
    const selectors = recipe.selectors;

    // Check each required field
    Object.entries(requiredFields).forEach(([field, isRequired]) => {
      if (!isRequired) return;

      const fieldValue = selectors[field as keyof typeof selectors];
      const hasValue = fieldValue &&
        ((Array.isArray(fieldValue) && fieldValue.length > 0) ||
         (typeof fieldValue === 'string' && fieldValue.trim() !== ''));

      if (!hasValue) {
        errors.push({
          code: 'MISSING_REQUIRED_SELECTOR',
          message: `Required selector '${field}' is missing`,
          field: `selectors.${field}`,
          suggestion: this.getSelectorSuggestion(field),
          severity: 'error',
          category: 'required',
        });
      }
    });

    return { errors, warnings };
  }

  /**
   * Validate attribute naming conventions
   */
  private validateAttributeNaming(recipe: RecipeConfig): {
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    if (!recipe.transforms?.attributes) {
      return { errors, warnings };
    }

    const attributeNames = Object.keys(recipe.transforms.attributes);
    const result = this.attributeValidator.validateAttributeNames(attributeNames);

    // Convert attribute validator results to our error format
    result.errors.forEach(error => {
      errors.push({
        code: error.code,
        message: error.message,
        field: error.field || 'transforms.attributes',
        suggestion: error.suggestion,
        severity: 'error',
        category: 'naming',
      });
    });

    result.warnings.forEach(warning => {
      warnings.push({
        code: warning.code,
        message: warning.message,
        field: warning.field || 'transforms.attributes',
        suggestion: warning.suggestion,
        category: 'best-practice',
      });
    });

    return { errors, warnings };
  }

  /**
   * Validate price format
   */
  private validatePriceFormat(recipe: RecipeConfig): {
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    if (!this.validationConfig.priceFormat) {
      return { errors, warnings };
    }

    const priceConfig = this.validationConfig.priceFormat;
    const priceSelectors = recipe.selectors.price;

    if (!priceSelectors) {
      return { errors, warnings };
    }

    // Check if price selectors are specific enough
    const selectors = Array.isArray(priceSelectors) ? priceSelectors : [priceSelectors];
    const hasSpecificSelectors = selectors.some(selector =>
      selector.includes('.amount') ||
      selector.includes('[data-price]') ||
      selector.includes('.price-value'),
    );

    if (!hasSpecificSelectors) {
      warnings.push({
        code: 'GENERIC_PRICE_SELECTORS',
        message: 'Price selectors may be too generic',
        field: 'selectors.price',
        suggestion: 'Use more specific selectors like .price .amount or [data-price]',
        category: 'best-practice',
      });
    }

    // Check price format pattern if provided
    if (priceConfig.pattern) {
      // Note: This would require actual price data to validate,
      // so we'll just validate the selector patterns for now
    }

    return { errors, warnings };
  }

  /**
   * Validate SKU format
   */
  private validateSkuFormat(recipe: RecipeConfig): {
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    if (!this.validationConfig.skuFormat) {
      return { errors, warnings };
    }

    const skuSelectors = recipe.selectors.sku;

    if (!skuSelectors) {
      if (this.validationConfig.requiredSelectors?.sku) {
        errors.push({
          code: 'MISSING_SKU_SELECTORS',
          message: 'SKU selectors are required but not defined',
          field: 'selectors.sku',
          suggestion: 'Add SKU selectors like .sku or [data-sku]',
          severity: 'error',
          category: 'required',
        });
      }
      return { errors, warnings };
    }

    // Check if SKU selectors are specific enough
    const selectors = Array.isArray(skuSelectors) ? skuSelectors : [skuSelectors];
    const hasSpecificSelectors = selectors.some(selector =>
      selector.includes('.sku') ||
      selector.includes('[data-sku]') ||
      selector.includes('.product-code'),
    );

    if (!hasSpecificSelectors) {
      warnings.push({
        code: 'GENERIC_SKU_SELECTORS',
        message: 'SKU selectors may be too generic',
        field: 'selectors.sku',
        suggestion: 'Use more specific selectors like .sku or [data-sku]',
        category: 'best-practice',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate cross-field consistency
   */
  private validateCrossFieldConsistency(recipe: RecipeConfig): {
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    if (!this.validationConfig.crossFieldValidation) {
      return { errors: [], warnings: [] };
    }

    const crossFieldResult = this.crossFieldValidator.validateCrossFieldRelationships(recipe);
    return {
      errors: crossFieldResult.errors,
      warnings: crossFieldResult.warnings,
    };
  }

  /**
   * Validate performance aspects
   */
  private validatePerformance(recipe: RecipeConfig): {
    warnings: WooCommerceValidationWarning[];
  } {
    const performanceResult = this.performanceValidator.validatePerformance(recipe);
    return {
      warnings: performanceResult.warnings,
    };
  }

  /**
   * Validate advanced WooCommerce features
   */
  private validateAdvancedFeatures(recipe: RecipeConfig): {
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const advancedFeatureResult = this.advancedFeatureValidator.validateAdvancedFeatures(recipe);
    return {
      errors: advancedFeatureResult.errors,
      warnings: advancedFeatureResult.warnings,
    };
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
   * Get selector suggestion for a field
   */
  private getSelectorSuggestion(field: string): string {
    const rules = WooCommerceValidationSchema.getFieldValidationRules(field as keyof RecipeConfig['selectors']);
    return rules.suggestions[0] || `Add appropriate selectors for ${field}`;
  }

  /**
   * Calculate compliance score (0-100)
   */
  private calculateComplianceScore(errors: WooCommerceValidationError[], warnings: WooCommerceValidationWarning[]): number {
    const totalIssues = errors.length + warnings.length;
    if (totalIssues === 0) return 100;

    // Weight errors more heavily than warnings; be more forgiving for warnings
    const errorWeight = 3;
    const warningWeight = 0.5;
    const weightedIssues = (errors.length * errorWeight) + (warnings.length * warningWeight);

    // Calculate score based on weighted issues with a wider range before hitting 0
    const maxWeightedIssues = 30;
    let score = Math.max(0, 100 - (weightedIssues / maxWeightedIssues) * 100);

    // Provide a small bonus for being error-free (but keep capped at 100)
    if (errors.length === 0) {
      score = Math.min(100, score + 10);
    }

    return Math.round(score);
  }

  /**
   * Validate multiple recipes
   */
  validateRecipes(recipes: RecipeConfig[]): {
    results: WooCommerceValidationResult[];
    summary: {
      totalRecipes: number;
      validRecipes: number;
      invalidRecipes: number;
      averageScore: number;
      totalErrors: number;
      totalWarnings: number;
    };
  } {
    const results = recipes.map(recipe => this.validateRecipe(recipe));

    const validRecipes = results.filter(result => result.isValid).length;
    const invalidRecipes = results.length - validRecipes;
    const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0);
    const totalWarnings = results.reduce((sum, result) => sum + result.warnings.length, 0);
    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;

    return {
      results,
      summary: {
        totalRecipes: recipes.length,
        validRecipes,
        invalidRecipes,
        averageScore: Math.round(averageScore),
        totalErrors,
        totalWarnings,
      },
    };
  }

  /**
   * Get validation configuration
   */
  getValidationConfig(): WooCommerceValidationConfig {
    return this.validationConfig;
  }

  /**
   * Update validation configuration
   */
  setValidationConfig(config: WooCommerceValidationConfig): void {
    this.validationConfig = config;
  }

  /**
   * Generate validation report
   */
  generateReport(result: WooCommerceValidationResult): string {
    const lines: string[] = [];

    lines.push('=== WooCommerce Recipe Validation Report ===');
    lines.push(`Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
    lines.push(`Compliance Score: ${result.score}/100`);
    lines.push(`Timestamp: ${result.timestamp.toISOString()}`);
    lines.push('');

    if (result.errors.length > 0) {
      lines.push('🚨 ERRORS:');
      result.errors.forEach((error, index) => {
        lines.push(`${index + 1}. [${error.category.toUpperCase()}] ${error.message}`);
        if (error.field) lines.push(`   Field: ${error.field}`);
        if (error.suggestion) lines.push(`   Suggestion: ${error.suggestion}`);
        lines.push('');
      });
    }

    if (result.warnings.length > 0) {
      lines.push('⚠️  WARNINGS:');
      result.warnings.forEach((warning, index) => {
        lines.push(`${index + 1}. [${warning.category.toUpperCase()}] ${warning.message}`);
        if (warning.field) lines.push(`   Field: ${warning.field}`);
        if (warning.suggestion) lines.push(`   Suggestion: ${warning.suggestion}`);
        lines.push('');
      });
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      lines.push('🎉 No issues found! Recipe is fully compliant with WooCommerce standards.');
    }

    return lines.join('\n');
  }
}
