import { z } from 'zod';
import { objectIdSchema, phoneSchema, emailSchema } from './common.schema.js';

/**
 * Store validation schemas
 */

/**
 * Schema for opening hours
 */
const openingHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  closeTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  isOpen: z.boolean(),
});

/**
 * Schema for store location
 */
const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // Longitude
    z.number().min(-90).max(90), // Latitude
  ]),
  address: z.string().min(1, 'Address is required'),
});

/**
 * Schema for creating a new store
 */
export const createStoreSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Store name is required').max(100),
    slug: z
      .string()
      .trim()
      .min(1, 'Slug is required')
      .max(100)
      .regex(
        /^[a-z0-9-]+$/,
        'Slug must contain only lowercase letters, numbers, and hyphens'
      ),
    description: z.string().trim().max(1000).optional(),
    phoneNumber: phoneSchema,
    email: emailSchema.optional(),
    images: z.array(z.string().url()).optional(),
    openingHours: z.array(openingHoursSchema).optional(),
    location: locationSchema,
    isActive: z.boolean().optional(),
  }),
});

/**
 * Schema for updating a store
 */
export const updateStoreSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: createStoreSchema.shape.body.partial(),
});

/**
 * Schema for querying stores
 */
export const getStoresQuerySchema = z.object({
  query: z
    .object({
      latitude: z.coerce.number().min(-90).max(90).optional(),
      longitude: z.coerce.number().min(-180).max(180).optional(),
      radius: z.coerce.number().positive().optional(),
    })
    .refine(
      (data) => {
        const { latitude, longitude, radius } = data;
        // If any one is present, all must be present
        if (
          latitude !== undefined ||
          longitude !== undefined ||
          radius !== undefined
        ) {
          return (
            latitude !== undefined &&
            longitude !== undefined &&
            radius !== undefined
          );
        }
        return true;
      },
      {
        message:
          'Latitude, longitude, and radius must all be provided together',
        path: ['latitude'], // Attach error to latitude
      }
    ),
});

/**
 * Schema for getting pickup times
 */
export const getPickupTimesSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({
    date: z
      .string()
      .datetime()
      .optional()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional(),
  }),
});

/**
 * Schema for store slug param
 */
export const storeSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1),
  }),
});

/**
 * Type inference
 */
export type CreateStoreInput = z.infer<typeof createStoreSchema>['body'];
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>['body'];
export type GetStoresQuery = z.infer<typeof getStoresQuerySchema>['query'];
export type GetPickupTimesQuery = z.infer<typeof getPickupTimesSchema>['query'];
export type StoreSlugParams = z.infer<typeof storeSlugParamSchema>['params'];

/**
 * Schema for getting store menu
 */
export const getStoreMenuSchema = z.object({
  params: z.object({
    storeId: objectIdSchema,
  }),
  query: z.object({
    categoryId: objectIdSchema.optional(),
    isFeatured: z.enum(['true', 'false']).optional(),
    isBestSelling: z.enum(['true', 'false']).optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
  }),
});

export type GetStoreMenuQuery = z.infer<typeof getStoreMenuSchema>['query'];
export type GetStoreMenuParams = z.infer<typeof getStoreMenuSchema>['params'];
