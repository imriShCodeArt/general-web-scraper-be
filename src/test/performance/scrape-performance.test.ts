import autocannon from 'autocannon';
import app from '../../server';
import http from 'http';

describe('Performance - scrape endpoints', () => {
  let server: http.Server;
  let url: string;

  beforeAll((done) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (typeof address === 'object' && address) {
        url = `http://127.0.0.1:${address.port}`;
      }
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('handles concurrent health checks under light load', async () => {
    const result = await autocannon({
      url: `${url}/health`,
      connections: 5,
      duration: 2,
      method: 'GET',
    });

    expect(result.non2xx).toBe(0);
    expect(result.requests.total).toBeGreaterThan(5);
  });
});


