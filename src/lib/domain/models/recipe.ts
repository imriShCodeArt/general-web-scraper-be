/**
 * Recipe Domain Models
 *
 * This file contains all recipe-related domain models and types.
 * It represents the configuration and validation rules for web scraping recipes.
 */

// Enhanced Recipe Configuration with Validation
export interface RecipeConfig {
  // Basic site information
  name: string;
  description?: string;
  version: string;
  siteUrl: string;

  // Selectors for data extraction
  selectors: {
    // Core product fields
    title: string | string[];
    price: string | string[];
    images: string | string[];
    stock: string | string[];
    sku: string | string[];
    description: string | string[];
    descriptionFallbacks?: string[];
    shortDescription?: string | string[];
    category?: string | string[];

    // Product discovery
    productLinks: string | string[];
    pagination?: {
      nextPage: string;
      maxPages?: number;
    };

    // Attributes and variations
    attributes: string | string[];
    variations?: string | string[];

    // Embedded data sources
    embeddedJson?: string[];
    apiEndpoints?: string[];
  };

  // Text transformations and cleaning
  transforms?: {
    title?: string[];
    price?: string[];
    description?: string[];
    attributes?: Record<string, string[]>;
    category?: string[];
  };

  // Site-specific behavior
  behavior?: {
    waitForSelectors?: string[];
    scrollToLoad?: boolean;
    useHeadlessBrowser?: boolean;
    rateLimit?: number; // ms between requests
    maxConcurrent?: number;
    retryAttempts?: number;
    retryDelay?: number;
    timeout?: number;
    // Performance optimizations
    fastMode?: boolean; // Enable fast mode for better performance
    skipImages?: boolean; // Skip image processing for speed
    skipStyles?: boolean; // Skip CSS processing for speed
    skipScripts?: boolean; // Skip JavaScript processing for speed
  };

  // Fallback strategies
  fallbacks?: {
    title?: string[];
    price?: string[];
    images?: string[];
    stock?: string[];
    sku?: string[];
    description?: string[];
    shortDescription?: string[];
    category?: string[];
  };

  // Validation rules
  validation?: {
    requiredFields?: string[];
    priceFormat?: string; // regex pattern
    skuFormat?: string; // regex pattern
    minDescriptionLength?: number;
    maxTitleLength?: number;
  };

  // WooCommerce-specific validation
  woocommerceValidation?: WooCommerceValidationConfig;
}

// Recipe file structure
export interface RecipeFile {
  recipes: RecipeConfig[];
  globalSettings?: {
    defaultRateLimit?: number;
    defaultMaxConcurrent?: number;
    userAgents?: string[];
  };
}

// Recipe loading and management
export interface RecipeLoader {
  loadRecipe(recipeName: string): Promise<RecipeConfig>;
  loadRecipeFromFile(filePath: string): Promise<RecipeConfig>;
  loadRecipeFromUrl(url: string): Promise<RecipeConfig>;
  listAvailableRecipes(): Promise<string[]>;
  validateRecipe(recipe: RecipeConfig): boolean;
}

// WooCommerce Recipe Validation Types
export interface WooCommerceValidationConfig {
  // Required selectors validation
  requiredSelectors?: {
    title?: boolean;
    price?: boolean;
    images?: boolean;
    sku?: boolean;
    description?: boolean;
  };

  // Attribute naming validation
  attributeNaming?: {
    enforceCapitalization?: boolean;
    allowSpecialCharacters?: boolean;
    reservedNames?: string[];
    customPattern?: string; // regex pattern
  };

  // Variation detection validation
  variationDetection?: {
    requireVariationSelectors?: boolean;
    requireAttributeSelectors?: boolean;
    requireVariationFormSelectors?: boolean;
    validateAttributeMapping?: boolean;
  };

  // Price format validation
  priceFormat?: {
    pattern?: string; // regex pattern
    allowCurrencySymbols?: boolean;
    requireDecimalPlaces?: boolean;
  };

  // SKU format validation
  skuFormat?: {
    pattern?: string; // regex pattern
    requireUniqueness?: boolean;
    minLength?: number;
    maxLength?: number;
  };

  // Cross-field validation
  crossFieldValidation?: {
    validateVariationAttributeMapping?: boolean;
    validatePriceConsistency?: boolean;
    validateImageConsistency?: boolean;
  };
}

// WooCommerce Validation Result Types
export interface WooCommerceValidationResult {
  isValid: boolean;
  errors: WooCommerceValidationError[];
  warnings: WooCommerceValidationWarning[];
  score: number; // 0-100 compliance score
  timestamp: Date;
}

export interface WooCommerceValidationError {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
  category: 'required' | 'naming' | 'variation' | 'format' | 'consistency';
}

export interface WooCommerceValidationWarning {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
  category: 'performance' | 'best-practice' | 'deprecation';
}

// WooCommerce Attribute Naming Rules
export interface WooCommerceAttributeNamingRules {
  // Reserved WooCommerce attribute names that should not be used
  reservedNames: string[];

  // Pattern for valid attribute names
  validPattern: RegExp;

  // Required capitalization rules
  capitalizationRules: {
    enforceCapitalization: boolean;
    allowedFormats: ('PascalCase' | 'camelCase' | 'snake_case')[];
  };

  // Special character rules
  specialCharacterRules: {
    allowedCharacters: string[];
    forbiddenCharacters: string[];
    allowSpaces: boolean;
  };
}

// WooCommerce Variation Detection Rules
export interface WooCommerceVariationDetectionRules {
  // Required selectors for variation detection
  requiredSelectors: {
    variationContainer: string[];
    variationForm: string[];
    attributeSelectors: string[];
  };

  // Validation rules for variation-to-attribute mapping
  attributeMappingRules: {
    requireAllVariationsHaveAttributes: boolean;
    requireAllAttributesHaveVariations: boolean;
    validateAttributeValueConsistency: boolean;
  };

  // Performance rules for variation detection
  performanceRules: {
    maxVariationSelectors: number;
    maxAttributeSelectors: number;
    requireEfficientSelectors: boolean;
  };
}
