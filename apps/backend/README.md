# Corner Coffee API

A comprehensive backend API for a coffee shop ordering system with role-based access control (RBAC).

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)

## Features

- 🔐 **JWT-based Authentication** with access and refresh tokens
- 👥 **Role-Based Access Control** (User, Admin, Moderator)
- 📧 **Email Verification** with OTP
- 🏪 **Multi-Store Support** with location-based features
- 🛒 **Shopping Cart** with customizations and add-ons
- 💳 **Payment Processing** integration
- 📦 **Order Management** with status tracking
- 🔔 **Push Notifications** via Firebase Cloud Messaging
- 📊 **Analytics & Reporting** for admins
- 🎫 **Support Ticket System**
- ⭐ **Favorites & Search History**

## Technology Stack

- **Runtime**: Node.js 22+ with ES Modules
- **Language**: TypeScript 5.9+ (strict mode)
- **Framework**: Express 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Email**: Brevo (formerly Sendinblue)
- **Security**: Helmet, CORS, Rate Limiting
- **PDF Generation**: PDFKit

## Getting Started

### Prerequisites

- Node.js 22 or higher
- MongoDB 6.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - MongoDB connection string
   - JWT secrets
   - Brevo API key
   - Other service credentials

4. **Seed the database** (optional)

   ```bash
   npm run seed:all
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api`

## Authentication

### Authentication Flow

1. **Registration**
   - User registers with email and password
   - System sends OTP to email
   - User verifies email with OTP
   - Account is activated

2. **Login**
   - User logs in with email and password
   - System returns access token (15 min) and refresh token (7 days)
   - Access token is used for authenticated requests

3. **Token Refresh**
   - When access token expires, use refresh token to get new access token
   - Refresh tokens are rotated on each use

4. **Logout**
   - Invalidate refresh token

### Using Authentication

Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your_access_token>
```

### Example: Login Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

Response:

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
      "role": "user"
    }
  }
}
```

## API Documentation

### Documentation Files

- **OpenAPI Specification**: `openapi.yaml` - Complete API specification in OpenAPI 3.0 format
- **Postman Collection**: `Corner_Coffee_Complete_API.postman_collection.json` - Import into Postman for testing

### API Endpoints Overview

#### Authentication (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP

#### Users (`/users`)

- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile
- `PATCH /users/me/avatar` - Upload avatar
- `DELETE /users/me` - Delete account
- `GET /users` - Get all users (Admin)
- `GET /users/:userId` - Get user by ID (Admin)
- `PATCH /users/:userId/status` - Update user status (Admin)

#### Stores (`/stores`)

- `GET /stores` - List all stores
- `GET /stores/:storeId` - Get store details
- `GET /stores/:storeId/gallery` - Get store images
- `GET /stores/:storeId/hours` - Get opening hours
- `GET /stores/:storeId/location` - Get location
- `POST /stores` - Create store (Admin)
- `PATCH /stores/:storeId` - Update store (Admin)
- `DELETE /stores/:storeId` - Delete store (Admin)

#### Categories (`/categories`)

- `GET /categories` - List categories
- `GET /categories/:categoryId` - Get category details
- `POST /categories` - Create category (Admin)
- `PATCH /categories/:categoryId` - Update category (Admin)
- `PATCH /categories/reorder` - Reorder categories (Admin)
- `DELETE /categories/:categoryId` - Delete category (Admin)

#### Products (`/products`)

- `GET /products` - List products
- `GET /products/:productId` - Get product details
- `POST /products` - Create product (Admin)
- `PATCH /products/:productId` - Update product (Admin)
- `PATCH /products/:productId/status` - Update status (Admin)
- `POST /products/:productId/duplicate` - Duplicate product (Admin)
- `DELETE /products/:productId` - Delete product (Admin)

#### Search (`/search`)

- `GET /search` - Search stores and products
- `GET /search/suggestions` - Get autocomplete suggestions
- `GET /search/recent` - Get recent searches
- `DELETE /search/recent` - Clear search history
- `DELETE /search/recent/:searchId` - Delete specific search

#### Favorites (`/favorites`)

- `GET /favorites` - Get user's favorites
- `POST /favorites/:productId` - Add to favorites
- `DELETE /favorites/:productId` - Remove from favorites

#### Cart (`/cart`)

- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PATCH /cart/items/:itemId` - Update item quantity
- `DELETE /cart/items/:itemId` - Remove item
- `DELETE /cart` - Clear cart
- `POST /cart/validate` - Validate cart
- `PATCH /cart/aSet delivery address
- `PATCH /cart/notes` - Add order notes
- `GET /cart/summary` - Get cart summary

#### Checkout (`/checkout`)

- `POST /checkout/validate` - Validate checkout
- `POST /checkout` - Create checkout session
- `GET /checkout/:checkoutId` - Get checkout details
- `GET /checkout/payment-methods` - Get payment methods
- `POST /checkout/apply-coupon` - Apply promo code
- `DELETE /checkout/remove-coupon` - Remove promo code
- `GET /checkout/delivery-charges` - Calculate delivery fee
- `POST /checkout/confirm` - Confirm checkout

#### Payments (`/payments`)

