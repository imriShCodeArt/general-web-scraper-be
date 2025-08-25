#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Building Web Scraper Frontend & Backend for Vercel...\n');

// Ensure we're in the right directory
const projectRoot = path.resolve(__dirname);
console.log(`📁 Project root: ${projectRoot}`);

// Step 1: Build the frontend first
console.log('🔨 Building frontend...');
const frontendPath = path.join(projectRoot, 'apps', 'frontend');
if (!fs.existsSync(frontendPath)) {
  console.error('❌ Frontend directory not found at apps/frontend');
  process.exit(1);
}

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
try {
  execSync('npm install', {
    cwd: frontendPath,
    stdio: 'inherit'
  });
  console.log('✅ Frontend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Build the frontend
try {
  execSync('npm run build', {
    cwd: frontendPath,
    stdio: 'inherit'
  });
  console.log('✅ Frontend built successfully\n');
} catch (error) {
  console.error('❌ Failed to build frontend');
  process.exit(1);
}

// Step 2: Build the backend
console.log('🔨 Building backend...');
const backendPath = path.join(projectRoot, 'apps', 'backend');
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend directory not found at apps/backend');
  process.exit(1);
}

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  // Use npm ci when possible for clean reproducible installs
  const installCmd = 'npm install --include=dev --omit=optional';
  execSync(installCmd, {
    cwd: backendPath,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development', NPM_CONFIG_PRODUCTION: 'false' }
  });
  console.log('✅ Backend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Ensure TypeScript is available locally (avoid "fake tsc" npx fallback)
try {
  const typescriptPkg = path.join(backendPath, 'node_modules', 'typescript');
  if (!fs.existsSync(typescriptPkg)) {
    console.log('🧩 TypeScript not found locally, installing as devDependency...');
    execSync('npm install -D typescript', {
      cwd: backendPath,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development', NPM_CONFIG_PRODUCTION: 'false' }
    });
  }
} catch (error) {
  console.error('❌ Failed to ensure local TypeScript is installed');
  process.exit(1);
}

// Build the backend by invoking the TypeScript compiler directly to avoid recursive root builds
try {
  const tsconfigPath = path.join(backendPath, 'tsconfig.json');
  // Use npx to invoke local TypeScript consistently across platforms
  const cmd = `npx --no-install tsc -p "${tsconfigPath}"`;
  execSync(cmd, {
    cwd: backendPath,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development', NPM_CONFIG_PRODUCTION: 'false' }
  });
  console.log('✅ Backend built successfully\n');
} catch (error) {
  console.error('❌ Failed to build backend');
  process.exit(1);
}

// Step 3: Verify backend build output
const distPath = path.join(backendPath, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Backend build output directory not found');
  process.exit(1);
}

const indexFile = path.join(distPath, 'index.js');
if (!fs.existsSync(indexFile)) {
  console.error('❌ Backend main entry point not found at dist/index.js');
  process.exit(1);
}

// Verify frontend build output
const frontendDistPath = path.join(frontendPath, 'dist');
if (!fs.existsSync(frontendDistPath)) {
  console.error('❌ Frontend build output directory not found');
  process.exit(1);
}

// Step 3: Prepare Vercel deployment directory
console.log('📁 Preparing Vercel deployment directory...');
const vercelDeployPath = path.join(projectRoot, 'vercel-deploy');
if (!fs.existsSync(vercelDeployPath)) {
  fs.mkdirSync(vercelDeployPath, { recursive: true });
}

// Helper function to copy files recursively
const copyRecursive = (src, dest) => {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

// Copy the built frontend to the root (apps/frontend/dist)
const vercelFrontendPath = path.join(projectRoot, 'apps', 'frontend', 'dist');
// Ensure the directory exists (it should from the build)
if (!fs.existsSync(vercelFrontendPath)) {
  fs.mkdirSync(vercelFrontendPath, { recursive: true });
}

try {
  // Copy all files from frontend dist to apps/frontend/dist (overwrite with built version)
  copyRecursive(frontendDistPath, vercelFrontendPath);
  console.log('✅ Frontend copied to apps/frontend/dist directory');
} catch (error) {
  console.error('❌ Failed to copy frontend to apps/frontend/dist:', error);
  process.exit(1);
}

// Copy the built backend to vercel-deploy
const vercelBackendPath = path.join(vercelDeployPath, 'apps', 'backend', 'dist');
fs.mkdirSync(vercelBackendPath, { recursive: true });

try {
  // Copy all files from backend dist to vercel-deploy
  copyRecursive(distPath, vercelBackendPath);
  console.log('✅ Backend copied to vercel-deploy directory');
} catch (error) {
  console.error('❌ Failed to copy backend to vercel-deploy:', error);
  process.exit(1);
}

console.log('🎉 Vercel build completed successfully!');
console.log(`📁 Build output: ${distPath}`);
console.log(`📁 Vercel deployment: ${vercelDeployPath}`);
console.log(`🚀 Entry point: ${indexFile}`);
