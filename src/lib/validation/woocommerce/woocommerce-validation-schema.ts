import {
  WooCommerceValidationConfig,
  WooCommerceAttributeNamingRules,
  WooCommerceVariationDetectionRules,
  RecipeConfig,
} from '../../domain/types';

/**
 * Default WooCommerce validation configuration
 * This defines the standard validation rules for WooCommerce-compliant recipes
 */
export const DEFAULT_WOOCOMMERCE_VALIDATION_CONFIG: WooCommerceValidationConfig = {
  // Required selectors validation
  requiredSelectors: {
    title: true,
    price: true,
    images: true,
    sku: true,
    description: true,
  },

  // Attribute naming validation
  attributeNaming: {
    enforceCapitalization: true,
    allowSpecialCharacters: false,
    reservedNames: [
      'pa_color',
      'pa_size',
      'pa_material',
      'pa_brand',
      'pa_weight',
      'pa_dimensions',
      'pa_sku',
      'pa_price',
      'pa_stock',
      'pa_category',
      'pa_tag',
      'pa_feature',
      'pa_specification',
    ],
    customPattern: '^[A-Z][a-zA-Z0-9]*$', // PascalCase pattern
  },

  // Variation detection validation
  variationDetection: {
    requireVariationSelectors: true,
    requireAttributeSelectors: true,
    requireVariationFormSelectors: true,
    validateAttributeMapping: true,
  },

  // Price format validation
  priceFormat: {
    pattern: '^\\d+(\\.\\d{2})?$', // Standard price format
    allowCurrencySymbols: false,
    requireDecimalPlaces: true,
  },

  // SKU format validation
  skuFormat: {
    pattern: '^[A-Za-z0-9-_]+$',
    requireUniqueness: true,
    minLength: 3,
    maxLength: 50,
  },

  // Cross-field validation
  crossFieldValidation: {
    validateVariationAttributeMapping: true,
    validatePriceConsistency: true,
    validateImageConsistency: true,
  },
};

/**
 * WooCommerce attribute naming rules
 * Defines the specific rules for attribute naming in WooCommerce
 */
export const WOOCOMMERCE_ATTRIBUTE_NAMING_RULES: WooCommerceAttributeNamingRules = {
  // Reserved WooCommerce attribute names
  reservedNames: [
    'pa_color',
    'pa_size',
    'pa_material',
    'pa_brand',
    'pa_weight',
    'pa_dimensions',
    'pa_sku',
    'pa_price',
    'pa_stock',
    'pa_category',
    'pa_tag',
    'pa_feature',
    'pa_specification',
    'pa_condition',
    'pa_style',
    'pa_gender',
    'pa_age_group',
    'pa_color_family',
    'pa_pattern',
    'pa_fabric',
    'pa_care_instructions',
    'pa_origin',
    'pa_warranty',
    'pa_shipping_class',
    'pa_tax_class',
  ],

  // Valid pattern for attribute names (PascalCase)
  validPattern: /^[A-Z][a-zA-Z0-9]*$/,

  // Capitalization rules
  capitalizationRules: {
    enforceCapitalization: true,
    allowedFormats: ['PascalCase'],
  },

  // Special character rules
  specialCharacterRules: {
    allowedCharacters: ['A-Z', 'a-z', '0-9'],
    forbiddenCharacters: [' ', '-', '_', '.', ',', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '[', ']', '{', '}', '|', '\\', ':', ';', '"', '\'', '<', '>', '?', '/'],
    allowSpaces: false,
  },
};

/**
 * WooCommerce variation detection rules
 * Defines the rules for proper variation detection in WooCommerce
 */
export const WOOCOMMERCE_VARIATION_DETECTION_RULES: WooCommerceVariationDetectionRules = {
  // Required selectors for variation detection
  requiredSelectors: {
    variationContainer: [
      '.variations',
      '.product-variations',
      '.woocommerce-variations',
      '.variation-selector',
      '.product-options',
      '.variation-options',
    ],
    variationForm: [
      '.variations_form',
      '.woocommerce-variations-form',
      '.variation-form',
      '.product-variation-form',
      'form.variations',
    ],
    attributeSelectors: [
      'select[name*="attribute"]',
      'input[name*="attribute"]',
      '.variation-select',
      '.attribute-select',
      '.product-attribute-select',
    ],
  },

  // Validation rules for variation-to-attribute mapping
  attributeMappingRules: {
    requireAllVariationsHaveAttributes: true,
    requireAllAttributesHaveVariations: true,
    validateAttributeValueConsistency: true,
  },

  // Performance rules for variation detection
  performanceRules: {
    maxVariationSelectors: 10,
    maxAttributeSelectors: 20,
    requireEfficientSelectors: true,
  },
};

