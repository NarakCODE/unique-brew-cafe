import { z } from "zod";
import { phoneSchema } from "./common-schema";

const genderEnum = z.enum(["male", "female", "other"]);

export const userPreferencesSchema = z.object({
    notificationsEnabled: z.boolean().default(true),
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    language: z.enum(["en", "km"]).default("en"),
    currency: z.enum(["USD", "KHR"]).default("USD"),
    notifications: z
        .object({
            orderUpdates: z.boolean().default(true),
            promotions: z.boolean().default(true),
            announcements: z.boolean().default(true),
            systemNotifications: z.boolean().default(true),
        })
        .partial()
        .optional(),
});

export const updateProfileSchema = z.object({
    body: z.object({
        fullName: z
            .string()
            .trim()
            .min(1, "Full name cannot be empty")
            .max(100, "Full name must be 100 characters or less")
            .optional(),
        email: z.email().optional(),
        phoneNumber: phoneSchema.optional(),
        dateOfBirth: z.coerce
            .date()
            .max(new Date(), {
                message: "Date of birth cannot be in the future",
            })
            .optional(),
        gender: genderEnum.optional(),
        preferences: userPreferencesSchema.partial().optional(),
    }),
});

export type UpdateProfileSchemaType = z.infer<
    typeof updateProfileSchema
>["body"];
