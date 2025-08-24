export interface ScraperConfig {
  // Website-specific settings
  website: {
    name: string;
    domain: string;
    type: 'shopify' | 'woocommerce' | 'magento' | 'bigcommerce' | 'generic' | 'custom';
    customSelectors?: string[];
    excludedSelectors?: string[];
    productUrlPatterns?: string[];
    collectionUrlPatterns?: string[];
  };
  
  // Extraction strategy preferences
  extraction: {
    preferContainers: boolean;
    preferPatterns: boolean;
    maxProductsPerPage: number;
    deduplicate: boolean;
    validateUrls: boolean;
    followPagination: boolean;
  };
  
  // Content filtering
  filtering: {
    excludeOutOfStock: boolean;
    excludeVariations: boolean;
    minPrice?: number;
    maxPrice?: number;
    requiredFields: string[];
    excludedCategories?: string[];
  };
  
  // Performance settings
  performance: {
    batchSize: number;
    delayBetweenRequests: number;
    timeout: number;
    retryAttempts: number;
    concurrentRequests: number;
  };
  
  // Advanced options
  advanced: {
    customValidationRules?: Array<{
      field: string;
      rule: string;
      value: any;
    }>;
    postProcessing?: Array<{
      name: string;
      enabled: boolean;
      config: any;
    }>;
    debugging: {
      logLevel: 'none' | 'basic' | 'detailed' | 'verbose';
      saveRawHtml: boolean;
      saveExtractionLogs: boolean;
    };
  };
}

export interface WebsiteProfile {
  domain: string;
  config: Partial<ScraperConfig>;
}

// Default configuration for universal scraping
export const DEFAULT_SCRAPER_CONFIG: ScraperConfig = {
  website: {
    name: 'Universal',
    domain: '*',
    type: 'generic',
    customSelectors: [],
    excludedSelectors: [
      'nav', 'header', 'footer', '.sidebar', '.navigation',
      '.breadcrumb', '.pagination', '.filters', '.search'
    ],
    productUrlPatterns: [
      '/products/', '/product/', '/shop/', '/item/', '/goods/'
    ],
    collectionUrlPatterns: [
      '/collections/', '/category/', '/catalog/', '/department/'
    ]
  },
  
  extraction: {
    preferContainers: true,
    preferPatterns: false,
    maxProductsPerPage: 100,
    deduplicate: true,
    validateUrls: true,
    followPagination: true
  },
  
  filtering: {
    excludeOutOfStock: false,
    excludeVariations: false,
    minPrice: undefined,
    maxPrice: undefined,
    requiredFields: ['title', 'url'],
    excludedCategories: []
  },
  
  performance: {
    batchSize: 5,
    delayBetweenRequests: 500,
    timeout: 30000,
    retryAttempts: 3,
    concurrentRequests: 2
  },
  
  advanced: {
    customValidationRules: [],
    postProcessing: [
      {
        name: 'deduplication',
        enabled: true,
        config: { method: 'url-based' }
      },
      {
        name: 'url-normalization',
        enabled: true,
        config: { removeQueryParams: true, removeFragments: true }
      }
    ],
    debugging: {
      logLevel: 'basic',
      saveRawHtml: false,
      saveExtractionLogs: false
    }
  }
};

// Pre-configured profiles for common e-commerce platforms
export const WEBSITE_PROFILES: WebsiteProfile[] = [
  {
    domain: 'shopify.com',
    config: {
      website: {
        name: 'Shopify Store',
        domain: 'shopify.com',
        type: 'shopify',
        customSelectors: [
          '.product-card a[href*="/products/"]',
          '.product-item a[href*="/products/"]',
          '.collection-grid a[href*="/products/"]'
        ],
        productUrlPatterns: ['/products/'],
        collectionUrlPatterns: ['/collections/']
      },
      extraction: {
        preferContainers: true,
        preferPatterns: false,
        maxProductsPerPage: 50,
        deduplicate: true,
        validateUrls: true,
        followPagination: true
      }
    }
  },
  
  {
    domain: 'woocommerce.com',
    config: {
      website: {
        name: 'WooCommerce Store',
        domain: 'woocommerce.com',
        type: 'woocommerce',
        customSelectors: [
          '.woocommerce ul.products li.product a',
          '.products li.product a',
          '.product a[href*="/product/"]'
        ],
        productUrlPatterns: ['/product/'],
        collectionUrlPatterns: ['/product-category/', '/shop/']
      },
      extraction: {
        preferContainers: true,
        preferPatterns: false,
        maxProductsPerPage: 50,
        deduplicate: true,
        validateUrls: true,
        followPagination: true
      }
    }
  },
  
  {
    domain: 'magento.com',
    config: {
      website: {
        name: 'Magento Store',
        domain: 'magento.com',
        type: 'magento',
        customSelectors: [
          '.product-item a[href*="/product/"]',
          '.products-grid .product-item a',
          '.catalog-product-view a[href*="/product/"]'
        ],
        productUrlPatterns: ['/product/'],
        collectionUrlPatterns: ['/catalog/category/', '/catalog/']
      }
    }
  },
  
  {
    domain: 'bigcommerce.com',
    config: {
      website: {
        name: 'BigCommerce Store',
        domain: 'bigcommerce.com',
        type: 'bigcommerce',
        customSelectors: [
          '.product a[href*="/products/"]',
          '.product-item a[href*="/products/"]',
          '.product-grid a[href*="/products/"]'
        ],
        productUrlPatterns: ['/products/'],
        collectionUrlPatterns: ['/category/', '/brands/']
      }
    }
  }
];

