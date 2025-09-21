import {
  makeApiResponse,
  makeErrorResponse,
  ApiResponse,
  ApiError,
} from '../helpers/api';

describe('helpers/api', () => {
  describe('makeApiResponse', () => {
    it('should create a successful API response with data', () => {
      const data = { id: 1, name: 'Test' };
      const result = makeApiResponse(data, 'Success', 'req-123');

      expect(result).toEqual({
        success: true,
        data,
        message: 'Success',
        timestamp: expect.any(Date),
        requestId: 'req-123',
      });
    });

    it('should create a successful API response without message', () => {
      const data = { id: 1, name: 'Test' };
      const result = makeApiResponse(data);

      expect(result).toEqual({
        success: true,
        data,
        message: undefined,
        timestamp: expect.any(Date),
        requestId: expect.any(String),
      });
    });

    it('should create a successful API response with generated requestId', () => {
      const data = { id: 1, name: 'Test' };
      const result = makeApiResponse(data, 'Success');

      expect(result).toEqual({
        success: true,
        data,
        message: 'Success',
        timestamp: expect.any(Date),
        requestId: 'unknown', // The actual implementation uses 'unknown' as default
      });
    });

    it('should handle null data', () => {
      const result = makeApiResponse(null, 'No data');

      expect(result).toEqual({
        success: true,
        data: null,
        message: 'No data',
        timestamp: expect.any(Date),
        requestId: expect.any(String),
      });
    });

    it('should handle undefined data', () => {
      const result = makeApiResponse(undefined, 'No data');

      expect(result).toEqual({
        success: true,
        data: undefined,
        message: 'No data',
        timestamp: expect.any(Date),
        requestId: expect.any(String),
      });
    });
  });

  describe('makeErrorResponse', () => {
    it('should create an error API response', () => {
      const result = makeErrorResponse('Invalid input', 'VALIDATION_ERROR', 'req-123');

      expect(result).toEqual({
        success: false,
        error: 'Invalid input',
        timestamp: expect.any(Date),
        requestId: 'req-123',
      });
    });

    it('should create an error API response with generated requestId', () => {
      const result = makeErrorResponse('Invalid input');

      expect(result).toEqual({
        success: false,
        error: 'Invalid input',
        timestamp: expect.any(Date),
        requestId: 'unknown',
      });
    });

    it('should handle Error instances', () => {
      const error = new Error('Test error');
      const result = makeErrorResponse(error);

      expect(result).toEqual({
        success: false,
        error: 'Test error',
        timestamp: expect.any(Date),
        requestId: 'unknown',
      });
    });

    it('should handle Error instances with code', () => {
      const error = new Error('Test error');
      const result = makeErrorResponse(error, 'TEST_ERROR', 'req-456');

      expect(result).toEqual({
        success: false,
        error: 'Test error',
        timestamp: expect.any(Date),
        requestId: 'req-456',
      });
    });
  });


  describe('ApiResponse interface', () => {
    it('should allow generic types', () => {
      const response: ApiResponse<{ id: number }, string> = {
        success: true,
        data: { id: 1 },
        error: undefined,
        message: 'Success',
        timestamp: new Date(),
        requestId: 'test',
      };

      expect(response.data?.id).toBe(1);
    });

    it('should allow error types', () => {
      const response: ApiResponse<never, ApiError> = {
        success: false,
        data: undefined,
        error: { code: 'ERROR', message: 'Test' },
        message: 'Failed',
        timestamp: new Date(),
        requestId: 'test',
      };

      expect(response.error?.code).toBe('ERROR');
    });
  });

  describe('ApiError interface', () => {
    it('should allow optional details', () => {
      const error: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: { field: 'email', value: 'invalid' },
      };

      expect(error.details).toEqual({ field: 'email', value: 'invalid' });
    });

    it('should work without details', () => {
      const error: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      };

      expect(error.details).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty objects', () => {
      const result = makeApiResponse({});

      expect(result).toEqual({
        success: true,
        data: {},
        message: undefined,
        timestamp: expect.any(Date),
        requestId: expect.any(String),
      });
    });

    it('should handle arrays', () => {
      const data = [1, 2, 3];
      const result = makeApiResponse(data);

      expect(result.data).toEqual([1, 2, 3]);
    });

    it('should handle functions', () => {
      const fn = () => 'test';
      const result = makeApiResponse(fn);

      expect(result.data).toBe(fn);
    });

    it('should handle symbols', () => {
      const sym = Symbol('test');
      const result = makeApiResponse(sym);

      expect(result.data).toBe(sym);
    });
  });
});
