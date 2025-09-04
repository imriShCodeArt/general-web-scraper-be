// @ts-nocheck
import { Request, Response, Router } from 'express';
import { RecipeManager } from '../../../lib/recipe-manager';
import { createRequestScope, TOKENS } from '../../../lib/composition-root';

// Simple request ID generator
const generateRequestId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const router = Router();

// List all available recipes
router.get('/list', async (req: Request, res: Response) => {
  const requestScope = createRequestScope(generateRequestId(), req.ip, req.get('User-Agent'));

  try {
    const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
    const recipes = await recipeManager.listRecipes();
    res.json({ success: true, data: recipes });
  } catch (error) {
    console.error('Failed to list recipes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list recipes',
    });
  } finally {
    await requestScope.dispose();
  }
});

// Get specific recipe by name
router.get('/get/:recipeName', async (req: Request, res: Response) => {
  const requestScope = createRequestScope(generateRequestId(), req.ip, req.get('User-Agent'));

  try {
    const { recipeName } = req.params;
    if (!recipeName) {
      return res.status(400).json({
        success: false,
        error: 'Recipe name is required',
      });
    }

    const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
    const recipe = await recipeManager.getRecipe(recipeName);

    if (recipe) {
      return res.json({ success: true, data: recipe });
    } else {
      return res.status(404).json({
        success: false,
        error: `Recipe '${recipeName}' not found`,
      });
    }
  } catch (error) {
    console.error(`Failed to get recipe '${req.params.recipeName}':`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get recipe',
    });
  } finally {
    await requestScope.dispose();
  }
});

// Get recipe by site URL
router.get('/getBySite', async (req: Request, res: Response) => {
  const requestScope = createRequestScope(generateRequestId(), req.ip, req.get('User-Agent'));

  try {
    const { siteUrl } = req.query;

    if (!siteUrl || typeof siteUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid siteUrl parameter',
      });
    }

    const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
    const siteRecipe = await recipeManager.getRecipeBySiteUrl(siteUrl);

    if (siteRecipe) {
      return res.json({ success: true, data: siteRecipe });
    } else {
      return res.status(404).json({
        success: false,
        error: `No recipe found for site: ${siteUrl}`,
      });
    }
  } catch (error) {
    console.error('Failed to find recipe for site:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to find recipe for site',
    });
  } finally {
    await requestScope.dispose();
  }
});

// List all recipes with details
router.get('/all', async (req: Request, res: Response) => {
  const requestScope = createRequestScope(generateRequestId(), req.ip, req.get('User-Agent'));

  try {
    const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
    const allRecipes = await recipeManager.listRecipesWithDetails();
    return res.json({ success: true, data: allRecipes });
  } catch (error) {
    console.error('Failed to get all recipes:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get all recipes',
    });
  } finally {
    await requestScope.dispose();
  }
});

// List all recipe names (backward compatibility)
router.get('/names', async (req: Request, res: Response) => {
  const requestScope = createRequestScope(generateRequestId(), req.ip, req.get('User-Agent'));

  try {
    const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
    const recipeNames = await recipeManager.listRecipes();
    return res.json({ success: true, data: recipeNames });
  } catch (error) {
    console.error('Failed to get recipe names:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get recipe names',
    });
  } finally {
    await requestScope.dispose();
  }
});

// Validate recipe
router.post('/validate', async (req: Request, res: Response) => {
  const requestScope = createRequestScope(generateRequestId(), req.ip, req.get('User-Agent'));

  try {
    const { recipeName } = req.body;

    if (!recipeName) {
      return res.status(400).json({
        success: false,
        error: 'Missing recipeName parameter',
      });
    }

    const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
    const recipe = await recipeManager.getRecipe(recipeName);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: `Recipe '${recipeName}' not found`,
      });
    }

    const isValid = recipeManager.validateRecipe(recipe);
    return res.json({ success: true, data: { isValid } });
  } catch (error) {
    console.error('Failed to validate recipe:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to validate recipe',
    });
  } finally {
    await requestScope.dispose();
  }
});

// Load recipe from file
router.post('/loadFromFile', async (req: Request, res: Response) => {
  const requestScope = createRequestScope(generateRequestId(), req.ip, req.get('User-Agent'));

  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'Missing filePath parameter',
      });
    }

    const recipeManager = await requestScope.resolve<RecipeManager>(TOKENS.RecipeManager);
    const recipe = await recipeManager.loadRecipeFromFile(filePath);
    return res.json({ success: true, data: recipe });
  } catch (error) {
    console.error('Failed to load recipe from file:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load recipe from file',
    });
  } finally {
    await requestScope.dispose();
  }
});

export default router;
