# API Documentation

Complete API reference for Corner Coffee ordering system.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.cornercoffee.com/api
```

## Authentication

Most endpoints require authentication. Include JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## Role-Based Access Control

- **Guest**: Unauthenticated users (browse stores, products)
- **User**: Authenticated customers (place orders, manage account)
- **Admin**: Full system access (manage all resources)
- **Moderator**: Limited administrative access

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Error Codes

| Code     | Description               |
| -------- | ------------------------- |
| AUTH_001 | Invalid credentials       |
| AUTH_002 | Token expired             |
| AUTH_003 | Token invalid             |
| AUTH_004 | Insufficient permissions  |
| AUTH_005 | Email not verified        |
| VAL_001  | Validation error          |
| RES_001  | Resource not found        |
| RES_002  | Resource already exists   |
| BUS_001  | Business rule violation   |
| BUS_002  | Invalid state transition  |
| PAY_001  | Payment failed            |
| PAY_002  | Payment already processed |
| SYS_001  | Internal server error     |

---

## Authentication Endpoints

### Register User

Create a new user account and send OTP for email verification.

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "message": "OTP sent to email"
  }
}
```

**Errors:**

- `400` - Validation error
- `409` - Email already exists

---

### Verify Email

Verify email address with OTP code.

**Endpoint:** `POST /auth/verify-email`

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

**Errors:**

- `400` - Invalid or expired OTP
- `404` - User not found

---

### Login

Authenticate user and receive JWT tokens.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user",
      "emailVerified": true
    }
  }
}
```

**Errors:**

- `401` - Invalid credentials
- `403` - Email not verified

---

### Refresh Token

Get new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Access:** Public

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**

- `401` - Invalid refresh token

---

## Store Endpoints

### List Stores

Get all active stores.

**Endpoint:** `GET /stores`

**Access:** Public

**Query Parameters:**

- `city` (optional) - Filter by city
- `isActive` (optional) - Filter by active status

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Corner Coffee Downtown",
      "slug": "corner-coffee-downtown",
      "address": "123 Main St",
      "city": "New York",
      "phone": "+1234567890",
      "latitude": 40.7128,
      "longitude": -74.006,
      "isOpen": true,
      "isActive": true,
      "rating": 4.5,
      "totalReviews": 120
    }
  ]
}
```

---

### Get Store Details

Get detailed information about a specific store.

**Endpoint:** `GET /stores/:storeId`

**Access:** Public

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Corner Coffee Downtown",
    "description": "Your favorite coffee spot",
    "address": "123 Main St",
    "city": "New York",
    "phone": "+1234567890",
    "email": "downtown@cornercoffee.com",
    "latitude": 40.7128,
    "longitude": -74.006,
    "images": ["url1", "url2"],
    "openingHours": {
      "monday": { "open": "07:00", "close": "20:00" },
      "tuesday": { "open": "07:00", "close": "20:00" }
    },
    "isOpen": true,
    "isActive": true,
    "rating": 4.5,
    "totalReviews": 120
  }
}
```

**Errors:**

- `404` - Store not found

---

### Create Store (Admin)

Create a new store.

**Endpoint:** `POST /stores`

**Access:** Admin only

**Request Body:**

```json
{
  "name": "Corner Coffee Uptown",
  "address": "456 Park Ave",
  "city": "New York",
  "phone": "+1234567890",
  "email": "uptown@cornercoffee.com",
  "latitude": 40.7829,
  "longitude": -73.9654
}
```

**Response:** `201 Created`

**Errors:**

- `403` - Insufficient permissions
- `400` - Validation error

---

## Cart Endpoints

### Get Cart

Get user's active shopping cart.

**Endpoint:** `GET /cart`

**Access:** User

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "storeId": "507f1f77bcf86cd799439013",
    "items": [
      {
        "id": "507f1f77bcf86cd799439014",
        "productId": "507f1f77bcf86cd799439015",
        "productName": "Cappuccino",
        "quantity": 2,
        "customization": {
          "size": "large",
          "sugarLevel": "medium"
        },
        "addOns": ["507f1f77bcf86cd799439016"],
        "unitPrice": 4.5,
        "totalPrice": 9.0
      }
    ],
    "subtotal": 9.0,
    "discount": 0,
    "tax": 0.72,
    "total": 9.72,
    "status": "active"
  }
}
```

---

### Add Item to Cart

Add a product to the shopping cart.

**Endpoint:** `POST /cart/items`

**Access:** User

**Request Body:**

```json
{
  "productId": "507f1f77bcf86cd799439015",
  "quantity": 2,
  "customization": {
    "size": "large",
    "sugarLevel": "medium"
  },
  "addOns": ["507f1f77bcf86cd799439016"]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    // Updated cart object
  }
}
```

**Errors:**

- `400` - Product not available
- `400` - Different store items in cart

---

### Update Cart Item

Update quantity of a cart item.

**Endpoint:** `PATCH /cart/items/:itemId`

**Access:** User

**Request Body:**

```json
{
  "quantity": 3
}
```

**Response:** `200 OK`

**Errors:**

- `404` - Item not found
- `400` - Insufficient stock

---

### Remove Cart Item

Remove an item from the cart.

**Endpoint:** `DELETE /cart/items/:itemId`

**Access:** User

**Response:** `200 OK`

---

