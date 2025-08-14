# 🚀 Deployment Guide for Vercel

This guide will help you deploy your web scraper application to Vercel.

## 📋 Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Node.js**: Version 18+ (Vercel will use this automatically)

## 🔧 Pre-Deployment Setup

### 1. Build Test
First, test that your application builds successfully locally:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# If build succeeds, you're ready to deploy
```

### 2. Environment Variables
Create a `.env.local` file in your project root (this won't be committed to git):

```bash
# Logging level for production
LOG_LEVEL=info

# Node environment
NODE_ENV=production
```

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "New Project"**
3. **Import your GitHub repository**:
   - Select your repository
   - Vercel will auto-detect it's a Next.js project
4. **Configure project settings**:
   - **Project Name**: `your-web-scraper` (or any name you prefer)
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `.next` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)
5. **Add Environment Variables**:
   - `LOG_LEVEL` = `info`
   - `NODE_ENV` = `production`
6. **Click "Deploy"**

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## ⚙️ Configuration Files

### vercel.json
The `vercel.json` file is already configured with:
- **Build settings**: Optimized for Next.js
- **Function timeout**: 5 minutes for API routes (scraping operations)
- **Environment**: Production mode

### next.config.js
Production optimizations added:
- **SWC minification**: Faster builds
- **Compression**: Smaller bundle sizes
- **Security**: Removed powered-by header

## 🔍 Post-Deployment Verification

### 1. Check Build Logs
- Go to your Vercel dashboard
- Check the deployment logs for any errors
- Ensure all dependencies are installed correctly

### 2. Test the Application
- Visit your deployed URL
- Test the scraping functionality with a small URL
- Verify CSV downloads work

### 3. Monitor Performance
- Check Vercel analytics for performance metrics
- Monitor function execution times for API routes

## 🚨 Important Notes

### Memory Limitations
- **Vercel Functions**: 1024MB RAM limit
- **CSV Storage**: Currently in-memory (will reset between requests)
- **Large Scraping Jobs**: May hit timeout limits (5 minutes)

### Production Considerations
- **CSV Storage**: In-memory storage is not persistent across deployments
- **Rate Limiting**: Be mindful of scraping too many sites too quickly
- **Error Handling**: Production errors are logged to Vercel dashboard

## 🔧 Troubleshooting

### Build Failures
1. **Check Node.js version**: Ensure compatibility
2. **Dependency issues**: Run `npm install` locally first
3. **TypeScript errors**: Fix any type issues before deploying

### Runtime Errors
1. **Check Vercel function logs** in dashboard
2. **Verify environment variables** are set correctly
3. **Check API route configurations**

### Performance Issues
1. **Function timeouts**: Break large scraping jobs into smaller chunks
2. **Memory usage**: Monitor function memory consumption
3. **Cold starts**: First request may be slower

## 📈 Scaling Considerations

### For Production Use
1. **Database Storage**: Consider adding persistent storage for CSV data
2. **Queue System**: Implement job queuing for large scraping tasks
3. **Caching**: Add Redis or similar for better performance
4. **Monitoring**: Implement proper logging and monitoring

### Alternative Storage Solutions
- **Supabase**: PostgreSQL database with easy setup
- **PlanetScale**: MySQL-compatible serverless database
- **Upstash Redis**: Serverless Redis for caching

## 🎯 Next Steps

After successful deployment:
1. **Set up monitoring** and alerts
2. **Implement persistent storage** for CSV data
3. **Add authentication** if needed
4. **Set up CI/CD** for automatic deployments
5. **Monitor usage** and optimize performance

## 📞 Support

If you encounter issues:
1. **Check Vercel documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Review build logs** in Vercel dashboard
3. **Check Next.js deployment guide**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

**Happy Deploying! 🚀**
