/**
 * Cart Hooks - Server State Management
 * Uses TanStack Query for cart data (stored on server)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Cart, CartItem } from "@/types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const cartKeys = {
    all: ["cart"] as const,
    cart: () => [...cartKeys.all] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get current user's cart
 */
export function useCart() {
    return useQuery({
        queryKey: cartKeys.cart(),
        queryFn: () => api.cart.get(),
        staleTime: 30 * 1000, // 30 seconds
    });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add item to cart
 */
export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            productId: string;
            quantity: number;
            addons?: string[];
        }) => api.cart.addItem(data),
        onMutate: async (newItem) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: cartKeys.cart() });

            // Snapshot previous value
            const previousCart = queryClient.getQueryData(cartKeys.cart());

            // Optimistically update
            queryClient.setQueryData(
                cartKeys.cart(),
                (old: Cart | undefined) => {
                    if (!old) return old;
                    // Add optimistic item (simplified)
                    return {
                        ...old,
                        items: [
                            ...(old.items || []),
                            {
                                ...newItem,
                                _optimistic: true,
                            },
                        ],
                    };
                }
            );

            return { previousCart };
        },
        onError: (_err, _newItem, context) => {
            // Rollback on error
            if (context?.previousCart) {
                queryClient.setQueryData(cartKeys.cart(), context.previousCart);
            }
        },
        onSettled: () => {
            // Refetch to sync with server
            queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        },
    });
}

/**
 * Update cart item quantity
 */
export function useUpdateCartItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            itemId,
            quantity,
        }: {
            itemId: string;
            quantity: number;
        }) => api.cart.updateItem(itemId, quantity),
        onMutate: async ({ itemId, quantity }) => {
            await queryClient.cancelQueries({ queryKey: cartKeys.cart() });

            const previousCart = queryClient.getQueryData(cartKeys.cart());

            // Optimistically update
            queryClient.setQueryData(
                cartKeys.cart(),
                (old: Cart | undefined) => {
                    if (!old) return old;
                    return {
                        ...old,
                        items: old.items.map((item: CartItem) =>
                            item.id === itemId ? { ...item, quantity } : item
                        ),
                    };
                }
            );

            return { previousCart };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(cartKeys.cart(), context.previousCart);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        },
    });
}

/**
 * Remove item from cart
 */
export function useRemoveFromCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId: string) => api.cart.removeItem(itemId),
        onMutate: async (itemId) => {
            await queryClient.cancelQueries({ queryKey: cartKeys.cart() });

            const previousCart = queryClient.getQueryData(cartKeys.cart());

            // Optimistically update
            queryClient.setQueryData(
                cartKeys.cart(),
                (old: Cart | undefined) => {
                    if (!old) return old;
                    return {
                        ...old,
                        items: old.items.filter(
                            (item: CartItem) => item.id !== itemId
                        ),
                    };
                }
            );

            return { previousCart };
        },
        onError: (_err, _itemId, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(cartKeys.cart(), context.previousCart);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        },
    });
}

/**
 * Clear entire cart
 */
export function useClearCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => api.cart.clear(),
        onSuccess: () => {
            // Invalidate cart
            queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        },
    });
}
