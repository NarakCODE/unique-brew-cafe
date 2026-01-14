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
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  latitude: z
    .custom<number>(
      (val) => typeof val === "number" || !isNaN(Number(val)),
      "Latitude must be a number"
    )
    .transform(Number),
  longitude: z
    .custom<number>(
      (val) => typeof val === "number" || !isNaN(Number(val)),
      "Longitude must be a number"
    )
    .transform(Number),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  images: z.array(z.string()).default([]),
  openingHours: openingHoursSchema,
  specialHours: z.array(z.any()).default([]),
  isOpen: z.boolean().default(true),
  isActive: z.boolean().default(true),
  averagePrepTime: z
    .custom<number>(
      (val) => typeof val === "number" || !isNaN(Number(val)),
      "Average prep time must be a number"
    )
    .transform(Number)
    .default(0),
  features: storeFeaturesSchema,
});

export type StoreFormValues = z.infer<typeof storeSchema>;