/**
 * WooCommerce validation schema factory
 * Creates validation configurations for different WooCommerce compliance levels
 */
export class WooCommerceValidationSchema {
  /**
   * Get strict WooCommerce validation configuration
   * Enforces all WooCommerce best practices
   */
  static getStrictConfig(): WooCommerceValidationConfig {
    return {
      ...DEFAULT_WOOCOMMERCE_VALIDATION_CONFIG,
      requiredSelectors: {
        title: true,
        price: true,
        images: true,
        sku: true,
        description: true,
      },
      attributeNaming: {
        enforceCapitalization: true,
        allowSpecialCharacters: false,
        reservedNames: WOOCOMMERCE_ATTRIBUTE_NAMING_RULES.reservedNames,
        customPattern: WOOCOMMERCE_ATTRIBUTE_NAMING_RULES.validPattern.source,
      },
      variationDetection: {
        requireVariationSelectors: true,
        requireAttributeSelectors: true,
        requireVariationFormSelectors: true,
        validateAttributeMapping: true,
      },
      priceFormat: {
        pattern: '^\\d+(\\.\\d{2})?$',
        allowCurrencySymbols: false,
        requireDecimalPlaces: true,
      },
      skuFormat: {
        pattern: '^[A-Za-z0-9-_]+$',
        requireUniqueness: true,
        minLength: 3,
        maxLength: 50,
      },
      crossFieldValidation: {
        validateVariationAttributeMapping: true,
        validatePriceConsistency: true,
        validateImageConsistency: true,
      },
    };
  }

  /**
   * Get relaxed WooCommerce validation configuration
   * Allows some flexibility while maintaining core compliance
   */
  static getRelaxedConfig(): WooCommerceValidationConfig {
    return {
      ...DEFAULT_WOOCOMMERCE_VALIDATION_CONFIG,
      requiredSelectors: {
        title: true,
        price: true,
        images: false, // Allow missing images
        sku: false, // Allow missing SKU
        description: true,
      },
      attributeNaming: {
        enforceCapitalization: false, // Allow lowercase
        allowSpecialCharacters: true, // Allow some special characters
        reservedNames: WOOCOMMERCE_ATTRIBUTE_NAMING_RULES.reservedNames,
        customPattern: '^[a-zA-Z0-9-_]+$', // More flexible pattern
      },
      variationDetection: {
        requireVariationSelectors: false, // Not required for simple products
        requireAttributeSelectors: false,
        requireVariationFormSelectors: false,
        validateAttributeMapping: false,
      },
      priceFormat: {
        pattern: '^\\d+(\\.\\d{1,2})?$', // Allow 1 or 2 decimal places
        allowCurrencySymbols: true, // Allow currency symbols
        requireDecimalPlaces: false,
      },
      skuFormat: {
        pattern: '^[A-Za-z0-9-_]+$',
        requireUniqueness: false,
        minLength: 1,
        maxLength: 100,
      },
      crossFieldValidation: {
        validateVariationAttributeMapping: false,
        validatePriceConsistency: false,
        validateImageConsistency: false,
      },
    };
  }

  /**
   * Get custom WooCommerce validation configuration
   * Allows customization of specific validation rules
   */
  static getCustomConfig(overrides: Partial<WooCommerceValidationConfig>): WooCommerceValidationConfig {
    return {
      ...DEFAULT_WOOCOMMERCE_VALIDATION_CONFIG,
      ...overrides,
    };
  }

  /**
   * Get validation configuration for a specific recipe
   * Analyzes the recipe and returns appropriate validation config
   */
  static getConfigForRecipe(recipe: RecipeConfig): WooCommerceValidationConfig {
    const hasVariations = recipe.selectors.variations &&
      ((Array.isArray(recipe.selectors.variations) && recipe.selectors.variations.length > 0) ||
       (typeof recipe.selectors.variations === 'string' && recipe.selectors.variations.trim() !== ''));

    const hasAttributes = recipe.selectors.attributes &&
      ((Array.isArray(recipe.selectors.attributes) && recipe.selectors.attributes.length > 0) ||
       (typeof recipe.selectors.attributes === 'string' && recipe.selectors.attributes.trim() !== ''));

    // If recipe has variations, use strict validation
    if (hasVariations || hasAttributes) {
      return this.getStrictConfig();
    }

    // For simple products, use relaxed validation
    return this.getRelaxedConfig();
  }

