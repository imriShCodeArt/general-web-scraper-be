// @ts-nocheck
import request from 'supertest';
import app from '../../server';

describe('API endpoints', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('running');
  });

  it('POST /api/scrape/init', async () => {
    const res = await request(app)
      .post('/api/scrape/init')
      .send({ siteUrl: 'https://example.com', recipe: 'mock' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.jobId).toBeDefined();
  });

  it('GET /api/scrape/status/:jobId', async () => {
    const init = await request(app)
      .post('/api/scrape/init')
      .send({ siteUrl: 'https://example.com', recipe: 'mock' });
    const jobId = init.body?.data?.jobId;
    expect(jobId).toBeDefined();
    const res = await request(app).get(`/api/scrape/status/${jobId}`);
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
    expect(res.body).toHaveProperty('success');
  });

  it('GET /api/scrape/jobs', async () => {
    const res = await request(app).get('/api/scrape/jobs');
    expect(res.status).toBe(200);
  });

  it('GET /api/scrape/performance', async () => {
    const res = await request(app).get('/api/scrape/performance');
    expect(res.status).toBe(200);
  });

  it('GET /api/scrape/performance/live', async () => {
    const res = await request(app).get('/api/scrape/performance/live');
    expect(res.status).toBe(200);
  });

  it('GET /api/scrape/performance/recommendations', async () => {
    const res = await request(app).get('/api/scrape/performance/recommendations');
    expect(res.status).toBe(200);
  });

  it('POST /api/scrape/cancel/:jobId', async () => {
    const init = await request(app)
      .post('/api/scrape/init')
      .send({ siteUrl: 'https://example.com', recipe: 'mock' });
    const jobId = init.body?.data?.jobId;
    expect(jobId).toBeDefined();
    const res = await request(app).post(`/api/scrape/cancel/${jobId}`);
    expect([200, 400]).toContain(res.status);
    expect(res.body).toHaveProperty('success');
  });
});
