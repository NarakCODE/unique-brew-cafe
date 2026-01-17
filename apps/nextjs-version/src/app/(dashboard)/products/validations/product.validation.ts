import * as z from "zod";

export const productSizeSchema = z.object({
  name: z.string().min(1, "Size name is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
});

// We separate the Form Schema (internal state) from the API Schema
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  // Internally use objects for useFieldArray compatibility
  images: z
    .array(z.object({ url: z.string().url("Must be a valid URL") }))
    .min(1, "At least one image is required"),
  basePrice: z.coerce.number().min(0, "Base price must be positive"),
  sizes: z.array(productSizeSchema).min(1, "At least one size is required"),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
