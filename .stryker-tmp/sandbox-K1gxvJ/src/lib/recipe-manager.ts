// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { RecipeLoader } from './recipe-loader';
import { GenericAdapter } from './generic-adapter';
import { RecipeConfig, SiteAdapter, RawProductData } from '../types';
export class RecipeManager {
  private recipesDir: string;
  private recipeLoader: RecipeLoader;
  private adapterCache = new Map<string, SiteAdapter<RawProductData>>();
  constructor(recipesDir: string = stryMutAct_9fa48("2640") ? "" : (stryCov_9fa48("2640"), './recipes'), recipeLoader?: RecipeLoader) {
    if (stryMutAct_9fa48("2641")) {
      {}
    } else {
      stryCov_9fa48("2641");
      this.recipesDir = recipesDir;
      this.recipeLoader = stryMutAct_9fa48("2644") ? recipeLoader && new RecipeLoader(recipesDir) : stryMutAct_9fa48("2643") ? false : stryMutAct_9fa48("2642") ? true : (stryCov_9fa48("2642", "2643", "2644"), recipeLoader || new RecipeLoader(recipesDir));
    }
  }

  /**
   * Create an adapter for a specific site using a recipe
   */
  async createAdapter(siteUrl: string, recipeName?: string): Promise<SiteAdapter> {
    if (stryMutAct_9fa48("2645")) {
      {}
    } else {
      stryCov_9fa48("2645");
      let recipe: RecipeConfig;
      if (stryMutAct_9fa48("2647") ? false : stryMutAct_9fa48("2646") ? true : (stryCov_9fa48("2646", "2647"), recipeName)) {
        if (stryMutAct_9fa48("2648")) {
          {}
        } else {
          stryCov_9fa48("2648");
          // Load specific recipe by name
          recipe = await this.recipeLoader.loadRecipe(recipeName);
        }
      } else {
        if (stryMutAct_9fa48("2649")) {
          {}
        } else {
          stryCov_9fa48("2649");
          // Try to auto-detect recipe by site URL
          const detectedRecipe = await this.recipeLoader.getRecipeBySiteUrl(siteUrl);
          if (stryMutAct_9fa48("2652") ? false : stryMutAct_9fa48("2651") ? true : stryMutAct_9fa48("2650") ? detectedRecipe : (stryCov_9fa48("2650", "2651", "2652"), !detectedRecipe)) {
            if (stryMutAct_9fa48("2653")) {
              {}
            } else {
              stryCov_9fa48("2653");
              throw new Error(stryMutAct_9fa48("2654") ? `` : (stryCov_9fa48("2654"), `No recipe found for site: ${siteUrl}`));
            }
          }
          recipe = detectedRecipe;
        }
      }

      // Validate that the recipe matches the site URL
      if (stryMutAct_9fa48("2657") ? false : stryMutAct_9fa48("2656") ? true : stryMutAct_9fa48("2655") ? this.validateSiteUrl(recipe.siteUrl, siteUrl) : (stryCov_9fa48("2655", "2656", "2657"), !this.validateSiteUrl(recipe.siteUrl, siteUrl))) {
        if (stryMutAct_9fa48("2658")) {
          {}
        } else {
          stryCov_9fa48("2658");
          throw new Error(stryMutAct_9fa48("2659") ? `` : (stryCov_9fa48("2659"), `Recipe '${recipe.name}' is configured for ${recipe.siteUrl}, not ${siteUrl}`));
        }
      }

      // Create cache key
      const cacheKey = stryMutAct_9fa48("2660") ? `` : (stryCov_9fa48("2660"), `${recipe.name}:${siteUrl}`);

      // Check if adapter is already cached
      if (stryMutAct_9fa48("2662") ? false : stryMutAct_9fa48("2661") ? true : (stryCov_9fa48("2661", "2662"), this.adapterCache.has(cacheKey))) {
        if (stryMutAct_9fa48("2663")) {
          {}
        } else {
          stryCov_9fa48("2663");
          return this.adapterCache.get(cacheKey)!;
        }
      }

      // Create new adapter
      const adapter = new GenericAdapter(recipe, siteUrl);

      // Cache the adapter
      this.adapterCache.set(cacheKey, adapter);
      return adapter;
    }
  }

