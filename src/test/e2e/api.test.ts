import request from 'supertest';
import app from '../../server';
import { ScrapingService } from '../../lib/scraping-service';

jest.mock('../../lib/scraping-service');

describe('API endpoints', () => {
  const MockedService = ScrapingService as jest.MockedClass<typeof ScrapingService>;

  beforeEach(() => {
    MockedService.mockClear();
    (MockedService.prototype.startScraping as jest.Mock).mockResolvedValue({
      success: true,
      data: { jobId: 'job-1' },
      error: '',
      message: 'ok',
      timestamp: new Date(),
      requestId: 'req-1',
    });

    (MockedService.prototype.getJobStatus as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'job-1', status: 'completed', totalProducts: 1, processedProducts: 1, errors: [], createdAt: new Date(), metadata: { siteUrl: 'https://example.com', recipe: 'mock' } },
      error: '',
      message: 'ok',
      timestamp: new Date(),
      requestId: 'req-2',
    });

    (MockedService.prototype.getAllJobs as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
      error: '',
      message: 'ok',
      timestamp: new Date(),
      requestId: 'req-3',
    });

    (MockedService.prototype.getPerformanceMetrics as jest.Mock).mockResolvedValue({
      success: true,
      data: { totalJobs: 1, totalProducts: 1, averageTimePerProduct: 1, totalProcessingTime: 1, activeJobs: 0, queuedJobs: 0, isProcessing: false },
      error: '',
      message: 'ok',
      timestamp: new Date(),
      requestId: 'req-4',
    });

    (MockedService.prototype.getLivePerformanceMetrics as jest.Mock).mockResolvedValue({
      success: true,
      data: { activeJobs: [], queueLength: 0, isProcessing: false, timestamp: Date.now(), systemLoad: {} },
      error: '',
      message: 'ok',
      timestamp: new Date(),
      requestId: 'req-5',
    });

    (MockedService.prototype.getPerformanceRecommendations as jest.Mock).mockResolvedValue({
      success: true,
      data: { recommendations: [], currentSettings: {} },
      error: '',
      message: 'ok',
      timestamp: new Date(),
      requestId: 'req-6',
    });

    (MockedService.prototype.cancelJob as jest.Mock).mockResolvedValue({
      success: true,
      data: { cancelled: true },
      error: '',
      message: 'ok',
      timestamp: new Date(),
      requestId: 'req-7',
    });
  });

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
    expect(res.body.data.jobId).toBe('job-1');
  });

  it('GET /api/scrape/status/:jobId', async () => {
    const res = await request(app).get('/api/scrape/status/job-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
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
    const res = await request(app).post('/api/scrape/cancel/job-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});


