import { toFormattedError, formatForLog } from '../helpers/errors';

describe('helpers/errors', () => {
  describe('toFormattedError', () => {
    it('should format Error instances', () => {
      const error = new Error('Test error message');
      const result = toFormattedError(error);

      expect(result).toEqual({
        message: 'Test error message',
        code: undefined,
        retryable: undefined,
        details: undefined,
      });
    });

    it('should format Error instances with defaults', () => {
      const error = new Error('Test error message');
      const defaults = { code: 'TEST_ERROR', retryable: true };
      const result = toFormattedError(error, defaults);

      expect(result).toEqual({
        message: 'Test error message',
        code: 'TEST_ERROR',
        retryable: true,
        details: undefined,
      });
    });

    it('should format string errors', () => {
      const result = toFormattedError('String error');

      expect(result).toEqual({
        message: 'String error',
        code: undefined,
        retryable: undefined,
        details: undefined,
      });
    });

    it('should format string errors with defaults', () => {
      const defaults = { code: 'STRING_ERROR', retryable: false };
      const result = toFormattedError('String error', defaults);

      expect(result).toEqual({
        message: 'String error',
        code: 'STRING_ERROR',
        retryable: false,
        details: undefined,
      });
    });

    it('should format object errors as JSON', () => {
      const error = { type: 'validation', field: 'email' };
      const result = toFormattedError(error);

      expect(result).toEqual({
        message: '{"type":"validation","field":"email"}',
        code: undefined,
        retryable: undefined,
        details: undefined,
      });
    });

    it('should format object errors with defaults', () => {
      const error = { type: 'validation', field: 'email' };
      const defaults = { code: 'VALIDATION_ERROR' };
      const result = toFormattedError(error, defaults);

      expect(result).toEqual({
        message: '{"type":"validation","field":"email"}',
        code: 'VALIDATION_ERROR',
        retryable: undefined,
        details: undefined,
      });
    });

    it('should handle circular reference errors', () => {
      const circular: any = {};
      circular.self = circular;

      const result = toFormattedError(circular);

      expect(result).toEqual({
        message: 'Unknown error',
        code: undefined,
        retryable: undefined,
        details: undefined,
      });
    });

    it('should handle null and undefined', () => {
      expect(toFormattedError(null)).toEqual({
        message: 'null',
        code: undefined,
        retryable: undefined,
        details: undefined,
      });

      expect(toFormattedError(undefined)).toEqual({
        message: undefined,
        code: undefined,
        retryable: undefined,
        details: undefined,
      });
    });

    it('should handle number errors', () => {
      const result = toFormattedError(42);

      expect(result).toEqual({
        message: '42',
        code: undefined,
        retryable: undefined,
        details: undefined,
      });
    });

    it('should handle boolean errors', () => {
      const result = toFormattedError(true);

      expect(result).toEqual({
        message: 'true',
        code: undefined,
        retryable: undefined,
        details: undefined,
      });
    });
  });

  describe('formatForLog', () => {
    it('should format Error instances for logging', () => {
      const error = new Error('Test error');
      const result = formatForLog(error);

      expect(result).toContain('Test error');
      expect(result).toContain('Error:');
    });

    it('should format string errors for logging', () => {
      const result = formatForLog('String error');

      expect(result).toBe('String error');
    });

    it('should format object errors for logging', () => {
      const error = { type: 'validation', field: 'email' };
      const result = formatForLog(error);

      expect(result).toContain('validation');
      expect(result).toContain('email');
    });

    it('should handle null and undefined for logging', () => {
      expect(formatForLog(null)).toBe('null');
      expect(formatForLog(undefined)).toBe(undefined);
    });

    it('should handle circular reference errors for logging', () => {
      const circular: any = {};
      circular.self = circular;

      const result = formatForLog(circular);

      expect(result).toBe('Unknown error');
    });
  });

});
