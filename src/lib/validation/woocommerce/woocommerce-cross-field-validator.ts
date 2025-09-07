import { RecipeConfig, WooCommerceValidationError, WooCommerceValidationWarning } from '../../domain/types';

export interface CrossFieldValidationResult {
  isValid: boolean;
  errors: WooCommerceValidationError[];
  warnings: WooCommerceValidationWarning[];
}

export class WooCommerceCrossFieldValidator {
  /**
   * Validate relationships between fields in a recipe
   */
  validateCrossFieldRelationships(recipe: RecipeConfig): CrossFieldValidationResult {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    // Validate variation-attribute relationships
    this.validateVariationAttributeConsistency(recipe, errors, warnings);

    // Validate selector consistency
    this.validateSelectorConsistency(recipe, errors, warnings);

    // Validate transform-selector mapping
    this.validateTransformSelectorMapping(recipe, errors, warnings);

    // Validate required field dependencies
    this.validateRequiredFieldDependencies(recipe, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate that variations have corresponding attributes
   */
  private validateVariationAttributeConsistency(
    recipe: RecipeConfig,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    const hasVariations = recipe.selectors.variations &&
      (Array.isArray(recipe.selectors.variations) ? recipe.selectors.variations.length > 0 : recipe.selectors.variations !== '');

    const hasAttributes = recipe.selectors.attributes &&
      (Array.isArray(recipe.selectors.attributes) ? recipe.selectors.attributes.length > 0 : recipe.selectors.attributes !== '');

    const hasAttributeTransforms = recipe.transforms?.attributes &&
      Object.keys(recipe.transforms.attributes).length > 0;

    if (hasVariations && !hasAttributes) {
      errors.push({
        code: 'MISSING_ATTRIBUTES_FOR_VARIATIONS',
        message: 'Recipe has variation selectors but no attribute selectors',
        field: 'selectors.attributes',
        category: 'required',
        suggestion: 'Add attribute selectors when using variations for proper WooCommerce compatibility',
        severity: 'error',
      });
    }

    if (hasVariations && !hasAttributeTransforms) {
      warnings.push({
        code: 'MISSING_ATTRIBUTE_TRANSFORMS_FOR_VARIATIONS',
        message: 'Recipe has variations but no attribute transforms defined',
        field: 'transforms.attributes',
        category: 'best-practice',
        suggestion: 'Define attribute transforms to properly map variation data',
      });
    }

    if (hasAttributes && !hasVariations) {
      warnings.push({
        code: 'ATTRIBUTES_WITHOUT_VARIATIONS',
        message: 'Recipe has attribute selectors but no variation selectors',
        field: 'selectors.variations',
        category: 'best-practice',
        suggestion: 'Consider adding variation selectors if this is a variable product',
      });
    }
  }

  /**
   * Validate consistency between different selector types
   */
  private validateSelectorConsistency(
    recipe: RecipeConfig,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    const selectors = recipe.selectors;

    // Check for conflicting selectors
    this.checkConflictingSelectors(selectors, errors, warnings);

    // Check for redundant selectors
    this.checkRedundantSelectors(selectors, warnings);

    // Check for missing complementary selectors
    this.checkMissingComplementarySelectors(selectors, warnings);
  }

  /**
   * Check for conflicting selectors that might interfere with each other
   */
  private checkConflictingSelectors(
    selectors: RecipeConfig['selectors'],
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    const selectorValues = Object.values(selectors).filter(value =>
      value && (typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) && value.length > 0),
    ) as (string | string[])[];

    // Check for overlapping selectors
    for (let i = 0; i < selectorValues.length; i++) {
      for (let j = i + 1; j < selectorValues.length; j++) {
        const selector1 = Array.isArray(selectorValues[i]) ? selectorValues[i][0] : selectorValues[i] as string;
        const selector2 = Array.isArray(selectorValues[j]) ? selectorValues[j][0] : selectorValues[j] as string;

        if (this.selectorsOverlap(selector1, selector2)) {
          warnings.push({
            code: 'OVERLAPPING_SELECTORS',
            message: `Selectors may overlap: "${selector1}" and "${selector2}"`,
            field: 'selectors',
            category: 'best-practice',
            suggestion: 'Review selectors to ensure they target distinct elements',
          });
        }
      }
    }
  }

  /**
   * Check for redundant selectors
   */
  private checkRedundantSelectors(
    selectors: RecipeConfig['selectors'],
    warnings: WooCommerceValidationWarning[],
  ): void {
    const selectorMap = new Map<string, string[]>();

    Object.entries(selectors).forEach(([key, value]) => {
      if (value) {
        const selectorList = Array.isArray(value) ? value : [value];
        selectorList.forEach(selector => {
          if (typeof selector === 'string' && selector.trim()) {
            const normalized = this.normalizeSelector(selector);
            if (!selectorMap.has(normalized)) {
              selectorMap.set(normalized, []);
            }
            selectorMap.get(normalized)!.push(key);
          }
        });
      }
    });

    // Find selectors used in multiple fields
    selectorMap.forEach((fields, selector) => {
      if (fields.length > 1) {
        warnings.push({
          code: 'REDUNDANT_SELECTORS',
          message: `Selector "${selector}" is used in multiple fields: ${fields.join(', ')}`,
          field: 'selectors',
          category: 'best-practice',
          suggestion: 'Consider using more specific selectors for each field',
        });
      }
    });
  }

  /**
   * Check for missing complementary selectors
   */
  private checkMissingComplementarySelectors(
    selectors: RecipeConfig['selectors'],
    warnings: WooCommerceValidationWarning[],
  ): void {
    // If has product links, should have title for context
    if (selectors.productLinks && !selectors.title) {
      warnings.push({
        code: 'MISSING_COMPLEMENTARY_SELECTOR',
        message: 'Product links selector present but no title selector',
        field: 'selectors.title',
        category: 'best-practice',
        suggestion: 'Add title selector to provide context for product links',
      });
    }

    // If has images, should have title for alt text context
    if (selectors.images && !selectors.title) {
      warnings.push({
        code: 'MISSING_COMPLEMENTARY_SELECTOR',
        message: 'Images selector present but no title selector',
        field: 'selectors.title',
        category: 'best-practice',
        suggestion: 'Add title selector to provide context for image alt text',
      });
    }
  }

  /**
   * Validate that transforms match their corresponding selectors
   */
  private validateTransformSelectorMapping(
    recipe: RecipeConfig,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    if (!recipe.transforms) return;

    // Check attribute transforms
    if (recipe.transforms.attributes) {
      const attributeNames = Object.keys(recipe.transforms.attributes);
      const hasAttributeSelectors = recipe.selectors.attributes &&
        (Array.isArray(recipe.selectors.attributes) ? recipe.selectors.attributes.length > 0 : recipe.selectors.attributes !== '');

      if (attributeNames.length > 0 && !hasAttributeSelectors) {
        errors.push({
          code: 'MISSING_ATTRIBUTE_SELECTORS_FOR_TRANSFORMS',
          message: 'Attribute transforms defined but no attribute selectors',
          field: 'selectors.attributes',
          category: 'required',
          suggestion: 'Add attribute selectors to match the defined transforms',
          severity: 'error',
        });
      }
    }

    // Check price transforms
    if (recipe.transforms.price && !recipe.selectors.price) {
      warnings.push({
        code: 'MISSING_PRICE_SELECTOR_FOR_TRANSFORMS',
        message: 'Price transforms defined but no price selector',
        field: 'selectors.price',
        category: 'best-practice',
        suggestion: 'Add price selector to apply the defined transforms',
      });
    }
  }

  /**
   * Validate required field dependencies
   */
  private validateRequiredFieldDependencies(
    recipe: RecipeConfig,
    errors: WooCommerceValidationError[],
    warnings: WooCommerceValidationWarning[],
  ): void {
    // If has variations, should have proper variation form selectors
    if (recipe.selectors.variations) {
      const hasVariationFormSelectors = this.hasVariationFormSelectors(recipe);
      if (!hasVariationFormSelectors) {
        warnings.push({
          code: 'MISSING_VARIATION_FORM_SELECTORS',
          message: 'Variation selectors present but no variation form selectors',
          field: 'behavior.waitForSelectors',
          category: 'best-practice',
          suggestion: 'Add variation form selectors for better variation detection',
        });
      }
    }

    // If has stock selector, should have price for complete product info
    if (recipe.selectors.stock && !recipe.selectors.price) {
      warnings.push({
        code: 'MISSING_PRICE_FOR_STOCK',
        message: 'Stock selector present but no price selector',
        field: 'selectors.price',
        category: 'best-practice',
        suggestion: 'Add price selector for complete product information',
      });
    }
  }

  /**
   * Check if selectors overlap
   */
  private selectorsOverlap(selector1: string, selector2: string): boolean {
    // Simple overlap detection - can be enhanced
    const s1 = selector1.trim();
    const s2 = selector2.trim();

    if (s1 === s2) return true;

    // Check if one selector is contained in another (but not just common prefixes)
    if (s1.includes(s2) && s2.length > 3) return true;
    if (s2.includes(s1) && s1.length > 3) return true;

    // Only check for exact matches or very specific overlaps
    return false;
  }

  /**
   * Normalize selector for comparison
   */
  private normalizeSelector(selector: string): string {
    return selector.trim().replace(/\s+/g, ' ');
  }

  /**
   * Check if recipe has variation form selectors
   */
  private hasVariationFormSelectors(recipe: RecipeConfig): boolean {
    const formSelectors = [
      '.variations_form',
      '.woocommerce-variations-form',
      '.variation-form',
      '.product-variation-form',
      'form.variations',
    ];

    const allSelectors = this.getAllSelectors(recipe);
    return formSelectors.some(formSelector =>
      allSelectors.some(selector => selector.includes(formSelector)),
    );
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
