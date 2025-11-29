import { z } from 'zod';
import { addressIdParamSchema, phoneSchema } from './common.schema.js';

/**
 * Address validation schemas
 */

/**
 * Schema for creating a new address
 */
export const createAddressSchema = z.object({
  body: z.object({
    label: z
      .string()
      .trim()
      .min(1, 'Label is required')
      .max(50, 'Label must be 50 characters or less'),
    fullName: z
      .string()
      .trim()
      .min(1, 'Full name is required')
      .max(100, 'Full name must be 100 characters or less'),
    phoneNumber: phoneSchema,
    addressLine1: z
      .string()
      .trim()
      .min(1, 'Address line 1 is required')
      .max(200, 'Address line 1 must be 200 characters or less'),
    addressLine2: z
      .string()
      .trim()
      .max(200, 'Address line 2 must be 200 characters or less')
      .optional(),
    city: z
      .string()
      .trim()
      .min(1, 'City is required')
      .max(100, 'City must be 100 characters or less'),
    state: z
      .string()
      .trim()
      .min(1, 'State is required')
      .max(100, 'State must be 100 characters or less'),
    postalCode: z
      .string()
      .trim()
      .regex(/^[A-Z0-9]{3,10}$/i, 'Invalid postal code format')
      .optional(),
    country: z
      .string()
      .trim()
      .min(1, 'Country is required')
      .max(100, 'Country must be 100 characters or less'),
    latitude: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
      .optional(),
    longitude: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
      .optional(),
    deliveryInstructions: z
      .string()
      .trim()
      .max(500, 'Delivery instructions must be 500 characters or less')
      .optional(),
  }),
});

/**
 * Schema for updating an existing address
 */
export const updateAddressSchema = z.object({
  params: addressIdParamSchema.shape.params,
  body: createAddressSchema.shape.body.partial(),
});

/**
 * Schema for address ID param
 */
export const addressParamSchema = addressIdParamSchema;

/**
 * Type inference
 */
export type CreateAddressInput = z.infer<typeof createAddressSchema>['body'];
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>['body'];
export type AddressParams = z.infer<typeof addressParamSchema>['params'];