  /**
   * Validate attribute name against WooCommerce rules
   */
  static validateAttributeName(attributeName: string): {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Check if name is reserved
    if (WOOCOMMERCE_ATTRIBUTE_NAMING_RULES.reservedNames.includes(attributeName.toLowerCase())) {
      errors.push(`Attribute name '${attributeName}' is reserved in WooCommerce`);
      suggestions.push(`Use a different name like 'Product${attributeName}' or 'Custom${attributeName}'`);
    }

    // Check capitalization
    if (!WOOCOMMERCE_ATTRIBUTE_NAMING_RULES.validPattern.test(attributeName)) {
      errors.push(`Attribute name '${attributeName}' must be in PascalCase (e.g., 'Color', 'Size')`);
      suggestions.push(`Convert to PascalCase: '${this.toPascalCase(attributeName)}'`);
    }

    // Check for special characters
    const hasSpecialChars = /[^A-Za-z0-9]/.test(attributeName);
    if (hasSpecialChars) {
      errors.push(`Attribute name '${attributeName}' contains special characters`);
      suggestions.push(`Remove special characters: '${attributeName.replace(/[^A-Za-z0-9]/g, '')}'`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  /**
   * Convert string to PascalCase
   */
  private static toPascalCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .replace(/[^a-zA-Z0-9\s]/g, ' ') // Replace special chars with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Get validation rules for a specific field
   */
  static getFieldValidationRules(field: keyof RecipeConfig['selectors']): {
    required: boolean;
    patterns: string[];
    suggestions: string[];
  } {
    const rules: Record<string, {
      required: boolean;
      patterns: string[];
      suggestions: string[];
    }> = {
      title: {
        required: true,
        patterns: ['h1', '.product-title', '.product-name'],
        suggestions: ['Use semantic HTML selectors like h1, .product-title'],
      },
      price: {
        required: true,
        patterns: ['.price', '.product-price', '[data-price]'],
        suggestions: ['Use .price or .product-price selectors for better compatibility'],
      },
      images: {
        required: true,
        patterns: ['.product-gallery img', '.product-images img', 'img[src*="product"]'],
        suggestions: ['Use specific image selectors to avoid capturing navigation images'],
      },
      sku: {
        required: false,
        patterns: ['.sku', '.product-sku', '[data-sku]'],
        suggestions: ['SKU is recommended for product identification'],
      },
      description: {
        required: true,
        patterns: ['.product-description', '.description', '.product-details'],
        suggestions: ['Use .product-description for better content extraction'],
      },
      stock: {
        required: false,
        patterns: ['.stock', '.availability', '.in-stock', '.out-of-stock'],
        suggestions: ['Use .stock or .availability for stock status'],
      },
      category: {
        required: false,
        patterns: ['.breadcrumb', '.category', '.product-category'],
        suggestions: ['Use .breadcrumb or .category for product categorization'],
      },
      productLinks: {
        required: true,
        patterns: ['.product-item a', '.product-card a', 'a[href*="/product/"]'],
        suggestions: ['Use .product-item a or .product-card a for product discovery'],
      },
      variations: {
        required: false,
        patterns: ['.variations', '.product-variations', 'select[name*="attribute"]'],
        suggestions: ['Use .variations or select[name*="attribute"] for variation detection'],
      },
      attributes: {
        required: false,
        patterns: ['.product-attributes', '.attributes', '.product-options'],
        suggestions: ['Use .product-attributes for attribute extraction'],
      },
      embeddedJson: {
        required: false,
        patterns: ['script[type="application/ld+json"]', 'script[data-json]'],
        suggestions: ['Use script[type="application/ld+json"] for structured data'],
      },
      apiEndpoints: {
        required: false,
        patterns: ['/api/products', '/api/v1/products'],
        suggestions: ['Use REST API endpoints for product data'],
      },
    };

    return rules[field] || {
      required: false,
      patterns: [],
      suggestions: [],
    };
  }
}
