import { ApiResponse } from "./api";

export interface FavoriteItem {
  favoriteId: string;
  productId: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  basePrice: number;
  currency: string;
  isAvailable: boolean;
  rating?: number;
  totalReviews: number;
  categoryId: string;
  preparationTime: number;
  favoritedAt: string;
}

export interface FavoritesData {
  items: FavoriteItem[];
  count: number;
}

export interface FavoriteMutationResult {
  message: string;
  productId: string;
}

export type FavoritesResponse = ApiResponse<FavoritesData>;
export type FavoriteMutationResponse = ApiResponse<FavoriteMutationResult>;
