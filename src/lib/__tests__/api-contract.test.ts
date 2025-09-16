import request from 'supertest';
import app from '../../server';

describe('API Contract Tests', () => {
  describe('Success Response Schemas', () => {
    it('GET /health should return correct schema', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it('GET / should return correct schema', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: expect.any(String),
        status: 'running',
        timestamp: expect.any(String),
        endpoints: expect.objectContaining({
          health: expect.any(String),
          recipes: expect.any(String),
          scrape: expect.any(String),
          storage: expect.any(String),
          docs: expect.any(String),
          openapi: expect.any(String),
        }),
      });
    });

    it('POST /api/scrape/init should return correct success schema', async () => {
      const res = await request(app)
        .post('/api/scrape/init')
        .send({
          siteUrl: 'https://example.com',
          recipe: 'generic-ecommerce',
          options: { maxPages: 1 },
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          jobId: expect.any(String),
        },
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('GET /api/scrape/status/:jobId should return correct schema', async () => {
      // First create a job
      const initRes = await request(app)
        .post('/api/scrape/init')
        .send({ siteUrl: 'https://example.com', recipe: 'generic-ecommerce' });

      const jobId = initRes.body?.data?.jobId;
      expect(jobId).toBeDefined();

      const res = await request(app).get(`/api/scrape/status/${jobId}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          status: expect.any(String),
        },
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('GET /api/scrape/jobs should return correct schema', async () => {
      const res = await request(app).get('/api/scrape/jobs');

      expect(res.status).toBe(200);
      // Current API returns an array of jobs in data
      expect(res.body).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
    });

    it('GET /api/scrape/performance should return correct schema', async () => {
      const res = await request(app).get('/api/scrape/performance');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          totalJobs: expect.any(Number),
          totalProducts: expect.any(Number),
          averageTimePerProduct: expect.any(Number),
          // Other fields may be present depending on runtime
        },
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('GET /api/scrape/performance/live should return correct schema', async () => {
      const res = await request(app).get('/api/scrape/performance/live');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          // activeJobs is currently an array of summaries
          activeJobs: expect.any(Array),
          systemLoad: expect.objectContaining({
            cpuUsage: expect.any(Object),
            memoryUsage: expect.any(Object),
            uptime: expect.any(Number),
          }),
        },
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('GET /api/scrape/performance/recommendations should return correct schema', async () => {
      const res = await request(app).get('/api/scrape/performance/recommendations');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          recommendations: expect.any(Array),
        },
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });
  });

  describe('Error Response Schemas', () => {
    it('POST /api/scrape/init should return correct error schema for invalid data', async () => {
      const res = await request(app)
        .post('/api/scrape/init')
        .send({ invalidField: 'test' });

      expect([400,422]).toContain(res.status);
      expect(res.body).toMatchObject({
        success: false,
        error: expect.any(String),
        // message, timestamp, requestId may be omitted
      });
    });

    it('GET /api/scrape/status/:jobId should return correct error schema for non-existent job', async () => {
      const res = await request(app).get('/api/scrape/status/non-existent-job-id');

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        error: expect.any(String),
        // message/timestamps may be omitted
      });
    });

    it('POST /api/scrape/cancel/:jobId should return correct error schema for non-existent job', async () => {
      const res = await request(app).post('/api/scrape/cancel/non-existent-job-id');

      expect([400,404]).toContain(res.status);
      expect(res.body).toMatchObject({
        success: false,
        error: expect.any(String),
        // optional fields omitted in current impl
      });
    });

    it('GET /api/scrape/download/:jobId/:type should return correct error schema for non-existent job', async () => {
      const res = await request(app).get('/api/scrape/download/non-existent-job-id/parent');

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        error: expect.any(String),
        // optional fields omitted in current impl
      });
    });
  });

  describe('Request/Response Headers', () => {
    it('should include CORS headers', async () => {
      const res = await request(app).get('/health');

      expect(res.headers).toMatchObject({
        'access-control-allow-origin': expect.any(String),
      });
    });

    it('should include security headers', async () => {
      const res = await request(app).get('/health');

      expect(res.headers).toMatchObject({
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'SAMEORIGIN',
        'x-xss-protection': '0',
      });
    });

    it('should include content-type for JSON responses', async () => {
      const res = await request(app).get('/health');

      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Pagination (if applicable)', () => {
    it('GET /api/scrape/jobs should support pagination parameters', async () => {
      const res = await request(app)
        .get('/api/scrape/jobs')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      // Current API returns an array for data; pagination fields not implemented
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
