#!/usr/bin/env node

import './server';

// Export recipe system components
export { RecipeManager } from './lib/recipe-manager';
export { RecipeLoaderService } from './lib/recipe-loader';
export { GenericAdapter } from './lib/generic-adapter';
export { BaseAdapter } from './lib/base-adapter';

console.log('Web Scraper v2 starting...');
console.log('Check http://localhost:3000/health for status');
console.log('Recipe system loaded and ready');
