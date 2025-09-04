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
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { parse } from 'yaml';
import { RecipeConfig } from '../types';
export class RecipeLoader implements RecipeLoader {
  private recipesDir: string;
  private recipesCache: Map<string, RecipeConfig> = new Map();
  constructor(recipesDir: string = stryMutAct_9fa48("4597") ? "" : (stryCov_9fa48("4597"), './recipes')) {
    if (stryMutAct_9fa48("4598")) {
      {}
    } else {
      stryCov_9fa48("4598");
      this.recipesDir = recipesDir;
    }
  }

  /**
   * Load a recipe by name from the recipes directory
   */
  async loadRecipe(recipeName: string): Promise<RecipeConfig> {
    if (stryMutAct_9fa48("4599")) {
      {}
    } else {
      stryCov_9fa48("4599");
      // Check cache first
      if (stryMutAct_9fa48("4601") ? false : stryMutAct_9fa48("4600") ? true : (stryCov_9fa48("4600", "4601"), this.recipesCache.has(recipeName))) {
        if (stryMutAct_9fa48("4602")) {
          {}
        } else {
          stryCov_9fa48("4602");
          return this.recipesCache.get(recipeName)!;
        }
      }

      // Look for recipe files
      const recipeFiles = this.findRecipeFiles();
      for (const filePath of recipeFiles) {
        if (stryMutAct_9fa48("4603")) {
          {}
        } else {
          stryCov_9fa48("4603");
          try {
            if (stryMutAct_9fa48("4604")) {
              {}
            } else {
              stryCov_9fa48("4604");
              const recipe = await this.loadRecipeFromFile(filePath);
              if (stryMutAct_9fa48("4607") ? recipe.name !== recipeName : stryMutAct_9fa48("4606") ? false : stryMutAct_9fa48("4605") ? true : (stryCov_9fa48("4605", "4606", "4607"), recipe.name === recipeName)) {
                if (stryMutAct_9fa48("4608")) {
                  {}
                } else {
                  stryCov_9fa48("4608");
                  this.recipesCache.set(recipeName, recipe);
                  return recipe;
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("4609")) {
              {}
            } else {
              stryCov_9fa48("4609");
              console.warn(stryMutAct_9fa48("4610") ? `` : (stryCov_9fa48("4610"), `Failed to load recipe from ${filePath}:`), error);
            }
          }
        }
      }
      throw new Error(stryMutAct_9fa48("4611") ? `` : (stryCov_9fa48("4611"), `Recipe '${recipeName}' not found`));
    }
  }

  /**
   * Load a recipe from a specific file path
   */
  async loadRecipeFromFile(filePath: string): Promise<RecipeConfig> {
    if (stryMutAct_9fa48("4612")) {
      {}
    } else {
      stryCov_9fa48("4612");
      if (stryMutAct_9fa48("4615") ? false : stryMutAct_9fa48("4614") ? true : stryMutAct_9fa48("4613") ? existsSync(filePath) : (stryCov_9fa48("4613", "4614", "4615"), !existsSync(filePath))) {
        if (stryMutAct_9fa48("4616")) {
          {}
        } else {
          stryCov_9fa48("4616");
          throw new Error(stryMutAct_9fa48("4617") ? `` : (stryCov_9fa48("4617"), `Recipe file not found: ${filePath}`));
        }
      }
      const fileContent = readFileSync(filePath, stryMutAct_9fa48("4618") ? "" : (stryCov_9fa48("4618"), 'utf-8'));
      const ext = stryMutAct_9fa48("4619") ? extname(filePath).toUpperCase() : (stryCov_9fa48("4619"), extname(filePath).toLowerCase());
      let recipeData: Record<string, unknown>;
      try {
        if (stryMutAct_9fa48("4620")) {
          {}
        } else {
          stryCov_9fa48("4620");
          if (stryMutAct_9fa48("4623") ? ext === '.yaml' && ext === '.yml' : stryMutAct_9fa48("4622") ? false : stryMutAct_9fa48("4621") ? true : (stryCov_9fa48("4621", "4622", "4623"), (stryMutAct_9fa48("4625") ? ext !== '.yaml' : stryMutAct_9fa48("4624") ? false : (stryCov_9fa48("4624", "4625"), ext === (stryMutAct_9fa48("4626") ? "" : (stryCov_9fa48("4626"), '.yaml')))) || (stryMutAct_9fa48("4628") ? ext !== '.yml' : stryMutAct_9fa48("4627") ? false : (stryCov_9fa48("4627", "4628"), ext === (stryMutAct_9fa48("4629") ? "" : (stryCov_9fa48("4629"), '.yml')))))) {
            if (stryMutAct_9fa48("4630")) {
              {}
            } else {
              stryCov_9fa48("4630");
              recipeData = parse(fileContent);
            }
          } else if (stryMutAct_9fa48("4633") ? ext !== '.json' : stryMutAct_9fa48("4632") ? false : stryMutAct_9fa48("4631") ? true : (stryCov_9fa48("4631", "4632", "4633"), ext === (stryMutAct_9fa48("4634") ? "" : (stryCov_9fa48("4634"), '.json')))) {
            if (stryMutAct_9fa48("4635")) {
              {}
            } else {
              stryCov_9fa48("4635");
              recipeData = JSON.parse(fileContent);
            }
          } else {
            if (stryMutAct_9fa48("4636")) {
              {}
            } else {
              stryCov_9fa48("4636");
              throw new Error(stryMutAct_9fa48("4637") ? `` : (stryCov_9fa48("4637"), `Unsupported file format: ${ext}`));
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("4638")) {
          {}
        } else {
          stryCov_9fa48("4638");
          throw new Error(stryMutAct_9fa48("4639") ? `` : (stryCov_9fa48("4639"), `Failed to parse recipe file ${filePath}: ${error}`));
        }
      }

      // Handle both single recipe and recipe collection files
      let recipe: RecipeConfig;
      if (stryMutAct_9fa48("4642") ? recipeData.recipes || Array.isArray(recipeData.recipes) : stryMutAct_9fa48("4641") ? false : stryMutAct_9fa48("4640") ? true : (stryCov_9fa48("4640", "4641", "4642"), recipeData.recipes && Array.isArray(recipeData.recipes))) {
        if (stryMutAct_9fa48("4643")) {
          {}
        } else {
          stryCov_9fa48("4643");
          // Recipe collection file
          if (stryMutAct_9fa48("4646") ? recipeData.recipes.length !== 0 : stryMutAct_9fa48("4645") ? false : stryMutAct_9fa48("4644") ? true : (stryCov_9fa48("4644", "4645", "4646"), recipeData.recipes.length === 0)) {
            if (stryMutAct_9fa48("4647")) {
              {}
            } else {
              stryCov_9fa48("4647");
              throw new Error(stryMutAct_9fa48("4648") ? `` : (stryCov_9fa48("4648"), `No recipes found in ${filePath}`));
            }
          }
          recipe = recipeData.recipes[0] as unknown as RecipeConfig; // Return first recipe for now
        }
      } else if (stryMutAct_9fa48("4651") ? recipeData.name || recipeData.selectors : stryMutAct_9fa48("4650") ? false : stryMutAct_9fa48("4649") ? true : (stryCov_9fa48("4649", "4650", "4651"), recipeData.name && recipeData.selectors)) {
        if (stryMutAct_9fa48("4652")) {
          {}
        } else {
          stryCov_9fa48("4652");
          // Single recipe file
          recipe = recipeData as unknown as RecipeConfig;
        }
      } else {
        if (stryMutAct_9fa48("4653")) {
          {}
        } else {
          stryCov_9fa48("4653");
          throw new Error(stryMutAct_9fa48("4654") ? `` : (stryCov_9fa48("4654"), `Invalid recipe format in ${filePath}`));
        }
      }

      // Validate the recipe
      if (stryMutAct_9fa48("4657") ? false : stryMutAct_9fa48("4656") ? true : stryMutAct_9fa48("4655") ? this.validateRecipe(recipe) : (stryCov_9fa48("4655", "4656", "4657"), !this.validateRecipe(recipe))) {
        if (stryMutAct_9fa48("4658")) {
          {}
        } else {
          stryCov_9fa48("4658");
          throw new Error(stryMutAct_9fa48("4659") ? `` : (stryCov_9fa48("4659"), `Invalid recipe configuration in ${filePath}`));
        }
      }
      return recipe;
    }
  }

  /**
   * Load a recipe from a URL
   */
  async loadRecipeFromUrl(): Promise<RecipeConfig> {
    if (stryMutAct_9fa48("4660")) {
      {}
    } else {
      stryCov_9fa48("4660");
      // This would require HTTP client implementation
      // For now, we'll throw an error
      throw new Error(stryMutAct_9fa48("4661") ? "" : (stryCov_9fa48("4661"), 'Loading recipes from URL not yet implemented'));
    }
  }

  /**
   * List all available recipe names
   */
  async listAvailableRecipes(): Promise<string[]> {
    if (stryMutAct_9fa48("4662")) {
      {}
    } else {
      stryCov_9fa48("4662");
      const recipeFiles = this.findRecipeFiles();
      const recipeNames: string[] = stryMutAct_9fa48("4663") ? ["Stryker was here"] : (stryCov_9fa48("4663"), []);
      for (const filePath of recipeFiles) {
        if (stryMutAct_9fa48("4664")) {
          {}
        } else {
          stryCov_9fa48("4664");
          try {
            if (stryMutAct_9fa48("4665")) {
              {}
            } else {
              stryCov_9fa48("4665");
              const recipe = await this.loadRecipeFromFile(filePath);
              recipeNames.push(recipe.name);
            }
          } catch (error) {
            if (stryMutAct_9fa48("4666")) {
              {}
            } else {
              stryCov_9fa48("4666");
              console.warn(stryMutAct_9fa48("4667") ? `` : (stryCov_9fa48("4667"), `Failed to load recipe from ${filePath}:`), error);
            }
          }
        }
      }
      return recipeNames;
    }
  }

  /**
   * List all available recipes with full details
   */
  async listRecipesWithDetails(): Promise<RecipeConfig[]> {
    if (stryMutAct_9fa48("4668")) {
      {}
    } else {
      stryCov_9fa48("4668");
      const recipeFiles = this.findRecipeFiles();
      const recipes: RecipeConfig[] = stryMutAct_9fa48("4669") ? ["Stryker was here"] : (stryCov_9fa48("4669"), []);
      for (const filePath of recipeFiles) {
        if (stryMutAct_9fa48("4670")) {
          {}
        } else {
          stryCov_9fa48("4670");
          try {
            if (stryMutAct_9fa48("4671")) {
              {}
            } else {
              stryCov_9fa48("4671");
              const recipe = await this.loadRecipeFromFile(filePath);
              recipes.push(recipe);
            }
          } catch (error) {
            if (stryMutAct_9fa48("4672")) {
              {}
            } else {
              stryCov_9fa48("4672");
              console.warn(stryMutAct_9fa48("4673") ? `` : (stryCov_9fa48("4673"), `Failed to load recipe from ${filePath}:`), error);
            }
          }
        }
      }
      return recipes;
    }
  }

  /**
   * Validate a recipe configuration
   */
  validateRecipe(recipe: RecipeConfig): boolean {
    if (stryMutAct_9fa48("4674")) {
      {}
    } else {
      stryCov_9fa48("4674");
      // Check required fields
      if (stryMutAct_9fa48("4677") ? (!recipe.name || !recipe.version) && !recipe.siteUrl : stryMutAct_9fa48("4676") ? false : stryMutAct_9fa48("4675") ? true : (stryCov_9fa48("4675", "4676", "4677"), (stryMutAct_9fa48("4679") ? !recipe.name && !recipe.version : stryMutAct_9fa48("4678") ? false : (stryCov_9fa48("4678", "4679"), (stryMutAct_9fa48("4680") ? recipe.name : (stryCov_9fa48("4680"), !recipe.name)) || (stryMutAct_9fa48("4681") ? recipe.version : (stryCov_9fa48("4681"), !recipe.version)))) || (stryMutAct_9fa48("4682") ? recipe.siteUrl : (stryCov_9fa48("4682"), !recipe.siteUrl)))) {
        if (stryMutAct_9fa48("4683")) {
          {}
        } else {
          stryCov_9fa48("4683");
          return stryMutAct_9fa48("4684") ? true : (stryCov_9fa48("4684"), false);
        }
      }

      // Check required selectors
      if (stryMutAct_9fa48("4687") ? (!recipe.selectors.title || !recipe.selectors.price) && !recipe.selectors.images : stryMutAct_9fa48("4686") ? false : stryMutAct_9fa48("4685") ? true : (stryCov_9fa48("4685", "4686", "4687"), (stryMutAct_9fa48("4689") ? !recipe.selectors.title && !recipe.selectors.price : stryMutAct_9fa48("4688") ? false : (stryCov_9fa48("4688", "4689"), (stryMutAct_9fa48("4690") ? recipe.selectors.title : (stryCov_9fa48("4690"), !recipe.selectors.title)) || (stryMutAct_9fa48("4691") ? recipe.selectors.price : (stryCov_9fa48("4691"), !recipe.selectors.price)))) || (stryMutAct_9fa48("4692") ? recipe.selectors.images : (stryCov_9fa48("4692"), !recipe.selectors.images)))) {
        if (stryMutAct_9fa48("4693")) {
          {}
        } else {
          stryCov_9fa48("4693");
          return stryMutAct_9fa48("4694") ? true : (stryCov_9fa48("4694"), false);
        }
      }

      // Validate selectors are not empty
      const requiredSelectors = stryMutAct_9fa48("4695") ? [] : (stryCov_9fa48("4695"), [stryMutAct_9fa48("4696") ? "" : (stryCov_9fa48("4696"), 'title'), stryMutAct_9fa48("4697") ? "" : (stryCov_9fa48("4697"), 'price'), stryMutAct_9fa48("4698") ? "" : (stryCov_9fa48("4698"), 'images')]);
      for (const selector of requiredSelectors) {
        if (stryMutAct_9fa48("4699")) {
          {}
        } else {
          stryCov_9fa48("4699");
          const value = recipe.selectors[selector as keyof typeof recipe.selectors];
          if (stryMutAct_9fa48("4702") ? !value && Array.isArray(value) && value.length === 0 : stryMutAct_9fa48("4701") ? false : stryMutAct_9fa48("4700") ? true : (stryCov_9fa48("4700", "4701", "4702"), (stryMutAct_9fa48("4703") ? value : (stryCov_9fa48("4703"), !value)) || (stryMutAct_9fa48("4705") ? Array.isArray(value) || value.length === 0 : stryMutAct_9fa48("4704") ? false : (stryCov_9fa48("4704", "4705"), Array.isArray(value) && (stryMutAct_9fa48("4707") ? value.length !== 0 : stryMutAct_9fa48("4706") ? true : (stryCov_9fa48("4706", "4707"), value.length === 0)))))) {
            if (stryMutAct_9fa48("4708")) {
              {}
            } else {
              stryCov_9fa48("4708");
              return stryMutAct_9fa48("4709") ? true : (stryCov_9fa48("4709"), false);
            }
          }
        }
      }
      return stryMutAct_9fa48("4710") ? false : (stryCov_9fa48("4710"), true);
    }
  }

  /**
   * Find all recipe files in the recipes directory
   */
  private findRecipeFiles(): string[] {
    if (stryMutAct_9fa48("4711")) {
      {}
    } else {
      stryCov_9fa48("4711");
      if (stryMutAct_9fa48("4714") ? false : stryMutAct_9fa48("4713") ? true : stryMutAct_9fa48("4712") ? existsSync(this.recipesDir) : (stryCov_9fa48("4712", "4713", "4714"), !existsSync(this.recipesDir))) {
        if (stryMutAct_9fa48("4715")) {
          {}
        } else {
          stryCov_9fa48("4715");
          return stryMutAct_9fa48("4716") ? ["Stryker was here"] : (stryCov_9fa48("4716"), []);
        }
      }
      const files: string[] = stryMutAct_9fa48("4717") ? ["Stryker was here"] : (stryCov_9fa48("4717"), []);
      const items = readdirSync(this.recipesDir, stryMutAct_9fa48("4718") ? {} : (stryCov_9fa48("4718"), {
        withFileTypes: stryMutAct_9fa48("4719") ? false : (stryCov_9fa48("4719"), true)
      }));
      for (const item of items) {
        if (stryMutAct_9fa48("4720")) {
          {}
        } else {
          stryCov_9fa48("4720");
          if (stryMutAct_9fa48("4722") ? false : stryMutAct_9fa48("4721") ? true : (stryCov_9fa48("4721", "4722"), item.isFile())) {
            if (stryMutAct_9fa48("4723")) {
              {}
            } else {
              stryCov_9fa48("4723");
              const ext = stryMutAct_9fa48("4724") ? extname(item.name).toUpperCase() : (stryCov_9fa48("4724"), extname(item.name).toLowerCase());
              if (stryMutAct_9fa48("4727") ? (ext === '.yaml' || ext === '.yml') && ext === '.json' : stryMutAct_9fa48("4726") ? false : stryMutAct_9fa48("4725") ? true : (stryCov_9fa48("4725", "4726", "4727"), (stryMutAct_9fa48("4729") ? ext === '.yaml' && ext === '.yml' : stryMutAct_9fa48("4728") ? false : (stryCov_9fa48("4728", "4729"), (stryMutAct_9fa48("4731") ? ext !== '.yaml' : stryMutAct_9fa48("4730") ? false : (stryCov_9fa48("4730", "4731"), ext === (stryMutAct_9fa48("4732") ? "" : (stryCov_9fa48("4732"), '.yaml')))) || (stryMutAct_9fa48("4734") ? ext !== '.yml' : stryMutAct_9fa48("4733") ? false : (stryCov_9fa48("4733", "4734"), ext === (stryMutAct_9fa48("4735") ? "" : (stryCov_9fa48("4735"), '.yml')))))) || (stryMutAct_9fa48("4737") ? ext !== '.json' : stryMutAct_9fa48("4736") ? false : (stryCov_9fa48("4736", "4737"), ext === (stryMutAct_9fa48("4738") ? "" : (stryCov_9fa48("4738"), '.json')))))) {
                if (stryMutAct_9fa48("4739")) {
                  {}
                } else {
                  stryCov_9fa48("4739");
                  files.push(join(this.recipesDir, item.name));
                }
              }
            }
          }
        }
      }
      return files;
    }
  }

  /**
   * Get recipe by site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<RecipeConfig | null> {
    if (stryMutAct_9fa48("4740")) {
      {}
    } else {
      stryCov_9fa48("4740");
      const recipeFiles = this.findRecipeFiles();
      const matchingRecipes: Array<{
        recipe: RecipeConfig;
        specificity: number;
      }> = stryMutAct_9fa48("4741") ? ["Stryker was here"] : (stryCov_9fa48("4741"), []);
      for (const filePath of recipeFiles) {
        if (stryMutAct_9fa48("4742")) {
          {}
        } else {
          stryCov_9fa48("4742");
          try {
            if (stryMutAct_9fa48("4743")) {
              {}
            } else {
              stryCov_9fa48("4743");
              const recipe = await this.loadRecipeFromFile(filePath);
              if (stryMutAct_9fa48("4745") ? false : stryMutAct_9fa48("4744") ? true : (stryCov_9fa48("4744", "4745"), this.matchesSiteUrl(recipe.siteUrl, siteUrl))) {
                if (stryMutAct_9fa48("4746")) {
                  {}
                } else {
                  stryCov_9fa48("4746");
                  // Calculate specificity: exact match = 3, wildcard subdomain = 2, generic = 1
                  let specificity = 1;
                  if (stryMutAct_9fa48("4749") ? recipe.siteUrl !== '*' : stryMutAct_9fa48("4748") ? false : stryMutAct_9fa48("4747") ? true : (stryCov_9fa48("4747", "4748", "4749"), recipe.siteUrl === (stryMutAct_9fa48("4750") ? "" : (stryCov_9fa48("4750"), '*')))) {
                    if (stryMutAct_9fa48("4751")) {
                      {}
                    } else {
                      stryCov_9fa48("4751");
                      specificity = 1; // Generic recipe
                    }
                  } else if (stryMutAct_9fa48("4754") ? recipe.siteUrl.endsWith('*.') : stryMutAct_9fa48("4753") ? false : stryMutAct_9fa48("4752") ? true : (stryCov_9fa48("4752", "4753", "4754"), recipe.siteUrl.startsWith(stryMutAct_9fa48("4755") ? "" : (stryCov_9fa48("4755"), '*.')))) {
                    if (stryMutAct_9fa48("4756")) {
                      {}
                    } else {
                      stryCov_9fa48("4756");
                      specificity = 2; // Wildcard subdomain
                    }
                  } else {
                    if (stryMutAct_9fa48("4757")) {
                      {}
                    } else {
                      stryCov_9fa48("4757");
                      specificity = 3; // Exact match
                    }
                  }
                  matchingRecipes.push(stryMutAct_9fa48("4758") ? {} : (stryCov_9fa48("4758"), {
                    recipe,
                    specificity
                  }));
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("4759")) {
              {}
            } else {
              stryCov_9fa48("4759");
              console.warn(stryMutAct_9fa48("4760") ? `` : (stryCov_9fa48("4760"), `Failed to load recipe from ${filePath}:`), error);
            }
          }
        }
      }
      if (stryMutAct_9fa48("4763") ? matchingRecipes.length !== 0 : stryMutAct_9fa48("4762") ? false : stryMutAct_9fa48("4761") ? true : (stryCov_9fa48("4761", "4762", "4763"), matchingRecipes.length === 0)) {
        if (stryMutAct_9fa48("4764")) {
          {}
        } else {
          stryCov_9fa48("4764");
          return null;
        }
      }

      // Sort by specificity (highest first) and return the most specific match
      stryMutAct_9fa48("4765") ? matchingRecipes : (stryCov_9fa48("4765"), matchingRecipes.sort(stryMutAct_9fa48("4766") ? () => undefined : (stryCov_9fa48("4766"), (a, b) => stryMutAct_9fa48("4767") ? b.specificity + a.specificity : (stryCov_9fa48("4767"), b.specificity - a.specificity))));
      const selectedRecipe = matchingRecipes[0]!; // We know this exists because we checked length > 0
      return selectedRecipe.recipe;
    }
  }

  /**
   * Check if a recipe matches a given site URL
   */
  private matchesSiteUrl(recipeUrl: string, siteUrl: string): boolean {
    if (stryMutAct_9fa48("4768")) {
      {}
    } else {
      stryCov_9fa48("4768");
      try {
        if (stryMutAct_9fa48("4769")) {
          {}
        } else {
          stryCov_9fa48("4769");
          // Handle wildcard URLs
          if (stryMutAct_9fa48("4772") ? recipeUrl !== '*' : stryMutAct_9fa48("4771") ? false : stryMutAct_9fa48("4770") ? true : (stryCov_9fa48("4770", "4771", "4772"), recipeUrl === (stryMutAct_9fa48("4773") ? "" : (stryCov_9fa48("4773"), '*')))) {
            if (stryMutAct_9fa48("4774")) {
              {}
            } else {
              stryCov_9fa48("4774");
              return stryMutAct_9fa48("4775") ? false : (stryCov_9fa48("4775"), true); // Generic recipe matches any site
            }
          }
          if (stryMutAct_9fa48("4778") ? recipeUrl.endsWith('*.') : stryMutAct_9fa48("4777") ? false : stryMutAct_9fa48("4776") ? true : (stryCov_9fa48("4776", "4777", "4778"), recipeUrl.startsWith(stryMutAct_9fa48("4779") ? "" : (stryCov_9fa48("4779"), '*.')))) {
            if (stryMutAct_9fa48("4780")) {
              {}
            } else {
              stryCov_9fa48("4780");
              // Wildcard subdomain matching (e.g., *.co.il)
              const recipeDomain = stryMutAct_9fa48("4781") ? recipeUrl : (stryCov_9fa48("4781"), recipeUrl.substring(2)); // Remove "*."
              const siteHost = new URL(siteUrl).hostname;
              return stryMutAct_9fa48("4782") ? siteHost.startsWith(recipeDomain) : (stryCov_9fa48("4782"), siteHost.endsWith(recipeDomain));
            }
          }

          // Exact hostname matching
          const recipeHost = new URL(recipeUrl).hostname;
          const siteHost = new URL(siteUrl).hostname;
          return stryMutAct_9fa48("4785") ? recipeHost !== siteHost : stryMutAct_9fa48("4784") ? false : stryMutAct_9fa48("4783") ? true : (stryCov_9fa48("4783", "4784", "4785"), recipeHost === siteHost);
        }
      } catch {
        if (stryMutAct_9fa48("4786")) {
          {}
        } else {
          stryCov_9fa48("4786");
          return stryMutAct_9fa48("4787") ? true : (stryCov_9fa48("4787"), false);
        }
      }
    }
  }

  /**
   * Clear the recipe cache
   */
  clearCache(): void {
    if (stryMutAct_9fa48("4788")) {
      {}
    } else {
      stryCov_9fa48("4788");
      this.recipesCache.clear();
    }
  }

  /**
   * Get cached recipe
   */
  getCachedRecipe(recipeName: string): RecipeConfig | undefined {
    if (stryMutAct_9fa48("4789")) {
      {}
    } else {
      stryCov_9fa48("4789");
      return this.recipesCache.get(recipeName);
    }
  }

  /**
   * Set the directory for recipe files
   */
  setRecipeDirectory(directory: string): void {
    if (stryMutAct_9fa48("4790")) {
      {}
    } else {
      stryCov_9fa48("4790");
      this.recipesDir = directory;
    }
  }

  /**
   * Get the current directory for recipe files
   */
  getRecipeDirectory(): string {
    if (stryMutAct_9fa48("4791")) {
      {}
    } else {
      stryCov_9fa48("4791");
      return this.recipesDir;
    }
  }
}