# State Management Architecture

This document outlines the state management strategy for the Corner Coffee application, following best practices for separating **client-side state** (Zustand) from **server state** (TanStack Query).

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Client State (Zustand)](#client-state-zustand)
4. [Server State (TanStack Query)](#server-state-tanstack-query)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Testing](#testing)

## Overview

We use a dual-store approach to manage application state:

-   **Zustand**: Manages client-side state (UI state, user preferences, local data)
-   **TanStack Query**: Manages server state (API data, caching, synchronization)

```
┌─────────────────────────────────────────────────┐
│                 Application State                │
├─────────────────────┬───────────────────────────┤
│   Client State      │      Server State         │
│    (Zustand)        │   (TanStack Query)        │
├─────────────────────┼───────────────────────────┤
│ • UI State          │ • API Data                │
│ • Preferences       │ • Caching                 │
│ • Authentication    │ • Synchronization         │
│   Tokens            │ • Background Updates      │
│ • Local Filters     │ • Optimistic Updates      │
└─────────────────────┴───────────────────────────┘
```

## Architecture Principles

### 1. **Separation of Concerns**

-   **Client State**: Local, ephemeral data that doesn't need to sync with the server
-   **Server State**: Remote data from APIs that needs to stay synchronized

### 2. **Single Source of Truth**

-   Server data is managed exclusively by TanStack Query
-   Client preferences are managed by Zustand with localStorage persistence
-   Auth tokens are stored in Zustand, but user data comes from the server

### 3. **Optimistic Updates**

-   Critical user interactions (cart, favorites) use optimistic updates
-   Failed operations roll back automatically

### 4. **Type Safety**

-   All stores and hooks are fully typed with TypeScript
-   Query keys are type-safe and centralized

## Client State (Zustand)

### Stores

#### 1. **Auth Store** (`store/auth.store.ts`)

**Purpose**: Stores authentication tokens and manages auth state

**What it stores**:

-   ✅ Access token (JWT)
-   ✅ Refresh token
-   ✅ User object (cached from server)
-   ✅ Authentication status

**Actions**:

-   `setAuth(data)` - Store auth tokens and user
-   `updateAccessToken(token)` - Update access token after refresh
-   `logout()` - Clear all auth data

**Persistence**: Yes (localStorage)

```typescript
import { useAuthStore } from "@/store/auth.store";

// In components
const { accessToken, user, isAuthenticated } = useAuthStore();
const { setAuth, logout } = useAuthStore();
```

#### 2. **UI Store** (`store/ui.store.ts`)

**Purpose**: Manages UI state and interactions

**What it stores**:

-   Sidebar open/collapsed state
-   Active modals and modal data
-   Global loading states
-   Toast notifications (client-side)
-   Mobile menu state
-   Search overlay state

**Actions**:

-   `toggleSidebar()`, `setSidebarOpen(bool)`
-   `openModal(id, data)`, `closeModal()`
-   `setGlobalLoading(bool, message?)`
-   `addToast(toast)`, `removeToast(id)`
-   `toggleMobileMenu()`, `setMobileMenuOpen(bool)`
-   `toggleSearch()`, `setSearchQuery(query)`

**Persistence**: No (ephemeral UI state)

```typescript
import { useUIStore } from "@/store/ui.store";

// Toggle sidebar
const { toggleSidebar } = useUIStore();

// Show modal
const { openModal, closeModal } = useUIStore();
openModal("product-form", { productId: "123" });

// Add toast notification
const { addToast } = useUIStore();
addToast({ type: "success", message: "Product created!" });
```

#### 3. **Preferences Store** (`store/preferences.store.ts`)

**Purpose**: Stores user preferences and settings

**What it stores**:

-   Display settings (view mode, items per page)
-   Localization (language, currency, timezone)
-   Notification preferences
-   Accessibility settings
-   Table column preferences
-   Recent searches

**Actions**:

-   `setViewMode(mode)`, `setItemsPerPage(count)`
-   `setLanguage(lang)`, `setCurrency(currency)`
-   `setTablePreferences(tableId, prefs)`
-   `addRecentSearch(query)`, `clearRecentSearches()`
-   `resetPreferences()` - Reset to defaults

**Persistence**: Yes (localStorage)

```typescript
import { usePreferencesStore } from "@/store/preferences.store";

// Get display preferences
const { viewMode, itemsPerPage } = usePreferencesStore();

// Update preferences
const { setViewMode, setLanguage } = usePreferencesStore();
setViewMode("list");
setLanguage("en");
```

## Server State (TanStack Query)

### Hooks

All server state hooks follow a consistent pattern with query keys, queries, and mutations.

#### 1. **Authentication** (`hooks/use-auth.ts`)

```typescript
import { useLogin, useLogout, useMe, useRegister } from "@/hooks/use-auth";

// Login
const login = useLogin();
await login.mutateAsync({ email, password });

// Get current user
const { data: user } = useMe();

// Logout
const logout = useLogout();
logout.mutate();
```

#### 2. **Products** (`hooks/use-products.ts`)

```typescript
import {
  useProducts,
  useProduct,
  useInfiniteProducts,
  usePrefetchProduct,
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/use-products';

// Get products with filters
const { data, isLoading } = useProducts({
  page: 1,
  limit: 20,
  category: 'coffee',
});

// Get single product
const { data: product } = useProduct(productId);

// Infinite scroll
const {
  data,
  fetchNextPage,
  hasNextPage,
} = useInfiniteProducts({ category: 'coffee' });

// Prefetch on hover
const prefetch = usePrefetchProduct();
onMouseEnter={() => prefetch(productId)}

// Create product (admin)
const createProduct = useCreateProduct();
await createProduct.mutateAsync(productData);
```

#### 3. **Orders** (`hooks/use-orders.ts`)

```typescript
import {
    useOrders,
    useOrder,
    useMyOrders,
    useCreateOrder,
    useUpdateOrderStatus,
    useCancelOrder,
} from "@/hooks/use-orders";

// Get user's orders
const { data: orders } = useMyOrders({ page: 1 });

// Get order details
const { data: order } = useOrder(orderId);

// Create order
const createOrder = useCreateOrder();
await createOrder.mutateAsync(orderData);

// Update status (admin)
const updateStatus = useUpdateOrderStatus();
await updateStatus.mutateAsync({ id, status, notes });
```

#### 4. **Cart** (`hooks/use-cart.ts`)

**Features optimistic updates** for better UX

```typescript
import {
    useCart,
    useAddToCart,
    useUpdateCartItem,
    useRemoveFromCart,
    useClearCart,
} from "@/hooks/use-cart";

// Get cart
const { data: cart } = useCart();

// Add to cart (optimistic)
const addToCart = useAddToCart();
await addToCart.mutateAsync({ productId, quantity });

// Update quantity (optimistic)
const updateItem = useUpdateCartItem();
await updateItem.mutateAsync({ itemId, quantity });
```

#### 5. **Favorites** (`hooks/use-favorites.ts`)

**Features optimistic updates**

```typescript
import {
    useFavorites,
    useFavoritesManager,
    useAddFavorite,
    useRemoveFavorite,
} from "@/hooks/use-favorites";

// Using the manager hook (recommended)
const { favorites, isFavorite, toggleFavorite } = useFavoritesManager();

// Check and toggle
if (isFavorite(productId)) {
    await toggleFavorite(productId);
}
```

#### 6. **Users** (`hooks/use-users.ts`)

Admin-only user management

```typescript
import {
    useUsers,
    useUser,
    useUpdateUser,
    useDeleteUser,
    useUpdateUserRole,
} from "@/hooks/use-users";

// Get users (admin)
const { data: users } = useUsers({ page: 1, role: "user" });

// Update user role
const updateRole = useUpdateUserRole();
await updateRole.mutateAsync({ id, role: "admin" });
```

#### 7. **Notifications** (`hooks/use-notifications.ts`)

**Features automatic polling**

```typescript
import {
    useNotifications,
    useUnreadNotificationsCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
} from "@/hooks/use-notifications";

// Get notifications (auto-refreshes every minute)
const { data: notifications } = useNotifications({ unreadOnly: true });

// Get unread count
const { count, hasUnread } = useUnreadNotificationsCount();

// Mark as read
const markAsRead = useMarkNotificationAsRead();
await markAsRead.mutateAsync(notificationId);
```

## Usage Examples

### Example 1: Product List Page

```typescript
"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { usePreferencesStore } from "@/store/preferences.store";

export function ProductListPage() {
    const [page, setPage] = useState(1);
    const { viewMode, itemsPerPage } = usePreferencesStore();

    const { data, isLoading, error } = useProducts({
        page,
        limit: itemsPerPage,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading products</div>;

    return (
        <div className={viewMode === "grid" ? "grid" : "list"}>
            {data.data.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
```

### Example 2: Shopping Cart

```typescript
"use client";

import {
    useCart,
    useUpdateCartItem,
    useRemoveFromCart,
} from "@/hooks/use-cart";

export function ShoppingCart() {
    const { data: cart, isLoading } = useCart();
    const updateItem = useUpdateCartItem();
    const removeItem = useRemoveFromCart();

    const handleQuantityChange = async (itemId: string, quantity: number) => {
        try {
            await updateItem.mutateAsync({ itemId, quantity });
        } catch (error) {
            // Error is automatically handled and rolled back
            console.error("Failed to update cart");
        }
    };

    return (
        <div>
            {cart?.items.map((item) => (
                <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={(qty) =>
                        handleQuantityChange(item.id, qty)
                    }
                    onRemove={() => removeItem.mutate(item.id)}
                />
            ))}
        </div>
    );
}
```

### Example 3: User Authentication

```typescript
"use client";

import { useLogin } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";

export function LoginForm() {
    const login = useLogin();
    const { isAuthenticated } = useAuthStore();
    const { addToast } = useUIStore();

    const handleSubmit = async (credentials: LoginCredentials) => {
        try {
            await login.mutateAsync(credentials);
            // Success! Automatically redirected by the hook
            addToast({
                type: "success",
                message: "Welcome back!",
            });
        } catch (error) {
            addToast({
                type: "error",
                message: "Login failed. Please check your credentials.",
            });
        }
    };

    return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## Best Practices

### 1. **Use the Right Tool**

-   ✅ **Zustand**: UI state (modals, sidebar), preferences, auth tokens
-   ✅ **TanStack Query**: API data, server-side state
-   ❌ **Don't**: Store server data in Zustand
-   ❌ **Don't**: Store UI state in TanStack Query

### 2. **Query Key Management**

Always use centralized query keys:

```typescript
// Good ✅
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters) => [...productKeys.lists(), filters] as const,
};

