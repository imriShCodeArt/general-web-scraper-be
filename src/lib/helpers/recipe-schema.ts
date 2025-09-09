// Lightweight runtime validation for RecipeConfig.
// Using manual checks to avoid new dependencies.

export interface RecipeSelectorConfig {
  productLinks?: string[] | string;
  title?: string | string[];
  price?: string | string[];
}

export interface RecipeBehaviorConfig {
  rateLimit?: number;
  maxConcurrent?: number;
}

export interface RecipeConfigSchema {
  name: string;
  siteUrlPattern?: string;
  selectors: RecipeSelectorConfig;
  behavior?: RecipeBehaviorConfig;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export function validateRecipeConfig(config: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';

  if (!isObject(config)) {
    return { valid: false, issues: [{ path: '', message: 'Config must be an object' }] };
  }

  // name
  if (typeof config.name !== 'string' || config.name.trim() === '') {
    issues.push({ path: 'name', message: 'name must be a non-empty string' });
  }

  // selectors
  if (!isObject(config.selectors)) {
    issues.push({ path: 'selectors', message: 'selectors must be an object' });
  } else {
    const sel = config.selectors as Record<string, unknown>;
    const checkStrOrArr = (val: unknown): boolean =>
      typeof val === 'string' || (Array.isArray(val) && val.every((s) => typeof s === 'string'));

    if (sel.productLinks === undefined || !checkStrOrArr(sel.productLinks)) {
      issues.push({ path: 'selectors.productLinks', message: 'productLinks must be string or string[]' });
    }
    if (sel.title !== undefined && !checkStrOrArr(sel.title)) {
      issues.push({ path: 'selectors.title', message: 'title must be string or string[]' });
    }
    if (sel.price !== undefined && !checkStrOrArr(sel.price)) {
      issues.push({ path: 'selectors.price', message: 'price must be string or string[]' });
    }
  }

  // behavior
  if (config.behavior !== undefined) {
    if (!isObject(config.behavior)) {
      issues.push({ path: 'behavior', message: 'behavior must be an object' });
    } else {
      const b = config.behavior as Record<string, unknown>;
      if (b.rateLimit !== undefined && (typeof b.rateLimit !== 'number' || b.rateLimit < 0)) {
        issues.push({ path: 'behavior.rateLimit', message: 'rateLimit must be a non-negative number' });
      }
      if (b.maxConcurrent !== undefined && (typeof b.maxConcurrent !== 'number' || b.maxConcurrent <= 0)) {
        issues.push({ path: 'behavior.maxConcurrent', message: 'maxConcurrent must be a positive number' });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}


