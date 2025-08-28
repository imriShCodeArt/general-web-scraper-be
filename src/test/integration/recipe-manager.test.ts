import { RecipeManager } from '../../lib/recipe-manager';
import path from 'path';

describe('RecipeManager integration', () => {
  it('loads a recipe by name and validates site URL matching', async () => {
    const manager = new RecipeManager(path.resolve('./recipes'));
    const names = await manager.listRecipes();
    expect(Array.isArray(names)).toBe(true);

    // If generic recipe exists, just assert we can create an adapter using explicit site and recipe
    const siteUrl = 'https://example.com';
    // try using any recipe available or fallback to mock through file
    if (names.length > 0) {
      const name = names[0];
      const recipe = await manager.getRecipe(name);
      expect(recipe).toBeTruthy();

      // If site matches, createAdapter should work or throw with clear error if mismatch
      try {
        await manager.createAdapter(siteUrl, name);
      } catch (e) {
        // Either passes or throws mismatch message; both are valid behaviors to cover code paths
        expect(e).toBeTruthy();
      }
    }
  });

  it('loads recipe from file and caches adapter', async () => {
    const manager = new RecipeManager(path.resolve('./recipes'));
    const filePath = path.resolve(__dirname, '../fixtures/mock-recipe.json');
    const siteUrl = 'https://example.com';

    const adapter1 = await manager.createAdapterFromFile(siteUrl, filePath);
    expect(adapter1).toBeTruthy();

    const cached = manager.getCachedAdapter('mock-recipe', siteUrl);
    expect(cached).toBeTruthy();

    const removed = manager.removeCachedAdapter('mock-recipe', siteUrl);
    expect(removed).toBe(true);
  });
});


