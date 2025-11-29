import { describe, it, expect, beforeEach } from 'vitest';
import * as favoriteService from '../../../src/services/favoriteService.js';
import { Favorite } from '../../../src/models/Favorite.js';
import { Product } from '../../../src/models/Product.js';
import {
  createTestUser,
  createTestProduct,
  createTestCategory,
} from '../../utils/testHelpers.js';
import mongoose from 'mongoose';

describe('FavoriteService', () => {
  let userId: string;
  let productId: string;
  let product2Id: string;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = (user._id as mongoose.Types.ObjectId).toString();

    const category = await createTestCategory();
    const product = await createTestProduct(
      (category._id as mongoose.Types.ObjectId).toString()
    );
    productId = (product._id as mongoose.Types.ObjectId).toString();

    const product2 = await createTestProduct(
      (category._id as mongoose.Types.ObjectId).toString(),
      {
        name: 'Second Product',
        slug: 'second-product',
      }
    );
    product2Id = (product2._id as mongoose.Types.ObjectId).toString();
  });

  describe('getFavorites', () => {
    it('should return empty array if user has no favorites', async () => {
      const result = await favoriteService.getFavorites(userId);

      expect(result).toEqual([]);
    });

    it('should return user favorites with product details', async () => {
      await Favorite.create({ userId, productId });

      const result = await favoriteService.getFavorites(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('favoriteId');
      expect(result[0]).toHaveProperty('productId', productId);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('slug');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('images');
      expect(result[0]).toHaveProperty('basePrice');
      expect(result[0]).toHaveProperty('currency');
      expect(result[0]).toHaveProperty('isAvailable');
      expect(result[0]).toHaveProperty('totalReviews');
      expect(result[0]).toHaveProperty('categoryId');
      expect(result[0]).toHaveProperty('preparationTime');
      expect(result[0]).toHaveProperty('favoritedAt');
    });

    it('should return multiple favorites sorted by creation date (newest first)', async () => {
      // Add first favorite
      await Favorite.create({ userId, productId });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Add second favorite
      await Favorite.create({ userId, productId: product2Id });

      const result = await favoriteService.getFavorites(userId);

      expect(result).toHaveLength(2);
      // Second product should be first (newest)
      expect(result[0].productId).toBe(product2Id);
      expect(result[1].productId).toBe(productId);
    });

    it('should filter out favorites where product no longer exists', async () => {
      // Create favorite with valid product
      await Favorite.create({ userId, productId });

      // Create favorite with non-existent product (manually insert)
      const nonExistentProductId = new mongoose.Types.ObjectId();
      await Favorite.create({ userId, productId: nonExistentProductId });

      const result = await favoriteService.getFavorites(userId);

      // Should only return the favorite with existing product
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(productId);
    });

    it('should include rating if product has reviews', async () => {
      // Update product with rating
      await Product.findByIdAndUpdate(productId, {
        rating: 4.5,
        totalReviews: 10,
      });

      await Favorite.create({ userId, productId });

      const result = await favoriteService.getFavorites(userId);

      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(4.5);
      expect(result[0].totalReviews).toBe(10);
    });

    it('should return favorites only for the specified user', async () => {
      const anotherUser = await createTestUser({
        email: 'another@example.com',
      });

      // Create favorite for first user
      await Favorite.create({ userId, productId });

      // Create favorite for another user
      await Favorite.create({
        userId: anotherUser._id,
        productId: product2Id,
      });

      const result = await favoriteService.getFavorites(userId);

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(productId);
    });
  });

  describe('addFavorite', () => {
    it('should add a product to favorites', async () => {
      const result = await favoriteService.addFavorite(userId, productId);

      expect(result).toHaveProperty('message', 'Product added to favorites');
      expect(result).toHaveProperty('productId', productId);

      const favorite = await Favorite.findOne({ userId, productId });
      expect(favorite).toBeDefined();
    });

    it('should throw error if product does not exist', async () => {
      const nonExistentProductId = new mongoose.Types.ObjectId().toString();

      await expect(
        favoriteService.addFavorite(userId, nonExistentProductId)
      ).rejects.toThrow('Product not found');
    });

    it('should return success if product already in favorites', async () => {
      // Add favorite first time
      await favoriteService.addFavorite(userId, productId);

      // Try to add again
      const result = await favoriteService.addFavorite(userId, productId);

      expect(result).toHaveProperty('message', 'Product already in favorites');
      expect(result).toHaveProperty('productId', productId);

      // Verify only one favorite exists
      const favorites = await Favorite.find({ userId, productId });
      expect(favorites).toHaveLength(1);
    });

    it('should allow different users to favorite the same product', async () => {
      const anotherUser = await createTestUser({
        email: 'another@example.com',
      });

      await favoriteService.addFavorite(userId, productId);
      await favoriteService.addFavorite(
        (anotherUser._id as mongoose.Types.ObjectId).toString(),
        productId
      );

      const favorites = await Favorite.find({ productId });
      expect(favorites).toHaveLength(2);
    });

    it('should allow user to favorite multiple products', async () => {
      await favoriteService.addFavorite(userId, productId);
      await favoriteService.addFavorite(userId, product2Id);

      const favorites = await Favorite.find({ userId });
      expect(favorites).toHaveLength(2);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a product from favorites', async () => {
      await Favorite.create({ userId, productId });

      const result = await favoriteService.removeFavorite(userId, productId);

      expect(result).toHaveProperty(
        'message',
        'Product removed from favorites'
      );
      expect(result).toHaveProperty('productId', productId);

      const favorite = await Favorite.findOne({ userId, productId });
      expect(favorite).toBeNull();
    });

    it('should throw error if favorite does not exist', async () => {
      await expect(
        favoriteService.removeFavorite(userId, productId)
      ).rejects.toThrow('Favorite not found');
    });

    it('should only remove favorite for the specified user', async () => {
      const anotherUser = await createTestUser({
        email: 'another@example.com',
      });

      // Both users favorite the same product
      await Favorite.create({ userId, productId });
      await Favorite.create({
        userId: anotherUser._id as mongoose.Types.ObjectId,
        productId,
      });

      // Remove favorite for first user
      await favoriteService.removeFavorite(userId, productId);

      // First user's favorite should be removed
      const userFavorite = await Favorite.findOne({ userId, productId });
      expect(userFavorite).toBeNull();

      // Another user's favorite should still exist
      const anotherUserFavorite = await Favorite.findOne({
        userId: anotherUser._id as mongoose.Types.ObjectId,
        productId,
      });
      expect(anotherUserFavorite).toBeDefined();
    });

    it('should throw error if trying to remove non-existent favorite', async () => {
      const nonExistentProductId = new mongoose.Types.ObjectId().toString();

      await expect(
        favoriteService.removeFavorite(userId, nonExistentProductId)
      ).rejects.toThrow('Favorite not found');
    });
  });

  describe('isFavorite', () => {
    it('should return true if product is favorited by user', async () => {
      await Favorite.create({ userId, productId });

      const result = await favoriteService.isFavorite(userId, productId);

      expect(result).toBe(true);
    });

    it('should return false if product is not favorited by user', async () => {
      const result = await favoriteService.isFavorite(userId, productId);

      expect(result).toBe(false);
    });

    it('should return false if product is favorited by different user', async () => {
      const anotherUser = await createTestUser({
        email: 'another@example.com',
      });

      await Favorite.create({ userId: anotherUser._id, productId });

      const result = await favoriteService.isFavorite(userId, productId);

      expect(result).toBe(false);
    });

    it('should return true for the correct user when multiple users favorite same product', async () => {
      const anotherUser = await createTestUser({
        email: 'another@example.com',
      });

      await Favorite.create({ userId, productId });
      await Favorite.create({ userId: anotherUser._id, productId });

      const result1 = await favoriteService.isFavorite(userId, productId);
      const result2 = await favoriteService.isFavorite(
        (anotherUser._id as mongoose.Types.ObjectId).toString(),
        productId
      );

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should handle invalid product ID gracefully', async () => {
      const invalidProductId = new mongoose.Types.ObjectId().toString();

      const result = await favoriteService.isFavorite(userId, invalidProductId);

      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full favorite lifecycle: add, check, remove', async () => {
      // Initially not favorited
      let isFav = await favoriteService.isFavorite(userId, productId);
      expect(isFav).toBe(false);

      // Add to favorites
      await favoriteService.addFavorite(userId, productId);
      isFav = await favoriteService.isFavorite(userId, productId);
      expect(isFav).toBe(true);

      // Get favorites list
      const favorites = await favoriteService.getFavorites(userId);
      expect(favorites).toHaveLength(1);

      // Remove from favorites
      await favoriteService.removeFavorite(userId, productId);
      isFav = await favoriteService.isFavorite(userId, productId);
      expect(isFav).toBe(false);
    });

    it('should handle multiple products in favorites', async () => {
      // Add multiple favorites
      await favoriteService.addFavorite(userId, productId);
      await favoriteService.addFavorite(userId, product2Id);

      // Check both are favorited
      const isFav1 = await favoriteService.isFavorite(userId, productId);
      const isFav2 = await favoriteService.isFavorite(userId, product2Id);
      expect(isFav1).toBe(true);
      expect(isFav2).toBe(true);

      // Get all favorites
      const favorites = await favoriteService.getFavorites(userId);
      expect(favorites).toHaveLength(2);

      // Remove one favorite
      await favoriteService.removeFavorite(userId, productId);

      // Check remaining favorites
      const remainingFavorites = await favoriteService.getFavorites(userId);
      expect(remainingFavorites).toHaveLength(1);
      expect(remainingFavorites[0].productId).toBe(product2Id);
    });

    it('should handle idempotent operations gracefully', async () => {
      // Add favorite multiple times
      await favoriteService.addFavorite(userId, productId);
      const result2 = await favoriteService.addFavorite(userId, productId);

      expect(result2.message).toBe('Product already in favorites');

      // Verify only one favorite exists
      const favorites = await favoriteService.getFavorites(userId);
      expect(favorites).toHaveLength(1);
    });
  });
});
