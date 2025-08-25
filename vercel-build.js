#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Building Web Scraper Backend for Vercel...\n');

// Ensure we're in the right directory
const projectRoot = path.resolve(__dirname);
console.log(`📁 Project root: ${projectRoot}`);

// Check if backend directory exists
const backendPath = path.join(projectRoot, 'apps', 'backend');
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend directory not found at apps/backend');
  process.exit(1);
}

// Install dependencies for backend
console.log('📦 Installing backend dependencies...');
try {
  execSync('npm install', {
    cwd: backendPath,
    stdio: 'inherit'
  });
  console.log('✅ Backend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Build the backend
console.log('🔨 Building backend...');
try {
  execSync('npm run build', {
    cwd: backendPath,
    stdio: 'inherit'
  });
  console.log('✅ Backend built successfully\n');
} catch (error) {
  console.error('❌ Failed to build backend');
  process.exit(1);
}

// Verify build output
const distPath = path.join(backendPath, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Build output directory not found');
  process.exit(1);
}

const indexFile = path.join(distPath, 'index.js');
if (!fs.existsSync(indexFile)) {
  console.error('❌ Main entry point not found at dist/index.js');
  process.exit(1);
}

console.log('🎉 Vercel build completed successfully!');
console.log(`📁 Build output: ${distPath}`);
console.log(`🚀 Entry point: ${indexFile}`);
