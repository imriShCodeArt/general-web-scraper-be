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
import { Request, Response, Router } from 'express';
import { RecipeManager } from '../../../lib/recipe-manager';
import { createRequestScope, TOKENS } from '../../../lib/composition-root';

// Simple request ID generator
const generateRequestId = stryMutAct_9fa48("0") ? () => undefined : (stryCov_9fa48("0"), (() => {
  const generateRequestId = () => stryMutAct_9fa48("1") ? `` : (stryCov_9fa48("1"), `${Date.now()}-${stryMutAct_9fa48("2") ? Math.random().toString(36) : (stryCov_9fa48("2"), Math.random().toString(36).substr(2, 9))}`);
  return generateRequestId;
})());
const router = Router();

// List all available recipes
router.get(stryMutAct_9fa48("3") ? "" : (stryCov_9fa48("3"), '/list'), async (req: Request, res: Response) => {
  if (stryMutAct_9fa48("4")) {
    {}
  } else {
    stryCov_9fa48("4");
    const requestScope = createRequestScope(generateRequestId(), req.ip, req.get(stryMutAct_9fa48("5") ? "" : (stryCov_9fa48("5"), 'User-Agent')));
    try {
      if (stryMutAct_9fa48("6")) {
        {}
      } else {
        stryCov_9fa48("6");
        const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
        const recipes = await recipeManager.listRecipes();
        res.json(stryMutAct_9fa48("7") ? {} : (stryCov_9fa48("7"), {
          success: stryMutAct_9fa48("8") ? false : (stryCov_9fa48("8"), true),
          data: recipes
        }));
      }
    } catch (error) {
      if (stryMutAct_9fa48("9")) {
        {}
      } else {
        stryCov_9fa48("9");
        console.error(stryMutAct_9fa48("10") ? "" : (stryCov_9fa48("10"), 'Failed to list recipes:'), error);
        res.status(500).json(stryMutAct_9fa48("11") ? {} : (stryCov_9fa48("11"), {
          success: stryMutAct_9fa48("12") ? true : (stryCov_9fa48("12"), false),
          error: stryMutAct_9fa48("13") ? "" : (stryCov_9fa48("13"), 'Failed to list recipes')
        }));
      }
    } finally {
      if (stryMutAct_9fa48("14")) {
        {}
      } else {
        stryCov_9fa48("14");
        await requestScope.dispose();
      }
    }
  }
});

// Get specific recipe by name
router.get(stryMutAct_9fa48("15") ? "" : (stryCov_9fa48("15"), '/get/:recipeName'), async (req: Request, res: Response) => {
  if (stryMutAct_9fa48("16")) {
    {}
  } else {
    stryCov_9fa48("16");
    const requestScope = createRequestScope(generateRequestId(), req.ip, req.get(stryMutAct_9fa48("17") ? "" : (stryCov_9fa48("17"), 'User-Agent')));
    try {
      if (stryMutAct_9fa48("18")) {
        {}
      } else {
        stryCov_9fa48("18");
        const {
          recipeName
        } = req.params;
        if (stryMutAct_9fa48("21") ? false : stryMutAct_9fa48("20") ? true : stryMutAct_9fa48("19") ? recipeName : (stryCov_9fa48("19", "20", "21"), !recipeName)) {
          if (stryMutAct_9fa48("22")) {
            {}
          } else {
            stryCov_9fa48("22");
            return res.status(400).json(stryMutAct_9fa48("23") ? {} : (stryCov_9fa48("23"), {
              success: stryMutAct_9fa48("24") ? true : (stryCov_9fa48("24"), false),
              error: stryMutAct_9fa48("25") ? "" : (stryCov_9fa48("25"), 'Recipe name is required')
            }));
          }
        }
        const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
        const recipe = await recipeManager.getRecipe(recipeName);
        if (stryMutAct_9fa48("27") ? false : stryMutAct_9fa48("26") ? true : (stryCov_9fa48("26", "27"), recipe)) {
          if (stryMutAct_9fa48("28")) {
            {}
          } else {
            stryCov_9fa48("28");
            return res.json(stryMutAct_9fa48("29") ? {} : (stryCov_9fa48("29"), {
              success: stryMutAct_9fa48("30") ? false : (stryCov_9fa48("30"), true),
              data: recipe
            }));
          }
        } else {
          if (stryMutAct_9fa48("31")) {
            {}
          } else {
            stryCov_9fa48("31");
            return res.status(404).json(stryMutAct_9fa48("32") ? {} : (stryCov_9fa48("32"), {
              success: stryMutAct_9fa48("33") ? true : (stryCov_9fa48("33"), false),
              error: stryMutAct_9fa48("34") ? `` : (stryCov_9fa48("34"), `Recipe '${recipeName}' not found`)
            }));
          }
        }
      }
    } catch (error) {
      if (stryMutAct_9fa48("35")) {
        {}
      } else {
        stryCov_9fa48("35");
        console.error(stryMutAct_9fa48("36") ? `` : (stryCov_9fa48("36"), `Failed to get recipe '${req.params.recipeName}':`), error);
        return res.status(500).json(stryMutAct_9fa48("37") ? {} : (stryCov_9fa48("37"), {
          success: stryMutAct_9fa48("38") ? true : (stryCov_9fa48("38"), false),
          error: stryMutAct_9fa48("39") ? "" : (stryCov_9fa48("39"), 'Failed to get recipe')
        }));
      }
    } finally {
      if (stryMutAct_9fa48("40")) {
        {}
      } else {
        stryCov_9fa48("40");
        await requestScope.dispose();
      }
    }
  }
});

