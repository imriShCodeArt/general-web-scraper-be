import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { ScrapingService } from './lib/scraping-service';
import { StorageService } from './lib/storage';
import pino from 'pino';
import recipeRoutes from './app/api/recipes/route';

const app = express();
const port = process.env.PORT || 3000;

// Initialize services
const scrapingService = new ScrapingService();
const storageService = new StorageService();

// Logger
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Recipe management routes
app.use('/api/recipes', recipeRoutes);

// API Routes

// Start scraping job
app.post('/api/scrape/init', async (req, res) => {
  try {
    const { siteUrl, recipe, options } = req.body;
    
    if (!siteUrl || !recipe) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: siteUrl and recipe',
      });
    }

    const result = await scrapingService.startScraping({
      siteUrl,
      recipe,
      options,
    });

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Failed to start scraping:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get job status
app.get('/api/scrape/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await scrapingService.getJobStatus(jobId);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    logger.error('Failed to get job status:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get all jobs
app.get('/api/scrape/jobs', async (req, res) => {
  try {
    const result = await scrapingService.getAllJobs();
    return res.json(result);
  } catch (error) {
    logger.error('Failed to get jobs:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Cancel job
app.post('/api/scrape/cancel/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await scrapingService.cancelJob(jobId);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Failed to cancel job:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Download CSV files
app.get('/api/scrape/download/:jobId/:type', async (req, res) => {
  try {
    const { jobId, type } = req.params;
    
    if (!['parent', 'variation'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "parent" or "variation"',
      });
    }

    const storageEntry = await storageService.getJobResult(jobId);
    if (!storageEntry) {
      return res.status(404).json({
        success: false,
        error: 'Job result not found',
      });
    }

    let csvContent: string;
    let filename: string;

    if (type === 'parent') {
      csvContent = storageEntry.parentCsv;
      filename = `parent-${storageEntry.metadata.filename}`;
    } else {
      csvContent = storageEntry.variationCsv;
      filename = `variation-${storageEntry.metadata.filename}`;
    }

    if (!csvContent) {
      return res.status(404).json({
        success: false,
        error: `${type} CSV not found for this job`,
      });
    }

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
    
    // Send CSV content
    res.send(csvContent);
    return;

  } catch (error) {
    logger.error('Failed to download CSV:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get storage statistics
app.get('/api/storage/stats', async (req, res) => {
  try {
    const result = await scrapingService.getStorageStats();
    res.json(result);
  } catch (error) {
    logger.error('Failed to get storage stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Clear all storage
app.delete('/api/storage/clear', async (req, res) => {
  try {
    await storageService.clearAll();
    res.json({
      success: true,
      message: 'All storage cleared successfully',
    });
  } catch (error) {
    logger.error('Failed to clear storage:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
app.listen(port, () => {
  logger.info(`Web Scraper v2 server running on port ${port}`);
  logger.info(`Health check: http://localhost:${port}/health`);
  logger.info(`API docs: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
