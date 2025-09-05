# Recipe Compliance Testing Guide

## Overview

This guide explains how to test recipe compliance for WooCommerce compatibility, including unit tests, integration tests, and troubleshooting common issues.

## Table of Contents

1. [Testing Framework](#testing-framework)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [Running Tests](#running-tests)
5. [Test Coverage](#test-coverage)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## Testing Framework

The recipe compliance testing uses Jest as the primary testing framework with the following structure:

```
src/
├── lib/__tests__/                    # Unit tests for core validation logic
│   ├── woocommerce-recipe-validator.test.ts
│   ├── woocommerce-validation-schema.test.ts
│   └── recipe-compliance-auditor.test.ts
├── test/integration/                 # Integration tests for complete pipeline
│   └── recipe-compliance-pipeline.test.ts
└── test/examples/                    # Example usage and demonstrations
    └── woocommerce-csv-testing-example.test.ts
```

## Unit Tests

### WooCommerceRecipeValidator Tests

Tests the core validation logic for individual recipes:

```typescript
// Test compliant recipe
const recipe: RecipeConfig = {
  name: 'Test Recipe',
  selectors: {
    title: '.product-title',
    price: '.price .amount',
    images: '.product-gallery img',
    // ... other required selectors
  },
  transforms: {
    attributes: {
      Color: ['.color-selector'],  // PascalCase naming
      Size: ['.size-selector'],
    },
  },
};

const result = validator.validateRecipe(recipe);
expect(result.isValid).toBe(true);
expect(result.score).toBeGreaterThan(60);
```

### RecipeComplianceAuditor Tests

Tests the audit system for comprehensive recipe analysis:

```typescript
const auditor = new RecipeComplianceAuditor('./recipes');

// Test report generation
const report = auditor.generateConsoleReport(auditReport);
expect(report).toContain('RECIPE COMPLIANCE AUDIT REPORT');

// Test single recipe audit
const result = await auditor.auditRecipe('Generic E-commerce');
expect(result.complianceScore).toBeGreaterThanOrEqual(0);
```

## Integration Tests

### Complete Pipeline Testing

Tests the full recipe-to-CSV pipeline:

```typescript
describe('Complete Recipe-to-CSV Pipeline', () => {
  it('should validate compliant recipes produce valid WooCommerce CSV structure', async () => {
    const recipe = await recipeLoader.loadRecipe('Generic E-commerce');
    const validationResult = validator.validateRecipe(recipe);
    
    expect(validationResult.isValid).toBe(true);
    expect(recipe.selectors.title).toBeDefined();
    expect(recipe.selectors.price).toBeDefined();
  });
});
```

### Performance Testing

Ensures validation completes within acceptable time limits:

```typescript
it('should validate recipes within acceptable time limits', async () => {
  const startTime = Date.now();
  const validationResult = validator.validateRecipe(recipe);
  const validationTime = Date.now() - startTime;
  
  expect(validationTime).toBeLessThan(1000); // Less than 1 second
});
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm test -- src/lib/__tests__/

# Integration tests only
npm test -- src/test/integration/

# Specific test file
npm test -- src/lib/__tests__/woocommerce-recipe-validator.test.ts
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm test -- --watch
```

## Test Coverage

Current test coverage includes:

- ✅ **WooCommerceRecipeValidator**: All validation rules and edge cases
- ✅ **RecipeComplianceAuditor**: Report generation and audit functionality
- ✅ **Integration Pipeline**: Complete recipe-to-CSV workflow
- ✅ **Performance Testing**: Validation time limits
- ✅ **Error Handling**: Malformed data and missing files

## Troubleshooting

### Common Test Failures

#### 1. Recipe Not Found Error
```
Error: Recipe 'recipe-name' not found
```
**Solution**: Ensure recipe name matches exactly (case-sensitive) or check if recipe file exists.

#### 2. Validation Timeout
```
Test timeout exceeded
```
**Solution**: Check for infinite loops in validation logic or increase Jest timeout.

#### 3. TypeScript Errors
```
Type 'string' is not assignable to type 'Date'
```
**Solution**: Use `new Date()` instead of `new Date().toISOString()` for timestamp fields.

### Debug Mode

Run tests with verbose output:
```bash
npm test -- --verbose
```

### Test Data Issues

If tests fail due to missing test data:
1. Check if recipe files exist in `./recipes/` directory
2. Verify recipe file format (YAML/JSON)
3. Ensure recipe has required fields

## Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests with `describe` blocks
- Use `beforeEach` for setup
- Clean up after tests

### 2. Test Data
- Use realistic test data
- Test both valid and invalid scenarios
- Include edge cases
- Mock external dependencies when needed

### 3. Assertions
- Test both positive and negative cases
- Verify error messages are helpful
- Check performance requirements
- Validate data structure integrity

### 4. Maintenance
- Update tests when adding new validation rules
- Keep test data in sync with actual recipes
- Document test requirements
- Regular test review and cleanup

## Example Test Scenarios

### Valid Recipe Test
```typescript
it('should validate a compliant recipe successfully', () => {
  const recipe = createValidRecipe();
  const result = validator.validateRecipe(recipe);
  
  expect(result.isValid).toBe(true);
  expect(result.errors).toHaveLength(0);
  expect(result.score).toBeGreaterThan(80);
});
```

### Invalid Recipe Test
```typescript
it('should detect missing required selectors', () => {
  const recipe = createInvalidRecipe();
  const result = validator.validateRecipe(recipe);
  
  expect(result.isValid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
  expect(result.errors[0].code).toBe('MISSING_REQUIRED_SELECTOR');
});
```

### Performance Test
```typescript
it('should complete validation within time limit', async () => {
  const startTime = performance.now();
  await validator.validateRecipe(recipe);
  const duration = performance.now() - startTime;
  
  expect(duration).toBeLessThan(100); // 100ms limit
});
```

## Continuous Integration

Tests are automatically run in CI/CD pipeline:

1. **Pre-commit hooks**: Run linting and basic tests
2. **Pull request checks**: Full test suite
3. **Merge validation**: Integration tests
4. **Deployment**: Performance and compatibility tests

## Contributing

When adding new tests:

1. Follow existing test patterns
2. Add appropriate test data
3. Update documentation
4. Ensure CI passes
5. Add performance considerations

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Testing](https://jestjs.io/docs/getting-started#using-typescript)
- [WooCommerce CSV Format](https://woocommerce.com/document/product-csv-import-export/)
- [Recipe Configuration Guide](../USAGE.md)
