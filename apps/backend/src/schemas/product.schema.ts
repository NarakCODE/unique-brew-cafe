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

/**
 * Schema for creating a product
 */
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    categoryId: objectIdSchema,
    basePrice: z.number().min(0, 'Base price must be non-negative'),
    currency: z.enum(['USD', 'KHR']).default('USD'),
    preparationTime: z.number().min(1).default(5),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    isAvailable: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isBestSelling: z.boolean().default(false),
    allergens: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    displayOrder: z.number().min(0).default(0),
    nutritionalInfo: z
      .object({
        protein: z.number().min(0).optional(),
        carbohydrates: z.number().min(0).optional(),
        fat: z.number().min(0).optional(),
        caffeine: z.number().min(0).optional(),
      })
      .optional(),
  }),
});

/**
 * Schema for updating a product
 */
export const updateProductSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: createProductSchema.shape.body.partial(),
});
