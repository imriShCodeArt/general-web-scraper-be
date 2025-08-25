// Vercel entry point - redirects to the actual backend
const path = require('path');

// Import the actual backend entry point
const backendPath = path.join(__dirname, 'apps', 'backend', 'dist', 'index.js');

try {
  require(backendPath);
} catch (error) {
  console.error('Failed to load backend:', error);
  process.exit(1);
}
