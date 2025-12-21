"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";
import { ImageUpload } from "@/components/shared/image-upload";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import type { Product } from "@/types";

const productFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    slug: z.string().min(2, "Slug must be at least 2 characters").max(100),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    categoryId: z.string().min(1, "Category is required"),
    images: z.array(z.string()).default([]),
    basePrice: z.coerce.number().min(0, "Price must be positive"),
    currency: z.enum(["USD", "KHR"]).default("USD"),
    preparationTime: z.coerce.number().min(1).max(120).default(5),
    calories: z.coerce.number().min(0).optional(),
    isAvailable: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isBestSelling: z.boolean().default(false),
    allergens: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    displayOrder: z.coerce.number().min(0).default(0),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
    product?: Product;
    mode: "create" | "edit";
}

export function ProductForm({ product, mode }: ProductFormProps) {
    const router = useRouter();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const [tagInput, setTagInput] = useState("");
    const [allergenInput, setAllergenInput] = useState("");

    // Image upload state
    const [files, setFiles] = useState<File[]>([]);

    // Fetch categories for dropdown
    const { data: categoriesData, isLoading: categoriesLoading } =
        useCategories({
            isActive: true, // Only get active categories
        });
    const categories = categoriesData?.data || [];

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema) as never,
        defaultValues: product
            ? {
                  name: product.name,
                  slug: product.slug,
                  description: product.description,
                  categoryId:
                      typeof product.categoryId === "string"
                          ? product.categoryId
                          : product.categoryId._id,
                  images: product.images || [],
                  basePrice: product.basePrice,
                  currency: product.currency,
                  preparationTime: product.preparationTime,
                  calories: product.calories,
                  isAvailable: product.isAvailable,
                  isFeatured: product.isFeatured,
                  isBestSelling: product.isBestSelling,
                  allergens: product.allergens || [],
                  tags: product.tags || [],
                  displayOrder: product.displayOrder,
              }
            : {
                  name: "",
                  slug: "",
                  description: "",
                  categoryId: "",
                  images: [],
                  basePrice: 0,
                  currency: "USD" as const,
                  preparationTime: 5,
                  calories: 0,
                  isAvailable: true,
                  isFeatured: false,
                  isBestSelling: false,
                  allergens: [],
                  tags: [],
                  displayOrder: 0,
              },
    });

    const onSubmit = async (data: ProductFormValues) => {
        try {
            // Use FormData for image upload
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("slug", data.slug);
            formData.append("description", data.description);
            formData.append("categoryId", data.categoryId);
            formData.append("basePrice", String(data.basePrice));
            formData.append("currency", data.currency);
            formData.append("preparationTime", String(data.preparationTime));
            if (data.calories !== undefined) {
                formData.append("calories", String(data.calories));
            }
            formData.append("isAvailable", String(data.isAvailable));
            formData.append("isFeatured", String(data.isFeatured));
            formData.append("isBestSelling", String(data.isBestSelling));
            formData.append("displayOrder", String(data.displayOrder));

            // Add arrays as JSON
            formData.append("allergens", JSON.stringify(data.allergens));
            formData.append("tags", JSON.stringify(data.tags));

            // Process images
            // 1. Append existing image URLs
            if (data.images && data.images.length > 0) {
                // Determine if we need to parse them if they came from JSON stringify before,
                // but usually data.images is just string[].
                data.images.forEach((url) => {
                    formData.append("images", url);
                });
            }

            // 2. Append new binary files
            if (files.length > 0) {
                files.forEach((file) => {
                    formData.append("images", file);
                });
            }

            // 3. Fallback if absolutely no images exist
            if (
                (!data.images || data.images.length === 0) &&
                files.length === 0
            ) {
                formData.append(
                    "images",
                    "https://placehold.co/400x400/png?text=Product"
                );
            }

            if (mode === "create") {
                console.log(
                    "Submitting Create:",
                    Object.fromEntries(formData.entries())
                );
                createProduct.mutate(formData, {
                    onSuccess: () => {
                        toast.success("Product created successfully");
                        router.push("/products");
                    },
                    onError: (error) => {
                        toast.error(
                            error.message || "Failed to create product"
                        );
                    },
                });
            } else if (product) {
                updateProduct.mutate(
                    {
                        id: product.id,
                        data: formData,
                    },
                    {
                        onSuccess: () => {
                            toast.success("Product updated successfully");
                            router.push("/products");
                        },
                        onError: (error) => {
                            toast.error(
                                error.message || "Failed to update product"
                            );
                        },
                    }
                );
            }
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error("An error occurred while saving the product");
        }
    };

    const addTag = () => {
        if (tagInput.trim()) {
            const currentTags = form.getValues("tags");
            if (!currentTags.includes(tagInput.trim())) {
                form.setValue("tags", [...currentTags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = form.getValues("tags");
        form.setValue(
            "tags",
            currentTags.filter((tag) => tag !== tagToRemove)
        );
    };

    const addAllergen = () => {
        if (allergenInput.trim()) {
            const currentAllergens = form.getValues("allergens");
            if (!currentAllergens.includes(allergenInput.trim())) {
                form.setValue("allergens", [
                    ...currentAllergens,
                    allergenInput.trim(),
                ]);
            }
            setAllergenInput("");
        }
    };

    const removeAllergen = (allergenToRemove: string) => {
        const currentAllergens = form.getValues("allergens");
        form.setValue(
            "allergens",
            currentAllergens.filter((allergen) => allergen !== allergenToRemove)
        );
    };

    const generateSlug = () => {
        const name = form.getValues("name");
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        form.setValue("slug", slug);
    };

    const isPending = createProduct.isPending || updateProduct.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Main Content - 2 columns */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Essential details about your product
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Caramel Latte"
                                                    {...field}
                                                    onBlur={() => {
                                                        field.onBlur();
                                                        if (
                                                            !form.getValues(
                                                                "slug"
                                                            )
                                                        ) {
                                                            generateSlug();
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input
                                                        placeholder="caramel-latte"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={generateSlug}
                                                >
                                                    Generate
                                                </Button>
                                            </div>
                                            <FormDescription>
                                                URL-friendly version of the name
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="A delicious blend of espresso with rich caramel syrup..."
                                                    className="min-h-32 resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Pricing & Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing & Details</CardTitle>
                                <CardDescription>
                                    Product pricing and preparation information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="basePrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Base Price
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="6.99"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select currency" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="USD">
                                                            USD ($)
                                                        </SelectItem>
                                                        <SelectItem value="KHR">
                                                            KHR (៛)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="preparationTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Preparation Time (min)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="5"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="calories"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Calories (optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="250"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="displayOrder"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Display Order</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Lower numbers appear first
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Tags & Allergens */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tags & Allergens</CardTitle>
                                <CardDescription>
                                    Add tags and allergen information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Tags */}
                                <div className="space-y-2">
                                    <FormLabel>Tags</FormLabel>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a tag..."
                                            value={tagInput}
                                            onChange={(e) =>
                                                setTagInput(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addTag}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {form.watch("tags").length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {form.watch("tags").map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="gap-1"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeTag(tag)
                                                        }
                                                        className="ml-1 rounded-sm hover:bg-muted-foreground/20"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Allergens */}
                                <div className="space-y-2">
                                    <FormLabel>Allergens</FormLabel>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add an allergen..."
                                            value={allergenInput}
                                            onChange={(e) =>
                                                setAllergenInput(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addAllergen();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addAllergen}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {form.watch("allergens").length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {form
                                                .watch("allergens")
                                                .map((allergen) => (
                                                    <Badge
                                                        key={allergen}
                                                        variant="outline"
                                                        className="gap-1 border-amber-200 bg-amber-50 text-amber-700"
                                                    >
                                                        {allergen}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeAllergen(
                                                                    allergen
                                                                )
                                                            }
                                                            className="ml-1 rounded-sm hover:bg-amber-200/50"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Category & Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={categoriesLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={
                                                                categoriesLoading
                                                                    ? "Loading categories..."
                                                                    : "Select category"
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.length === 0 &&
                                                    !categoriesLoading ? (
                                                        <div className="p-2 text-sm text-muted-foreground">
                                                            No categories
                                                            available
                                                        </div>
                                                    ) : (
                                                        categories.map(
                                                            (category) => (
                                                                <SelectItem
                                                                    key={
                                                                        category.id
                                                                    }
                                                                    value={
                                                                        category.id
                                                                    }
                                                                >
                                                                    {
                                                                        category.name
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Product Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="isAvailable"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Available</FormLabel>
                                                <FormDescription className="text-xs">
                                                    Show in menu
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isFeatured"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Featured</FormLabel>
                                                <FormDescription className="text-xs">
                                                    Highlight product
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isBestSelling"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>
                                                    Best Selling
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    Mark as popular
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Product Image Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Image</CardTitle>
                                <CardDescription>
                                    Upload a product image
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value || []}
                                                    disabled={isPending}
                                                    onChange={(newFiles) =>
                                                        setFiles(newFiles)
                                                    }
                                                    onRemove={(url) =>
                                                        field.onChange(
                                                            (
                                                                field.value ||
                                                                []
                                                            ).filter(
                                                                (current) =>
                                                                    current !==
                                                                    url
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 border-t pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {mode === "create" ? "Create Product" : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
