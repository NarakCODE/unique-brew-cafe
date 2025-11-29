import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from '../../../src/middlewares/errorHandler.js';
import {
  AppError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../../src/utils/AppError.js';
import { ErrorCodes } from '../../../src/utils/errorCodes.js';
import { ZodError, ZodIssue } from 'zod';
import type { Request, Response, NextFunction } from 'express';

describe('Error Handler Middleware', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis();
    jsonMock = vi.fn().mockReturnThis();
    mockReq = {} as Request;
    mockRes = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    mockNext = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('AppError handling', () => {
    it('should handle AppError with correct status code', () => {
      const error = new AppError(
        'Test error',
        400,
        ErrorCodes.VAL_INVALID_INPUT
      );

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Test error',
          errorCode: ErrorCodes.VAL_INVALID_INPUT,
        })
      );
    });

    it('should handle BadRequestError', () => {
      const error = new BadRequestError('Bad request');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Bad request',
        })
      );
    });

    it('should handle NotFoundError', () => {
      const error = new NotFoundError('Resource not found');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Resource not found',
        })
      );
    });

    it('should handle UnauthorizedError', () => {
      const error = new UnauthorizedError('Unauthorized');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Unauthorized',
        })
      );
    });

    it('should include errors array when provided', () => {
      const errors = ['Field 1 is required', 'Field 2 is invalid'];
      const error = new AppError(
        'Validation failed',
        400,
        ErrorCodes.VAL_INVALID_INPUT,
        errors
      );

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          errors,
        })
      );
    });
  });

  describe('ZodError handling', () => {
    it('should handle ZodError and format validation errors', () => {
      const zodIssues: ZodIssue[] = [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['email'],
          message: 'Email is required',
        },
        {
          code: 'too_small',
          minimum: 6,
          type: 'string',
          inclusive: true,
          exact: false,
          path: ['password'],
          message: 'Password must be at least 6 characters',
        },
      ];
      const error = new ZodError(zodIssues);

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
          errorCode: ErrorCodes.VAL_INVALID_INPUT,
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'Email is required',
            }),
            expect.objectContaining({
              field: 'password',
              message: 'Password must be at least 6 characters',
            }),
          ]),
        })
      );
    });

    it('should handle ZodError with nested path', () => {
      const zodIssues: ZodIssue[] = [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['body', 'user', 'email'],
          message: 'Email is required',
        },
      ];
      const error = new ZodError(zodIssues);

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ field: 'body.user.email' }),
          ]),
        })
      );
    });
  });

  describe('Mongoose error handling', () => {
    it('should handle CastError (invalid ID)', () => {
      const error = {
        name: 'CastError',
        path: '_id',
        value: 'invalid-id',
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Invalid _id'),
          errorCode: ErrorCodes.VAL_INVALID_ID,
        })
      );
    });

    it('should handle duplicate key error (code 11000)', () => {
      const error = {
        code: 11000,
        errmsg:
          'E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "test@example.com" }',
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Duplicate field value'),
          errorCode: ErrorCodes.RES_ALREADY_EXISTS,
        })
      );
    });

    it('should handle Mongoose ValidationError', () => {
      const error = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' },
        },
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Invalid input data'),
          errorCode: ErrorCodes.VAL_INVALID_INPUT,
        })
      );
    });
  });

  describe('JWT error handling', () => {
    it('should handle JsonWebTokenError', () => {
      const error = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed',
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid token. Please log in again!',
          errorCode: ErrorCodes.AUTH_INVALID_TOKEN,
        })
      );
    });

    it('should handle TokenExpiredError', () => {
      const error = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Your token has expired! Please log in again.',
          errorCode: ErrorCodes.AUTH_TOKEN_EXPIRED,
        })
      );
    });
  });

  describe('Generic error handling', () => {
    it('should handle unknown errors with 500 status', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Internal Server Error',
          errorCode: ErrorCodes.SYS_INTERNAL_ERROR,
        })
      );
    });

    it('should log error to console', () => {
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });
});
