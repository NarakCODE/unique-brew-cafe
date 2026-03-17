import type {
  FavoriteItem,
  FavoriteMutationResponse,
  FavoritesData,
  FavoritesResponse,
} from "../../../packages/api/src";

import { mobileApiClient } from "@/lib/mobile-api-client";

type FavoritesApiResponse = {
  statusCode: number;
  data: {
    favorites: Array<{
      favoriteId: FavoriteItem["favoriteId"];
      productId: FavoriteItem["productId"];
      name: FavoriteItem["name"];
      slug: FavoriteItem["slug"];
      description: FavoriteItem["description"];
      images: FavoriteItem["images"];
      basePrice: FavoriteItem["basePrice"];
      currency: FavoriteItem["currency"];
      isAvailable: FavoriteItem["isAvailable"];
      rating?: FavoriteItem["rating"];
      totalReviews: FavoriteItem["totalReviews"];
      categoryId: FavoriteItem["categoryId"];
      preparationTime: FavoriteItem["preparationTime"];
      favoritedAt: FavoriteItem["favoritedAt"];
    }>;
    count: number;
  };
  message: string;
  success: boolean;
};

export async function getFavorites(): Promise<FavoritesData> {
  const response = await mobileApiClient.get<FavoritesApiResponse>("/favorites");

  const normalized: FavoritesResponse = {
    ...response,
    data: {
      items: response.data.favorites,
      count: response.data.count,
    },
  };

  return normalized.data;
}

export async function addFavorite(productId: string) {
  const response = await mobileApiClient.post<
    undefined,
    FavoriteMutationResponse
  >(`/favorites/${productId}`);

  return response.data;
}

export async function removeFavorite(productId: string) {
  const response = await mobileApiClient.delete<
    FavoriteMutationResponse,
    FavoriteMutationResponse
  >(`/favorites/${productId}`);

  return response.data;
}
