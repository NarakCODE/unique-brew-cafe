# Validation Quick Reference

Quick copy-paste examples for common validation scenarios.

## Basic Setup

```typescript
// In your route file
import { validate } from '../middlewares/validate.js';
import { yourSchema } from '../schemas/index.js';

router.post('/endpoint', authenticate, validate(yourSchema), controller);
```

## Common Validators

### MongoDB ObjectId

```typescript
import { objectIdSchema } from './common.schema.js';

productId: objectIdSchema;
```

### Email

```typescript
import { emailSchema } from './common.schema.js';

email: emailSchema; // Validates, lowercases, and trims
```

### Phone Number

```typescript
import { phoneSchema } from './common.schema.js';

phone: phoneSchema; // E.164 format: +1234567890
```

### Positive Integer

```typescript
import { positiveIntSchema } from './common.schema.js';

quantity: positiveIntSchema;
```

## Schema Patterns

### Body Validation

```typescript
export const createItemSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    price: z.number().positive('Price must be positive'),
  }),
});
```

### Params Validation

```typescript
export const itemParamSchema = z.object({
  params: z.object({
    itemId: objectIdSchema,
  }),
});
```

### Query Validation

```typescript
export const getItemsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().trim().optional(),
  }),
});
```

### Combined Validation

```typescript
export const updateItemSchema = z.object({
  params: z.object({
    itemId: objectIdSchema,
  }),
  body: z.object({
    name: z.string().trim().min(1).optional(),
    price: z.number().positive().optional(),
  }),
});
```

## Common Field Types

### Required String

```typescript
name: z.string().trim().min(1, 'Name is required');
```

### Optional String

```typescript
description: z.string().trim().optional();
```

### String with Length Limits

```typescript
title: z.string()
  .trim()
  .min(1)
  .max(100, 'Title must be 100 characters or less');
```

### Enum

```typescript
status: z.enum(['active', 'inactive', 'pending']);
```

### Number with Range

```typescript
rating: z.number().int().min(1).max(5);
```

### Boolean

```typescript
isActive: z.boolean();
```

### Date

```typescript
birthDate: z.coerce.date();
```

### Array

```typescript
tags: z.array(z.string());
addOns: z.array(objectIdSchema);
```

### Nested Object

```typescript
address: z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string(),
});
```

### Optional Nested Object

```typescript
preferences: z.object({
  notifications: z.boolean(),
  language: z.enum(['en', 'km']),
}).optional();
```

## Transformations

### Lowercase Email

```typescript
email: z.string().email().toLowerCase().trim();
```

### Uppercase Code

```typescript
couponCode: z.string().trim().toUpperCase();
```

### Coerce String to Number

```typescript
// For query parameters
page: z.coerce.number().int().positive();
```

### Default Values

```typescript
limit: z.number().int().positive().default(20);
```

## Reusing Schemas

### Extend Existing Schema

```typescript
export const updateItemSchema = z.object({
  params: itemParamSchema.shape.params,
  body: createItemSchema.shape.body.partial(),
});
```

### Make All Fields Optional

```typescript
body: createItemSchema.shape.body.partial();
```

### Pick Specific Fields

```typescript
body: createItemSchema.shape.body.pick({ name: true, price: true });
```

### Omit Specific Fields

```typescript
body: createItemSchema.shape.body.omit({ createdAt: true });
```

## Type Inference

### Export Types

```typescript
export const createItemSchema = z.object({
  body: z.object({
    name: z.string(),
    price: z.number(),
  }),
});

export type CreateItemInput = z.infer<typeof createItemSchema>['body'];
```

### Use in Controller

```typescript
import type { CreateItemInput } from '../schemas/index.js';

export const createItem = async (req: Request, res: Response) => {
  const itemData: CreateItemInput = req.body;
  // TypeScript knows exact shape of itemData
};
```

## Pre-built Param Schemas

```typescript
import {
  productIdParamSchema,
  userIdParamSchema,
  orderIdParamSchema,
  addressIdParamSchema,
  storeIdParamSchema,
  categoryIdParamSchema,
} from '../schemas/common.schema.js';

// Use directly in routes
router.get('/products/:productId', validate(productIdParamSchema), getProduct);
```

## Validation Error Response

When validation fails, the API returns:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email format",
      "code": "invalid_string"
    },
    {
      "field": "body.age",
      "message": "Expected number, received string",
      "code": "invalid_type"
    }
  ]
}
```

## Testing Schemas

```typescript
import { createItemSchema } from './item.schema.js';

// Test valid data
const validResult = createItemSchema.safeParse({
  body: { name: 'Item', price: 10 },
});
console.log(validResult.success); // true

// Test invalid data
const invalidResult = createItemSchema.safeParse({
  body: { name: '', price: -5 },
});
console.log(invalidResult.success); // false
console.log(invalidResult.error?.issues); // Array of errors
```

## Common Patterns Cheat Sheet

| Need               | Code                           |
| ------------------ | ------------------------------ |
| Required string    | `z.string().trim().min(1)`     |
| Optional string    | `z.string().trim().optional()` |
| Email              | `emailSchema` (from common)    |
| Phone              | `phoneSchema` (from common)    |
| ObjectId           | `objectIdSchema` (from common) |
| Positive number    | `z.number().positive()`        |
| Integer            | `z.number().int()`             |
| Enum               | `z.enum(['a', 'b', 'c'])`      |
| Array              | `z.array(z.string())`          |
| Optional field     | `.optional()`                  |
| Default value      | `.default(value)`              |
| Query param number | `z.coerce.number()`            |
| Uppercase          | `.toUpperCase()`               |
| Lowercase          | `.toLowerCase()`               |
| Trim whitespace    | `.trim()`                      |

## Full Example

```typescript
// src/schemas/product.schema.ts
import { z } from 'zod';
import { objectIdSchema, positiveIntSchema } from './common.schema.js';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    description: z.string().trim().max(500).optional(),
    price: positiveIntSchema,
    categoryId: objectIdSchema,
    tags: z.array(z.string()).optional(),
    isAvailable: z.boolean().default(true),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
  body: createProductSchema.shape.body.partial(),
});

export const productParamSchema = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ProductParams = z.infer<typeof productParamSchema>['params'];
```

```typescript
// src/routes/productRoutes.ts
import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  createProductSchema,
  updateProductSchema,
  productParamSchema,
} from '../schemas/index.js';
import * as productController from '../controllers/productController.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  '/:productId',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(updateProductSchema),
  productController.updateProduct
);

router.get(
  '/:productId',
  validate(productParamSchema),
  productController.getProduct
);

export default router;
```

```typescript
// src/controllers/productController.ts
import type { Request, Response } from 'express';
import type {
  CreateProductInput,
  UpdateProductInput,
} from '../schemas/index.js';
import * as productService from '../services/productService.js';

export const createProduct = async (req: Request, res: Response) => {
  const productData: CreateProductInput = req.body;
  const product = await productService.createProduct(productData);
  res.status(201).json({ success: true, data: product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const updates: UpdateProductInput = req.body;
  const product = await productService.updateProduct(productId, updates);
  res.json({ success: true, data: product });
};
```
