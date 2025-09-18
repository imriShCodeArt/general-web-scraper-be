import { z } from 'zod';

// Schema for POST /api/scrape/init
export const ScrapeInitSchema = z.object({
  siteUrl: z.string().min(1, 'siteUrl is required'),
  recipe: z.string().min(1, 'recipe is required'),
  options: z
    .object({
      maxProducts: z.number().int().positive().optional(),
      categories: z.array(z.string()).optional(),
      retryOnFailure: z.boolean().optional(),
      maxRetries: z.number().int().nonnegative().optional(),
    })
    .partial()
    .optional(),
});

export type ScrapeInitInput = z.infer<typeof ScrapeInitSchema>;

export function formatZodError(error: z.ZodError): Array<{ path: string; message: string }> {
  return error.errors.map((e) => ({
    path: e.path.join('.') || '(root)',
    message: e.message,
  }));
}

// Common param schemas
export const JobIdParamSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
});

export const DownloadParamsSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
  type: z.enum(['parent', 'variation'], { required_error: 'type is required' }),
});


