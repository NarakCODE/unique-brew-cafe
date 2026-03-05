import { apiClient } from "@/lib/api-client";
import {
  SearchQueryFilters,
  SearchResponse,
  SearchSuggestionsResponse,
} from "@/types/search";
import { buildQueryString, withQuery } from "@/lib/search-params";

export const searchPublic = async (
  filters: SearchQueryFilters
): Promise<SearchResponse> => {
  const query = buildQueryString({
    q: filters.q,
    type: filters.type,
    limit: filters.limit,
    city: filters.city,
    categoryId: filters.categoryId,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    isAvailable: filters.isAvailable,
  });

  return apiClient.get(withQuery("/search", query));
};

export const getSearchSuggestions = async (
  q: string,
  limit?: number
): Promise<SearchSuggestionsResponse> => {
  const query = buildQueryString({
    q,
    limit,
  });

  return apiClient.get(withQuery("/search/suggestions", query));
};
