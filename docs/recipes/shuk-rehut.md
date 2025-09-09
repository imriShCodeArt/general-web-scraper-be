# Shuk Rehut Furniture Recipe Documentation

This document provides detailed information about the Shuk Rehut furniture store scraping recipe, including selectors, known patterns, and troubleshooting guidance.

## Overview

**Site**: [Shuk Rehut](https://shukrehut.co.il)  
**Language**: Hebrew (RTL)  
**Currency**: ILS (₪)  
**Product Type**: Furniture (primarily chairs)  
**Recipe File**: `recipes/shuk-rehut-furniture.yaml`

## Site Characteristics

### Language Support
- **Primary Language**: Hebrew
- **Text Direction**: Right-to-Left (RTL)
- **Currency Symbol**: ₪ (Israeli Shekel)
- **Date Format**: DD/MM/YYYY

### Product Structure
- Variable products with multiple variations (colors, materials, sizes)
- Complex variation forms with radio buttons and select dropdowns
- Hebrew product names and descriptions
- Image galleries with multiple product photos

## Key Selectors and Patterns

### Product Discovery
```yaml
productLinks:
  - '.item a'                    # Primary product link selector
  - 'a[href*="chair"]'          # Chair-specific links
  - 'a[href*="כיסא"]'           # Hebrew "chair" links
  - 'a[href*="product"]'        # Generic product links
```

### Product Information
```yaml
title:
  - 'h1'                        # Main product title
  - '.product-title'            # Alternative title class
  - '.item-title'               # Item-specific title

price:
  - '.price'                    # Primary price selector
  - '[class*="price"]'          # Any element with "price" in class
  - '.amount'                   # Alternative price class

description:
  - '.description_pr'           # Primary description container
  - '.description'              # Generic description
  - '.product-description'      # Product-specific description
```

### Variation Handling (Critical)

The Shuk Rehut site uses a complex variation system with multiple form controls:

#### Variation Form Container
```yaml
variationForm:
  - '.options_group'            # Primary variation container
  - '#input-option386'          # Specific option container ID
  - 'form'                     # Fallback form selector
```

#### Variation Controls (Prioritized for Performance)
```yaml
variations:
  # High-priority scoped selectors (Phase 8 optimization)
  - '.options_group select[name*="option"]'
  - '.options_group input[name*="option"][type="radio"]'
  - '.options_group input[name*="option"][type="checkbox"]'
  - '#input-option386 input[type="radio"]'
  - '#input-option386 input[type="checkbox"]'
  - '#input-option386 select'
  
  # Fallback selectors (broader coverage)
  - 'input[name*="option"][type="radio"]'
  - 'input[name*="option"][type="checkbox"]'
  - 'select[name*="option"]'
  - 'select[name*="variation"]'
```

#### Attribute Containers
```yaml
attributes:
  # High-priority scoped selectors
  - '.options_group [class^="input-option"]'
  - '.options_group .product-attributes'
  - '.options_group .attributes'
  
  # Fallback selectors
  - '.product-attributes'
  - '.attributes'
  - '.specifications'
```

### Image Handling
```yaml
images:
  - '.gallery img'              # Product gallery images
  - '.product-images img'       # Product image container
  - '.item-images img'          # Item-specific images
  - '.product-gallery img'      # Alternative gallery
```

## Known Patterns and Behaviors

### 1. Variation Form Structure
- Variations are contained within `.options_group` elements
- Each variation type has a specific `input-option` class (e.g., `input-option386`)
- Radio buttons and select dropdowns are used for different variation types
- Form controls have `name` attributes containing "option"

### 2. Hebrew Text Handling
- Product titles and descriptions are in Hebrew
- Attribute names may be in Hebrew or English
- Currency is displayed as ₪ symbol
- RTL text direction affects layout and selector targeting

### 3. Dynamic Content Loading
- Product pages use JavaScript to load variation options
- Images may load asynchronously
- Variation forms are populated dynamically
- Requires `waitForSelector` and `waitForNetworkIdle` settings

### 4. Performance Optimizations (Phase 8)
- Selectors are prioritized by performance (scoped first, then fallbacks)
- `.options_group` scoping reduces DOM query time
- Specific element IDs (`#input-option386`) are used when available
- Fallback selectors provide broader coverage for edge cases

## Common Issues and Solutions

### Issue: Variations Not Detected
**Symptoms**: No variation data in CSV output
**Solutions**:
1. Check if `.options_group` element is present
2. Verify JavaScript execution is enabled
3. Increase `waitForSelector` timeout
4. Check for dynamic content loading

### Issue: Hebrew Text Encoding Problems
**Symptoms**: Garbled text in product data
**Solutions**:
1. Ensure proper UTF-8 encoding
2. Check `Accept-Language` headers
3. Verify RTL text handling in transforms

### Issue: Price Parsing Errors
**Symptoms**: Invalid price values in CSV
**Solutions**:
1. Check price transform rules
2. Verify currency symbol removal
3. Test with different price formats

### Issue: Image URLs Not Found
**Symptoms**: Missing or broken image links
**Solutions**:
1. Check image selector specificity
2. Verify image loading wait settings
3. Test with different image containers

## Testing and Validation

### Smoke Test Command
```bash
npm run smoke:scrape -- --url "https://shukrehut.co.il/he/כיסאות/כיסא-סמבה" --recipe "Shuk Rehut Furniture"
```

### Validation Checklist
- [ ] Product title extracted correctly
- [ ] Price parsed with proper currency handling
- [ ] Description contains Hebrew text
- [ ] Variations detected and processed
- [ ] Images URLs are valid
- [ ] CSV output follows WooCommerce format

## Recipe Configuration Details

### Behavior Settings
```yaml
behavior:
  useHeadlessBrowser: true      # Required for JavaScript execution
  rateLimit: 3000               # 3-second delay between requests
  maxConcurrent: 1              # Single concurrent request
  retryAttempts: 5              # Retry failed requests
  retryDelay: 2000              # 2-second delay between retries
  waitForSelector: 5000         # Wait for key elements
  scrollToLoad: true            # Scroll to trigger lazy loading
  waitForImages: true           # Wait for images to load
  waitForNetworkIdle: true      # Wait for network activity to settle
```

### JavaScript Settings
```yaml
javascript:
  enabled: true                 # Enable JavaScript execution
  waitForNetworkIdle: true      # Wait for network to be idle
  waitForImages: true           # Wait for images to load
  scrollToBottom: true          # Scroll to load more content
  waitForSelector: '.item, .product, article, .product-item, .chair-item, .description_pr, .options_group'
  debugMode: true               # Enable debug logging
```

### Headers for Hebrew Support
```yaml
headers:
  'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7'
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
```

## Related Documentation

- [WooCommerce CSV Import Specification](../../woocommerce_csv_spec.md)
- [Recipe Development Guide](../RECIPES.md)
- [Troubleshooting Guide](../TROUBLESHOOTING.md)
- [Quality Gates](../QUALITY_GATES.md)

## Version History

- **v1.0.0**: Initial recipe creation
- **v1.1.0**: Added Hebrew language support
- **v1.2.0**: Enhanced variation detection
- **v1.3.0**: Performance optimizations (Phase 8)
- **v1.4.0**: Tightened selectors for better performance
