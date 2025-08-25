#!/usr/bin/env node

import app from './server';

// Export recipe system components
export { RecipeManager } from './lib/recipe-manager';
export { RecipeLoaderService } from './lib/recipe-loader';
export { GenericAdapter } from './lib/generic-adapter';
export { BaseAdapter } from './lib/base-adapter';

// Vercel serverless function handler
export default (req: any, res: any) => {
  // Only start the server if we're not on Vercel (local development)
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
  
  // For Vercel, just pass the request to the Express app
  return app(req, res);
};

console.log('Web Scraper v2 starting...');
console.log('Check http://localhost:3000/health for status');
console.log('Recipe system loaded and ready');
