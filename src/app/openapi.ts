import path from 'path';
// @ts-ignore - types may be missing in some environments
import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const version = process.env.npm_package_version || '0.0.0';

const options: Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Web Scraper v2 API',
      version,
      description:
				'API for initiating and monitoring scraping jobs, managing recipes, and downloading CSV outputs.',
    },
    servers: [
      { url: '/', description: 'Current server' },
      { url: 'http://localhost:3000', description: 'Local development' },
    ],
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            code: {
              type: 'string',
              description: 'Domain error code',
              enum: [
                'RECIPE_NOT_FOUND',
                'ADAPTER_CREATION_FAILED',
                'EXTRACTION_FAILED',
                'JOB_NOT_FOUND',
                'STORAGE_ENTRY_NOT_FOUND',
                'VALIDATION_ERROR',
                'INTERNAL_ERROR',
              ],
            },
            error: { type: 'string', example: 'Job result not found: abc123' },
            details: { type: 'object' },
          },
          required: ['success', 'code', 'error'],
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Invalid request body' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string', example: 'siteUrl' },
                  message: { type: 'string', example: 'siteUrl is required' },
                },
              },
            },
          },
        },
        StartScrapeRequest: {
          type: 'object',
          required: ['siteUrl', 'recipe'],
          properties: {
            siteUrl: { type: 'string', example: 'https://example.com' },
            recipe: { type: 'string', example: 'generic-ecommerce' },
            options: { type: 'object' },
          },
        },
        ScrapeJobResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            jobId: { type: 'string' },
            status: { type: 'string' },
            data: { type: 'object' },
            error: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/scrape/init': {
        post: {
          summary: 'Start scraping job',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StartScrapeRequest' },
              },
            },
          },
          responses: {
            '201': { description: 'Job created' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
      },
      '/api/scrape/status/{jobId}': {
        get: {
          summary: 'Get scraping job status',
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Status' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/scrape/jobs': {
        get: { summary: 'List all jobs', responses: { '200': { description: 'OK' } } },
      },
      '/api/scrape/performance': {
        get: { summary: 'Performance metrics', responses: { '200': { description: 'OK' } } },
      },
      '/api/scrape/performance/live': {
        get: { summary: 'Live performance metrics', responses: { '200': { description: 'OK' } } },
      },
      '/api/scrape/performance/recommendations': {
        get: { summary: 'Performance recommendations', responses: { '200': { description: 'OK' } } },
      },
      '/api/scrape/cancel/{jobId}': {
        post: {
          summary: 'Cancel a job',
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Cancelled' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
          },
        },
      },
      '/api/scrape/download/{jobId}/{type}': {
        get: {
          summary: 'Download CSV',
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['parent', 'variation'] } },
          ],
          responses: {
            '200': { description: 'CSV file' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/storage/stats': {
        get: { summary: 'Storage stats', responses: { '200': { description: 'OK' } } },
      },
      '/api/storage/job/{jobId}': {
        get: {
          summary: 'Get job result from storage',
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'OK' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/storage/clear': {
        delete: { summary: 'Clear storage', responses: { '200': { description: 'Cleared' } } },
      },
      '/api/recipes/list': {
        get: { summary: 'List recipes', responses: { '200': { description: 'OK' } } },
      },
      '/api/recipes/get/{recipeName}': {
        get: {
          summary: 'Get recipe by name',
          parameters: [
            { name: 'recipeName', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
        },
      },
      '/api/recipes/getBySite': {
        get: {
          summary: 'Get recipe by site URL',
          parameters: [
            { name: 'siteUrl', in: 'query', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
        },
      },
      '/api/recipes/all': {
        get: { summary: 'List recipes with details', responses: { '200': { description: 'OK' } } },
      },
      '/api/recipes/names': {
        get: { summary: 'List recipe names', responses: { '200': { description: 'OK' } } },
      },
      '/api/recipes/validate': {
        post: {
          summary: 'Validate a recipe by name',
          responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
        },
      },
      '/api/recipes/loadFromFile': {
        post: { summary: 'Load recipe from file', responses: { '200': { description: 'OK' } } },
      },
    },
  },
  apis: [path.join(process.cwd(), 'src/**/*.ts')],
};

export const swaggerSpec = swaggerJSDoc(options);

