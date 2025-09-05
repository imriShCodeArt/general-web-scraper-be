import { RecipeLoader } from './recipe-loader';
import { WooCommerceRecipeValidator } from './woocommerce-recipe-validator';
import { RecipeConfig, WooCommerceValidationResult } from '../types';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, extname } from 'path';

export interface RecipeAuditResult {
  recipeName: string;
  filePath: string;
  validationResult: WooCommerceValidationResult;
  complianceIssues: {
    critical: string[];
    warnings: string[];
    suggestions: string[];
  };
  recommendedFixes: {
    attributeNaming: string[];
    selectorImprovements: string[];
    variationDetection: string[];
    performanceOptimizations: string[];
  };
  complianceScore: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ComplianceAuditReport {
  summary: {
    totalRecipes: number;
    compliantRecipes: number;
    nonCompliantRecipes: number;
    averageScore: number;
    criticalIssues: number;
    totalWarnings: number;
    totalSuggestions: number;
  };
  recipes: RecipeAuditResult[];
  recommendations: {
    immediateActions: string[];
    shortTermImprovements: string[];
    longTermOptimizations: string[];
  };
  generatedAt: Date;
}

export class RecipeComplianceAuditor {
  private recipeLoader: RecipeLoader;
  private validator: WooCommerceRecipeValidator;
  private recipesDir: string;

  constructor(recipesDir: string = './recipes') {
    this.recipesDir = recipesDir;
    this.recipeLoader = new RecipeLoader(recipesDir, true); // Enable WooCommerce validation
    this.validator = new WooCommerceRecipeValidator();
  }

  /**
   * Audit all recipes for WooCommerce compliance
   */
  async auditAllRecipes(): Promise<ComplianceAuditReport> {
    const recipeFiles = this.findRecipeFiles();
    const auditResults: RecipeAuditResult[] = [];

    console.log(`🔍 Auditing ${recipeFiles.length} recipes for WooCommerce compliance...`);

    for (const filePath of recipeFiles) {
      try {
        const recipeName = this.extractRecipeName(filePath);
        console.log(`  📋 Auditing: ${recipeName}`);
        
        const recipe = await this.recipeLoader.loadRecipeFromFile(filePath);
        const validationResult = this.validator.validateRecipe(recipe);
        
        const auditResult = this.analyzeRecipeCompliance(recipeName, filePath, recipe, validationResult);
        auditResults.push(auditResult);
        
      } catch (error) {
        console.warn(`  ⚠️  Failed to audit recipe from ${filePath}:`, error);
      }
    }

    return this.generateAuditReport(auditResults);
  }

  /**
   * Audit a specific recipe
   */
  async auditRecipe(recipeName: string): Promise<RecipeAuditResult> {
    const recipe = await this.recipeLoader.loadRecipe(recipeName);
    const validationResult = this.validator.validateRecipe(recipe);
    const filePath = this.findRecipeFilePath(recipeName);
    
    return this.analyzeRecipeCompliance(recipeName, filePath, recipe, validationResult);
  }

  /**
   * Analyze recipe compliance and generate detailed recommendations
   */
  private analyzeRecipeCompliance(
    recipeName: string,
    filePath: string,
    recipe: RecipeConfig,
    validationResult: WooCommerceValidationResult
  ): RecipeAuditResult {
    const complianceIssues = this.categorizeIssues(validationResult);
    const recommendedFixes = this.generateRecommendedFixes(recipe, validationResult);
    const priority = this.determinePriority(validationResult);

    return {
      recipeName,
      filePath,
      validationResult,
      complianceIssues,
      recommendedFixes,
      complianceScore: validationResult.score,
      priority,
    };
  }

  /**
   * Categorize validation issues by severity
   */
  private categorizeIssues(validationResult: WooCommerceValidationResult): {
    critical: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const critical: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Categorize errors as critical
    validationResult.errors.forEach(error => {
      critical.push(`${error.message} (${error.field})`);
    });

    // Categorize warnings by type
    validationResult.warnings.forEach(warning => {
      if (warning.category === 'best-practice') {
        warnings.push(`${warning.message} (${warning.field})`);
      } else if (warning.category === 'performance') {
        suggestions.push(`${warning.message} (${warning.field})`);
      } else if (warning.category === 'deprecation') {
        warnings.push(`${warning.message} (${warning.field})`);
      } else {
        warnings.push(`${warning.message} (${warning.field})`);
      }
    });

    return { critical, warnings, suggestions };
  }