// Bad ❌
useQuery({ queryKey: ['products', page], ... });
```

### 3. **Optimistic Updates**

Use for non-critical user actions (favorites, cart):

```typescript
const addToCart = useAddToCart();

onMutate: async (newItem) => {
  // Cancel queries
  await queryClient.cancelQueries({ queryKey: cartKeys.cart() });

  // Snapshot current
  const previous = queryClient.getQueryData(cartKeys.cart());

  // Optimistically update
  queryClient.setQueryData(cartKeys.cart(), (old) => ({
    ...old,
    items: [...old.items, newItem],
  }));

  return { previous };
},

onError: (err, vars, context) => {
  // Rollback on error
  queryClient.setQueryData(cartKeys.cart(), context.previous);
},
```

### 4. **Selectors for Performance**

Use selectors to avoid unnecessary re-renders:

```typescript
// Only re-renders when sidebar state changes
const { isOpen, isCollapsed } = useUIStore(selectSidebarState);

// vs. re-renders on any UI change
const { isSidebarOpen, isSidebarCollapsed } = useUIStore();
```

### 5. **Invalidation Strategy**

Be specific with query invalidation:

```typescript
// Good ✅ - Only invalidates affected queries
queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
queryClient.invalidateQueries({ queryKey: productKeys.lists() });

