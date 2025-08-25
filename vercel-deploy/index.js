// Vercel deployment entry point
const path = require('path');

// Import the actual backend from the monorepo structure
const backendPath = path.join(__dirname, '..', 'apps', 'backend', 'dist', 'index.js');

try {
  console.log('🚀 Starting Web Scraper Backend...');
  console.log(`📁 Backend path: ${backendPath}`);
  
  // Check if backend exists
  const fs = require('fs');
  if (!fs.existsSync(backendPath)) {
    throw new Error(`Backend not found at: ${backendPath}`);
  }
  
  // Load the backend
  require(backendPath);
  console.log('✅ Backend loaded successfully');
} catch (error) {
  console.error('❌ Failed to load backend:', error);
  console.error('📁 Current directory:', __dirname);
  console.error('📁 Backend path:', backendPath);
  
  // Try to list directory contents for debugging
  try {
    const fs = require('fs');
    const parentDir = path.join(__dirname, '..');
    console.log('📁 Parent directory contents:', fs.readdirSync(parentDir));
    
    if (fs.existsSync(path.join(parentDir, 'apps'))) {
      console.log('📁 Apps directory contents:', fs.readdirSync(path.join(parentDir, 'apps')));
    }
  } catch (listError) {
    console.error('❌ Could not list directory contents:', listError);
  }
  
  process.exit(1);
}
