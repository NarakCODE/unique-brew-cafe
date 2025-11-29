# Validation System Migration Guide

This guide helps you migrate from the old validation approach to the new Zod-based validation system.

## Overview of Changes

### Before (Old System)

- Manual validation in controllers
- Inconsistent error responses
- No type safety
- Scattered validation logic

### After (New System)

- Centralized Zod schemas
- Consistent error responses
- Full TypeScript type inference
- Validation at route level

## Migration Steps

### Step 1: Identify Validation Logic

Look for validation code in your controllers:

```typescript
// ❌ Old way - validation in controller
export const addAddress = async (req: Request, res: Response) => {
  const { label, fullName, phoneNumber } = req.body;

  if (!label || label.trim().length === 0) {
    return res.status(400).json({ message: 'Label is required' });
  }

  if (!fullName || fullName.trim().length === 0) {
    return res.status(400).json({ message: 'Full name is required' });
  }

  // ... more validation

  // Business logic
  const address = await addressService.addAddress(userId, req.body);
  res.json({ success: true, data: address });
};
```

### Step 2: Create or Use Existing Schema

Check if a schema already exists in `src/schemas/`. If not, create one:

```typescript
// src/schemas/address.schema.ts
import { z } from 'zod';
import { phoneSchema } from './common.schema.js';

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().trim().min(1, 'Label is required'),
    fullName: z.string().trim().min(1, 'Full name is required'),
    phoneNumber: phoneSchema,
    // ... other fields
  }),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>['body'];
```

### Step 3: Update Route

Add the validation middleware to your route:

```typescript
// ✅ New way - validation at route level
import { validate } from '../middlewares/validate.js';
import { createAddressSchema } from '../schemas/index.js';

router.post('/', authenticate, validate(createAddressSchema), addAddress);
```

### Step 4: Clean Up Controller

Remove validation logic and add type annotations:

```typescript
// ✅ New way - clean controller
import type { CreateAddressInput } from '../schemas/index.js';

export const addAddress = async (req: Request, res: Response) => {
  // No validation needed - already done by middleware
  const addressData: CreateAddressInput = req.body;

  // Business logic only
  const address = await addressService.addAddress(req.userId!, addressData);
  res.json({ success: true, data: address });
};
```

## Common Migration Patterns

### Pattern 1: Simple Body Validation

**Before:**

```typescript
// Controller
if (!req.body.name) {
  return res.status(400).json({ message: 'Name is required' });
}
```

**After:**

```typescript
// Schema
export const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
});

// Route
router.post('/items', validate(createItemSchema), createItem);
```

### Pattern 2: ObjectId Validation

**Before:**

```typescript
// Controller
if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
  return res.status(400).json({ message: 'Invalid product ID' });
}
```

**After:**

```typescript
// Use pre-built schema
import { productIdParamSchema } from '../schemas/index.js';

router.post(
  '/favorites/:productId',
  validate(productIdParamSchema),
  addFavorite
);
```

### Pattern 3: Query Parameter Validation

**Before:**

```typescript
// Controller
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 20;

if (limit > 100) {
  return res.status(400).json({ message: 'Limit cannot exceed 100' });
}
```

**After:**

```typescript
// Schema
export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

// Route
router.get('/users', validate(getUsersQuerySchema), getUsers);

// Controller - types are inferred
const { page, limit } = req.query; // TypeScript knows these are numbers
```

### Pattern 4: Nested Object Validation

**Before:**

```typescript
// Controller
if (!req.body.preferences || typeof req.body.preferences !== 'object') {
  return res.status(400).json({ message: 'Invalid preferences' });
}
```

**After:**

```typescript
// Schema
export const updateProfileSchema = z.object({
  body: z.object({
    preferences: z
      .object({
        notificationsEnabled: z.boolean(),
        language: z.enum(['en', 'km']),
      })
      .optional(),
  }),
});
```

### Pattern 5: Email and Phone Validation

**Before:**

```typescript
// Controller
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(req.body.email)) {
  return res.status(400).json({ message: 'Invalid email' });
}
```

