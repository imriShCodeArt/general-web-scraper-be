#!/usr/bin/env node

import app from './server';
import { rootContainer } from './lib/composition-root';
import { Container } from './lib/di/container';

// Export recipe system components
export { RecipeManager } from './lib/recipe-manager';
export { RecipeLoaderService } from './lib/recipe-loader';
export { GenericAdapter } from './lib/generic-adapter';
export { BaseAdapter } from './lib/base-adapter';

// Vercel serverless function handler
export default (req: unknown, res: unknown) => {
  // For Vercel, just pass the request to the Express app
  return (app as any)(req as any, res as any);
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
