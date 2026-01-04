import { z } from "zod";

/**
 * Common reusable schema validators
 */

/**
 * Validates phone number (E.164 format)
 */
export const phoneSchema = z
    .string()
    .trim()
    .regex(
        /^0\d{8,9}$/,
        "Phone number must start with 0 and be 9-10 digits long"
    );

/**
 * Validates positive integer
 */
export const positiveIntSchema = z
    .number()
    .int("Must be an integer")
    .positive("Must be a positive number");

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
