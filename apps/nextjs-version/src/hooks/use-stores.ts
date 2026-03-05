import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getStores } from "@/api/store";
import { StoreFilters } from "@/types/store";
import { ApiErrorResponse } from "@/types/api";

export function useStores(filters?: StoreFilters) {
  const query = useQuery({
    queryKey: ["stores", filters],
    queryFn: () => getStores(filters),
    placeholderData: keepPreviousData,
  });

  return {
    stores: query.data?.data.data ?? [],
    pagination: query.data?.data.pagination,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}