- `POST /payments/:orderId/intent` - Create payment intent
- `POST /payments/:orderId/confirm` - Confirm payment
- `POST /payments/mock/:orderId/complete` - Mock payment (Dev only)

#### Orders (`/orders`)

- `GET /orders` - Get user's orders
- `GET /orders/:orderId` - Get order details
- `GET /orders/:orderId/tracking` - Track order
- `GET /orders/:orderId/invoice` - Download invoice
- `POST /orders/:orderId/cancel` - Cancel order
- `POST /orders/:orderId/rate` - Rate order
- `POST /orders/:orderId/reorder` - Reorder
- `POST /orders/:orderId/notes` - Add notes (Admin)
- `PATCH /orders/:orderId/status` - Update status (Admin)
- `PATCH /orders/:orderId/assign` - Assign driver (Admin)

#### Addresses (`/users/me/addresses`)

- `GET /users/me/addresses` - Get addresses
- `POST /users/me/addresses` - Add address
- `PATCH /users/me/addresses/:addressId` - Update address
- `DELETE /users/me/addresses/:addressId` - Delete address
- `PATCH /users/me/addresses/:addressId/default` - Set default

#### Notifications (`/notifications`)

- `POST /notifications/devices/register` - Register device
- `DELETE /notifications/devices/:tokenId` - Unregister device
- `GET /notifications` - Get notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `DELETE /notifications` - Delete all
- `GET /notifications/settings` - Get settings
- `PATCH /notifications/settings` - Update settings
- `POST /notifications/send` - Send notification (Admin)
- `POST /notifications/broadcast` - Broadcast (Admin)

#### Announcements (`/announcements`)

- `GET /announcements` - Get active announcements
- `GET /announcements/:id` - Get announcement details
- `POST /announcements` - Create announcement (Admin)
- `PATCH /announcements/:id` - Update announcement (Admin)
- `PATCH /announcements/:id/publish` - Toggle publish (Admin)
- `DELETE /announcements/:id` - Delete announcement (Admin)

#### Reports (`/reports`) - Admin Only

- `GET /reports/dashboard` - Dashboard statistics
- `GET /reports/sales` - Sales report
- `GET /reports/orders` - Orders report
- `GET /reports/products` - Product performance
- `GET /reports/revenue` - Revenue analytics
- `GET /reports/export` - Export report

#### Support (`/support`)

- `GET /support/contact` - Get contact info
- `POST /support/tickets` - Create ticket
- `GET /support/tickets` - Get tickets
- `GET /support/tickets/:ticketId` - Get ticket details
- `PATCH /support/tickets/:ticketId` - Update ticket (Admin)
- `GET /support/faq` - Get FAQs

#### Configuration (`/config`)

- `GET /config/app` - Get app configuration
- `GET /config/delivery-zones` - Get delivery zones
- `GET /config/health` - Health check
- `PATCH /config/app` - Update config (Admin)
- `POST /config/delivery-zones` - Add zone (Admin)
- `PATCH /config/delivery-zones/:zoneId` - Update zone (Admin)
- `DELETE /config/delivery-zones/:zoneId` - Delete zone (Admin)

### Response Format

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `AUTH_003` - Token invalid
- `AUTH_004` - Insufficient permissions
- `VAL_001` - Validation error
- `RES_001` - Resource not found
- `RES_002` - Resource already exists
- `BUS_001` - Business rule violation
- `PAY_001` - Payment failed
- `SYS_001` - Internal server error

## Project Structure

```
src/
├── config/              # Configuration files
│   ├── database.ts      # MongoDB connection
│   ├── env.ts           # Environment variables
│   ├── brevo.ts         # Email service config
│   └── multer.ts        # File upload config
├── controllers/         # Request handlers (thin layer)
├── middlewares/         # Express middlewares
│   ├── auth.ts          # JWT authentication
│   ├── authorize.ts     # Role-based authorization
│   ├── errorHandler.ts  # Global error handling
│   └── validateRequest.ts
├── models/              # Mongoose schemas
├── routes/              # API route definitions
├── services/            # Business logic layer
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── seeders/             # Database seeding scripts
└── index.ts             # Application entry point
```

## Scripts

### Development

```bash
npm run dev              # Start dev server with hot reload
npm run type-check       # Type check without emitting files
```

### Building

```bash
npm run build            # Compile TypeScript to JavaScript
npm start                # Run compiled code from dist/
```

### Code Quality

```bash
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting errors
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without changes
```

### Database Seeding

```bash
npm run seed:admin       # Create admin user
npm run seed:categories  # Seed product categories
npm run seed:products    # Seed sample products
npm run seed:promos      # Seed promo codes
npm run seed:faqs        # Seed FAQs
npm run seed:config      # Seed app configuration
npm run seed:zones       # Seed delivery zones
npm run seed:all         # Run all seeders
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/corner-coffee

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Brevo)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@cornercoffee.com

# CORS
CORS_ORIGIN=http://localhost:3000

# Payment Providers (Optional)
ABA_API_KEY=
ACLEDA_API_KEY=
WING_API_KEY=

# Firebase Cloud Messaging (Optional)
FCM_SERVER_KEY=
```

## License

ISC
