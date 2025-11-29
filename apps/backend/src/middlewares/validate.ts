import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';

/**
 * Middleware factory for validating requests against Zod schemas
 *
 * Validates request body, query parameters, and route params against a Zod schema.
 * If validation fails, it passes the error to the global error handler.
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * import { validate } from '../middlewares/validate.js';
 * import { createUserSchema } from '../schemas/user.schema.js';
 *
 * router.post('/users', validate(createUserSchema), createUser);
 * ```
 */
export const validate = (schema: z.ZodTypeAny) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate request data against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Validation passed, proceed to next middleware
      next();
    } catch (error) {
      // Pass error to global error handler
      next(error);
    }
  };
};

export default validate;
