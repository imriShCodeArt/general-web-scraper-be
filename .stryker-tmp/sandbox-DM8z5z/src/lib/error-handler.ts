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
import { ScrapingError, ValidationError, RetryConfig } from '../types';

/**
 * Custom error classes for better error handling
 */
export class ScrapingErrorImpl extends Error implements ScrapingError {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly retryable: boolean;
  public readonly timestamp: Date;
  constructor(message: string, code: string, retryable: boolean = stryMutAct_9fa48("1848") ? true : (stryCov_9fa48("1848"), false), context?: Record<string, unknown>) {
    if (stryMutAct_9fa48("1849")) {
      {}
    } else {
      stryCov_9fa48("1849");
      super(message);
      this.name = stryMutAct_9fa48("1850") ? "" : (stryCov_9fa48("1850"), 'ScrapingError');
      this.code = code;
      this.retryable = retryable;
      this.context = context;
      this.timestamp = new Date();
    }
  }
}
export class ValidationErrorImpl extends Error implements ValidationError {
  public readonly field: string;
  public readonly value: unknown;
  public readonly expected: unknown;
  constructor(field: string, value: unknown, expected: unknown, message?: string) {
    if (stryMutAct_9fa48("1851")) {
      {}
    } else {
      stryCov_9fa48("1851");
      super(stryMutAct_9fa48("1854") ? message && `Validation failed for field '${field}': expected ${expected}, got ${value}` : stryMutAct_9fa48("1853") ? false : stryMutAct_9fa48("1852") ? true : (stryCov_9fa48("1852", "1853", "1854"), message || (stryMutAct_9fa48("1855") ? `` : (stryCov_9fa48("1855"), `Validation failed for field '${field}': expected ${expected}, got ${value}`))));
      this.name = stryMutAct_9fa48("1856") ? "" : (stryCov_9fa48("1856"), 'ValidationError');
      this.field = field;
      this.value = value;
      this.expected = expected;
    }
  }
}

/**
 * Error codes for different types of scraping errors
 */
export enum ErrorCodes {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SELECTOR_NOT_FOUND = 'SELECTOR_NOT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  RECIPE_ERROR = 'RECIPE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error boundary for catching and handling errors gracefully
 */
export class ErrorBoundary {
  private errorHandlers = new Map<string, (error: Error) => void>();
  private fallbackHandler?: (error: Error) => void;

  /**
   * Register an error handler for a specific error type
   */
  registerHandler(errorType: string, handler: (error: Error) => void): void {
    if (stryMutAct_9fa48("1857")) {
      {}
    } else {
      stryCov_9fa48("1857");
      this.errorHandlers.set(errorType, handler);
    }
  }

  /**
   * Set a fallback error handler
   */
  setFallbackHandler(handler: (error: Error) => void): void {
    if (stryMutAct_9fa48("1858")) {
      {}
    } else {
      stryCov_9fa48("1858");
      this.fallbackHandler = handler;
    }
  }

  /**
   * Execute a function within the error boundary
   */
  async execute<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    if (stryMutAct_9fa48("1859")) {
      {}
    } else {
      stryCov_9fa48("1859");
      try {
        if (stryMutAct_9fa48("1860")) {
          {}
        } else {
          stryCov_9fa48("1860");
          return await fn();
        }
      } catch (error) {
        if (stryMutAct_9fa48("1861")) {
          {}
        } else {
          stryCov_9fa48("1861");
          await this.handleError(error as Error, context);
          throw error;
        }
      }
    }
  }

