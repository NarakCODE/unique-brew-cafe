# API Testing Guide

Quick guide to test the Corner Coffee API endpoints.

## Method 1: Swagger UI (Interactive Documentation) ⭐ Recommended

### Access Swagger UI

1. **Start your server:**

   ```bash
   npm run dev
   ```

2. **Open Swagger UI in your browser:**

   ```
   http://localhost:3000/api-docs
   ```

3. **You'll see an interactive API documentation where you can:**
   - Browse all endpoints
   - See request/response schemas
   - Test endpoints directly in the browser
   - Authenticate and make real API calls

### Using Swagger UI

1. **Authenticate:**
   - Click the **"Authorize"** button (top right)
   - Enter your JWT token: `Bearer <your_token>`
   - Click **"Authorize"** then **"Close"**

2. **Test an endpoint:**
   - Find the endpoint you want to test
   - Click to expand it
   - Click **"Try it out"**
   - Fill in the parameters
   - Click **"Execute"**
   - See the response below

### Getting a Token for Testing

```bash
# 1. Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User",
    "phoneNumber": "+1234567890"
  }'

# 2. Verify email (check your email for OTP or use admin seeder)
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'

# 3. Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Copy the accessToken from the response
```

---

## Method 2: Postman (Full-Featured Testing)

### Setup

1. **Open Postman**

2. **Import the collection:**
   - Click **Import** button
   - Select `Corner_Coffee_Complete_API.postman_collection.json`
   - Click **Import**

3. **Configure environment:**
   - Click the collection
   - Go to **Variables** tab
   - Set `baseUrl` to `http://localhost:3000/api`

### Testing Flow

1. **Login:**
   - Open **Authentication** → **Login**
   - Update email/password in the body
   - Click **Send**
   - Token is automatically saved to collection variables

2. **Test authenticated endpoints:**
   - All requests will automatically use the saved token
   - Just click **Send** on any endpoint

3. **Test admin endpoints:**
   - Login with admin credentials
   - Test admin-only endpoints

---

## Method 3: cURL (Command Line)

### Basic Request

```bash
# Get all stores
curl http://localhost:3000/api/stores
```

### Authenticated Request

```bash
# Get user's cart (requires authentication)
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### POST Request

```bash
# Add item to cart
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 2
  }'
```

---

## Method 4: VS Code REST Client Extension

### Setup

1. Install **REST Client** extension in VS Code
2. Create a file `api-tests.http`

### Example File

```http
### Variables
@baseUrl = http://localhost:3000/api
@token = your_access_token_here

### Register User
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "fullName": "Test User",
  "phoneNumber": "+1234567890"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}

### Get Stores
GET {{baseUrl}}/stores

### Get Cart (Authenticated)
GET {{baseUrl}}/cart
Authorization: Bearer {{token}}

### Add to Cart
POST {{baseUrl}}/cart/items
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

Click **"Send Request"** above each request to execute it.

---

## Quick Test Scenarios

### Scenario 1: Browse Products (No Auth)

```bash
# 1. Get all stores
curl http://localhost:3000/api/stores

# 2. Get store details
curl http://localhost:3000/api/stores/{storeId}

# 3. Get categories
curl http://localhost:3000/api/categories?storeId={storeId}

# 4. Get products
curl http://localhost:3000/api/products?storeId={storeId}
```

### Scenario 2: User Registration & Login

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Test123!","fullName":"Test User","phoneNumber":"+1234567890"}'

# 2. Verify email (use OTP from email)
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","otp":"123456"}'

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Test123!"}'
```

### Scenario 3: Shopping Flow (Requires Auth)

```bash
# Set your token
TOKEN="your_access_token_here"

# 1. Add item to cart
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","quantity":2}'

# 2. View cart
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer $TOKEN"

# 3. Validate cart
curl -X POST http://localhost:3000/api/cart/validate \
  -H "Authorization: Bearer $TOKEN"

# 4. Create checkout session
curl -X POST http://localhost:3000/api/checkout \
  -H "Authorization: Bearer $TOKEN"

# 5. Confirm checkout
curl -X POST http://localhost:3000/api/checkout/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"checkoutId":"CHECKOUT_ID"}'
```

### Scenario 4: Admin Operations (Requires Admin Role)

```bash
# Login as admin first
TOKEN="admin_access_token_here"

# 1. Create store
curl -X POST http://localhost:3000/api/stores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Store","address":"123 Main St","city":"New York","phone":"+1234567890"}'

# 2. Get all users
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"

# 3. View dashboard stats
curl http://localhost:3000/api/reports/dashboard \
  -H "Authorization: Bearer $TOKEN"

# 4. Update order status
curl -X PATCH http://localhost:3000/api/orders/{orderId}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"preparing"}'
```

---

## Testing with Seeded Data

### Seed the Database

```bash
# Seed everything
npm run seed:all

# Or seed individually
npm run seed:admin      # Creates admin user
npm run seed:categories # Creates categories
npm run seed:products   # Creates products
npm run seed:config     # Creates app config
```

### Default Admin Credentials

After running `npm run seed:admin`:

```
Email: admin@cornercoffee.com
Password: Admin123!
Role: admin
```

Use these credentials to test admin endpoints.

---

## Health Check

Always start by checking if the API is running:

```bash
curl http://localhost:3000/api/config/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 12345,
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Common Issues

### 1. "Cannot GET /api-docs"

**Solution:** Make sure the server is running and openapi.yaml exists in the root directory.

### 2. "401 Unauthorized"

**Solution:**

- Check if you're including the Authorization header
- Verify token hasn't expired (15 min lifetime)
- Use refresh token to get new access token

### 3. "403 Forbidden"

**Solution:**

- Check if your user has the required role
- Admin endpoints require admin role
- Use admin credentials from seeder

### 4. "404 Not Found"

**Solution:**

- Verify the endpoint URL is correct
- Check if the resource exists (e.g., valid productId)
- Ensure database is seeded with test data

---

## Best Practices

1. **Use Swagger UI for exploration** - Great for discovering endpoints
2. **Use Postman for complex workflows** - Better for multi-step testing
3. **Use cURL for automation** - Good for scripts and CI/CD
4. **Seed data before testing** - Run `npm run seed:all` first
5. **Check health endpoint** - Verify API is running before testing
6. **Save tokens** - Store access tokens for reuse during testing session

---

## Next Steps

- Read [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed endpoint reference
- Read [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for auth implementation
- Check [README.md](README.md) for setup and configuration

## Support

For testing issues, contact: support@cornercoffee.com
