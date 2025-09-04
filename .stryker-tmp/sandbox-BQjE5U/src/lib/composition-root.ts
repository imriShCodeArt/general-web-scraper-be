// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
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
rootContainer.register(TOKENS.Config, stryMutAct_9fa48("905") ? {} : (stryCov_9fa48("905"), {
  lifetime: stryMutAct_9fa48("906") ? "" : (stryCov_9fa48("906"), 'singleton'),
  factory: stryMutAct_9fa48("907") ? () => undefined : (stryCov_9fa48("907"), (): AppConfig => stryMutAct_9fa48("908") ? {} : (stryCov_9fa48("908"), {
    nodeEnv: stryMutAct_9fa48("911") ? process.env.NODE_ENV && 'development' : stryMutAct_9fa48("910") ? false : stryMutAct_9fa48("909") ? true : (stryCov_9fa48("909", "910", "911"), process.env.NODE_ENV || (stryMutAct_9fa48("912") ? "" : (stryCov_9fa48("912"), 'development'))),
    logLevel: stryMutAct_9fa48("915") ? process.env.LOG_LEVEL && 'info' : stryMutAct_9fa48("914") ? false : stryMutAct_9fa48("913") ? true : (stryCov_9fa48("913", "914", "915"), process.env.LOG_LEVEL || (stryMutAct_9fa48("916") ? "" : (stryCov_9fa48("916"), 'info'))),
    recipesDir: stryMutAct_9fa48("917") ? "" : (stryCov_9fa48("917"), './recipes')
  }))
}));

// Logger factory
rootContainer.register(TOKENS.LoggerFactory, stryMutAct_9fa48("918") ? {} : (stryCov_9fa48("918"), {
  lifetime: stryMutAct_9fa48("919") ? "" : (stryCov_9fa48("919"), 'singleton'),
  factory: () => {
    if (stryMutAct_9fa48("920")) {
      {}
    } else {
      stryCov_9fa48("920");
      return stryMutAct_9fa48("921") ? () => undefined : (stryCov_9fa48("921"), (bindings?: Record<string, unknown>) => pino(stryMutAct_9fa48("922") ? {} : (stryCov_9fa48("922"), {
        level: stryMutAct_9fa48("925") ? process.env.LOG_LEVEL && 'info' : stryMutAct_9fa48("924") ? false : stryMutAct_9fa48("923") ? true : (stryCov_9fa48("923", "924", "925"), process.env.LOG_LEVEL || (stryMutAct_9fa48("926") ? "" : (stryCov_9fa48("926"), 'info')))
      })).child(stryMutAct_9fa48("929") ? bindings && {} : stryMutAct_9fa48("928") ? false : stryMutAct_9fa48("927") ? true : (stryCov_9fa48("927", "928", "929"), bindings || {})));
    }
  }
}));

// Logger
rootContainer.register(TOKENS.Logger, stryMutAct_9fa48("930") ? {} : (stryCov_9fa48("930"), {
  lifetime: stryMutAct_9fa48("931") ? "" : (stryCov_9fa48("931"), 'singleton'),
  factory: async c => {
    if (stryMutAct_9fa48("932")) {
      {}
    } else {
      stryCov_9fa48("932");
      const cfg = await c.resolve<AppConfig>(TOKENS.Config);
      const logger = pino(stryMutAct_9fa48("933") ? {} : (stryCov_9fa48("933"), {
        level: cfg.logLevel
      }));
      return logger;
    }
  }
}));

// Storage service
rootContainer.register(TOKENS.StorageService, stryMutAct_9fa48("934") ? {} : (stryCov_9fa48("934"), {
  lifetime: stryMutAct_9fa48("935") ? "" : (stryCov_9fa48("935"), 'singleton'),
  factory: stryMutAct_9fa48("936") ? () => undefined : (stryCov_9fa48("936"), () => new StorageService()),
  destroy: async s => {
    if (stryMutAct_9fa48("937")) {
      {}
    } else {
      stryCov_9fa48("937");
      if (stryMutAct_9fa48("940") ? typeof (s as unknown as {
        destroy?: () => Promise<void>;
      }).destroy !== 'function' : stryMutAct_9fa48("939") ? false : stryMutAct_9fa48("938") ? true : (stryCov_9fa48("938", "939", "940"), typeof (s as unknown as {
        destroy?: () => Promise<void>;
      }).destroy === (stryMutAct_9fa48("941") ? "" : (stryCov_9fa48("941"), 'function')))) {
        if (stryMutAct_9fa48("942")) {
          {}
        } else {
          stryCov_9fa48("942");
          await (s as unknown as {
            destroy: () => Promise<void>;
          }).destroy();
        }
      }
    }
  }
}));

