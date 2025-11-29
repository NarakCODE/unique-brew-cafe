import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  authenticate,
  optionalAuthenticate,
} from '../../../src/middlewares/auth.js';
import { generateAuthToken, createTestUser } from '../../utils/testHelpers.js';
import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../../src/utils/AppError.js';

describe('Auth Middleware', () => {
  let mockNext: ReturnType<typeof vi.fn>;

  const mockRequest = (authHeader?: string) =>
    ({
      headers: {
        authorization: authHeader,
      },
    }) as Request;

  const mockResponse = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    mockNext = vi.fn();
  });

  describe('authenticate', () => {
    it('should authenticate with valid token and active user', async () => {
      const user = await createTestUser({
        email: `auth-test-${Date.now()}@example.com`,
      });
      const token = generateAuthToken(user.id, 'user');
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
      expect(req.userId).toBe(user.id);
      expect(req.userRole).toBe('user');
    });

    it('should reject request without authorization header', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject request with invalid token format (no Bearer prefix)', async () => {
      const req = mockRequest('InvalidFormat token123');
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject request with empty token after Bearer', async () => {
      const req = mockRequest('Bearer ');
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject request with invalid JWT token', async () => {
      const req = mockRequest('Bearer invalid.jwt.token');
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject request for suspended user', async () => {
      const user = await createTestUser({
        email: `suspended-${Date.now()}@example.com`,
        status: 'suspended',
      });
      const token = generateAuthToken(user.id, 'user');
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      const error = mockNext.mock.calls[0][0] as UnauthorizedError;
      expect(error.message).toContain('suspended');
    });

    it('should reject request for deleted user', async () => {
      const user = await createTestUser({
        email: `deleted-${Date.now()}@example.com`,
        status: 'deleted',
      });
      const token = generateAuthToken(user.id, 'user');
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      const error = mockNext.mock.calls[0][0] as UnauthorizedError;
      expect(error.message).toContain('deleted');
    });

    it('should reject request for non-existent user', async () => {
      const token = generateAuthToken('507f1f77bcf86cd799439011', 'user');
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should set userRole correctly for admin', async () => {
      const admin = await createTestUser({
        email: `admin-${Date.now()}@example.com`,
        role: 'admin',
      });
      const token = generateAuthToken(admin.id, 'admin');
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.userRole).toBe('admin');
    });
  });

  describe('optionalAuthenticate', () => {
    it('should authenticate with valid token', async () => {
      const user = await createTestUser({
        email: `optional-${Date.now()}@example.com`,
      });
      const token = generateAuthToken(user.id, 'user');
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();

      await optionalAuthenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
      expect(req.userId).toBe(user.id);
    });

    it('should proceed without error when no token provided', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await optionalAuthenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
      expect(req.userId).toBeUndefined();
    });

    it('should proceed without error when invalid token provided', async () => {
      const req = mockRequest('Bearer invalid.token.here');
      const res = mockResponse();

      await optionalAuthenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
      expect(req.userId).toBeUndefined();
    });

    it('should proceed without error when token format is wrong', async () => {
      const req = mockRequest('WrongFormat token');
      const res = mockResponse();

      await optionalAuthenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.userId).toBeUndefined();
    });
  });
});
