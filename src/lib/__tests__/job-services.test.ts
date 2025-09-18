import { JobQueueService } from '../core/services/job-queue-service';
import { JobLifecycleService } from '../core/services/job-lifecycle-service';

describe('Job services', () => {
  test('JobQueueService enqueues, shifts, cancels and reports length', () => {
    const q = new JobQueueService();
    const jobA = { id: 'a' } as const;
    const jobB = { id: 'b' } as const;
    q.enqueue(jobA);
    q.enqueue(jobB);
    expect(q.length).toBe(2);
    const first = q.shift();
    expect(first?.id).toBe('a');
    expect(q.cancel('non-existent')).toBe(false);
    expect(q.cancel('b')).toBe(true);
    expect(q.length).toBe(0);
  });

  test('JobLifecycleService tracks and updates job state', () => {
    const l = new JobLifecycleService();
    const job = { id: 'j1', status: 'pending' as const, errors: [] };
    l.add(job);
    expect(l.get('j1')?.status).toBe('pending');
    l.markRunning('j1');
    expect(l.get('j1')?.status).toBe('running');
    l.markCompleted('j1', 5, 0);
    expect(l.get('j1')?.status).toBe('completed');
    const job2 = { id: 'j2', status: 'pending' as const, errors: [] };
    l.add(job2);
    expect(l.cancel('j2')).toBe(true);
    expect(l.get('j2')?.status).toBe('failed');
  });
});


