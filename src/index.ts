#!/usr/bin/env node

import app from './server';
import { rootContainer } from './lib/composition-root';

// Export main application components
export { ScrapingService } from './lib/scraping-service';
export { RecipeManager } from './lib/recipe-manager';
export { RecipeLoader } from './lib/recipe-loader';
export { StorageService } from './lib/storage';
export { CsvGenerator } from './lib/csv-generator';
export { HttpClient } from './lib/http-client';
export { EnhancedBaseAdapter } from './lib/enhanced-base-adapter';
export { BaseAdapter } from './lib/base-adapter';
export { GenericAdapter } from './lib/generic-adapter';

// Export DI container and composition root
export { rootContainer, createRequestScope, initializeServices, cleanupServices } from './lib/composition-root';
export { Container } from './lib/di/container';
export { TOKENS } from './lib/di/tokens';

// Export types
export * from './types';

// Export error handling
export { ErrorFactory, ErrorCodes } from './lib/error-handler';

// Export utilities
export { NormalizationToolkit } from './lib/normalization';

// Vercel serverless function handler
export default (req: unknown, res: unknown) => {
  // For Vercel, just pass the request to the Express app
  return (app as unknown as (req: unknown, res: unknown) => unknown)(req, res);
};

// Start the server immediately for local development
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📡 Health check: http://localhost:${port}/health`);
    console.log(`🌐 API base: http://localhost:${port}/`);
  });
}

console.log('Web Scraper v2 starting...');
console.log('Recipe system loaded and ready');

// graceful shutdown to dispose container singletons
const shutdown = async () => {
  try {
    await rootContainer.dispose();
  } catch {
    // ignore
  }
};
process.on('beforeExit', shutdown);
process.on('exit', shutdown);
