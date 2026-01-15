import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/products";
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
