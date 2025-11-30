import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authController from '../../../src/controllers/authController.js';
import * as authService from '../../../src/services/authService.js';
import { Request, Response } from 'express';

// Mock authService
vi.mock('../../../src/services/authService.js');

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: any;
  let status: any;

  beforeEach(() => {
    json = vi.fn();
    status = vi.fn().mockReturnValue({ json });
    req = {
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-user-agent'),
    };
    res = {
      status,
      json,
    };
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockAuthResponse = {
        user: {
          id: 'user-id',
          fullName: 'Test User',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      vi.mocked(authService.loginUser).mockResolvedValue(mockAuthResponse);

      await authController.login(req as Request, res as Response, vi.fn());

      expect(authService.loginUser).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'Password123!' },
        expect.any(Object)
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockAuthResponse,
      });
    });

    it('should throw error if email or password missing', async () => {
      req.body = {
        email: 'test@example.com',
        // Missing password
      };

      const next = vi.fn();
      await authController.login(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('register', () => {
    it('should register user and return tokens', async () => {
      req.body = {
        fullName: 'New User',
        email: 'new@example.com',
        password: 'Password123!',
      };

      const mockAuthResponse = {
        user: {
          id: 'new-user-id',
          fullName: 'New User',
          email: 'new@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      vi.mocked(authService.registerUser).mockResolvedValue(mockAuthResponse);

      await authController.register(req as Request, res as Response, vi.fn());

      expect(authService.registerUser).toHaveBeenCalledWith(
        {
          fullName: 'New User',
          email: 'new@example.com',
          password: 'Password123!',
        },
        expect.any(Object)
      );
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockAuthResponse,
      });
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      req.body = {
        refreshToken: 'valid-refresh-token',
      };

      vi.mocked(authService.logoutUser).mockResolvedValue({
        message: 'Logged out successfully',
      });

      await authController.logout(req as Request, res as Response, vi.fn());

      expect(authService.logoutUser).toHaveBeenCalledWith(
        'valid-refresh-token'
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    });

    it('should throw error if refresh token missing', async () => {
      req.body = {};

      const next = vi.fn();
      await authController.logout(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
