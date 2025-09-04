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
  constructor(recipesDir: string = stryMutAct_9fa48("4792") ? "" : (stryCov_9fa48("4792"), './recipes'), recipeLoader?: RecipeLoader) {
    if (stryMutAct_9fa48("4793")) {
      {}
    } else {
      stryCov_9fa48("4793");
      this.recipesDir = recipesDir;
      this.recipeLoader = stryMutAct_9fa48("4796") ? recipeLoader && new RecipeLoader(recipesDir) : stryMutAct_9fa48("4795") ? false : stryMutAct_9fa48("4794") ? true : (stryCov_9fa48("4794", "4795", "4796"), recipeLoader || new RecipeLoader(recipesDir));
    }
  }

  /**
   * Create an adapter for a specific site using a recipe
   */
  async createAdapter(siteUrl: string, recipeName?: string): Promise<SiteAdapter> {
    if (stryMutAct_9fa48("4797")) {
      {}
    } else {
      stryCov_9fa48("4797");
      let recipe: RecipeConfig;
      if (stryMutAct_9fa48("4799") ? false : stryMutAct_9fa48("4798") ? true : (stryCov_9fa48("4798", "4799"), recipeName)) {
        if (stryMutAct_9fa48("4800")) {
          {}
        } else {
          stryCov_9fa48("4800");
          // Load specific recipe by name
          recipe = await this.recipeLoader.loadRecipe(recipeName);
        }
      } else {
        if (stryMutAct_9fa48("4801")) {
          {}
        } else {
          stryCov_9fa48("4801");
          // Try to auto-detect recipe by site URL
          const detectedRecipe = await this.recipeLoader.getRecipeBySiteUrl(siteUrl);
          if (stryMutAct_9fa48("4804") ? false : stryMutAct_9fa48("4803") ? true : stryMutAct_9fa48("4802") ? detectedRecipe : (stryCov_9fa48("4802", "4803", "4804"), !detectedRecipe)) {
            if (stryMutAct_9fa48("4805")) {
              {}
            } else {
              stryCov_9fa48("4805");
              throw new Error(stryMutAct_9fa48("4806") ? `` : (stryCov_9fa48("4806"), `No recipe found for site: ${siteUrl}`));
            }
          }
          recipe = detectedRecipe;
        }
      }

      // Validate that the recipe matches the site URL
      if (stryMutAct_9fa48("4809") ? false : stryMutAct_9fa48("4808") ? true : stryMutAct_9fa48("4807") ? this.validateSiteUrl(recipe.siteUrl, siteUrl) : (stryCov_9fa48("4807", "4808", "4809"), !this.validateSiteUrl(recipe.siteUrl, siteUrl))) {
        if (stryMutAct_9fa48("4810")) {
          {}
        } else {
          stryCov_9fa48("4810");
          throw new Error(stryMutAct_9fa48("4811") ? `` : (stryCov_9fa48("4811"), `Recipe '${recipe.name}' is configured for ${recipe.siteUrl}, not ${siteUrl}`));
        }
      }

      // Create cache key
      const cacheKey = stryMutAct_9fa48("4812") ? `` : (stryCov_9fa48("4812"), `${recipe.name}:${siteUrl}`);

      // Check if adapter is already cached
      if (stryMutAct_9fa48("4814") ? false : stryMutAct_9fa48("4813") ? true : (stryCov_9fa48("4813", "4814"), this.adapterCache.has(cacheKey))) {
        if (stryMutAct_9fa48("4815")) {
          {}
        } else {
          stryCov_9fa48("4815");
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
    if (stryMutAct_9fa48("4816")) {
      {}
    } else {
      stryCov_9fa48("4816");
      const recipe = await this.recipeLoader.loadRecipeFromFile(recipeFilePath);

      // Validate that the recipe matches the site URL
      if (stryMutAct_9fa48("4819") ? false : stryMutAct_9fa48("4818") ? true : stryMutAct_9fa48("4817") ? this.validateSiteUrl(recipe.siteUrl, siteUrl) : (stryCov_9fa48("4817", "4818", "4819"), !this.validateSiteUrl(recipe.siteUrl, siteUrl))) {
        if (stryMutAct_9fa48("4820")) {
          {}
        } else {
          stryCov_9fa48("4820");
          throw new Error(stryMutAct_9fa48("4821") ? `` : (stryCov_9fa48("4821"), `Recipe '${recipe.name}' is configured for ${recipe.siteUrl}, not ${siteUrl}`));
        }
      }

      // Create cache key
      const cacheKey = stryMutAct_9fa48("4822") ? `` : (stryCov_9fa48("4822"), `${recipe.name}:${siteUrl}`);

      // Check if adapter is already cached
      if (stryMutAct_9fa48("4824") ? false : stryMutAct_9fa48("4823") ? true : (stryCov_9fa48("4823", "4824"), this.adapterCache.has(cacheKey))) {
        if (stryMutAct_9fa48("4825")) {
          {}
        } else {
          stryCov_9fa48("4825");
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
    if (stryMutAct_9fa48("4826")) {
      {}
    } else {
      stryCov_9fa48("4826");
      return await this.recipeLoader.listAvailableRecipes();
    }
  }

  /**
   * List all available recipes with full details
   */
  async listRecipesWithDetails(): Promise<RecipeConfig[]> {
    if (stryMutAct_9fa48("4827")) {
      {}
    } else {
      stryCov_9fa48("4827");
      return await this.recipeLoader.listRecipesWithDetails();
    }
  }

  /**
   * Get recipe configuration by name
   */
  async getRecipe(recipeName: string): Promise<RecipeConfig> {
    if (stryMutAct_9fa48("4828")) {
      {}
    } else {
      stryCov_9fa48("4828");
      return await this.recipeLoader.loadRecipe(recipeName);
    }
  }

  /**
   * Get recipe configuration by site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<RecipeConfig | null> {
    if (stryMutAct_9fa48("4829")) {
      {}
    } else {
      stryCov_9fa48("4829");
      return await this.recipeLoader.getRecipeBySiteUrl(siteUrl);
    }
  }

  /**
   * Get recipe details by name
   */
  async getRecipeDetails(recipeName: string): Promise<RecipeConfig | null> {
    if (stryMutAct_9fa48("4830")) {
      {}
    } else {
      stryCov_9fa48("4830");
      try {
        if (stryMutAct_9fa48("4831")) {
          {}
        } else {
          stryCov_9fa48("4831");
          return await this.recipeLoader.loadRecipe(recipeName);
        }
      } catch (error) {
        if (stryMutAct_9fa48("4832")) {
          {}
        } else {
          stryCov_9fa48("4832");
          console.warn(stryMutAct_9fa48("4833") ? `` : (stryCov_9fa48("4833"), `Failed to get recipe details for '${recipeName}':`), error);
          return null;
        }
      }
    }
  }

  /**
   * Load recipe from file path
   */
  async loadRecipeFromFile(filePath: string): Promise<RecipeConfig> {
    if (stryMutAct_9fa48("4834")) {
      {}
    } else {
      stryCov_9fa48("4834");
      return await this.recipeLoader.loadRecipeFromFile(filePath);
    }
  }

  /**
   * Validate a recipe configuration
   */
  validateRecipe(recipe: RecipeConfig): boolean {
    if (stryMutAct_9fa48("4835")) {
      {}
    } else {
      stryCov_9fa48("4835");
      return this.recipeLoader.validateRecipe(recipe);
    }
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    if (stryMutAct_9fa48("4836")) {
      {}
    } else {
      stryCov_9fa48("4836");
      this.recipeLoader.clearCache();
      this.adapterCache.clear();
    }
  }

  /**
   * Get cached adapter
   */
  getCachedAdapter(recipeName: string, siteUrl: string): SiteAdapter | undefined {
    if (stryMutAct_9fa48("4837")) {
      {}
    } else {
      stryCov_9fa48("4837");
      const cacheKey = stryMutAct_9fa48("4838") ? `` : (stryCov_9fa48("4838"), `${recipeName}:${siteUrl}`);
      return this.adapterCache.get(cacheKey);
    }
  }

  /**
   * Remove adapter from cache
   */
  removeCachedAdapter(recipeName: string, siteUrl: string): boolean {
    if (stryMutAct_9fa48("4839")) {
      {}
    } else {
      stryCov_9fa48("4839");
      const cacheKey = stryMutAct_9fa48("4840") ? `` : (stryCov_9fa48("4840"), `${recipeName}:${siteUrl}`);
      return this.adapterCache.delete(cacheKey);
    }
  }

  /**
   * Validate that a recipe's site URL matches the requested site URL
   */
  private validateSiteUrl(recipeUrl: string, siteUrl: string): boolean {
    if (stryMutAct_9fa48("4841")) {
      {}
    } else {
      stryCov_9fa48("4841");
      try {
        if (stryMutAct_9fa48("4842")) {
          {}
        } else {
          stryCov_9fa48("4842");
          // Handle wildcard URLs
          if (stryMutAct_9fa48("4845") ? recipeUrl !== '*' : stryMutAct_9fa48("4844") ? false : stryMutAct_9fa48("4843") ? true : (stryCov_9fa48("4843", "4844", "4845"), recipeUrl === (stryMutAct_9fa48("4846") ? "" : (stryCov_9fa48("4846"), '*')))) {
            if (stryMutAct_9fa48("4847")) {
              {}
            } else {
              stryCov_9fa48("4847");
              return stryMutAct_9fa48("4848") ? false : (stryCov_9fa48("4848"), true); // Generic recipe matches any site
            }
          }
          if (stryMutAct_9fa48("4851") ? recipeUrl.endsWith('*.') : stryMutAct_9fa48("4850") ? false : stryMutAct_9fa48("4849") ? true : (stryCov_9fa48("4849", "4850", "4851"), recipeUrl.startsWith(stryMutAct_9fa48("4852") ? "" : (stryCov_9fa48("4852"), '*.')))) {
            if (stryMutAct_9fa48("4853")) {
              {}
            } else {
              stryCov_9fa48("4853");
              // Wildcard subdomain matching (e.g., *.co.il)
              const recipeDomain = stryMutAct_9fa48("4854") ? recipeUrl : (stryCov_9fa48("4854"), recipeUrl.substring(2)); // Remove "*."
              const siteHost = new URL(siteUrl).hostname;
              return stryMutAct_9fa48("4855") ? siteHost.startsWith(recipeDomain) : (stryCov_9fa48("4855"), siteHost.endsWith(recipeDomain));
            }
          }

          // Exact hostname matching
          const recipeHost = new URL(recipeUrl).hostname;
          const siteHost = new URL(siteUrl).hostname;
          return stryMutAct_9fa48("4858") ? recipeHost !== siteHost : stryMutAct_9fa48("4857") ? false : stryMutAct_9fa48("4856") ? true : (stryCov_9fa48("4856", "4857", "4858"), recipeHost === siteHost);
        }
      } catch {
        if (stryMutAct_9fa48("4859")) {
          {}
        } else {
          stryCov_9fa48("4859");
          return stryMutAct_9fa48("4860") ? true : (stryCov_9fa48("4860"), false);
        }
      }
    }
  }

  /**
   * Get recipe loader instance
   */
  getRecipeLoader(): RecipeLoader {
    if (stryMutAct_9fa48("4861")) {
      {}
    } else {
      stryCov_9fa48("4861");
      return this.recipeLoader;
    }
  }
}