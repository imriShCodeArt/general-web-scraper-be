#!/usr/bin/env ts-node
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
import { RecipeManager } from '../lib/recipe-manager';
import { Command } from 'commander';
import { rootContainer, TOKENS, initializeServices, cleanupServices } from '../lib/composition-root';
const program = new Command();
let recipeManager: RecipeManager;

// Initialize services before running CLI
async function initializeCLI() {
  if (stryMutAct_9fa48("377")) {
    {}
  } else {
    stryCov_9fa48("377");
    try {
      if (stryMutAct_9fa48("378")) {
        {}
      } else {
        stryCov_9fa48("378");
        await initializeServices();
        recipeManager = await rootContainer.resolve<RecipeManager>(TOKENS.RecipeManager);
      }
    } catch (error) {
      if (stryMutAct_9fa48("379")) {
        {}
      } else {
        stryCov_9fa48("379");
        console.error(stryMutAct_9fa48("380") ? "" : (stryCov_9fa48("380"), 'Failed to initialize services:'), error);
        process.exit(1);
      }
    }
  }
}

// Cleanup services when CLI exits
async function cleanupCLI() {
  if (stryMutAct_9fa48("381")) {
    {}
  } else {
    stryCov_9fa48("381");
    try {
      if (stryMutAct_9fa48("382")) {
        {}
      } else {
        stryCov_9fa48("382");
        await cleanupServices();
      }
    } catch (error) {
      if (stryMutAct_9fa48("383")) {
        {}
      } else {
        stryCov_9fa48("383");
        console.error(stryMutAct_9fa48("384") ? "" : (stryCov_9fa48("384"), 'Failed to cleanup services:'), error);
      }
    }
  }
}

