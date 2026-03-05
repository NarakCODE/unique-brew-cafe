import { apiClient } from "@/lib/api-client";
import {
  GetProductResponse,
  GetProductsResponse,
  ProductFilters,
  CreateProductPayload,
  CreateProductResponse,
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
  if (filters?.isBestSelling !== undefined)
    params.append("isBestSelling", filters.isBestSelling.toString());
  if (filters?.tags) {
    const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    tags.forEach((tag) => params.append("tags", tag));
  }
  if (filters?.minPrice !== undefined)
    params.append("minPrice", filters.minPrice.toString());
  if (filters?.maxPrice !== undefined)
    params.append("maxPrice", filters.maxPrice.toString());
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  return apiClient.get(`/products?${params.toString()}`);
};

export const getAdminProducts = async (
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
  if (filters?.isBestSelling !== undefined)
    params.append("isBestSelling", filters.isBestSelling.toString());
  if (filters?.tags) {
    const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    tags.forEach((tag) => params.append("tags", tag));
  }
  if (filters?.minPrice !== undefined)
    params.append("minPrice", filters.minPrice.toString());
  if (filters?.maxPrice !== undefined)
    params.append("maxPrice", filters.maxPrice.toString());
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  return apiClient.get(`/products/admin/all?${params.toString()}`);
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