// Recipe loader service
rootContainer.register(TOKENS.RecipeLoaderService, stryMutAct_9fa48("943") ? {} : (stryCov_9fa48("943"), {
  lifetime: stryMutAct_9fa48("944") ? "" : (stryCov_9fa48("944"), 'singleton'),
  factory: async c => {
    if (stryMutAct_9fa48("945")) {
      {}
    } else {
      stryCov_9fa48("945");
      const cfg = await c.resolve<AppConfig>(TOKENS.Config);
      return new RecipeLoader(cfg.recipesDir);
    }
  }
}));

// Recipe manager
rootContainer.register(TOKENS.RecipeManager, stryMutAct_9fa48("946") ? {} : (stryCov_9fa48("946"), {
  lifetime: stryMutAct_9fa48("947") ? "" : (stryCov_9fa48("947"), 'singleton'),
  factory: async c => {
    if (stryMutAct_9fa48("948")) {
      {}
    } else {
      stryCov_9fa48("948");
      const cfg = await c.resolve<AppConfig>(TOKENS.Config);
      const recipeLoader = await c.resolve<RecipeLoader>(TOKENS.RecipeLoaderService);
      return new RecipeManager(cfg.recipesDir, recipeLoader);
    }
  }
}));

// CSV generator
rootContainer.register(TOKENS.CsvGenerator, stryMutAct_9fa48("949") ? {} : (stryCov_9fa48("949"), {
  lifetime: stryMutAct_9fa48("950") ? "" : (stryCov_9fa48("950"), 'singleton'),
  factory: stryMutAct_9fa48("951") ? () => undefined : (stryCov_9fa48("951"), () => new CsvGenerator())
}));

// HTTP client
rootContainer.register(TOKENS.HttpClient, stryMutAct_9fa48("952") ? {} : (stryCov_9fa48("952"), {
  lifetime: stryMutAct_9fa48("953") ? "" : (stryCov_9fa48("953"), 'singleton'),
  factory: stryMutAct_9fa48("954") ? () => undefined : (stryCov_9fa48("954"), () => new HttpClient())
}));

// Scraping service
rootContainer.register(TOKENS.ScrapingService, stryMutAct_9fa48("955") ? {} : (stryCov_9fa48("955"), {
  lifetime: stryMutAct_9fa48("956") ? "" : (stryCov_9fa48("956"), 'singleton'),
  factory: stryMutAct_9fa48("957") ? () => undefined : (stryCov_9fa48("957"), async c => new ScrapingService(await c.resolve(TOKENS.StorageService), await c.resolve(TOKENS.RecipeManager), await c.resolve(TOKENS.CsvGenerator), await c.resolve(TOKENS.Logger)))
}));

/**
 * Creates a request-scoped container with request-specific context
 */
export function createRequestScope(requestId: string, ip?: string, userAgent?: string): Container {
  if (stryMutAct_9fa48("958")) {
    {}
  } else {
    stryCov_9fa48("958");
    const requestScope = rootContainer.createScope();

    // Register request-scoped context
    requestScope.register(TOKENS.RequestContext, stryMutAct_9fa48("959") ? {} : (stryCov_9fa48("959"), {
      lifetime: stryMutAct_9fa48("960") ? "" : (stryCov_9fa48("960"), 'scoped'),
      factory: stryMutAct_9fa48("961") ? () => undefined : (stryCov_9fa48("961"), (): RequestContext => stryMutAct_9fa48("962") ? {} : (stryCov_9fa48("962"), {
        requestId,
        ip,
        userAgent,
        timestamp: new Date()
      }))
    }));
    return requestScope;
  }
}

/**
 * Initialize all singleton services
 */
export async function initializeServices(): Promise<void> {
  if (stryMutAct_9fa48("963")) {
    {}
  } else {
    stryCov_9fa48("963");
    // Resolve all singleton services to trigger initialization
    await rootContainer.resolve(TOKENS.Logger);
    await rootContainer.resolve(TOKENS.StorageService);
    await rootContainer.resolve(TOKENS.RecipeLoaderService);
    await rootContainer.resolve(TOKENS.RecipeManager);
    await rootContainer.resolve(TOKENS.CsvGenerator);
    await rootContainer.resolve(TOKENS.HttpClient);
    await rootContainer.resolve(TOKENS.ScrapingService);
  }
}

/**
 * Cleanup all services
 */
export async function cleanupServices(): Promise<void> {
  if (stryMutAct_9fa48("964")) {
    {}
  } else {
    stryCov_9fa48("964");
    await rootContainer.dispose();
  }
}

// Re-export TOKENS for use in other modules
export { TOKENS };