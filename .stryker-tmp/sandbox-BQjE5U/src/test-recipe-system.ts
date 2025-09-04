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
import { RecipeManager } from './lib/recipe-manager';
import { rootContainer, TOKENS, initializeServices, cleanupServices } from './lib/composition-root';
async function testRecipeSystem() {
  if (stryMutAct_9fa48("5415")) {
    {}
  } else {
    stryCov_9fa48("5415");
    console.log(stryMutAct_9fa48("5416") ? "" : (stryCov_9fa48("5416"), '🧪 Testing Recipe System...\n'));
    try {
      if (stryMutAct_9fa48("5417")) {
        {}
      } else {
        stryCov_9fa48("5417");
        // Initialize services
        await initializeServices();

        // Get recipe manager from DI container
        const recipeManager = await rootContainer.resolve<RecipeManager>(TOKENS.RecipeManager);

        // Test 1: List available recipes
        console.log(stryMutAct_9fa48("5418") ? "" : (stryCov_9fa48("5418"), '📋 Test 1: Listing available recipes'));
        const recipes = await recipeManager.listRecipes();
        console.log(stryMutAct_9fa48("5419") ? "" : (stryCov_9fa48("5419"), 'Available recipes:'), recipes);
        console.log(stryMutAct_9fa48("5420") ? "Stryker was here!" : (stryCov_9fa48("5420"), ''));

        // Test 2: Load specific recipe
        if (stryMutAct_9fa48("5424") ? recipes.length <= 0 : stryMutAct_9fa48("5423") ? recipes.length >= 0 : stryMutAct_9fa48("5422") ? false : stryMutAct_9fa48("5421") ? true : (stryCov_9fa48("5421", "5422", "5423", "5424"), recipes.length > 0)) {
          if (stryMutAct_9fa48("5425")) {
            {}
          } else {
            stryCov_9fa48("5425");
            console.log(stryMutAct_9fa48("5426") ? "" : (stryCov_9fa48("5426"), '📖 Test 2: Loading specific recipe'));
            const recipeName = recipes[0];
            if (stryMutAct_9fa48("5428") ? false : stryMutAct_9fa48("5427") ? true : (stryCov_9fa48("5427", "5428"), recipeName)) {
              if (stryMutAct_9fa48("5429")) {
                {}
              } else {
                stryCov_9fa48("5429");
                const recipe = await recipeManager.getRecipe(recipeName);
                console.log(stryMutAct_9fa48("5430") ? `` : (stryCov_9fa48("5430"), `Loaded recipe '${recipeName}':`), stryMutAct_9fa48("5431") ? {} : (stryCov_9fa48("5431"), {
                  name: recipe.name,
                  description: recipe.description,
                  version: recipe.version,
                  siteUrl: recipe.siteUrl,
                  selectors: Object.keys(recipe.selectors)
                }));
                console.log(stryMutAct_9fa48("5432") ? "Stryker was here!" : (stryCov_9fa48("5432"), ''));
              }
            }
          }
        }

        // Test 3: Test recipe validation
        console.log(stryMutAct_9fa48("5433") ? "" : (stryCov_9fa48("5433"), '✅ Test 3: Testing recipe validation'));
        const testRecipe = stryMutAct_9fa48("5434") ? {} : (stryCov_9fa48("5434"), {
          name: stryMutAct_9fa48("5435") ? "" : (stryCov_9fa48("5435"), 'Test Recipe'),
          version: stryMutAct_9fa48("5436") ? "" : (stryCov_9fa48("5436"), '1.0.0'),
          siteUrl: stryMutAct_9fa48("5437") ? "" : (stryCov_9fa48("5437"), 'https://test.com'),
          selectors: stryMutAct_9fa48("5438") ? {} : (stryCov_9fa48("5438"), {
            title: stryMutAct_9fa48("5439") ? "" : (stryCov_9fa48("5439"), '.title'),
            price: stryMutAct_9fa48("5440") ? "" : (stryCov_9fa48("5440"), '.price'),
            images: stryMutAct_9fa48("5441") ? "" : (stryCov_9fa48("5441"), '.images'),
            stock: stryMutAct_9fa48("5442") ? "" : (stryCov_9fa48("5442"), '.stock'),
            sku: stryMutAct_9fa48("5443") ? "" : (stryCov_9fa48("5443"), '.sku'),
            description: stryMutAct_9fa48("5444") ? "" : (stryCov_9fa48("5444"), '.description'),
            productLinks: stryMutAct_9fa48("5445") ? "" : (stryCov_9fa48("5445"), '.product-link'),
            attributes: stryMutAct_9fa48("5446") ? "" : (stryCov_9fa48("5446"), '.attributes')
          })
        });
        const isValid = recipeManager.validateRecipe(testRecipe);
        console.log(stryMutAct_9fa48("5447") ? "" : (stryCov_9fa48("5447"), 'Test recipe validation:'), isValid);
        console.log(stryMutAct_9fa48("5448") ? "Stryker was here!" : (stryCov_9fa48("5448"), ''));

        // Test 4: Test recipe loader directly
        console.log(stryMutAct_9fa48("5449") ? "" : (stryCov_9fa48("5449"), '🔧 Test 4: Testing recipe loader directly'));
        const recipeLoader = recipeManager.getRecipeLoader();

        // Test loading from file
        try {
          if (stryMutAct_9fa48("5450")) {
            {}
          } else {
            stryCov_9fa48("5450");
            const genericRecipe = await recipeLoader.loadRecipeFromFile(stryMutAct_9fa48("5451") ? "" : (stryCov_9fa48("5451"), './recipes/generic-ecommerce.yaml'));
            console.log(stryMutAct_9fa48("5452") ? "" : (stryCov_9fa48("5452"), 'Loaded generic recipe:'), genericRecipe.name);
          }
        } catch (error) {
          if (stryMutAct_9fa48("5453")) {
            {}
          } else {
            stryCov_9fa48("5453");
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(stryMutAct_9fa48("5454") ? "" : (stryCov_9fa48("5454"), 'Could not load generic recipe:'), errorMessage);
          }
        }
        console.log(stryMutAct_9fa48("5455") ? "Stryker was here!" : (stryCov_9fa48("5455"), ''));

        // Test 5: Test site URL matching
        console.log(stryMutAct_9fa48("5456") ? "" : (stryCov_9fa48("5456"), '🌐 Test 5: Testing site URL matching'));
        const testSiteUrl = stryMutAct_9fa48("5457") ? "" : (stryCov_9fa48("5457"), 'https://example.com');
        const matchingRecipe = await recipeManager.getRecipeBySiteUrl(testSiteUrl);
        if (stryMutAct_9fa48("5459") ? false : stryMutAct_9fa48("5458") ? true : (stryCov_9fa48("5458", "5459"), matchingRecipe)) {
          if (stryMutAct_9fa48("5460")) {
            {}
          } else {
            stryCov_9fa48("5460");
            console.log(stryMutAct_9fa48("5461") ? `` : (stryCov_9fa48("5461"), `Found recipe for ${testSiteUrl}:`), matchingRecipe.name);
          }
        } else {
          if (stryMutAct_9fa48("5462")) {
            {}
          } else {
            stryCov_9fa48("5462");
            console.log(stryMutAct_9fa48("5463") ? `` : (stryCov_9fa48("5463"), `No recipe found for ${testSiteUrl}`));
          }
        }
        console.log(stryMutAct_9fa48("5464") ? "Stryker was here!" : (stryCov_9fa48("5464"), ''));
        console.log(stryMutAct_9fa48("5465") ? "" : (stryCov_9fa48("5465"), '🎉 Recipe system test completed successfully!'));
      }
    } catch (error) {
      if (stryMutAct_9fa48("5466")) {
        {}
      } else {
        stryCov_9fa48("5466");
        console.error(stryMutAct_9fa48("5467") ? "" : (stryCov_9fa48("5467"), '❌ Recipe system test failed:'), error);
      }
    } finally {
      if (stryMutAct_9fa48("5468")) {
        {}
      } else {
        stryCov_9fa48("5468");
        // Cleanup services
        await cleanupServices();
      }
    }
  }
}

// Run the test if this file is executed directly
if (stryMutAct_9fa48("5471") ? require.main !== module : stryMutAct_9fa48("5470") ? false : stryMutAct_9fa48("5469") ? true : (stryCov_9fa48("5469", "5470", "5471"), require.main === module)) {
  if (stryMutAct_9fa48("5472")) {
    {}
  } else {
    stryCov_9fa48("5472");
    testRecipeSystem().catch(console.error);
  }
}
export { testRecipeSystem };