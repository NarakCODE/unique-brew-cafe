import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Common reusable schema validators
 */

/**
 * Validates MongoDB ObjectId format
 * @example objectIdSchema.parse('507f1f77bcf86cd799439011')
 */
export const objectIdSchema = z
  .string()
  .trim()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid MongoDB ObjectId format',
  });

/**
 * Validates email format
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

/**
 * Validates phone number (E.164 format)
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

/**
 * Validates positive integer
 */
export const positiveIntSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be a positive number');

/**
 * Validates pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Validates date range parameters
 */
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

/**
 * Common param schemas
 */
export const idParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    orderId: objectIdSchema,
  }),
});

export const addressIdParamSchema = z.object({
  params: z.object({
    addressId: objectIdSchema,
  }),
});

export const storeIdParamSchema = z.object({
  params: z.object({
    storeId: objectIdSchema,
  }),
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    categoryId: objectIdSchema,
  }),
});
