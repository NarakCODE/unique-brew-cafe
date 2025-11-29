# Migration Guide: Refactoring to New State Management

This guide helps you migrate existing components from old state management patterns to the new Zustand + TanStack Query architecture.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Common Patterns](#common-patterns)
3. [Component Examples](#component-examples)
4. [Checklist](#checklist)

## Quick Reference

### State Type Decision Tree

```
Is this state related to server data?
├─ YES → Use TanStack Query hooks (hooks/use-*.ts)
│   ├─ Read-only → useQuery
│   ├─ Create/Update/Delete → useMutation
│   └─ Infinite scroll → useInfiniteQuery
│
└─ NO → Use Zustand stores (store/*.store.ts)
    ├─ Auth tokens → useAuthStore
    ├─ UI state → useUIStore
    └─ User preferences → usePreferencesStore
```

### Common Replacements

| Old Pattern             | New Pattern              |
| ----------------------- | ------------------------ |
| `useState` for API data | `useQuery` from hooks    |
| `useEffect` with fetch  | `useQuery`               |
| Manual loading states   | `isLoading` from query   |
| Manual error handling   | `error` from query       |
| `useState` for UI state | `useUIStore`             |
| localStorage manually   | `usePreferencesStore`    |
| Auth context            | `useAuthStore` + `useMe` |

## Common Patterns

### Pattern 1: Fetching Data

#### ❌ Before

```typescript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/products");
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    fetchProducts();
}, []);
```

#### ✅ After

```typescript
import { useProducts } from "@/hooks/use-products";

const { data: products, isLoading, error } = useProducts();
```

### Pattern 2: Creating/Updating Data

#### ❌ Before

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
        const response = await fetch("/api/products", {
            method: "POST",
            body: JSON.stringify(data),
        });
        // Manually refetch products
        fetchProducts();
    } catch (err) {
        console.error(err);
    } finally {
        setIsSubmitting(false);
    }
};
```

#### ✅ After

```typescript
import { useCreateProduct } from "@/hooks/use-products";
import { useUIStore } from "@/store/ui.store";

const createProduct = useCreateProduct();
const { addToast } = useUIStore();

const handleSubmit = async (data) => {
    try {
        await createProduct.mutateAsync(data);
        // Automatic cache invalidation!
        addToast({ type: "success", message: "Product created!" });
    } catch (error) {
        addToast({ type: "error", message: "Failed to create product" });
    }
};
```

### Pattern 3: Authentication

#### ❌ Before

```typescript
const [user, setUser] = useState(null);
const [token, setToken] = useState(localStorage.getItem("token"));

const login = async (credentials) => {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
    const { token, user } = await response.json();
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
};
```

#### ✅ After

```typescript
import { useLogin, useMe } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth.store";

const login = useLogin();
const { data: user } = useMe();
const { isAuthenticated } = useAuthStore();

// Login automatically stores tokens and redirects
await login.mutateAsync(credentials);
```

### Pattern 4: Cart Management

#### ❌ Before

```typescript
const [cart, setCart] = useState(null);

const addToCart = async (productId) => {
    const response = await fetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId }),
    });
    const updatedCart = await response.json();
    setCart(updatedCart);
};
```

#### ✅ After

```typescript
import { useCart, useAddToCart } from "@/hooks/use-cart";

const { data: cart } = useCart();
const addToCart = useAddToCart();

// Optimistic update - instant UI feedback
await addToCart.mutateAsync({ productId, quantity: 1 });
```

### Pattern 5: UI State (Modals, Toasts)

#### ❌ Before

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalData, setModalData] = useState(null);
const [toast, setToast] = useState(null);

const openModal = (data) => {
    setModalData(data);
    setIsModalOpen(true);
};

const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
};
```

#### ✅ After

```typescript
import { useUIStore } from "@/store/ui.store";

const { openModal, closeModal, addToast } = useUIStore();

// Open modal with data
openModal("product-form", { productId: "123" });

// Show toast (auto-dismisses)
addToast({ type: "success", message: "Saved!" });
```

### Pattern 6: User Preferences

#### ❌ Before

```typescript
const [viewMode, setViewMode] = useState(
    localStorage.getItem("viewMode") || "grid"
);

const updateViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem("viewMode", mode);
};
```

#### ✅ After

```typescript
import { usePreferencesStore } from "@/store/preferences.store";

const { viewMode, setViewMode } = usePreferencesStore();

// Automatically persisted to localStorage
setViewMode("list");
```

### Pattern 7: Pagination

#### ❌ Before

```typescript
const [products, setProducts] = useState([]);
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);

useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true);
        const response = await fetch(`/api/products?page=${page}`);
        const data = await response.json();
        setProducts(data);
        setLoading(false);
    };

    fetchProducts();
}, [page]);
```

#### ✅ After

