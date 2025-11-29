import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodIssue } from 'zod';
import { AppError } from '../utils/AppError.js';
import { ErrorCodes } from '../utils/errorCodes.js';

/**
 * Formatted validation error structure
 */
interface FormattedValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Format Zod validation errors into a user-friendly structure
 * @param issues - Array of Zod validation issues
 * @returns Formatted error array
 */
const formatZodErrors = (issues: ZodIssue[]): FormattedValidationError[] => {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
    code: issue.code,
  }));
};

export const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  let error = err;

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    const errors = formatZodErrors(err.issues);
    const message = 'Validation failed';
    error = new AppError(message, 400, ErrorCodes.VAL_INVALID_INPUT, errors);
  }

  // Handle Mongoose CastError (Invalid ID)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 404, ErrorCodes.VAL_INVALID_ID);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    error = new AppError(message, 400, ErrorCodes.RES_ALREADY_EXISTS);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    error = new AppError(message, 400, ErrorCodes.VAL_INVALID_INPUT, errors);
  }

  // Handle JWT Invalid Token
  if (err.name === 'JsonWebTokenError') {
    error = new AppError(
      'Invalid token. Please log in again!',
      401,
      ErrorCodes.AUTH_INVALID_TOKEN
    );
  }

  // Handle JWT Expired Token
  if (err.name === 'TokenExpiredError') {
    error = new AppError(
      'Your token has expired! Please log in again.',
      401,
      ErrorCodes.AUTH_TOKEN_EXPIRED
    );
  }

  // Send Response
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
      errors: error.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  // Generic Error
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    errorCode: ErrorCodes.SYS_INTERNAL_ERROR,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
