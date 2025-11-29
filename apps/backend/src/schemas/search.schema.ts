import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

/**
 * Search validation schemas
 */

/**
 * Schema for search query
 */
export const searchQuerySchema = z.object({
  query: z.object({
    q: z
      .string()
      .trim()
      .min(1, 'Search query is required')
      .max(100, 'Search query must be 100 characters or less'),
    type: z.enum(['store', 'product', 'all']).default('all'),
    limit: z.coerce.number().int().positive().max(50).default(20),
  }),
});

/**
 * Schema for search suggestions
 */
export const searchSuggestionsSchema = z.object({
  query: z.object({
    q: z
      .string()
      .trim()
      .min(1, 'Query is required')
      .max(100, 'Query must be 100 characters or less'),
    limit: z.coerce.number().int().positive().max(10).default(10),
  }),
});

/**
 * Schema for deleting a specific search
 */
export const deleteSearchSchema = z.object({
  params: z.object({
    searchId: objectIdSchema,
  }),
});

/**
 * Type inference
 */
export type SearchQuery = z.infer<typeof searchQuerySchema>['query'];
export type SearchSuggestionsQuery = z.infer<
  typeof searchSuggestionsSchema
>['query'];
export type DeleteSearchParams = z.infer<typeof deleteSearchSchema>['params'];
