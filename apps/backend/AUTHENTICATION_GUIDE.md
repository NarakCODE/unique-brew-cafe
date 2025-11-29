# Authentication Guide

Complete guide to authentication and authorization in the Corner Coffee API.

## Table of Contents

- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [JWT Tokens](#jwt-tokens)
- [Role-Based Access Control](#role-based-access-control)
- [Implementation Examples](#implementation-examples)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Corner Coffee API uses JWT (JSON Web Tokens) for authentication with a dual-token system:

- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for obtaining new access tokens

## Authentication Flow

### 1. User Registration

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │   API   │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  POST /auth/register                         │
     │  { email, password, fullName, phone }        │
     │─────────────────────────────────────────────>│
     │                                              │
     │                                              │ Create user
     │                                              │ Generate OTP
     │                                              │ Send email
     │                                              │
     │  201 Created                                 │
     │  { userId, message: "OTP sent" }             │
     │<─────────────────────────────────────────────│
     │                                              │
```

### 2. Email Verification

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │   API   │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  POST /auth/verify-email                     │
     │  { email, otp }                              │
     │─────────────────────────────────────────────>│
     │                                              │
     │                                              │ Validate OTP
     │                                              │ Mark email verified
     │                                              │
     │  200 OK                                      │
     │  { message: "Email verified" }               │
     │<─────────────────────────────────────────────│
     │                                              │
```

### 3. Login

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │   API   │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  POST /auth/login                            │
     │  { email, password }                         │
     │─────────────────────────────────────────────>│
     │                                              │
     │                                              │ Validate credentials
     │                                              │ Generate tokens
     │                                              │ Store refresh token
     │                                              │
     │  200 OK                                      │
     │  { accessToken, refreshToken, user }         │
     │<─────────────────────────────────────────────│
     │                                              │
     │  Store tokens securely                       │
     │                                              │
```

### 4. Making Authenticated Requests

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │   API   │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  GET /cart                                   │
     │  Authorization: Bearer <accessToken>         │
     │─────────────────────────────────────────────>│
     │                                              │
     │                                              │ Validate token
     │                                              │ Extract user info
     │                                              │ Process request
     │                                              │
     │  200 OK                                      │
     │  { success: true, data: {...} }              │
     │<─────────────────────────────────────────────│
     │                                              │
```

### 5. Token Refresh

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │   API   │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  POST /auth/refresh                          │
     │  { refreshToken }                            │
     │─────────────────────────────────────────────>│
     │                                              │
     │                                              │ Validate refresh token
     │                                              │ Generate new tokens
     │                                              │ Rotate refresh token
     │                                              │
     │  200 OK                                      │
     │  { accessToken, refreshToken }               │
     │<─────────────────────────────────────────────│
     │                                              │
     │  Update stored tokens                        │
     │                                              │
```

### 6. Logout

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │   API   │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  POST /auth/logout                           │
     │  { refreshToken }                            │
     │  Authorization: Bearer <accessToken>         │
     │─────────────────────────────────────────────>│
     │                                              │
     │                                              │ Invalidate refresh token
     │                                              │
     │  200 OK                                      │
     │  { message: "Logged out" }                   │
     │<─────────────────────────────────────────────│
     │                                              │
     │  Clear stored tokens                         │
     │                                              │
```

## JWT Tokens

### Access Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "user",
    "iat": 1642248000,
    "exp": 1642248900
  },
  "signature": "..."
}
```

### Token Lifetimes

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days
- **OTP**: 10 minutes

### Token Storage

**Web Applications:**

- Store access token in memory (JavaScript variable)
- Store refresh token in httpOnly cookie or secure storage
- Never store tokens in localStorage (XSS vulnerability)

**Mobile Applications:**

- Use secure storage (Keychain on iOS, Keystore on Android)
- Encrypt tokens before storage

## Role-Based Access Control

### Roles

| Role          | Description      | Permissions                       |
| ------------- | ---------------- | --------------------------------- |
| **user**      | Regular customer | Browse, order, manage own account |
| **admin**     | Administrator    | Full system access                |
| **moderator** | Limited admin    | Specific administrative tasks     |

### Permission Matrix

| Endpoint                 | Guest | User     | Admin    |
| ------------------------ | ----- | -------- | -------- |
| GET /stores              | ✅    | ✅       | ✅       |
| POST /stores             | ❌    | ❌       | ✅       |
| GET /cart                | ❌    | ✅       | ✅       |
| POST /cart/items         | ❌    | ✅       | ✅       |
| GET /orders              | ❌    | ✅ (own) | ✅ (all) |
| PATCH /orders/:id/status | ❌    | ❌       | ✅       |
| GET /reports/dashboard   | ❌    | ❌       | ✅       |

### Authorization Middleware

The API uses middleware to enforce role-based access:

```typescript
// Example: Admin-only endpoint
router.post(
  '/stores',
  authenticate, // Verify JWT token
  authorize(['admin']), // Check role
  createStore // Controller
);

// Example: User accessing own resource
router.get(
  '/users/:userId',
  authenticate,
  authorize({
    roles: ['admin'],
    allowSelf: true,
    resourceOwnerParam: 'userId',
  }),
  getUserDetails
);
```

## Implementation Examples

### JavaScript/TypeScript (Fetch API)

```typescript
class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private baseUrl = 'http://localhost:3000/api';

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.accessToken = data.data.accessToken;
    this.refreshToken = data.data.refreshToken;

    return data.data.user;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // If token expired, refresh and retry
    if (response.status === 401 && this.refreshToken) {
      await this.refreshAccessToken();

      headers['Authorization'] = `Bearer ${this.accessToken}`;
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });
    }

    return response.json();
  }

  async refreshAccessToken() {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      // Refresh token invalid, need to login again
      this.accessToken = null;
      this.refreshToken = null;
      throw new Error('Session expired');
    }

    const data = await response.json();
    this.accessToken = data.data.accessToken;
    this.refreshToken = data.data.refreshToken;
  }

  async logout() {
    await this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    this.accessToken = null;
    this.refreshToken = null;
  }
}

