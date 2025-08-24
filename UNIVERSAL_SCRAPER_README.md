# 🌐 Universal Web Scraper

## Overview

The Universal Web Scraper is an intelligent, adaptive scraping system that can automatically detect and extract product information from any e-commerce website. Unlike traditional scrapers that require specific configurations for each site, this system uses machine learning-inspired pattern recognition to adapt to different website structures.

## ✨ Key Features

### 🧠 **Intelligent Pattern Recognition**
- **Automatic Site Type Detection**: Identifies Shopify, WooCommerce, Magento, BigCommerce, and generic e-commerce sites
- **Context-Aware Extraction**: Analyzes page structure to find the most likely product containers
- **Smart Deduplication**: Automatically removes duplicate products using multiple strategies

### 🔧 **Adaptive Extraction Strategies**
1. **Smart Container Analysis**: Finds product containers based on CSS classes and structure
2. **Platform-Specific Patterns**: Uses optimized selectors for detected e-commerce platforms
3. **Comprehensive Fallback**: Deep analysis of all links with scoring system

### 🎯 **Universal Compatibility**
- **No Manual Configuration Required**: Works out-of-the-box with any website
- **Automatic URL Validation**: Ensures extracted URLs are valid and relevant
- **Cross-Platform Support**: Handles different URL structures and patterns

## 🚀 How It Works

### 1. **Page Structure Analysis**
The scraper analyzes the HTML structure to understand how products are organized:

```typescript
// Analyzes potential product containers
const containerCandidates = [
  '.productgrid', '.collection-grid', '.product-grid',
  '.products', '.product-list', '.shop-products'
  // ... and many more
];
```

### 2. **Intelligent Container Scoring**
Each potential container is scored based on:
- Number of product links found
- Container class names and attributes
- Presence of product-related data attributes
- Penalties for navigation-like containers

### 3. **Context-Aware Link Filtering**
Links are filtered using multiple criteria:
- **URL Pattern Matching**: Must contain product indicators (`/products/`, `/product/`, `/shop/`)
- **Context Validation**: Must be within product containers
- **Exclusion Rules**: Filters out collection, category, and navigation links

### 4. **Platform-Specific Optimization**
Once a platform is detected, the scraper uses optimized extraction patterns:

```typescript
// Shopify detection
if (href.includes('/products/') && !href.includes('/collections/')) {
  // Use Shopify-optimized selectors
}

// WooCommerce detection  
if (href.includes('/product/') && !href.includes('/category/')) {
  // Use WooCommerce-optimized selectors
}
```

## 📊 Extraction Strategies

### **Strategy 1: Smart Container Extraction**
- Analyzes page structure to find product containers
- Scores containers based on likelihood of containing products
- Uses the highest-scoring container for extraction

### **Strategy 2: Intelligent Pattern Matching**
- Detects e-commerce platform type
- Applies platform-specific extraction patterns
- Validates links using context-aware rules

### **Strategy 3: Comprehensive Analysis**
- Fallback strategy for difficult sites
- Scores all links based on multiple criteria
- Takes top-scoring candidates as products

## 🛠️ Configuration System

### **Default Configuration**
The scraper comes with sensible defaults that work for most websites:

```typescript
const DEFAULT_CONFIG = {
  extraction: {
    preferContainers: true,
    deduplicate: true,
    validateUrls: true
  },
  performance: {
    batchSize: 5,
    delayBetweenRequests: 500,
    timeout: 30000
  }
};
```

### **Custom Website Profiles**
You can create custom profiles for specific websites:

```typescript
// Add custom profile
configManager.addCustomProfile('example.com', {
  website: {
    type: 'custom',
    customSelectors: ['.my-product a', '.item-link']
  },
  extraction: {
    preferPatterns: true
  }
});
```

### **Pre-configured Profiles**
Built-in profiles for popular platforms:
- **Shopify**: Optimized for `.collection-grid` and `/products/` URLs
- **WooCommerce**: Optimized for `.woocommerce ul.products` and `/product/` URLs
- **Magento**: Optimized for `.product-item` and catalog structures
- **BigCommerce**: Optimized for `.product` and `/products/` URLs

## 📝 Usage Examples

### **Basic Usage**
```typescript
import { ArchiveScraper } from './src/lib/archive-scraper';

// Extract products from any collection page
const productUrls = ArchiveScraper.extractProductUrls(html, 'https://example.com/collections');
```

