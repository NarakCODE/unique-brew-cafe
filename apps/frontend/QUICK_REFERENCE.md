# Product API Quick Reference

## 🚀 Quick Start

```tsx
import { useProducts, useProduct, useSearchProducts } from "@/hooks";
import { api } from "@/lib/api";
```

## 📖 Hooks Cheat Sheet

### Queries (Read Operations)

```tsx
// Get paginated products
const { data, isLoading, error } = useProducts({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    isAvailable: true,
    search: "coffee",
});

// Search products
const { data } = useSearchProducts({
    q: "latte",
    page: 1,
    limit: 20,
    categoryId: "drinks",
    minPrice: 5,
    maxPrice: 15,
});

// Get single product by ID
const { data: product } = useProduct("product-id");

// Get product by slug
const { data: product } = useProductBySlug("caramel-latte");

// Get customizations
const { data } = useProductCustomizations("product-id");

// Get add-ons
const { data } = useProductAddOns("product-id");
```

### Mutations (Write Operations - Admin Only)

```tsx
// Create product
const createProduct = useCreateProduct();
createProduct.mutate({
    name: "Caramel Latte",
    slug: "caramel-latte",
    description: "Sweet and creamy",
    categoryId: "drinks",
    basePrice: 6.99,
});

// Update product
const updateProduct = useUpdateProduct();
updateProduct.mutate({
    id: "product-id",
    data: { name: "Updated Name" },
});

// Delete product
const deleteProduct = useDeleteProduct();
deleteProduct.mutate("product-id");

// Update status
const updateStatus = useUpdateProductStatus();
updateStatus.mutate({
    id: "product-id",
    isAvailable: false,
});

// Duplicate product
const duplicate = useDuplicateProduct();
duplicate.mutate("product-id");
```

## 🔧 Direct API Calls

```tsx
// Use in Server Components or API routes
import { api } from "@/lib/api";

// Get products
const products = await api.products.list({ page: 1, limit: 10 });

// Search
const results = await api.products.search({
    q: "coffee",
    page: 1,
});

// Get by ID
const product = await api.products.get("product-id");

// Get by slug
const product = await api.products.getBySlug("product-slug");

// Get customizations
const customizations = await api.products.getCustomizations("product-id");

// Get add-ons
const addons = await api.products.getAddOns("product-id");

// Admin operations
const newProduct = await api.products.create({
    /* data */
});
const updated = await api.products.update("id", {
    /* data */
});
await api.products.delete("id");
await api.products.updateStatus("id", true);
const duplicated = await api.products.duplicate("id");
```

## 📦 Response Types

```typescript
// Product list response
{
  success: true,
  data: Product[],
  pagination: {
    page: 1,
    pages: 10,
    total: 100,
    limit: 10,
    hasNext: true,
    hasPrev: false
  }
}

// Single product response
{
  success: true,
  data: Product
}

// Customizations response
{
  success: true,
  data: {
    productId: string,
    customizations: ProductCustomization[]
  }
}

// Add-ons response
{
  success: true,
  data: {
    productId: string,
    addOns: Addon[]
  }
}
```

## 🎨 Common Patterns

### Loading States

```tsx
const { data, isLoading, isError, error } = useProducts();

if (isLoading) return <Spinner />;
if (isError) return <Error message={error.message} />;
return <ProductList products={data.data} />;
```

### Mutation with Callback

```tsx
const createProduct = useCreateProduct();

const handleCreate = (data: CreateProductData) => {
    createProduct.mutate(data, {
        onSuccess: (product) => {
            console.log("Created:", product);
            router.push(`/products/${product.id}`);
        },
        onError: (error) => {
            console.error("Failed:", error);
        },
    });
};
```

### Conditional Query

```tsx
const { data } = useProduct(productId, {
    enabled: !!productId, // Only fetch if productId exists
});
```

### Dependent Queries

```tsx
const { data: product } = useProduct(id);
const { data: customizations } = useProductCustomizations(
    product?.id || "",
    { enabled: !!product?.id } // Wait for product first
);
```

## 🔑 Type Definitions

```typescript
interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    images: string[];
    basePrice: number;
    currency: "USD" | "KHR";
    preparationTime: number;
    calories?: number;
    rating?: number;
    totalReviews: number;
    isAvailable: boolean;
    isFeatured: boolean;
    isBestSelling: boolean;
    allergens: string[];
    tags: string[];
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

interface ProductCustomization {
    id: string;
    productId: string;
    customizationType: "size" | "sugar_level" | "ice_level" | "coffee_level";
    options: CustomizationOption[];
    isRequired: boolean;
    displayOrder: number;
}

interface CustomizationOption {
    id: string;
    name: string;
    priceModifier: number;
    isDefault: boolean;
}
```

## ⚡ Performance Tips

1. **Use query keys wisely** - React Query will cache based on keys
2. **Enable/disable queries** - Prevent unnecessary API calls
3. **Invalidate selectively** - Only invalidate what changed
4. **Use optimistic updates** - Update UI before API response
5. **Debounce search** - Already implemented in `useDebounce` hook

## 🎯 Best Practices

✅ **DO:**

- Use hooks in Client Components
- Use direct API calls in Server Components
- Handle loading and error states
- Type your data properly
- Use query invalidation after mutations

❌ **DON'T:**

- Call hooks conditionally
- Ignore TypeScript errors
- Skip error handling
- Fetch data in loops
- Mutate cache directly

## 🐛 Debugging

```tsx
// Enable React Query DevTools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<ReactQueryDevtools initialIsOpen={false} />;
```

## 📱 Mobile Considerations

```tsx
// Disable refetch on focus for mobile
const { data } = useProducts(
    {
        page: 1,
    },
    {
        refetchOnWindowFocus: false,
    }
);
```

## 🔒 Authentication

Admin endpoints automatically include authentication:

- Token from localStorage/cookies
- Handled by apiClient interceptors
- 401 → Redirect to login
- 403 → Show unauthorized message

## 🆘 Troubleshooting

**Problem:** Query not updating

- Check query keys are unique
- Verify invalidation is happening
- Check network tab for actual request

**Problem:** Type errors

- Ensure all types are imported
- Check for optional chaining
- Verify API response matches type

**Problem:** Mutations not working

- Check authentication token
- Verify user has admin role
- Check network errors
- Review backend logs

## 📚 Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- Full examples: `PRODUCT_API_INTEGRATION.md`
- Architecture: `ARCHITECTURE_DIAGRAM.md`
