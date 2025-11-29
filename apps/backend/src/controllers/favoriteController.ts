import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as favoriteService from '../services/favoriteService.js';
import { BadRequestError } from '../utils/AppError.js';
import mongoose from 'mongoose';

/**
 * Get all favorites for authenticated user
 * GET /api/favorites
 */
export const getFavorites = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const favorites = await favoriteService.getFavorites(req.userId);

    res.status(200).json({
      success: true,
      data: {
        favorites,
        count: favorites.length,
      },
    });
  }
);

/**
 * Add a product to favorites
 * POST /api/favorites/:productId
 */
export const addFavorite = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const { productId } = req.params;

    // Validate productId exists
    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID format');
    }

    const result = await favoriteService.addFavorite(req.userId, productId);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Remove a product from favorites
 * DELETE /api/favorites/:productId
 */
export const removeFavorite = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const { productId } = req.params;

    // Validate productId exists
    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID format');
    }

    const result = await favoriteService.removeFavorite(req.userId, productId);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);
