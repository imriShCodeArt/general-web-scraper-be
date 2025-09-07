#!/usr/bin/env ts-node

import { RecipeManager } from '../lib/core/services/recipe-manager';
import { Command } from 'commander';
import { rootContainer, TOKENS, initializeServices, cleanupServices } from '../lib/composition-root';
import { RecipeComplianceAuditor } from '../lib/utils/recipe-compliance-auditor';
import { RecipeComplianceMonitor } from '../lib/utils/recipe-compliance-monitor';
import { RecipeMaintenanceTools } from '../lib/utils/recipe-maintenance-tools';

const program = new Command();
let recipeManager: RecipeManager;
let complianceAuditor: RecipeComplianceAuditor;
let complianceMonitor: RecipeComplianceMonitor;
let maintenanceTools: RecipeMaintenanceTools;

// Initialize services before running CLI
async function initializeCLI() {
  try {
    await initializeServices();
    recipeManager = await rootContainer.resolve<RecipeManager>(TOKENS.RecipeManager);
    complianceAuditor = new RecipeComplianceAuditor();
    complianceMonitor = new RecipeComplianceMonitor();
    maintenanceTools = new RecipeMaintenanceTools();
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
  .command('validate-woocommerce <recipeName>')
  .description('Validate recipe for WooCommerce compliance')
  .option('-f, --format <format>', 'Output format (console, json, html)', 'console')
  .option('-o, --output <file>', 'Output file path')
  .action(async (recipeName: string, options: { format: string; output?: string }) => {
    try {
      const result = await recipeManager.validateRecipeWooCommerce(recipeName);

      let output: string;

      switch (options.format.toLowerCase()) {
      case 'json':
        output = JSON.stringify(result, null, 2);
        break;
      case 'html':
        output = generateHtmlReport(recipeName, result);
        break;
      case 'console':
      default:
        output = await recipeManager.getValidationReport(recipeName);
        break;
      }

      if (options.output) {
        const fs = await import('fs');
        fs.writeFileSync(options.output, output);
        console.log(`Report saved to ${options.output}`);
      } else {
        console.log(output);
      }

      // Exit with appropriate code based on validation result
      if (!result.isValid) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    } catch (error) {
      console.error(`Failed to validate recipe '${recipeName}' for WooCommerce compliance:`, error);
      process.exit(1);
    }
  });

program
  .command('validate-all-woocommerce')
  .description('Validate all recipes for WooCommerce compliance')
  .option('-f, --format <format>', 'Output format (console, json, html)', 'console')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options: { format: string; output?: string }) => {
    try {
      const validationResults = await recipeManager.validateAllRecipesWooCommerce();

      let output: string;

      switch (options.format.toLowerCase()) {
      case 'json':
        output = JSON.stringify(validationResults, null, 2);
        break;
      case 'html':
        output = generateHtmlReportAll(validationResults);
        break;
      case 'console':
      default:
        output = generateConsoleReportAll(validationResults);
        break;
      }

      if (options.output) {
        const fs = await import('fs');
        fs.writeFileSync(options.output, output);
        console.log(`Report saved to ${options.output}`);
      } else {
        console.log(output);
      }

      // Exit with appropriate code based on validation results
      if (validationResults.summary.invalidRecipes > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    } catch (error) {
      console.error('Failed to validate all recipes for WooCommerce compliance:', error);
      process.exit(1);
    }
  });

program
  .command('audit-recipes')
  .description('Audit all recipes for WooCommerce compliance')
  .option('-f, --format <format>', 'Output format (console, json, html)', 'console')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options: { format: string; output?: string }) => {
    try {
      console.log('🔍 Starting recipe compliance audit...');
      const report = await complianceAuditor.auditAllRecipes();

      let output: string;

      switch (options.format.toLowerCase()) {
      case 'json':
        output = complianceAuditor.generateJsonReport(report);
        break;
      case 'html':
        output = complianceAuditor.generateHtmlReport(report);
        break;
      case 'console':
      default:
        output = complianceAuditor.generateConsoleReport(report);
        break;
      }

      if (options.output) {
        const fs = await import('fs');
        fs.writeFileSync(options.output, output);
        console.log(`📄 Audit report saved to ${options.output}`);
      } else {
        console.log(output);
      }

      // Exit with error code if there are critical issues
      if (report.summary.criticalIssues > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('Failed to audit recipes:', error);
      process.exit(1);
    }
  });

program
  .command('monitor-compliance')
  .description('Run compliance monitoring and persist metrics/dashboard')
  .action(async () => {
    try {
      const { report, metrics } = await complianceMonitor.runAndPersist();
      console.log('✅ Compliance monitoring completed');
      console.log(`Recipes: ${metrics.totalRecipes}, Compliant: ${metrics.compliantRecipes}, AverageScore: ${metrics.averageScore}`);
      console.log('Artifacts: docs/compliance-dashboard.html, performance-data/compliance.json, performance-data/compliance-metrics.jsonl');
      // Exit non-zero if any critical issues
      if (report.summary.criticalIssues > 0) process.exit(1);
      process.exit(0);
    } catch (error) {
      console.error('Failed to run compliance monitoring:', error);
      process.exit(1);
    }
  });