### **With Custom Configuration**
```typescript
import { configManager } from './src/lib/scraper-config';

// Configure for specific website
configManager.addCustomProfile('mysite.com', {
  website: {
    customSelectors: ['.my-product-card a'],
    excludedSelectors: ['.advertisement', '.sidebar']
  }
});

// Use the scraper
const products = ArchiveScraper.extractProductUrls(html, 'https://mysite.com/shop');
```

### **Advanced Configuration**
```typescript
const advancedConfig = {
  filtering: {
    excludeOutOfStock: true,
    minPrice: 10,
    requiredFields: ['title', 'price', 'image']
  },
  performance: {
    concurrentRequests: 5,
    retryAttempts: 5
  },
  advanced: {
    debugging: {
      logLevel: 'detailed',
      saveRawHtml: true
    }
  }
};

configManager.addCustomProfile('complexsite.com', advancedConfig);
```

## 🔍 Troubleshooting

### **Common Issues**

#### **Too Many Products Found**
- The scraper might be picking up navigation or duplicate links
- Check if the site has multiple product grids
- Use custom selectors to narrow down extraction

#### **Too Few Products Found**
- The site might use non-standard HTML structure
- Check if products are loaded dynamically (JavaScript)
- Try enabling comprehensive analysis mode

#### **Wrong Products Extracted**
- The scraper might be picking up related products or recommendations
- Use custom selectors to target specific product containers
- Add exclusion rules for unwanted sections

### **Debugging Tips**

1. **Enable Detailed Logging**:
   ```typescript
   advanced: {
     debugging: {
       logLevel: 'detailed',
       saveExtractionLogs: true
     }
   }
   ```

2. **Check Container Detection**:
   - Look for console logs showing which containers were found
   - Verify container scores and selection

3. **Validate URL Patterns**:
   - Check if the site uses standard product URL patterns
   - Verify that collection/category links are properly excluded

## 🎯 Best Practices

### **For Website Owners**
- Use semantic HTML with clear product container classes
- Avoid mixing product links with navigation links
- Use consistent URL patterns for products

### **For Developers**
- Start with default configuration
- Add custom profiles only when necessary
- Test with multiple pages from the same site
- Monitor extraction accuracy and adjust as needed

### **Performance Optimization**
- Use appropriate batch sizes for your target sites
- Set reasonable delays between requests
- Enable concurrent processing for large sites
- Use pagination support for better performance

## 🔮 Future Enhancements

### **Planned Features**
- **Machine Learning Integration**: Learn from successful extractions
- **Dynamic Selector Generation**: Automatically generate selectors for new sites
- **Visual Pattern Recognition**: Analyze page layout and visual structure
- **Multi-Language Support**: Handle international e-commerce sites

### **Extensibility**
- **Plugin System**: Allow custom extraction modules
- **API Integration**: Connect with external data sources
- **Real-time Updates**: Monitor sites for changes and adapt automatically

## 📚 API Reference

### **ArchiveScraper Class**

#### **Methods**
- `extractProductUrls(html: string, baseUrl: string): string[]`
- `extractProducts(html: string, baseUrl: string): string[]` (legacy)

#### **Private Methods**
- `extractFromSmartContainers()`
- `extractByIntelligentPatterns()`
- `extractByComprehensiveAnalysis()`
- `detectSiteType()`
- `calculateContainerScore()`

### **ScraperConfigManager Class**

#### **Methods**
- `getConfigForWebsite(url: string): ScraperConfig`
- `addCustomProfile(domain: string, config: Partial<ScraperConfig>): void`
- `removeCustomProfile(domain: string): boolean`
- `exportConfig(domain: string): string | null`
- `importConfig(domain: string, jsonConfig: string): boolean`

## 🤝 Contributing

### **Adding New Platform Support**
1. Identify common patterns for the platform
2. Add platform detection logic
3. Create optimized selectors
4. Add to `WEBSITE_PROFILES`
5. Test with multiple sites

### **Improving Extraction Logic**
1. Analyze failed extractions
2. Identify common patterns
3. Add new container candidates
4. Improve scoring algorithms
5. Update validation rules

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section
- Test with the provided examples

---

**The Universal Web Scraper**: Making web scraping accessible to everyone, one website at a time! 🚀
