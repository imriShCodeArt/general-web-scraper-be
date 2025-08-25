#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🏗️  Building Web Scraper Monorepo...\n');

const packages = [
  'apps/backend',
  'apps/frontend'
];

// Build each package
for (const pkg of packages) {
  const pkgPath = path.join(__dirname, '..', pkg);
  
  if (fs.existsSync(path.join(pkgPath, 'package.json'))) {
    console.log(`📦 Building ${pkg}...`);
    
    try {
      execSync('npm run build', {
        cwd: pkgPath,
        stdio: 'inherit'
      });
      console.log(`✅ ${pkg} built successfully\n`);
    } catch (error) {
      console.error(`❌ Failed to build ${pkg}`);
      process.exit(1);
    }
  }
}

console.log('🎉 All packages built successfully!');
