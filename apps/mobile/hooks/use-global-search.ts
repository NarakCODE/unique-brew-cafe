import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SearchFilters, SearchType } from "../../../packages/api/src";

import {
  deleteAllSearches,
  deleteSearch,
  getRecentSearches,
  getSearchSuggestions,
  searchCatalog,
} from "@/services/search.service";

export function useGlobalSearch(
  query: string,
  type: SearchType,
  limit = 8,
  filters?: SearchFilters,
) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: [
      "global-search",
      { query: normalizedQuery, type, limit, filters: filters ?? null },
    ],
    queryFn: () => searchCatalog(normalizedQuery, type, limit, filters),
    enabled: normalizedQuery.length > 0,
    staleTime: 1000 * 30,
  });
}

export function useSearchSuggestions(query: string, limit = 6) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["search-suggestions", { query: normalizedQuery, limit }],
    queryFn: () => getSearchSuggestions(normalizedQuery, limit),
    enabled: normalizedQuery.length > 0,
    staleTime: 1000 * 30,
  });
}

export function useRecentSearches(enabled = true, limit = 10) {
  return useQuery({
    queryKey: ["recent-searches", { limit }],
    queryFn: () => getRecentSearches(limit),
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useDeleteRecentSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (searchId: string) => deleteSearch(searchId),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["recent-searches"] });
    },
  });
}

export function useDeleteAllRecentSearches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAllSearches(),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["recent-searches"] });
    },
  });
}
