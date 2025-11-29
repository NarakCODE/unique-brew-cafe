# Middleware Documentation

## Authorization Middleware

The `authorize` middleware provides role-based access control (RBAC) for API endpoints.

### Usage

The `authorize` middleware must be used **after** the `authenticate` middleware.

#### Basic Usage - Admin Only

```typescript
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

// Only admins can access this endpoint
router.post(
  '/stores',
  authenticate,
  authorize({ roles: ['admin'] }),
  createStore
);
```

#### Multiple Roles

```typescript
// Admins and moderators can access
router.patch(
  '/products/:id',
  authenticate,
  authorize({ roles: ['admin', 'moderator'] }),
  updateProduct
);
```

#### Allow Self Access

Users can access their own resources even without the required role:

```typescript
// Admins can access any user, users can access their own profile
router.get(
  '/users/:userId',
  authenticate,
  authorize({
    roles: ['admin'],
    allowSelf: true,
    resourceOwnerParam: 'userId',
  }),
  getUserProfile
);
```

#### Any Authenticated User

```typescript
// Any authenticated user can access
router.get('/favorites', authenticate, getFavorites);

// Or explicitly with empty roles
router.get('/cart', authenticate, authorize({ roles: [] }), getCart);
```

### Options

| Option               | Type                                   | Description                                                                                                         |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `roles`              | `('user' \| 'admin' \| 'moderator')[]` | Array of roles that can access the endpoint. If empty or undefined, any authenticated user can access.              |
| `allowSelf`          | `boolean`                              | If true, allows users to access their own resources even without the required role.                                 |
| `resourceOwnerParam` | `string`                               | The route parameter name that contains the resource owner's ID (e.g., 'userId'). Required when `allowSelf` is true. |

### Error Responses

#### 401 Unauthorized

Returned when the user is not authenticated (no valid JWT token).

```json
{
  "success": false,
  "error": "Authentication required to access this resource"
}
```

#### 403 Forbidden

Returned when the user is authenticated but doesn't have the required role.

```json
{
  "success": false,
  "error": "You do not have permission to access this resource"
}
```

### JWT Token Structure

The JWT token must include the following claims:

```typescript
{
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  iat: number;
  exp: number;
}
```

### User Roles

- **user**: Regular users who can browse, order, and manage their own account
- **admin**: System administrators with full access to all resources
- **moderator**: Users with elevated permissions (between user and admin)

### Examples

#### Store Management (Admin Only)

```typescript
// Create store - admin only
router.post(
  '/stores',
  authenticate,
  authorize({ roles: ['admin'] }),
  createStore
);

// Update store - admin only
router.patch(
  '/stores/:id',
  authenticate,
  authorize({ roles: ['admin'] }),
  updateStore
);

// Delete store - admin only
router.delete(
  '/stores/:id',
  authenticate,
  authorize({ roles: ['admin'] }),
  deleteStore
);

// Get stores - public (no auth required)
router.get('/stores', getAllStores);
```

#### User Management

```typescript
// Get all users - admin only
router.get(
  '/users',
  authenticate,
  authorize({ roles: ['admin'] }),
  getAllUsers
);

// Get user profile - admin or self
router.get(
  '/users/:userId',
  authenticate,
  authorize({
    roles: ['admin'],
    allowSelf: true,
    resourceOwnerParam: 'userId',
  }),
  getUserProfile
);

// Update own profile - any authenticated user
router.patch('/users/me', authenticate, updateOwnProfile);
```

#### Order Management

```typescript
// Get all orders - admin only
router.get(
  '/orders',
  authenticate,
  authorize({ roles: ['admin'] }),
  getAllOrders
);

// Get user's own orders - any authenticated user
router.get('/orders/me', authenticate, getMyOrders);

// Get specific order - admin or order owner
router.get(
  '/orders/:orderId',
  authenticate,
  authorize({
    roles: ['admin'],
    allowSelf: true,
    resourceOwnerParam: 'userId',
  }),
  getOrderById
);
```

## Authentication Middleware

The `authenticate` middleware validates JWT tokens and attaches user information to the request.

### Usage

```typescript
import { authenticate } from '../middlewares/auth.js';

router.get('/profile', authenticate, getProfile);
```

### Request Object Extensions

After successful authentication, the following properties are added to the request object:

```typescript
req.userId: string;        // User's ID
req.userEmail: string;     // User's email
req.userRole: 'user' | 'admin' | 'moderator';  // User's role
```

### Error Responses

#### 401 Unauthorized - No Token

```json
{
  "success": false,
  "error": "Access denied. No token provided or invalid format."
}
```

#### 401 Unauthorized - Invalid Token

```json
{
  "success": false,
  "error": "Invalid token"
}
```

#### 401 Unauthorized - Expired Token

```json
{
  "success": false,
  "error": "Token has expired"
}
```
