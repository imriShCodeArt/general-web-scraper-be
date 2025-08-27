import { z } from 'zod';

// Enhanced Error Types
export interface ScrapingError extends Error {
  code: string;
  context?: Record<string, any>;
  retryable: boolean;
  timestamp: Date;
}

export interface ValidationError extends Error {
  field: string;
  value: any;
  expected: any;
}

// Enhanced Result Types with Generics
export type Result<T, E = ScrapingError> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = ScrapingError> = Promise<Result<T, E>>;

// Enhanced Product Types with Generics
export interface BaseProduct<T = string> {
  id: T;
  title: T;
  slug: T;
  description: T;
  shortDescription: T;
  sku: T;
  stockStatus: T;
  images: T[];
  category: T;
  productType: T;
  attributes: Record<string, T[]>;
  variations: ProductVariation[];
  regularPrice?: T;
  salePrice?: T;
  metadata?: Record<string, any>;
}

export interface NormalizedProduct extends BaseProduct<string> {
  // Additional normalized fields
  normalizedAt: Date;
  sourceUrl: string;
  confidence: number; // 0-1 confidence score
}

// Override the variations field to use RawVariation instead of ProductVariation
export interface RawProduct extends Omit<BaseProduct<string | undefined>, 'variations'> {
  variations: RawVariation[];
  price?: string;
  salePrice?: string;
}

export interface ProductVariation {
  sku: string;
  regularPrice: string;
  salePrice?: string;
  taxClass: string;
  stockStatus: 'instock' | 'outofstock';
  images: string[];
  attributeAssignments: Record<string, string>;
}

export interface RawVariation {
  sku?: string;
  regularPrice?: string;
  salePrice?: string;
  taxClass?: string;
  stockStatus?: string;
  images?: string[];
  attributeAssignments?: Record<string, string>;
}

// Enhanced Adapter Interface with Generics
export interface SiteAdapter<T = RawProduct> {
  discoverProducts(): AsyncIterable<string>;
  extractProduct(url: string): Promise<T>;
  getConfig(): RecipeConfig;
  cleanup?(): Promise<void>;
  validateProduct(product: T): ValidationError[];
}

// Enhanced Recipe Configuration with Validation
export interface RecipeConfig {
  // Basic site information
  name: string;
  description?: string;
  version: string;
  siteUrl: string;
  
  // Selectors for data extraction
  selectors: {
    // Core product fields
    title: string | string[];
    price: string | string[];
    images: string | string[];
    stock: string | string[];
    sku: string | string[];
    description: string | string[];
    descriptionFallbacks?: string[];
    shortDescription?: string | string[];
    category?: string | string[];
    
    // Product discovery
    productLinks: string | string[];
    pagination?: {
      nextPage: string;
      maxPages?: number;
    };
    
    // Attributes and variations
    attributes: string | string[];
    variations?: string | string[];
    
    // Embedded data sources
    embeddedJson?: string[];
    apiEndpoints?: string[];
  };
  
  // Text transformations and cleaning
  transforms?: {
    title?: string[];
    price?: string[];
    description?: string[];
    attributes?: Record<string, string[]>;
    category?: string[];
  };
  
  // Site-specific behavior
  behavior?: {
    waitForSelectors?: string[];
    scrollToLoad?: boolean;
    useHeadlessBrowser?: boolean;
    rateLimit?: number; // ms between requests
    maxConcurrent?: number;
    retryAttempts?: number;
    retryDelay?: number;
    timeout?: number;
    // Performance optimizations
    fastMode?: boolean; // Enable fast mode for better performance
    skipImages?: boolean; // Skip image processing for speed
    skipStyles?: boolean; // Skip CSS processing for speed
    skipScripts?: boolean; // Skip JavaScript processing for speed
  };
  
  // Fallback strategies
  fallbacks?: {
    title?: string[];
    price?: string[];
    images?: string[];
    stock?: string[];
    sku?: string[];
    description?: string[];
    shortDescription?: string[];
    category?: string[];
  };
  
