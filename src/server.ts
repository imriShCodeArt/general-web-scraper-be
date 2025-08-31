import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { ScrapingService } from './lib/scraping-service';
import { rootContainer, RequestContext } from './lib/composition-root';
import { Container } from './lib/di/container';
import { TOKENS } from './lib/di/tokens';
import pino from 'pino';
import recipeRoutes from './app/api/recipes/route';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './app/openapi';

/**
 * Create a clean filename for CSV downloads
 */
function createCleanFilename(originalFilename: string, type: string): string {
  // Remove Hebrew characters and excessive length
  const cleanName = originalFilename
    .replace(/[א-ת]/g, '') // Remove Hebrew characters
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();

  // Limit length and add type prefix
  const maxLength = 50;
  const truncatedName =
    cleanName.length > maxLength ? cleanName.substring(0, maxLength) : cleanName;

  return `${type}-${truncatedName || 'products'}`;
}

const app = express();

// Services are now managed by DI container

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
  // attach a scope per request with RequestContext and scoped logger
  const scope = rootContainer.createScope();
  const requestId = (Math.random() + 1).toString(36).substring(2);
  const ctx: RequestContext = {
    requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent') || undefined,
    timestamp: new Date(),
  };
  scope.register(TOKENS.RequestContext, {
    lifetime: 'scoped',
    factory: () => ctx,
  });
  // child logger with request bindings
  scope.register(TOKENS.Logger, {
    lifetime: 'scoped',
    factory: async (_c) => {
      const base = await rootContainer.resolve(TOKENS.Logger);
      return (base as unknown as { child: (bindings: Record<string, unknown>) => unknown }).child({ requestId: ctx.requestId, ip: ctx.ip });
    },
  });
  (req as unknown as { containerScope?: Container }).containerScope = scope;
  res.on('finish', async () => {
    await scope.dispose();
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Web Scraper v2 API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      recipes: '/api/recipes',
      scrape: '/api/scrape/init',
      storage: '/api/storage',
      docs: '/docs',
      openapi: '/openapi.json',
    },
  });
});

// Recipe management routes
app.use('/api/recipes', recipeRoutes);

// API Routes
// OpenAPI and Swagger UI
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const scrapingService = await scope.resolve(TOKENS.ScrapingService) as ScrapingService;
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
    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const scrapingService = await scope.resolve(TOKENS.ScrapingService) as ScrapingService;
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
    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const scrapingService = await scope.resolve(TOKENS.ScrapingService) as ScrapingService;
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

