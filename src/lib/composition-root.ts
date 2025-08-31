import { Container } from './di/container';
import { TOKENS } from './di/tokens';
import { StorageService } from './storage';
import { RecipeManager } from './recipe-manager';
import { RecipeLoader } from './recipe-loader';
import { CsvGenerator } from './csv-generator';
import { ScrapingService } from './scraping-service';
import { HttpClient } from './http-client';
import pino from 'pino';

export interface AppConfig {
  nodeEnv: string;
  logLevel: string;
  recipesDir: string;
}

export interface RequestContext {
  requestId: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export const rootContainer = new Container();

// Configuration
rootContainer.register(TOKENS.Config, {
  lifetime: 'singleton',
  factory: (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    recipesDir: './recipes',
  }),
});

// Logger factory
rootContainer.register(TOKENS.LoggerFactory, {
  lifetime: 'singleton',
  factory: () => {
    return (bindings?: Record<string, unknown>) =>
      pino({ level: process.env.LOG_LEVEL || 'info' }).child(bindings || {});
  },
});

// Logger
rootContainer.register(TOKENS.Logger, {
  lifetime: 'singleton',
  factory: async (c) => {
    const cfg = await c.resolve<AppConfig>(TOKENS.Config);
    const logger = pino({ level: cfg.logLevel });
    return logger;
  },
});

// Storage service
rootContainer.register(TOKENS.StorageService, {
  lifetime: 'singleton',
  factory: () => new StorageService(),
  destroy: async (s) => {
    if (typeof (s as unknown as { destroy?: () => Promise<void> }).destroy === 'function') {
      await (s as unknown as { destroy: () => Promise<void> }).destroy();
    }
  },
});

// Recipe loader service
rootContainer.register(TOKENS.RecipeLoaderService, {
  lifetime: 'singleton',
  factory: async (c) => {
    const cfg = await c.resolve<AppConfig>(TOKENS.Config);
    return new RecipeLoader(cfg.recipesDir);
  },
});

// Recipe manager
rootContainer.register(TOKENS.RecipeManager, {
  lifetime: 'singleton',
  factory: async (c) => {
    const cfg = await c.resolve<AppConfig>(TOKENS.Config);
    const recipeLoader = await c.resolve<RecipeLoader>(TOKENS.RecipeLoaderService);
    return new RecipeManager(cfg.recipesDir, recipeLoader);
  },
});

// CSV generator
rootContainer.register(TOKENS.CsvGenerator, {
  lifetime: 'singleton',
  factory: () => new CsvGenerator(),
});

// HTTP client
rootContainer.register(TOKENS.HttpClient, {
  lifetime: 'singleton',
  factory: () => new HttpClient(),
});

// Scraping service
rootContainer.register(TOKENS.ScrapingService, {
  lifetime: 'singleton',
  factory: async (c) => new ScrapingService(
    await c.resolve(TOKENS.StorageService),
    await c.resolve(TOKENS.RecipeManager),
    await c.resolve(TOKENS.CsvGenerator),
    await c.resolve(TOKENS.Logger),
  ),
});

/**
 * Creates a request-scoped container with request-specific context
 */
export function createRequestScope(requestId: string, ip?: string, userAgent?: string): Container {
  const requestScope = rootContainer.createScope();

  // Register request-scoped context
  requestScope.register(TOKENS.RequestContext, {
    lifetime: 'scoped',
    factory: (): RequestContext => ({
      requestId,
      ip,
      userAgent,
      timestamp: new Date(),
    }),
  });

  return requestScope;
}

/**
 * Initialize all singleton services
 */
export async function initializeServices(): Promise<void> {
  // Resolve all singleton services to trigger initialization
  await rootContainer.resolve(TOKENS.Logger);
  await rootContainer.resolve(TOKENS.StorageService);
  await rootContainer.resolve(TOKENS.RecipeLoaderService);
  await rootContainer.resolve(TOKENS.RecipeManager);
  await rootContainer.resolve(TOKENS.CsvGenerator);
  await rootContainer.resolve(TOKENS.HttpClient);
  await rootContainer.resolve(TOKENS.ScrapingService);
}

/**
 * Cleanup all services
 */
export async function cleanupServices(): Promise<void> {
  await rootContainer.dispose();
}

// Re-export TOKENS for use in other modules
export { TOKENS };
