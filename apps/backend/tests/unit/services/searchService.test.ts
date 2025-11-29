import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchService } from '../../../src/services/searchService.js';
import { Store } from '../../../src/models/Store.js';
import { Product } from '../../../src/models/Product.js';
import { SearchHistory } from '../../../src/models/SearchHistory.js';
import mongoose from 'mongoose';

// Mock dependencies
vi.mock('../../../src/models/Store.js');
vi.mock('../../../src/models/Product.js');
vi.mock('../../../src/models/SearchHistory.js');

const createObjectId = () => new mongoose.Types.ObjectId().toString();

describe('SearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('search', () => {
    it('should search both stores and products when type is all', async () => {
      const mockStores = [
        {
          _id: createObjectId(),
          name: 'Coffee Corner',
          slug: 'coffee-corner',
          address: '123 Main St',
          city: 'Seattle',
          isOpen: true,
          isActive: true,
          score: 1.5,
        },
      ];

      const mockProducts = [
        {
          _id: createObjectId(),
          name: 'Latte',
          slug: 'latte',
          description: 'Creamy latte',
          basePrice: 4.5,
          currency: 'USD',
          images: ['latte.jpg'],
          isAvailable: true,
          score: 1.2,
        },
      ];

      vi.mocked(Store.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockStores),
      } as any);

      vi.mocked(Product.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockProducts),
      } as any);

      const result = await searchService.search('coffee', 'all');

      expect(result.stores).toHaveLength(1);
      expect(result.products).toHaveLength(1);
      expect(result.totalResults).toBe(2);
    });

    it('should search only stores when type is store', async () => {
      const mockStores = [
        {
          _id: createObjectId(),
          name: 'Coffee Shop',
          slug: 'coffee-shop',
          address: '456 Oak Ave',
          city: 'Portland',
          isOpen: true,
          isActive: true,
        },
      ];

      vi.mocked(Store.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockStores),
      } as any);

      const result = await searchService.search('coffee', 'store');

      expect(Store.find).toHaveBeenCalled();
      expect(Product.find).not.toHaveBeenCalled();
      expect(result.stores).toHaveLength(1);
      expect(result.products).toBeUndefined();
      expect(result.totalResults).toBe(1);
    });

    it('should search only products when type is product', async () => {
      const mockProducts = [
        {
          _id: createObjectId(),
          name: 'Espresso',
          slug: 'espresso',
          description: 'Strong espresso',
          basePrice: 3.0,
          currency: 'USD',
          images: ['espresso.jpg'],
          isAvailable: true,
        },
      ];

      vi.mocked(Product.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockProducts),
      } as any);

      const result = await searchService.search('espresso', 'product');

      expect(Product.find).toHaveBeenCalled();
      expect(Store.find).not.toHaveBeenCalled();
      expect(result.products).toHaveLength(1);
      expect(result.stores).toBeUndefined();
      expect(result.totalResults).toBe(1);
    });

    it('should filter stores by city', async () => {
      vi.mocked(Store.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      await searchService.search('coffee', 'store', { city: 'Seattle' });

      expect(Store.find).toHaveBeenCalledWith(
        expect.objectContaining({ city: 'Seattle' }),
        expect.any(Object)
      );
    });

    it('should filter products by categoryId', async () => {
      const categoryId = createObjectId();

      vi.mocked(Product.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      await searchService.search('latte', 'product', { categoryId });

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId }),
        expect.any(Object)
      );
    });

    it('should filter products by price range', async () => {
      vi.mocked(Product.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      await searchService.search('coffee', 'product', {
        minPrice: 3,
        maxPrice: 10,
      });

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          basePrice: { $gte: 3, $lte: 10 },
        }),
        expect.any(Object)
      );
    });

    it('should filter products by availability', async () => {
      vi.mocked(Product.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      await searchService.search('coffee', 'product', { isAvailable: true });

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({ isAvailable: true }),
        expect.any(Object)
      );
    });

    it('should return empty results when no matches found', async () => {
      vi.mocked(Store.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await searchService.search('nonexistent', 'all');

      expect(result.stores).toEqual([]);
      expect(result.products).toEqual([]);
      expect(result.totalResults).toBe(0);
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions from stores and products', async () => {
      const mockStores = [{ name: 'Coffee Corner' }, { name: 'Coffee House' }];
      const mockProducts = [{ name: 'Coffee Latte' }, { name: 'Coffee Mocha' }];

      vi.mocked(Store.find).mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockStores),
      } as any);

      vi.mocked(Product.find).mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockProducts),
      } as any);

      const result = await searchService.getSuggestions('coffee');

      expect(result).toContain('Coffee Corner');
      expect(result).toContain('Coffee House');
      expect(result).toContain('Coffee Latte');
      expect(result).toContain('Coffee Mocha');
    });

    it('should limit suggestions to specified count', async () => {
      const mockStores = [
        { name: 'Store 1' },
        { name: 'Store 2' },
        { name: 'Store 3' },
      ];
      const mockProducts = [
        { name: 'Product 1' },
        { name: 'Product 2' },
        { name: 'Product 3' },
      ];

      vi.mocked(Store.find).mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockStores),
      } as any);

      vi.mocked(Product.find).mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockProducts),
      } as any);

      const result = await searchService.getSuggestions('test', 3);

      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should return unique suggestions', async () => {
      const mockStores = [{ name: 'Coffee' }];
      const mockProducts = [{ name: 'Coffee' }]; // Same name

      vi.mocked(Store.find).mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockStores),
      } as any);

      vi.mocked(Product.find).mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockProducts),
      } as any);

      const result = await searchService.getSuggestions('coffee');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Coffee');
    });

    it('should return empty array when no suggestions found', async () => {
      vi.mocked(Store.find).mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.find).mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await searchService.getSuggestions('xyz');

      expect(result).toEqual([]);
    });

    it('should use default limit of 10', async () => {
      vi.mocked(Store.find).mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.find).mockReturnValue({
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      await searchService.getSuggestions('test');

      expect(Store.find).toHaveBeenCalled();
      expect(Product.find).toHaveBeenCalled();
    });
  });

  describe('getRecentSearches', () => {
    it('should return recent searches for user', async () => {
      const userId = createObjectId();
      const mockSearches = [
        {
          _id: createObjectId(),
          userId,
          query: 'latte',
          searchType: 'product',
          resultsCount: 5,
          createdAt: new Date(),
        },
        {
          _id: createObjectId(),
          userId,
          query: 'coffee shop',
          searchType: 'store',
          resultsCount: 3,
          createdAt: new Date(),
        },
      ];

      vi.mocked(SearchHistory.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockSearches),
      } as any);

      const result = await searchService.getRecentSearches(userId);

      expect(SearchHistory.find).toHaveBeenCalledWith({ userId });
      expect(result).toHaveLength(2);
    });

    it('should limit results to specified count', async () => {
      const userId = createObjectId();

      vi.mocked(SearchHistory.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      await searchService.getRecentSearches(userId, 5);

      const mockChain = SearchHistory.find({ userId });
      expect(mockChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should return empty array when no search history', async () => {
      const userId = createObjectId();

      vi.mocked(SearchHistory.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await searchService.getRecentSearches(userId);

      expect(result).toEqual([]);
    });
  });

  describe('saveSearch', () => {
    it('should save search to history', async () => {
      const userId = createObjectId();
      const query = 'latte';
      const searchType = 'product';
      const resultsCount = 10;

      vi.mocked(SearchHistory.create).mockResolvedValue({} as any);

      await searchService.saveSearch(userId, query, searchType, resultsCount);

      expect(SearchHistory.create).toHaveBeenCalledWith({
        userId,
        query,
        searchType,
        resultsCount,
      });
    });

    it('should save search with all search type', async () => {
      const userId = createObjectId();

      vi.mocked(SearchHistory.create).mockResolvedValue({} as any);

      await searchService.saveSearch(userId, 'coffee', 'all', 15);

      expect(SearchHistory.create).toHaveBeenCalledWith({
        userId,
        query: 'coffee',
        searchType: 'all',
        resultsCount: 15,
      });
    });

    it('should save search with store type', async () => {
      const userId = createObjectId();

      vi.mocked(SearchHistory.create).mockResolvedValue({} as any);

      await searchService.saveSearch(userId, 'downtown', 'store', 5);

      expect(SearchHistory.create).toHaveBeenCalledWith({
        userId,
        query: 'downtown',
        searchType: 'store',
        resultsCount: 5,
      });
    });
  });

  describe('deleteAllSearches', () => {
    it('should delete all search history for user', async () => {
      const userId = createObjectId();

      vi.mocked(SearchHistory.deleteMany).mockResolvedValue({
        deletedCount: 5,
      } as any);

      await searchService.deleteAllSearches(userId);

      expect(SearchHistory.deleteMany).toHaveBeenCalledWith({ userId });
    });

    it('should not throw when no searches to delete', async () => {
      const userId = createObjectId();

      vi.mocked(SearchHistory.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);

      await expect(
        searchService.deleteAllSearches(userId)
      ).resolves.not.toThrow();
    });
  });

  describe('deleteSearch', () => {
    it('should delete specific search from history', async () => {
      const userId = createObjectId();
      const searchId = createObjectId();

      vi.mocked(SearchHistory.findOneAndDelete).mockResolvedValue({
        _id: searchId,
        userId,
        query: 'latte',
      } as unknown);

      await searchService.deleteSearch(userId, searchId);

      expect(SearchHistory.findOneAndDelete).toHaveBeenCalledWith({
        _id: searchId,
        userId,
      });
    });

    it('should throw NotFoundError when search not found', async () => {
      const userId = createObjectId();
      const searchId = createObjectId();

      vi.mocked(SearchHistory.findOneAndDelete).mockResolvedValue(null);

      await expect(
        searchService.deleteSearch(userId, searchId)
      ).rejects.toThrow('Search history entry not found');
    });

    it('should not delete search belonging to another user', async () => {
      const otherUserId = createObjectId();
      const searchId = createObjectId();

      vi.mocked(SearchHistory.findOneAndDelete).mockResolvedValue(null);

      await expect(
        searchService.deleteSearch(otherUserId, searchId)
      ).rejects.toThrow('Search history entry not found');

      expect(SearchHistory.findOneAndDelete).toHaveBeenCalledWith({
        _id: searchId,
        userId: otherUserId,
      });
    });
  });
});
