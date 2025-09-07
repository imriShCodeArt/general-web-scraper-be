import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

export class RecipeMaintenanceTools {
  constructor(private recipesDir: string = './recipes') {}

  backupAll(targetDir: string = './recipes-backup'): { count: number } {
    if (!existsSync(this.recipesDir)) return { count: 0 };
    const files = readdirSync(this.recipesDir).filter(f => ['.yaml', '.yml', '.json'].includes(extname(f)));
    const { mkdirSync } = require('fs');
    if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

    files.forEach(f => {
      const content = readFileSync(join(this.recipesDir, f));
      writeFileSync(join(targetDir, f), content);
    });
    return { count: files.length };
  }

  compare(recipeAPath: string, recipeBPath: string): { onlyInA: string[]; onlyInB: string[] } {
    const a = this.safeLoad(recipeAPath);
    const b = this.safeLoad(recipeBPath);
    const aKeys = new Set(Object.keys(a || {}));
    const bKeys = new Set(Object.keys(b || {}));
    const onlyInA = Array.from(aKeys).filter(k => !bKeys.has(k));
    const onlyInB = Array.from(bKeys).filter(k => !aKeys.has(k));
    return { onlyInA, onlyInB };
  }

  bulkUpdateSelector(find: string, replace: string): { updated: number } {
    if (!existsSync(this.recipesDir)) return { updated: 0 };
    const files = readdirSync(this.recipesDir).filter(f => ['.yaml', '.yml', '.json'].includes(extname(f)));
    let updated = 0;
    files.forEach(f => {
      const path = join(this.recipesDir, f);
      const content = readFileSync(path, 'utf-8');
      if (content.includes(find)) {
        const next = content.split(find).join(replace);
        writeFileSync(path, next, 'utf-8');
        updated += 1;
      }
    });
    return { updated };
  }

  private safeLoad(path: string): Record<string, unknown> {
    try {
      const content = readFileSync(path, 'utf-8');
      if (path.endsWith('.json')) return JSON.parse(content);
      const yaml = require('yaml');
      return yaml.parse(content);
    } catch {
      return {};
    }
  }
}


