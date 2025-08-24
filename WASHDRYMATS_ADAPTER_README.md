# Wash+Dry Mats Website Adapter

This adapter has been specifically designed to handle the product extraction from [washdrymats.com](https://washdrymats.com/collections/clearance) and similar Shopify-based websites.

## Problem Solved

Previously, the scraper was only finding 5 products instead of the expected 13 products on the clearance page. This adapter implements multiple extraction strategies to ensure all products are captured.

## Features

### Multi-Strategy Product Extraction
1. **Product Card Detection**: Looks for products in `.product-item`, `.product-card`, and `[data-product-id]` containers
2. **Main Content Scanning**: Searches within main content areas to avoid navigation links
3. **Comprehensive Fallback**: Scans all product links as a last resort

### Shopify-Specific Optimizations
- Handles Shopify URL structure (`/products/product-handle`)
- Removes tracking parameters (utm_source, gclid, etc.)
- Deduplicates products by Shopify handle
- Canonicalizes URLs for consistent processing

### Smart Filtering
- Excludes cart, checkout, and add-to-cart links
- Filters out collection and page navigation links
- Focuses on actual product pages

### Enhanced Product Page Scraping
The adapter now includes specialized product page extraction for washdrymats.com:

- **Enhanced Title Extraction**: Specifically targets floor mat product titles
- **Improved Description Extraction**: Captures detailed product descriptions and care instructions
- **Better Price Extraction**: Handles both original and sale prices from the unique pricing structure
- **Advanced Image Extraction**: Finds product images with multiple views and angles
- **Comprehensive Attribute Extraction**: Captures size, material, warranty, and features
- **Variation Detection**: Identifies size variants and product codes (e.g., S68)
- **SKU Extraction**: Extracts product codes like "S68" from the page content

## Usage

### Automatic Registration
The adapter is automatically registered when the scraping service starts up. No manual configuration is required.

### Manual Testing
You can test the adapter manually using the provided test scripts:

```bash
# Run the comprehensive test suite
npm test -- --testPathPattern=wash-and-dry-adapter.test.ts
```

### Integration
The adapter integrates seamlessly with the existing scraping pipeline:

```typescript
import { ArchiveScraper } from './src/lib/archive-scraper';
import { setupWashAndDryAdapter } from './src/lib/wash-and-dry-adapter';

// Setup adapters
setupWashAndDryAdapter();

// Scrape normally
const result = await ArchiveScraper.scrapeAllArchivePages('https://washdrymats.com/collections/clearance');
```

## Technical Details

### Adapter Structure
```typescript
const washDryMatsAdapter: ArchiveAdapter = {
  // Inherits base Shopify functionality
  ...washAndDryAdapter,
  
  // Custom product extraction for washdrymats.com
  extractProductUrls: ($, baseUrl, html) => {
    // Multi-strategy implementation
  }
};

// Enhanced product page adapter
export const washDryMatsProductAdapter = {
  extractTitle: ($) => { /* Enhanced title extraction */ },
  extractDescription: ($) => { /* Enhanced description extraction */ },
  extractRegularPrice: ($) => { /* Original price extraction */ },
  extractSalePrice: ($) => { /* Current price extraction */ },
  extractImages: ($) => { /* Enhanced image extraction */ },
  extractAttributes: ($) => { /* Comprehensive attribute extraction */ },
  extractVariations: ($) => { /* Size variant detection */ },
  extractSKU: ($) => { /* Product code extraction */ }
};
```

### Supported Selectors
- **Archive Pages**: `.product-item a[href*="/products/"]`, `.product-card a[href*="/products/"]`, `[data-product-id] a[href*="/products/"]`
- **Product Pages**: Enhanced selectors for titles, descriptions, prices, images, and attributes
- **Fallback**: Any `a[href*="/products/"]` with smart filtering

### URL Processing
1. **Extraction**: Finds all product links using multiple strategies
2. **Validation**: Ensures links point to actual products
3. **Canonicalization**: Removes tracking parameters
4. **Deduplication**: Uses Shopify handles to avoid duplicates

### Product Data Extraction
The enhanced product adapter specifically handles:

- **Size Information**: Extracts dimensions like "20"x27.5"" and codes like "S68"
- **Material Details**: Identifies nylon and rubber components
- **Warranty Information**: Captures 5-year warranty details
- **Features**: Detects washable, slip-resistant, low-profile characteristics
- **Pricing**: Handles both original and discounted prices
- **Images**: Finds multiple product views and angles

## Expected Results

With this adapter, scraping the Wash+Dry Mats clearance page should now return:
- **Before**: 5 products (incomplete) with basic information
- **After**: 13 products (complete) with comprehensive product details

### Product Information Captured
- Complete product titles and descriptions
- Original and sale prices
- Multiple product images
- Size variants and product codes
- Material composition and features
- Warranty and care instructions

## Troubleshooting

### If Still Not Working
1. Check that the adapter is registered: Look for "washdrymats.com adapters registered successfully" in logs
2. Verify the website structure hasn't changed
3. Run the test suite to verify adapter functionality

### Common Issues
- **No products found**: Website structure may have changed, check selectors
- **Partial results**: Some products may be loaded dynamically via JavaScript
- **Missing product details**: Ensure both archive and product adapters are registered
- **Duplicate products**: Check deduplication logic

## Testing

The adapter includes comprehensive tests that verify:
- Archive page product extraction
- Product page data extraction
- Adapter registration and functionality
- Integration with the main scraping pipeline

Run tests with:
```bash
npm test -- --testPathPattern=wash-and-dry-adapter.test.ts
```

## Future Improvements

- Add support for JavaScript-rendered content
- Implement pagination detection for multi-page collections
- Add support for other product categories beyond clearance
- Enhance variation detection for other product types
- Support for other Shopify-based websites

## Contributing

To add support for similar websites:
1. Copy the adapter structure
2. Modify selectors for the target site
3. Test with the provided test suite
4. Register the new adapter

## License

This adapter is part of the general-web-scraper project and follows the same licensing terms.
