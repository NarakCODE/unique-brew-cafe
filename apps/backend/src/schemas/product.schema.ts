import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

/**
 * Product validation schemas
 */

/**
 * Schema for product query parameters
 */
export const getProductsQuerySchema = z.object({
  query: z.object({
    categoryId: objectIdSchema.optional(),
    isFeatured: z.enum(['true', 'false']).optional(),
    isBestSelling: z.enum(['true', 'false']).optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    search: z.string().trim().optional(),
  }),
});

/**
 * Schema for searching products
 */
export const searchProductsQuerySchema = z.object({
  query: z.object({
    q: z.string().trim().min(1, 'Search query is required'),
    categoryId: objectIdSchema.optional(),
    isFeatured: z.enum(['true', 'false']).optional(),
    isBestSelling: z.enum(['true', 'false']).optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
  }),
});

/**
 * Schema for updating product status
 */
export const updateProductStatusSchema = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

/**
 * Schema for product slug param
 */
export const productSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1),
  }),
});

/**
 * Schema for duplicating product
 */
export const duplicateProductSchema = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
});

/**
 * Type inference
 */
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>['query'];
export type SearchProductsQuery = z.infer<
  typeof searchProductsQuerySchema
>['query'];
export type UpdateProductStatusInput = z.infer<
  typeof updateProductStatusSchema
>['body'];
export type ProductSlugParams = z.infer<
  typeof productSlugParamSchema
>['params'];
