import { RecipeComplianceAuditor, type ComplianceAuditReport } from '../recipe-compliance-auditor';

describe('RecipeComplianceAuditor - reports', () => {
  const auditor = new RecipeComplianceAuditor('./recipes');

  const sampleReport: ComplianceAuditReport = {
    summary: {
      totalRecipes: 2,
      compliantRecipes: 2,
      nonCompliantRecipes: 0,
      averageScore: 65,
      criticalIssues: 0,
      totalWarnings: 3,
      totalSuggestions: 4,
    },
    recipes: [
      {
        recipeName: 'recipes/generic-ecommerce',
        filePath: 'recipes/generic-ecommerce.yaml',
        validationResult: {
          isValid: true,
          errors: [],
          warnings: [],
          score: 70,
          timestamp: new Date(),
        },
        complianceIssues: {
          critical: [],
          warnings: [],
          suggestions: ['Found complex selectors (selectors)'],
        },
        recommendedFixes: {
          attributeNaming: [],
          selectorImprovements: [],
          variationDetection: [],
          performanceOptimizations: ['Simplify 3 complex selectors'],
        },
        complianceScore: 70,
        priority: 'medium',
      },
      {
        recipeName: 'recipes/hebrew-ecommerce',
        filePath: 'recipes/hebrew-ecommerce.yaml',
        validationResult: {
          isValid: true,
          errors: [],
          warnings: [],
          score: 60,
          timestamp: new Date(),
        },
        complianceIssues: {
          critical: [],
          warnings: ['Attribute selectors do not match patterns (selectors.attributes)'],
          suggestions: ['Found inefficient selectors (selectors)'],
        },
        recommendedFixes: {
          attributeNaming: [],
          selectorImprovements: ['Update attribute selectors to WooCommerce patterns'],
          variationDetection: [],
          performanceOptimizations: ['Simplify 2 complex selectors'],
        },
        complianceScore: 60,
        priority: 'medium',
      },
    ],
    recommendations: {
      immediateActions: ['Update selectors in 1 recipes to use WooCommerce patterns'],
      shortTermImprovements: [],
      longTermOptimizations: ['Optimize performance in 2 recipes'],
    },
    generatedAt: new Date(),
  };

  test('generateConsoleReport returns a readable summary', () => {
    const output = auditor.generateConsoleReport(sampleReport);
    expect(output).toContain('RECIPE COMPLIANCE AUDIT REPORT');
    expect(output).toContain('Total Recipes: 2');
    expect(output).toContain('recipes/generic-ecommerce (70/100)');
    expect(output).toContain('recipes/hebrew-ecommerce (60/100)');
  });

  test('generateJsonReport returns valid JSON with summary and recipes', () => {
    const json = auditor.generateJsonReport(sampleReport);
    const parsed = JSON.parse(json);
    expect(parsed.summary.totalRecipes).toBe(2);
    expect(parsed.recipes).toHaveLength(2);
    expect(parsed.recipes[0].recipeName).toBe('recipes/generic-ecommerce');
  });

  test('generateHtmlReport returns HTML string containing key sections', () => {
    const html = auditor.generateHtmlReport(sampleReport);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Recipe Compliance Audit Report');
    expect(html).toContain('Total Recipes');
    expect(html).toContain('recipes/generic-ecommerce');
  });
});

describe('RecipeComplianceAuditor - auditRecipe integration (single known recipe)', () => {
  const auditor = new RecipeComplianceAuditor('./recipes');

  test('auditRecipe for Generic E-commerce returns valid structure', async () => {
    const result = await auditor.auditRecipe('Generic E-commerce');
    expect(result.recipeName).toBe('Generic E-commerce');
    expect(result.validationResult).toBeDefined();
    expect(typeof result.complianceScore).toBe('number');
    expect(result.recommendedFixes).toBeDefined();
  });
});


