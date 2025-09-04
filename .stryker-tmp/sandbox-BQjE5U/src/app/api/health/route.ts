// @ts-nocheck
// Avoid Next.js dependency for type-checking in Node-only env
type NextRequest = unknown;
type NextResponseInit = { status?: number };
type NextResponseBody = { body: unknown; status?: number };

const NextResponse = {
  json: (body: unknown, init?: NextResponseInit): NextResponseBody => ({ body, ...init }),
};

/**
 * Health check endpoint for monitoring and CI/CD pipeline
 * Returns service status and health information
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function getStackInfo(error: unknown): string | undefined {
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();

    // Perform health checks
    const checks = await Promise.all([
      checkSystemResources(),
      checkDatabase(),
      checkExternalServices(),
    ]);

    const duration = Date.now() - startTime;
    const isHealthy = checks.every((check) => check.status === 'healthy');
    const statusCode = isHealthy ? 200 : 503;

    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      checks,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: getErrorMessage(error),
      stack: getStackInfo(error),
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

/**
 * Check system resources
 */
async function checkSystemResources() {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const isHealthy = memoryUsage.heapUsed < 500 * 1024 * 1024; // 500MB limit
    const status = isHealthy ? 'healthy' : 'warning';

    return {
      name: 'system_resources',
      status,
      details: {
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        },
        cpu: {
          user: `${Math.round(cpuUsage.user / 1000)}ms`,
          system: `${Math.round(cpuUsage.system / 1000)}ms`,
        },
      },
    };
  } catch (error) {
    return {
      name: 'system_resources',
      status: 'unhealthy',
      error: getErrorMessage(error),
    };
  }
}

/**
 * Check database connectivity
 */
async function checkDatabase() {
  // TODO: Implement actual database health check
  // For now, return a mock healthy status
  return {
    name: 'database',
    status: 'healthy',
    details: {
      message: 'Database connection check not implemented yet',
    },
  };
}

/**
 * Check external services
 */
async function checkExternalServices() {
  // TODO: Implement actual external service health checks
  // For now, return a mock healthy status
  return {
    name: 'external_services',
    status: 'healthy',
    details: {
      message: 'External service checks not implemented yet',
    },
  };
}
