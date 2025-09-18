import express from 'express';
import { DomainError } from '../../lib/domain/errors';

export function errorHandler(): express.ErrorRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err: unknown, _req, res, _next) => {
    if (err instanceof DomainError) {
      return res.status(err.status).json({
        success: false,
        code: err.code,
        error: err.message,
        details: err.details,
      });
    }
    // Fallback
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      error: 'Internal server error',
    });
  };
}


