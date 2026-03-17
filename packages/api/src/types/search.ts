import { ApiResponse } from "./api";

export type SearchType = "all" | "store" | "product";

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  searchType: SearchType;
  resultsCount: number;
  createdAt: string;
}

export type RecentSearchResponse = ApiResponse<SearchHistory[]>;

export type SearchSuggestionsResponse = ApiResponse<string[]>;

export interface SearchStore {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  imageUrl?: string;
  rating?: number;
  isOpen: boolean;
  score?: number;
}

export interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  currency: string;
  images: string[];
  isAvailable: boolean;
  rating?: number;
  score?: number;
}

export interface SearchResults {
  totalResults: number;
  stores?: SearchStore[];
  products?: SearchProduct[];
}

export interface SearchFilters {
  city?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
}

export type SearchResponse = ApiResponse<SearchResults>;
