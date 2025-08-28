#!/usr/bin/env ts-node

import { RecipeManager } from '../lib/recipe-manager';
import { Command } from 'commander';
import { rootContainer, TOKENS, initializeServices, cleanupServices } from '../lib/composition-root';

const program = new Command();
let recipeManager: RecipeManager;

// Initialize services before running CLI
async function initializeCLI() {
  try {
    await initializeServices();
    recipeManager = await rootContainer.resolve<RecipeManager>(TOKENS.RecipeManager);
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Cleanup services when CLI exits
async function cleanupCLI() {
  try {
    await cleanupServices();
  } catch (error) {
    console.error('Failed to cleanup services:', error);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await cleanupCLI();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanupCLI();
  process.exit(0);
});

program
  .name('recipe-cli')
  .description('CLI tool for managing web scraper recipes')
  .version('1.0.0');

program
  .command('list')
  .description('List all available recipes')
  .action(async () => {
    try {
      const recipes = await recipeManager.listRecipes();
      if (recipes.length === 0) {
        console.log('No recipes found.');
        return;
      }

      console.log('Available recipes:');
      recipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. ${recipe}`);
      });
    } catch (error) {
      console.error('Failed to list recipes:', error);
    }
  });

program
  .command('show <recipeName>')
  .description('Show recipe configuration')
  .action(async (recipeName: string) => {
    try {
      const recipe = await recipeManager.getRecipe(recipeName);
      console.log(`Recipe: ${recipe.name}`);
      console.log(`Description: ${recipe.description || 'No description'}`);
      console.log(`Version: ${recipe.version}`);
      console.log(`Site URL: ${recipe.siteUrl}`);
      console.log('\nSelectors:');
      Object.entries(recipe.selectors).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          console.log(`  ${key}: [${value.join(', ')}]`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });

      if (recipe.transforms) {
        console.log('\nTransformations:');
        Object.entries(recipe.transforms).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            console.log(`  ${key}: [${value.join(', ')}]`);
          } else if (typeof value === 'object') {
            console.log(`  ${key}: ${JSON.stringify(value, null, 2)}`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        });
      }

      if (recipe.behavior) {
        console.log('\nBehavior:');
        Object.entries(recipe.behavior).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      }
    } catch (error) {
      console.error(`Failed to show recipe '${recipeName}':`, error);
    }
  });

program
  .command('validate <recipeName>')
  .description('Validate recipe configuration')
  .action(async (recipeName: string) => {
    try {
      const recipe = await recipeManager.getRecipe(recipeName);
      const isValid = recipeManager.validateRecipe(recipe);

      if (isValid) {
        console.log(`✅ Recipe '${recipeName}' is valid`);
      } else {
        console.log(`❌ Recipe '${recipeName}' is invalid`);
      }
    } catch (error) {
      console.error(`Failed to validate recipe '${recipeName}':`, error);
    }
  });

program
  .command('find-site <siteUrl>')
  .description('Find recipe for a specific site')
  .action(async (siteUrl: string) => {
    try {
      const recipe = await recipeManager.getRecipeBySiteUrl(siteUrl);
      if (recipe) {
        console.log(`Found recipe for ${siteUrl}:`);
        console.log(`  Name: ${recipe.name}`);
        console.log(`  Description: ${recipe.description || 'No description'}`);
        console.log(`  Version: ${recipe.version}`);
      } else {
        console.log(`No recipe found for ${siteUrl}`);
        console.log('Available recipes:');
        const recipes = await recipeManager.listRecipes();
        recipes.forEach((recipe, index) => {
          console.log(`  ${index + 1}. ${recipe}`);
        });
      }
    } catch (error) {
      console.error(`Failed to find recipe for ${siteUrl}:`, error);
    }
  });

program
  .command('test <recipeName> <siteUrl>')
  .description('Test recipe with a site URL')
  .action(async (recipeName: string, siteUrl: string) => {
    try {
      console.log(`Testing recipe '${recipeName}' with ${siteUrl}...`);

      // Create adapter to test recipe
      const adapter = await recipeManager.createAdapter(siteUrl, recipeName);
      console.log('✅ Recipe loaded successfully');

      const config = adapter.getConfig();
      console.log(`Recipe configuration: ${config.name} v${config.version}`);

      // Test basic configuration
      if (config.selectors.title && config.selectors.price && config.selectors.images) {
        console.log('✅ Required selectors present');
      } else {
        console.log('❌ Missing required selectors');
      }

      if (config.behavior?.rateLimit) {
        console.log(`✅ Rate limiting configured: ${config.behavior.rateLimit}ms`);
      } else {
        console.log('⚠️  No rate limiting configured');
      }
    } catch (error) {
      console.error(`Failed to test recipe '${recipeName}':`, error);
    }
  });

// Initialize CLI and run
(async () => {
  await initializeCLI();
  program.parse();
})();