// Usage
const api = new ApiClient();

// Login
await api.login('user@example.com', 'password');

// Make authenticated request
const cart = await api.request('/cart');

// Logout
await api.logout();
```

### Python (Requests)

```python
import requests
from datetime import datetime, timedelta

class ApiClient:
    def __init__(self, base_url='http://localhost:3000/api'):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
        self.token_expiry = None

    def login(self, email, password):
        response = requests.post(
            f'{self.base_url}/auth/login',
            json={'email': email, 'password': password}
        )
        response.raise_for_status()

        data = response.json()['data']
        self.access_token = data['accessToken']
        self.refresh_token = data['refreshToken']
        self.token_expiry = datetime.now() + timedelta(minutes=15)

        return data['user']

    def request(self, endpoint, method='GET', **kwargs):
        # Check if token needs refresh
        if self.token_expiry and datetime.now() >= self.token_expiry:
            self.refresh_access_token()

        headers = kwargs.get('headers', {})
        if self.access_token:
            headers['Authorization'] = f'Bearer {self.access_token}'

        kwargs['headers'] = headers

        response = requests.request(
            method,
            f'{self.base_url}{endpoint}',
            **kwargs
        )

        # Handle token expiration
        if response.status_code == 401 and self.refresh_token:
            self.refresh_access_token()
            headers['Authorization'] = f'Bearer {self.access_token}'
            response = requests.request(
                method,
                f'{self.base_url}{endpoint}',
                **kwargs
            )

        return response.json()

    def refresh_access_token(self):
        response = requests.post(
            f'{self.base_url}/auth/refresh',
            json={'refreshToken': self.refresh_token}
        )
        response.raise_for_status()

        data = response.json()['data']
        self.access_token = data['accessToken']
        self.refresh_token = data['refreshToken']
        self.token_expiry = datetime.now() + timedelta(minutes=15)

# Usage
api = ApiClient()
api.login('user@example.com', 'password')
cart = api.request('/cart')
```

## Security Best Practices

### Token Security

1. **Never expose tokens in URLs**

   ```
   ❌ GET /api/cart?token=abc123
   ✅ GET /api/cart
      Authorization: Bearer abc123
   ```

2. **Use HTTPS in production**
   - All tokens transmitted over encrypted connections
   - Prevents man-in-the-middle attacks

3. **Implement token rotation**
   - Refresh tokens are rotated on each use
   - Old refresh tokens are invalidated

4. **Set appropriate token lifetimes**
   - Short access token lifetime (15 min)
   - Reasonable refresh token lifetime (7 days)

### Password Security

1. **Strong password requirements**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, special characters

2. **Password hashing**
   - Bcrypt with salt rounds >= 10
   - Never store plain text passwords

3. **Rate limiting**
   - Limit login attempts (5 per 15 minutes)
   - Prevent brute force attacks

### OTP Security

1. **Time-limited codes**
   - 10-minute expiration
   - Single use only

2. **Rate limiting**
   - Limit OTP generation requests
   - Limit verification attempts

## Troubleshooting

### Common Issues

#### 1. "Token expired" (AUTH_002)

**Cause**: Access token has expired (>15 minutes old)

**Solution**: Use refresh token to get new access token

```javascript
// Automatic token refresh
if (error.code === 'AUTH_002') {
  await refreshAccessToken();
  // Retry original request
}
```

#### 2. "Invalid credentials" (AUTH_001)

**Cause**: Wrong email or password

**Solution**: Verify credentials, check for typos

#### 3. "Email not verified" (AUTH_005)

**Cause**: User hasn't verified email with OTP

**Solution**: Complete email verification flow

#### 4. "Insufficient permissions" (AUTH_004)

**Cause**: User role doesn't have access to endpoint

**Solution**:

- Check user role in JWT payload
- Verify endpoint permissions
- Use admin account if needed

#### 5. "Token invalid" (AUTH_003)

**Cause**: Token signature invalid or tampered

**Solution**:

- Clear stored tokens
- Login again
- Check JWT_SECRET matches between environments

### Debugging Tips

1. **Decode JWT tokens**

   ```bash
   # Use jwt.io or command line
   echo "your.jwt.token" | cut -d'.' -f2 | base64 -d | jq
   ```

2. **Check token expiration**

   ```javascript
   const payload = JSON.parse(atob(token.split('.')[1]));
   const expiryDate = new Date(payload.exp * 1000);
   console.log('Token expires:', expiryDate);
   ```

3. **Verify Authorization header**

   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:3000/api/cart
   ```

4. **Check user role**
   ```javascript
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('User role:', payload.role);
   ```

## Support

For authentication issues, contact: support@cornercoffee.com
