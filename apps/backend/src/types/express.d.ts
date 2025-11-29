import 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: 'user' | 'admin' | 'moderator';
    }
  }
}
