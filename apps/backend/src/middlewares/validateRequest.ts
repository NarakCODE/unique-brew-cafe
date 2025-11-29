import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { ErrorCodes } from '../utils/errorCodes.js';

export const validateUser = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(
      new AppError(
        'Please provide name, email, and password',
        400,
        ErrorCodes.VAL_MISSING_FIELD
      )
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(
      new AppError('Invalid email format', 400, ErrorCodes.VAL_INVALID_FORMAT)
    );
  }

  next();
};
