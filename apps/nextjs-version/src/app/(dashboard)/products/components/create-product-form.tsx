"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  X,
  Loader2,
  Wand2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useUpload } from "@/hooks/use-upload";
import { UploadResponse } from "@/api/upload";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createProductSchema,
  type CreateProductFormValues,
} from "../validations/product.validation";
import type { Category } from "@/types/category";

interface CreateProductFormProps {
  onSuccess: () => void;
  initialData?: Product | null;
  productId?: string;
}

export function CreateProductForm({
  onSuccess,
  initialData,
  productId,
}: CreateProductFormProps) {
  const isEditMode = !!productId && !!initialData;
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct(productId || "");
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategories();
  const { mutate: uploadImage, isPending: isUploading } = useUpload();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description,
          categoryId:
            typeof initialData.categoryId === "string"
              ? initialData.categoryId
              : initialData.categoryId?._id || "",
          images: initialData.images.map((url) => ({ url })),
          basePrice: initialData.basePrice,
          sizes: (initialData as any).sizes || [{ name: "", price: 0 }],
          isAvailable: initialData.isAvailable,
          isFeatured: initialData.isFeatured,
        }
      : {
          name: "",
          slug: "",
          description: "",
          categoryId: "",
          images: [{ url: "" }], // Initial object for Type Safety
          basePrice: 0,
          sizes: [{ name: "", price: 0 }],
          isAvailable: true,
          isFeatured: false,
        },
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Auto-generate slug when name changes, unless slug is manually touched
  const watchedName = form.watch("name");
  useEffect(() => {
    const isSlugTouched = form.getFieldState("slug").isDirty;
    if (watchedName && !isSlugTouched) {
      form.setValue("slug", generateSlug(watchedName));
    }
  }, [watchedName, form]);

  const handleImageUpload = (file: File, index: number) => {
    if (file) {
      setUploadingIndex(index);
      uploadImage(file, {
        onSuccess: (response: UploadResponse) => {
          form.setValue(`images.${index}.url`, response.data.url);
          setUploadingIndex(null);
          toast.success("Image uploaded successfully");
        },
        onError: () => {
          setUploadingIndex(null);
        },
      });
    }
  };

  const handleSubmit = async (data: CreateProductFormValues) => {
    try {
      // Transform the internal object array back to string array for API
      const apiPayload = {
        ...data,
        images: data.images.map((img: { url: string }) => img.url),
      };

      if (isEditMode && updateProductMutation) {
        await updateProductMutation.mutateAsync(apiPayload);
        // Success toast is handled by the mutation
        onSuccess();
      } else {
        await createProductMutation.mutateAsync(apiPayload);
        toast.success("Product created successfully");
        form.reset();
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? "update" : "create"} product`,
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Product Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Cappuccino" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input placeholder="e.g., cappuccino" {...field} />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      form.setValue(
                        "slug",
                        generateSlug(form.getValues("name")),
                      )
                    }
                    title="Regenerate slug"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                URL-friendly version of the product name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Product details..."
                  className="min-h-25"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    (categoriesData as Category[])?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Images Field Array */}
        <div className="space-y-4">
          <FormLabel>Product Images</FormLabel>
          <FormDescription>
            Upload product images or provide URLs. Click the upload button to
            select a file.
          </FormDescription>
          {imageFields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`images.${index}.url`}
              render={({ field: urlField }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="https://example.com/image.jpg or upload"
                          value={urlField.value}
                          onChange={urlField.onChange}
                          disabled={uploadingIndex === index}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`image-upload-${index}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, index);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            document
                              .getElementById(`image-upload-${index}`)
                              ?.click()
                          }
                          disabled={uploadingIndex === index}
                          title="Upload image"
                        >
                          {uploadingIndex === index ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {urlField.value && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const imgWindow = window.open(
                              urlField.value,
                              "_blank",
                            );
                            if (imgWindow) imgWindow.focus();
                          }}
                          title="Preview image"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {imageFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(index)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendImage({ url: "" })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Image Slot
          </Button>
        </div>

        {/* Base Price */}
        <FormField
          control={form.control}
          name="basePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sizes Field Array */}
        <div className="space-y-4">
          <FormLabel>Product Sizes</FormLabel>
          {sizeFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <FormField
                control={form.control}
                name={`sizes.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Size Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`sizes.${index}.price`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {sizeFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSize(index)}
                  className="mt-2 text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSize({ name: "", price: 0 })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Size
          </Button>
        </div>

        {/* Switches */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Available</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={
            createProductMutation.isPending ||
            (updateProductMutation?.isPending ?? false)
          }
        >
          {(createProductMutation.isPending ||
            updateProductMutation?.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isEditMode ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}
