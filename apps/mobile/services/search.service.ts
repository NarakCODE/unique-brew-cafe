import type {
  ApiResponse,
  RecentSearchResponse,
  SearchResponse,
  SearchFilters,
  SearchResults,
  SearchSuggestionsResponse,
  SearchType,
} from "../../../packages/api/src";

import { mobileApiClient } from "@/lib/mobile-api-client";

export async function searchCatalog(
  query: string,
  type: SearchType = "all",
  limit = 8,
  filters?: SearchFilters,
): Promise<SearchResults> {
  const searchParams = new URLSearchParams();

  searchParams.set("q", query);
  searchParams.set("type", type);
  searchParams.set("limit", String(limit));

  if (filters?.city) {
    searchParams.set("city", filters.city);
  }

  if (filters?.categoryId) {
    searchParams.set("categoryId", filters.categoryId);
  }

  if (typeof filters?.minPrice === "number") {
    searchParams.set("minPrice", String(filters.minPrice));
  }

  if (typeof filters?.maxPrice === "number") {
    searchParams.set("maxPrice", String(filters.maxPrice));
  }

  if (typeof filters?.isAvailable === "boolean") {
    searchParams.set("isAvailable", String(filters.isAvailable));
  }

  const response = await mobileApiClient.get<SearchResponse>(
    `/search?${searchParams.toString()}`,
  );

  return response.data;
}

export async function getSearchSuggestions(query: string, limit = 6) {
  const searchParams = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  const response = await mobileApiClient.get<SearchSuggestionsResponse>(
    `/search/suggestions?${searchParams.toString()}`,
  );

  return response.data;
}

export async function getRecentSearches(limit = 10) {
  const searchParams = new URLSearchParams({
    limit: String(limit),
  });

  const response = await mobileApiClient.get<RecentSearchResponse>(
    `/search/recent?${searchParams.toString()}`,
  );

  return response.data;
}

export async function deleteAllSearches() {
  const response =
    await mobileApiClient.delete<ApiResponse<null>>("/search/recent");
  return response;
}

export async function deleteSearch(searchId: string) {
  const response = await mobileApiClient.delete<ApiResponse<null>>(
    `/search/recent/${searchId}`,
  );
  return response;
}
