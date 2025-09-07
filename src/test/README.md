# Test Suite Documentation

This document provides comprehensive coverage of the test suite for the General Web Scraper Backend API. The test suite has been optimized to focus on meaningful tests that provide real business value while maintaining comprehensive coverage.

## 📁 Test Structure

```
src/test/
├── 📁 e2e/                    # End-to-end API tests
├── 📁 integration/            # Integration tests for core services
├── 📁 performance/            # Performance and edge case tests
├── 📁 examples/               # Example usage and demonstrations
├── 📁 fixtures/               # Test data and mock files
├── 📁 utils/                  # Test utilities and helpers
├── 📄 setup.ts                # Global test setup
├── 📄 setup-woocommerce-matchers.ts  # WooCommerce-specific matchers
└── 📄 global-teardown.ts      # Global test cleanup
```

## 🧪 Test Categories

### 1. End-to-End Tests (`e2e/`)
Tests the complete API functionality from HTTP requests to responses.

**Files:**
- `api.test.ts` - Core API endpoint testing
- `mock-website-scraping.test.ts` - Full scraping workflow testing

**Coverage:**
- ✅ Health check endpoints
- ✅ Scraping job initialization
- ✅ Job status tracking
- ✅ Performance monitoring endpoints
- ✅ Error handling and validation

### 2. Integration Tests (`integration/`)
Tests the interaction between different services and components.

**Files:**
- `scraping-workflow.test.ts` - Complete scraping workflow
- `scraping-service.test.ts` - Scraping service functionality
- `recipe-manager.test.ts` - Recipe management and validation
- `woocommerce-csv-validation.test.ts` - WooCommerce CSV validation
- `phase4-demonstration.test.ts` - Phase 4 functionality demonstration

**Coverage:**
- ✅ Service integration and dependency injection
- ✅ Recipe loading and validation
- ✅ CSV generation and validation
- ✅ WooCommerce compatibility
- ✅ Error handling and edge cases

### 3. Performance Tests (`performance/`)
Tests for performance, scalability, and edge cases.

**Files:**
- `phase5-performance-edge-cases.test.ts` - Phase 5 comprehensive testing
- `scrape-performance.test.ts` - Scraping performance benchmarks

**Coverage:**
- ✅ Large dataset handling (1000+ products)
- ✅ Memory efficiency testing
- ✅ Complex variation processing
- ✅ Missing field handling
- ✅ Special character processing
- ✅ Performance benchmarks

### 4. Comprehensive Coverage Tests
Tests for specific functionality areas with extensive coverage.

**Files:**
- `comprehensive-csv-coverage.test.ts` - Phase 3 CSV coverage

**Coverage:**
- ✅ Extended field mapping
- ✅ Attribute column pairs
- ✅ Meta attribute columns
- ✅ Price and stock validation
- ✅ WooCommerce CSV structure validation

### 5. Example Tests (`examples/`)
Demonstration and example usage tests.

**Files:**
- `woocommerce-csv-testing-example.test.ts` - WooCommerce CSV testing examples

**Coverage:**
- ✅ Example usage patterns
- ✅ Best practices demonstration
- ✅ Template generation examples

## 🔧 Test Utilities

### Core Utilities (`utils/`)
- `factories.ts` - Test data factories for creating mock objects
- `csv-parsing.ts` - CSV parsing and validation utilities
- `csv-template-generator.ts` - CSV template generation utilities
- `woocommerce-matchers.ts` - WooCommerce-specific Jest matchers
- `woocommerce-validation-schemas.ts` - WooCommerce validation schemas
- `test-helpers.ts` - General test helper functions
- `mocks.ts` - Mock service implementations
- `http.ts` - HTTP testing utilities

### Test Data (`fixtures/`)
- `mock-products.json` - Sample product data
- `mock-recipe.json` - Sample recipe configuration
- `mock-html/` - HTML snippets for parsing tests

## 📊 Test Coverage Areas

### Phase 1: Basic CSV Generation
- ✅ Simple product CSV generation
- ✅ Basic field mapping
- ✅ Required field validation

### Phase 2: Variation Support
- ✅ Variable product handling
- ✅ Product variations
- ✅ Variation CSV generation

### Phase 3: Extended Field Coverage
- ✅ Extended field mapping
- ✅ Attribute column pairs
- ✅ Meta attribute columns
- ✅ Price and stock validation

### Phase 4: WooCommerce Integration
- ✅ WooCommerce validation schemas
- ✅ Template-based testing
- ✅ End-to-end validation
- ✅ CSV structure validation

### Phase 5: Performance & Edge Cases
- ✅ Large dataset handling (1000+ products)
- ✅ Memory efficiency testing
- ✅ Missing field handling
- ✅ Special character processing
- ✅ Complex variation scenarios

### Phase 6: Documentation & Cleanup
- ✅ Test documentation updates
- ✅ Full test suite validation
- ✅ WooCommerce rule verification

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Categories
```bash
# E2E tests
npm test -- --testPathPattern="e2e/"

# Integration tests
npm test -- --testPathPattern="integration/"

# Performance tests
npm test -- --testPathPattern="performance/"

# Specific test file
npm test -- --testPathPattern="phase5-performance-edge-cases.test.ts"
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run Specific Test
```bash
npm test -- --testNamePattern="should handle large dataset"
```

## 📈 Test Metrics

- **Total Test Files**: 12
- **Total Test Cases**: 274
- **Coverage Areas**: 6 phases
- **Test Categories**: 5 (E2E, Integration, Performance, Comprehensive, Examples)
- **Utility Files**: 8
- **Fixture Files**: 3
- **Code Coverage**: 51% (focused on critical business logic)

## 🎯 Test Quality Improvements

The test suite has been optimized to focus on meaningful tests:

- **Simplified Mock Data**: Reduced overly complex test data to realistic scenarios
- **Consolidated Validation**: Combined redundant validation tests into comprehensive tests
- **Realistic Performance Tests**: Reduced dataset sizes and timing expectations to practical levels
- **Focused Coverage**: Maintained critical business logic coverage while removing test bloat

## 🔍 WooCommerce Validation

The test suite includes comprehensive WooCommerce CSV validation covering:

- ✅ Required column validation
- ✅ Data type validation
- ✅ Format validation (prices, dates, etc.)
- ✅ Product type validation
- ✅ Variation validation
- ✅ Attribute validation
- ✅ Image URL validation
- ✅ Stock status validation

## 🛠️ Test Configuration

### Jest Configuration
- TypeScript support via ts-jest
- Custom matchers for WooCommerce validation
- Global setup and teardown
- Mock service implementations

### Test Environment
- Node.js testing environment
- Mock HTTP requests
- File system mocking
- Service dependency injection

## 📝 Best Practices

1. **Test Isolation**: Each test is independent and can run in isolation
2. **Mock Services**: External dependencies are mocked for reliable testing
3. **Data Factories**: Consistent test data generation using factories
4. **Comprehensive Coverage**: Tests cover happy paths, edge cases, and error scenarios
5. **Performance Testing**: Large dataset and memory efficiency testing
6. **Documentation**: Clear test documentation and examples

## 🐛 Debugging Tests

### Enable Debug Logging
```bash
DEBUG=* npm test
```

### Run Single Test with Verbose Output
```bash
npm test -- --testNamePattern="specific test" --verbose
```

### Check Test Coverage
```bash
npm run test:coverage
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [WooCommerce CSV Import Documentation](https://woocommerce.com/document/product-csv-import-suite/)
- [TypeScript Testing Guide](https://jestjs.io/docs/getting-started#using-typescript)
