import { WooCommerceCrossFieldValidator } from '../validation/woocommerce/woocommerce-cross-field-validator';
import { RecipeConfig } from '../domain/types';

describe('WooCommerceCrossFieldValidator', () => {
  let validator: WooCommerceCrossFieldValidator;

  beforeEach(() => {
    validator = new WooCommerceCrossFieldValidator();
  });

  describe('validateCrossFieldRelationships', () => {
    it('should validate variation-attribute consistency', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price',
          images: '.product-image',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.product-attributes',
          variations: '.variations',
        },
        transforms: {
          attributes: {
            Color: ['.color-selector'],
            Size: ['.size-selector'],
          },
        },
      };

      const result = validator.validateCrossFieldRelationships(recipe);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing attributes for variations', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price',
          images: '.product-image',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '', // Empty attributes
          variations: '.variations',
        },
      };

      const result = validator.validateCrossFieldRelationships(recipe);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('MISSING_ATTRIBUTES_FOR_VARIATIONS');
    });

    it('should detect missing attribute transforms for variations', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price',
          images: '.product-image',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.product-attributes',
          variations: '.variations',
        },
        // No transforms defined
      };

      const result = validator.validateCrossFieldRelationships(recipe);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThanOrEqual(1);
      expect(result.warnings.some(w => w.code === 'MISSING_ATTRIBUTE_TRANSFORMS_FOR_VARIATIONS')).toBe(true);
    });

    it('should detect attributes without variations', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price',
          images: '.product-image',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.product-attributes',
          variations: '', // Empty variations
        },
      };

      const result = validator.validateCrossFieldRelationships(recipe);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('ATTRIBUTES_WITHOUT_VARIATIONS');
    });

    it('should detect conflicting selectors', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price',
          images: '.product-image',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.product-attributes',
          variations: '.product-attributes', // Same as attributes
        },
      };

      const result = validator.validateCrossFieldRelationships(recipe);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.code === 'OVERLAPPING_SELECTORS')).toBe(true);
    });

    it('should detect missing complementary selectors', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '', // Missing title
          price: '.price',
          images: '.product-image',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link', // Has links but no title
          attributes: '.product-attributes',
          variations: '.variations',
        },
      };

      const result = validator.validateCrossFieldRelationships(recipe);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.code === 'MISSING_COMPLEMENTARY_SELECTOR')).toBe(true);
    });
  });
});
