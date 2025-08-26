# Testing Guide

This document provides comprehensive information about the testing infrastructure for the General Web Scraper Backend.

## Overview

The project uses Jest as the primary testing framework with TypeScript support. We aim for **80%+ test coverage** across all components.

## Testing Architecture

### Test Types

1. **Unit Tests** (`src/lib/__tests__/`)
   - Test individual functions and classes in isolation
   - Mock external dependencies
   - Fast execution (< 100ms per test)

2. **Integration Tests** (`src/test/integration/`)
   - Test component interactions
   - Mock external services but test internal workflows
   - Medium execution time (100ms - 1s per test)

3. **End-to-End Tests** (`src/test/e2e/`)
   - Test complete scraping workflows
   - Use mock HTTP servers to simulate real websites
   - Longer execution time (1s - 10s per test)

### Test Structure

```
src/
├── lib/
│   ├── __tests__/           # Unit tests for library components
│   │   ├── di-container.test.ts
│   │   ├── error-handler.test.ts
│   │   └── enhanced-base-adapter.test.ts
│   └── ...
├── test/
│   ├── setup.ts             # Global test configuration
│   ├── integration/         # Integration tests
│   │   └── scraping-workflow.test.ts
│   └── e2e/                # End-to-end tests
│       └── mock-website-scraping.test.ts
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # E2E tests only
```

### CI/CD Commands

```bash
# Run tests for continuous integration
npm run test:ci

# Debug tests with Node.js inspector
npm run test:debug

# Pre-commit hook (lint + type-check + unit tests)
npm run precommit
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Coverage report will be available in:
# - Console output
# - HTML report: coverage/lcov-report/index.html
# - LCOV file: coverage/lcov.info
```

## Test Configuration

### Jest Configuration

The Jest configuration is defined in `package.json`:

```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    "setupFilesAfterEnv": ["<rootDir>/src/test/setup.ts"],
    "testTimeout": 30000
  }
}
```

### Test Setup

The global test setup (`src/test/setup.ts`) provides:

- Test environment configuration
- Global test utilities
- Mock console methods
- Dependency injection container setup
- Test data factories

## Writing Tests

### Unit Test Example

```typescript
import { Container } from '../di-container';

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  afterEach(() => {
    container.clear();
  });

  it('should register and resolve a service', () => {
    const mockService = { name: 'test' };
    container.register('testService', mockService);

    const resolved = container.resolve('testService');
    expect(resolved).toBe(mockService);
  });
});
```

### Integration Test Example

```typescript
describe('Scraping Workflow Integration', () => {
  it('should complete a full scraping job successfully', async () => {
    // Setup mocks
    const mockRecipe = testUtils.createMockRecipe();
    mockRecipeManager.getRecipe.mockResolvedValue(mockRecipe);

    // Execute workflow
    const response = await scrapingService.startScraping(request);
    expect(response.success).toBe(true);

    // Verify results
    const jobStatus = await scrapingService.getJobStatus(response.data!.jobId);
    expect(jobStatus.data?.status).toBe('completed');
  });
});
```

### E2E Test Example

```typescript
describe('Real Website Scraping Simulation', () => {
  it('should scrape a complete mock website successfully', async () => {
    // Create mock HTTP server
    const mockServer = createServer(/* ... */);
    
    // Test actual HTTP requests
    const response = await fetch(`${mockServerUrl}/`);
    const html = await response.text();
    
    // Verify scraping results
    expect(html).toContain('Mock E-commerce Site');
  });
});
```

## Test Utilities

### Test Data Factories

```typescript
// Create mock objects for testing
const mockProduct = testUtils.createMockRawProduct({
  title: 'Custom Title',
  price: '199.99'
});

const mockRecipe = testUtils.createMockRecipe({
  behavior: { rateLimit: 100 }
});
```

### Mock Helpers

```typescript
// Mock external dependencies
jest.mock('../http-client');
jest.mock('../puppeteer-http-client');

// Create mock instances
const mockHttpClient = {
  getDom: jest.fn(),
  extractEmbeddedJson: jest.fn(),
} as any;
```

### Async Testing

```typescript
// Test async operations
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Test error conditions
it('should handle errors gracefully', async () => {
  await expect(asyncFunction()).rejects.toThrow('Expected error');
});
```

## Mocking Strategies

### HTTP Requests

For testing HTTP interactions, we use:

1. **Jest mocks** for unit tests
2. **Mock HTTP servers** for integration tests
3. **Real HTTP requests** to mock websites for E2E tests

### Database/Storage