// Okay 👌 - Invalidates all product queries
queryClient.invalidateQueries({ queryKey: productKeys.all });

// Bad ❌ - Invalidates everything
queryClient.clear();
```

## Testing

### Testing Zustand Stores

```typescript
import { renderHook, act } from "@testing-library/react";
import { useUIStore } from "@/store/ui.store";

test("should toggle sidebar", () => {
    const { result } = renderHook(() => useUIStore());

    expect(result.current.isSidebarOpen).toBe(true);

    act(() => {
        result.current.toggleSidebar();
    });

    expect(result.current.isSidebarOpen).toBe(false);
});
```

### Testing TanStack Query Hooks

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProducts } from "@/hooks/use-products";

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

test("should fetch products", async () => {
    const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
});
```

## Migration Guide

If you have existing state management code, follow these steps:

1. **Identify state types**: Client vs. Server
2. **Move server data to TanStack Query hooks**
3. **Keep client state in Zustand stores**
4. **Update components to use new hooks**
5. **Remove old state management code**
6. **Test thoroughly**

## Troubleshooting

### Issue: Stale data after mutation

**Solution**: Ensure you're invalidating the right queries

```typescript
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
};
```

### Issue: Too many re-renders

**Solution**: Use selectors or split into smaller stores

```typescript
// Instead of
const store = useUIStore();

// Use
const { isSidebarOpen } = useUIStore((state) => ({
    isSidebarOpen: state.isSidebarOpen,
}));
```

### Issue: Optimistic update not rolling back

**Solution**: Ensure you're returning context and handling errors

```typescript
onMutate: async () => {
  const previous = queryClient.getQueryData(key);
  return { previous }; // Must return context
},
onError: (err, vars, context) => {
  queryClient.setQueryData(key, context.previous);
},
```

## Resources

-   [Zustand Documentation](https://zustand-demo.pmnd.rs/)
-   [TanStack Query Documentation](https://tanstack.com/query/latest)
-   [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
