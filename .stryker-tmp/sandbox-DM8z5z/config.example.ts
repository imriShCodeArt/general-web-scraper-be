// @ts-nocheck
// Configuration template for the General Web Scraper Backend
// Copy this file to config.ts and fill in your actual values

export const config = {
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/scraper',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
  },

  // Scraping Configuration
  scraping: {
    timeout: parseInt(process.env.SCRAPING_TIMEOUT || '30000'),
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT || '5'),
    userAgent: process.env.USER_AGENT || 'General-Web-Scraper/1.0',
  },

  // Vercel Deployment (for CI/CD)
  vercel: {
    token: process.env.VERCEL_TOKEN || 'your_vercel_token_here',
    orgId: process.env.ORG_ID || 'your_org_id_here',
    projectId: process.env.PROJECT_ID || 'your_project_id_here',
  },

  // API Keys for External Services
  apiKeys: process.env.API_KEYS
    ? JSON.parse(process.env.API_KEYS)
    : {
        service1: 'key1',
        service2: 'key2',
      },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
    sessionSecret: process.env.SESSION_SECRET || 'your_session_secret_here',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
} as const;

export type Config = typeof config;