// Configuration manager class
export class ScraperConfigManager {
  private static instance: ScraperConfigManager;
  private customProfiles: Map<string, ScraperConfig> = new Map();
  
  private constructor() {
    // Initialize with default profiles
    WEBSITE_PROFILES.forEach(profile => {
      this.customProfiles.set(profile.domain, this.mergeConfigs(DEFAULT_SCRAPER_CONFIG, profile.config));
    });
  }
  
  static getInstance(): ScraperConfigManager {
    if (!ScraperConfigManager.instance) {
      ScraperConfigManager.instance = new ScraperConfigManager();
    }
    return ScraperConfigManager.instance;
  }
  
  /**
   * Get configuration for a specific website
   */
  getConfigForWebsite(url: string): ScraperConfig {
    try {
      const domain = new URL(url).hostname;
      
      // Check for exact domain match
      if (this.customProfiles.has(domain)) {
        return this.customProfiles.get(domain)!;
      }
      
      // Check for partial domain match
      let foundConfig: ScraperConfig | null = null;
      this.customProfiles.forEach((config, profileDomain) => {
        if (!foundConfig && (domain.includes(profileDomain) || profileDomain.includes(domain))) {
          foundConfig = config;
        }
      });
      if (foundConfig) {
        return foundConfig;
      }
      
      // Return default config
      return { ...DEFAULT_SCRAPER_CONFIG };
    } catch {
      return { ...DEFAULT_SCRAPER_CONFIG };
    }
  }
  
  /**
   * Add or update a custom website profile
   */
  addCustomProfile(domain: string, config: Partial<ScraperConfig>): void {
    const fullConfig = this.mergeConfigs(DEFAULT_SCRAPER_CONFIG, config);
    this.customProfiles.set(domain, fullConfig);
  }
  
  /**
   * Remove a custom profile
   */
  removeCustomProfile(domain: string): boolean {
    return this.customProfiles.delete(domain);
  }
  
  /**
   * Get all available profiles
   */
  getAllProfiles(): Map<string, ScraperConfig> {
    return new Map(this.customProfiles);
  }
  
  /**
   * Merge configurations (deep merge)
   */
  private mergeConfigs(defaultConfig: ScraperConfig, customConfig: Partial<ScraperConfig>): ScraperConfig {
    const merged = { ...defaultConfig };
    
    // Deep merge website config
    if (customConfig.website) {
      merged.website = { ...merged.website, ...customConfig.website };
    }
    
    // Deep merge extraction config
    if (customConfig.extraction) {
      merged.extraction = { ...merged.extraction, ...customConfig.extraction };
    }
    
    // Deep merge filtering config
    if (customConfig.filtering) {
      merged.filtering = { ...merged.filtering, ...customConfig.filtering };
    }
    
    // Deep merge performance config
    if (customConfig.performance) {
      merged.performance = { ...merged.performance, ...customConfig.performance };
    }
    
    // Deep merge advanced config
    if (customConfig.advanced) {
      merged.advanced = { ...merged.advanced, ...customConfig.advanced };
    }
    
    return merged;
  }
  
  /**
   * Validate configuration
   */
  validateConfig(config: ScraperConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.website.domain) {
      errors.push('Website domain is required');
    }
    
    if (config.performance.batchSize < 1) {
      errors.push('Batch size must be at least 1');
    }
    
    if (config.performance.delayBetweenRequests < 0) {
      errors.push('Delay between requests cannot be negative');
    }
    
    if (config.performance.timeout < 1000) {
      errors.push('Timeout must be at least 1000ms');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Export configuration to JSON
   */
  exportConfig(domain: string): string | null {
    const config = this.customProfiles.get(domain);
    if (!config) return null;
    
    return JSON.stringify(config, null, 2);
  }
  
  /**
   * Import configuration from JSON
   */
  importConfig(domain: string, jsonConfig: string): boolean {
    try {
      const config = JSON.parse(jsonConfig) as Partial<ScraperConfig>;
      const validation = this.validateConfig(this.mergeConfigs(DEFAULT_SCRAPER_CONFIG, config));
      
      if (validation.isValid) {
        this.addCustomProfile(domain, config);
        return true;
      } else {
        console.error('Invalid configuration:', validation.errors);
        return false;
      }
    } catch (error) {
      console.error('Failed to parse configuration:', error);
      return false;
    }
  }
}

// Export singleton instance
export const configManager = ScraperConfigManager.getInstance();
