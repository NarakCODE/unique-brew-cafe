# Quick Start Guide - State Management

A quick reference guide for using the new state management architecture.

## 🚀 Getting Started in 5 Minutes

### 1. Identify Your State Type

**Is it server data?** → Use TanStack Query hooks
**Is it client UI state?** → Use Zustand stores

### 2. Import What You Need

```typescript
// For server data (API calls)
import { useProducts, useCart, useOrders } from "@/hooks";

// For client state
import { useAuthStore, useUIStore, usePreferencesStore } from "@/store";
```

### 3. Use in Your Component

```typescript
export function MyComponent() {
  // Server state
  const { data, isLoading } = useProducts();

  // Client state
  const { viewMode, setViewMode } = usePreferencesStore();
  const { addToast } = useUIStore();

  return (/* JSX */);
}
```

## 📚 Cheat Sheet

### Common Server State Operations

```typescript
// ✅ GET data (automatic caching)
const { data, isLoading, error } = useProducts();

// ✅ GET with filters
const { data } = useProducts({ category: "coffee", page: 1 });

// ✅ GET single item
const { data: product } = useProduct(productId);

// ✅ CREATE data
const createProduct = useCreateProduct();
await createProduct.mutateAsync(data);

// ✅ UPDATE data
const updateProduct = useUpdateProduct();
await updateProduct.mutateAsync({ id, data });

// ✅ DELETE data
const deleteProduct = useDeleteProduct();
await deleteProduct.mutateAsync(id);
```

### Common Client State Operations

```typescript
// ✅ Get state
const { isSidebarOpen, activeModal } = useUIStore();

// ✅ Update state
const { toggleSidebar, openModal } = useUIStore();
toggleSidebar();
openModal("product-form", { productId: "123" });

// ✅ Show notifications
const { addToast } = useUIStore();
addToast({ type: "success", message: "Saved!" });

// ✅ Preferences
const { viewMode, setViewMode } = usePreferencesStore();
setViewMode("grid"); // Automatically saved to localStorage
```

## 🎯 Common Use Cases

### Use Case 1: List Page with Filters

```typescript
import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { usePreferencesStore } from "@/store/preferences.store";

export function ProductsPage() {
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState("all");

    // Server state - products from API
    const { data, isLoading } = useProducts({
        page,
        category: category !== "all" ? category : undefined,
        limit: usePreferencesStore((state) => state.itemsPerPage),
    });

    // Client state - view preference
    const { viewMode, setViewMode } = usePreferencesStore();

    return (
        <div>
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="all">All</option>
                <option value="coffee">Coffee</option>
            </select>

            <div className={viewMode}>
                {data?.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
```

### Use Case 2: Form with Submit

```typescript
import { useCreateProduct } from "@/hooks/use-products";
import { useUIStore } from "@/store/ui.store";

export function ProductForm() {
    const createProduct = useCreateProduct();
    const { addToast, closeModal } = useUIStore();

    const handleSubmit = async (data) => {
        try {
            await createProduct.mutateAsync(data);
            addToast({ type: "success", message: "Product created!" });
            closeModal();
        } catch (error) {
            addToast({ type: "error", message: "Failed to create product" });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* form fields */}
            <button disabled={createProduct.isPending}>
                {createProduct.isPending ? "Creating..." : "Create"}
            </button>
        </form>
    );
}
```

### Use Case 3: Shopping Cart

```typescript
import { useCart, useAddToCart } from "@/hooks/use-cart";
import { useUIStore } from "@/store/ui.store";

export function ProductCard({ product }) {
    const { data: cart } = useCart();
    const addToCart = useAddToCart();
    const { addToast } = useUIStore();

    const handleAddToCart = async () => {
        try {
            await addToCart.mutateAsync({
                productId: product.id,
                quantity: 1,
            });
            addToast({ type: "success", message: "Added to cart!" });
        } catch (error) {
            addToast({ type: "error", message: "Failed to add to cart" });
        }
    };

    return (
        <div>
            <h3>{product.name}</h3>
            <button onClick={handleAddToCart} disabled={addToCart.isPending}>
                Add to Cart
            </button>
        </div>
    );
}
```

