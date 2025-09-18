/**
 * API response utilities
 */

export interface ApiResponse<T = unknown, E = string> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
  timestamp: Date;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Create a successful API response
 * @param data Response data
 * @param message Optional success message
 * @param meta Optional metadata
 * @returns API response object
 */
export function makeApiResponse<T>(
  data: T,
  message?: string,
  requestId?: string,
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date(),
    requestId: requestId || 'unknown',
  };
}

/**
 * Create an error API response
 * @param error Error message or error object
 * @param code Optional error code
 * @param meta Optional metadata
 * @returns API response object
 */
export function makeErrorResponse(
  error: string | Error,
  code?: string,
  requestId?: string,
): ApiResponse {
  const errorMessage = error instanceof Error ? error.message : error;

  return {
    success: false,
    error: errorMessage,
    timestamp: new Date(),
    requestId: requestId || 'unknown',
  };
}

/**
 * Create a paginated API response
 * @param data Array of items
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items
 * @param meta Optional additional metadata
 * @returns Paginated API response object
 */
export function makePaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  requestId?: string,
): ApiResponse<{
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const totalPages = Math.ceil(total / limit);

  return makeApiResponse(
    {
      items: data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
    undefined,
    requestId,
  );
}

/**
 * Create a job status response
 * @param jobId Job identifier
 * @param status Job status
 * @param progress Optional progress percentage (0-100)
 * @param result Optional job result
 * @param error Optional error message
 * @returns Job status API response
 */
export function makeJobStatusResponse(
  jobId: string,
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
  progress?: number,
  result?: unknown,
  error?: string,
  requestId?: string,
): ApiResponse<{
  jobId: string;
  status: string;
  progress?: number;
  result?: unknown;
  error?: string;
}> {
  return makeApiResponse(
    {
      jobId,
      status,
      ...(progress !== undefined && { progress }),
      ...(result && { result }),
      ...(error && { error }),
    },
    `Job ${jobId} is ${status}`,
    requestId,
  );
}

/**
 * Create a performance metrics response
 * @param metrics Performance metrics object
 * @param meta Optional additional metadata
 * @returns Performance metrics API response
 */
export function makePerformanceResponse(
  metrics: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    averageProcessingTime: number;
    totalProcessingTime: number;
    averageProductsPerJob: number;
    totalProductsProcessed: number;
  },
  requestId?: string,
): ApiResponse<typeof metrics> {
  return makeApiResponse(
    metrics,
    'Performance metrics retrieved successfully',
    requestId,
  );
}

/**
 * Create a health check response
 * @param status Health status
 * @param details Optional health details
 * @returns Health check API response
 */
export function makeHealthResponse(
  status: 'healthy' | 'unhealthy' | 'degraded',
  details?: Record<string, unknown>,
  requestId?: string,
): ApiResponse<{
  status: string;
  timestamp: string;
  details?: Record<string, unknown>;
}> {
  return makeApiResponse(
    {
      status,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    },
    `Service is ${status}`,
    requestId,
  );
}

/**
 * Create a validation error response
 * @param errors Array of validation errors
 * @param field Optional field name
 * @returns Validation error API response
 */
export function makeValidationErrorResponse(
  errors: string[],
  field?: string,
  requestId?: string,
): ApiResponse {
  return makeErrorResponse(
    `Validation failed: ${errors.join(', ')}`,
    'VALIDATION_ERROR',
    requestId,
  );
}
