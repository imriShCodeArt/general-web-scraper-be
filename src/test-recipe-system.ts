#!/usr/bin/env ts-node

import { RecipeManager } from './lib/recipe-manager';
import { RecipeLoaderService } from './lib/recipe-loader';

async function testRecipeSystem() {
  console.log('🧪 Testing Recipe System...\n');

  try {
    // Create recipe manager
    const recipeManager = new RecipeManager('./recipes');
    
    // Test 1: List available recipes
    console.log('📋 Test 1: Listing available recipes');
    const recipes = await recipeManager.listRecipes();
    console.log('Available recipes:', recipes);
    console.log('');

    // Test 2: Load specific recipe
    if (recipes.length > 0) {
      console.log('📖 Test 2: Loading specific recipe');
      const recipeName = recipes[0];
      if (recipeName) {
        const recipe = await recipeManager.getRecipe(recipeName);
        console.log(`Loaded recipe '${recipeName}':`, {
          name: recipe.name,
          description: recipe.description,
          version: recipe.version,
          siteUrl: recipe.siteUrl,
          selectors: Object.keys(recipe.selectors)
        });
        console.log('');
      }
    }

    // Test 3: Test recipe validation
    console.log('✅ Test 3: Testing recipe validation');
    const testRecipe = {
      name: "Test Recipe",
      version: "1.0.0",
      siteUrl: "https://test.com",
      selectors: {
        title: ".title",
        price: ".price",
        images: ".images",
        stock: ".stock",
        sku: ".sku",
        description: ".description",
        productLinks: ".product-link",
        attributes: ".attributes"
      }
    };
    
    const isValid = recipeManager.validateRecipe(testRecipe);
    console.log('Test recipe validation:', isValid);
    console.log('');

    // Test 4: Test recipe loader directly
    console.log('🔧 Test 4: Testing recipe loader directly');
    const recipeLoader = recipeManager.getRecipeLoader();
    
          // Test loading from file
      try {
        const genericRecipe = await recipeLoader.loadRecipeFromFile('./recipes/generic-ecommerce.yaml');
        console.log('Loaded generic recipe:', genericRecipe.name);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log('Could not load generic recipe:', errorMessage);
      }
    console.log('');

    // Test 5: Test site URL matching
    console.log('🌐 Test 5: Testing site URL matching');
    const testSiteUrl = 'https://example.com';
    const matchingRecipe = await recipeManager.getRecipeBySiteUrl(testSiteUrl);
    if (matchingRecipe) {
      console.log(`Found recipe for ${testSiteUrl}:`, matchingRecipe.name);
    } else {
      console.log(`No recipe found for ${testSiteUrl}`);
    }
    console.log('');

    console.log('🎉 Recipe system test completed successfully!');

  } catch (error) {
    console.error('❌ Recipe system test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRecipeSystem().catch(console.error);
}

export { testRecipeSystem };
