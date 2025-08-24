# Recipe System for Web Scraper

This directory contains recipe configurations for the web scraper. Recipes define how to extract data from different websites using CSS selectors, transformations, and behavior settings.

## What is a Recipe?

A recipe is a YAML or JSON configuration file that tells the scraper:
- Which CSS selectors to use for extracting data
- How to transform and clean the extracted data
- Site-specific behavior settings
- Fallback strategies for when primary selectors fail

## Recipe File Structure

### Basic Recipe
```yaml
name: "Site Name"
description: "Description of the site"
version: "1.0.0"
siteUrl: "https://example.com"

selectors:
  title: ".product-title"
  price: ".price"
  images: ".product-gallery img"
  # ... more selectors

transforms:
  title:
    - "trim: "
    - "replace:^\s+|\s+$"
  
behavior:
  rateLimit: 1000
  maxConcurrent: 3
```

### Recipe Collection
```yaml
globalSettings:
  defaultRateLimit: 1000
  defaultMaxConcurrent: 3

recipes:
  - name: "Recipe 1"
    # ... recipe configuration
  - name: "Recipe 2"
    # ... recipe configuration
```

## Available Selectors

### Core Product Fields
- `title`: Product title/name
- `price`: Product price
- `sku`: Product SKU/code
- `description`: Product description
- `shortDescription`: Short product description
- `images`: Product images
- `stock`: Stock status
- `category`: Product category

### Discovery & Navigation
- `productLinks`: Links to product pages
- `pagination`: Pagination configuration
  - `nextPage`: Selector for next page link
  - `maxPages`: Maximum pages to crawl

### Product Variations
- `attributes`: Product attributes (color, size, etc.)
- `variations`: Product variation selectors

### Embedded Data
- `embeddedJson`: Script tags containing JSON data
- `apiEndpoints`: API endpoints for data

## Transformations

Transformations clean and format extracted data:

### Text Transformations
- `trim: chars` - Remove characters from start/end
- `replace:pattern|replacement` - Regex replacement
- `->` - Simple text replacement (old->new)

### Attribute Transformations
```yaml
transforms:
  attributes:
    Color:
      - "replace:^\s+|\s+$"
      - "replace:בחר צבע|"
    Size:
      - "trim: -"
```

## Behavior Settings

- `waitForSelectors`: Selectors to wait for before extraction
- `scrollToLoad`: Whether to scroll to load lazy content
- `useHeadlessBrowser`: Use headless browser for JavaScript-heavy sites
- `rateLimit`: Delay between requests (milliseconds)
- `maxConcurrent`: Maximum concurrent requests

## Fallback Strategies

Provide multiple selectors for robust extraction:
```yaml
selectors:
  title: 
    - ".product-title"
    - ".title"
    - "h1"

fallbacks:
  title:
    - ".fallback-title"
    - ".alt-title"
```

## Validation Rules

- `requiredFields`: Fields that must be present
- `priceFormat`: Regex pattern for price validation
- `skuFormat`: Regex pattern for SKU validation

## Creating a New Recipe

1. **Analyze the target site**:
   - Inspect HTML structure
   - Identify CSS selectors for data
   - Note any JavaScript dependencies

2. **Create recipe file**:
   - Use `.yaml` or `.json` extension
   - Place in `recipes/` directory
   - Follow the structure above

3. **Test the recipe**:
   - Use the recipe validation API
   - Test with a small number of products
   - Adjust selectors as needed

## Example Recipes

- `generic-ecommerce.yaml` - Generic e-commerce sites
- `hebrew-ecommerce.yaml` - Hebrew/RTL e-commerce sites
- `recipe-collection.yaml` - Multiple recipes in one file

## API Usage

### List all recipes
```bash
GET /api/recipes?action=list
```

### Get recipe by name
```bash
GET /api/recipes?action=get&recipe=Generic%20E-commerce
```

### Get recipe by site URL
```bash
GET /api/recipes?action=getBySite&siteUrl=https://example.com
```

### Validate recipe
```bash
POST /api/recipes
{
  "action": "validate",
  "recipeData": { ... }
}
```

### Load recipe from file
```bash
POST /api/recipes
{
  "action": "loadFromFile",
  "filePath": "./recipes/my-recipe.yaml",
  "siteUrl": "https://example.com"
}
```

## Best Practices

1. **Use multiple selectors** for important fields
2. **Include fallbacks** for robust extraction
3. **Set appropriate rate limits** to be respectful
4. **Test thoroughly** before production use
5. **Document site-specific quirks** in comments
6. **Use transformations** to clean messy data
7. **Validate required fields** are present

## Troubleshooting

### Common Issues
- **No data extracted**: Check selector syntax and page structure
- **Partial data**: Verify all required selectors are present
- **Rate limiting**: Increase delays between requests
- **JavaScript content**: Enable `useHeadlessBrowser: true`

### Debugging
- Use browser dev tools to verify selectors
- Check recipe validation results
- Monitor scraping logs for errors
- Test selectors on sample pages

## Contributing

When adding new recipes:
1. Follow the existing structure
2. Include comprehensive selectors
3. Add appropriate fallbacks
4. Test with real sites
5. Document any special requirements
6. Update this README if needed
