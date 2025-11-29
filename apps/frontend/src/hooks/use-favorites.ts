/**
 * Favorites Hooks - Server State Management
 * Uses TanStack Query for managing user favorites
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FavoriteItem } from "@/types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const favoriteKeys = {
    all: ["favorites"] as const,
    list: () => [...favoriteKeys.all, "list"] as const,
    check: (productId: string) =>
        [...favoriteKeys.all, "check", productId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user's favorite products
 */
export function useFavorites() {
    return useQuery({
        queryKey: favoriteKeys.list(),
        queryFn: () => api.favorites.list(),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Check if product is favorited
 */
export function useIsFavorite(productId: string | null) {
    return useQuery({
        queryKey: favoriteKeys.check(productId!),
        queryFn: () => api.favorites.check(productId!),
        enabled: !!productId,
        staleTime: 2 * 60 * 1000,
    });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add product to favorites
 */
export function useAddFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => api.favorites.add(productId),
        onMutate: async (productId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: favoriteKeys.list() });

            // Snapshot previous value
            const previousFavorites = queryClient.getQueryData(
                favoriteKeys.list()
            );

            // Optimistically update check query
            queryClient.setQueryData(favoriteKeys.check(productId), {
                isFavorite: true,
            });

            return { previousFavorites };
        },
        onError: (_err, productId, context) => {
            // Rollback on error
            if (context?.previousFavorites) {
                queryClient.setQueryData(
                    favoriteKeys.list(),
                    context.previousFavorites
                );
            }
            queryClient.setQueryData(favoriteKeys.check(productId), {
                isFavorite: false,
            });
        },
        onSettled: (_data, _error, productId) => {
            // Refetch to sync with server
            queryClient.invalidateQueries({ queryKey: favoriteKeys.list() });
            queryClient.invalidateQueries({
                queryKey: favoriteKeys.check(productId),
            });
        },
    });
}

/**
 * Remove product from favorites
 */
export function useRemoveFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => api.favorites.remove(productId),
        onMutate: async (productId) => {
            await queryClient.cancelQueries({ queryKey: favoriteKeys.list() });

            const previousFavorites = queryClient.getQueryData(
                favoriteKeys.list()
            );

            // Optimistically update check query
            queryClient.setQueryData(favoriteKeys.check(productId), {
                isFavorite: false,
            });

            return { previousFavorites };
        },
        onError: (_err, productId, context) => {
            if (context?.previousFavorites) {
                queryClient.setQueryData(
                    favoriteKeys.list(),
                    context.previousFavorites
                );
            }
            queryClient.setQueryData(favoriteKeys.check(productId), {
                isFavorite: true,
            });
        },
        onSettled: (_data, _error, productId) => {
            queryClient.invalidateQueries({ queryKey: favoriteKeys.list() });
            queryClient.invalidateQueries({
                queryKey: favoriteKeys.check(productId),
            });
        },
    });
}

/**
 * Toggle favorite status
 */
export function useToggleFavorite() {
    const addFavorite = useAddFavorite();
    const removeFavorite = useRemoveFavorite();

    return {
        toggle: async (productId: string, isFavorite: boolean) => {
            if (isFavorite) {
                await removeFavorite.mutateAsync(productId);
            } else {
                await addFavorite.mutateAsync(productId);
            }
        },
        isLoading: addFavorite.isPending || removeFavorite.isPending,
    };
}

/**
 * Custom hook for managing favorites with helper functions
 */
export function useFavoritesManager() {
    const { data: favorites = [], isLoading } = useFavorites();
    const { toggle, isLoading: isToggling } = useToggleFavorite();

    const isFavorite = (productId: string) => {
        return favorites.some(
            (fav: FavoriteItem) => fav.productId === productId
        );
    };

    const toggleFavorite = async (productId: string) => {
        await toggle(productId, isFavorite(productId));
    };

    return {
        favorites,
        isLoading: isLoading || isToggling,
        isFavorite,
        toggleFavorite,
    };
}