// Get recipe by site URL
router.get(stryMutAct_9fa48("41") ? "" : (stryCov_9fa48("41"), '/getBySite'), async (req: Request, res: Response) => {
  if (stryMutAct_9fa48("42")) {
    {}
  } else {
    stryCov_9fa48("42");
    const requestScope = createRequestScope(generateRequestId(), req.ip, req.get(stryMutAct_9fa48("43") ? "" : (stryCov_9fa48("43"), 'User-Agent')));
    try {
      if (stryMutAct_9fa48("44")) {
        {}
      } else {
        stryCov_9fa48("44");
        const {
          siteUrl
        } = req.query;
        if (stryMutAct_9fa48("47") ? !siteUrl && typeof siteUrl !== 'string' : stryMutAct_9fa48("46") ? false : stryMutAct_9fa48("45") ? true : (stryCov_9fa48("45", "46", "47"), (stryMutAct_9fa48("48") ? siteUrl : (stryCov_9fa48("48"), !siteUrl)) || (stryMutAct_9fa48("50") ? typeof siteUrl === 'string' : stryMutAct_9fa48("49") ? false : (stryCov_9fa48("49", "50"), typeof siteUrl !== (stryMutAct_9fa48("51") ? "" : (stryCov_9fa48("51"), 'string')))))) {
          if (stryMutAct_9fa48("52")) {
            {}
          } else {
            stryCov_9fa48("52");
            return res.status(400).json(stryMutAct_9fa48("53") ? {} : (stryCov_9fa48("53"), {
              success: stryMutAct_9fa48("54") ? true : (stryCov_9fa48("54"), false),
              error: stryMutAct_9fa48("55") ? "" : (stryCov_9fa48("55"), 'Missing or invalid siteUrl parameter')
            }));
          }
        }
        const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
        const siteRecipe = await recipeManager.getRecipeBySiteUrl(siteUrl);
        if (stryMutAct_9fa48("57") ? false : stryMutAct_9fa48("56") ? true : (stryCov_9fa48("56", "57"), siteRecipe)) {
          if (stryMutAct_9fa48("58")) {
            {}
          } else {
            stryCov_9fa48("58");
            return res.json(stryMutAct_9fa48("59") ? {} : (stryCov_9fa48("59"), {
              success: stryMutAct_9fa48("60") ? false : (stryCov_9fa48("60"), true),
              data: siteRecipe
            }));
          }
        } else {
          if (stryMutAct_9fa48("61")) {
            {}
          } else {
            stryCov_9fa48("61");
            return res.status(404).json(stryMutAct_9fa48("62") ? {} : (stryCov_9fa48("62"), {
              success: stryMutAct_9fa48("63") ? true : (stryCov_9fa48("63"), false),
              error: stryMutAct_9fa48("64") ? `` : (stryCov_9fa48("64"), `No recipe found for site: ${siteUrl}`)
            }));
          }
        }
      }
    } catch (error) {
      if (stryMutAct_9fa48("65")) {
        {}
      } else {
        stryCov_9fa48("65");
        console.error(stryMutAct_9fa48("66") ? "" : (stryCov_9fa48("66"), 'Failed to find recipe for site:'), error);
        return res.status(500).json(stryMutAct_9fa48("67") ? {} : (stryCov_9fa48("67"), {
          success: stryMutAct_9fa48("68") ? true : (stryCov_9fa48("68"), false),
          error: stryMutAct_9fa48("69") ? "" : (stryCov_9fa48("69"), 'Failed to find recipe for site')
        }));
      }
    } finally {
      if (stryMutAct_9fa48("70")) {
        {}
      } else {
        stryCov_9fa48("70");
        await requestScope.dispose();
      }
    }
  }
});

