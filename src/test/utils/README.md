# Test Utilities

Comprehensive test utilities for the General Web Scraper Backend API test suite.

## 📁 Files

### Core Utilities
- **factories.ts**: Create domain objects with sensible defaults and overrides
- **http.ts**: Supertest helpers bound to the Express app
- **mocks.ts**: Pre-shaped jest.Mocked instances for core services
- **test-helpers.ts**: General test helper functions

### CSV Testing Utilities
- **csv-parsing.ts**: CSV parsing, validation, and data extraction utilities
- **csv-template-generator.ts**: CSV template generation for testing
- **woocommerce-matchers.ts**: WooCommerce-specific Jest matchers
- **woocommerce-validation-schemas.ts**: WooCommerce validation schemas

### Index
- **index.ts**: Centralized exports for all test utilities

## 🚀 Usage

```typescript
// Import all utilities
import { factories, http, mockInstances } from 'src/test/utils';

// Import specific utilities
import { parseCsvRows, validateWooCommerceCsvStructure } from 'src/test/utils/csv-parsing';
import { generateCsvTemplate } from 'src/test/utils/csv-template-generator';
import { woocommerceMatchers } from 'src/test/utils/woocommerce-matchers';
```

## 🧪 Available Utilities

### Data Factories
```typescript
// Create normalized products
const product = factories.normalizedProduct({
  title: 'Test Product',
  sku: 'TEST-001'
});

// Create variable products with variations
const variableProduct = factories.variableProduct({
  title: 'Variable Product',
  variations: [
    { sku: 'VAR-001', regularPrice: '29.99' },
    { sku: 'VAR-002', regularPrice: '39.99' }
  ]
});
```

### CSV Parsing
```typescript
// Parse CSV content
const parsed = parseCsvRows(csvContent);
const row = parseCsvRow(csvLine);

// Extract specific data
const attributeColumns = extractAttributeColumns(parsed.headers);
const metaColumns = extractMetaAttributeColumns(parsed.headers);
```

### WooCommerce Validation
```typescript
// Validate CSV structure
const validation = validateWooCommerceCsvStructure(parentCsv, variationCsv, attributes);

// Use custom matchers
expect(csvContent).toHaveWooCommerceProductType('variable');
expect(csvContent).toHaveValidWooCommerceStructure();
```

### Template Generation
```typescript
// Generate CSV templates
const template = generateCsvTemplate(products);
const minimalTemplate = generateMinimalCsvTemplate();
const comprehensiveTemplate = generateComprehensiveCsvTemplate();
```

## 🔧 Test Categories Supported

### Phase 1: Basic CSV Generation
- Simple product creation
- Basic field mapping
- Required field validation

### Phase 2: Variation Support
- Variable product creation
- Variation generation
- Parent-child relationships

### Phase 3: Extended Field Coverage
- Extended field mapping
- Attribute column pairs
- Meta attribute columns
- Price and stock validation

### Phase 4: WooCommerce Integration
- WooCommerce validation schemas
- Template-based testing
- End-to-end validation

### Phase 5: Performance & Edge Cases
- Large dataset generation
- Missing field handling
- Special character processing
- Memory efficiency testing

## 📊 Coverage Areas

- ✅ **Product Data**: Normalized products, variations, attributes
- ✅ **CSV Generation**: Parent and variation CSV creation
- ✅ **Validation**: WooCommerce structure and data validation
- ✅ **Parsing**: CSV content parsing and data extraction
- ✅ **Templates**: CSV template generation for testing
- ✅ **Matchers**: Custom Jest matchers for WooCommerce validation
- ✅ **Performance**: Large dataset and memory efficiency testing
- ✅ **Edge Cases**: Missing fields, special characters, error scenarios

## 🛠️ Custom Matchers

The test utilities include custom Jest matchers for WooCommerce validation:

```typescript
// Product type validation
expect(csvContent).toHaveWooCommerceProductType('variable');

// Structure validation
expect(csvContent).toHaveValidWooCommerceStructure();

// Column validation
expect(csvContent).toHaveWooCommerceColumn('post_title');
expect(csvContent).toHaveWooCommerceColumn('attribute:Color');

// Data validation
expect(csvContent).toHaveValidWooCommerceData();
```

## 📝 Best Practices

1. **Use Factories**: Always use factories for creating test data
2. **Validate Structure**: Use WooCommerce matchers for validation
3. **Parse CSV**: Use parsing utilities for data extraction
4. **Template Generation**: Use templates for consistent test data
5. **Error Testing**: Test both success and error scenarios
6. **Performance**: Use performance utilities for large dataset testing

## 🔍 Debugging

### Enable Debug Logging
```typescript
// Enable debug logging for specific utilities
process.env.DEBUG = 'csv-generator,woocommerce-validation';
```

### Verbose Test Output
```bash
npm test -- --verbose
```

### Coverage Reports
```bash
npm run test:coverage
```


