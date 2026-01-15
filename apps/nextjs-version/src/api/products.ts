import { apiClient } from "@/lib/api-client";
import {
  GetProductResponse,
  GetProductsResponse,
  ProductFilters,
} from "@/types/product";

export const getProducts = async (
  filters?: ProductFilters
): Promise<GetProductsResponse> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.categoryId) params.append("categoryId", filters.categoryId);
  if (filters?.isAvailable !== undefined)
    params.append("isAvailable", filters.isAvailable.toString());
  if (filters?.isFeatured !== undefined)
    params.append("isFeatured", filters.isFeatured.toString());

  return apiClient.get(`/products?${params.toString()}`);
};

export const getProduct = async (
  productId: string
): Promise<GetProductResponse> => {
  return apiClient.get(`/products/${productId}`);
};
