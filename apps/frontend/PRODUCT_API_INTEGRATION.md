# Product API Integration Guide

This document provides comprehensive examples of using all product endpoints in the frontend.

## Available Endpoints

### Public Endpoints (No Authentication Required)

1. **Get Products List** - `GET /api/products`
2. **Search Products** - `GET /api/products/search?q=query`
3. **Get Product by ID** - `GET /api/products/:id`
4. **Get Product by Slug** - `GET /api/products/slug/:slug`
5. **Get Product Customizations** - `GET /api/products/:id/customizations`
6. **Get Product Add-ons** - `GET /api/products/:id/addons`

### Admin Only Endpoints (Requires Authentication + Admin Role)

7. **Create Product** - `POST /api/products`
8. **Update Product** - `PATCH /api/products/:id`
9. **Delete Product** - `DELETE /api/products/:id`
10. **Update Product Status** - `PATCH /api/products/:productId/status`
11. **Duplicate Product** - `POST /api/products/:productId/duplicate`

---

## Usage Examples

### 1. Get Products List

```tsx
import { useProducts } from "@/hooks";

function ProductsPage() {
    const { data, isLoading, error } = useProducts({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: "coffee",
        isAvailable: true,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {data?.data.map((product) => (
                <div key={product.id}>{product.name}</div>
            ))}
        </div>
    );
}
```

### 2. Search Products

```tsx
import { useSearchProducts } from "@/hooks";

function SearchPage() {
    const [query, setQuery] = useState("");

    const { data, isLoading } = useSearchProducts({
        q: query,
        page: 1,
        limit: 20,
        categoryId: "some-category-id",
        isFeatured: true,
        minPrice: 5,
        maxPrice: 20,
    });

    return (
        <div>
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
            />
            {isLoading && <div>Searching...</div>}
            {data?.data.map((product) => (
                <div key={product.id}>{product.name}</div>
            ))}
        </div>
    );
}
```

### 3. Get Product by ID

```tsx
import { useProduct } from "@/hooks";

function ProductDetailPage({ productId }: { productId: string }) {
    const { data: product, isLoading } = useProduct(productId);

    if (isLoading) return <div>Loading...</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>Price: ${product.basePrice}</p>
        </div>
    );
}
```

### 4. Get Product by Slug

```tsx
import { useProductBySlug } from "@/hooks";

function ProductPage({ slug }: { slug: string }) {
    const { data: product, isLoading } = useProductBySlug(slug);

    if (isLoading) return <div>Loading...</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
        </div>
    );
}
```

### 5. Get Product Customizations

```tsx
import { useProductCustomizations } from "@/hooks";

function ProductCustomizer({ productId }: { productId: string }) {
    const { data, isLoading } = useProductCustomizations(productId);

    if (isLoading) return <div>Loading customizations...</div>;

    return (
        <div>
            <h2>Customize Your Product</h2>
            {data?.customizations.map((customization) => (
                <div key={customization.id}>
                    <h3>{customization.customizationType}</h3>
                    {customization.options.map((option) => (
                        <label key={option.id}>
                            <input
                                type="radio"
                                name={customization.customizationType}
                                value={option.id}
                                defaultChecked={option.isDefault}
                            />
                            {option.name} (+${option.priceModifier})
                        </label>
                    ))}
                </div>
            ))}
        </div>
    );
}
```

### 6. Get Product Add-ons

```tsx
import { useProductAddOns } from "@/hooks";

function ProductAddOns({ productId }: { productId: string }) {
    const { data, isLoading } = useProductAddOns(productId);
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

    if (isLoading) return <div>Loading add-ons...</div>;

    return (
        <div>
            <h2>Add-ons</h2>
            {data?.addOns.map((addon) => (
                <label key={addon.id}>
                    <input
                        type="checkbox"
                        checked={selectedAddOns.includes(addon.id)}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedAddOns([
                                    ...selectedAddOns,
                                    addon.id,
                                ]);
                            } else {
                                setSelectedAddOns(
                                    selectedAddOns.filter(
                                        (id) => id !== addon.id
                                    )
                                );
                            }
                        }}
                    />
                    {addon.name} (+${addon.price})
                </label>
            ))}
        </div>
    );
}
```

### 7. Create Product (Admin Only)

