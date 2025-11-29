import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

/**
 * Checkout validation schemas
 */

/**
 * Schema for applying a coupon code
 */
export const applyCouponSchema = z.object({
  params: z.object({
    checkoutId: objectIdSchema,
  }),
  body: z.object({
    couponCode: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, 'Coupon code is required')
      .max(50, 'Coupon code must be 50 characters or less'),
  }),
});

/**
 * Schema for checkout ID param
 */
export const checkoutParamSchema = z.object({
  params: z.object({
    checkoutId: objectIdSchema,
  }),
});

/**
 * Schema for calculating delivery charges
 */
export const deliveryChargesSchema = z.object({
  query: z.object({
    addressId: objectIdSchema,
  }),
});

/**
 * Type inference
 */
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>['body'];
export type CheckoutParams = z.infer<typeof checkoutParamSchema>['params'];
export type DeliveryChargesQuery = z.infer<
  typeof deliveryChargesSchema
>['query'];

/**
 * Schema for confirming checkout
 */
export const confirmCheckoutSchema = z.object({
  params: z.object({
    checkoutId: objectIdSchema,
  }),
  body: z.object({
    paymentMethod: z.enum(['ABA', 'ACLEDA', 'Wing', 'Cash']),
  }),
});

export type ConfirmCheckoutInput = z.infer<
  typeof confirmCheckoutSchema
>['body'];
