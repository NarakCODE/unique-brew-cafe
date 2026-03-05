export type SearchType = "store" | "product" | "all";

export interface SearchStoreResult {
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

export interface SearchProductResult {
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
  stores?: SearchStoreResult[];
  products?: SearchProductResult[];
  totalResults: number;
}

export interface SearchQueryFilters {
  q: string;
  type?: SearchType;
  limit?: number;
  city?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
}

export interface SearchResponse {
  statusCode: number;
  data: SearchResults;
  message: string;
  success: boolean;
}

export interface SearchSuggestionsResponse {
  statusCode: number;
  data: string[];
  message: string;
  success: boolean;
}
