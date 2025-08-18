type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export type LogEvent = {
  type: 'log';
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
};

export type ProgressEvent = {
  type: 'progress';
  percent: number; // 0..100
  message?: string;
  timestamp: number;
};

type AnyEvent = LogEvent | ProgressEvent;

type Subscriber = (event: AnyEvent) => void;

class JobLogger {
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  private buffers: Map<string, AnyEvent[]> = new Map();
  private maxBufferSize = 500;

  subscribe(jobId: string, cb: Subscriber): () => void {
    if (!this.subscribers.has(jobId)) {
      this.subscribers.set(jobId, new Set());
    }
    const set = this.subscribers.get(jobId)!;
    set.add(cb);
    return () => {
      set.delete(cb);
      if (set.size === 0) {
        this.subscribers.delete(jobId);
      }
    };
  }

  getBuffer(jobId: string): AnyEvent[] {
    return this.buffers.get(jobId) || [];
  }

  private push(jobId: string, event: AnyEvent) {
    // buffer
    const buf = this.buffers.get(jobId) || [];
    buf.push(event);
    if (buf.length > this.maxBufferSize) buf.shift();
    this.buffers.set(jobId, buf);
    // broadcast
    const set = this.subscribers.get(jobId);
    if (set) {
      set.forEach((cb) => { try { cb(event); } catch {} });
    }
  }

  log(jobId: string, level: LogLevel, message: string, data?: Record<string, unknown>) {
    this.push(jobId, { type: 'log', level, message, data, timestamp: Date.now() });
  }

  progress(jobId: string, percent: number, message?: string) {
    const pct = Math.max(0, Math.min(100, Math.round(percent)));
    this.push(jobId, { type: 'progress', percent: pct, message, timestamp: Date.now() });
  }
}

export const jobLogger = new JobLogger();


