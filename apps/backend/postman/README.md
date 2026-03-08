# Postman Collections for Unique Brew Cafe API

This directory contains comprehensive Postman collections for testing all API endpoints of the Unique Brew Cafe backend.

## 📚 Collections Overview

The API has been split into 6 logical collections for better organization:

### 1. Authentication & User Management

**File:** `1_Authentication_User_Management.postman_collection.json`

Covers:

- **Authentication**: Registration (with OTP), Login, Logout, Password Reset, Token Refresh
- **Profile**: Get/Update Profile, Upload Image, Change Password, Settings, Referrals
- **User Management (Admin)**: List Users, User Details, Update User Status
- **Addresses**: CRUD operations for user addresses

### 2. Stores, Products & Categories

**File:** `2_Stores_Products_Categories.postman_collection.json`

Covers:

- **Stores**: List Stores, Store Details, Pickup Times, Gallery, Hours, Location, Menu
- **Categories**: List Categories, Subcategories, Products by Category
- **Products**: Search, List, CRUD operations, Customizations, Add-ons
- **Add-ons**: List and manage add-ons
- **Search**: Global search, suggestions, search history

### 3. Shopping & Orders

**File:** `3_Shopping_Orders.postman_collection.json`

Covers:

- **Favorites**: Add/Remove/List favorite products
- **Cart**: Add items, Update quantity, Remove items, Validate, Set address/notes
- **Checkout**: Create session, Apply coupons, Calculate delivery, Confirm checkout
- **Payments**: Create payment intent, Confirm payment, Mock payment (dev)
- **Orders**: List orders, Order details, Tracking, Invoice, Cancel, Rate, Reorder

### 4. Notifications & Support

**File:** `4_Notifications_Support.postman_collection.json`

Covers:

- **Notifications**: Device registration, List, Mark as read, Settings, Admin operations
- **Announcements**: List, View, Track engagement, Admin CRUD
- **Support**: FAQs, Create tickets, Messages, Admin ticket management

### 5. Admin & Config

**File:** `5_Admin_Config.postman_collection.json`

Covers:

- **Reports**: Dashboard stats, Sales, Orders, Product performance, Revenue analytics
- **Configuration**: App config, Delivery zones, Health check

### 6. Demo Mobile Checkout & Admin Status

**File:** `6_Demo_Mobile_Checkout_Admin_Status.postman_collection.json`

Covers:

- **Direct mobile order creation** via `POST /orders`
- **Customer order tracking** for the new demo flow
- **Admin status changes** from `received` -> `confirmed` -> `ready`
- **Dedicated test guide** in `DEMO_CHECKOUT_STATUS_GUIDE.md`

## 🚀 Getting Started

### Prerequisites

