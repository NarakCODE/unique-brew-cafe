/**
 * Example: Using the API Client in React Components
 *
 * This file demonstrates various ways to use the API client
 * in your React components with React Query.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiClientError } from "@/lib/api";
import type { LoginCredentials } from "@/types/auth";
import type { CreateOrderData } from "@/types/order";
import type { FavoriteItem } from "@/types/favorite";

// ============================================================================
// EXAMPLE 1: Simple Query
// ============================================================================

export function useProducts(filters?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
}) {
    return useQuery({
        queryKey: ["products", filters],
        queryFn: () => api.products.list(filters),
        // Optional: stale time (data considered fresh for 5 minutes)
        staleTime: 5 * 60 * 1000,
    });
}

// Usage in component:
// const { data: products, isLoading, error } = useProducts({ category: 'coffee' });

// ============================================================================
// EXAMPLE 2: Mutation with Optimistic Updates
// ============================================================================

export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { productId: string; quantity: number }) =>
            api.cart.addItem(data),
        onSuccess: () => {
            // Invalidate cart query to refetch
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: (error: ApiClientError) => {
            console.error("Failed to add to cart:", error.message);
        },
    });
}

// Usage in component:
// const addToCart = useAddToCart();
// await addToCart.mutateAsync({ productId: '123', quantity: 2 });

// ============================================================================
// EXAMPLE 3: Authentication Flow
// ============================================================================

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) =>
            api.auth.login(credentials),
        onSuccess: () => {
            // Store auth data (handled automatically by the client)
            // Invalidate user-specific queries
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error: ApiClientError) => {
            if (error.code === "INVALID_CREDENTIALS") {
                // Handle invalid credentials
            } else if (error.code === "EMAIL_NOT_VERIFIED") {
                // Redirect to email verification
            }
        },
    });
}

// Usage in component:
// const login = useLogin();
// const handleSubmit = async (data: LoginCredentials) => {
//   try {
//     await login.mutateAsync(data);
//     router.push('/dashboard');
//   } catch (error) {
//     // Error handling
//   }
// };

// ============================================================================
// EXAMPLE 4: Paginated Data
// ============================================================================

export function useOrders(page: number = 1, limit: number = 10) {
    return useQuery({
        queryKey: ["orders", { page, limit }],
        queryFn: () => api.orders.list({ page, limit }),
        // Keep previous data while fetching new page
        placeholderData: (previousData) => previousData,
    });
}

// Usage in component:
// const [page, setPage] = useState(1);
// const { data, isLoading, isPlaceholderData } = useOrders(page);
//
// if (data) {
//   const { data: orders, pagination } = data;
//   // Render orders with pagination controls
// }

// ============================================================================
// EXAMPLE 5: Dependent Queries
// ============================================================================

export function useOrderDetails(orderId: string | null) {
    return useQuery({
        queryKey: ["order", orderId],
        queryFn: () => api.orders.get(orderId!),
        // Only run query if orderId is provided
        enabled: !!orderId,
    });
}

// Usage in component:
// const { data: order } = useOrderDetails(selectedOrderId);

// ============================================================================
// EXAMPLE 6: Error Handling
// ============================================================================

export function useCreateOrder() {
    return useMutation({
        mutationFn: (orderData: CreateOrderData) =>
            api.orders.create(orderData),
        onError: (error: unknown) => {
            if (error instanceof ApiClientError) {
                // Handle API errors
                switch (error.code) {
                    case "INSUFFICIENT_STOCK":
                        alert("Some items are out of stock");
                        break;
                    case "INVALID_ADDRESS":
                        alert("Please provide a valid delivery address");
                        break;
                    case "PAYMENT_FAILED":
                        alert("Payment processing failed");
                        break;
                    default:
                        alert(`Error: ${error.message}`);
                }
            } else {
                // Handle unexpected errors
                alert("An unexpected error occurred");
            }
        },
    });
}

// ============================================================================
// EXAMPLE 7: Parallel Queries
// ============================================================================

export function useDashboardData() {
    const products = useQuery({
        queryKey: ["products"],
        queryFn: () => api.products.list({ limit: 10 }),
    });

    const orders = useQuery({
        queryKey: ["recent-orders"],
        queryFn: () => api.orders.list({ limit: 5 }),
    });

    const notifications = useQuery({
        queryKey: ["notifications"],
        queryFn: () => api.notifications.list({ limit: 5, unreadOnly: true }),
    });

    return {
        products,
        orders,
        notifications,
        isLoading:
            products.isLoading || orders.isLoading || notifications.isLoading,
    };
}

// ============================================================================
// EXAMPLE 8: Manual API Calls (without React Query)
// ============================================================================

export async function handleManualApiCall() {
    try {
        // Direct API call
        const products = await api.products.list({ page: 1, limit: 20 });
        console.log("Products:", products);

        // Handle success
        return products;
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error("API Error:", {
                message: error.message,
                code: error.code,
                status: error.statusCode,
                details: error.details,
            });
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
}

// ============================================================================
// EXAMPLE 9: Infinite Query (Load More)
// ============================================================================

import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteProducts(filters?: { category?: string }) {
    return useInfiniteQuery({
        queryKey: ["products", "infinite", filters],
        queryFn: ({ pageParam = 1 }) =>
            api.products.list({ ...filters, page: pageParam, limit: 20 }),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.hasNext) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
}

// Usage in component:
// const {
//   data,
//   fetchNextPage,
//   hasNextPage,
//   isFetchingNextPage,
// } = useInfiniteProducts({ category: 'coffee' });
//
// const allProducts = data?.pages.flatMap(page => page.data) ?? [];

// ============================================================================
// EXAMPLE 10: Prefetching Data
// ============================================================================

export function usePrefetchProduct() {
    const queryClient = useQueryClient();

    return (productId: string) => {
        queryClient.prefetchQuery({
            queryKey: ["product", productId],
            queryFn: () => api.products.get(productId),
            // Cache for 10 seconds
            staleTime: 10 * 1000,
        });
    };
}

// Usage in component:
// const prefetchProduct = usePrefetchProduct();
//
// <Link
//   href={`/products/${product.id}`}
//   onMouseEnter={() => prefetchProduct(product.id)}
// >
//   {product.name}
// </Link>

// ============================================================================
// EXAMPLE 11: Real-time Updates (Polling)
// ============================================================================

export function useOrderStatus(orderId: string) {
    return useQuery({
        queryKey: ["order-status", orderId],
        queryFn: () => api.orders.get(orderId),
        // Poll every 5 seconds
        refetchInterval: 5000,
        // Only poll when window is focused
        refetchIntervalInBackground: false,
    });
}

// ============================================================================
// EXAMPLE 12: Custom Hook with Multiple Operations
// ============================================================================

export function useFavorites() {
    const queryClient = useQueryClient();

    const { data: favorites = [], isLoading } = useQuery({
        queryKey: ["favorites"],
        queryFn: () => api.favorites.list(),
    });

    const addFavorite = useMutation({
        mutationFn: (productId: string) => api.favorites.add(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
        },
    });

    const removeFavorite = useMutation({
        mutationFn: (productId: string) => api.favorites.remove(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
        },
    });

    const isFavorite = (productId: string) => {
        return favorites.some(
            (fav: FavoriteItem) => fav.productId === productId
        );
    };

    const toggleFavorite = async (productId: string) => {
        if (isFavorite(productId)) {
            await removeFavorite.mutateAsync(productId);
        } else {
            await addFavorite.mutateAsync(productId);
        }
    };

    return {
        favorites,
        isLoading,
        isFavorite,
        toggleFavorite,
        addFavorite: addFavorite.mutateAsync,
        removeFavorite: removeFavorite.mutateAsync,
    };
}

// Usage in component:
// const { favorites, isFavorite, toggleFavorite } = useFavorites();
//
// <button onClick={() => toggleFavorite(product.id)}>
//   {isFavorite(product.id) ? 'Remove from Favorites' : 'Add to Favorites'}
// </button>