  /**
   * Handle an error using registered handlers
   */
  private async handleError(error: Error, context?: string): Promise<void> {
    if (stryMutAct_9fa48("1862")) {
      {}
    } else {
      stryCov_9fa48("1862");
      const errorType = this.getErrorType(error);

      // Try to find a specific handler
      const handler = this.errorHandlers.get(errorType);
      if (stryMutAct_9fa48("1864") ? false : stryMutAct_9fa48("1863") ? true : (stryCov_9fa48("1863", "1864"), handler)) {
        if (stryMutAct_9fa48("1865")) {
          {}
        } else {
          stryCov_9fa48("1865");
          try {
            if (stryMutAct_9fa48("1866")) {
              {}
            } else {
              stryCov_9fa48("1866");
              handler(error);
              return;
            }
          } catch (handlerError) {
            if (stryMutAct_9fa48("1867")) {
              {}
            } else {
              stryCov_9fa48("1867");
              console.error(stryMutAct_9fa48("1868") ? "" : (stryCov_9fa48("1868"), 'Error handler failed:'), handlerError);
            }
          }
        }
      }

      // Use fallback handler if available
      if (stryMutAct_9fa48("1870") ? false : stryMutAct_9fa48("1869") ? true : (stryCov_9fa48("1869", "1870"), this.fallbackHandler)) {
        if (stryMutAct_9fa48("1871")) {
          {}
        } else {
          stryCov_9fa48("1871");
          try {
            if (stryMutAct_9fa48("1872")) {
              {}
            } else {
              stryCov_9fa48("1872");
              this.fallbackHandler(error);
            }
          } catch (fallbackError) {
            if (stryMutAct_9fa48("1873")) {
              {}
            } else {
              stryCov_9fa48("1873");
              console.error(stryMutAct_9fa48("1874") ? "" : (stryCov_9fa48("1874"), 'Fallback error handler failed:'), fallbackError);
            }
          }
        }
      }

      // Log error if no handlers worked
      console.error(stryMutAct_9fa48("1875") ? `` : (stryCov_9fa48("1875"), `Unhandled error in ${stryMutAct_9fa48("1878") ? context && 'unknown context' : stryMutAct_9fa48("1877") ? false : stryMutAct_9fa48("1876") ? true : (stryCov_9fa48("1876", "1877", "1878"), context || (stryMutAct_9fa48("1879") ? "" : (stryCov_9fa48("1879"), 'unknown context')))}:`), error);
    }
  }

