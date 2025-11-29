import { describe, it, expect, beforeEach } from 'vitest';
import { Favorite } from '../../../src/models/Favorite.js';
import {
  createTestUser,
  createTestProduct,
  createTestCategory,
} from '../../utils/testHelpers.js';
import mongoose from 'mongoose';

describe('Favorite Model', () => {
  let userId: mongoose.Types.ObjectId;
  let productId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user._id as mongoose.Types.ObjectId;

    const category = await createTestCategory();
    const product = await createTestProduct(
      (category._id as mongoose.Types.ObjectId).toString()
    );
    productId = product._id as mongoose.Types.ObjectId;
  });

  it('should create a favorite with valid attributes', async () => {
    const favoriteData = {
      userId,
      productId,
    };

    const favorite = await Favorite.create(favoriteData);

    expect(favorite._id).toBeDefined();
    expect(favorite.userId.toString()).toBe(userId.toString());
    expect(favorite.productId.toString()).toBe(productId.toString());
    expect(favorite.createdAt).toBeDefined();
  });

  it('should fail if userId is missing', async () => {
    const favoriteData = {
      productId,
    };

    await expect(Favorite.create(favoriteData)).rejects.toThrow();
  });

  it('should fail if productId is missing', async () => {
    const favoriteData = {
      userId,
    };

    await expect(Favorite.create(favoriteData)).rejects.toThrow();
  });

  it('should prevent duplicate favorites with compound unique index', async () => {
    const favoriteData = {
      userId,
      productId,
    };

    // Create first favorite
    await Favorite.create(favoriteData);

    // Attempt to create duplicate
    await expect(Favorite.create(favoriteData)).rejects.toThrow();
  });

  it('should allow same product to be favorited by different users', async () => {
    const anotherUser = await createTestUser({ email: 'another@example.com' });

    const favorite1 = await Favorite.create({
      userId,
      productId,
    });

    const favorite2 = await Favorite.create({
      userId: anotherUser._id as mongoose.Types.ObjectId,
      productId,
    });

    expect(favorite1._id).toBeDefined();
    expect(favorite2._id).toBeDefined();
    expect((favorite1._id as mongoose.Types.ObjectId).toString()).not.toBe(
      (favorite2._id as mongoose.Types.ObjectId).toString()
    );
  });

  it('should allow user to favorite different products', async () => {
    const category2 = await createTestCategory({
      name: 'Another Category',
      slug: 'another-category-' + Date.now(),
    });
    const anotherProduct = await createTestProduct(
      (category2._id as mongoose.Types.ObjectId).toString(),
      {
        name: 'Another Product',
        slug: 'another-product-' + Date.now(),
      }
    );

    const favorite1 = await Favorite.create({
      userId,
      productId,
    });

    const favorite2 = await Favorite.create({
      userId,
      productId: anotherProduct._id as mongoose.Types.ObjectId,
    });

    expect(favorite1._id).toBeDefined();
    expect(favorite2._id).toBeDefined();
    expect((favorite1._id as mongoose.Types.ObjectId).toString()).not.toBe(
      (favorite2._id as mongoose.Types.ObjectId).toString()
    );
  });

  it('should transform _id to id in JSON', async () => {
    const favorite = await Favorite.create({
      userId,
      productId,
    });

    const favoriteJSON = favorite.toJSON();

    expect(favoriteJSON.id).toBeDefined();
    expect(favoriteJSON.id).toBe(
      (favorite._id as mongoose.Types.ObjectId).toString()
    );
    expect(favoriteJSON._id).toBeUndefined();
    expect(favoriteJSON.__v).toBeUndefined();
  });

  it('should populate userId reference', async () => {
    const favorite = await Favorite.create({
      userId,
      productId,
    });

    const populatedFavorite = await Favorite.findById(favorite._id).populate(
      'userId'
    );

    expect(populatedFavorite?.userId).toHaveProperty('email');
  });

  it('should populate productId reference', async () => {
    const favorite = await Favorite.create({
      userId,
      productId,
    });

    const populatedFavorite = await Favorite.findById(favorite._id).populate(
      'productId'
    );

    expect(populatedFavorite?.productId).toHaveProperty('name');
  });

  it('should have createdAt and updatedAt timestamps', async () => {
    const favorite = await Favorite.create({
      userId,
      productId,
    });

    expect(favorite.createdAt).toBeDefined();
    expect(favorite.createdAt).toBeInstanceOf(Date);
  });

  it('should find favorites by userId', async () => {
    await Favorite.create({ userId, productId });

    const favorites = await Favorite.find({ userId });

    expect(favorites).toHaveLength(1);
    expect(favorites[0].userId.toString()).toBe(userId.toString());
  });

  it('should find favorites by productId', async () => {
    await Favorite.create({ userId, productId });

    const favorites = await Favorite.find({ productId });

    expect(favorites).toHaveLength(1);
    expect(favorites[0].productId.toString()).toBe(productId.toString());
  });

  it('should delete favorite successfully', async () => {
    const favorite = await Favorite.create({
      userId,
      productId,
    });

    await Favorite.findByIdAndDelete(favorite._id);

    const deletedFavorite = await Favorite.findById(favorite._id);
    expect(deletedFavorite).toBeNull();
  });
});
