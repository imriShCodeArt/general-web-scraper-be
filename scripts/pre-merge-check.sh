#!/bin/bash

# Pre-merge quality gate script
# Run this before merging development into main

echo "🚀 Running Pre-Merge Quality Gate..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on main branch (currently on: $CURRENT_BRANCH)${NC}"
    echo "This script should be run on main branch before merging."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 Step 1: Type checking..."
if ! npm run type-check; then
    echo -e "${RED}❌ Type check failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Type check passed${NC}"

echo "📋 Step 2: Linting..."
if ! npm run lint; then
    echo -e "${RED}❌ Linting failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Linting passed${NC}"

echo "📋 Step 3: Running tests..."
if ! npm run test:ci; then
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Tests passed${NC}"

echo "📋 Step 4: Skipping mutation testing (runs on GitHub)..."
echo -e "${YELLOW}💡 Mutation testing will run automatically on GitHub when you push to main${NC}"

echo -e "${GREEN}🎉 All quality gates passed! Safe to merge to main.${NC}"
echo -e "${YELLOW}💡 Remember to run 'git push origin main' after merging${NC}"
