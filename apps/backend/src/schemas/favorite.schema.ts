import { z } from 'zod';
import { productIdParamSchema } from './common.schema.js';

/**
 * Favorite validation schemas
 */

/**
 * Schema for adding/removing a product from favorites
 * Validates productId in route params
 *
 * @example
 * POST /api/favorites/:productId
 * DELETE /api/favorites/:productId
 */
export const favoriteProductParamSchema = productIdParamSchema;

/**
 * Type inference for favorite operations
 */
export type FavoriteProductParams = z.infer<
  typeof favoriteProductParamSchema
>['params'];
