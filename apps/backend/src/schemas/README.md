# Validation Schemas

This directory contains all Zod validation schemas used throughout the application for request validation.

## Overview

The validation system uses [Zod](https://zod.dev/) for runtime type-safe validation of API requests. All schemas follow a consistent pattern and are organized by feature domain.

## Architecture

```
schemas/
├── common.schema.ts      # Reusable validators (ObjectId, email, phone, etc.)
├── address.schema.ts     # Address-related validations
├── cart.schema.ts        # Cart and cart item validations
├── checkout.schema.ts    # Checkout process validations
├── favorite.schema.ts    # Favorite product validations
├── order.schema.ts       # Order management validations
├── payment.schema.ts     # Payment processing validations
├── search.schema.ts      # Search functionality validations
├── user.schema.ts        # User profile validations
└── index.ts              # Centralized exports
```

## Usage

### Basic Usage

```typescript
import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { createAddressSchema } from '../schemas/index.js';
import { addAddress } from '../controllers/addressController.js';

const router = Router();

router.post('/addresses', validate(createAddressSchema), addAddress);
```

### With Authentication

```typescript
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { favoriteProductParamSchema } from '../schemas/index.js';

router.post(
  '/favorites/:productId',
  authenticate,
  validate(favoriteProductParamSchema),
  addFavorite
);
```

### Type Inference

All schemas export TypeScript types for use in controllers and services:

```typescript
import type { CreateAddressInput } from '../schemas/index.js';

export const addAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const addressData: CreateAddressInput = req.body;
  // TypeScript knows the exact shape of addressData
};
```

## Common Schemas

The `common.schema.ts` file provides reusable validators:

- **objectIdSchema**: Validates MongoDB ObjectId format
- **emailSchema**: Validates and normalizes email addresses
- **phoneSchema**: Validates E.164 phone number format
- **positiveIntSchema**: Validates positive integers
- **paginationSchema**: Standard pagination parameters
- **dateRangeSchema**: Date range query parameters
- **Param schemas**: Pre-built schemas for common route parameters

### Example: Using Common Schemas

```typescript
import { z } from 'zod';
import { objectIdSchema, emailSchema } from './common.schema.js';

export const inviteUserSchema = z.object({
  body: z.object({
    email: emailSchema,
    organizationId: objectIdSchema,
  }),
});
```

## Schema Naming Conventions

- **Create operations**: `create{Feature}Schema`
- **Update operations**: `update{Feature}Schema`
- **Param validation**: `{feature}ParamSchema`
- **Query validation**: `get{Features}QuerySchema`
- **Action-specific**: `{action}{Feature}Schema` (e.g., `cancelOrderSchema`)

## Validation Response Format

When validation fails, the middleware returns a 400 Bad Request with:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email format",
      "code": "invalid_string"
    }
  ]
}
```

## Best Practices

### 1. Keep Schemas DRY

Reuse common validators and compose schemas:

```typescript
// ✅ Good
import { emailSchema, phoneSchema } from './common.schema.js';

export const updateProfileSchema = z.object({
  body: z.object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
  }),
});

// ❌ Avoid
export const updateProfileSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim().optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .optional(),
  }),
});
```

### 2. Use Descriptive Error Messages

```typescript
// ✅ Good
z.string()
  .min(1, 'Product name is required')
  .max(100, 'Product name must be 100 characters or less');

// ❌ Avoid
z.string().min(1).max(100);
```

### 3. Validate at the Route Level

Apply validation middleware at the route definition, not in controllers:

```typescript
// ✅ Good
router.post('/users', validate(createUserSchema), createUser);

// ❌ Avoid validation logic in controllers
```

### 4. Export Types for Controllers

Always export inferred types for use in controllers:

```typescript
export const createUserSchema = z.object({
  body: z.object({
    email: emailSchema,
    name: z.string(),
  }),
});

// Export the type
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
```

### 5. Use Transformations Wisely

Zod can transform data during validation:

```typescript
// Normalize email to lowercase
email: z.string().email().toLowerCase().trim();

// Coerce string to number for query params
page: z.coerce.number().int().positive().default(1);

// Transform to uppercase for codes
couponCode: z.string().trim().toUpperCase();
```

## Adding New Schemas

When adding a new feature, follow these steps:

1. **Create a new schema file**: `src/schemas/{feature}.schema.ts`

2. **Import common validators**:

   ```typescript
   import { z } from 'zod';
   import { objectIdSchema } from './common.schema.js';
   ```

3. **Define your schemas**:

   ```typescript
   export const createFeatureSchema = z.object({
     body: z.object({
       // ... fields
     }),
   });
   ```

4. **Export types**:

   ```typescript
   export type CreateFeatureInput = z.infer<typeof createFeatureSchema>['body'];
   ```

5. **Add to index.ts**:

   ```typescript
   export * from './feature.schema.js';
   ```

6. **Use in routes**:

   ```typescript
   import { validate } from '../middlewares/validate.js';
   import { createFeatureSchema } from '../schemas/index.js';

   router.post('/features', validate(createFeatureSchema), createFeature);
   ```

## Testing Schemas

You can test schemas directly:

```typescript
import { createAddressSchema } from './address.schema.js';

// Valid data
const result = createAddressSchema.safeParse({
  body: {
    label: 'Home',
    fullName: 'John Doe',
    // ... other fields
  },
});

if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.error.issues);
}
```

## Migration from Old Validation

If you have existing validation logic:

1. Create a Zod schema in the appropriate file
2. Add the `validate()` middleware to the route
3. Remove manual validation from controllers
4. Update controller types to use inferred types

## Resources

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
