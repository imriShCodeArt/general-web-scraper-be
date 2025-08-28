import { Container } from './di/container';
import { TOKENS } from './di/tokens';
import { StorageService } from './storage';
import { RecipeManager } from './recipe-manager';
import { CsvGenerator } from './csv-generator';
import { ScrapingService } from './scraping-service';
import pino from 'pino';

export interface AppConfig {
  nodeEnv: string;
  logLevel: string;
  recipesDir: string;
}

export const rootContainer = new Container();

rootContainer.register(TOKENS.Config, {
  lifetime: 'singleton',
  factory: (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    recipesDir: './recipes',
  }),
});

rootContainer.register(TOKENS.LoggerFactory, {
  lifetime: 'singleton',
  factory: () => (bindings?: Record<string, unknown>) =>
    pino({ level: process.env.LOG_LEVEL || 'info' }).child(bindings || {}),
});

rootContainer.register(TOKENS.Logger, {
  lifetime: 'singleton',
  factory: async (c) => {
    const cfg = await c.resolve<AppConfig>(TOKENS.Config);
    return pino({ level: cfg.logLevel });
  },
});

// RequestContext: to be registered per request in a scope
export interface RequestContext {
  requestId: string;
  ip?: string;
  userAgent?: string;
}

rootContainer.register(TOKENS.StorageService, {
  lifetime: 'singleton',
  factory: () => new StorageService(),
  destroy: async (s) => {
    if (typeof (s as any).destroy === 'function') {
      await (s as any).destroy();
    }
  },
});

rootContainer.register(TOKENS.RecipeManager, {
  lifetime: 'singleton',
  factory: async (c) => {
    const cfg = await c.resolve<AppConfig>(TOKENS.Config);
    return new RecipeManager(cfg.recipesDir);
  },
});

rootContainer.register(TOKENS.CsvGenerator, {
  lifetime: 'singleton',
  factory: () => new CsvGenerator(),
});

rootContainer.register(TOKENS.ScrapingService, {
  lifetime: 'singleton',
  factory: async (c) => new ScrapingService(
    await c.resolve(TOKENS.StorageService),
    await c.resolve(TOKENS.RecipeManager),
    await c.resolve(TOKENS.CsvGenerator),
    await c.resolve(TOKENS.Logger)
  ),
});


