#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Building Web Scraper Backend for Vercel...\n');

// Ensure we're in the right directory
const projectRoot = path.resolve(__dirname);
console.log(`📁 Project root: ${projectRoot}`);

// Step 1: Build the backend first
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
  const tscPath = path.join(backendPath, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
  const cmd = fs.existsSync(tscPath) ? `${tscPath} -p tsconfig.json` : 'npx tsc -p tsconfig.json';
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

// Step 2: Verify build output
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

// Step 3: Prepare Vercel deployment directory
console.log('📁 Preparing Vercel deployment directory...');
const vercelDeployPath = path.join(projectRoot, 'vercel-deploy');
if (!fs.existsSync(vercelDeployPath)) {
  fs.mkdirSync(vercelDeployPath, { recursive: true });
}

// Copy the built backend to vercel-deploy
const vercelBackendPath = path.join(vercelDeployPath, 'apps', 'backend', 'dist');
fs.mkdirSync(vercelBackendPath, { recursive: true });

try {
  // Copy all files from backend dist to vercel-deploy
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