### Clear Cart

Remove all items from the cart.

**Endpoint:** `DELETE /cart`

**Access:** User

**Response:** `200 OK`

---

## Order Endpoints

### List Orders

Get user's orders (or all orders for admin).

**Endpoint:** `GET /orders`

**Access:** User (own orders), Admin (all orders)

**Query Parameters:**

- `status` (optional) - Filter by order status
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `storeId` (optional, admin) - Filter by store
- `userId` (optional, admin) - Filter by user

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-2024-001",
      "userId": "507f1f77bcf86cd799439012",
      "storeId": "507f1f77bcf86cd799439013",
      "status": "confirmed",
      "paymentStatus": "completed",
      "paymentMethod": "credit_card",
      "subtotal": 15.0,
      "discount": 2.0,
      "tax": 1.04,
      "deliveryFee": 3.0,
      "total": 17.04,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get Order Details

Get detailed information about a specific order.

**Endpoint:** `GET /orders/:orderId`

**Access:** User (own order), Admin (any order)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-2024-001",
    "status": "confirmed",
    "paymentStatus": "completed",
    "items": [
      {
        "productName": "Cappuccino",
        "quantity": 2,
        "unitPrice": 4.5,
        "totalPrice": 9.0
      }
    ],
    "subtotal": 15.0,
    "discount": 2.0,
    "tax": 1.04,
    "deliveryFee": 3.0,
    "total": 17.04,
    "deliveryAddress": {
      "addressLine1": "123 Main St",
      "city": "New York"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**

- `404` - Order not found
- `403` - Not authorized to view this order

---

### Cancel Order

Cancel an order within 5 minutes of placement.

**Endpoint:** `POST /orders/:orderId/cancel`

**Access:** User (own order)

**Request Body:**

```json
{
  "reason": "Changed my mind"
}
```

**Response:** `200 OK`

**Errors:**

- `400` - Cancellation window expired (>5 minutes)
- `400` - Order cannot be cancelled in current status

---

### Track Order

Get order tracking information.

**Endpoint:** `GET /orders/:orderId/tracking`

**Access:** User (own order)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-2024-001",
    "status": "preparing",
    "estimatedReadyTime": "2024-01-15T11:00:00Z",
    "statusHistory": [
      {
        "status": "confirmed",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "status": "preparing",
        "timestamp": "2024-01-15T10:35:00Z"
      }
    ]
  }
}
```

---

## Notification Endpoints

### Register Device

Register device for push notifications.

**Endpoint:** `POST /notifications/devices/register`

**Access:** User

**Request Body:**

```json
{
  "fcmToken": "device-fcm-token",
  "deviceType": "ios",
  "deviceModel": "iPhone 13",
  "osVersion": "15.0",
  "appVersion": "1.0.0"
}
```

**Response:** `201 Created`

---

### Get Notifications

Get user's notifications.

**Endpoint:** `GET /notifications`

**Access:** User

**Query Parameters:**

- `type` (optional) - Filter by notification type
- `isRead` (optional) - Filter by read status
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "type": "order_status",
      "title": "Order Confirmed",
      "message": "Your order #ORD-2024-001 has been confirmed",
      "priority": "high",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get Unread Count

Get count of unread notifications.

**Endpoint:** `GET /notifications/unread-count`

**Access:** User

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### Mark as Read

Mark a notification as read.

**Endpoint:** `PATCH /notifications/:id/read`

**Access:** User

**Response:** `200 OK`

---

## Admin Endpoints

### Update Order Status (Admin)

Update order status and notify customer.

**Endpoint:** `PATCH /orders/:orderId/status`

**Access:** Admin

**Request Body:**

```json
{
  "status": "preparing"
}
```

**Valid Status Transitions:**

- `pending_payment` → `confirmed`
- `confirmed` → `preparing`
- `preparing` → `ready`
- `ready` → `picked_up`
- `picked_up` → `completed`
- Any status → `cancelled`

**Response:** `200 OK`

**Errors:**

- `400` - Invalid status transition

---

### Get Dashboard Stats (Admin)

Get dashboard statistics.

**Endpoint:** `GET /reports/dashboard`

**Access:** Admin

**Query Parameters:**

- `startDate` (optional) - Start date for metrics
- `endDate` (optional) - End date for metrics

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalOrders": 1250,
    "totalRevenue": 45678.9,
    "activeUsers": 890,
    "averageOrderValue": 36.54,
    "topProducts": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "name": "Cappuccino",
        "orderCount": 450
      }
    ],
    "ordersByStatus": {
      "confirmed": 45,
      "preparing": 23,
      "ready": 12,
      "completed": 1170
    }
  }
}
```

---

## Health Check

### System Health

Check system health and status.

**Endpoint:** `GET /config/health`

**Access:** Public

**Response:** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Global**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Payment**: 10 requests per hour per user

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": {
    "code": "SYS_001",
    "message": "Too many requests, please try again later"
  }
}
```

---

## Pagination

List endpoints support pagination with the following query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Paginated responses include metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Testing with Postman

1. Import the Postman collection: `Corner_Coffee_Complete_API.postman_collection.json`
2. Set the `baseUrl` variable to your API URL
3. Login to get access token (automatically saved to collection variables)
4. Use the saved token for authenticated requests

---

## Support

For API support, contact: support@cornercoffee.com
