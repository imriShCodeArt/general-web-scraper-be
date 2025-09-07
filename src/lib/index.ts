/**
 * Public API for the lib module
 *
 * This file exports the public API of the lib module.
 * Only exports that are intended for external use should be included here.
 */

// Core Services
export { ScrapingService } from './core/services/scraping-service';
export { RecipeManager } from './core/services/recipe-manager';
export { CsvGenerator } from './core/services/csv-generator';

// Infrastructure Services
export { StorageService } from './infrastructure/storage/storage';
export { HttpClient } from './infrastructure/http/http-client';

// Domain Types
export * from './domain/types';

// DI Container
export { rootContainer, createRequestScope, initializeServices, cleanupServices, TOKENS } from './composition-root';

// Utility Functions
export { ErrorFactory, ErrorCodes } from './utils/error-handler';
export { RecipeLoader } from './utils/recipe-loader';