  /**
   * Generate specific recommended fixes for the recipe
   */
  private generateRecommendedFixes(
    recipe: RecipeConfig,
    validationResult: WooCommerceValidationResult
  ): {
    attributeNaming: string[];
    selectorImprovements: string[];
    variationDetection: string[];
    performanceOptimizations: string[];
  } {
    const attributeNaming: string[] = [];
    const selectorImprovements: string[] = [];
    const variationDetection: string[] = [];
    const performanceOptimizations: string[] = [];

    // Analyze attribute naming issues
    if (recipe.transforms?.attributes) {
      Object.keys(recipe.transforms.attributes).forEach(attrName => {
        if (!this.isPascalCase(attrName)) {
          attributeNaming.push(`Convert '${attrName}' to '${this.toPascalCase(attrName)}'`);
        }
        if (attrName.includes('-') || attrName.includes('_')) {
          attributeNaming.push(`Remove special characters from '${attrName}'`);
        }
      });
    }

    // Analyze selector improvements
    const selectors = recipe.selectors;
    if (selectors.attributes && !this.isWooCommerceCompliantSelector(selectors.attributes)) {
      selectorImprovements.push('Update attribute selectors to use WooCommerce patterns');
    }
    if (selectors.variations && !this.isWooCommerceCompliantSelector(selectors.variations)) {
      selectorImprovements.push('Update variation selectors to use WooCommerce patterns');
    }

    // Analyze variation detection
    if (selectors.variations && !selectors.attributes) {
      variationDetection.push('Add attribute selectors when using variations');
    }
    if (selectors.variations && !this.hasVariationFormSelectors(recipe)) {
      variationDetection.push('Add variation form selectors for better detection');
    }

    // Analyze performance issues
    const allSelectors = this.getAllSelectors(recipe);
    const complexSelectors = allSelectors.filter(selector => 
      selector.includes(' ') || selector.includes('>') || selector.includes('+')
    );
    if (complexSelectors.length > 0) {
      performanceOptimizations.push(`Simplify ${complexSelectors.length} complex selectors`);
    }

    return {
      attributeNaming,
      selectorImprovements,
      variationDetection,
      performanceOptimizations,
    };
  }

