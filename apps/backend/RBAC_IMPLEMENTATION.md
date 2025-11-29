# RBAC Implementation Summary

This document summarizes the Role-Based Access Control (RBAC) infrastructure implementation for the API system.

## What Was Implemented

### 1. User Model Enhancement

- **File**: `src/models/User.ts`
- **Changes**:
  - Added `role` field with enum values: `'user' | 'admin' | 'moderator'`
  - Default role is `'user'`
  - Role is included in the User interface and schema

### 2. JWT Token Enhancement

- **File**: `src/utils/jwt.ts`
- **Changes**:
  - Updated `TokenPayload` interface to include `email` and `role`
  - Modified `generateAccessToken()` to accept and encode `userId`, `email`, and `role`
  - JWT tokens now contain user role information for authorization checks

### 3. Authentication Middleware Enhancement

- **File**: `src/middlewares/auth.ts`
- **Changes**:
  - Extended Express Request interface to include `userEmail` and `userRole`
  - Updated middleware to extract and attach role information from JWT token
  - Request object now has: `req.userId`, `req.userEmail`, `req.userRole`

### 4. Authorization Middleware (NEW)

- **File**: `src/middlewares/authorize.ts`
- **Features**:
  - Role-based access control middleware
  - Supports multiple roles per endpoint
  - Optional "allow self" access for resource owners
  - Flexible configuration options
  - Returns 403 Forbidden for unauthorized access

**Usage Example**:

```typescript
// Admin only
router.post(
  '/stores',
  authenticate,
  authorize({ roles: ['admin'] }),
  createStore
);

// Admin or self
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

### 5. Auth Service Updates

- **File**: `src/services/authService.ts`
- **Changes**:
  - Updated all token generation calls to include email and role
  - Modified `completeRegistration()`, `registerUser()`, `loginUser()`, and `refreshAccessToken()`
  - Tokens now properly include role information

### 6. Admin User Seeder (NEW)

- **File**: `src/seeders/adminSeeder.ts`
- **Features**:
  - Creates initial admin user account
  - Configurable via environment variables
  - Checks for existing admin to prevent duplicates
  - Updates existing users to admin role if needed
  - Email verified by default

**Usage**:

```bash
npm run seed:admin
```

**Configuration** (`.env`):

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
```

### 7. Documentation

- **File**: `src/middlewares/README.md` - Complete middleware usage guide
- **File**: `src/seeders/README.md` - Updated with admin seeder documentation
- **File**: `.env.example` - Added admin credentials configuration

### 8. Package.json

- Added `seed:admin` script for running the admin seeder

## User Roles

| Role        | Description           | Access Level                                          |
| ----------- | --------------------- | ----------------------------------------------------- |
| `user`      | Regular users         | Can browse, order, and manage their own account       |
| `admin`     | System administrators | Full access to all resources and management functions |
| `moderator` | Elevated users        | Between user and admin (for future use)               |

## JWT Token Structure

```typescript
{
  userId: string; // User's MongoDB ObjectId
  email: string; // User's email address
  role: 'user' | 'admin' | 'moderator'; // User's role
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}
```

## Request Object Extensions

After authentication, the Express Request object includes:

```typescript
interface Request {
  userId?: string;
  userEmail?: string;
  userRole?: 'user' | 'admin' | 'moderator';
}
```

## Authorization Patterns

### Pattern 1: Admin Only

```typescript
router.post(
  '/resource',
  authenticate,
  authorize({ roles: ['admin'] }),
  handler
);
```

### Pattern 2: Multiple Roles

```typescript
router.patch(
  '/resource',
  authenticate,
  authorize({ roles: ['admin', 'moderator'] }),
  handler
);
```

### Pattern 3: Admin or Self

```typescript
router.get(
  '/users/:userId',
  authenticate,
  authorize({
    roles: ['admin'],
    allowSelf: true,
    resourceOwnerParam: 'userId',
  }),
  handler
);
```

### Pattern 4: Any Authenticated User

```typescript
router.get('/resource', authenticate, handler);
// or
router.get('/resource', authenticate, authorize({ roles: [] }), handler);
```

### Pattern 5: Public (No Auth)

```typescript
router.get('/resource', handler);
```

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required to access this resource"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "You do not have permission to access this resource"
}
```

## Testing the Implementation

### 1. Create Admin User

```bash
npm run seed:admin
```

### 2. Login as Admin

```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "Admin@123456"
}
```

### 3. Decode the JWT Token

The returned access token will contain:

```json
{
  "userId": "...",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 4. Use Token for Protected Endpoints

```bash
GET /api/protected-resource
Authorization: Bearer <access_token>
```

## Next Steps

To apply RBAC to existing endpoints:

1. Import the authorize middleware:

   ```typescript
   import { authorize } from '../middlewares/authorize.js';
   ```

2. Add to routes that need protection:

   ```typescript
   router.post(
     '/stores',
     authenticate,
     authorize({ roles: ['admin'] }),
     createStore
   );
   ```

3. Update controllers to use role information if needed:
   ```typescript
   const userRole = req.userRole;
   if (userRole === 'admin') {
     // Admin-specific logic
   }
   ```

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- **30.1**: JWT token validation and user identity extraction
- **30.2**: User identity extraction from JWT token
- **30.3**: Role verification for authorization
- **30.6**: Role information included in JWT token payload
- **30.7**: Single set of endpoints without role-based prefixes
- **30.8**: Authorization checks before controller logic execution

## Security Considerations

1. **Token Security**: JWT tokens are signed and verified
2. **Role Validation**: Roles are validated against enum values
3. **Default Role**: New users default to 'user' role
4. **Admin Creation**: Admin users must be created via seeder or manual database update
5. **Password Security**: Admin password should be changed after first login
6. **Token Expiration**: Access tokens expire after 24 hours (configurable)
7. **Refresh Tokens**: Refresh tokens are tracked and can be revoked
