import { ScrapingError, ValidationError, RetryConfig } from '../types';

/**
 * Custom error classes for better error handling
 */
export class ScrapingErrorImpl extends Error implements ScrapingError {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly retryable: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    retryable: boolean = false,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ScrapingError';
    this.code = code;
    this.retryable = retryable;
    this.context = context;
    this.timestamp = new Date();
  }
}

export class ValidationErrorImpl extends Error implements ValidationError {
  public readonly field: string;
  public readonly value: unknown;
  public readonly expected: unknown;

  constructor(field: string, value: unknown, expected: unknown, message?: string) {
    super(message || `Validation failed for field '${field}': expected ${expected}, got ${value}`);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.expected = expected;
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
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
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
    this.errorHandlers.set(errorType, handler);
  }

  /**
   * Set a fallback error handler
   */
  setFallbackHandler(handler: (error: Error) => void): void {
    this.fallbackHandler = handler;
  }

  /**
   * Execute a function within the error boundary
   */
  async execute<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      await this.handleError(error as Error, context);
      throw error;
    }
  }

  /**
   * Handle an error using registered handlers
   */
  private async handleError(error: Error, context?: string): Promise<void> {
    const errorType = this.getErrorType(error);

    // Try to find a specific handler
    const handler = this.errorHandlers.get(errorType);
    if (handler) {
      try {
        handler(error);
        return;
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    }

    // Use fallback handler if available
    if (this.fallbackHandler) {
      try {
        this.fallbackHandler(error);
      } catch (fallbackError) {
        console.error('Fallback error handler failed:', fallbackError);
      }
    }

    // Log error if no handlers worked
    console.error(`Unhandled error in ${context || 'unknown context'}:`, error);
  }

  /**
   * Determine the type of error
   */
  private getErrorType(error: Error): string {
    if (error instanceof ScrapingErrorImpl) {
      return error.code;
    }
    if (error instanceof ValidationErrorImpl) {
      return ErrorCodes.VALIDATION_ERROR;
    }
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return ErrorCodes.NETWORK_ERROR;
    }
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return ErrorCodes.TIMEOUT_ERROR;
    }
    return ErrorCodes.UNKNOWN_ERROR;
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export class RetryManager {
  private defaultConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: [
      ErrorCodes.NETWORK_ERROR,
      ErrorCodes.RATE_LIMIT_ERROR,
      ErrorCodes.TIMEOUT_ERROR,
    ],
  };

  /**
   * Execute a function with retry logic
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    config?: Partial<RetryConfig>,
    context?: string,
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: Error;
    let delay = finalConfig.baseDelay;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (!this.isRetryableError(error as Error, finalConfig.retryableErrors)) {
          throw error;
        }

        // Check if we've reached max attempts
        if (attempt === finalConfig.maxAttempts) {
          throw new ScrapingErrorImpl(
            `Operation failed after ${finalConfig.maxAttempts} attempts: ${lastError.message}`,
            ErrorCodes.UNKNOWN_ERROR,
            false,
            { attempts: attempt, lastError: lastError.message, context },
          );
        }

        // Log retry attempt
        console.warn(
          `Retry attempt ${attempt}/${finalConfig.maxAttempts} for ${context || 'operation'} after ${delay}ms`,
        );

        // Wait before retry
        await this.delay(delay);

        // Calculate next delay with exponential backoff
        delay = Math.min(delay * finalConfig.backoffMultiplier, finalConfig.maxDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: Error, retryableErrors: string[]): boolean {
    if (error instanceof ScrapingErrorImpl) {
      return error.retryable && retryableErrors.includes(error.code);
    }

    // Check error name and message for retryable patterns
    const errorText = `${error.name} ${error.message}`.toLowerCase();
    return retryableErrors.some(code =>
      errorText.includes(code.toLowerCase().replace('_', ' ')),
    );
  }

  /**
   * Delay execution for a specified time
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
  static createScrapingError(
    message: string,
    code: ErrorCodes,
    retryable: boolean = false,
    context?: Record<string, unknown>,
  ): ScrapingErrorImpl {
    return new ScrapingErrorImpl(message, code, retryable, context);
  }

  static createValidationError(
    field: string,
    value: unknown,
    expected: unknown,
    message?: string,
  ): ValidationErrorImpl {
    return new ValidationErrorImpl(field, value, expected, message);
  }

  static createNetworkError(message: string, context?: Record<string, unknown>): ScrapingErrorImpl {
    return new ScrapingErrorImpl(message, ErrorCodes.NETWORK_ERROR, true, context);
  }

  static createParseError(message: string, context?: Record<string, unknown>): ScrapingErrorImpl {
    return new ScrapingErrorImpl(message, ErrorCodes.PARSE_ERROR, false, context);
  }

  static createTimeoutError(message: string, context?: Record<string, unknown>): ScrapingErrorImpl {
    return new ScrapingErrorImpl(message, ErrorCodes.TIMEOUT_ERROR, true, context);
  }
}
