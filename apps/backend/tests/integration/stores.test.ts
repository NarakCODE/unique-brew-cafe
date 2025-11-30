import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Router } from 'express';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import {
  createTestStore,
  createTestAdmin,
  generateAuthToken,
} from '../utils/testHelpers.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

describe('Stores API', () => {
  describe('GET /api/stores', () => {
    beforeEach(async () => {
      await createTestStore({ name: 'Store 1' });
      await createTestStore({ name: 'Store 2', isActive: false });
    });

    it('should return all active stores', async () => {
      const response = await request(app).get('/api/stores').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter stores by city', async () => {
      await createTestStore({ name: 'NYC Store', city: 'New York' });

      const response = await request(app)
        .get('/api/stores?city=New York')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((s: any) => s.city === 'New York')).toBe(
        true
      );
    });

    it('should include pagination metadata', async () => {
      const response = await request(app).get('/api/stores').expect(200);

      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });
  });

  describe('GET /api/stores/:storeId', () => {
    it('should return store details', async () => {
      const store = await createTestStore();

      const response = await request(app)
        .get(`/api/stores/${store.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', store.name);
      expect(response.body.data).toHaveProperty('address');
    });

    it('should return 404 for non-existent store', async () => {
      const response = await request(app)
        .get('/api/stores/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/stores', () => {
    it('should create store with admin auth', async () => {
      const admin = await createTestAdmin();
      const token = generateAuthToken(admin.id, 'admin');

      const response = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Store',
          address: '456 New St',
          city: 'New City',
          state: 'New State',
          country: 'New Country',
          phone: '+9876543210',
          latitude: 40.7128,
          longitude: -74.006,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'New Store');
    });

    it('should return 401 without auth', async () => {
      await request(app)
        .post('/api/stores')
        .send({
          name: 'New Store',
          address: '456 New St',
          city: 'New City',
        })
        .expect(401);
    });

    it('should return 403 for non-admin user', async () => {
      const admin = await createTestAdmin({ role: 'user' });
      const token = generateAuthToken(admin.id, 'user');

      await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Store',
          address: '456 New St',
          city: 'New City',
        })
        .expect(403);
    });
  });

  describe('PATCH /api/stores/:storeId', () => {
    it('should update store with admin auth', async () => {
      const store = await createTestStore();
      const admin = await createTestAdmin();
      const token = generateAuthToken(admin.id, 'admin');

      const response = await request(app)
        .patch(`/api/stores/${store.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Store Name',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Updated Store Name');
    });
  });

  describe('DELETE /api/stores/:storeId', () => {
    it('should delete store with admin auth', async () => {
      const store = await createTestStore();
      const admin = await createTestAdmin();
      const token = generateAuthToken(admin.id, 'admin');

      const response = await request(app)
        .delete(`/api/stores/${store.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/stores/:storeId/gallery', () => {
    it('should return store gallery images', async () => {
      const store = await createTestStore({
        images: ['image1.jpg', 'image2.jpg'],
      });

      const response = await request(app)
        .get(`/api/stores/${store.id}/gallery`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/stores/:storeId/hours', () => {
    it('should return store opening hours', async () => {
      const store = await createTestStore({
        openingHours: {
          monday: { open: '09:00', close: '17:00' },
        },
      });

      const response = await request(app)
        .get(`/api/stores/${store.id}/hours`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('openingHours');
    });
  });

  describe('GET /api/stores/:storeId/location', () => {
    it('should return store location', async () => {
      const store = await createTestStore();

      const response = await request(app)
        .get(`/api/stores/${store.id}/location`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('latitude');
      expect(response.body.data).toHaveProperty('longitude');
    });
  });
});
