import { z } from 'zod';
import { objectIdSchema, positiveIntSchema } from './common.schema.js';

/**
 * Cart validation schemas
 */

/**
 * Schema for product customization options
 */
const customizationSchema = z
  .object({
    size: z.enum(['small', 'medium', 'large']).optional(),
    sugarLevel: z.enum(['none', 'low', 'medium', 'high']).optional(),
    iceLevel: z.enum(['none', 'low', 'medium', 'high']).optional(),
    coffeeLevel: z.enum(['single', 'double', 'triple']).optional(),
  })
  .optional();

/**
 * Schema for adding an item to cart
 */
export const addCartItemSchema = z.object({
  body: z.object({
    productId: objectIdSchema,
    quantity: positiveIntSchema.min(1, 'Quantity must be at least 1'),
    customization: customizationSchema,
    addOns: z.array(objectIdSchema).optional(),
    notes: z
      .string()
      .trim()
      .max(500, 'Notes must be 500 characters or less')
      .optional(),
  }),
});

/**
 * Schema for updating cart item quantity
 */
export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: objectIdSchema,
  }),
  body: z.object({
    quantity: positiveIntSchema.min(1, 'Quantity must be at least 1'),
  }),
});

/**
 * Schema for removing cart item
 */
export const removeCartItemSchema = z.object({
  params: z.object({
    itemId: objectIdSchema,
  }),
});

/**
 * Schema for setting delivery address
 */
export const setDeliveryAddressSchema = z.object({
  body: z.object({
    addressId: objectIdSchema,
  }),
});

/**
 * Schema for setting cart notes
 */
export const setCartNotesSchema = z.object({
  body: z.object({
    notes: z.string().trim().max(1000, 'Notes must be 1000 characters or less'),
  }),
});

/**
 * Type inference
 */
export type AddCartItemInput = z.infer<typeof addCartItemSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemParams = z.infer<
  typeof removeCartItemSchema
>['params'];
export type SetDeliveryAddressInput = z.infer<
  typeof setDeliveryAddressSchema
>['body'];
export type SetCartNotesInput = z.infer<typeof setCartNotesSchema>['body'];
