import {
  GetProductResponse,
  GetProductsResponse,
  ProductFilters,
  CreateProductPayload,
  CreateProductResponse,
} from "../types/product";
import { buildQueryString, withQuery } from "../utils/search-params";

export function buildProductQuery(filters?: ProductFilters) {
  return buildQueryString({
    storeId: filters?.storeId,
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

// Factory to create product API logic using any compatible HTTP client
export const createProductsApi = (apiClient: {
  get: <T = any, R = T>(url: string, config?: any) => Promise<R>;
  post: <T = any, R = T>(url: string, data?: any, config?: any) => Promise<R>;
  patch: <T = any, R = T>(url: string, data?: any, config?: any) => Promise<R>;
  delete: <T = any, R = T>(url: string, config?: any) => Promise<R>;
}) => {
  return {
    getProducts: async (
      filters?: ProductFilters
    ): Promise<GetProductsResponse> => {
      return apiClient.get<unknown, GetProductsResponse>(withQuery("/products", buildProductQuery(filters)));
    },
    getAdminProducts: async (
      filters?: ProductFilters
    ): Promise<GetProductsResponse> => {
      return apiClient.get<unknown, GetProductsResponse>(
        withQuery("/products/admin/all", buildProductQuery(filters)),
      );
    },
    getProduct: async (productId: string): Promise<GetProductResponse> => {
      return apiClient.get<unknown, GetProductResponse>(`/products/${productId}`);
    },
    createProduct: async (
      payload: CreateProductPayload
    ): Promise<CreateProductResponse> => {
      return apiClient.post<unknown, CreateProductResponse>("/products", payload);
    },
    updateProduct: async (
      productId: string,
      payload: Partial<CreateProductPayload>
    ): Promise<CreateProductResponse> => {
      return apiClient.patch<unknown, CreateProductResponse>(`/products/${productId}`, payload);
    },
    deleteProduct: async (productId: string): Promise<void> => {
      return apiClient.delete<unknown, void>(`/products/${productId}`);
    },
    updateProductStatus: async (
      productId: string,
      isAvailable: boolean
    ): Promise<CreateProductResponse> => {
      return apiClient.patch<unknown, CreateProductResponse>(`/products/${productId}/status`, { isAvailable });
    },
  };
};
