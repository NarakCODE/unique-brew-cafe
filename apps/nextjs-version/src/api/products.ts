import { apiClient } from "@/lib/api-client";
import {
  GetProductResponse,
  GetProductsResponse,
  ProductFilters,
  CreateProductPayload,
  CreateProductResponse,
} from "@/types/product";
import { buildQueryString, withQuery } from "@/lib/search-params";

function buildProductQuery(filters?: ProductFilters) {
  return buildQueryString({
    search: filters?.search,
    page: filters?.page,
    limit: filters?.limit,
    categoryId: filters?.categoryId,
    isAvailable: filters?.isAvailable,
    isFeatured: filters?.isFeatured,
    isBestSelling: filters?.isBestSelling,
    tags: Array.isArray(filters?.tags)
      ? filters?.tags
      : filters?.tags
        ? [filters.tags]
        : undefined,
    minPrice: filters?.minPrice,
    maxPrice: filters?.maxPrice,
    sortBy: filters?.sortBy,
    sortOrder: filters?.sortOrder,
  });
}

export const getProducts = async (
  filters?: ProductFilters
): Promise<GetProductsResponse> => {
  return apiClient.get(withQuery("/products", buildProductQuery(filters)));
};

export const getAdminProducts = async (
  filters?: ProductFilters
): Promise<GetProductsResponse> => {
  return apiClient.get(
    withQuery("/products/admin/all", buildProductQuery(filters)),
  );
};

export const getProduct = async (
  productId: string
): Promise<GetProductResponse> => {
  return apiClient.get(`/products/${productId}`);
};

export const createProduct = async (
  payload: CreateProductPayload
): Promise<CreateProductResponse> => {
  return apiClient.post("/products", payload);
};

export const updateProduct = async (
  productId: string,
  payload: Partial<CreateProductPayload>
): Promise<CreateProductResponse> => {
  return apiClient.patch(`/products/${productId}`, payload);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  return apiClient.delete(`/products/${productId}`);
};

export const updateProductStatus = async (
  productId: string,
  isAvailable: boolean
): Promise<CreateProductResponse> => {
  return apiClient.patch(`/products/${productId}/status`, { isAvailable });
};
