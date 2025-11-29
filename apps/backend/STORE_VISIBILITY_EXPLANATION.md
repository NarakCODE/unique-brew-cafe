# Store Visibility Explanation

## The Issue

After creating a store, calling `GET /api/stores` returns no stores. This is **expected behavior** based on the requirements.

## Why This Happens

### Requirement 5.1 States:

> "WHEN an admin creates a store with required fields, THE API_System SHALL persist the store with **inactive status by default**"

### Current Behavior:

1. **Create Store** (`POST /api/stores`) - Creates store with `isActive: false`
2. **Get All Stores** (`GET /api/stores`) - Only returns stores where `isActive: true`

This is a **security and business feature**, not a bug. Newly created stores should not be visible to public users until an admin reviews and activates them.

## Solution

We've added a new admin-only endpoint to view ALL stores (including inactive ones):

### New Endpoint: Get All Stores (Admin)

- **URL**: `GET /api/stores/admin/all`
- **Authentication**: Required (Bearer token)
- **Authorization**: Admin role only
- **Returns**: All stores regardless of active status
- **Sorted by**: Most recently created first

## Workflow for Store Management

### 1. Create a Store (Admin)

```http
POST /api/stores
Authorization: Bearer {admin_token}

{
  "name": "Corner Coffee Downtown",
  "slug": "corner-coffee-downtown",
  ...
}
```

**Result**: Store created with `isActive: false`

### 2. View All Stores Including Inactive (Admin)

```http
GET /api/stores/admin/all
Authorization: Bearer {admin_token}
```

**Result**: See all stores including the newly created one

### 3. Activate the Store (Admin)

```http
PATCH /api/stores/{storeId}/status
Authorization: Bearer {admin_token}
```

**Result**: Store status toggled to `isActive: true`

### 4. Public Users Can Now See the Store

```http
GET /api/stores
```

**Result**: Store now appears in public listing

## Endpoints Summary

### Public Endpoints (No Auth Required)

- `GET /api/stores` - Returns only **active** stores
- `GET /api/stores/:id` - Returns store if **active**
- `GET /api/stores/slug/:slug` - Returns store if **active**

### Admin Endpoints (Auth + Admin Role Required)

- `GET /api/stores/admin/all` - Returns **all** stores (active + inactive)
- `POST /api/stores` - Create store (inactive by default)
- `PUT /api/stores/:id` - Update store
- `PATCH /api/stores/:id/status` - Toggle active/inactive
- `DELETE /api/stores/:id` - Delete store

## Testing Steps

1. **Login as admin** to get access token
2. **Create a store** using `POST /api/stores`
3. **View all stores (admin)** using `GET /api/stores/admin/all` - You'll see your store
4. **View public stores** using `GET /api/stores` - Your store won't appear yet
5. **Activate the store** using `PATCH /api/stores/{id}/status`
6. **View public stores again** - Now your store appears!

## Benefits of This Approach

1. **Quality Control**: Admins can review stores before making them public
2. **Gradual Rollout**: Stores can be prepared in advance and activated when ready
3. **Safety**: Prevents incomplete or test stores from appearing to customers
4. **Compliance**: Meets requirement 5.1 exactly as specified

## Postman Collection

The updated Postman collection includes:

- **Get All Stores - Admin (Including Inactive)** - New endpoint to view all stores
- Proper authorization headers
- Clear descriptions explaining the difference

## Quick Reference

| Endpoint                       | Auth  | Returns            | Use Case            |
| ------------------------------ | ----- | ------------------ | ------------------- |
| `GET /api/stores`              | No    | Active stores only | Public browsing     |
| `GET /api/stores/admin/all`    | Admin | All stores         | Admin management    |
| `PATCH /api/stores/:id/status` | Admin | Toggle status      | Activate/deactivate |
