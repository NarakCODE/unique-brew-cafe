import { useQuery } from "@tanstack/react-query";
import { getProduct, getProducts } from "@/api/products";
import { ProductFilters } from "@/types/product";
import { ApiErrorResponse } from "@/types/api";

export function useProducts(filters?: ProductFilters) {
  const query = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });

  return {
    products: query.data?.data.data ?? [],
    pagination: query.data?.data.pagination,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useProduct(productId: string | null) {
  const query = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId!),
    enabled: !!productId,
  });

  return {
    product: query.data?.data,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}
