#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Building Web Scraper Backend for Vercel...\n');

// Ensure we're in the right directory
const projectRoot = path.resolve(__dirname);
console.log(`📁 Project root: ${projectRoot}`);

// Step 1: Replace package.json with Vercel-specific version
console.log('📦 Replacing package.json for Vercel deployment...');
try {
  const originalPackage = path.join(projectRoot, 'package.json');
  const vercelPackage = path.join(projectRoot, 'vercel-package.json');
  const backupPackage = path.join(projectRoot, 'package.json.backup');
  
  // Backup original package.json
  if (fs.existsSync(originalPackage)) {
    fs.copyFileSync(originalPackage, backupPackage);
    console.log('✅ Original package.json backed up');
  }
  
  // Replace with Vercel-specific package.json
  if (fs.existsSync(vercelPackage)) {
    fs.copyFileSync(vercelPackage, originalPackage);
    console.log('✅ Package.json replaced with Vercel version');
  } else {
    console.error('❌ vercel-package.json not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to replace package.json:', error);
  process.exit(1);
}

// Step 2: Install dependencies using the new package.json
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Step 3: Check if backend directory exists
const backendPath = path.join(projectRoot, 'apps', 'backend');
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend directory not found at apps/backend');
  process.exit(1);
}

// Step 4: Install backend-specific dependencies
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

// Step 5: Build the backend
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

// Step 6: Verify build output
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

// Step 7: Restore original package.json
console.log('📦 Restoring original package.json...');
try {
  const backupPackage = path.join(projectRoot, 'package.json.backup');
  const originalPackage = path.join(projectRoot, 'package.json');
  
  if (fs.existsSync(backupPackage)) {
    fs.copyFileSync(backupPackage, originalPackage);
    fs.unlinkSync(backupPackage);
    console.log('✅ Original package.json restored');
  }
} catch (error) {
  console.warn('⚠️  Warning: Failed to restore original package.json:', error);
}

console.log('🎉 Vercel build completed successfully!');
console.log(`📁 Build output: ${distPath}`);
console.log(`🚀 Entry point: ${indexFile}`);
