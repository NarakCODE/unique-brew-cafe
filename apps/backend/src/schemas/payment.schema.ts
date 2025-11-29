import { z } from 'zod';
import { orderIdParamSchema } from './common.schema.js';

/**
 * Payment validation schemas
 */

/**
 * Payment method enum
 */
const paymentMethodEnum = z.enum(['ABA', 'ACLEDA', 'Wing', 'Cash']);

/**
 * Schema for confirming payment
 */
export const confirmPaymentSchema = z.object({
  params: orderIdParamSchema.shape.params,
  body: z.object({
    paymentMethod: paymentMethodEnum,
    transactionId: z
      .string()
      .trim()
      .min(1, 'Transaction ID is required')
      .max(100, 'Transaction ID must be 100 characters or less')
      .optional(),
    paymentDetails: z.record(z.string(), z.unknown()).optional(),
  }),
});

/**
 * Schema for order ID param (payment operations)
 */
export const paymentOrderParamSchema = orderIdParamSchema;

/**
 * Type inference
 */
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>['body'];
export type PaymentOrderParams = z.infer<
  typeof paymentOrderParamSchema
>['params'];
