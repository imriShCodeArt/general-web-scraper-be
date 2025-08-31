import { RecipeLoader } from './recipe-loader';
import { GenericAdapter } from './generic-adapter';
import { RecipeConfig, SiteAdapter, RawProductData } from '../types';

export class RecipeManager {
  private recipesDir: string;
  private recipeLoader: RecipeLoader;
  private adapterCache = new Map<string, SiteAdapter<RawProductData>>();

  constructor(recipesDir: string = './recipes', recipeLoader?: RecipeLoader) {
    this.recipesDir = recipesDir;
    this.recipeLoader = recipeLoader || new RecipeLoader(recipesDir);
  }

  /**
   * Create an adapter for a specific site using a recipe
   */
  async createAdapter(siteUrl: string, recipeName?: string): Promise<SiteAdapter> {
    let recipe: RecipeConfig;

    if (recipeName) {
      // Load specific recipe by name
      recipe = await this.recipeLoader.loadRecipe(recipeName);
    } else {
      // Try to auto-detect recipe by site URL
      const detectedRecipe = await this.recipeLoader.getRecipeBySiteUrl(siteUrl);
      if (!detectedRecipe) {
        throw new Error(`No recipe found for site: ${siteUrl}`);
      }
      recipe = detectedRecipe;
    }

    // Validate that the recipe matches the site URL
    if (!this.validateSiteUrl(recipe.siteUrl, siteUrl)) {
      throw new Error(
        `Recipe '${recipe.name}' is configured for ${recipe.siteUrl}, not ${siteUrl}`,
      );
    }

    // Create cache key
    const cacheKey = `${recipe.name}:${siteUrl}`;

    // Check if adapter is already cached
    if (this.adapterCache.has(cacheKey)) {
      return this.adapterCache.get(cacheKey)!;
    }

    // Create new adapter
    const adapter = new GenericAdapter(recipe, siteUrl);

    // Cache the adapter
    this.adapterCache.set(cacheKey, adapter);

    return adapter;
  }

  /**
   * Create an adapter using a recipe file path
   */
  async createAdapterFromFile(siteUrl: string, recipeFilePath: string): Promise<SiteAdapter> {
    const recipe = await this.recipeLoader.loadRecipeFromFile(recipeFilePath);

    // Validate that the recipe matches the site URL
    if (!this.validateSiteUrl(recipe.siteUrl, siteUrl)) {
      throw new Error(
        `Recipe '${recipe.name}' is configured for ${recipe.siteUrl}, not ${siteUrl}`,
      );
    }

    // Create cache key
    const cacheKey = `${recipe.name}:${siteUrl}`;

    // Check if adapter is already cached
    if (this.adapterCache.has(cacheKey)) {
      return this.adapterCache.get(cacheKey)!;
    }

    // Create new adapter
    const adapter = new GenericAdapter(recipe, siteUrl);

    // Cache the adapter
    this.adapterCache.set(cacheKey, adapter);

    return adapter;
  }

  /**
   * List all available recipes
   */
  async listRecipes(): Promise<string[]> {
    return await this.recipeLoader.listAvailableRecipes();
  }

  /**
   * List all available recipes with full details
   */
  async listRecipesWithDetails(): Promise<RecipeConfig[]> {
    return await this.recipeLoader.listRecipesWithDetails();
  }

  /**
   * Get recipe configuration by name
   */
  async getRecipe(recipeName: string): Promise<RecipeConfig> {
    return await this.recipeLoader.loadRecipe(recipeName);
  }

  /**
   * Get recipe configuration by site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<RecipeConfig | null> {
    return await this.recipeLoader.getRecipeBySiteUrl(siteUrl);
  }

  /**
   * Get recipe details by name
   */
  async getRecipeDetails(recipeName: string): Promise<RecipeConfig | null> {
    try {
      return await this.recipeLoader.loadRecipe(recipeName);
    } catch (error) {
      console.warn(`Failed to get recipe details for '${recipeName}':`, error);
      return null;
    }
  }

  /**
   * Load recipe from file path
   */
  async loadRecipeFromFile(filePath: string): Promise<RecipeConfig> {
    return await this.recipeLoader.loadRecipeFromFile(filePath);
  }

  /**
   * Validate a recipe configuration
   */
  validateRecipe(recipe: RecipeConfig): boolean {
    return this.recipeLoader.validateRecipe(recipe);
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.recipeLoader.clearCache();
    this.adapterCache.clear();
  }

  /**
   * Get cached adapter
   */
  getCachedAdapter(recipeName: string, siteUrl: string): SiteAdapter | undefined {
    const cacheKey = `${recipeName}:${siteUrl}`;
    return this.adapterCache.get(cacheKey);
  }

  /**
   * Remove adapter from cache
   */
  removeCachedAdapter(recipeName: string, siteUrl: string): boolean {
    const cacheKey = `${recipeName}:${siteUrl}`;
    return this.adapterCache.delete(cacheKey);
  }

  /**
   * Validate that a recipe's site URL matches the requested site URL
   */
  private validateSiteUrl(recipeUrl: string, siteUrl: string): boolean {
    try {
      // Handle wildcard URLs
      if (recipeUrl === '*') {
        return true; // Generic recipe matches any site
      }

      if (recipeUrl.startsWith('*.')) {
        // Wildcard subdomain matching (e.g., *.co.il)
        const recipeDomain = recipeUrl.substring(2); // Remove "*."
        const siteHost = new URL(siteUrl).hostname;
        return siteHost.endsWith(recipeDomain);
      }

      // Exact hostname matching
      const recipeHost = new URL(recipeUrl).hostname;
      const siteHost = new URL(siteUrl).hostname;
      return recipeHost === siteHost;
    } catch {
      return false;
    }
  }

  /**
   * Get recipe loader instance
   */
  getRecipeLoader(): RecipeLoader {
    return this.recipeLoader;
  }
}
