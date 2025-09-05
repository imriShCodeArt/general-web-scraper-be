# Test Fixtures

Test fixtures for integration and API tests providing sample data for comprehensive testing.

## 📁 Structure

```
fixtures/
├── 📄 mock-products.json      # Sample raw and normalized products
├── 📄 mock-recipe.json        # Minimal valid recipe config
└── 📁 mock-html/              # HTML snippets for parsing
    └── 📄 product.html        # Sample product HTML
```

## 📊 Test Data Coverage

### Product Data (`mock-products.json`)
- **Raw Products**: Unprocessed product data from scraping
- **Normalized Products**: Standardized product data for CSV generation
- **Product Types**: Simple and variable products
- **Variations**: Product variations with different attributes
- **Attributes**: Various product attributes and values
- **Images**: Product image URLs and metadata
- **Pricing**: Regular prices, sale prices, and currency handling
- **Stock**: Stock status and inventory management
- **Categories**: Product categories and taxonomies

### Recipe Configuration (`mock-recipe.json`)
- **Basic Recipe**: Minimal valid recipe configuration
- **Selectors**: CSS selectors for product data extraction
- **Validation**: Recipe validation rules and constraints
- **Site Matching**: URL patterns and site-specific configurations

### HTML Fixtures (`mock-html/`)
- **Product HTML**: Sample product page HTML for parsing tests
- **Structure**: Various HTML structures and layouts
- **Edge Cases**: Malformed HTML and special characters
- **Selectors**: HTML elements for testing CSS selectors

## 🧪 Usage Examples

### Using Product Fixtures
```typescript
import mockProducts from '../fixtures/mock-products.json';

// Access raw products
const rawProducts = mockProducts.raw;

// Access normalized products
const normalizedProducts = mockProducts.normalized;

// Use in tests
const product = normalizedProducts[0];
expect(product.title).toBeDefined();
expect(product.sku).toBeDefined();
```

### Using Recipe Fixtures
```typescript
import mockRecipe from '../fixtures/mock-recipe.json';

// Use recipe in tests
const recipe = mockRecipe;
expect(recipe.name).toBe('mock-recipe');
expect(recipe.selectors).toBeDefined();
```

### Using HTML Fixtures
```typescript
import fs from 'fs';
import path from 'path';

// Load HTML fixture
const htmlPath = path.join(__dirname, '../fixtures/mock-html/product.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Use in parsing tests
const parsed = parseProductHtml(htmlContent);
expect(parsed.title).toBeDefined();
```

## 🔧 Test Data Categories

### Phase 1: Basic Products
- Simple products with basic fields
- Required field validation
- Basic CSV generation

### Phase 2: Variable Products
- Products with variations
- Parent-child relationships
- Variation-specific attributes

### Phase 3: Extended Fields
- Complex attribute structures
- Meta attribute columns
- Extended field mapping

### Phase 4: WooCommerce Integration
- WooCommerce-compatible data
- Validation rule compliance
- CSV structure requirements

### Phase 5: Performance & Edge Cases
- Large dataset samples
- Missing field scenarios
- Special character handling
- Memory efficiency testing

## 📈 Data Statistics

- **Total Products**: 50+ sample products
- **Product Types**: Simple, Variable, Grouped
- **Variations**: 100+ product variations
- **Attributes**: 20+ different attribute types
- **Categories**: 10+ product categories
- **Images**: 200+ image URLs
- **Price Ranges**: $0.99 - $999.99

## 🛠️ Maintenance

### Adding New Test Data
1. Update `mock-products.json` with new product data
2. Ensure data follows the normalized product schema
3. Add corresponding HTML fixtures if needed
4. Update tests to use new data

### Updating Existing Data
1. Maintain backward compatibility
2. Update related tests if schema changes
3. Validate data against current schemas
4. Update documentation as needed

## 🔍 Validation

All fixture data is validated against:
- ✅ NormalizedProduct interface
- ✅ ProductVariation interface
- ✅ Recipe configuration schema
- ✅ WooCommerce CSV requirements
- ✅ HTML structure validation

## 📝 Best Practices

1. **Consistent Data**: Use consistent naming and formatting
2. **Realistic Data**: Use realistic product data for better testing
3. **Edge Cases**: Include edge cases and special scenarios
4. **Documentation**: Document any special data or requirements
5. **Validation**: Regularly validate data against schemas
6. **Performance**: Include data for performance testing scenarios


