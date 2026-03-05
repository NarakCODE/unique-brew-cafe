import { apiClient } from "@/lib/api-client";
import {
  SearchQueryFilters,
  SearchResponse,
  SearchSuggestionsResponse,
} from "@/types/search";

export const searchPublic = async (
  filters: SearchQueryFilters
): Promise<SearchResponse> => {
  const params = new URLSearchParams();
  params.append("q", filters.q);
  if (filters.type) params.append("type", filters.type);
  if (filters.limit !== undefined) params.append("limit", filters.limit.toString());
  if (filters.city) params.append("city", filters.city);
  if (filters.categoryId) params.append("categoryId", filters.categoryId);
  if (filters.minPrice !== undefined)
    params.append("minPrice", filters.minPrice.toString());
  if (filters.maxPrice !== undefined)
    params.append("maxPrice", filters.maxPrice.toString());
  if (filters.isAvailable !== undefined)
    params.append("isAvailable", filters.isAvailable.toString());

  return apiClient.get(`/search?${params.toString()}`);
};

export const getSearchSuggestions = async (
  q: string,
  limit?: number
): Promise<SearchSuggestionsResponse> => {
  const params = new URLSearchParams();
  params.append("q", q);
  if (limit !== undefined) params.append("limit", limit.toString());

  return apiClient.get(`/search/suggestions?${params.toString()}`);
};
