import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authorize } from '../../../src/middlewares/authorize.js';
import type { Request, Response, NextFunction } from 'express';
import {
  ForbiddenError,
  UnauthorizedError,
} from '../../../src/utils/AppError.js';

describe('Authorize Middleware', () => {
  let mockNext: ReturnType<typeof vi.fn>;
  let mockRes: Response;

  const createMockRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      userId: 'user-123',
      userRole: 'user',
      params: {},
      ...overrides,
    }) as Request;

  beforeEach(() => {
    mockNext = vi.fn();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
  });

  describe('basic authorization', () => {
    it('should allow access when no roles specified (just authentication check)', async () => {
      const req = createMockRequest();
      const middleware = authorize();

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should throw UnauthorizedError when userId is missing', async () => {
      const req = createMockRequest({ userId: undefined });
      const middleware = authorize({ roles: ['user'] });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw UnauthorizedError when userRole is missing', async () => {
      const req = createMockRequest({ userRole: undefined });
      const middleware = authorize({ roles: ['user'] });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('role-based authorization', () => {
    it('should allow access when user has required role', async () => {
      const req = createMockRequest({ userRole: 'admin' });
      const middleware = authorize({ roles: ['admin'] });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should allow access when user has one of multiple allowed roles', async () => {
      const req = createMockRequest({ userRole: 'moderator' });
      const middleware = authorize({ roles: ['admin', 'moderator'] });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should throw ForbiddenError when user lacks required role', async () => {
      const req = createMockRequest({ userRole: 'user' });
      const middleware = authorize({ roles: ['admin'] });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should throw ForbiddenError when user role not in allowed list', async () => {
      const req = createMockRequest({ userRole: 'user' });
      const middleware = authorize({ roles: ['admin', 'moderator'] });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('self-access authorization', () => {
    it('should allow access when user is accessing their own resource', async () => {
      const req = createMockRequest({
        userId: 'user-123',
        userRole: 'user',
        params: { userId: 'user-123' },
      });
      const middleware = authorize({
        roles: ['admin'],
        allowSelf: true,
        resourceOwnerParam: 'userId',
      });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should deny access when user is not owner and lacks role', async () => {
      const req = createMockRequest({
        userId: 'user-123',
        userRole: 'user',
        params: { userId: 'other-user-456' },
      });
      const middleware = authorize({
        roles: ['admin'],
        allowSelf: true,
        resourceOwnerParam: 'userId',
      });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should allow admin to access any resource', async () => {
      const req = createMockRequest({
        userId: 'admin-123',
        userRole: 'admin',
        params: { userId: 'other-user-456' },
      });
      const middleware = authorize({
        roles: ['admin'],
        allowSelf: true,
        resourceOwnerParam: 'userId',
      });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should not check self-access if allowSelf is false', async () => {
      const req = createMockRequest({
        userId: 'user-123',
        userRole: 'user',
        params: { userId: 'user-123' },
      });
      const middleware = authorize({
        roles: ['admin'],
        allowSelf: false,
        resourceOwnerParam: 'userId',
      });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should not check self-access if resourceOwnerParam is missing', async () => {
      const req = createMockRequest({
        userId: 'user-123',
        userRole: 'user',
        params: { userId: 'user-123' },
      });
      const middleware = authorize({
        roles: ['admin'],
        allowSelf: true,
        // resourceOwnerParam not specified
      });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('empty roles array', () => {
    it('should allow access with empty roles array (authentication only)', async () => {
      const req = createMockRequest();
      const middleware = authorize({ roles: [] });

      await middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
