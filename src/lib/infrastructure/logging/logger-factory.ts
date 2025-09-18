import pino, { Logger, LoggerOptions } from 'pino';

export type LoggerFactory = (bindings?: Record<string, unknown>) => Logger;

export function createLoggerFactory(options?: LoggerOptions): LoggerFactory {
  const base = pino(options);
  return (bindings?: Record<string, unknown>) => base.child(bindings || {});
}