  /**
   * Determine the type of error
   */
  private getErrorType(error: Error): string {
    if (stryMutAct_9fa48("1880")) {
      {}
    } else {
      stryCov_9fa48("1880");
      if (stryMutAct_9fa48("1882") ? false : stryMutAct_9fa48("1881") ? true : (stryCov_9fa48("1881", "1882"), error instanceof ScrapingErrorImpl)) {
        if (stryMutAct_9fa48("1883")) {
          {}
        } else {
          stryCov_9fa48("1883");
          return error.code;
        }
      }
      if (stryMutAct_9fa48("1885") ? false : stryMutAct_9fa48("1884") ? true : (stryCov_9fa48("1884", "1885"), error instanceof ValidationErrorImpl)) {
        if (stryMutAct_9fa48("1886")) {
          {}
        } else {
          stryCov_9fa48("1886");
          return ErrorCodes.VALIDATION_ERROR;
        }
      }
      if (stryMutAct_9fa48("1889") ? error.name === 'NetworkError' && error.message.includes('network') : stryMutAct_9fa48("1888") ? false : stryMutAct_9fa48("1887") ? true : (stryCov_9fa48("1887", "1888", "1889"), (stryMutAct_9fa48("1891") ? error.name !== 'NetworkError' : stryMutAct_9fa48("1890") ? false : (stryCov_9fa48("1890", "1891"), error.name === (stryMutAct_9fa48("1892") ? "" : (stryCov_9fa48("1892"), 'NetworkError')))) || error.message.includes(stryMutAct_9fa48("1893") ? "" : (stryCov_9fa48("1893"), 'network')))) {
        if (stryMutAct_9fa48("1894")) {
          {}
        } else {
          stryCov_9fa48("1894");
          return ErrorCodes.NETWORK_ERROR;
        }
      }
      if (stryMutAct_9fa48("1897") ? error.name === 'TimeoutError' && error.message.includes('timeout') : stryMutAct_9fa48("1896") ? false : stryMutAct_9fa48("1895") ? true : (stryCov_9fa48("1895", "1896", "1897"), (stryMutAct_9fa48("1899") ? error.name !== 'TimeoutError' : stryMutAct_9fa48("1898") ? false : (stryCov_9fa48("1898", "1899"), error.name === (stryMutAct_9fa48("1900") ? "" : (stryCov_9fa48("1900"), 'TimeoutError')))) || error.message.includes(stryMutAct_9fa48("1901") ? "" : (stryCov_9fa48("1901"), 'timeout')))) {
        if (stryMutAct_9fa48("1902")) {
          {}
        } else {
          stryCov_9fa48("1902");
          return ErrorCodes.TIMEOUT_ERROR;
        }
      }
      return ErrorCodes.UNKNOWN_ERROR;
    }
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export class RetryManager {
  private defaultConfig: RetryConfig = stryMutAct_9fa48("1903") ? {} : (stryCov_9fa48("1903"), {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: stryMutAct_9fa48("1904") ? [] : (stryCov_9fa48("1904"), [ErrorCodes.NETWORK_ERROR, ErrorCodes.RATE_LIMIT_ERROR, ErrorCodes.TIMEOUT_ERROR])
  });

  /**
   * Execute a function with retry logic
   */
  async executeWithRetry<T>(fn: () => Promise<T>, config?: Partial<RetryConfig>, context?: string): Promise<T> {
    if (stryMutAct_9fa48("1905")) {
      {}
    } else {
      stryCov_9fa48("1905");
      const finalConfig = stryMutAct_9fa48("1906") ? {} : (stryCov_9fa48("1906"), {
        ...this.defaultConfig,
        ...config
      });
      let lastError: Error;
      let delay = finalConfig.baseDelay;
      for (let attempt = 1; stryMutAct_9fa48("1909") ? attempt > finalConfig.maxAttempts : stryMutAct_9fa48("1908") ? attempt < finalConfig.maxAttempts : stryMutAct_9fa48("1907") ? false : (stryCov_9fa48("1907", "1908", "1909"), attempt <= finalConfig.maxAttempts); stryMutAct_9fa48("1910") ? attempt-- : (stryCov_9fa48("1910"), attempt++)) {
        if (stryMutAct_9fa48("1911")) {
          {}
        } else {
          stryCov_9fa48("1911");
          try {
            if (stryMutAct_9fa48("1912")) {
              {}
            } else {
              stryCov_9fa48("1912");
              return await fn();
            }
          } catch (error) {
            if (stryMutAct_9fa48("1913")) {
              {}
            } else {
              stryCov_9fa48("1913");
              lastError = error as Error;

              // Check if error is retryable
              if (stryMutAct_9fa48("1916") ? false : stryMutAct_9fa48("1915") ? true : stryMutAct_9fa48("1914") ? this.isRetryableError(error as Error, finalConfig.retryableErrors) : (stryCov_9fa48("1914", "1915", "1916"), !this.isRetryableError(error as Error, finalConfig.retryableErrors))) {
                if (stryMutAct_9fa48("1917")) {
                  {}
                } else {
                  stryCov_9fa48("1917");
                  throw error;
                }
              }

              // Check if we've reached max attempts
              if (stryMutAct_9fa48("1920") ? attempt !== finalConfig.maxAttempts : stryMutAct_9fa48("1919") ? false : stryMutAct_9fa48("1918") ? true : (stryCov_9fa48("1918", "1919", "1920"), attempt === finalConfig.maxAttempts)) {
                if (stryMutAct_9fa48("1921")) {
                  {}
                } else {
                  stryCov_9fa48("1921");
                  throw new ScrapingErrorImpl(stryMutAct_9fa48("1922") ? `` : (stryCov_9fa48("1922"), `Operation failed after ${finalConfig.maxAttempts} attempts: ${lastError.message}`), ErrorCodes.UNKNOWN_ERROR, stryMutAct_9fa48("1923") ? true : (stryCov_9fa48("1923"), false), stryMutAct_9fa48("1924") ? {} : (stryCov_9fa48("1924"), {
                    attempts: attempt,
                    lastError: lastError.message,
                    context
                  }));
                }
              }

              // Log retry attempt
              console.warn(stryMutAct_9fa48("1925") ? `` : (stryCov_9fa48("1925"), `Retry attempt ${attempt}/${finalConfig.maxAttempts} for ${stryMutAct_9fa48("1928") ? context && 'operation' : stryMutAct_9fa48("1927") ? false : stryMutAct_9fa48("1926") ? true : (stryCov_9fa48("1926", "1927", "1928"), context || (stryMutAct_9fa48("1929") ? "" : (stryCov_9fa48("1929"), 'operation')))} after ${delay}ms`));

              // Wait before retry
              await this.delay(delay);

              // Calculate next delay with exponential backoff
              delay = stryMutAct_9fa48("1930") ? Math.max(delay * finalConfig.backoffMultiplier, finalConfig.maxDelay) : (stryCov_9fa48("1930"), Math.min(stryMutAct_9fa48("1931") ? delay / finalConfig.backoffMultiplier : (stryCov_9fa48("1931"), delay * finalConfig.backoffMultiplier), finalConfig.maxDelay));
            }
          }
        }
      }
      throw lastError!;
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: Error, retryableErrors: string[]): boolean {
    if (stryMutAct_9fa48("1932")) {
      {}
    } else {
      stryCov_9fa48("1932");
      if (stryMutAct_9fa48("1934") ? false : stryMutAct_9fa48("1933") ? true : (stryCov_9fa48("1933", "1934"), error instanceof ScrapingErrorImpl)) {
        if (stryMutAct_9fa48("1935")) {
          {}
        } else {
          stryCov_9fa48("1935");
          return stryMutAct_9fa48("1938") ? error.retryable || retryableErrors.includes(error.code) : stryMutAct_9fa48("1937") ? false : stryMutAct_9fa48("1936") ? true : (stryCov_9fa48("1936", "1937", "1938"), error.retryable && retryableErrors.includes(error.code));
        }
      }

      // Check error name and message for retryable patterns
      const errorText = stryMutAct_9fa48("1939") ? `${error.name} ${error.message}`.toUpperCase() : (stryCov_9fa48("1939"), (stryMutAct_9fa48("1940") ? `` : (stryCov_9fa48("1940"), `${error.name} ${error.message}`)).toLowerCase());
      return stryMutAct_9fa48("1941") ? retryableErrors.every(code => errorText.includes(code.toLowerCase().replace('_', ' '))) : (stryCov_9fa48("1941"), retryableErrors.some(stryMutAct_9fa48("1942") ? () => undefined : (stryCov_9fa48("1942"), code => errorText.includes(stryMutAct_9fa48("1943") ? code.toUpperCase().replace('_', ' ') : (stryCov_9fa48("1943"), code.toLowerCase().replace(stryMutAct_9fa48("1944") ? "" : (stryCov_9fa48("1944"), '_'), stryMutAct_9fa48("1945") ? "" : (stryCov_9fa48("1945"), ' ')))))));
    }
  }

  /**
   * Delay execution for a specified time
   */
  private delay(ms: number): Promise<void> {
    if (stryMutAct_9fa48("1946")) {
      {}
    } else {
      stryCov_9fa48("1946");
      return new Promise(stryMutAct_9fa48("1947") ? () => undefined : (stryCov_9fa48("1947"), resolve => setTimeout(resolve, ms)));
    }
  }
}

/**
 * Global error boundary instance
 */
export const errorBoundary = new ErrorBoundary();

/**
 * Global retry manager instance
 */
export const retryManager = new RetryManager();

/**
 * Error factory for creating consistent error instances
 */
export class ErrorFactory {
  static createScrapingError(message: string, code: ErrorCodes, retryable: boolean = stryMutAct_9fa48("1948") ? true : (stryCov_9fa48("1948"), false), context?: Record<string, unknown>): ScrapingErrorImpl {
    if (stryMutAct_9fa48("1949")) {
      {}
    } else {
      stryCov_9fa48("1949");
      return new ScrapingErrorImpl(message, code, retryable, context);
    }
  }
  static createValidationError(field: string, value: unknown, expected: unknown, message?: string): ValidationErrorImpl {
    if (stryMutAct_9fa48("1950")) {
      {}
    } else {
      stryCov_9fa48("1950");
      return new ValidationErrorImpl(field, value, expected, message);
    }
  }
  static createNetworkError(message: string, context?: Record<string, unknown>): ScrapingErrorImpl {
    if (stryMutAct_9fa48("1951")) {
      {}
    } else {
      stryCov_9fa48("1951");
      return new ScrapingErrorImpl(message, ErrorCodes.NETWORK_ERROR, stryMutAct_9fa48("1952") ? false : (stryCov_9fa48("1952"), true), context);
    }
  }
  static createParseError(message: string, context?: Record<string, unknown>): ScrapingErrorImpl {
    if (stryMutAct_9fa48("1953")) {
      {}
    } else {
      stryCov_9fa48("1953");
      return new ScrapingErrorImpl(message, ErrorCodes.PARSE_ERROR, stryMutAct_9fa48("1954") ? true : (stryCov_9fa48("1954"), false), context);
    }
  }
  static createTimeoutError(message: string, context?: Record<string, unknown>): ScrapingErrorImpl {
    if (stryMutAct_9fa48("1955")) {
      {}
    } else {
      stryCov_9fa48("1955");
      return new ScrapingErrorImpl(message, ErrorCodes.TIMEOUT_ERROR, stryMutAct_9fa48("1956") ? false : (stryCov_9fa48("1956"), true), context);
    }
  }
}