// List all recipes with details
router.get(stryMutAct_9fa48("71") ? "" : (stryCov_9fa48("71"), '/all'), async (req: Request, res: Response) => {
  if (stryMutAct_9fa48("72")) {
    {}
  } else {
    stryCov_9fa48("72");
    const requestScope = createRequestScope(generateRequestId(), req.ip, req.get(stryMutAct_9fa48("73") ? "" : (stryCov_9fa48("73"), 'User-Agent')));
    try {
      if (stryMutAct_9fa48("74")) {
        {}
      } else {
        stryCov_9fa48("74");
        const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
        const allRecipes = await recipeManager.listRecipesWithDetails();
        return res.json(stryMutAct_9fa48("75") ? {} : (stryCov_9fa48("75"), {
          success: stryMutAct_9fa48("76") ? false : (stryCov_9fa48("76"), true),
          data: allRecipes
        }));
      }
    } catch (error) {
      if (stryMutAct_9fa48("77")) {
        {}
      } else {
        stryCov_9fa48("77");
        console.error(stryMutAct_9fa48("78") ? "" : (stryCov_9fa48("78"), 'Failed to get all recipes:'), error);
        return res.status(500).json(stryMutAct_9fa48("79") ? {} : (stryCov_9fa48("79"), {
          success: stryMutAct_9fa48("80") ? true : (stryCov_9fa48("80"), false),
          error: stryMutAct_9fa48("81") ? "" : (stryCov_9fa48("81"), 'Failed to get all recipes')
        }));
      }
    } finally {
      if (stryMutAct_9fa48("82")) {
        {}
      } else {
        stryCov_9fa48("82");
        await requestScope.dispose();
      }
    }
  }
});

// List all recipe names (backward compatibility)
router.get(stryMutAct_9fa48("83") ? "" : (stryCov_9fa48("83"), '/names'), async (req: Request, res: Response) => {
  if (stryMutAct_9fa48("84")) {
    {}
  } else {
    stryCov_9fa48("84");
    const requestScope = createRequestScope(generateRequestId(), req.ip, req.get(stryMutAct_9fa48("85") ? "" : (stryCov_9fa48("85"), 'User-Agent')));
    try {
      if (stryMutAct_9fa48("86")) {
        {}
      } else {
        stryCov_9fa48("86");
        const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
        const recipeNames = await recipeManager.listRecipes();
        return res.json(stryMutAct_9fa48("87") ? {} : (stryCov_9fa48("87"), {
          success: stryMutAct_9fa48("88") ? false : (stryCov_9fa48("88"), true),
          data: recipeNames
        }));
      }
    } catch (error) {
      if (stryMutAct_9fa48("89")) {
        {}
      } else {
        stryCov_9fa48("89");
        console.error(stryMutAct_9fa48("90") ? "" : (stryCov_9fa48("90"), 'Failed to get recipe names:'), error);
        return res.status(500).json(stryMutAct_9fa48("91") ? {} : (stryCov_9fa48("91"), {
          success: stryMutAct_9fa48("92") ? true : (stryCov_9fa48("92"), false),
          error: stryMutAct_9fa48("93") ? "" : (stryCov_9fa48("93"), 'Failed to get recipe names')
        }));
      }
    } finally {
      if (stryMutAct_9fa48("94")) {
        {}
      } else {
        stryCov_9fa48("94");
        await requestScope.dispose();
      }
    }
  }
});

