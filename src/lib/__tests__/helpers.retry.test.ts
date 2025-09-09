import { exponentialBackoff, withRetry } from '../helpers/retry';

describe('helpers/retry', () => {
  it('exponentialBackoff increases with attempts', () => {
    const d1 = exponentialBackoff(1, 100, 0);
    const d2 = exponentialBackoff(2, 100, 0);
    const d3 = exponentialBackoff(3, 100, 0);
    expect(d1).toBe(100);
    expect(d2).toBe(200);
    expect(d3).toBe(400);
  });

  it('withRetry succeeds without retry on first attempt', async () => {
    const result = await withRetry(async () => 42, {
      maxAttempts: 3,
      baseDelayMs: 1,
      jitterRatio: 0,
    });
    expect(result).toBe(42);
  });

  it('withRetry retries and eventually succeeds', async () => {
    let attempts = 0;
    const result = await withRetry(
      async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error('fail');
        }
        return 'ok';
      },
      { maxAttempts: 5, baseDelayMs: 1, jitterRatio: 0 },
    );
    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('withRetry throws after max attempts', async () => {
    let attempts = 0;
    await expect(
      withRetry(
        async () => {
          attempts += 1;
          throw new Error('always');
        },
        { maxAttempts: 3, baseDelayMs: 1, jitterRatio: 0 },
      ),
    ).rejects.toThrow('always');
    expect(attempts).toBe(3);
  });
});


