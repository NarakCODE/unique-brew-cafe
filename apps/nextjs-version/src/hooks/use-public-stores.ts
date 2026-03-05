import { useQuery } from "@tanstack/react-query";
import { getPublicStores } from "@/api/store";
import { PublicStoreFilters } from "@/types/store";
import { ApiErrorResponse } from "@/types/api";

export function usePublicStores(filters?: PublicStoreFilters) {
  const query = useQuery({
    queryKey: ["public-stores", filters],
    queryFn: () => getPublicStores(filters),
  });

  return {
    stores: query.data?.data.data ?? [],
    pagination: query.data?.data.pagination,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
    refetch: query.refetch,
  };
}
