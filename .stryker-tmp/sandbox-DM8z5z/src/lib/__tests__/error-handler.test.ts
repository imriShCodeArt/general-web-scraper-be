// @ts-nocheck
import {
  ScrapingErrorImpl,
  ValidationErrorImpl,
  ErrorBoundary,
  RetryManager,
  ErrorFactory,
  ErrorCodes,
  errorBoundary,
  retryManager,
} from '../error-handler';

describe('ScrapingErrorImpl', () => {
  it('should create a scraping error with all properties', () => {
    const error = new ScrapingErrorImpl('Test error message', 'TEST_ERROR', true, {
      url: 'https://test.com',
    });

    expect(error.message).toBe('Test error message');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.retryable).toBe(true);
    expect(error.context).toEqual({ url: 'https://test.com' });
    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.name).toBe('ScrapingError');
  });

  it('should create a non-retryable error by default', () => {
    const error = new ScrapingErrorImpl('Test error', 'TEST_ERROR');
    expect(error.retryable).toBe(false);
  });
});

describe('ValidationErrorImpl', () => {
  it('should create a validation error with all properties', () => {
    const error = new ValidationErrorImpl(
      'title',
      'short',
      'at least 10 characters',
      'Custom message',
    );

    expect(error.message).toBe('Custom message');
    expect(error.field).toBe('title');
    expect(error.value).toBe('short');
    expect(error.expected).toBe('at least 10 characters');
    expect(error.name).toBe('ValidationError');
  });

  it('should generate default message when none provided', () => {
    const error = new ValidationErrorImpl('sku', 'invalid', 'format: ABC-123');
    expect(error.message).toContain('Validation failed for field');
    expect(error.message).toContain('sku');
  });
});

describe('ErrorBoundary', () => {
  let boundary: ErrorBoundary;

  beforeEach(() => {
    boundary = new ErrorBoundary();
  });

  it('should execute function successfully', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await boundary.execute(fn, 'test-context');

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalled();
  });

  it('should handle errors and call registered handlers', async () => {
    const mockHandler = jest.fn();
    const testError = new ScrapingErrorImpl('Test error', 'TEST_ERROR');

    boundary.registerHandler('TEST_ERROR', mockHandler);

    const fn = jest.fn().mockRejectedValue(testError);

    await expect(boundary.execute(fn, 'test-context')).rejects.toThrow(testError);
    expect(mockHandler).toHaveBeenCalledWith(testError);
  });

  it('should use fallback handler when specific handler not found', async () => {
    const fallbackHandler = jest.fn();
    const testError = new Error('Generic error');

    boundary.setFallbackHandler(fallbackHandler);

    const fn = jest.fn().mockRejectedValue(testError);

    await expect(boundary.execute(fn, 'test-context')).rejects.toThrow(testError);
    expect(fallbackHandler).toHaveBeenCalledWith(testError);
  });

  it('should handle handler errors gracefully', async () => {
    const failingHandler = jest.fn().mockImplementation(() => {
      throw new Error('Handler failed');
    });

    const testError = new ScrapingErrorImpl('Test error', 'TEST_ERROR');
    boundary.registerHandler('TEST_ERROR', failingHandler);

    const fn = jest.fn().mockRejectedValue(testError);

    // Should not throw, just log the handler error
    await expect(boundary.execute(fn, 'test-context')).rejects.toThrow(testError);
  });

  it('should determine error type correctly', async () => {
    // Create errors that will be properly detected by the error boundary
    const networkError = new Error('Network error');
    networkError.name = 'NetworkError'; // Set the name to match detection logic

    const validationError = new ValidationErrorImpl('field', 'value', 'expected');

    const networkFn = jest.fn().mockRejectedValue(networkError);
    const validationFn = jest.fn().mockRejectedValue(validationError);

    // Register handlers for both error types
    const networkHandler = jest.fn();
    const validationHandler = jest.fn();

    boundary.registerHandler(ErrorCodes.NETWORK_ERROR, networkHandler);
    boundary.registerHandler(ErrorCodes.VALIDATION_ERROR, validationHandler);

    // Execute both functions and verify handlers are called
    await expect(boundary.execute(networkFn, 'network-test')).rejects.toThrow(networkError);
    await expect(boundary.execute(validationFn, 'validation-test')).rejects.toThrow(
      validationError,
    );

    // Verify that handlers were called with the correct errors
    expect(networkHandler).toHaveBeenCalledWith(networkError);
    expect(validationHandler).toHaveBeenCalledWith(validationError);
  });
});

