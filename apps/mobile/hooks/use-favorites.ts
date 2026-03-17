import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FavoriteItem, FavoritesData } from "../../../packages/api/src";

import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "@/services/favorite.service";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    staleTime: 1000 * 60,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => addFavorite(productId),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeFavorite(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });

      const previousFavorites = queryClient.getQueryData<FavoritesData>([
        "favorites",
      ]);

      if (previousFavorites) {
        queryClient.setQueryData<FavoritesData>(["favorites"], {
          ...previousFavorites,
          items: previousFavorites.items.filter(
            (favorite: FavoriteItem) => favorite.productId !== productId,
          ),
          count: Math.max(
            0,
            previousFavorites.count -
              (previousFavorites.items.some(
                (favorite: FavoriteItem) => favorite.productId === productId,
              )
                ? 1
                : 0),
          ),
        });
      }

      return { previousFavorites };
    },
    onError: (_error, _productId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites"], context.previousFavorites);
      }
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
