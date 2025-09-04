// @ts-nocheck
export const TOKENS = {
  // Core services
  Logger: Symbol('Logger'),
  LoggerFactory: Symbol('LoggerFactory'),
  Config: Symbol('Config'),

  // Storage and data services
  StorageService: Symbol('StorageService'),
  CsvGenerator: Symbol('CsvGenerator'),

  // Recipe services
  RecipeLoaderService: Symbol('RecipeLoaderService'),
  RecipeManager: Symbol('RecipeManager'),

  // Scraping services
  ScrapingService: Symbol('ScrapingService'),
  HttpClient: Symbol('HttpClient'),

  // Request context (per-request)
  RequestContext: Symbol('RequestContext'),
};

export function createToken(name: string): symbol {
  return Symbol(name);
}


