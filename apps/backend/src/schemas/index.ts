/**
 * Centralized export for all validation schemas
 *
 * This file provides a single import point for all Zod validation schemas
 * used throughout the application.
 *
 * @example
 * ```typescript
 * import { validate } from '../middlewares/validate.js';
 * import { createAddressSchema, favoriteProductParamSchema } from '../schemas/index.js';
 *
 * router.post('/addresses', validate(createAddressSchema), addAddress);
 * router.post('/favorites/:productId', validate(favoriteProductParamSchema), addFavorite);
 * ```
 */

// Common schemas
export * from './common.schema.js';

// Feature-specific schemas
export * from './address.schema.js';
export * from './cart.schema.js';
export * from './checkout.schema.js';
export * from './favorite.schema.js';
export * from './order.schema.js';
export * from './payment.schema.js';
export * from './search.schema.js';
export * from './user.schema.js';
export * from './store.schema.js';
export * from './category.schema.js';
export * from './product.schema.js';
