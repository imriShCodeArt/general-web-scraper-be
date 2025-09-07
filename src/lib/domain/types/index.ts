/**
 * Domain Types Index
 *
 * This file exports all domain types for easy importing.
 */

// Re-export all domain types
export * from '../models/product';
export * from '../models/recipe';
export * from '../models/job';
export * from '../interfaces/adapters';
export * from '../interfaces/services';
export * from './errors';

// Re-export ValidationError from errors only (avoid duplicate from product)
export { ValidationError } from './errors';

// Additional utility types
export interface JsonData<T = unknown> {
  [key: string]: T;
}

export interface JsonArray<T = unknown> extends Array<T> {}
