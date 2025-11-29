import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { searchService } from '../services/searchService.js';
import { BadRequestError } from '../utils/AppError.js';

/**
 * Search for stores and/or products
 * GET /search?query=coffee&type=all&city=Phnom Penh
 */
export const search = asyncHandler(async (req: Request, res: Response) => {
  const {
    query,
    type = 'all',
    city,
    categoryId,
    minPrice,
    maxPrice,
    isAvailable,
  } = req.query;

  if (!query || typeof query !== 'string') {
    throw new BadRequestError('Search query is required');
  }

  if (type && !['store', 'product', 'all'].includes(type as string)) {
    throw new BadRequestError(
      'Invalid search type. Must be: store, product, or all'
    );
  }

  const filters = {
    city: city as string | undefined,
    categoryId: categoryId as string | undefined,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    isAvailable:
      isAvailable === 'true'
        ? true
        : isAvailable === 'false'
          ? false
          : undefined,
  };

  const results = await searchService.search(
    query,
    type as 'store' | 'product' | 'all',
    filters
  );

  // Save search to history if user is authenticated
  if (req.userId) {
    await searchService.saveSearch(
      req.userId,
      query,
      type as 'store' | 'product' | 'all',
      results.totalResults
    );
  }

  res.status(200).json({
    success: true,
    data: results,
  });
});

/**
 * Get autocomplete suggestions
 * GET /search/suggestions?query=cof
 */
export const getSuggestions = asyncHandler(
  async (req: Request, res: Response) => {
    const { query, limit = '10' } = req.query;

    if (!query || typeof query !== 'string') {
      throw new BadRequestError('Search query is required');
    }

    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 20) {
      throw new BadRequestError('Limit must be between 1 and 20');
    }

    const suggestions = await searchService.getSuggestions(query, limitNum);

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  }
);

/**
 * Get user's recent searches
 * GET /search/recent
 */
export const getRecentSearches = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new BadRequestError('User ID is required');
    }

    const { limit = '20' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const searches = await searchService.getRecentSearches(
      req.userId,
      limitNum
    );

    res.status(200).json({
      success: true,
      data: searches,
    });
  }
);

/**
 * Delete all recent searches
 * DELETE /search/recent
 */
export const deleteAllSearches = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new BadRequestError('User ID is required');
    }

    await searchService.deleteAllSearches(req.userId);

    res.status(200).json({
      success: true,
      message: 'All search history deleted successfully',
    });
  }
);

/**
 * Delete a specific search from history
 * DELETE /search/recent/:searchId
 */
export const deleteSearch = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new BadRequestError('User ID is required');
    }

    const { searchId } = req.params;

    if (!searchId) {
      throw new BadRequestError('Search ID is required');
    }

    await searchService.deleteSearch(req.userId, searchId);

    res.status(200).json({
      success: true,
      message: 'Search history entry deleted successfully',
    });
  }
);
