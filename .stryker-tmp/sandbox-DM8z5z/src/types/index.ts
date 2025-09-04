// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { z } from 'zod';

// Enhanced Error Types
export interface ScrapingError extends Error {
  code: string;
  context?: Record<string, unknown>;
  retryable: boolean;
  timestamp: Date;
}
export interface ValidationError extends Error {
  field: string;
  value: unknown;
  expected: unknown;
}

// Enhanced Result Types with Generics
export type Result<T, E = ScrapingError> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};
export type AsyncResult<T, E = ScrapingError> = Promise<Result<T, E>>;

// Generic Raw Product Data Types
export interface BaseRawProductData {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  stockStatus?: string;
  images?: (string | undefined)[];
  category?: string;
  productType?: string;
  attributes?: Record<string, (string | undefined)[]>;
  variations?: RawVariation[];
  price?: string;
  salePrice?: string;
  metadata?: Record<string, unknown>;
}

// Specific raw product types for different data sources
export interface JsonLdProductData extends BaseRawProductData {
  '@type': 'Product';
  '@context'?: string;
  '@graph'?: JsonLdProductData[];
  image?: string | string[] | {
    src?: string;
    url?: string;
  }[];
  media?: {
    src?: string;
    preview_image?: {
      src?: string;
    };
    image?: string;
    url?: string;
  }[];
}
export interface ShopifyProductData extends BaseRawProductData {
  images?: string[];
  media?: {
    src?: string;
    preview_image?: {
      src?: string;
    };
    image?: string;
    url?: string;
  }[];
}
export interface GenericProductData extends BaseRawProductData {
  // Additional generic fields
  [key: string]: unknown;
}

// Union type for all possible raw product data sources
export type RawProductData = JsonLdProductData | ShopifyProductData | GenericProductData | BaseRawProductData;

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
  metadata?: Record<string, unknown>;
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
export interface SiteAdapter<T extends RawProductData = RawProductData> {
  discoverProducts(): AsyncIterable<string>;
  extractProduct(url: string): Promise<T>;
  getConfig(): RecipeConfig;
  cleanup?(): Promise<void>;
  validateProduct(product: T): ValidationError[];
}

// Generic constraint for product data that can be normalized
export interface NormalizableProductData extends BaseRawProductData {
  // Must have at least some basic product information
  title?: string;
  description?: string;
  sku?: string;
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
export interface ScrapingJob<T = unknown> {
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
export const ParentCsvSchema = z.object(stryMutAct_9fa48("5473") ? {} : (stryCov_9fa48("5473"), {
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
  sale_price: z.string()
}));
export const VariationCsvSchema = z.object(stryMutAct_9fa48("5474") ? {} : (stryCov_9fa48("5474"), {
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
  images: z.string()
}));

// Enhanced API Response Types with Generics
export interface ApiResponse<T = unknown, E = string> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
  timestamp: Date;
  requestId: string;
}

// Enhanced Scraping Request with Generics
export interface ScrapingRequest<T = unknown> {
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
export interface StorageEntry<T = unknown> {
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
export interface PerformanceMetrics<T = unknown> {
  totalJobs: number;
  totalProducts: number;
  averageTimePerProduct: number;
  totalProcessingTime: number;
  customMetrics?: T;
  lastUpdated: Date;
}

// Generic HTTP Response Types
export interface GenericHttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Generic JSON Data Types
export interface JsonData<T = unknown> {
  [key: string]: T;
}
export interface JsonArray<T = unknown> extends Array<T> {}

// Generic Product Options
export interface ProductOptions {
  maxProducts?: number;
  categories?: string[];
  enableEnrichment?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
  [key: string]: unknown;
}

// Generic Metadata Types
export interface GenericMetadata<T = unknown> {
  [key: string]: T;
}