  /**
   * Determine priority level based on validation results
   */
  private determinePriority(validationResult: WooCommerceValidationResult): 'high' | 'medium' | 'low' {
    if (validationResult.errors.length > 0) {
      return 'high';
    }
    if (validationResult.warnings.length > 5) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Generate comprehensive audit report
   */
  private generateAuditReport(auditResults: RecipeAuditResult[]): ComplianceAuditReport {
    const totalRecipes = auditResults.length;
    const compliantRecipes = auditResults.filter(r => r.validationResult.isValid).length;
    const nonCompliantRecipes = totalRecipes - compliantRecipes;
    const averageScore = auditResults.reduce((sum, r) => sum + r.complianceScore, 0) / totalRecipes;
    
    const criticalIssues = auditResults.reduce((sum, r) => sum + r.complianceIssues.critical.length, 0);
    const totalWarnings = auditResults.reduce((sum, r) => sum + r.complianceIssues.warnings.length, 0);
    const totalSuggestions = auditResults.reduce((sum, r) => sum + r.complianceIssues.suggestions.length, 0);

    const recommendations = this.generateGlobalRecommendations(auditResults);

    return {
      summary: {
        totalRecipes,
        compliantRecipes,
        nonCompliantRecipes,
        averageScore: Math.round(averageScore),
        criticalIssues,
        totalWarnings,
        totalSuggestions,
      },
      recipes: auditResults,
      recommendations,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate global recommendations based on audit results
   */
  private generateGlobalRecommendations(auditResults: RecipeAuditResult[]): {
    immediateActions: string[];
    shortTermImprovements: string[];
    longTermOptimizations: string[];
  } {
    const immediateActions: string[] = [];
    const shortTermImprovements: string[] = [];
    const longTermOptimizations: string[] = [];

    // Count common issues across all recipes
    const attributeNamingIssues = auditResults.filter(r => r.recommendedFixes.attributeNaming.length > 0).length;
    const selectorIssues = auditResults.filter(r => r.recommendedFixes.selectorImprovements.length > 0).length;
    const variationIssues = auditResults.filter(r => r.recommendedFixes.variationDetection.length > 0).length;
    const performanceIssues = auditResults.filter(r => r.recommendedFixes.performanceOptimizations.length > 0).length;

    if (attributeNamingIssues > 0) {
      immediateActions.push(`Fix attribute naming in ${attributeNamingIssues} recipes (critical for WooCommerce compatibility)`);
    }
    if (selectorIssues > 0) {
      immediateActions.push(`Update selectors in ${selectorIssues} recipes to use WooCommerce patterns`);
    }
    if (variationIssues > 0) {
      shortTermImprovements.push(`Improve variation detection in ${variationIssues} recipes`);
    }
    if (performanceIssues > 0) {
      longTermOptimizations.push(`Optimize performance in ${performanceIssues} recipes`);
    }

    return {
      immediateActions,
      shortTermImprovements,
      longTermOptimizations,
    };
  }

  /**
   * Helper methods
   */
  private findRecipeFiles(): string[] {
    if (!existsSync(this.recipesDir)) {
      return [];
    }

    const files: string[] = [];
    const items = readdirSync(this.recipesDir, { withFileTypes: true });

    for (const item of items) {
      if (item.isFile()) {
        const ext = extname(item.name).toLowerCase();
        if (ext === '.yaml' || ext === '.yml' || ext === '.json') {
          files.push(join(this.recipesDir, item.name));
        }
      }
    }

    return files;
  }

  private extractRecipeName(filePath: string): string {
    const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || '';
    return fileName.replace(/\.(yaml|yml|json)$/, '');
  }

  private findRecipeFilePath(recipeName: string): string {
    const recipeFiles = this.findRecipeFiles();
    for (const filePath of recipeFiles) {
      if (this.extractRecipeName(filePath) === recipeName) {
        return filePath;
      }
    }
    return '';
  }

  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\s/g, '');
  }

  private isWooCommerceCompliantSelector(selector: string | string[]): boolean {
    const selectors = Array.isArray(selector) ? selector : [selector];
    return selectors.some(s => 
      s.includes('[name*="attribute"]') ||
      s.includes('.variation-select') ||
      s.includes('.attribute-select') ||
      s.includes('.product-attribute-select')
    );
  }

  private hasVariationFormSelectors(recipe: RecipeConfig): boolean {
    const formSelectors = [
      '.variations_form',
      '.woocommerce-variations-form',
      '.variation-form',
      '.product-variation-form',
      'form.variations'
    ];
    
    const allSelectors = this.getAllSelectors(recipe);
    return formSelectors.some(formSelector => 
      allSelectors.some(selector => selector.includes(formSelector))
    );
  }

  private getAllSelectors(recipe: RecipeConfig): string[] {
    const selectors: string[] = [];
    
    Object.values(recipe.selectors).forEach(value => {
      if (typeof value === 'string') {
        selectors.push(value);
      } else if (Array.isArray(value)) {
        selectors.push(...value);
      }
    });

    if (recipe.behavior?.waitForSelectors) {
      selectors.push(...recipe.behavior.waitForSelectors);
    }

    return selectors;
  }

  /**
   * Generate HTML audit report
   */
  generateHtmlReport(report: ComplianceAuditReport): string {
    const { summary, recipes, recommendations } = report;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Recipe Compliance Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-item { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .summary-item.critical { border-left-color: #dc3545; }
        .summary-item.warning { border-left-color: #ffc107; }
        .summary-item.success { border-left-color: #28a745; }
        .recipe { margin: 20px 0; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
        .recipe.high { border-left: 5px solid #dc3545; }
        .recipe.medium { border-left: 5px solid #ffc107; }
        .recipe.low { border-left: 5px solid #28a745; }
        .issues { margin: 15px 0; }
        .issue-list { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .critical { color: #dc3545; }
        .warning { color: #ffc107; }
        .suggestion { color: #6c757d; }
        .recommendations { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .recommendation-section { margin: 15px 0; }
        .recommendation-section h4 { color: #495057; margin-bottom: 10px; }
        .recommendation-list { list-style: none; padding: 0; }
        .recommendation-list li { padding: 5px 0; border-bottom: 1px solid #dee2e6; }
        .score { font-size: 1.5em; font-weight: bold; }
        .score.high { color: #dc3545; }
        .score.medium { color: #ffc107; }
        .score.low { color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Recipe Compliance Audit Report</h1>
            <p>WooCommerce Recipe Validation Analysis</p>
            <p>Generated: ${report.generatedAt.toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="summary-item">
                <h3>${summary.totalRecipes}</h3>
                <p>Total Recipes</p>
            </div>
            <div class="summary-item success">
                <h3>${summary.compliantRecipes}</h3>
                <p>Compliant Recipes</p>
            </div>
            <div class="summary-item critical">
                <h3>${summary.nonCompliantRecipes}</h3>
                <p>Non-Compliant Recipes</p>
            </div>
            <div class="summary-item">
                <h3>${summary.averageScore}/100</h3>
                <p>Average Score</p>
            </div>
            <div class="summary-item critical">
                <h3>${summary.criticalIssues}</h3>
                <p>Critical Issues</p>
            </div>
            <div class="summary-item warning">
                <h3>${summary.totalWarnings}</h3>
                <p>Warnings</p>
            </div>
        </div>

        <div class="recommendations">
            <h3>📋 Recommendations</h3>
            
            ${recommendations.immediateActions.length > 0 ? `
            <div class="recommendation-section">
                <h4>🚨 Immediate Actions Required</h4>
                <ul class="recommendation-list">
                    ${recommendations.immediateActions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${recommendations.shortTermImprovements.length > 0 ? `
            <div class="recommendation-section">
                <h4>⚠️ Short-term Improvements</h4>
                <ul class="recommendation-list">
                    ${recommendations.shortTermImprovements.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${recommendations.longTermOptimizations.length > 0 ? `
            <div class="recommendation-section">
                <h4>🔧 Long-term Optimizations</h4>
                <ul class="recommendation-list">
                    ${recommendations.longTermOptimizations.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>

        <h3>📊 Recipe Details</h3>
        ${recipes.map(recipe => `
            <div class="recipe ${recipe.priority}">
                <h4>${recipe.recipeName} 
                    <span class="score ${recipe.priority}">${recipe.complianceScore}/100</span>
                    ${recipe.validationResult.isValid ? '✅' : '❌'}
                </h4>
                
                ${recipe.complianceIssues.critical.length > 0 ? `
                <div class="issues">
                    <h5 class="critical">🚨 Critical Issues (${recipe.complianceIssues.critical.length})</h5>
                    <div class="issue-list">
                        ${recipe.complianceIssues.critical.map(issue => `<div class="critical">• ${issue}</div>`).join('')}
                    </div>
                </div>
                ` : ''}

                ${recipe.complianceIssues.warnings.length > 0 ? `
                <div class="issues">
                    <h5 class="warning">⚠️ Warnings (${recipe.complianceIssues.warnings.length})</h5>
                    <div class="issue-list">
                        ${recipe.complianceIssues.warnings.map(issue => `<div class="warning">• ${issue}</div>`).join('')}
                    </div>
                </div>
                ` : ''}

                ${recipe.complianceIssues.suggestions.length > 0 ? `
                <div class="issues">
                    <h5 class="suggestion">💡 Suggestions (${recipe.complianceIssues.suggestions.length})</h5>
                    <div class="issue-list">
                        ${recipe.complianceIssues.suggestions.map(issue => `<div class="suggestion">• ${issue}</div>`).join('')}
                    </div>
                </div>
                ` : ''}

                ${Object.values(recipe.recommendedFixes).some(fixes => fixes.length > 0) ? `
                <div class="issues">
                    <h5>🔧 Recommended Fixes</h5>
                    ${recipe.recommendedFixes.attributeNaming.length > 0 ? `
                    <div class="issue-list">
                        <strong>Attribute Naming:</strong>
                        ${recipe.recommendedFixes.attributeNaming.map(fix => `<div>• ${fix}</div>`).join('')}
                    </div>
                    ` : ''}
                    ${recipe.recommendedFixes.selectorImprovements.length > 0 ? `
                    <div class="issue-list">
                        <strong>Selector Improvements:</strong>
                        ${recipe.recommendedFixes.selectorImprovements.map(fix => `<div>• ${fix}</div>`).join('')}
                    </div>
                    ` : ''}
                    ${recipe.recommendedFixes.variationDetection.length > 0 ? `
                    <div class="issue-list">
                        <strong>Variation Detection:</strong>
                        ${recipe.recommendedFixes.variationDetection.map(fix => `<div>• ${fix}</div>`).join('')}
                    </div>
                    ` : ''}
                    ${recipe.recommendedFixes.performanceOptimizations.length > 0 ? `
                    <div class="issue-list">
                        <strong>Performance Optimizations:</strong>
                        ${recipe.recommendedFixes.performanceOptimizations.map(fix => `<div>• ${fix}</div>`).join('')}
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  /**
   * Generate JSON audit report
   */
  generateJsonReport(report: ComplianceAuditReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate console audit report
   */
  generateConsoleReport(report: ComplianceAuditReport): string {
    const { summary, recipes, recommendations } = report;
    const lines: string[] = [];

    lines.push('='.repeat(80));
    lines.push('🔍 RECIPE COMPLIANCE AUDIT REPORT');
    lines.push('='.repeat(80));
    lines.push(`Generated: ${report.generatedAt.toLocaleString()}`);
    lines.push('');

    lines.push('📊 SUMMARY');
    lines.push('-'.repeat(40));
    lines.push(`Total Recipes: ${summary.totalRecipes}`);
    lines.push(`Compliant Recipes: ${summary.compliantRecipes}`);
    lines.push(`Non-Compliant Recipes: ${summary.nonCompliantRecipes}`);
    lines.push(`Average Score: ${summary.averageScore}/100`);
    lines.push(`Critical Issues: ${summary.criticalIssues}`);
    lines.push(`Warnings: ${summary.totalWarnings}`);
    lines.push(`Suggestions: ${summary.totalSuggestions}`);
    lines.push('');

    if (recommendations.immediateActions.length > 0) {
      lines.push('🚨 IMMEDIATE ACTIONS REQUIRED');
      lines.push('-'.repeat(40));
      recommendations.immediateActions.forEach(action => lines.push(`• ${action}`));
      lines.push('');
    }

    if (recommendations.shortTermImprovements.length > 0) {
      lines.push('⚠️ SHORT-TERM IMPROVEMENTS');
      lines.push('-'.repeat(40));
      recommendations.shortTermImprovements.forEach(action => lines.push(`• ${action}`));
      lines.push('');
    }

    if (recommendations.longTermOptimizations.length > 0) {
      lines.push('🔧 LONG-TERM OPTIMIZATIONS');
      lines.push('-'.repeat(40));
      recommendations.longTermOptimizations.forEach(action => lines.push(`• ${action}`));
      lines.push('');
    }

    lines.push('📋 RECIPE DETAILS');
    lines.push('-'.repeat(40));
    recipes.forEach((recipe, index) => {
      lines.push(`${index + 1}. ${recipe.recipeName} (${recipe.complianceScore}/100) ${recipe.validationResult.isValid ? '✅' : '❌'}`);
      lines.push(`   Priority: ${recipe.priority.toUpperCase()}`);
      lines.push(`   Critical Issues: ${recipe.complianceIssues.critical.length}`);
      lines.push(`   Warnings: ${recipe.complianceIssues.warnings.length}`);
      lines.push(`   Suggestions: ${recipe.complianceIssues.suggestions.length}`);
      lines.push('');
    });

    return lines.join('\n');
  }
}