describe('RetryManager', () => {
  let manager: RetryManager;

  beforeEach(() => {
    manager = new RetryManager();
  });

  it('should execute function successfully on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await manager.executeWithRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors', async () => {
    let attemptCount = 0;
    const fn = jest.fn().mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new ScrapingErrorImpl('Network error', ErrorCodes.NETWORK_ERROR, true);
      }
      return 'success';
    });

    const result = await manager.executeWithRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry on non-retryable errors', async () => {
    const fn = jest
      .fn()
      .mockRejectedValue(
        new ScrapingErrorImpl('Validation error', ErrorCodes.VALIDATION_ERROR, false),
      );

    await expect(manager.executeWithRetry(fn)).rejects.toThrow('Validation error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should respect max attempts configuration', async () => {
    const fn = jest
      .fn()
      .mockRejectedValue(new ScrapingErrorImpl('Network error', ErrorCodes.NETWORK_ERROR, true));

    const config = { maxAttempts: 2 };

    await expect(manager.executeWithRetry(fn, config)).rejects.toThrow(
      'Operation failed after 2 attempts',
    );
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should use exponential backoff', async () => {
    const startTime = Date.now();
    let attemptCount = 0;

    const fn = jest.fn().mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new ScrapingErrorImpl('Network error', ErrorCodes.NETWORK_ERROR, true);
      }
      return 'success';
    });

    const config = { baseDelay: 100, maxDelay: 1000 };

    await manager.executeWithRetry(fn, config);

    const totalTime = Date.now() - startTime;
    // Should have delays of 100ms and 200ms (exponential backoff)
    expect(totalTime).toBeGreaterThan(250);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should handle custom retryable error codes', async () => {
    const fn = jest
      .fn()
      .mockRejectedValue(
        new ScrapingErrorImpl('Rate limit error', ErrorCodes.RATE_LIMIT_ERROR, true),
      );

    const config = {
      retryableErrors: [ErrorCodes.RATE_LIMIT_ERROR],
      maxAttempts: 2,
    };

    await expect(manager.executeWithRetry(fn, config)).rejects.toThrow(
      'Operation failed after 2 attempts',
    );
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('ErrorFactory', () => {
  it('should create network errors', () => {
    const error = ErrorFactory.createNetworkError('Connection failed', { url: 'https://test.com' });

    expect(error.message).toBe('Connection failed');
    expect(error.code).toBe(ErrorCodes.NETWORK_ERROR);
    expect(error.retryable).toBe(true);
    expect(error.context).toEqual({ url: 'https://test.com' });
  });

  it('should create parse errors', () => {
    const error = ErrorFactory.createParseError('Invalid HTML', { selector: '.product' });

    expect(error.message).toBe('Invalid HTML');
    expect(error.code).toBe(ErrorCodes.PARSE_ERROR);
    expect(error.retryable).toBe(false);
    expect(error.context).toEqual({ selector: '.product' });
  });

  it('should create timeout errors', () => {
    const error = ErrorFactory.createTimeoutError('Request timed out', { timeout: 5000 });

    expect(error.message).toBe('Request timed out');
    expect(error.code).toBe(ErrorCodes.TIMEOUT_ERROR);
    expect(error.retryable).toBe(true);
    expect(error.context).toEqual({ timeout: 5000 });
  });

  it('should create validation errors', () => {
    const error = ErrorFactory.createValidationError('title', 'short', 'at least 10 characters');

    expect(error.field).toBe('title');
    expect(error.value).toBe('short');
    expect(error.expected).toBe('at least 10 characters');
  });
});

describe('Global Instances', () => {
  it('should provide global error boundary instance', () => {
    expect(errorBoundary).toBeInstanceOf(ErrorBoundary);
  });

  it('should provide global retry manager instance', () => {
    expect(retryManager).toBeInstanceOf(RetryManager);
  });
});

describe('Error Codes', () => {
  it('should have all expected error codes', () => {
    expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(ErrorCodes.PARSE_ERROR).toBe('PARSE_ERROR');
    expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCodes.RATE_LIMIT_ERROR).toBe('RATE_LIMIT_ERROR');
    expect(ErrorCodes.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
    expect(ErrorCodes.SELECTOR_NOT_FOUND).toBe('SELECTOR_NOT_FOUND');
    expect(ErrorCodes.PRODUCT_NOT_FOUND).toBe('PRODUCT_NOT_FOUND');
    expect(ErrorCodes.RECIPE_ERROR).toBe('RECIPE_ERROR');
    expect(ErrorCodes.STORAGE_ERROR).toBe('STORAGE_ERROR');
    expect(ErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
  });
});
