import { ErrorCodes, type ErrorCode } from './errorCodes.js';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any[];

  constructor(
    message: string,
    statusCode: number,
    errorCode: string = ErrorCodes.SYS_INTERNAL_ERROR,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors || [];
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message = 'Resource not found',
    errorCode: ErrorCode = ErrorCodes.RES_NOT_FOUND
  ) {
    super(message, 404, errorCode);
  }
}

export class BadRequestError extends AppError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(
    message = 'Bad request',
    errorCode: ErrorCode = ErrorCodes.VAL_INVALID_INPUT,
    errors?: any[]
  ) {
    super(message, 400, errorCode, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = 'Unauthorized',
    errorCode: ErrorCode = ErrorCodes.AUTH_UNAUTHORIZED
  ) {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = 'Forbidden',
    errorCode: ErrorCode = ErrorCodes.AUTH_FORBIDDEN
  ) {
    super(message, 403, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(
    message = 'Conflict',
    errorCode: ErrorCode = ErrorCodes.RES_CONFLICT
  ) {
    super(message, 409, errorCode);
  }
}
