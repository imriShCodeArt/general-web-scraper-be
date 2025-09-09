import { validateRecipeConfig } from '../helpers/recipe-schema';

describe('helpers/recipe-schema', () => {
  it('validates a minimal valid config', () => {
    const result = validateRecipeConfig({
      name: 'test-recipe',
      selectors: { productLinks: '.product a' },
    });
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('reports issues for missing/invalid fields', () => {
    const result = validateRecipeConfig({ selectors: {} } as any);
    expect(result.valid).toBe(false);
    expect(result.issues.find((i) => i.path === 'name')).toBeTruthy();
    expect(result.issues.find((i) => i.path === 'selectors.productLinks')).toBeTruthy();
  });

  it('checks behavior bounds', () => {
    const result = validateRecipeConfig({
      name: 'x',
      selectors: { productLinks: ['.a'] },
      behavior: { rateLimit: -1, maxConcurrent: 0 },
    });
    expect(result.valid).toBe(false);
    expect(result.issues.find((i) => i.path === 'behavior.rateLimit')).toBeTruthy();
    expect(result.issues.find((i) => i.path === 'behavior.maxConcurrent')).toBeTruthy();
  });
});