  /**
   * Create an adapter using a recipe file path
   */
  async createAdapterFromFile(siteUrl: string, recipeFilePath: string): Promise<SiteAdapter> {
    if (stryMutAct_9fa48("2664")) {
      {}
    } else {
      stryCov_9fa48("2664");
      const recipe = await this.recipeLoader.loadRecipeFromFile(recipeFilePath);

      // Validate that the recipe matches the site URL
      if (stryMutAct_9fa48("2667") ? false : stryMutAct_9fa48("2666") ? true : stryMutAct_9fa48("2665") ? this.validateSiteUrl(recipe.siteUrl, siteUrl) : (stryCov_9fa48("2665", "2666", "2667"), !this.validateSiteUrl(recipe.siteUrl, siteUrl))) {
        if (stryMutAct_9fa48("2668")) {
          {}
        } else {
          stryCov_9fa48("2668");
          throw new Error(stryMutAct_9fa48("2669") ? `` : (stryCov_9fa48("2669"), `Recipe '${recipe.name}' is configured for ${recipe.siteUrl}, not ${siteUrl}`));
        }
      }

      // Create cache key
      const cacheKey = stryMutAct_9fa48("2670") ? `` : (stryCov_9fa48("2670"), `${recipe.name}:${siteUrl}`);

      // Check if adapter is already cached
      if (stryMutAct_9fa48("2672") ? false : stryMutAct_9fa48("2671") ? true : (stryCov_9fa48("2671", "2672"), this.adapterCache.has(cacheKey))) {
        if (stryMutAct_9fa48("2673")) {
          {}
        } else {
          stryCov_9fa48("2673");
          return this.adapterCache.get(cacheKey)!;
        }
      }

      // Create new adapter
      const adapter = new GenericAdapter(recipe, siteUrl);

      // Cache the adapter
      this.adapterCache.set(cacheKey, adapter);
      return adapter;
    }
  }

  /**
   * List all available recipes
   */
  async listRecipes(): Promise<string[]> {
    if (stryMutAct_9fa48("2674")) {
      {}
    } else {
      stryCov_9fa48("2674");
      return await this.recipeLoader.listAvailableRecipes();
    }
  }

  /**
   * List all available recipes with full details
   */
  async listRecipesWithDetails(): Promise<RecipeConfig[]> {
    if (stryMutAct_9fa48("2675")) {
      {}
    } else {
      stryCov_9fa48("2675");
      return await this.recipeLoader.listRecipesWithDetails();
    }
  }

  /**
   * Get recipe configuration by name
   */
  async getRecipe(recipeName: string): Promise<RecipeConfig> {
    if (stryMutAct_9fa48("2676")) {
      {}
    } else {
      stryCov_9fa48("2676");
      return await this.recipeLoader.loadRecipe(recipeName);
    }
  }

  /**
   * Get recipe configuration by site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<RecipeConfig | null> {
    if (stryMutAct_9fa48("2677")) {
      {}
    } else {
      stryCov_9fa48("2677");
      return await this.recipeLoader.getRecipeBySiteUrl(siteUrl);
    }
  }

  /**
   * Get recipe details by name
   */
  async getRecipeDetails(recipeName: string): Promise<RecipeConfig | null> {
    if (stryMutAct_9fa48("2678")) {
      {}
    } else {
      stryCov_9fa48("2678");
      try {
        if (stryMutAct_9fa48("2679")) {
          {}
        } else {
          stryCov_9fa48("2679");
          return await this.recipeLoader.loadRecipe(recipeName);
        }
      } catch (error) {
        if (stryMutAct_9fa48("2680")) {
          {}
        } else {
          stryCov_9fa48("2680");
          console.warn(stryMutAct_9fa48("2681") ? `` : (stryCov_9fa48("2681"), `Failed to get recipe details for '${recipeName}':`), error);
          return null;
        }
      }
    }
  }

  /**
   * Load recipe from file path
   */
  async loadRecipeFromFile(filePath: string): Promise<RecipeConfig> {
    if (stryMutAct_9fa48("2682")) {
      {}
    } else {
      stryCov_9fa48("2682");
      return await this.recipeLoader.loadRecipeFromFile(filePath);
    }
  }

