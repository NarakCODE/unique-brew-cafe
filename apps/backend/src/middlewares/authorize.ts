import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

interface AuthorizeOptions {
  roles?: ('user' | 'admin' | 'moderator')[];
  allowSelf?: boolean;
  resourceOwnerParam?: string;
}

/**
 * Authorization middleware to check user roles
 * Must be used after authenticate middleware
 * @param options - Authorization options
 * @returns Express middleware function
 * @throws UnauthorizedError if user is not authenticated
 * @throws ForbiddenError if user doesn't have required role
 */
export const authorize = (options: AuthorizeOptions = {}) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { roles, allowSelf, resourceOwnerParam } = options;

      // Ensure user is authenticated
      if (!req.userId || !req.userRole) {
        throw new UnauthorizedError(
          'Authentication required to access this resource'
        );
      }

      // If no roles specified, just check authentication
      if (!roles || roles.length === 0) {
        return next();
      }

      // Check if user has required role
      const hasRequiredRole = roles.includes(req.userRole);

      // If user has required role, allow access
      if (hasRequiredRole) {
        return next();
      }

      // Check if user is accessing their own resource
      if (allowSelf && resourceOwnerParam) {
        const resourceOwnerId = req.params[resourceOwnerParam];
        if (resourceOwnerId === req.userId) {
          return next();
        }
      }

      // User doesn't have permission
      throw new ForbiddenError(
        'You do not have permission to access this resource'
      );
    }
  );
};
