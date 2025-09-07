/**
 * Product Domain Models
 *
 * This file contains all product-related domain models and types.
 * It represents the core business entities for product data.
 */

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
  image?: string | string[] | { src?: string; url?: string }[];
  media?: { src?: string; preview_image?: { src?: string }; image?: string; url?: string }[];
}

export interface ShopifyProductData extends BaseRawProductData {
  images?: string[];
  media?: { src?: string; preview_image?: { src?: string }; image?: string; url?: string }[];
}

export interface GenericProductData extends BaseRawProductData {
  // Additional generic fields
  [key: string]: unknown;
}

// Union type for all possible raw product data sources
export type RawProductData = JsonLdProductData | ShopifyProductData | GenericProductData | BaseRawProductData;

// Generic constraint for product data that can be normalized
export interface NormalizableProductData extends BaseRawProductData {
  // Must have at least some basic product information
  title?: string;
  description?: string;
  sku?: string;
}

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

// Generic Product Options
export interface ProductOptions {
  maxProducts?: number;
  categories?: string[];
  enableEnrichment?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
  [key: string]: unknown;
}

