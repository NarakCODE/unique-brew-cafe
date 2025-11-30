import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

/**
 * Authentication middleware to protect routes
 * Verifies JWT token from Authorization header and attaches userId to request
 * Requirements: 19.5 - Reject authentication for suspended users
 * @throws UnauthorizedError if token is missing or invalid
 */
export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError(
        'Access denied. No token provided or invalid format.'
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('Access denied. No token provided.');
    }

    // Verify token and extract user information
    const decoded = verifyAccessToken(token);

    // Check if user account is suspended
    const user = await User.findById(decoded.userId)
      .select('status lastLogoutAt')
      .lean();

    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedError(
        'Your account has been suspended. Please contact support.'
      );
    }

    if (user.status === 'deleted') {
      throw new UnauthorizedError('User account has been deleted');
    }

    // Check if token was issued before the last logout
    if (user.lastLogoutAt && decoded.iat) {
      // Compare in milliseconds to avoid rounding issues
      const tokenIssuedAtMs = decoded.iat * 1000;
      const lastLogoutAtMs = new Date(user.lastLogoutAt).getTime();

      if (tokenIssuedAtMs < lastLogoutAtMs) {
        throw new UnauthorizedError('Session expired. Please login again.');
      }
    }

    // Attach user information to request object for use in controllers
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    next();
  }
);

/**
 * Optional authentication middleware
 * Attempts to verify token if present, but does not throw if missing
 */
export const optionalAuthenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          req.userId = decoded.userId;
          req.userEmail = decoded.email;
          req.userRole = decoded.role;
        } catch {
          // Ignore invalid tokens for optional auth
          // We just treat them as guests
        }
      }
    }

    next();
  }
);