- [Postman](https://www.postman.com/downloads/) installed
- Backend server running (default: `http://localhost:8081`)

### Import Collections

1. Open Postman
2. Click **Import** button
3. Select all JSON files from this directory
4. Click **Import**

### Collection Variables

Each collection has the following variables that you can customize:

- `baseUrl`: API base URL (default: `http://localhost:8081/api`)
- `accessToken`: JWT access token (auto-populated after login)
- `refreshToken`: JWT refresh token (auto-populated after login)
- Additional collection-specific IDs (userId, productId, orderId, etc.)

### Setting Variables

**Method 1: Edit Collection Variables**

1. Click on collection name
2. Go to **Variables** tab
3. Update the `Current Value` column
4. Save

**Method 2: Auto-populate via Scripts**
Many requests include test scripts that automatically save tokens and IDs to collection variables after successful responses.

## 📖 Usage Guide

### Basic Workflow

1. **Start with Authentication**
   - Import Collection 1
   - Run `Register - Initiate` to create an account
   - Check your email for OTP (or check console logs if email not configured)
   - Run `Register - Verify OTP` with the OTP code
   - Tokens will be automatically saved to collection variables

2. **Alternative: Login**
   - Run `Login` with existing credentials
   - Tokens auto-saved to variables

3. **Test Other Endpoints**
   - Import other collections as needed
   - Most endpoints use the `accessToken` from collection variables
   - Admin endpoints require admin role

### Testing Admin Endpoints

Admin endpoints require an admin user. To create one:

1. Use the seeder script:

   ```bash
   cd apps/backend
   npm run seed
   ```

2. Login with admin credentials:
   - Email: From `.env` (default: `admin@example.com`)
   - Password: From `.env` (default: `Admin@123456`)

### Example: Complete Order Flow

1. **Authentication** (Collection 1)
   - Login → Token saved

2. **Browse Products** (Collection 2)
   - Get All Stores
   - Get Store Menu
   - Get Product Details

3. **Add to Cart** (Collection 3)
   - Add Item to Cart
   - Update Cart Item Quantity
   - Get Cart Summary

4. **Checkout** (Collection 3)
   - Validate Checkout
   - Create Checkout Session → checkoutId saved
   - Apply Coupon (optional)
   - Confirm Checkout → orderId saved

5. **Payment** (Collection 3)
   - Create Payment Intent
   - Mock Payment Complete (dev only)

6. **Track Order** (Collection 3)
   - Get Order by ID
   - Get Order Tracking
   - Rate Order (after completion)

## 🔐 Authentication

Most endpoints require authentication. The collections use **Bearer Token** authentication.

### How It Works

1. After login/registration, `accessToken` is stored in collection variables
2. Requests automatically include: `Authorization: Bearer {{accessToken}}`
3. If token expires, use `Refresh Token` endpoint

### Manual Token Setup

If auto-populate doesn't work:

1. Copy the `accessToken` from login response
2. Go to Collection → Variables
3. Paste token in `accessToken` variable
4. Save

## 🧪 Testing Tips

### Environment Setup

Consider creating Postman Environments for different setups:

- **Development**: `http://localhost:8081/api`
- **Staging**: `https://staging.yourdomain.com/api`
- **Production**: `https://api.yourdomain.com/api`

### Pre-request Scripts

Some requests have pre-request scripts that:

- Generate random data
- Refresh tokens automatically
- Validate prerequisites

### Test Scripts

Many requests include test scripts that:

- Validate response structure
- Save important IDs to variables
- Assert expected status codes

### Debugging

1. Open Postman Console (View → Show Postman Console)
2. View detailed request/response data
3. Check test script logs

## 📝 Request Body Examples

### Register with OTP

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890"
}
```

### Add Item to Cart

```json
{
  "productId": "{{productId}}",
  "quantity": 2,
  "size": "Medium",
  "customizations": [
    {
      "name": "Sugar",
      "value": "2 spoons"
    }
  ],
  "addons": [
    {
      "addonId": "addon123",
      "quantity": 1
    }
  ],
  "notes": "Extra hot please"
}
```

### Create Store (Admin)

```json
{
  "name": "Downtown Coffee",
  "slug": "downtown-coffee",
  "description": "Best coffee in downtown",
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.006
    }
  },
  "contactInfo": {
    "phone": "+1234567890",
    "email": "downtown@coffee.com"
  },
  "isActive": true
}
```

## 🐛 Common Issues

### 401 Unauthorized

- Token expired → Use `Refresh Token` endpoint
- No token → Login first
- Invalid token → Login again

### 403 Forbidden

- Insufficient permissions
- Admin endpoints require admin role
- Check user role in auth response

### 404 Not Found

- Invalid ID in URL
- Resource doesn't exist
- Check collection variables

### 400 Bad Request

- Invalid request body
- Missing required fields
- Check request examples

## 📊 Collection Statistics

- **Total Collections**: 5
- **Total Requests**: 150+
- **Public Endpoints**: ~30
- **Authenticated Endpoints**: ~90
- **Admin-Only Endpoints**: ~30

## 🔄 Auto-Generated Features

These collections include:

✅ **Auto-save tokens** after login/register
✅ **Auto-save IDs** (userId, orderId, productId, etc.)
✅ **Pre-configured authentication** headers
✅ **Example request bodies** for all POST/PATCH endpoints
✅ **Test scripts** for validation
✅ **Organized folder structure**

## 📚 Additional Resources

- [API Documentation](../API_DOCUMENTATION.md)
- [Authentication Guide](../AUTHENTICATION_GUIDE.md)
- [Database Models](../DATABASE_MODEL_DESIGN.md)
- [Backend README](../README.md)

## 🤝 Contributing

When adding new endpoints:

1. Add to appropriate collection
2. Include example request body
3. Add test script to save important IDs
4. Update this README
5. Test the request

## 📄 License

Same as main project license.

---

**Last Updated**: December 7, 2025
**API Version**: 1.0.0
**Collections Version**: 1.0.0