### Use Case 4: Authentication Guard

```typescript
import { useMe } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth.store";
import { redirect } from "next/navigation";

export function ProtectedPage() {
    const { isAuthenticated } = useAuthStore();
    const { data: user, isLoading } = useMe();

    if (!isAuthenticated) {
        redirect("/login");
    }

    if (isLoading) return <div>Loading...</div>;

    return <div>Welcome, {user?.fullName}!</div>;
}
```

### Use Case 5: Modal Management

```typescript
import { useUIStore } from "@/store/ui.store";
import { useUpdateProduct } from "@/hooks/use-products";

export function ProductEditButton({ product }) {
    const { openModal } = useUIStore();

    return (
        <button onClick={() => openModal("product-edit", { product })}>
            Edit Product
        </button>
    );
}

export function ProductEditModal() {
    const { activeModal, modalData, closeModal } = useUIStore();
    const updateProduct = useUpdateProduct();

    if (activeModal !== "product-edit") return null;

    const handleSave = async (data) => {
        await updateProduct.mutateAsync({ id: modalData.product.id, data });
        closeModal();
    };

    return (
        <Modal onClose={closeModal}>
            <ProductForm
                initialData={modalData.product}
                onSubmit={handleSave}
            />
        </Modal>
    );
}
```

## 📖 Available Hooks

### Authentication (`hooks/use-auth.ts`)

-   `useMe()` - Get current user
-   `useLogin()` - Login mutation
-   `useLogout()` - Logout mutation
-   `useRegister()` - Register mutation
-   `useVerifyEmail()` - Verify email mutation
-   `useForgotPassword()` - Forgot password mutation
-   `useResetPassword()` - Reset password mutation

### Products (`hooks/use-products.ts`)

-   `useProducts(filters)` - Get paginated products
-   `useProduct(id)` - Get single product
-   `useInfiniteProducts(filters)` - Infinite scroll products
-   `usePrefetchProduct()` - Prefetch product on hover
-   `useCreateProduct()` - Create product (admin)
-   `useUpdateProduct()` - Update product (admin)
-   `useDeleteProduct()` - Delete product (admin)
-   `useToggleProductAvailability()` - Toggle availability (admin)

### Orders (`hooks/use-orders.ts`)

-   `useOrders(filters)` - Get orders (admin)
-   `useOrder(id)` - Get single order
-   `useMyOrders(filters)` - Get user's orders
-   `useOrderStatus(id)` - Poll order status
-   `useCreateOrder()` - Create order
-   `useUpdateOrderStatus()` - Update status (admin)
-   `useCancelOrder()` - Cancel order

### Cart (`hooks/use-cart.ts`)

-   `useCart()` - Get cart
-   `useAddToCart()` - Add item (optimistic)
-   `useUpdateCartItem()` - Update quantity (optimistic)
-   `useRemoveFromCart()` - Remove item (optimistic)
-   `useClearCart()` - Clear cart

### Favorites (`hooks/use-favorites.ts`)

-   `useFavorites()` - Get favorites
-   `useIsFavorite(id)` - Check if favorited
-   `useAddFavorite()` - Add to favorites (optimistic)
-   `useRemoveFavorite()` - Remove from favorites (optimistic)
-   `useToggleFavorite()` - Toggle favorite
-   `useFavoritesManager()` - All-in-one hook

### Users (`hooks/use-users.ts`)

-   `useUsers(filters)` - Get users (admin)
-   `useUser(id)` - Get single user
-   `useUpdateUser()` - Update user (admin)
-   `useDeleteUser()` - Delete user (admin)
-   `useUpdateUserRole()` - Update role (admin)

### Notifications (`hooks/use-notifications.ts`)