```tsx
import { useCreateProduct } from "@/hooks";
import { useRouter } from "next/navigation";

function CreateProductForm() {
    const router = useRouter();
    const createProduct = useCreateProduct();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const productData = {
            name: formData.get("name") as string,
            slug: formData.get("slug") as string,
            description: formData.get("description") as string,
            categoryId: formData.get("categoryId") as string,
            basePrice: parseFloat(formData.get("basePrice") as string),
            currency: "USD" as const,
            preparationTime: parseInt(
                formData.get("preparationTime") as string
            ),
            isAvailable: true,
        };

        createProduct.mutate(productData, {
            onSuccess: () => {
                router.push("/products");
            },
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Product Name" required />
            <input name="slug" placeholder="product-slug" required />
            <textarea name="description" placeholder="Description" required />
            <input name="categoryId" placeholder="Category ID" required />
            <input name="basePrice" type="number" step="0.01" required />
            <input name="preparationTime" type="number" required />
            <button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? "Creating..." : "Create Product"}
            </button>
        </form>
    );
}
```

### 8. Update Product (Admin Only)

```tsx
import { useUpdateProduct, useProduct } from "@/hooks";

function EditProductForm({ productId }: { productId: string }) {
    const { data: product } = useProduct(productId);
    const updateProduct = useUpdateProduct();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const updates = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            basePrice: parseFloat(formData.get("basePrice") as string),
        };

        updateProduct.mutate({ id: productId, data: updates });
    };

    if (!product) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" defaultValue={product.name} required />
            <textarea
                name="description"
                defaultValue={product.description}
                required
            />
            <input
                name="basePrice"
                type="number"
                defaultValue={product.basePrice}
                required
            />
            <button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? "Updating..." : "Update Product"}
            </button>
        </form>
    );
}
```

### 9. Delete Product (Admin Only)

```tsx
import { useDeleteProduct } from "@/hooks";

function DeleteProductButton({ productId }: { productId: string }) {
    const deleteProduct = useDeleteProduct();

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteProduct.mutate(productId);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
            className="bg-red-500 text-white px-4 py-2 rounded"
        >
            {deleteProduct.isPending ? "Deleting..." : "Delete Product"}
        </button>
    );
}
```

### 10. Update Product Status (Admin Only)

```tsx
import { useUpdateProductStatus } from "@/hooks";

function ProductStatusToggle({
    productId,
    currentStatus,
}: {
    productId: string;
    currentStatus: boolean;
}) {
    const updateStatus = useUpdateProductStatus();

    const handleToggle = () => {
        updateStatus.mutate({
            id: productId,
            isAvailable: !currentStatus,
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={updateStatus.isPending}
            className={currentStatus ? "bg-green-500" : "bg-gray-500"}
        >
            {currentStatus ? "Available" : "Unavailable"}
        </button>
    );
}
```

### 11. Duplicate Product (Admin Only)

```tsx
import { useDuplicateProduct } from "@/hooks";

function DuplicateProductButton({ productId }: { productId: string }) {
    const duplicateProduct = useDuplicateProduct();

    const handleDuplicate = () => {
        duplicateProduct.mutate(productId);
    };

    return (
        <button
            onClick={handleDuplicate}
            disabled={duplicateProduct.isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded"
        >
            {duplicateProduct.isPending ? "Duplicating..." : "Duplicate"}
        </button>
    );
}
```

---

## Direct API Calls (Without Hooks)

If you need to call the API directly (e.g., in server components or API routes):

```typescript
import { api } from "@/lib/api";

// Get products
const products = await api.products.list({
    page: 1,
    limit: 10,
});

// Search products
const searchResults = await api.products.search({
    q: "coffee",
    page: 1,
    limit: 20,
});

// Get product by ID
const product = await api.products.get("product-id");

// Get product by slug
const productBySlug = await api.products.getBySlug("product-slug");

// Get customizations
const customizations = await api.products.getCustomizations("product-id");

// Get add-ons
const addons = await api.products.getAddOns("product-id");

// Create product (admin only)
const newProduct = await api.products.create({
    name: "New Product",
    slug: "new-product",
    description: "Description",
    categoryId: "category-id",
    basePrice: 10.99,
});

// Update product (admin only)
const updatedProduct = await api.products.update("product-id", {
    name: "Updated Name",
});

// Delete product (admin only)
await api.products.delete("product-id");

// Update status (admin only)
await api.products.updateStatus("product-id", true);

// Duplicate product (admin only)
const duplicated = await api.products.duplicate("product-id");
```

---

## Type Safety

All endpoints are fully type-safe. TypeScript will enforce correct parameter types and provide autocomplete:

```typescript
import type {
    Product,
    CreateProductData,
    UpdateProductData,
    ProductCustomization,
    CustomizationOption,
} from "@/types";

// Type-safe product data
const product: Product = {
    id: "1",
    name: "Espresso",
    slug: "espresso",
    description: "Strong coffee",
    categoryId: "coffee",
    images: [],
    basePrice: 3.5,
    currency: "USD",
    preparationTime: 5,
    totalReviews: 0,
    isAvailable: true,
    isFeatured: false,
    isBestSelling: false,
    allergens: [],
    tags: ["coffee", "hot"],
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
```

