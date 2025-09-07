import { RecipeComplianceAuditor } from '../../lib/utils/recipe-compliance-auditor';
import { WooCommerceRecipeValidator } from '../../lib/validation/woocommerce/woocommerce-recipe-validator';
import { RecipeLoader } from '../../lib/utils/recipe-loader';
import { RecipeConfig } from '../../types';

describe('Recipe Compliance Pipeline Integration Tests', () => {
  let auditor: RecipeComplianceAuditor;
  let validator: WooCommerceRecipeValidator;
  let recipeLoader: RecipeLoader;

  beforeEach(() => {
    auditor = new RecipeComplianceAuditor('./recipes');
    validator = new WooCommerceRecipeValidator();
    recipeLoader = new RecipeLoader('./recipes', true);
  });

  describe('Complete Recipe-to-CSV Pipeline', () => {
    it('should validate compliant recipes produce valid WooCommerce CSV structure', async () => {
      // Load a known compliant recipe
      const recipe = await recipeLoader.loadRecipe('Generic E-commerce');

      // Validate the recipe
      const validationResult = validator.validateRecipe(recipe);

      // Should be valid
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.score).toBeGreaterThan(70);

      // Should have required selectors
      expect(recipe.selectors.title).toBeDefined();
      expect(recipe.selectors.price).toBeDefined();
      expect(recipe.selectors.images).toBeDefined();

      // Should have proper attribute naming if attributes exist
      if (recipe.transforms?.attributes) {
        const attributeNames = Object.keys(recipe.transforms.attributes);
        attributeNames.forEach(name => {
          expect(name).toMatch(/^[A-Z][a-zA-Z0-9]*$/); // PascalCase
        });
      }
    });

    it('should handle non-compliant recipes with appropriate error messages', async () => {
      // Create a non-compliant recipe
      const nonCompliantRecipe: RecipeConfig = {
        name: 'Non-Compliant Test',
        version: '1.0.0',
        siteUrl: 'https://test.com',
        selectors: {
          title: '.title',
          price: '', // Empty price - should trigger error
          images: '.img',
          stock: '.stock',
          sku: '.sku',
          description: '.desc',
          productLinks: '.link',
          attributes: '.attr',
        },
        transforms: {
          attributes: {
            'color': ['.color-selector'], // Lowercase - should trigger warning
            'size': ['.size-selector'],   // Lowercase - should trigger warning
          },
        },
      };

      const validationResult = validator.validateRecipe(nonCompliantRecipe);

      // Should not be valid due to empty price
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);

      // Should have warnings for attribute naming
      expect(validationResult.warnings.length).toBeGreaterThan(0);
      const attributeWarnings = validationResult.warnings.filter(w =>
        (w.field && w.field.includes('attributeNames')) || w.message.includes('attribute'),
      );
      expect(attributeWarnings.length).toBeGreaterThan(0);
    });

    it('should audit all recipes and provide comprehensive report', async () => {
      const auditReport = await auditor.auditAllRecipes();

      // Should have valid report structure
      expect(auditReport.summary).toBeDefined();
      expect(auditReport.recipes).toBeDefined();
      expect(auditReport.recommendations).toBeDefined();

      // Should have at least one recipe
      expect(auditReport.summary.totalRecipes).toBeGreaterThan(0);

      // All recipes should have valid structure
      auditReport.recipes.forEach(recipe => {
        expect(recipe.recipeName).toBeDefined();
        expect(recipe.complianceScore).toBeGreaterThanOrEqual(0);
        expect(recipe.complianceScore).toBeLessThanOrEqual(100);
        expect(recipe.priority).toMatch(/^(high|medium|low)$/);
        expect(recipe.recommendedFixes).toBeDefined();
      });
    });
  });

  describe('Performance Testing', () => {
    it('should validate recipes within acceptable time limits', async () => {
      const startTime = Date.now();

      // Test single recipe validation performance
      const recipe = await recipeLoader.loadRecipe('Generic E-commerce');
      const validationResult = validator.validateRecipe(recipe);

      const validationTime = Date.now() - startTime;

      // Should complete validation in less than 1 second
      expect(validationTime).toBeLessThan(1000);
      expect(validationResult.isValid).toBe(true);
    });

    it('should audit all recipes within reasonable time', async () => {
      const startTime = Date.now();

      const auditReport = await auditor.auditAllRecipes();

      const auditTime = Date.now() - startTime;

      // Should complete full audit in less than 10 seconds
      expect(auditTime).toBeLessThan(10000);
      expect(auditReport.summary.totalRecipes).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing recipe files gracefully', async () => {
      const nonExistentAuditor = new RecipeComplianceAuditor('./non-existent-dir');

      const auditReport = await nonExistentAuditor.auditAllRecipes();

      // Should return empty report structure
      expect(auditReport.summary.totalRecipes).toBe(0);
      expect(auditReport.recipes).toHaveLength(0);
    });

    it('should handle malformed recipe data gracefully', async () => {
      // This test would require creating a malformed recipe file
      // For now, we test that the validator handles invalid input
      const invalidRecipe = {} as RecipeConfig;

      const validationResult = validator.validateRecipe(invalidRecipe);

      // Should not crash and should return invalid result
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('WooCommerce CSV Compatibility', () => {
    it('should ensure compliant recipes can generate WooCommerce-compatible CSV', async () => {
      const recipe = await recipeLoader.loadRecipe('Generic E-commerce');
      const validationResult = validator.validateRecipe(recipe);

      // Recipe should be valid
      expect(validationResult.isValid).toBe(true);

      // Should have all required fields for WooCommerce CSV
      const requiredFields = ['title', 'price', 'images', 'sku', 'description'];
      requiredFields.forEach(field => {
        expect(recipe.selectors[field as keyof typeof recipe.selectors]).toBeDefined();
      });

      // If has variations, should have proper attribute selectors
      if (recipe.selectors.variations) {
        expect(recipe.selectors.attributes).toBeDefined();
      }
    });

    it('should validate attribute naming follows WooCommerce standards', async () => {
      const recipe = await recipeLoader.loadRecipe('Generic E-commerce');

      if (recipe.transforms?.attributes) {
        const attributeNames = Object.keys(recipe.transforms.attributes);

        attributeNames.forEach(name => {
          // Should be PascalCase
          expect(name).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
          // Should not contain special characters
          expect(name).not.toMatch(/[-_]/);
          // Should not be empty
          expect(name.length).toBeGreaterThan(0);
        });
      }
    });
  });
});
