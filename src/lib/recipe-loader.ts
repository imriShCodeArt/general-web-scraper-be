import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { parse } from 'yaml';
import { RecipeConfig, RecipeFile, RecipeLoader } from '../types';

export class RecipeLoaderService implements RecipeLoader {
  private recipesDir: string;
  private recipesCache: Map<string, RecipeConfig> = new Map();

  constructor(recipesDir: string = './recipes') {
    this.recipesDir = recipesDir;
  }

  /**
   * Load a recipe by name from the recipes directory
   */
  async loadRecipe(recipeName: string): Promise<RecipeConfig> {
    // Check cache first
    if (this.recipesCache.has(recipeName)) {
      return this.recipesCache.get(recipeName)!;
    }

    // Look for recipe files
    const recipeFiles = this.findRecipeFiles();
    
    for (const filePath of recipeFiles) {
      try {
        const recipe = await this.loadRecipeFromFile(filePath);
        if (recipe.name === recipeName) {
          this.recipesCache.set(recipeName, recipe);
          return recipe;
        }
      } catch (error) {
        console.warn(`Failed to load recipe from ${filePath}:`, error);
      }
    }

    throw new Error(`Recipe '${recipeName}' not found`);
  }

  /**
   * Load a recipe from a specific file path
   */
  async loadRecipeFromFile(filePath: string): Promise<RecipeConfig> {
    if (!existsSync(filePath)) {
      throw new Error(`Recipe file not found: ${filePath}`);
    }

    const fileContent = readFileSync(filePath, 'utf-8');
    const ext = extname(filePath).toLowerCase();

    let recipeData: any;

    try {
      if (ext === '.yaml' || ext === '.yml') {
        recipeData = parse(fileContent);
      } else if (ext === '.json') {
        recipeData = JSON.parse(fileContent);
      } else {
        throw new Error(`Unsupported file format: ${ext}`);
      }
    } catch (error) {
      throw new Error(`Failed to parse recipe file ${filePath}: ${error}`);
    }

    // Handle both single recipe and recipe collection files
    let recipe: RecipeConfig;
    if (recipeData.recipes && Array.isArray(recipeData.recipes)) {
      // Recipe collection file
      if (recipeData.recipes.length === 0) {
        throw new Error(`No recipes found in ${filePath}`);
      }
      recipe = recipeData.recipes[0]; // Return first recipe for now
    } else if (recipeData.name && recipeData.selectors) {
      // Single recipe file
      recipe = recipeData;
    } else {
      throw new Error(`Invalid recipe format in ${filePath}`);
    }

    // Validate the recipe
    if (!this.validateRecipe(recipe)) {
      throw new Error(`Invalid recipe configuration in ${filePath}`);
    }

    return recipe;
  }

  /**
   * Load a recipe from a URL
   */
  async loadRecipeFromUrl(url: string): Promise<RecipeConfig> {
    // This would require HTTP client implementation
    // For now, we'll throw an error
    throw new Error('Loading recipes from URL not yet implemented');
  }

  /**
   * List all available recipe names
   */
  async listAvailableRecipes(): Promise<string[]> {
    const recipeFiles = this.findRecipeFiles();
    const recipeNames: string[] = [];

    for (const filePath of recipeFiles) {
      try {
        const recipe = await this.loadRecipeFromFile(filePath);
        recipeNames.push(recipe.name);
      } catch (error) {
        console.warn(`Failed to load recipe from ${filePath}:`, error);
      }
    }

    return recipeNames;
  }

  /**
   * Validate a recipe configuration
   */
  validateRecipe(recipe: RecipeConfig): boolean {
    // Check required fields
    if (!recipe.name || !recipe.version || !recipe.siteUrl) {
      return false;
    }

    // Check required selectors
    if (!recipe.selectors.title || !recipe.selectors.price || !recipe.selectors.images) {
      return false;
    }

    // Validate selectors are not empty
    const requiredSelectors = ['title', 'price', 'images'];
    for (const selector of requiredSelectors) {
      const value = recipe.selectors[selector as keyof typeof recipe.selectors];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find all recipe files in the recipes directory
   */
  private findRecipeFiles(): string[] {
    if (!existsSync(this.recipesDir)) {
      return [];
    }

    const files: string[] = [];
    const items = readdirSync(this.recipesDir, { withFileTypes: true });

    for (const item of items) {
      if (item.isFile()) {
        const ext = extname(item.name).toLowerCase();
        if (ext === '.yaml' || ext === '.yml' || ext === '.json') {
          files.push(join(this.recipesDir, item.name));
        }
      }
    }

    return files;
  }

  /**
   * Get recipe by site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<RecipeConfig | null> {
    const recipeFiles = this.findRecipeFiles();
    
    for (const filePath of recipeFiles) {
      try {
        const recipe = await this.loadRecipeFromFile(filePath);
        if (this.matchesSiteUrl(recipe.siteUrl, siteUrl)) {
          return recipe;
        }
      } catch (error) {
        console.warn(`Failed to load recipe from ${filePath}:`, error);
      }
    }

    return null;
  }

  /**
   * Check if a recipe matches a given site URL
   */
  private matchesSiteUrl(recipeUrl: string, siteUrl: string): boolean {
    try {
      const recipeHost = new URL(recipeUrl).hostname;
      const siteHost = new URL(siteUrl).hostname;
      return recipeHost === siteHost;
    } catch {
      return false;
    }
  }

  /**
   * Clear the recipe cache
   */
  clearCache(): void {
    this.recipesCache.clear();
  }

  /**
   * Get cached recipe
   */
  getCachedRecipe(recipeName: string): RecipeConfig | undefined {
    return this.recipesCache.get(recipeName);
  }
}
