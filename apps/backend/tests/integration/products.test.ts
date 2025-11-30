import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import {
  createTestStore,
  createTestCategory,
  createTestProduct,
  createTestAdmin,
  generateAuthToken,
} from '../utils/testHelpers.js';

const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

describe('Products API', () => {
  let storeId: string;
  let categoryId: string;
  let adminToken: string;

  beforeEach(async () => {
    const store = await createTestStore();
    const category = await createTestCategory();
    const admin = await createTestAdmin();

    storeId = store.id;
    categoryId = category.id;
    adminToken = generateAuthToken(admin.id, 'admin');
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      await createTestProduct(categoryId, { name: 'Product 1', storeId });
      await createTestProduct(categoryId, { name: 'Product 2', storeId });
    });

    it('should return all products', async () => {
      const response = await request(app).get('/api/products').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get(`/api/products?categoryId=${categoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(
        response.body.data.every(
          (p: any) => p.category._id.toString() === categoryId
        )
      ).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=1')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/products/:productId', () => {
    it('should return product details', async () => {
      const product = await createTestProduct(categoryId, { storeId });

      const response = await request(app)
        .get(`/api/products/${product.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(product.name);
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create product with admin auth', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product',
          description: 'Test description',
          categoryId,
          storeId,
          basePrice: 15.99,
          currency: 'USD',
          preparationTime: 10,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Product');
    });

    it('should return 401 without auth', async () => {
      await request(app)
        .post('/api/products')
        .send({
          name: 'New Product',
          categoryId,
          storeId,
          basePrice: 15.99,
        })
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product',
          // Missing required fields
        })
        .expect(400);
    });
  });

  describe('PATCH /api/products/:productId', () => {
    it('should update product with admin auth', async () => {
      const product = await createTestProduct(categoryId, { storeId });

      const response = await request(app)
        .patch(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Product',
          basePrice: 20.0,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Product');
    });
  });

  describe('DELETE /api/products/:productId', () => {
    it('should delete product with admin auth', async () => {
      const product = await createTestProduct(categoryId, { storeId });

      await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify product is deleted
      await request(app).get(`/api/products/${product.id}`).expect(404);
    });
  });

  describe('PATCH /api/products/:productId/status', () => {
    it('should update product status', async () => {
      const product = await createTestProduct(categoryId, { storeId });

      const response = await request(app)
        .patch(`/api/products/${product.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isAvailable: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isAvailable).toBe(false);
    });
  });

  describe('POST /api/products/:productId/duplicate', () => {
    it('should duplicate product', async () => {
      const product = await createTestProduct(categoryId, {
        name: 'Original',
        storeId,
      });

      const response = await request(app)
        .post(`/api/products/${product.id}/duplicate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toContain('Copy');
    });
  });
});
