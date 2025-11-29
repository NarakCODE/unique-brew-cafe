/**
 * Product Hooks - Server State Management
 * Uses TanStack Query for fetching and caching product data
 */

import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/types/api";
import type {
    Product,
    CreateProductData,
    UpdateProductData,
} from "@/types/product";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: (filters: ProductFilters) =>
        [...productKeys.lists(), filters] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
    infinite: (filters: ProductFilters) =>
        [...productKeys.all, "infinite", filters] as const,
};

// ============================================================================
// TYPES
// ============================================================================

export interface ProductFilters {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get paginated list of products
 */
export function useProducts(filters: ProductFilters = {}) {
    return useQuery({
        queryKey: productKeys.list(filters),
        queryFn: () => api.products.list(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        placeholderData: (previousData) => previousData, // Keep previous data while fetching
    });
}

/**
 * Get infinite scrolling products
 */
export function useInfiniteProducts(
    filters: Omit<ProductFilters, "page"> = {}
) {
    return useInfiniteQuery({
        queryKey: productKeys.infinite(filters),
        queryFn: ({ pageParam = 1 }) =>
            api.products.list({
                ...filters,
                page: pageParam,
                limit: filters.limit || 20,
            }),
        getNextPageParam: (lastPage: PaginatedResponse<Product>) => {
            if (lastPage.pagination.hasNext) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Get single product by ID
 */
export function useProduct(id: string | null) {
    return useQuery({
        queryKey: productKeys.detail(id!),
        queryFn: () => api.products.get(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Prefetch product (for hover effects)
 */
export function usePrefetchProduct() {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: productKeys.detail(id),
            queryFn: () => api.products.get(id),
            staleTime: 5 * 60 * 1000,
        });
    };
}

// ============================================================================
// MUTATIONS (Admin only)
// ============================================================================

/**
 * Create new product
 */
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductData) => api.products.create(data),
        onSuccess: () => {
            // Invalidate all product lists
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

/**
 * Update product
 */
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) =>
            api.products.update(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate product detail
            queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
            // Invalidate all product lists
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

/**
 * Delete product
 */
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.products.delete(id),
        onSuccess: () => {
            // Invalidate all product lists
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

/**
 * Toggle product availability
 */
export function useToggleProductAvailability() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            isAvailable,
        }: {
            id: string;
            isAvailable: boolean;
        }) => api.products.toggleAvailability(id, isAvailable),
        onSuccess: (_, { id }) => {
            // Invalidate product detail
            queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
            // Invalidate all product lists
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}
