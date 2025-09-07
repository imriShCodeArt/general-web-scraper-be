import { WooCommercePerformanceValidator } from '../validation/woocommerce/woocommerce-performance-validator';
import { RecipeConfig } from '../domain/types';

describe('WooCommercePerformanceValidator', () => {
  let validator: WooCommercePerformanceValidator;

  beforeEach(() => {
    validator = new WooCommercePerformanceValidator();
  });

  describe('validatePerformance', () => {
    it('should validate simple selectors with good performance', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price .amount',
          images: '.product-image',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.product-attributes',
          variations: '.variations',
        },
      };

      const result = validator.validatePerformance(recipe);

      expect(result.isValid).toBe(true);
      expect(result.performanceScore).toBeGreaterThan(60);
      expect(result.warnings.length).toBeLessThan(5);
    });

    it('should detect slow selectors', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title:nth-child(2)',
          price: '.price .amount:not(.sale)',
          images: '.product-image::before',
          stock: '.stock:first-child',
          sku: '.sku:last-child',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.product-attributes',
          variations: '.variations',
        },
      };

      const result = validator.validatePerformance(recipe);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'SLOW_SELECTORS')).toBe(true);
      expect(result.performanceScore).toBeLessThan(80);
    });

    it('should detect inefficient selectors', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product .title',
          price: '.price .amount',
          images: '.product .image',
          stock: '.product .stock',
          sku: '.product .sku',
          description: '.product .description',
          productLinks: '.product .link',
          attributes: '.product .attributes',
          variations: '.product .variations',
        },
      };

      const result = validator.validatePerformance(recipe);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'INEFFICIENT_SELECTORS')).toBe(true);
    });

    it('should detect complex selectors', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product > .content > .header > .title',
          price: '.product .price .amount + .currency',
          images: '.product .gallery img:first-child ~ img',
          stock: '.product .info .stock',
          sku: '.product .info .sku',
          description: '.product .content .description',
          productLinks: '.product .links a',
          attributes: '.product .attributes',
          variations: '.product .variations',
        },
      };

      const result = validator.validatePerformance(recipe);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'COMPLEX_SELECTORS')).toBe(true);
    });

    it('should detect redundant selectors', () => {
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

      const result = validator.validatePerformance(recipe);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'REDUNDANT_SELECTORS')).toBe(true);
    });

    it('should detect missing wait strategies', () => {
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
        // No behavior.waitForSelectors
      };

      const result = validator.validatePerformance(recipe);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'MISSING_WAIT_STRATEGY')).toBe(true);
    });

    it('should calculate performance score correctly', () => {
      const recipe: RecipeConfig = {
        name: 'Test Recipe',
        version: '1.0.0',
        siteUrl: 'https://example.com',
        selectors: {
          title: '.product-title',
          price: '.price .amount',
          images: '.product-image',
          stock: '.stock',
          sku: '.sku',
          description: '.description',
          productLinks: '.product-link',
          attributes: '.product-attributes',
          variations: '.variations',
        },
        behavior: {
          waitForSelectors: ['.product-loaded', '.variations-loaded'],
        },
      };

      const result = validator.validatePerformance(recipe);

      expect(result.performanceScore).toBeGreaterThan(0);
      expect(result.performanceScore).toBeLessThanOrEqual(100);
      expect(result.optimizationSuggestions).toBeDefined();
    });
  });
});
