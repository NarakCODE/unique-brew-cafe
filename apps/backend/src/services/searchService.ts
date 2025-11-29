import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { SearchHistory, type ISearchHistory } from '../models/SearchHistory.js';
import { NotFoundError } from '../utils/AppError.js';

export interface SearchFilters {
  city?: string | undefined;
  categoryId?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  isAvailable?: boolean | undefined;
}

export interface SearchResults {
  stores?: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | undefined;
    address: string;
    city: string;
    imageUrl?: string | undefined;
    rating?: number | undefined;
    isOpen: boolean;
    score?: number | undefined;
  }>;
  products?: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    currency: string;
    images: string[];
    isAvailable: boolean;
    rating?: number | undefined;
    score?: number | undefined;
  }>;
  totalResults: number;
}

class SearchService {
  /**
   * Search for stores and/or products based on query
   */
  async search(
    query: string,
    type: 'store' | 'product' | 'all' = 'all',
    filters?: SearchFilters
  ): Promise<SearchResults> {
    const results: SearchResults = {
      totalResults: 0,
    };

    // Search stores
    if (type === 'store' || type === 'all') {
      const storeQuery: Record<string, unknown> = {
        $text: { $search: query },
        isActive: true,
      };

      if (filters?.city) {
        storeQuery.city = filters.city;
      }

      const stores = await Store.find(storeQuery, {
        score: { $meta: 'textScore' },
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .lean();

      results.stores = stores.map((store) => ({
        id: store._id.toString(),
        name: store.name,
        slug: store.slug,
        description: store.description,
        address: store.address,
        city: store.city,
        imageUrl: store.imageUrl,
        rating: store.rating,
        isOpen: store.isOpen,
        score: (store as { score?: number }).score,
      }));

      results.totalResults += stores.length;
    }

    // Search products
    if (type === 'product' || type === 'all') {
      const productQuery: Record<string, unknown> = {
        $text: { $search: query },
        deletedAt: { $exists: false },
      };

      if (filters?.categoryId) {
        productQuery.categoryId = filters.categoryId;
      }

      if (filters?.isAvailable !== undefined) {
        productQuery.isAvailable = filters.isAvailable;
      }

      if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        productQuery.basePrice = {};
        if (filters.minPrice !== undefined) {
          (productQuery.basePrice as Record<string, unknown>).$gte =
            filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          (productQuery.basePrice as Record<string, unknown>).$lte =
            filters.maxPrice;
        }
      }

      const products = await Product.find(productQuery, {
        score: { $meta: 'textScore' },
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .lean();

      results.products = products.map((product) => ({
        id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        currency: product.currency,
        images: product.images,
        isAvailable: product.isAvailable,
        rating: product.rating,
        score: (product as { score?: number }).score,
      }));

      results.totalResults += products.length;
    }

    return results;
  }

  /**
   * Get autocomplete suggestions based on partial query
   */
  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    const suggestions = new Set<string>();

    // Get store name suggestions
    const stores = await Store.find(
      {
        name: { $regex: query, $options: 'i' },
        isActive: true,
      },
      { name: 1 }
    )
      .limit(limit)
      .lean();

    stores.forEach((store) => suggestions.add(store.name));

    // Get product name suggestions
    const products = await Product.find(
      {
        name: { $regex: query, $options: 'i' },
        isAvailable: true,
        deletedAt: { $exists: false },
      },
      { name: 1 }
    )
      .limit(limit)
      .lean();

    products.forEach((product) => suggestions.add(product.name));

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get user's recent searches
   */
  async getRecentSearches(
    userId: string,
    limit: number = 20
  ): Promise<ISearchHistory[]> {
    const searches = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return searches.map((search) => ({
      ...search,
      id: search._id.toString(),
    })) as unknown as ISearchHistory[];
  }

  /**
   * Save search to history
   */
  async saveSearch(
    userId: string,
    query: string,
    searchType: 'store' | 'product' | 'all',
    resultsCount: number
  ): Promise<void> {
    await SearchHistory.create({
      userId,
      query,
      searchType,
      resultsCount,
    });
  }

  /**
   * Delete all search history for a user
   */
  async deleteAllSearches(userId: string): Promise<void> {
    await SearchHistory.deleteMany({ userId });
  }

  /**
   * Delete a specific search from history
   */
  async deleteSearch(userId: string, searchId: string): Promise<void> {
    const result = await SearchHistory.findOneAndDelete({
      _id: searchId,
      userId,
    });

    if (!result) {
      throw new NotFoundError('Search history entry not found');
    }
  }
}

export const searchService = new SearchService();
