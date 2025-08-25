#!/bin/bash

echo "🚀 Preparing Vercel deployment..."

# Backup original package.json
cp package.json package.json.backup

# Replace with Vercel-specific package.json
cp vercel-package.json package.json

echo "✅ Package.json replaced for Vercel deployment"
echo "📦 Original package.json backed up as package.json.backup"

# The build process will now use the Vercel-specific package.json
echo "🔨 Ready for Vercel build process"
