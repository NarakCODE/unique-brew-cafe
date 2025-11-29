import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodObject } from 'zod';

/**
 * @deprecated Use `validate` from './validate.js' instead
 *
 * This middleware is kept for backward compatibility but will be removed in a future version.
 * Please migrate to the new validation system:
 *
 * @example
 * ```typescript
 * // Old way (deprecated)
 * import validateResource from '../middlewares/validateResource.js';
 * router.post('/users', validateResource(schema), handler);
 *
 * // New way (recommended)
 * import { validate } from '../middlewares/validate.js';
 * import { createUserSchema } from '../schemas/index.js';
 * router.post('/users', validate(createUserSchema), handler);
 * ```
 */
const validateResource =
  (schema: ZodObject) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Pass to global error handler
        return next(error);
      }
      return next(error);
    }
  };

export default validateResource;
