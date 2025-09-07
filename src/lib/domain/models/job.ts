/**
 * Job Domain Models
 *
 * This file contains all job-related domain models and types.
 * It represents the scraping job lifecycle and management.
 */

import { ScrapingError } from '../types/errors';

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

// Enhanced API Response Types with Generics
export interface ApiResponse<T = unknown, E = string> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
  timestamp: Date;
  requestId: string;
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

// Generic Metadata Types
export interface GenericMetadata<T = unknown> {
  [key: string]: T;
}
