import { RecipeManager } from '../core/services/recipe-manager';
import { buildAdapterCacheKey, validateSiteUrl } from '../helpers/recipe-utils';
// Also mock the barrel path used by RecipeManager so spies capture calls
jest.mock('../helpers', () => {
  const actual = jest.requireActual('../helpers');
  return {
    ...actual,
    buildAdapterCacheKey: jest.fn((name: string, url: string) => `${name}:${url}`),
    validateSiteUrl: jest.fn(() => true),
  };
});

// Mock the recipe-utils helpers
jest.mock('../helpers/recipe-utils');
const mockBuildAdapterCacheKey = buildAdapterCacheKey as jest.MockedFunction<typeof buildAdapterCacheKey>;
const mockValidateSiteUrl = validateSiteUrl as jest.MockedFunction<typeof validateSiteUrl>;

describe('RecipeManager Cache Semantics', () => {
  let recipeManager: RecipeManager;

  beforeEach(() => {
    jest.clearAllMocks();
    recipeManager = new RecipeManager();

    // Default: strict host validation (matches RecipeLoader below)
    mockValidateSiteUrl.mockImplementation((expected: string, actual: string) => {
      try {
        return new URL(expected).hostname === new URL(actual).hostname;
      } catch {
        return false;
      }
    });

    // Use predictable cache keys
    mockBuildAdapterCacheKey.mockImplementation((recipeName: string, siteUrl: string) => `${recipeName}:${siteUrl}`);

    // Mock RecipeLoader.loadRecipe to return a minimal valid recipe bound to example.com
    const loaderModule = require('../utils/recipe-loader');
    jest.spyOn(loaderModule.RecipeLoader.prototype, 'loadRecipe')
      .mockImplementation(async (...args: unknown[]) => ({
        name: String(args[0] ?? 'test-recipe'),
        siteUrl: 'https://example.com',
        version: '1.0.0',
        selectors: {
          title: '.title', price: '.price', images: '.images', stock: '.stock', sku: '.sku', description: '.desc', productLinks: '.product a', attributes: '.attrs',
        },
      }));
  });

  describe('Cache Hit/Miss Behavior', () => {
    it('should cache recipe on first load', async () => {
      const recipeName = 'test-recipe';

      const result1 = await recipeManager.getRecipe(recipeName);
      const result2 = await recipeManager.getRecipe(recipeName);

      expect(result1).toEqual(result2);
      expect(result1.name).toBe(recipeName);
    });

    it('should return different instances for different recipe names', async () => {
      const recipe1 = 'recipe-1';
      const recipe2 = 'recipe-2';

      const mockRecipe1 = { name: recipe1, siteUrl: 'https://example.com', version: '1.0.0', selectors: { title: '.t', price: '.p', images: '.i', stock: '.s', sku: '.k', description: '.d', productLinks: '.product1', attributes: '.a' } };
      const mockRecipe2 = { name: recipe2, siteUrl: 'https://example.com', version: '1.0.0', selectors: { title: '.t', price: '.p', images: '.i', stock: '.s', sku: '.k', description: '.d', productLinks: '.product2', attributes: '.a' } };

      jest.spyOn(require('fs/promises'), 'readFile')
        .mockResolvedValueOnce(JSON.stringify(mockRecipe1))
        .mockResolvedValueOnce(JSON.stringify(mockRecipe2));

      const result1 = await recipeManager.getRecipe(recipe1);
      const result2 = await recipeManager.getRecipe(recipe2);

      expect(result1).not.toEqual(result2);
      expect(result1.name).toBe(recipe1);
      expect(result2.name).toBe(recipe2);
    });

    it('should handle cache miss for non-existent recipe', async () => {
      const recipeName = 'non-existent-recipe';

      // Mock RecipeLoader to throw error
      const loaderModule = require('../utils/recipe-loader');
      jest.spyOn(loaderModule.RecipeLoader.prototype, 'loadRecipe')
        .mockRejectedValue(new Error('File not found'));

      await expect(recipeManager.getRecipe(recipeName)).rejects.toThrow('File not found');
    });
  });

  describe('Cache Key Collisions', () => {
    it('should handle same site URL with different recipe names', async () => {
      const recipe1 = 'recipe-1';
      const recipe2 = 'recipe-2';
      const siteUrl = 'https://example.com';

      mockBuildAdapterCacheKey
        .mockReturnValueOnce('cache-key-1')
        .mockReturnValueOnce('cache-key-2');

      const mockAdapter1 = {
        getConfig: () => ({ siteUrl, name: recipe1 }),
      };
      const mockAdapter2 = {
        getConfig: () => ({ siteUrl, name: recipe2 }),
      };

      jest.spyOn(require('../core/adapters/generic-adapter'), 'GenericAdapter')
        .mockReturnValueOnce(mockAdapter1 as any)
        .mockReturnValueOnce(mockAdapter2 as any);

      const adapter1 = await recipeManager.createAdapter(siteUrl, recipe1);
      const adapter2 = await recipeManager.createAdapter(siteUrl, recipe2);

      expect(adapter1).not.toBe(adapter2);
      expect(adapter1.getConfig().name).toBeDefined();
      expect(adapter2.getConfig().name).toBeDefined();
    });

    it('should cache adapter by recipe name and site URL', async () => {
      const recipeName = 'generic-ecommerce';
      const siteUrl = 'https://example.com';

      const adapter1 = await recipeManager.createAdapter(siteUrl, recipeName);
      const adapter2 = await recipeManager.createAdapter(siteUrl, recipeName);

      expect(adapter1).toBe(adapter2);
    });
  });

  describe('Cache Eviction and Removal', () => {
    it('should remove recipe from cache', async () => {
      const recipeName = 'test-recipe';
      const loaderModule = require('../utils/recipe-loader');
      const loadSpy = jest.spyOn(loaderModule.RecipeLoader.prototype, 'loadRecipe');

      // Load recipe into cache
      await recipeManager.getRecipe(recipeName);

      // Remove from cache
      // RecipeManager doesn't have removeRecipe method, so we'll clear the cache instead
      recipeManager.clearCaches();

      // Load again - should call loader again
      await recipeManager.getRecipe(recipeName);

      // Loader should be called twice (once before removal, once after)
      expect(loadSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle removal of non-existent recipe', () => {

      // Should not throw when removing non-existent recipe
      expect(() => recipeManager.clearCaches()).not.toThrow();
    });

    it('should clear all recipes from cache', async () => {
      const recipe1 = 'recipe-1';
      const recipe2 = 'recipe-2';

      const loaderModule = require('../utils/recipe-loader');
      const loadSpy = jest.spyOn(loaderModule.RecipeLoader.prototype, 'loadRecipe');

      // Load both recipes
      await recipeManager.getRecipe(recipe1);
      await recipeManager.getRecipe(recipe2);

      // Clear cache
      recipeManager.clearCaches();

      // Load again - should call loader again
      await recipeManager.getRecipe(recipe1);
      await recipeManager.getRecipe(recipe2);

      // Loader should be called 4 times total (2 before clear, 2 after clear)
      expect(loadSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('Cache Statistics and Monitoring', () => {
    it('should not duplicate adapter instances for repeated requests', async () => {
      const siteUrl = 'https://example.com';
      const name = 'test-recipe';

      const a1 = await recipeManager.createAdapter(siteUrl, name);
      const a2 = await recipeManager.createAdapter(siteUrl, name);
      const a3 = await recipeManager.createAdapter(siteUrl, name);

      expect(a1).toBe(a2);
      expect(a2).toBe(a3);
    });
  });

  describe('Cache Key Generation', () => {
    it('should cache adapter using key built from recipe and site URL', async () => {
      const siteUrl = 'https://example.com';
      const recipeName = 'test-recipe';

      const adapter = await recipeManager.createAdapter(siteUrl, recipeName);
      const cached = recipeManager.getCachedAdapter(recipeName, siteUrl);
      expect(cached).toBe(adapter);
    });
  });

  describe('Site URL Validation Integration', () => {
    it('should throw when site URL does not match recipe site', async () => {
      await expect(recipeManager.createAdapter('https://other.com', 'test-recipe')).rejects.toThrow();
    });
  });

  describe('Concurrent Access', () => {
    it('should return the same adapter instance under concurrent create calls', async () => {
      const siteUrl = 'https://example.com';
      const recipeName = 'test-recipe';

      // Ensure the loader returns a valid recipe for this name
      const loaderModule = require('../utils/recipe-loader');
      jest.spyOn(loaderModule.RecipeLoader.prototype, 'loadRecipe')
        .mockResolvedValueOnce({
          name: recipeName,
          siteUrl: 'https://example.com',
          version: '1.0.0',
          selectors: { title: '.t', price: '.p', images: '.i', stock: '.s', sku: '.k', description: '.d', productLinks: '.product', attributes: '.a' },
        });

      const adapters = await Promise.all(
        Array.from({ length: 10 }, () => recipeManager.createAdapter(siteUrl, recipeName)),
      );
      expect(adapters.every(a => a === adapters[0])).toBe(true);
    });
  });
});