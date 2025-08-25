# Vercel Deployment Guide

## Overview

This project is configured for Vercel deployment as a **Node.js backend application**, not a Next.js application.

## Key Configuration Files

### `vercel.json`
- **Framework**: Explicitly set to `null` to prevent auto-detection
- **Build Command**: `npm run vercel-build`
- **Entry Point**: `vercel-entry.js`

### `vercel-package.json`
- **Main**: `vercel-entry.js`
- **Type**: `commonjs`
- **Framework**: Explicitly set to `null` in Vercel config

### `vercel-entry.js`
- Entry point that loads the actual backend from `apps/backend/dist/index.js`

### `vercel-build.js`
- Custom build script that:
  1. Temporarily replaces `package.json` with Vercel-specific version
  2. Installs dependencies
  3. Builds the backend
  4. Restores original `package.json`

## Deployment Process

1. **Vercel detects**: This is a Node.js application (not Next.js)
2. **Build process**: Runs `npm run vercel-build`
3. **Package replacement**: Temporarily uses `vercel-package.json`
4. **Dependency installation**: Installs backend dependencies
5. **Backend build**: Compiles TypeScript to JavaScript
6. **Package restoration**: Restores original `package.json`
7. **Deployment**: Uses `vercel-entry.js` as entry point

## Troubleshooting

### "No Next.js version detected" Error
- **Cause**: Vercel is trying to auto-detect the framework
- **Solution**: The `framework: null` setting in `vercel.json` prevents this

### Build Failures
- Check that `apps/backend/` directory exists
- Verify TypeScript compilation works locally
- Ensure all backend dependencies are in `vercel-package.json`

### Runtime Errors
- Verify `vercel-entry.js` can find the backend
- Check that `apps/backend/dist/index.js` exists
- Ensure backend dependencies are properly installed

## Local Testing

Test the Vercel build process locally:

```bash
npm run vercel-build
```

This will:
- Replace `package.json` temporarily
- Install dependencies
- Build the backend
- Restore original `package.json`

## File Structure for Vercel

```
/
├── vercel.json              # Vercel configuration
├── vercel-package.json      # Vercel-specific dependencies
├── vercel-entry.js          # Entry point for Vercel
├── vercel-build.js          # Build script
├── .vercelignore            # Files to exclude
└── apps/
    └── backend/             # Backend source code
        ├── src/
        ├── package.json
        └── tsconfig.json
```

## Environment Variables

Set these in your Vercel dashboard:
- `NODE_ENV`: `production`
- `PORT`: `3000` (Vercel will override this)
- Any other backend-specific environment variables

## Support

If you encounter issues:
1. Check the build logs in Vercel dashboard
2. Verify the build process works locally
3. Ensure all configuration files are committed
4. Check that `vercel.json` is in the root directory
