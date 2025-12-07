# Unique Brew Cafe - Complete API Collection Index

## Overview

This is the master index for all Postman collections. The API has been split into 5 focused collections for better organization and performance.

## Quick Import Guide

### Import All Collections at Once

1. Open Postman
2. Click **Import**
3. Select all 5 JSON files from this directory:
   - `1_Authentication_User_Management.postman_collection.json`
   - `2_Stores_Products_Categories.postman_collection.json`
   - `3_Shopping_Orders.postman_collection.json`
   - `4_Notifications_Support.postman_collection.json`
   - `5_Admin_Config.postman_collection.json`
4. Click **Import**

## Collections Breakdown

### Collection 1: Authentication & User Management (40 endpoints)

- ✅ User Registration (OTP-based)
- ✅ Login/Logout
- ✅ Password Reset
- ✅ Token Management
- ✅ User Profile CRUD
- ✅ Address Management
- ✅ Admin User Management

**Start here** - All other collections require authentication

### Collection 2: Stores, Products & Categories (50 endpoints)

- ✅ Store Listings & Details
- ✅ Product Catalog
- ✅ Categories & Subcategories
- ✅ Add-ons Management
- ✅ Search & Filters

**Public + Admin** - Mix of public browsing and admin management

### Collection 3: Shopping & Orders (35 endpoints)

- ✅ Favorites/Wishlist
- ✅ Shopping Cart
- ✅ Checkout Process
- ✅ Payment Integration
- ✅ Order Management

**User Flow** - Complete shopping experience from browse to purchase

### Collection 4: Notifications & Support (25 endpoints)

- ✅ Push Notifications
- ✅ Announcements
- ✅ Support Tickets
- ✅ FAQs

**Engagement** - Customer communication and support

### Collection 5: Admin & Config (13 endpoints)

- ✅ Business Reports
- ✅ Analytics
- ✅ System Configuration
- ✅ Delivery Zones

**Admin Dashboard** - Business intelligence and settings

## Total Coverage

- **Total Endpoints**: 163+
- **Public Endpoints**: 32
- **Authenticated Endpoints**: 95
- **Admin-Only Endpoints**: 36

## Configuration

### Base URL

All collections use the variable: `{{baseUrl}}`

**Default**: `http://localhost:3000/api`

To change for all collections:

1. Create a Postman Environment
2. Add variable `baseUrl` with your server URL
3. Select the environment before running requests

### Authentication

Collections automatically handle authentication via:

- Collection-level Bearer Token auth
- Auto-save `accessToken` after login
- Auto-save `refreshToken` for token renewal

## Recommended Testing Order

### First-Time Setup

1. **Collection 1** → Register/Login
2. **Collection 2** → Browse stores and products
3. **Collection 3** → Test shopping flow
4. **Collection 4** → Test notifications
5. **Collection 5** → Test admin features (requires admin account)

### Daily Development

1. **Collection 1** → Login (get fresh token)
2. Test specific feature from other collections

## Admin Account Setup

To test admin endpoints, create an admin user:

```bash
cd apps/backend
npm run seed
```

Or manually create via MongoDB/Registration and update role to `admin`.

Default admin credentials (from `.env`):

- Email: `admin@example.com`
- Password: `Admin@123456`

## Environment Variables Shared Across Collections

Each collection manages its own variables, but they share common patterns:

| Variable       | Description            | Auto-populated             |
| -------------- | ---------------------- | -------------------------- |
| `baseUrl`      | API base URL           | ❌ Manual                  |
| `accessToken`  | JWT access token       | ✅ After login             |
| `refreshToken` | JWT refresh token      | ✅ After login             |
| `userId`       | Current user ID        | ✅ After login             |
| `productId`    | Product ID for testing | ⚠️ Context-dependent       |
| `orderId`      | Order ID for testing   | ✅ After checkout          |
| `storeId`      | Store ID for testing   | ⚠️ Context-dependent       |
| `checkoutId`   | Checkout session ID    | ✅ After creating checkout |

## Common Workflows

### 1. User Registration & First Order

```
Collection 1: Register - Initiate
Collection 1: Register - Verify OTP
Collection 2: Get All Stores
Collection 2: Get Store Menu
Collection 3: Add Item to Cart
Collection 1: Add Address
Collection 3: Create Checkout Session
Collection 3: Confirm Checkout
Collection 3: Mock Payment Complete
Collection 3: Get Order Tracking
```

### 2. Admin Product Management

```
Collection 1: Login (with admin account)
Collection 2: Create Product (Admin)
Collection 2: Update Product (Admin)
Collection 2: Update Product Status (Admin)
Collection 5: Get Product Performance
```

### 3. Customer Support Flow

```
Collection 1: Login
Collection 4: Get FAQs
Collection 4: Create Support Ticket
Collection 4: Add Message to Ticket
[Admin] Collection 4: Update Ticket Status
```

## Testing Best Practices

### 1. Use Collection Runner

For testing multiple endpoints sequentially:

1. Select collection
2. Click **Run**
3. Select requests to run
4. Review results

### 2. Create Test Scenarios

Use Postman's Collection Runner with:

- Data files (CSV/JSON)
- Iterative testing
- Automated assertions

### 3. Monitor API

Set up Postman Monitors to:

- Run collections periodically
- Check API health
- Validate functionality

### 4. Share with Team

Export and share:

- Collections
- Environments
- Documentation

## Troubleshooting

### Collections not showing variables

1. Click collection name
2. Go to **Variables** tab
3. Ensure **Current Value** column is populated

### Requests failing with 401

1. Check if `accessToken` is set
2. Run login request again
3. Check token expiry (24h default)

### Admin endpoints returning 403

1. Verify logged in as admin user
2. Check user role in login response
3. Seed database if no admin exists

### Request body validation errors

1. Check required fields in schema
2. Verify data types (string, number, boolean)
3. Review example requests in collection

## API Documentation Links

- **Full API Docs**: `../API_DOCUMENTATION.md`
- **Auth Guide**: `../AUTHENTICATION_GUIDE.md`
- **Database Models**: `../DATABASE_MODEL_DESIGN.md`
- **OpenAPI Spec**: `../openapi.yaml`

## Collection Maintenance

### Adding New Endpoints

1. Add to appropriate collection
2. Include request body example
3. Add test script to validate response
4. Update collection description
5. Update this index

### Versioning

Collections follow semantic versioning:

- Major: Breaking API changes
- Minor: New endpoints added
- Patch: Bug fixes, documentation

Current Version: **1.0.0**

## Support

For issues or questions:

1. Check `README.md` in this directory
2. Review API documentation
3. Check backend server logs
4. Create issue in repository

---

**Generated**: December 7, 2025
**Total Collections**: 5
**Total Endpoints**: 163+
**API Version**: 1.0.0