  /**
   * Validate a recipe configuration
   */
  validateRecipe(recipe: RecipeConfig): boolean {
    if (stryMutAct_9fa48("2683")) {
      {}
    } else {
      stryCov_9fa48("2683");
      return this.recipeLoader.validateRecipe(recipe);
    }
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    if (stryMutAct_9fa48("2684")) {
      {}
    } else {
      stryCov_9fa48("2684");
      this.recipeLoader.clearCache();
      this.adapterCache.clear();
    }
  }

  /**
   * Get cached adapter
   */
  getCachedAdapter(recipeName: string, siteUrl: string): SiteAdapter | undefined {
    if (stryMutAct_9fa48("2685")) {
      {}
    } else {
      stryCov_9fa48("2685");
      const cacheKey = stryMutAct_9fa48("2686") ? `` : (stryCov_9fa48("2686"), `${recipeName}:${siteUrl}`);
      return this.adapterCache.get(cacheKey);
    }
  }

  /**
   * Remove adapter from cache
   */
  removeCachedAdapter(recipeName: string, siteUrl: string): boolean {
    if (stryMutAct_9fa48("2687")) {
      {}
    } else {
      stryCov_9fa48("2687");
      const cacheKey = stryMutAct_9fa48("2688") ? `` : (stryCov_9fa48("2688"), `${recipeName}:${siteUrl}`);
      return this.adapterCache.delete(cacheKey);
    }
  }

  /**
   * Validate that a recipe's site URL matches the requested site URL
   */
  private validateSiteUrl(recipeUrl: string, siteUrl: string): boolean {
    if (stryMutAct_9fa48("2689")) {
      {}
    } else {
      stryCov_9fa48("2689");
      try {
        if (stryMutAct_9fa48("2690")) {
          {}
        } else {
          stryCov_9fa48("2690");
          // Handle wildcard URLs
          if (stryMutAct_9fa48("2693") ? recipeUrl !== '*' : stryMutAct_9fa48("2692") ? false : stryMutAct_9fa48("2691") ? true : (stryCov_9fa48("2691", "2692", "2693"), recipeUrl === (stryMutAct_9fa48("2694") ? "" : (stryCov_9fa48("2694"), '*')))) {
            if (stryMutAct_9fa48("2695")) {
              {}
            } else {
              stryCov_9fa48("2695");
              return stryMutAct_9fa48("2696") ? false : (stryCov_9fa48("2696"), true); // Generic recipe matches any site
            }
          }
          if (stryMutAct_9fa48("2699") ? recipeUrl.endsWith('*.') : stryMutAct_9fa48("2698") ? false : stryMutAct_9fa48("2697") ? true : (stryCov_9fa48("2697", "2698", "2699"), recipeUrl.startsWith(stryMutAct_9fa48("2700") ? "" : (stryCov_9fa48("2700"), '*.')))) {
            if (stryMutAct_9fa48("2701")) {
              {}
            } else {
              stryCov_9fa48("2701");
              // Wildcard subdomain matching (e.g., *.co.il)
              const recipeDomain = stryMutAct_9fa48("2702") ? recipeUrl : (stryCov_9fa48("2702"), recipeUrl.substring(2)); // Remove "*."
              const siteHost = new URL(siteUrl).hostname;
              return stryMutAct_9fa48("2703") ? siteHost.startsWith(recipeDomain) : (stryCov_9fa48("2703"), siteHost.endsWith(recipeDomain));
            }
          }

          // Exact hostname matching
          const recipeHost = new URL(recipeUrl).hostname;
          const siteHost = new URL(siteUrl).hostname;
          return stryMutAct_9fa48("2706") ? recipeHost !== siteHost : stryMutAct_9fa48("2705") ? false : stryMutAct_9fa48("2704") ? true : (stryCov_9fa48("2704", "2705", "2706"), recipeHost === siteHost);
        }
      } catch {
        if (stryMutAct_9fa48("2707")) {
          {}
        } else {
          stryCov_9fa48("2707");
          return stryMutAct_9fa48("2708") ? true : (stryCov_9fa48("2708"), false);
        }
      }
    }
  }

  /**
   * Get recipe loader instance
   */
  getRecipeLoader(): RecipeLoader {
    if (stryMutAct_9fa48("2709")) {
      {}
    } else {
      stryCov_9fa48("2709");
      return this.recipeLoader;
    }
  }
}