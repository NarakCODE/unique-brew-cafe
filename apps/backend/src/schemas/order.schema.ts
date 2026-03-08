import { z } from 'zod';
import { orderIdParamSchema, objectIdSchema } from './common.schema.js';

/**
 * Order validation schemas
 */

/**
 * Order status enum
 */
const orderStatusEnum = z.enum([
  'received',
  'pending_payment',
  'confirmed',
  'preparing',
  'ready',
  'picked_up',
  'completed',
  'cancelled',
]);

const orderCustomizationSchema = z
  .object({
    size: z.string().trim().min(1).max(50).optional(),
    sugarLevel: z.string().trim().min(1).max(50).optional(),
    iceLevel: z.string().trim().min(1).max(50).optional(),
    coffeeLevel: z.string().trim().min(1).max(50).optional(),
  })
  .optional();

export const createOrderSchema = z.object({
  body: z.object({
    storeId: objectIdSchema,
    items: z
      .array(
        z.object({
          productId: objectIdSchema,
          quantity: z.coerce.number().int().positive(),
          customization: orderCustomizationSchema,
          notes: z
            .string()
            .trim()
            .max(500, 'Item notes must be 500 characters or less')
            .optional(),
        })
      )
      .min(1, 'At least one order item is required'),
    pickupTime: z.coerce.date().optional(),
    notes: z
      .string()
      .trim()
      .max(1000, 'Order notes must be 1000 characters or less')
      .optional(),
    paymentMethod: z.string().trim().min(1).max(50).default('cash'),
  }),
});

/**
 * Schema for canceling an order
 */
export const cancelOrderSchema = z.object({
  params: orderIdParamSchema.shape.params,
  body: z.object({
    reason: z
      .string()
      .trim()
      .min(1, 'Cancellation reason is required')
      .max(500, 'Reason must be 500 characters or less'),
  }),
});

/**
 * Schema for rating an order
 */
export const rateOrderSchema = z.object({
  params: orderIdParamSchema.shape.params,
  body: z.object({
    rating: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5'),
    review: z
      .string()
      .trim()
      .max(1000, 'Review must be 1000 characters or less')
      .optional(),
  }),
});

/**
 * Schema for order query parameters
 */
export const getOrdersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: orderStatusEnum.optional(),
    storeId: objectIdSchema.optional(),
    userId: objectIdSchema.optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),
});

/**
 * Schema for updating order status (admin only)
 */
export const updateOrderStatusSchema = z.object({
  params: orderIdParamSchema.shape.params,
  body: z.object({
    status: orderStatusEnum,
  }),
});

/**
 * Schema for adding internal notes (admin only)
 */
export const addOrderNotesSchema = z.object({
  params: orderIdParamSchema.shape.params,
  body: z.object({
    notes: z
      .string()
      .trim()
      .min(1, 'Notes cannot be empty')
      .max(1000, 'Notes must be 1000 characters or less'),
  }),
});

/**
 * Schema for assigning driver (admin only)
 */
export const assignDriverSchema = z.object({
  params: orderIdParamSchema.shape.params,
  body: z.object({
    driverId: objectIdSchema,
  }),
});

/**
 * Schema for order ID param
 */
export const orderParamSchema = orderIdParamSchema;

/**
 * Type inference
 */
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>['body'];
export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type RateOrderInput = z.infer<typeof rateOrderSchema>['body'];
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>['query'];
export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>['body'];
export type AddOrderNotesInput = z.infer<typeof addOrderNotesSchema>['body'];
export type AssignDriverInput = z.infer<typeof assignDriverSchema>['body'];
export type OrderParams = z.infer<typeof orderParamSchema>['params'];
