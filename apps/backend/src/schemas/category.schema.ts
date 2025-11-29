import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

/**
 * Category validation schemas
 */

/**
 * Schema for reordering categories
 */
export const reorderCategoriesSchema = z.object({
  body: z.object({
    categories: z
      .array(
        z.object({
          categoryId: objectIdSchema,
          displayOrder: z.number().int().min(0),
        })
      )
      .min(1, 'Categories array must not be empty'),
  }),
});

/**
 * Schema for category slug param
 */
export const categorySlugParamSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1),
  }),
});

/**
 * Type inference
 */
export type ReorderCategoriesInput = z.infer<
  typeof reorderCategoriesSchema
>['body'];
export type CategorySlugParams = z.infer<
  typeof categorySlugParamSchema
>['params'];
