import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/AppError.js';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Not Found - ${req.originalUrl}`);
  next(error);
};