program
  .command('recipes-backup')
  .description('Backup all recipes into ./recipes-backup')
  .action(async () => {
    try {
      const { count } = maintenanceTools.backupAll();
      console.log(`✅ Backed up ${count} recipe files to ./recipes-backup`);
    } catch (error) {
      console.error('Failed to backup recipes:', error);
      process.exit(1);
    }
  });

program
  .command('recipes-compare <recipeAPath> <recipeBPath>')
  .description('Compare two recipe files and print top-level key differences')
  .action(async (recipeAPath: string, recipeBPath: string) => {
    try {
      const diff = maintenanceTools.compare(recipeAPath, recipeBPath);
      console.log('Only in A:', diff.onlyInA);
      console.log('Only in B:', diff.onlyInB);
    } catch (error) {
      console.error('Failed to compare recipes:', error);
      process.exit(1);
    }
  });

program
  .command('recipes-bulk-update <find> <replace>')
  .description('Bulk update selector strings across all recipes')
  .action(async (find: string, replace: string) => {
    try {
      const { updated } = maintenanceTools.bulkUpdateSelector(find, replace);
      console.log(`✅ Updated ${updated} recipe files`);
    } catch (error) {
      console.error('Failed to bulk update recipes:', error);
      process.exit(1);
    }
  });

program
  .command('audit-recipe <recipeName>')
  .description('Audit a specific recipe for WooCommerce compliance')
  .option('-f, --format <format>', 'Output format (console, json, html)', 'console')
  .option('-o, --output <file>', 'Output file path')
  .action(async (recipeName: string, options: { format: string; output?: string }) => {
    try {
      console.log(`🔍 Auditing recipe: ${recipeName}`);
      const auditResult = await complianceAuditor.auditRecipe(recipeName);

      // Create a mock report for single recipe
      const report = {
        summary: {
          totalRecipes: 1,
          compliantRecipes: auditResult.validationResult.isValid ? 1 : 0,
          nonCompliantRecipes: auditResult.validationResult.isValid ? 0 : 1,
          averageScore: auditResult.complianceScore,
          criticalIssues: auditResult.complianceIssues.critical.length,
          totalWarnings: auditResult.complianceIssues.warnings.length,
          totalSuggestions: auditResult.complianceIssues.suggestions.length,
        },
        recipes: [auditResult],
        recommendations: {
          immediateActions: auditResult.complianceIssues.critical.length > 0 ?
            [`Fix critical issues in ${recipeName}`] : [],
          shortTermImprovements: auditResult.complianceIssues.warnings.length > 0 ?
            [`Address warnings in ${recipeName}`] : [],
          longTermOptimizations: auditResult.complianceIssues.suggestions.length > 0 ?
            [`Consider optimizations for ${recipeName}`] : [],
        },
        generatedAt: new Date(),
      };

      let output: string;

      switch (options.format.toLowerCase()) {
      case 'json':
        output = complianceAuditor.generateJsonReport(report);
        break;
      case 'html':
        output = complianceAuditor.generateHtmlReport(report);
        break;
      case 'console':
      default:
        output = complianceAuditor.generateConsoleReport(report);
        break;
      }

      if (options.output) {
        const fs = await import('fs');
        fs.writeFileSync(options.output, output);
        console.log(`📄 Audit report saved to ${options.output}`);
      } else {
        console.log(output);
      }

      // Exit with error code if there are critical issues
      if (auditResult.complianceIssues.critical.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error(`Failed to audit recipe '${recipeName}':`, error);
      process.exit(1);
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

// Helper functions for report generation
function generateHtmlReport(recipeName: string, result: any): string {
  const statusIcon = result.isValid ? '✅' : '❌';
  const statusText = result.isValid ? 'VALID' : 'INVALID';
  const statusColor = result.isValid ? '#28a745' : '#dc3545';

  return `
<!DOCTYPE html>
<html>
<head>
    <title>WooCommerce Recipe Validation Report - ${recipeName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .status { color: ${statusColor}; font-weight: bold; font-size: 1.2em; }
        .section { margin: 20px 0; }
        .error { color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 3px; margin: 5px 0; }
        .warning { color: #856404; background: #fff3cd; padding: 10px; border-radius: 3px; margin: 5px 0; }
        .suggestion { font-style: italic; color: #6c757d; }
        .score { font-size: 1.5em; font-weight: bold; color: #007bff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>WooCommerce Recipe Validation Report</h1>
        <h2>Recipe: ${recipeName}</h2>
        <div class="status">${statusIcon} ${statusText}</div>
        <div class="score">Compliance Score: ${result.score}/100</div>
        <p>Generated: ${result.timestamp}</p>
    </div>

    ${result.errors.length > 0 ? `
    <div class="section">
        <h3>🚨 Errors (${result.errors.length})</h3>
        ${result.errors.map((error: any, index: number) => `
            <div class="error">
                <strong>${index + 1}. [${error.category.toUpperCase()}] ${error.message}</strong>
                ${error.field ? `<br><small>Field: ${error.field}</small>` : ''}
                ${error.suggestion ? `<div class="suggestion">Suggestion: ${error.suggestion}</div>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${result.warnings.length > 0 ? `
    <div class="section">
        <h3>⚠️ Warnings (${result.warnings.length})</h3>
        ${result.warnings.map((warning: any, index: number) => `
            <div class="warning">
                <strong>${index + 1}. [${warning.category.toUpperCase()}] ${warning.message}</strong>
                ${warning.field ? `<br><small>Field: ${warning.field}</small>` : ''}
                ${warning.suggestion ? `<div class="suggestion">Suggestion: ${warning.suggestion}</div>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${result.errors.length === 0 && result.warnings.length === 0 ? `
    <div class="section">
        <h3>🎉 No Issues Found!</h3>
        <p>Recipe is fully compliant with WooCommerce standards.</p>
    </div>
    ` : ''}
</body>
</html>`;
}

function generateHtmlReportAll(validationResults: any): string {
  const { results, summary } = validationResults;
  const validCount = summary.validRecipes;
  const invalidCount = summary.invalidRecipes;
  const totalCount = summary.totalRecipes;

  return `
<!DOCTYPE html>
<html>
<head>
    <title>WooCommerce Recipe Validation Report - All Recipes</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .summary-item { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
        .summary-item.valid { background: #d4edda; color: #155724; }
        .summary-item.invalid { background: #f8d7da; color: #721c24; }
        .recipe { margin: 20px 0; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; }
        .recipe.valid { border-left: 5px solid #28a745; }
        .recipe.invalid { border-left: 5px solid #dc3545; }
        .error { color: #dc3545; background: #f8d7da; padding: 5px; border-radius: 3px; margin: 2px 0; }
        .warning { color: #856404; background: #fff3cd; padding: 5px; border-radius: 3px; margin: 2px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>WooCommerce Recipe Validation Report</h1>
        <h2>All Recipes Summary</h2>
        <div class="summary">
            <div class="summary-item">
                <h3>${totalCount}</h3>
                <p>Total Recipes</p>
            </div>
            <div class="summary-item valid">
                <h3>${validCount}</h3>
                <p>Valid Recipes</p>
            </div>
            <div class="summary-item invalid">
                <h3>${invalidCount}</h3>
                <p>Invalid Recipes</p>
            </div>
            <div class="summary-item">
                <h3>${summary.averageScore}</h3>
                <p>Average Score</p>
            </div>
        </div>
    </div>

    ${results.map((item: any) => `
        <div class="recipe ${item.result.isValid ? 'valid' : 'invalid'}">
            <h3>${item.recipeName} ${item.result.isValid ? '✅' : '❌'}</h3>
            <p><strong>Score:</strong> ${item.result.score}/100</p>
            <p><strong>Errors:</strong> ${item.result.errors.length} | <strong>Warnings:</strong> ${item.result.warnings.length}</p>
            
            ${item.result.errors.length > 0 ? `
                <h4>Errors:</h4>
                ${item.result.errors.map((error: any) => `
                    <div class="error">[${error.category}] ${error.message}</div>
                `).join('')}
            ` : ''}
            
            ${item.result.warnings.length > 0 ? `
                <h4>Warnings:</h4>
                ${item.result.warnings.map((warning: any) => `
                    <div class="warning">[${warning.category}] ${warning.message}</div>
                `).join('')}
            ` : ''}
        </div>
    `).join('')}
</body>
</html>`;
}

function generateConsoleReportAll(validationResults: any): string {
  const { results, summary } = validationResults;
  const lines: string[] = [];

  lines.push('=== WooCommerce Recipe Validation Report - All Recipes ===');
  lines.push(`Total Recipes: ${summary.totalRecipes}`);
  lines.push(`Valid Recipes: ${summary.validRecipes}`);
  lines.push(`Invalid Recipes: ${summary.invalidRecipes}`);
  lines.push(`Average Score: ${summary.averageScore}/100`);
  lines.push(`Total Errors: ${summary.totalErrors}`);
  lines.push(`Total Warnings: ${summary.totalWarnings}`);
  lines.push('');

  results.forEach((item: any, index: number) => {
    lines.push(`${index + 1}. ${item.recipeName} ${item.result.isValid ? '✅' : '❌'} (Score: ${item.result.score}/100)`);

    if (item.result.errors.length > 0) {
      lines.push(`   Errors: ${item.result.errors.length}`);
      item.result.errors.forEach((error: any) => {
        lines.push(`     - [${error.category}] ${error.message}`);
      });
    }

    if (item.result.warnings.length > 0) {
      lines.push(`   Warnings: ${item.result.warnings.length}`);
      item.result.warnings.forEach((warning: any) => {
        lines.push(`     - [${warning.category}] ${warning.message}`);
      });
    }

    lines.push('');
  });

  return lines.join('\n');
}

// Initialize CLI and run
(async () => {
  await initializeCLI();
  program.parse();
})();
