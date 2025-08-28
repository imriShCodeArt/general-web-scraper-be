export const TOKENS = {
  Logger: Symbol('Logger'),
  LoggerFactory: Symbol('LoggerFactory'),
  Config: Symbol('Config'),
  RequestContext: Symbol('RequestContext'),
  StorageService: Symbol('StorageService'),
  RecipeManager: Symbol('RecipeManager'),
  CsvGenerator: Symbol('CsvGenerator'),
  ScrapingService: Symbol('ScrapingService'),
};

export function createToken<T>(name: string): symbol {
  return Symbol(name);
}


