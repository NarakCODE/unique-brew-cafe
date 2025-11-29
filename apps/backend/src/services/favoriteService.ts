import { Favorite } from '../models/Favorite.js';
import { Product } from '../models/Product.js';
import { NotFoundError } from '../utils/AppError.js';
import mongoose from 'mongoose';

/**
 * Get all favorites for a user with product details
 * @param userId - User ID
 * @returns Array of products with current price and availability
 */
export const getFavorites = async (userId: string) => {
  const favorites = await Favorite.find({ userId })
    .populate({
      path: 'productId',
      select:
        'name slug description images basePrice currency isAvailable rating totalReviews categoryId preparationTime',
    })
    .sort({ createdAt: -1 });

  // Filter out favorites where product no longer exists
  const validFavorites = favorites.filter((fav) => fav.productId);

  // Transform to return product details with favorite metadata
  return validFavorites.map((fav) => {
    const product = fav.productId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      slug: string;
      description: string;
      images: string[];
      basePrice: number;
      currency: string;
      isAvailable: boolean;
      rating?: number;
      totalReviews: number;
      categoryId: mongoose.Types.ObjectId;
      preparationTime: number;
    };

    return {
      favoriteId: String(fav._id),
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      images: product.images,
      basePrice: product.basePrice,
      currency: product.currency,
      isAvailable: product.isAvailable,
      rating: product.rating,
      totalReviews: product.totalReviews,
      categoryId: product.categoryId.toString(),
      preparationTime: product.preparationTime,
      favoritedAt: fav.createdAt,
    };
  });
};

/**
 * Add a product to user's favorites
 * @param userId - User ID
 * @param productId - Product ID
 * @returns Success message
 * @throws NotFoundError if product doesn't exist
 */
export const addFavorite = async (userId: string, productId: string) => {
  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Try to create favorite, handle duplicate gracefully
  try {
    await Favorite.create({
      userId,
      productId,
    });

    return {
      message: 'Product added to favorites',
      productId,
    };
  } catch (error) {
    // If duplicate key error (code 11000), return success anyway
    if ((error as { code?: number }).code === 11000) {
      return {
        message: 'Product already in favorites',
        productId,
      };
    }
    throw error;
  }
};

/**
 * Remove a product from user's favorites
 * @param userId - User ID
 * @param productId - Product ID
 * @returns Success message
 * @throws NotFoundError if favorite doesn't exist
 */
export const removeFavorite = async (userId: string, productId: string) => {
  const result = await Favorite.findOneAndDelete({
    userId,
    productId,
  });

  if (!result) {
    throw new NotFoundError('Favorite not found');
  }

  return {
    message: 'Product removed from favorites',
    productId,
  };
};

/**
 * Check if a product is favorited by user
 * @param userId - User ID
 * @param productId - Product ID
 * @returns Boolean indicating if product is favorited
 */
export const isFavorite = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  const favorite = await Favorite.findOne({
    userId,
    productId,
  });

  return !!favorite;
};
