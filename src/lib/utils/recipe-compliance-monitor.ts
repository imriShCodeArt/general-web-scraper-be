import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { RecipeComplianceAuditor, ComplianceAuditReport } from './recipe-compliance-auditor';

export interface ComplianceMetrics {
  timestamp: string;
  totalRecipes: number;
  compliantRecipes: number;
  nonCompliantRecipes: number;
  averageScore: number;
  criticalIssues: number;
  totalWarnings: number;
  totalSuggestions: number;
}

export class RecipeComplianceMonitor {
  private auditor: RecipeComplianceAuditor;
  private outputDir: string;

  constructor(recipesDir: string = './recipes', outputDir: string = './performance-data') {
    this.auditor = new RecipeComplianceAuditor(recipesDir);
    this.outputDir = outputDir;
  }

  async runAndPersist(): Promise<{ report: ComplianceAuditReport; metrics: ComplianceMetrics }> {
    const report = await this.auditor.auditAllRecipes();
    const metrics = this.toMetrics(report);

    this.ensureDir(this.outputDir);

    const jsonPath = join(this.outputDir, 'compliance.json');
    writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

    const metricsPath = join(this.outputDir, 'compliance-metrics.jsonl');
    writeFileSync(metricsPath, JSON.stringify(metrics) + '\n', { encoding: 'utf-8', flag: 'a' });

    const html = this.auditor.generateHtmlReport(report);
    const htmlPath = join('docs', 'compliance-dashboard.html');
    this.ensureDir('docs');
    writeFileSync(htmlPath, html, 'utf-8');

    return { report, metrics };
  }

  readHistoricalMetrics(): ComplianceMetrics[] {
    const metricsPath = join(this.outputDir, 'compliance-metrics.jsonl');
    if (!existsSync(metricsPath)) return [];
    const content = readFileSync(metricsPath, 'utf-8');
    return content
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => JSON.parse(line));
  }

  private toMetrics(report: ComplianceAuditReport): ComplianceMetrics {
    const { summary } = report;
    return {
      timestamp: new Date().toISOString(),
      totalRecipes: summary.totalRecipes,
      compliantRecipes: summary.compliantRecipes,
      nonCompliantRecipes: summary.nonCompliantRecipes,
      averageScore: summary.averageScore,
      criticalIssues: summary.criticalIssues,
      totalWarnings: summary.totalWarnings,
      totalSuggestions: summary.totalSuggestions,
    };
  }

  private ensureDir(dir: string) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}