**After:**

```typescript
// Use common schema
import { emailSchema, phoneSchema } from '../schemas/common.schema.js';

export const updateContactSchema = z.object({
  body: z.object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
  }),
});
```

## Feature-by-Feature Migration Checklist

### Favorites ✅ (Completed)

- [x] Create `favorite.schema.ts`
- [x] Update `favoriteRoutes.ts`
- [x] Clean up `favoriteController.ts`

### Addresses ✅ (Completed)

- [x] Create `address.schema.ts`
- [x] Update `addressRoutes.ts`
- [x] Clean up `addressController.ts`

### Cart ✅ (Completed)

- [x] Create `cart.schema.ts`
- [x] Update `cartRoutes.ts`
- [x] Clean up `cartController.ts`

### Orders (To Do)

- [ ] Create `order.schema.ts` ✅ (Schema created)
- [ ] Update `orderRoutes.ts`
- [ ] Clean up `orderController.ts`

### Users (To Do)

- [ ] Create `user.schema.ts` ✅ (Schema created)
- [ ] Update `userRoutes.ts`
- [ ] Clean up `userController.ts`

### Search (To Do)

- [ ] Create `search.schema.ts` ✅ (Schema created)
- [ ] Update `searchRoutes.ts`
- [ ] Clean up `searchController.ts`

### Checkout (To Do)

- [ ] Create `checkout.schema.ts` ✅ (Schema created)
- [ ] Update `checkoutRoutes.ts`
- [ ] Clean up `checkoutController.ts`

### Payment (To Do)

- [ ] Create `payment.schema.ts` ✅ (Schema created)
- [ ] Update `paymentRoutes.ts`
- [ ] Clean up `paymentController.ts`

## Testing Your Migration

### 1. Test Valid Requests

```bash
# Should succeed
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Home",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA"
  }'
```

### 2. Test Invalid Requests

```bash
# Should return 400 with validation errors
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "",
    "fullName": "John Doe"
  }'

# Expected response:
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.label",
      "message": "Label is required",
      "code": "too_small"
    },
    {
      "field": "body.phoneNumber",
      "message": "Required",
      "code": "invalid_type"
    }
  ]
}
```

### 3. Test Type Safety

```typescript
// TypeScript should catch errors at compile time
import type { CreateAddressInput } from '../schemas/index.js';

const addressData: CreateAddressInput = {
  label: 'Home',
  fullName: 'John Doe',
  phoneNumber: '+1234567890',
  // TypeScript error: missing required fields
};
```

## Common Issues and Solutions

### Issue 1: "Cannot find module '../schemas/index.js'"

**Solution:** Make sure you've created the schema file and exported it from `index.ts`:

```typescript
// src/schemas/index.ts
export * from './address.schema.js';
```

### Issue 2: Validation passes but TypeScript shows errors

**Solution:** Make sure you're using the inferred type:

```typescript
import type { CreateAddressInput } from '../schemas/index.js';

const addressData: CreateAddressInput = req.body; // ✅ Correct
```

### Issue 3: Query parameters not being coerced

**Solution:** Use `z.coerce` for query parameters:

```typescript
// ❌ Wrong - query params are strings
page: z.number().int().positive();

// ✅ Correct - coerce string to number
page: z.coerce.number().int().positive();
```

### Issue 4: Optional fields showing as required

**Solution:** Use `.optional()` or `.partial()`:

```typescript
// Single optional field
email: emailSchema.optional();

// Make all fields optional
body: createAddressSchema.shape.body.partial();
```

## Benefits After Migration

1. **Type Safety**: Full TypeScript inference from schemas to controllers
2. **Consistency**: All validation errors follow the same format
3. **Maintainability**: Validation logic in one place
4. **Reusability**: Common validators shared across features
5. **Documentation**: Schemas serve as API documentation
6. **Testing**: Easy to test schemas independently

## Need Help?

- Check `src/schemas/README.md` for detailed documentation
- Look at migrated routes (favorites, addresses, cart) for examples
- Review `src/schemas/common.schema.ts` for reusable validators
