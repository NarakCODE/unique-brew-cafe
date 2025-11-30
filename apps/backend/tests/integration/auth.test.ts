import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express, { Router } from 'express';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import { createTestUser } from '../utils/testHelpers.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'NewUser123!',
          fullName: 'New User',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test123!',
          fullName: 'Test User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          fullName: 'Test User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      await createTestUser({ email: 'existing@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'Test123!',
          fullName: 'Test User',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await createTestUser({
        email: 'login@example.com',
        password: 'Login123!',
        emailVerified: true,
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Login123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty(
        'email',
        'login@example.com'
      );
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user', async () => {
      // First login
      await createTestUser({
        email: 'logout@example.com',
        password: 'Logout123!',
        emailVerified: true,
      });

      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'logout@example.com',
        password: 'Logout123!',
      });

      const { accessToken, refreshToken } = loginResponse.body.data;

      // Then logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'some-token' })
        .expect(401);
    });
  });
});