Storage services are mocked using:

```typescript
const mockStorageService = {
  storeJobResult: jest.fn(),
  getJobResult: jest.fn(),
  getStorageStats: jest.fn(),
} as any;
```

### External APIs

External API calls are mocked to ensure:

- Tests run quickly and reliably
- No external dependencies
- Predictable test results

## Performance Testing

### Load Testing

```typescript
it('should handle multiple concurrent scraping jobs', async () => {
  const startTime = Date.now();
  
  // Start multiple jobs simultaneously
  const jobPromises = Array.from({ length: 5 }, () => 
    scrapingService.startScraping(request)
  );
  
  const responses = await Promise.all(jobPromises);
  const totalTime = Date.now() - startTime;
  
  // Verify performance requirements
  expect(totalTime).toBeLessThan(1000);
});
```

### Memory Testing

```typescript
it('should not leak memory during long operations', async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  // Perform memory-intensive operations
  for (let i = 0; i < 100; i++) {
    await scrapingService.startScraping(request);
  }
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;
  
  // Memory increase should be reasonable
  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
});
```

## Error Testing

### Error Scenarios

Test various error conditions:

```typescript
it('should handle network errors gracefully', async () => {
  // Mock network failure
  mockHttpClient.getDom.mockRejectedValue(new Error('Network error'));
  
  // Verify graceful error handling
  const result = await service.processRequest();
  expect(result.success).toBe(false);
  expect(result.error).toContain('Network error');
});
```

### Retry Logic

Test retry mechanisms:

```typescript
it('should retry failed operations', async () => {
  let attemptCount = 0;
  const mockFunction = jest.fn().mockImplementation(() => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('Temporary failure');
    }
    return 'success';
  });
  
  const result = await retryManager.executeWithRetry(mockFunction);
  expect(result).toBe('success');
  expect(mockFunction).toHaveBeenCalledTimes(3);
});
```

## Coverage Requirements

### Minimum Coverage

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Exclusions

The following files are excluded from coverage:

- `src/index.ts` - Application entry point
- `src/server.ts` - Server configuration
- Test files (`.test.ts`, `.spec.ts`)
- Type definition files (`.d.ts`)

### Coverage Reports

Coverage reports are generated in multiple formats:

- **Console**: Summary in terminal output
- **HTML**: Detailed report in `coverage/lcov-report/index.html`
- **LCOV**: Machine-readable format for CI/CD tools

## Continuous Integration

### GitHub Actions

The project includes GitHub Actions workflows that:

1. Run tests on every push and pull request
2. Generate coverage reports
3. Enforce minimum coverage thresholds
4. Run linting and type checking

### Pre-commit Hooks

Use the pre-commit script to ensure code quality:

```bash
npm run precommit
```

This runs:
- ESLint for code quality
- TypeScript type checking
- Unit tests

## Debugging Tests

### Debug Mode

Run tests in debug mode:

```bash
npm run test:debug
```

This starts Node.js with the inspector enabled, allowing you to:

- Set breakpoints in test code
- Inspect variables during test execution
- Step through test logic

### Console Output

During test execution, console output is suppressed by default. To see console output:

```typescript
// In your test
console.log('Debug information');
```

### Test Isolation

Each test runs in isolation:

- Fresh dependency injection container
- Clean mocks
- No shared state between tests

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the expected behavior
3. **Follow the AAA pattern**: Arrange, Act, Assert
4. **Keep tests focused** on a single behavior

### Test Data

1. **Use factories** for creating test data
2. **Avoid hardcoded values** in tests
3. **Make tests deterministic** - same input should always produce same output
4. **Clean up test data** in `afterEach` or `afterAll` hooks

### Mocking

1. **Mock at the right level** - mock external dependencies, not internal logic
2. **Verify mock calls** to ensure correct interaction
3. **Use realistic mock data** that represents real-world scenarios
4. **Reset mocks** between tests to avoid interference

### Async Testing

1. **Always await async operations** in tests
2. **Test both success and failure paths**
3. **Use appropriate timeouts** for long-running operations
4. **Handle cleanup** for async resources

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase `testTimeout` in Jest config
2. **Memory leaks**: Check for unclosed resources in `afterEach` hooks
3. **Flaky tests**: Ensure tests are deterministic and isolated
4. **Coverage gaps**: Review excluded files and add tests for uncovered code

### Performance Issues

1. **Slow tests**: Use mocks for external dependencies
2. **High memory usage**: Clean up resources properly
3. **Network timeouts**: Mock HTTP requests in unit tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
