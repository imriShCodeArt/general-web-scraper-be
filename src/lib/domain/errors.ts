export enum ErrorCode {
  RecipeNotFound = 'RECIPE_NOT_FOUND',
  AdapterCreationFailed = 'ADAPTER_CREATION_FAILED',
  ExtractionFailed = 'EXTRACTION_FAILED',
  JobNotFound = 'JOB_NOT_FOUND',
  StorageEntryNotFound = 'STORAGE_ENTRY_NOT_FOUND',
  ValidationError = 'VALIDATION_ERROR',
  InternalError = 'INTERNAL_ERROR',
}

export type DomainErrorOptions = {
  code: ErrorCode;
  status?: number;
  details?: unknown;
};

export class DomainError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, options: DomainErrorOptions) {
    super(message);
    this.name = 'DomainError';
    this.code = options.code;
    this.status = options.status ?? 500;
    this.details = options.details;
  }
}

export class DomainValidationError extends DomainError {
  constructor(message: string, details?: unknown) {
    super(message, { code: ErrorCode.ValidationError, status: 400, details });
    this.name = 'DomainValidationError';
  }
}

export class JobNotFoundError extends DomainError {
  constructor(jobId: string) {
    super(`Job not found: ${jobId}`, { code: ErrorCode.JobNotFound, status: 404 });
    this.name = 'JobNotFoundError';
  }
}

export class StorageEntryNotFoundError extends DomainError {
  constructor(jobId: string) {
    super(`Job result not found: ${jobId}`, { code: ErrorCode.StorageEntryNotFound, status: 404 });
    this.name = 'StorageEntryNotFoundError';
  }
}

export class RecipeNotFoundError extends DomainError {
  constructor(recipe: string) {
    super(`Recipe not found: ${recipe}`, { code: ErrorCode.RecipeNotFound, status: 400 });
    this.name = 'RecipeNotFoundError';
  }
}

export class ExtractionFailedError extends DomainError {
  constructor(url: string) {
    super(`Failed to extract product: ${url}`, { code: ErrorCode.ExtractionFailed, status: 502 });
    this.name = 'ExtractionFailedError';
  }
}


