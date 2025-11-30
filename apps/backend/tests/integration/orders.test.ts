import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Router } from 'express';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import {
  createTestUser,
  createTestAdmin,
  generateAuthToken,
} from '../utils/testHelpers.js';
import { Order } from '../../src/models/Order.js';

const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

describe('Orders API', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    const admin = await createTestAdmin();

    userId = user.id;
    userToken = generateAuthToken(user.id, 'user');
    adminToken = generateAuthToken(admin.id, 'admin');
  });

  describe('GET /api/orders', () => {
    it('should return user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return 401 without auth', async () => {
      await request(app).get('/api/orders').expect(401);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/orders/:orderId', () => {
    it('should return order details for owner', async () => {
      // Create a test order
      const order = await Order.create({
        orderNumber: 'TEST-001',
        userId,
        storeId: '507f1f77bcf86cd799439011',
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentMethod: 'card',
        subtotal: 10.0,
        tax: 1.0,
        total: 11.0,
        currency: 'USD',
      });

      const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBe('TEST-001');
    });

    it('should return 404 for non-existent order', async () => {
      await request(app)
        .get('/api/orders/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('POST /api/orders/:orderId/cancel', () => {
    it('should cancel order within time limit', async () => {
      const order = await Order.create({
        orderNumber: 'TEST-002',
        userId,
        storeId: '507f1f77bcf86cd799439011',
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentMethod: 'card',
        subtotal: 10.0,
        tax: 1.0,
        total: 11.0,
        currency: 'USD',
        createdAt: new Date(), // Just created
      });

      const response = await request(app)
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Changed my mind' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });
  });

  describe('Admin endpoints', () => {
    it('should allow admin to view all orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to update order status', async () => {
      const order = await Order.create({
        orderNumber: 'TEST-003',
        userId,
        storeId: '507f1f77bcf86cd799439011',
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentMethod: 'card',
        subtotal: 10.0,
        tax: 1.0,
        total: 11.0,
        currency: 'USD',
      });

      const response = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'preparing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('preparing');
    });

    it('should return 403 for non-admin updating status', async () => {
      const order = await Order.create({
        orderNumber: 'TEST-004',
        userId,
        storeId: '507f1f77bcf86cd799439011',
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentMethod: 'card',
        subtotal: 10.0,
        tax: 1.0,
        total: 11.0,
        currency: 'USD',
      });

      await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'preparing' })
        .expect(403);
    });
  });
});
