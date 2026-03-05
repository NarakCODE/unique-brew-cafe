import { useQuery } from "@tanstack/react-query";
import { getSearchSuggestions, searchPublic } from "@/api/search";
import { SearchQueryFilters } from "@/types/search";
import { ApiErrorResponse } from "@/types/api";

export function usePublicSearch(filters?: SearchQueryFilters) {
  const query = useQuery({
    queryKey: ["public-search", filters],
    queryFn: () => searchPublic(filters!),
    enabled: !!filters?.q?.trim(),
  });

  return {
    results: query.data?.data,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useSearchSuggestions(q: string, limit?: number) {
  const query = useQuery({
    queryKey: ["search-suggestions", q, limit],
    queryFn: () => getSearchSuggestions(q, limit),
    enabled: q.trim().length > 0,
  });

  return {
    suggestions: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
  };
}