// Validate recipe
router.post(stryMutAct_9fa48("95") ? "" : (stryCov_9fa48("95"), '/validate'), async (req: Request, res: Response) => {
  if (stryMutAct_9fa48("96")) {
    {}
  } else {
    stryCov_9fa48("96");
    const requestScope = createRequestScope(generateRequestId(), req.ip, req.get(stryMutAct_9fa48("97") ? "" : (stryCov_9fa48("97"), 'User-Agent')));
    try {
      if (stryMutAct_9fa48("98")) {
        {}
      } else {
        stryCov_9fa48("98");
        const {
          recipeName
        } = req.body;
        if (stryMutAct_9fa48("101") ? false : stryMutAct_9fa48("100") ? true : stryMutAct_9fa48("99") ? recipeName : (stryCov_9fa48("99", "100", "101"), !recipeName)) {
          if (stryMutAct_9fa48("102")) {
            {}
          } else {
            stryCov_9fa48("102");
            return res.status(400).json(stryMutAct_9fa48("103") ? {} : (stryCov_9fa48("103"), {
              success: stryMutAct_9fa48("104") ? true : (stryCov_9fa48("104"), false),
              error: stryMutAct_9fa48("105") ? "" : (stryCov_9fa48("105"), 'Missing recipeName parameter')
            }));
          }
        }
        const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
        const recipe = await recipeManager.getRecipe(recipeName);
        if (stryMutAct_9fa48("108") ? false : stryMutAct_9fa48("107") ? true : stryMutAct_9fa48("106") ? recipe : (stryCov_9fa48("106", "107", "108"), !recipe)) {
          if (stryMutAct_9fa48("109")) {
            {}
          } else {
            stryCov_9fa48("109");
            return res.status(404).json(stryMutAct_9fa48("110") ? {} : (stryCov_9fa48("110"), {
              success: stryMutAct_9fa48("111") ? true : (stryCov_9fa48("111"), false),
              error: stryMutAct_9fa48("112") ? `` : (stryCov_9fa48("112"), `Recipe '${recipeName}' not found`)
            }));
          }
        }
        const isValid = recipeManager.validateRecipe(recipe);
        return res.json(stryMutAct_9fa48("113") ? {} : (stryCov_9fa48("113"), {
          success: stryMutAct_9fa48("114") ? false : (stryCov_9fa48("114"), true),
          data: stryMutAct_9fa48("115") ? {} : (stryCov_9fa48("115"), {
            isValid
          })
        }));
      }
    } catch (error) {
      if (stryMutAct_9fa48("116")) {
        {}
      } else {
        stryCov_9fa48("116");
        console.error(stryMutAct_9fa48("117") ? "" : (stryCov_9fa48("117"), 'Failed to validate recipe:'), error);
        return res.status(500).json(stryMutAct_9fa48("118") ? {} : (stryCov_9fa48("118"), {
          success: stryMutAct_9fa48("119") ? true : (stryCov_9fa48("119"), false),
          error: stryMutAct_9fa48("120") ? "" : (stryCov_9fa48("120"), 'Failed to validate recipe')
        }));
      }
    } finally {
      if (stryMutAct_9fa48("121")) {
        {}
      } else {
        stryCov_9fa48("121");
        await requestScope.dispose();
      }
    }
  }
});

// Load recipe from file
router.post(stryMutAct_9fa48("122") ? "" : (stryCov_9fa48("122"), '/loadFromFile'), async (req: Request, res: Response) => {
  if (stryMutAct_9fa48("123")) {
    {}
  } else {
    stryCov_9fa48("123");
    const requestScope = createRequestScope(generateRequestId(), req.ip, req.get(stryMutAct_9fa48("124") ? "" : (stryCov_9fa48("124"), 'User-Agent')));
    try {
      if (stryMutAct_9fa48("125")) {
        {}
      } else {
        stryCov_9fa48("125");
        const {
          filePath
        } = req.body;
        if (stryMutAct_9fa48("128") ? false : stryMutAct_9fa48("127") ? true : stryMutAct_9fa48("126") ? filePath : (stryCov_9fa48("126", "127", "128"), !filePath)) {
          if (stryMutAct_9fa48("129")) {
            {}
          } else {
            stryCov_9fa48("129");
            return res.status(400).json(stryMutAct_9fa48("130") ? {} : (stryCov_9fa48("130"), {
              success: stryMutAct_9fa48("131") ? true : (stryCov_9fa48("131"), false),
              error: stryMutAct_9fa48("132") ? "" : (stryCov_9fa48("132"), 'Missing filePath parameter')
            }));
          }
        }
        const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
        const recipe = await recipeManager.loadRecipeFromFile(filePath);
        return res.json(stryMutAct_9fa48("133") ? {} : (stryCov_9fa48("133"), {
          success: stryMutAct_9fa48("134") ? false : (stryCov_9fa48("134"), true),
          data: recipe
        }));
      }
    } catch (error) {
      if (stryMutAct_9fa48("135")) {
        {}
      } else {
        stryCov_9fa48("135");
        console.error(stryMutAct_9fa48("136") ? "" : (stryCov_9fa48("136"), 'Failed to load recipe from file:'), error);
        return res.status(500).json(stryMutAct_9fa48("137") ? {} : (stryCov_9fa48("137"), {
          success: stryMutAct_9fa48("138") ? true : (stryCov_9fa48("138"), false),
          error: stryMutAct_9fa48("139") ? "" : (stryCov_9fa48("139"), 'Failed to load recipe from file')
        }));
      }
    } finally {
      if (stryMutAct_9fa48("140")) {
        {}
      } else {
        stryCov_9fa48("140");
        await requestScope.dispose();
      }
    }
  }
});
export default router;