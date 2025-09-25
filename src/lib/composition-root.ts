import { Container } from './infrastructure/di/container';
import { TOKENS } from './infrastructure/di/tokens';
import { loadConfig, AppConfig as LoadedAppConfig } from './infrastructure/config/config';
import {
  registerCoreServices,
  registerInfrastructureServices,
  registerValidationServices,
} from './infrastructure/di/registries';

export interface AppConfig extends LoadedAppConfig {}

export interface RequestContext {
  requestId: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export const rootContainer = new Container();

// Configuration
let config: AppConfig;
rootContainer.register(TOKENS.Config, {
  lifetime: 'singleton',
  factory: (): AppConfig => {
    config = loadConfig();
    return config;
  },
});

// Register services using domain-specific registries
registerInfrastructureServices(rootContainer, config!);
registerCoreServices(rootContainer, config!);
registerValidationServices(rootContainer);

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
