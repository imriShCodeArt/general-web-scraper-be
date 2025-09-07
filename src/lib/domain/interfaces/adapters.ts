/**
 * Adapter Interfaces
 *
 * This file contains all adapter-related interfaces.
 * It defines the contracts for different types of adapters.
 */

import { RawProductData } from '../models/product';
import { RecipeConfig } from '../models/recipe';
import { ValidationError } from '../types/errors';

// Enhanced Adapter Interface with Generics
export interface SiteAdapter<T extends RawProductData = RawProductData> {
  discoverProducts(): AsyncIterable<string>;
  extractProduct(url: string): Promise<T>;
  getConfig(): RecipeConfig;
  cleanup?(): Promise<void>;
  validateProduct(product: T): ValidationError[];
}
