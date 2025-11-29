import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import {
  createTestUser,
  createTestStore,
  createTestCategory,
  createTestProduct,
  generateAuthToken,
} from '../utils/testHelpers.js';

const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

describe('Cart API', () => {
  let token: string;
  let userId: string;
  let productId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    const store = await createTestStore();
    const category = await createTestCategory();
    const product = await createTestProduct(category.id, { storeId: store.id });

    userId = user.id;
    productId = product.id;
    token = generateAuthToken(userId, 'user');
  });

  describe('GET /api/cart', () => {
    it('should return empty cart for new user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.subtotal).toBe(0);
    });

    it('should return 401 without auth', async () => {
      await request(app).get('/api/cart').expect(401);
    });
  });

  describe('POST /api/cart/items', () => {
    it('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId,
          quantity: 2,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].quantity).toBe(2);
    });

    it('should return 400 for invalid quantity', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId,
          quantity: 0,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: '507f1f77bcf86cd799439011',
          quantity: 1,
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/cart/items/:itemId', () => {
    it('should update item quantity', async () => {
      // Add item first
      const addResponse = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 2 });

      const itemId = addResponse.body.data.items[0].id;

      // Update quantity
      const response = await request(app)
        .patch(`/api/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items[0].quantity).toBe(5);
    });
  });

  describe('DELETE /api/cart/items/:itemId', () => {
    it('should remove item from cart', async () => {
      // Add item first
      const addResponse = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 2 });

      const itemId = addResponse.body.data.items[0].id;

      // Remove item
      const response = await request(app)
        .delete(`/api/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(0);
    });
  });

  describe('DELETE /api/cart', () => {
    it('should clear entire cart', async () => {
      // Add item first
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 2 });

      // Clear cart
      const response = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify cart is empty
      const getResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.body.data.items).toHaveLength(0);
    });
  });

  describe('GET /api/cart/summary', () => {
    it('should return cart summary with totals', async () => {
      // Add item first
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 2 });

      const response = await request(app)
        .get('/api/cart/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('subtotal');
      expect(response.body.data).toHaveProperty('tax');
      expect(response.body.data).toHaveProperty('total');
    });
  });
});