-   `useNotifications(filters)` - Get notifications (polls every 60s)
-   `useUnreadNotificationsCount()` - Get unread count
-   `useMarkNotificationAsRead()` - Mark as read
-   `useMarkAllNotificationsAsRead()` - Mark all as read
-   `useDeleteNotification()` - Delete notification

## 🏪 Available Stores

### Auth Store (`store/auth.store.ts`)

```typescript
const {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    setAuth,
    updateAccessToken,
    logout,
} = useAuthStore();
```

### UI Store (`store/ui.store.ts`)

```typescript
const {
    // Sidebar
    isSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,

    // Modals
    activeModal,
    modalData,
    openModal,
    closeModal,

    // Loading
    globalLoading,
    setGlobalLoading,

    // Toasts
    toasts,
    addToast,
    removeToast,

    // Mobile menu
    isMobileMenuOpen,
    toggleMobileMenu,

    // Search
    isSearchOpen,
    searchQuery,
    toggleSearch,
    setSearchQuery,
} = useUIStore();
```

### Preferences Store (`store/preferences.store.ts`)

```typescript
const {
    // Display
    viewMode,
    itemsPerPage,
    setViewMode,
    setItemsPerPage,

    // Localization
    language,
    currency,
    setLanguage,
    setCurrency,

    // Notifications
    emailNotifications,
    pushNotifications,
    setEmailNotifications,
    setPushNotifications,

    // Accessibility
    highContrast,
    reducedMotion,
    fontSize,
    setHighContrast,
    setReducedMotion,
    setFontSize,

    // Table preferences
    setTablePreferences,
    getTablePreferences,

    // Recent searches
    recentSearches,
    addRecentSearch,
    clearRecentSearches,

    // Reset
    resetPreferences,
} = usePreferencesStore();
```

## ⚡ Pro Tips

1. **Use selectors for performance**

    ```typescript
    // ❌ Re-renders on ANY UI state change
    const uiStore = useUIStore();

    // ✅ Only re-renders when sidebar changes
    const { isSidebarOpen } = useUIStore((state) => ({
        isSidebarOpen: state.isSidebarOpen,
    }));
    ```

2. **Leverage optimistic updates**

    ```typescript
    // Cart and favorites have optimistic updates built-in
    // They update instantly and rollback on error automatically
    const addToCart = useAddToCart();
    await addToCart.mutateAsync({ productId, quantity });
    // ✨ UI updates immediately, syncs with server in background
    ```

3. **Use query devtools in development**

    - Open React Query Devtools (bottom of screen in dev mode)
    - Inspect cache, queries, and mutations
    - Debug stale/fresh data

4. **Prefetch on hover for better UX**

    ```typescript
    const prefetch = usePrefetchProduct();

    <Link href={`/products/${id}`} onMouseEnter={() => prefetch(id)}>
        Product
    </Link>;
    ```

5. **Check loading states**

    ```typescript
    const { data, isLoading, isFetching } = useProducts();

    // isLoading: true for initial load
    // isFetching: true for background refetches
    ```

## 🐛 Debugging

### React Query Devtools

-   Press the floating button (bottom-left in dev mode)
-   View all queries and their states
-   Manually trigger refetches
-   Inspect query data and errors

### Zustand Devtools

-   Install Redux DevTools Extension
-   Stores are configured with `devtools()`
-   View and time-travel through state changes

### Common Issues

**Issue**: Stale data after mutation
**Fix**: Check that query invalidation is configured in the mutation hook

**Issue**: Too many re-renders
**Fix**: Use selectors or split state into smaller pieces

**Issue**: Data not updating
**Fix**: Check `staleTime` configuration in query

## 📚 Further Reading

-   [Full Documentation](./STATE_MANAGEMENT.md)
-   [Migration Guide](./MIGRATION_GUIDE.md)
-   [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md)
-   [API Client README](../src/lib/api/README.md)