// Get performance metrics
app.get('/api/scrape/performance', async (req, res) => {
  try {
    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const scrapingService = await scope.resolve(TOKENS.ScrapingService) as ScrapingService;
    const result = await scrapingService.getPerformanceMetrics();
    return res.json(result);
  } catch (error) {
    logger.error('Failed to get performance metrics:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get real-time performance monitoring
app.get('/api/scrape/performance/live', async (req, res) => {
  try {
    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const scrapingService = await scope.resolve(TOKENS.ScrapingService) as ScrapingService;
    const result = await scrapingService.getLivePerformanceMetrics();
    return res.json(result);
  } catch (error) {
    logger.error('Failed to get live performance metrics:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get performance recommendations
app.get('/api/scrape/performance/recommendations', async (req, res) => {
  try {
    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const scrapingService = await scope.resolve(TOKENS.ScrapingService) as ScrapingService;
    const result = await scrapingService.getPerformanceRecommendations();
    return res.json(result);
  } catch (error) {
    logger.error('Failed to get performance recommendations:', error);
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
    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const scrapingService = await scope.resolve(TOKENS.ScrapingService) as ScrapingService;
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

    console.log('🔍 DEBUG: Download CSV request:', { jobId, type });

    if (!['parent', 'variation'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "parent" or "variation"',
      });
    }

    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const storageService = await scope.resolve(TOKENS.StorageService) as any;
    const storageEntry = await storageService.getJobResult(jobId);
    if (!storageEntry) {
      console.log('❌ DEBUG: Storage entry not found for jobId:', jobId);
      return res.status(404).json({
        success: false,
        error: 'Job result not found',
      });
    }

    console.log('🔍 DEBUG: Storage entry found:', {
      hasParentCsv: !!storageEntry.parentCsv,
      parentCsvLength: storageEntry.parentCsv?.length || 0,
      hasVariationCsv: !!storageEntry.variationCsv,
      variationCsvLength: storageEntry.variationCsv?.length || 0,
    });

    let csvContent: string;
    let filename: string;

    if (type === 'parent') {
      csvContent = storageEntry.parentCsv;
      // Create a clean filename without Hebrew characters and excessive length
      const cleanFilename = createCleanFilename(
        storageEntry.metadata?.filename || 'products',
        type,
      );
      filename = `parent-${cleanFilename}`;
      console.log('🔍 DEBUG: Parent CSV processing:', {
        csvContentLength: csvContent?.length || 0,
        cleanFilename,
        hasContent: !!csvContent && csvContent.trim() !== '',
      });
    } else {
      csvContent = storageEntry.variationCsv;
      console.log('🔍 DEBUG: Variation CSV processing:', {
        csvContentLength: csvContent?.length || 0,
        hasContent: !!csvContent && csvContent.trim() !== '',
      });

      if (!csvContent || csvContent.trim() === '') {
        console.log('❌ DEBUG: Variation CSV is empty, returning 404');
        return res.status(404).json({
          success: false,
          error: `${type} CSV not found for this job`,
        });
      }
      const cleanFilename = createCleanFilename(
        storageEntry.metadata?.filename || 'products',
        type,
      );
      filename = `variation-${cleanFilename}`;
    }

    if (!csvContent || csvContent.trim() === '') {
      return res.status(404).json({
        success: false,
        error: `${type} CSV not found for this job`,
      });
    }

    console.log('🔍 DEBUG: Sending CSV response:', {
      type,
      filename,
      contentLength: Buffer.byteLength(csvContent, 'utf8'),
      hasContent: !!csvContent,
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
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
    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const scrapingService = await scope.resolve(TOKENS.ScrapingService) as ScrapingService;
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

// Get job result from storage
app.get('/api/storage/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log('🔍 DEBUG: Storage job request for jobId:', jobId);

    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const storageService = await scope.resolve(TOKENS.StorageService) as any;
    const storageEntry = await storageService.getJobResult(jobId);

    if (!storageEntry) {
      console.log('❌ DEBUG: Storage entry not found for jobId:', jobId);
      return res.status(404).json({
        success: false,
        error: 'Job result not found',
      });
    }

    console.log('🔍 DEBUG: Storage entry returned:', {
      hasParentCsv: !!storageEntry.parentCsv,
      parentCsvLength: storageEntry.parentCsv?.length || 0,
      hasVariationCsv: !!storageEntry.variationCsv,
      variationCsvLength: storageEntry.variationCsv?.length || 0,
    });

    return res.json({
      success: true,
      data: storageEntry,
    });
  } catch (error) {
    logger.error('Failed to get job result:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Clear all storage
app.delete('/api/storage/clear', async (req, res) => {
  try {
    const scope = (req as unknown as { containerScope?: Container }).containerScope;
    if (!scope) {
      return res.status(500).json({
        success: false,
        error: 'Container scope not available',
      });
    }
    const storageService = await scope.resolve(TOKENS.StorageService) as any;
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
app.use((error: Error, req: express.Request, res: express.Response) => {
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

// Graceful shutdown handling
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');

  // Clean up scraping service (this will close Puppeteer browsers)
  try {
    const scope = rootContainer.createScope();
    const scrapingService = await scope.resolve<ScrapingService>(TOKENS.ScrapingService);
    await scrapingService.cleanup();
    logger.info('Scraping service cleaned up successfully');
  } catch (error) {
    logger.error('Failed to cleanup scraping service:', error);
  }

  // Graceful shutdown completed
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');

  // Clean up scraping service (this will close Puppeteer browsers)
  try {
    const scope = rootContainer.createScope();
    const scrapingService = await scope.resolve<ScrapingService>(TOKENS.ScrapingService);
    await scrapingService.cleanup();
    logger.info('Scraping service cleaned up successfully');
  } catch (error) {
    logger.error('Failed to cleanup scraping service:', error);
  }

  // Graceful shutdown completed
});

// Server startup is now handled in index.ts for Vercel compatibility
// app.listen() is called there only for local development

export default app;