---

## Error Handling

All hooks automatically handle errors with toast notifications. You can also handle errors manually:

```tsx
const { data, error, isError } = useProducts({ page: 1 });

if (isError) {
    console.error("Failed to fetch products:", error);
    return <ErrorComponent message={error.message} />;
}
```

For mutations:

```tsx
const createProduct = useCreateProduct();

createProduct.mutate(productData, {
    onSuccess: (data) => {
        console.log("Product created:", data);
    },
    onError: (error) => {
        console.error("Failed to create product:", error);
    },
});
```

---

## Best Practices

1. **Use hooks in components** - They handle caching, loading states, and errors automatically
2. **Use direct API calls in Server Components** - Next.js App Router server components should use `api.*` methods
3. **Enable/disable queries conditionally** - Use the `enabled` option to prevent unnecessary requests
4. **Invalidate queries after mutations** - The hooks already do this automatically via `queryClient.invalidateQueries`
5. **Handle loading and error states** - Always show appropriate UI for loading and error states

---

## Complete Example: Product Detail Page

Here's a comprehensive example that uses multiple endpoints:

```tsx
"use client";

import { useState } from "react";
import {
    useProductBySlug,
    useProductCustomizations,
    useProductAddOns,
} from "@/hooks";
import Image from "next/image";

export default function ProductDetailPage({ slug }: { slug: string }) {
    const { data: product, isLoading } = useProductBySlug(slug);
    const { data: customizationsData } = useProductCustomizations(
        product?.id || ""
    );
    const { data: addOnsData } = useProductAddOns(product?.id || "");

    const [selectedCustomizations, setSelectedCustomizations] = useState<
        Record<string, string>
    >({});
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

    if (isLoading) return <div>Loading product...</div>;
    if (!product) return <div>Product not found</div>;

    const calculateTotal = () => {
        let total = product.basePrice;

        // Add customization price modifiers
        customizationsData?.customizations.forEach((customization) => {
            const selectedOptionId =
                selectedCustomizations[customization.customizationType];
            if (selectedOptionId) {
                const option = customization.options.find(
                    (opt) => opt.id === selectedOptionId
                );
                if (option) total += option.priceModifier;
            }
        });

        // Add add-on prices
        addOnsData?.addOns.forEach((addon) => {
            if (selectedAddOns.includes(addon.id)) {
                total += addon.price;
            }
        });

        return total;
    };

    return (
        <div className="container mx-auto p-6">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Product Images */}
                <div>
                    {product.images.length > 0 && (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={600}
                            height={600}
                            className="rounded-lg"
                        />
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-6">{product.description}</p>
                    <p className="text-2xl font-bold mb-6">
                        ${product.basePrice}
                    </p>

                    {/* Customizations */}
                    {customizationsData?.customizations.map((customization) => (
                        <div key={customization.id} className="mb-6">
                            <h3 className="font-semibold mb-2">
                                {customization.customizationType.replace(
                                    "_",
                                    " "
                                )}
                                {customization.isRequired && " *"}
                            </h3>
                            <div className="space-y-2">
                                {customization.options.map((option) => (
                                    <label
                                        key={option.id}
                                        className="flex items-center"
                                    >
                                        <input
                                            type="radio"
                                            name={
                                                customization.customizationType
                                            }
                                            value={option.id}
                                            defaultChecked={option.isDefault}
                                            onChange={(e) =>
                                                setSelectedCustomizations({
                                                    ...selectedCustomizations,
                                                    [customization.customizationType]:
                                                        e.target.value,
                                                })
                                            }
                                            className="mr-2"
                                        />
                                        {option.name}
                                        {option.priceModifier !== 0 && (
                                            <span className="ml-2 text-gray-500">
                                                (+${option.priceModifier})
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Add-ons */}
                    {addOnsData && addOnsData.addOns.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Add-ons</h3>
                            <div className="space-y-2">
                                {addOnsData.addOns.map((addon) => (
                                    <label
                                        key={addon.id}
                                        className="flex items-center"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAddOns.includes(
                                                addon.id
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedAddOns([
                                                        ...selectedAddOns,
                                                        addon.id,
                                                    ]);
                                                } else {
                                                    setSelectedAddOns(
                                                        selectedAddOns.filter(
                                                            (id) =>
                                                                id !== addon.id
                                                        )
                                                    );
                                                }
                                            }}
                                            className="mr-2"
                                        />
                                        {addon.name} (+${addon.price})
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Total Price */}
                    <div className="border-t pt-4 mb-6">
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total:</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
```

This example demonstrates:

- Using multiple hooks together
- Handling customizations and add-ons
- Calculating dynamic pricing
- Building an interactive product page
