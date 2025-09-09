/**
 * Error mapping and formatting utilities for API/logging
 */

export interface FormattedError {
  message: string;
  code?: string;
  retryable?: boolean;
  details?: Record<string, unknown>;
}

export function toFormattedError(error: unknown, defaults?: Partial<FormattedError>): FormattedError {
  if (error instanceof Error) {
    return {
      message: error.message,
      ...defaults,
    };
  }
  if (typeof error === 'string') {
    return { message: error, ...defaults };
  }
  try {
    return { message: JSON.stringify(error), ...defaults };
  } catch {
    return { message: 'Unknown error', ...defaults };
  }
}

export function formatForLog(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}


