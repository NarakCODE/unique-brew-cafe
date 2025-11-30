import { describe, it, expect, beforeEach } from 'vitest';
import { Product } from '../../../src/models/Product.js';
import { Category } from '../../../src/models/Category.js';
import mongoose from 'mongoose';

describe('Product Model', () => {
  let categoryId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const category = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
      storeId: new mongoose.Types.ObjectId(),
    });
    categoryId = category._id as mongoose.Types.ObjectId;
  });

  it('should create a product with valid attributes', async () => {
    const productData = {
      name: 'Test Coffee',
      slug: 'test-coffee',
      description: 'Delicious coffee',
      categoryId: categoryId,
      basePrice: 5.0,
      preparationTime: 5,
      images: ['test-image.jpg'],
    };

    const product = await Product.create(productData);

    expect(product._id).toBeDefined();
    expect(product.name).toBe(productData.name);
    expect(product.basePrice).toBe(productData.basePrice);
    expect(product.isAvailable).toBe(true); // Default value
  });

  it('should fail if required fields are missing', async () => {
    const productData = {
      name: 'Test Coffee',
      // Missing other required fields
    };

    await expect(Product.create(productData)).rejects.toThrow();
  });

  it('should fail if price is negative', async () => {
    const productData = {
      name: 'Test Coffee',
      slug: 'test-coffee-negative',
      description: 'Delicious coffee',
      categoryId: categoryId,
      basePrice: -5.0,
      preparationTime: 5,
      images: ['test-image.jpg'],
    };

    await expect(Product.create(productData)).rejects.toThrow();
  });
});
