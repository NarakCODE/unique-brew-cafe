import { useQuery } from "@tanstack/react-query";
import { getProducts, getProduct } from "@/api/products";
import { ProductFilters } from "@/types/product";
import { ApiErrorResponse } from "@/types/api";

/**
 * Hook for fetching products on the public-facing landing page.
 * Uses the public GET /api/products endpoint (no auth required).
 */
export function usePublicProducts(filters?: ProductFilters) {
  const query = useQuery({
    queryKey: ["public-products", filters],
    queryFn: () => getProducts(filters),
  });

  return {
    products: query.data?.data.data ?? [],
    pagination: query.data?.data.pagination,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
  };
}

/**
 * Hook for fetching a single product by ID on the public-facing landing page.
 */
export function usePublicProduct(productId: string | null) {
  const query = useQuery({
    queryKey: ["public-product", productId],
    queryFn: () => getProduct(productId!),
    enabled: !!productId,
  });

  return {
    product: query.data?.data,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
  };
}
