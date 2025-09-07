/**
 * Error Domain Types
 *
 * This file contains all error-related domain types.
 * It represents the error handling and validation error types.
 */

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
export type Result<T, E = ScrapingError> =
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = ScrapingError> = Promise<Result<T, E>>;
