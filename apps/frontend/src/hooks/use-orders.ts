/**
 * Order Hooks - Server State Management
 * Uses TanStack Query for order data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateOrderData } from "@/types/order";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const orderKeys = {
    all: ["orders"] as const,
    lists: () => [...orderKeys.all, "list"] as const,
    list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
    details: () => [...orderKeys.all, "detail"] as const,
    detail: (id: string) => [...orderKeys.details(), id] as const,
    myOrders: (filters: MyOrderFilters) =>
        [...orderKeys.all, "my-orders", filters] as const,
};

// ============================================================================
// TYPES
// ============================================================================

export interface OrderFilters {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface MyOrderFilters {
    page?: number;
    limit?: number;
    status?: string;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get paginated list of orders (Admin)
 */
export function useOrders(filters: OrderFilters = {}) {
    return useQuery({
        queryKey: orderKeys.list(filters),
        queryFn: () => api.orders.list(filters),
        staleTime: 30 * 1000, // 30 seconds
        placeholderData: (previousData) => previousData,
    });
}

/**
 * Get single order by ID
 */
export function useOrder(id: string | null) {
    return useQuery({
        queryKey: orderKeys.detail(id!),
        queryFn: () => api.orders.get(id!),
        enabled: !!id,
        staleTime: 30 * 1000,
    });
}

/**
 * Get current user's orders
 */
export function useMyOrders(filters: MyOrderFilters = {}) {
    return useQuery({
        queryKey: orderKeys.myOrders(filters),
        queryFn: () => api.orders.myOrders(filters),
        staleTime: 30 * 1000,
    });
}

/**
 * Poll order status (for real-time updates)
 */
export function useOrderStatus(id: string | null) {
    return useQuery({
        queryKey: [...orderKeys.detail(id!), "status"],
        queryFn: () => api.orders.get(id!),
        enabled: !!id,
        refetchInterval: 5000, // Poll every 5 seconds
        refetchIntervalInBackground: false,
    });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create new order
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderData) => api.orders.create(data),
        onSuccess: () => {
            // Invalidate orders lists
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.myOrders({}) });
            // Clear cart after successful order
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
}

/**
 * Update order status (Admin)
 */
export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            status,
            notes,
        }: {
            id: string;
            status: string;
            notes?: string;
        }) => api.orders.updateStatus(id, status, notes),
        onSuccess: (_, { id }) => {
            // Invalidate order detail
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
            // Invalidate orders lists
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        },
    });
}

/**
 * Cancel order
 */
export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            api.orders.cancel(id, reason),
        onSuccess: (_, { id }) => {
            // Invalidate order detail
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
            // Invalidate orders lists
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.myOrders({}) });
        },
    });
}