  // Validation rules
  validation?: {
    requiredFields?: string[];
    priceFormat?: string; // regex pattern
    skuFormat?: string; // regex pattern
    minDescriptionLength?: number;
    maxTitleLength?: number;
  };
}

// Recipe file structure
export interface RecipeFile {
  recipes: RecipeConfig[];
  globalSettings?: {
    defaultRateLimit?: number;
    defaultMaxConcurrent?: number;
    userAgents?: string[];
  };
}

// Recipe loading and management
export interface RecipeLoader {
  loadRecipe(recipeName: string): Promise<RecipeConfig>;
  loadRecipeFromFile(filePath: string): Promise<RecipeConfig>;
  loadRecipeFromUrl(url: string): Promise<RecipeConfig>;
  listAvailableRecipes(): Promise<string[]>;
  validateRecipe(recipe: RecipeConfig): boolean;
}

// Enhanced Job Management with Generics
export interface ScrapingJob<T = any> {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalProducts: number;
  processedProducts: number;
  errors: ScrapingError[];
  metadata: {
    siteUrl: string;
    recipe: string;
    categories: string[];
    options?: T;
  };
  progress?: {
    currentStep: string;
    stepProgress: number;
    estimatedTimeRemaining?: number;
  };
}

export interface JobResult {
  jobId: string;
  parentCsv: string;
  variationCsv: string;
  productCount: number;
  variationCount: number;
  filename: string;
  metadata?: {
    siteUrl: string;
    recipe: string;
    categories: string[];
  };
  createdAt?: Date;
  expiresAt?: Date;
}

// CSV Schemas
export const ParentCsvSchema = z.object({
  ID: z.string(),
  post_title: z.string(),
  post_name: z.string(),
  post_status: z.string(),
  post_content: z.string(),
  post_excerpt: z.string(),
  post_parent: z.string(),
  menu_order: z.string(),
  post_type: z.string(),
  sku: z.string(),
  stock_status: z.string(),
  images: z.string(),
  'tax:product_type': z.string(),
  'tax:product_cat': z.string(),
  description: z.string(),
  regular_price: z.string(),
  sale_price: z.string(),
});

export const VariationCsvSchema = z.object({
  ID: z.string(),
  post_type: z.string(),
  post_status: z.string(),
  parent_sku: z.string(),
  post_title: z.string(),
  post_name: z.string(),
  post_content: z.string(),
  post_excerpt: z.string(),
  menu_order: z.string(),
  sku: z.string(),
  stock_status: z.string(),
  regular_price: z.string(),
  sale_price: z.string(),
  tax_class: z.string(),
  images: z.string(),
});

// Enhanced API Response Types with Generics
export interface ApiResponse<T = any, E = string> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
  timestamp: Date;
  requestId: string;
}

// Enhanced Scraping Request with Generics
export interface ScrapingRequest<T = any> {
  siteUrl: string;
  recipe: string;
  options?: T & {
    maxProducts?: number;
    categories?: string[];
    enableEnrichment?: boolean;
    retryOnFailure?: boolean;
    maxRetries?: number;
  };
}

// Dependency Injection Container Interface
export interface DIContainer {
  register<T>(token: string, implementation: T): void;
  resolve<T>(token: string): T;
  has(token: string): boolean;
  clear(): void;
}

// Service Interface for DI
export interface Service {
  readonly name: string;
  initialize?(): Promise<void>;
  destroy?(): Promise<void>;
}

// Enhanced Storage Types with Generics
export interface StorageEntry<T = any> {
  jobId: string;
  parentCsv: string;
  variationCsv: string;
  metadata: JobResult;
  createdAt: Date;
  expiresAt: Date;
  tags?: string[];
  customData?: T;
}

// Retry Configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

// Rate Limiting Configuration
export interface RateLimitConfig {
  requestsPerSecond: number;
  burstSize: number;
  windowMs: number;
}

// Performance Metrics with Generics
export interface PerformanceMetrics<T = any> {
  totalJobs: number;
  totalProducts: number;
  averageTimePerProduct: number;
  totalProcessingTime: number;
  customMetrics?: T;
  lastUpdated: Date;
}
