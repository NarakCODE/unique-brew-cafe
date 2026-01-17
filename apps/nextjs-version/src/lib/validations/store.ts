import { z } from "zod";

const openingHoursDaySchema = z.object({
  open: z.string(),
  close: z.string(),
});

const openingHoursSchema = z.object({
  monday: openingHoursDaySchema,
  tuesday: openingHoursDaySchema,
  wednesday: openingHoursDaySchema,
  thursday: openingHoursDaySchema,
  friday: openingHoursDaySchema,
  saturday: openingHoursDaySchema,
  sunday: openingHoursDaySchema,
});

const storeFeaturesSchema = z.object({
  parking: z.boolean().default(false),
  wifi: z.boolean().default(false),
  outdoorSeating: z.boolean().default(false),
  driveThrough: z.boolean().default(false),
});

export const storeSchema = z.object({
  name: z.string().trim().min(1, "Store name is required").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().optional().or(z.literal("")),
  country: z.string().default("Cambodia"),
  phone: z
    .string()
    .trim()
    .regex(
      /^0\d{8,9}$/,
      "Phone number must start with 0 and be 9-10 digits long"
    ),
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  images: z.array(z.string().url()).optional().default([]),
  openingHours: openingHoursSchema,
  specialHours: z.array(z.any()).default([]),
  isOpen: z.boolean().default(true),
  isActive: z.coerce.boolean().optional().default(true),
  averagePrepTime: z.coerce.number().min(0).default(0),
  features: storeFeaturesSchema,
});

export type StoreFormValues = z.infer<typeof storeSchema>;
