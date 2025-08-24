import { z } from 'zod';

// Core Product Types
export interface NormalizedProduct {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  stockStatus: 'instock' | 'outofstock';
  images: string[];
  category: string;
  productType: 'simple' | 'variable';
  attributes: Record<string, string[]>;
  variations: ProductVariation[];
}

export interface ProductVariation {
  sku: string;
  regularPrice: string;
  taxClass: string;
  stockStatus: 'instock' | 'outofstock';
  images: string[];
  attributeAssignments: Record<string, string>;
}

export interface RawProduct {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  stockStatus?: string;
  images?: string[];
  category?: string;
  attributes?: Record<string, string[]>;
  variations?: RawVariation[];
}

export interface RawVariation {
  sku?: string;
  regularPrice?: string;
  taxClass?: string;
  stockStatus?: string;
  images?: string[];
  attributeAssignments?: Record<string, string>;
}

// Adapter Interface
export interface SiteAdapter {
  discoverProducts(): AsyncIterable<string>;
  extractProduct(url: string): Promise<RawProduct>;
}

// Recipe Configuration
export interface RecipeConfig {
  selectors: {
    title: string;
    price: string;
    images: string;
    stock: string;
    attributes: string;
    variations: string;
  };
  transforms: {
    title?: string;
    price?: string;
    attributes?: Record<string, string>;
  };
  pagination: {
    pattern: string;
    nextPage: string;
  };
}

// Job Management
export interface ScrapingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalProducts: number;
  processedProducts: number;
  errors: string[];
  metadata: {
    siteUrl: string;
    recipe: string;
    categories: string[];
  };
}

export interface JobResult {
  jobId: string;
  parentCsv: string;
  variationCsv: string;
  productCount: number;
  variationCount: number;
  filename: string;
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
  tax_class: z.string(),
  images: z.string(),
});

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ScrapingRequest {
  siteUrl: string;
  recipe: string;
  options?: {
    maxProducts?: number;
    categories?: string[];
    enableEnrichment?: boolean;
  };
}

// Storage Types
export interface StorageEntry {
  jobId: string;
  parentCsv: string;
  variationCsv: string;
  metadata: JobResult;
  createdAt: Date;
  expiresAt: Date;
}