```typescript
import { useProducts } from "@/hooks/use-products";

const [page, setPage] = useState(1);

const { data, isLoading, isPlaceholderData } = useProducts({ page });

// Previous data shown while fetching new page
```

### Pattern 8: Infinite Scroll

#### ❌ Before

```typescript
const [products, setProducts] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
    const response = await fetch(`/api/products?page=${page + 1}`);
    const data = await response.json();
    setProducts([...products, ...data]);
    setPage(page + 1);
    setHasMore(data.length > 0);
};
```

#### ✅ After

```typescript
import { useInfiniteProducts } from "@/hooks/use-products";

const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProducts();

// All products across all pages
const allProducts = data?.pages.flatMap((page) => page.data) ?? [];

// Load more
<button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
    {isFetchingNextPage ? "Loading..." : "Load More"}
</button>;
```

## Component Examples

### Example 1: Product List Component

#### ❌ Before

```typescript
export function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchProducts();
    }, [page]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/products?page=${page}`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={() => setViewMode("grid")}>Grid</button>
            <button onClick={() => setViewMode("list")}>List</button>

            {loading && <div>Loading...</div>}

            <div className={viewMode}>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <button onClick={() => setPage(page - 1)}>Previous</button>
            <button onClick={() => setPage(page + 1)}>Next</button>
        </div>
    );
}
```

#### ✅ After

```typescript
import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { usePreferencesStore } from "@/store/preferences.store";

export function ProductList() {
    const [page, setPage] = useState(1);
    const { viewMode, setViewMode, itemsPerPage } = usePreferencesStore();

    const { data, isLoading, error, isPlaceholderData } = useProducts({
        page,
        limit: itemsPerPage,
    });

    if (error) return <div>Error loading products</div>;

    return (
        <div>
            <button onClick={() => setViewMode("grid")}>Grid</button>
            <button onClick={() => setViewMode("list")}>List</button>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className={viewMode}>
                    {data.data.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
            >
                Previous
            </button>
            <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isPlaceholderData || !data.pagination.hasNext}
            >
                Next
            </button>
        </div>
    );
}
```

### Example 2: Login Form

#### ❌ Before

```typescript
export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) throw new Error("Login failed");

            const data = await response.json();
            localStorage.setItem("token", data.token);
            window.location.href = "/dashboard";
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div>{error}</div>}
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}
```

#### ✅ After

```typescript
import { useLogin } from "@/hooks/use-auth";
import { useUIStore } from "@/store/ui.store";
import { useForm } from "react-hook-form";

export function LoginForm() {
    const login = useLogin();
    const { addToast } = useUIStore();
    const { register, handleSubmit } = useForm();

    const onSubmit = async (data) => {
        try {
            await login.mutateAsync(data);
            // Automatically redirects to dashboard
            addToast({ type: "success", message: "Welcome back!" });
        } catch (error) {
            addToast({
                type: "error",
                message: error.message || "Login failed",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register("email")} />
            <input type="password" {...register("password")} />
            <button disabled={login.isPending}>
                {login.isPending ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}
```

## Checklist

Use this checklist when migrating a component:

-   [ ] Identify all state variables
-   [ ] Categorize each as client or server state
-   [ ] Replace server state with TanStack Query hooks
-   [ ] Replace client state with Zustand stores
-   [ ] Remove manual loading/error states
-   [ ] Remove manual cache invalidation
-   [ ] Update tests
-   [ ] Test the component thoroughly
-   [ ] Remove old unused code

## Tips

1. **Start with leaf components** (components that don't have children)
2. **Migrate incrementally** - one component at a time
3. **Test thoroughly** after each migration
4. **Use TypeScript** to catch migration errors
5. **Check the devtools** to verify query keys and cache behavior
6. **Remove old code** once migration is complete

## Common Mistakes

### ❌ Don't mix old and new patterns

```typescript
// Bad: mixing useState with useQuery
const [products, setProducts] = useState([]);
const { data } = useProducts();

useEffect(() => {
    if (data) setProducts(data);
}, [data]);
```

```typescript
// Good: just use the query result
const { data: products } = useProducts();
```

### ❌ Don't manually manage loading/error states for queries

```typescript
// Bad
const [loading, setLoading] = useState(false);
const { data } = useProducts();
```

```typescript
// Good
const { data, isLoading } = useProducts();
```

### ❌ Don't manually invalidate queries

```typescript
// Bad
const updateProduct = useUpdateProduct();
const { refetch } = useProducts();

await updateProduct.mutateAsync(data);
await refetch(); // Manual refetch
```

```typescript
// Good - automatic invalidation configured in the hook
const updateProduct = useUpdateProduct();
await updateProduct.mutateAsync(data);
// Products automatically refetched!
```

## Need Help?

-   Check the [State Management Documentation](./STATE_MANAGEMENT.md)
-   Review the [API Client README](../src/lib/api/README.md)
-   Look at [Usage Examples](../src/lib/api/examples.ts)
-   Use React Query Devtools to debug
