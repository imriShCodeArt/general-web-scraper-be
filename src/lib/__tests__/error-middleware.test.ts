import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../app/middleware/error-handler';
import { DomainValidationError, StorageEntryNotFoundError } from '../domain/errors';

describe('Error middleware mapping', () => {
  const app = express();
  app.get('/validation', (_req, _res, next) => next(new DomainValidationError('Invalid request body', [{ path: 'siteUrl', message: 'required' }])));
  app.get('/notfound', (_req, _res, next) => next(new StorageEntryNotFoundError('abc123')));
  app.get('/boom', (_req, _res, next) => next(new Error('boom')));
  app.use(errorHandler());

  it('maps DomainValidationError to 400 with code and details', async () => {
    const res = await request(app).get('/validation');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, code: 'VALIDATION_ERROR', error: expect.any(String), details: expect.anything() });
  });

  it('maps StorageEntryNotFoundError to 404 with code', async () => {
    const res = await request(app).get('/notfound');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, code: 'STORAGE_ENTRY_NOT_FOUND', error: expect.any(String) });
  });

  it('maps unknown errors to 500 with INTERNAL_ERROR', async () => {
    const res = await request(app).get('/boom');
    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ success: false, code: 'INTERNAL_ERROR', error: expect.any(String) });
  });
});


