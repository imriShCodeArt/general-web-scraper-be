import { WooCommerceValidationSchema } from '../validation/woocommerce/woocommerce-validation-schema';
import { WooCommerceAttributeValidator } from '../validation/woocommerce/woocommerce-attribute-validator';
import { WooCommerceVariationValidator } from '../validation/woocommerce/woocommerce-variation-validator';
import { RecipeConfig } from '../domain/types';

describe('WooCommerceValidationSchema', () => {
  describe('getStrictConfig', () => {
    it('should return strict validation configuration', () => {
      const config = WooCommerceValidationSchema.getStrictConfig();

      expect(config.requiredSelectors?.title).toBe(true);
      expect(config.requiredSelectors?.price).toBe(true);
      expect(config.requiredSelectors?.images).toBe(true);
      expect(config.requiredSelectors?.sku).toBe(true);
      expect(config.requiredSelectors?.description).toBe(true);

      expect(config.attributeNaming?.enforceCapitalization).toBe(true);
      expect(config.attributeNaming?.allowSpecialCharacters).toBe(false);

      expect(config.variationDetection?.requireVariationSelectors).toBe(true);
      expect(config.variationDetection?.requireAttributeSelectors).toBe(true);
    });
  });

  describe('getRelaxedConfig', () => {
    it('should return relaxed validation configuration', () => {
      const config = WooCommerceValidationSchema.getRelaxedConfig();

      expect(config.requiredSelectors?.images).toBe(false);
      expect(config.requiredSelectors?.sku).toBe(false);

      expect(config.attributeNaming?.enforceCapitalization).toBe(false);
      expect(config.attributeNaming?.allowSpecialCharacters).toBe(true);

      expect(config.variationDetection?.requireVariationSelectors).toBe(false);
    });
  });

  describe('getConfigForRecipe', () => {
    it('should return strict config for recipes with variations', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price',
          images: '.product-images img',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.attributes',
          variations: '.variations',
        },
      };

      const config = WooCommerceValidationSchema.getConfigForRecipe(recipe);
      expect(config.variationDetection?.requireVariationSelectors).toBe(true);
    });

    it('should return relaxed config for simple product recipes', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price',
          images: '.product-images img',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: [],
        },
      };

      const config = WooCommerceValidationSchema.getConfigForRecipe(recipe);
      expect(config.variationDetection?.requireVariationSelectors).toBe(false);
    });
  });

  describe('validateAttributeName', () => {
    it('should validate correct PascalCase attribute names', () => {
      const result = WooCommerceValidationSchema.validateAttributeName('Color');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject lowercase attribute names', () => {
      const result = WooCommerceValidationSchema.validateAttributeName('color');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Attribute name \'color\' must be in PascalCase (e.g., \'Color\', \'Size\')');
    });

    it('should reject attribute names with special characters', () => {
      const result = WooCommerceValidationSchema.validateAttributeName('Color-Size');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Attribute name \'Color-Size\' contains special characters');
    });

    it('should reject reserved attribute names', () => {
      const result = WooCommerceValidationSchema.validateAttributeName('pa_color');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Attribute name \'pa_color\' is reserved in WooCommerce');
    });
  });

  describe('getFieldValidationRules', () => {
    it('should return validation rules for title field', () => {
      const rules = WooCommerceValidationSchema.getFieldValidationRules('title');
      expect(rules.required).toBe(true);
      expect(rules.patterns).toContain('h1');
      expect(rules.patterns).toContain('.product-title');
    });

    it('should return validation rules for price field', () => {
      const rules = WooCommerceValidationSchema.getFieldValidationRules('price');
      expect(rules.required).toBe(true);
      expect(rules.patterns).toContain('.price');
      expect(rules.patterns).toContain('.product-price');
    });
  });
});

describe('WooCommerceAttributeValidator', () => {
  let validator: WooCommerceAttributeValidator;

  beforeEach(() => {
    validator = new WooCommerceAttributeValidator();
  });

  describe('validateAttributeName', () => {
    it('should validate correct attribute names', () => {
      const result = validator.validateAttributeName('Color');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty attribute names', () => {
      const result = validator.validateAttributeName('');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_ATTRIBUTE_NAME');
    });

    it('should reject reserved attribute names', () => {
      const result = validator.validateAttributeName('pa_color');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('RESERVED_ATTRIBUTE_NAME');
    });

    it('should reject attribute names with spaces', () => {
      const result = validator.validateAttributeName('Color Size');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('CONTAINS_SPACES');
    });

    it('should warn about long attribute names', () => {
      const longName = 'VeryLongAttributeNameThatExceedsFiftyCharactersAndMore';
      const result = validator.validateAttributeName(longName);
      expect(result.warnings[0].code).toBe('TOO_LONG');
    });
  });

  describe('validateAttributeNames', () => {
    it('should detect duplicate attribute names', () => {
      const result = validator.validateAttributeNames(['Color', 'Size', 'Color']);
      expect(result.duplicates).toContain('color');
      expect(result.errors.some(e => e.code === 'DUPLICATE_ATTRIBUTE_NAME')).toBe(true);
    });

    it('should validate multiple attribute names', () => {
      const result = validator.validateAttributeNames(['Color', 'Size', 'Material']);
      expect(result.isValid).toBe(true);
      expect(result.duplicates).toHaveLength(0);
    });
  });

  describe('getSuggestedAttributeNames', () => {
    it('should return clothing attribute suggestions', () => {
      const suggestions = validator.getSuggestedAttributeNames('clothing');
      expect(suggestions).toContain('Color');
      expect(suggestions).toContain('Size');
      expect(suggestions).toContain('Material');
    });

    it('should return default suggestions for unknown product type', () => {
      const suggestions = validator.getSuggestedAttributeNames('unknown');
      expect(suggestions).toContain('Color');
      expect(suggestions).toContain('Size');
    });
  });
});

describe('WooCommerceVariationValidator', () => {
  let validator: WooCommerceVariationValidator;

  beforeEach(() => {
    validator = new WooCommerceVariationValidator();
  });

  describe('validateVariationDetection', () => {
    it('should validate recipes with proper variation selectors', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price',
          images: '.product-images img',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.product-attributes',
          variations: '.variations',
        },
      };

      const result = validator.validateVariationDetection(recipe);
      expect(result.isValid).toBe(true);
    });

    it('should warn about missing variation form selectors', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price',
          images: '.product-images img',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.product-attributes',
          variations: '.custom-variations',
        },
      };

      const result = validator.validateVariationDetection(recipe);
      expect(result.warnings.some(w => w.code === 'MISSING_VARIATION_FORM_SELECTORS')).toBe(true);
    });

    it('should skip validation for simple products', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price',
          images: '.product-images img',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.attributes',
        },
      };

      const result = validator.validateVariationDetection(recipe);
      expect(result.isValid).toBe(true);
    });
  });

  describe('getRecommendedVariationSelectors', () => {
    it('should return WooCommerce-specific selectors', () => {
      const selectors = validator.getRecommendedVariationSelectors('woocommerce');
      expect(selectors).toContain('.variations');
      expect(selectors).toContain('.woocommerce-variations');
    });

    it('should return generic selectors for unknown site type', () => {
      const selectors = validator.getRecommendedVariationSelectors('unknown');
      expect(selectors).toContain('.variations');
      expect(selectors).toContain('.product-variations');
    });
  });
});