// Handle process termination
process.on(stryMutAct_9fa48("385") ? "" : (stryCov_9fa48("385"), 'SIGINT'), async () => {
  if (stryMutAct_9fa48("386")) {
    {}
  } else {
    stryCov_9fa48("386");
    await cleanupCLI();
    process.exit(0);
  }
});
process.on(stryMutAct_9fa48("387") ? "" : (stryCov_9fa48("387"), 'SIGTERM'), async () => {
  if (stryMutAct_9fa48("388")) {
    {}
  } else {
    stryCov_9fa48("388");
    await cleanupCLI();
    process.exit(0);
  }
});
program.name(stryMutAct_9fa48("389") ? "" : (stryCov_9fa48("389"), 'recipe-cli')).description(stryMutAct_9fa48("390") ? "" : (stryCov_9fa48("390"), 'CLI tool for managing web scraper recipes')).version(stryMutAct_9fa48("391") ? "" : (stryCov_9fa48("391"), '1.0.0'));
program.command(stryMutAct_9fa48("392") ? "" : (stryCov_9fa48("392"), 'list')).description(stryMutAct_9fa48("393") ? "" : (stryCov_9fa48("393"), 'List all available recipes')).action(async () => {
  if (stryMutAct_9fa48("394")) {
    {}
  } else {
    stryCov_9fa48("394");
    try {
      if (stryMutAct_9fa48("395")) {
        {}
      } else {
        stryCov_9fa48("395");
        const recipes = await recipeManager.listRecipes();
        if (stryMutAct_9fa48("398") ? recipes.length !== 0 : stryMutAct_9fa48("397") ? false : stryMutAct_9fa48("396") ? true : (stryCov_9fa48("396", "397", "398"), recipes.length === 0)) {
          if (stryMutAct_9fa48("399")) {
            {}
          } else {
            stryCov_9fa48("399");
            console.log(stryMutAct_9fa48("400") ? "" : (stryCov_9fa48("400"), 'No recipes found.'));
            return;
          }
        }
        console.log(stryMutAct_9fa48("401") ? "" : (stryCov_9fa48("401"), 'Available recipes:'));
        recipes.forEach((recipe, index) => {
          if (stryMutAct_9fa48("402")) {
            {}
          } else {
            stryCov_9fa48("402");
            console.log(stryMutAct_9fa48("403") ? `` : (stryCov_9fa48("403"), `  ${stryMutAct_9fa48("404") ? index - 1 : (stryCov_9fa48("404"), index + 1)}. ${recipe}`));
          }
        });
      }
    } catch (error) {
      if (stryMutAct_9fa48("405")) {
        {}
      } else {
        stryCov_9fa48("405");
        console.error(stryMutAct_9fa48("406") ? "" : (stryCov_9fa48("406"), 'Failed to list recipes:'), error);
      }
    }
  }
});
program.command(stryMutAct_9fa48("407") ? "" : (stryCov_9fa48("407"), 'show <recipeName>')).description(stryMutAct_9fa48("408") ? "" : (stryCov_9fa48("408"), 'Show recipe configuration')).action(async (recipeName: string) => {
  if (stryMutAct_9fa48("409")) {
    {}
  } else {
    stryCov_9fa48("409");
    try {
      if (stryMutAct_9fa48("410")) {
        {}
      } else {
        stryCov_9fa48("410");
        const recipe = await recipeManager.getRecipe(recipeName);
        console.log(stryMutAct_9fa48("411") ? `` : (stryCov_9fa48("411"), `Recipe: ${recipe.name}`));
        console.log(stryMutAct_9fa48("412") ? `` : (stryCov_9fa48("412"), `Description: ${stryMutAct_9fa48("415") ? recipe.description && 'No description' : stryMutAct_9fa48("414") ? false : stryMutAct_9fa48("413") ? true : (stryCov_9fa48("413", "414", "415"), recipe.description || (stryMutAct_9fa48("416") ? "" : (stryCov_9fa48("416"), 'No description')))}`));
        console.log(stryMutAct_9fa48("417") ? `` : (stryCov_9fa48("417"), `Version: ${recipe.version}`));
        console.log(stryMutAct_9fa48("418") ? `` : (stryCov_9fa48("418"), `Site URL: ${recipe.siteUrl}`));
        console.log(stryMutAct_9fa48("419") ? "" : (stryCov_9fa48("419"), '\nSelectors:'));
        Object.entries(recipe.selectors).forEach(([key, value]) => {
          if (stryMutAct_9fa48("420")) {
            {}
          } else {
            stryCov_9fa48("420");
            if (stryMutAct_9fa48("422") ? false : stryMutAct_9fa48("421") ? true : (stryCov_9fa48("421", "422"), Array.isArray(value))) {
              if (stryMutAct_9fa48("423")) {
                {}
              } else {
                stryCov_9fa48("423");
                console.log(stryMutAct_9fa48("424") ? `` : (stryCov_9fa48("424"), `  ${key}: [${value.join(stryMutAct_9fa48("425") ? "" : (stryCov_9fa48("425"), ', '))}]`));
              }
            } else {
              if (stryMutAct_9fa48("426")) {
                {}
              } else {
                stryCov_9fa48("426");
                console.log(stryMutAct_9fa48("427") ? `` : (stryCov_9fa48("427"), `  ${key}: ${value}`));
              }
            }
          }
        });
        if (stryMutAct_9fa48("429") ? false : stryMutAct_9fa48("428") ? true : (stryCov_9fa48("428", "429"), recipe.transforms)) {
          if (stryMutAct_9fa48("430")) {
            {}
          } else {
            stryCov_9fa48("430");
            console.log(stryMutAct_9fa48("431") ? "" : (stryCov_9fa48("431"), '\nTransformations:'));
            Object.entries(recipe.transforms).forEach(([key, value]) => {
              if (stryMutAct_9fa48("432")) {
                {}
              } else {
                stryCov_9fa48("432");
                if (stryMutAct_9fa48("434") ? false : stryMutAct_9fa48("433") ? true : (stryCov_9fa48("433", "434"), Array.isArray(value))) {
                  if (stryMutAct_9fa48("435")) {
                    {}
                  } else {
                    stryCov_9fa48("435");
                    console.log(stryMutAct_9fa48("436") ? `` : (stryCov_9fa48("436"), `  ${key}: [${value.join(stryMutAct_9fa48("437") ? "" : (stryCov_9fa48("437"), ', '))}]`));
                  }
                } else if (stryMutAct_9fa48("440") ? typeof value !== 'object' : stryMutAct_9fa48("439") ? false : stryMutAct_9fa48("438") ? true : (stryCov_9fa48("438", "439", "440"), typeof value === (stryMutAct_9fa48("441") ? "" : (stryCov_9fa48("441"), 'object')))) {
                  if (stryMutAct_9fa48("442")) {
                    {}
                  } else {
                    stryCov_9fa48("442");
                    console.log(stryMutAct_9fa48("443") ? `` : (stryCov_9fa48("443"), `  ${key}: ${JSON.stringify(value, null, 2)}`));
                  }
                } else {
                  if (stryMutAct_9fa48("444")) {
                    {}
                  } else {
                    stryCov_9fa48("444");
                    console.log(stryMutAct_9fa48("445") ? `` : (stryCov_9fa48("445"), `  ${key}: ${value}`));
                  }
                }
              }
            });
          }
        }
        if (stryMutAct_9fa48("447") ? false : stryMutAct_9fa48("446") ? true : (stryCov_9fa48("446", "447"), recipe.behavior)) {
          if (stryMutAct_9fa48("448")) {
            {}
          } else {
            stryCov_9fa48("448");
            console.log(stryMutAct_9fa48("449") ? "" : (stryCov_9fa48("449"), '\nBehavior:'));
            Object.entries(recipe.behavior).forEach(([key, value]) => {
              if (stryMutAct_9fa48("450")) {
                {}
              } else {
                stryCov_9fa48("450");
                console.log(stryMutAct_9fa48("451") ? `` : (stryCov_9fa48("451"), `  ${key}: ${value}`));
              }
            });
          }
        }
      }
    } catch (error) {
      if (stryMutAct_9fa48("452")) {
        {}
      } else {
        stryCov_9fa48("452");
        console.error(stryMutAct_9fa48("453") ? `` : (stryCov_9fa48("453"), `Failed to show recipe '${recipeName}':`), error);
      }
    }
  }
});
program.command(stryMutAct_9fa48("454") ? "" : (stryCov_9fa48("454"), 'validate <recipeName>')).description(stryMutAct_9fa48("455") ? "" : (stryCov_9fa48("455"), 'Validate recipe configuration')).action(async (recipeName: string) => {
  if (stryMutAct_9fa48("456")) {
    {}
  } else {
    stryCov_9fa48("456");
    try {
      if (stryMutAct_9fa48("457")) {
        {}
      } else {
        stryCov_9fa48("457");
        const recipe = await recipeManager.getRecipe(recipeName);
        const isValid = recipeManager.validateRecipe(recipe);
        if (stryMutAct_9fa48("459") ? false : stryMutAct_9fa48("458") ? true : (stryCov_9fa48("458", "459"), isValid)) {
          if (stryMutAct_9fa48("460")) {
            {}
          } else {
            stryCov_9fa48("460");
            console.log(stryMutAct_9fa48("461") ? `` : (stryCov_9fa48("461"), `✅ Recipe '${recipeName}' is valid`));
          }
        } else {
          if (stryMutAct_9fa48("462")) {
            {}
          } else {
            stryCov_9fa48("462");
            console.log(stryMutAct_9fa48("463") ? `` : (stryCov_9fa48("463"), `❌ Recipe '${recipeName}' is invalid`));
          }
        }
      }
    } catch (error) {
      if (stryMutAct_9fa48("464")) {
        {}
      } else {
        stryCov_9fa48("464");
        console.error(stryMutAct_9fa48("465") ? `` : (stryCov_9fa48("465"), `Failed to validate recipe '${recipeName}':`), error);
      }
    }
  }
});
program.command(stryMutAct_9fa48("466") ? "" : (stryCov_9fa48("466"), 'find-site <siteUrl>')).description(stryMutAct_9fa48("467") ? "" : (stryCov_9fa48("467"), 'Find recipe for a specific site')).action(async (siteUrl: string) => {
  if (stryMutAct_9fa48("468")) {
    {}
  } else {
    stryCov_9fa48("468");
    try {
      if (stryMutAct_9fa48("469")) {
        {}
      } else {
        stryCov_9fa48("469");
        const recipe = await recipeManager.getRecipeBySiteUrl(siteUrl);
        if (stryMutAct_9fa48("471") ? false : stryMutAct_9fa48("470") ? true : (stryCov_9fa48("470", "471"), recipe)) {
          if (stryMutAct_9fa48("472")) {
            {}
          } else {
            stryCov_9fa48("472");
            console.log(stryMutAct_9fa48("473") ? `` : (stryCov_9fa48("473"), `Found recipe for ${siteUrl}:`));
            console.log(stryMutAct_9fa48("474") ? `` : (stryCov_9fa48("474"), `  Name: ${recipe.name}`));
            console.log(stryMutAct_9fa48("475") ? `` : (stryCov_9fa48("475"), `  Description: ${stryMutAct_9fa48("478") ? recipe.description && 'No description' : stryMutAct_9fa48("477") ? false : stryMutAct_9fa48("476") ? true : (stryCov_9fa48("476", "477", "478"), recipe.description || (stryMutAct_9fa48("479") ? "" : (stryCov_9fa48("479"), 'No description')))}`));
            console.log(stryMutAct_9fa48("480") ? `` : (stryCov_9fa48("480"), `  Version: ${recipe.version}`));
          }
        } else {
          if (stryMutAct_9fa48("481")) {
            {}
          } else {
            stryCov_9fa48("481");
            console.log(stryMutAct_9fa48("482") ? `` : (stryCov_9fa48("482"), `No recipe found for ${siteUrl}`));
            console.log(stryMutAct_9fa48("483") ? "" : (stryCov_9fa48("483"), 'Available recipes:'));
            const recipes = await recipeManager.listRecipes();
            recipes.forEach((recipe, index) => {
              if (stryMutAct_9fa48("484")) {
                {}
              } else {
                stryCov_9fa48("484");
                console.log(stryMutAct_9fa48("485") ? `` : (stryCov_9fa48("485"), `  ${stryMutAct_9fa48("486") ? index - 1 : (stryCov_9fa48("486"), index + 1)}. ${recipe}`));
              }
            });
          }
        }
      }
    } catch (error) {
      if (stryMutAct_9fa48("487")) {
        {}
      } else {
        stryCov_9fa48("487");
        console.error(stryMutAct_9fa48("488") ? `` : (stryCov_9fa48("488"), `Failed to find recipe for ${siteUrl}:`), error);
      }
    }
  }
});
program.command(stryMutAct_9fa48("489") ? "" : (stryCov_9fa48("489"), 'test <recipeName> <siteUrl>')).description(stryMutAct_9fa48("490") ? "" : (stryCov_9fa48("490"), 'Test recipe with a site URL')).action(async (recipeName: string, siteUrl: string) => {
  if (stryMutAct_9fa48("491")) {
    {}
  } else {
    stryCov_9fa48("491");
    try {
      if (stryMutAct_9fa48("492")) {
        {}
      } else {
        stryCov_9fa48("492");
        console.log(stryMutAct_9fa48("493") ? `` : (stryCov_9fa48("493"), `Testing recipe '${recipeName}' with ${siteUrl}...`));

        // Create adapter to test recipe
        const adapter = await recipeManager.createAdapter(siteUrl, recipeName);
        console.log(stryMutAct_9fa48("494") ? "" : (stryCov_9fa48("494"), '✅ Recipe loaded successfully'));
        const config = adapter.getConfig();
        console.log(stryMutAct_9fa48("495") ? `` : (stryCov_9fa48("495"), `Recipe configuration: ${config.name} v${config.version}`));

        // Test basic configuration
        if (stryMutAct_9fa48("498") ? config.selectors.title && config.selectors.price || config.selectors.images : stryMutAct_9fa48("497") ? false : stryMutAct_9fa48("496") ? true : (stryCov_9fa48("496", "497", "498"), (stryMutAct_9fa48("500") ? config.selectors.title || config.selectors.price : stryMutAct_9fa48("499") ? true : (stryCov_9fa48("499", "500"), config.selectors.title && config.selectors.price)) && config.selectors.images)) {
          if (stryMutAct_9fa48("501")) {
            {}
          } else {
            stryCov_9fa48("501");
            console.log(stryMutAct_9fa48("502") ? "" : (stryCov_9fa48("502"), '✅ Required selectors present'));
          }
        } else {
          if (stryMutAct_9fa48("503")) {
            {}
          } else {
            stryCov_9fa48("503");
            console.log(stryMutAct_9fa48("504") ? "" : (stryCov_9fa48("504"), '❌ Missing required selectors'));
          }
        }
        if (stryMutAct_9fa48("507") ? config.behavior.rateLimit : stryMutAct_9fa48("506") ? false : stryMutAct_9fa48("505") ? true : (stryCov_9fa48("505", "506", "507"), config.behavior?.rateLimit)) {
          if (stryMutAct_9fa48("508")) {
            {}
          } else {
            stryCov_9fa48("508");
            console.log(stryMutAct_9fa48("509") ? `` : (stryCov_9fa48("509"), `✅ Rate limiting configured: ${config.behavior.rateLimit}ms`));
          }
        } else {
          if (stryMutAct_9fa48("510")) {
            {}
          } else {
            stryCov_9fa48("510");
            console.log(stryMutAct_9fa48("511") ? "" : (stryCov_9fa48("511"), '⚠️  No rate limiting configured'));
          }
        }
      }
    } catch (error) {
      if (stryMutAct_9fa48("512")) {
        {}
      } else {
        stryCov_9fa48("512");
        console.error(stryMutAct_9fa48("513") ? `` : (stryCov_9fa48("513"), `Failed to test recipe '${recipeName}':`), error);
      }
    }
  }
});

// Initialize CLI and run
(async () => {
  if (stryMutAct_9fa48("514")) {
    {}
  } else {
    stryCov_9fa48("514");
    await initializeCLI();
    program.parse();
  }
})();