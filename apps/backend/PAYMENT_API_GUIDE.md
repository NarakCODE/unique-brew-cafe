# Payment API Guide

This guide explains how to use the Payment API endpoints for processing payments in the Corner Coffee application.

## Overview

The Payment API provides three main endpoints:

1. **Create Payment Intent** - Prepares payment with provider
2. **Confirm Payment** - Processes and verifies payment
3. **Mock Payment Complete** - Development-only endpoint for testing

## Postman Collections

Two Postman collections are available:

1. **Corner_Coffee_API.postman_collection.json** - Complete API collection including payment endpoints
2. **Payment_API.postman_collection.json** - Standalone payment endpoints collection

### Importing Collections

1. Open Postman
2. Click "Import" button
3. Select the collection JSON file
4. The collection will be imported with all endpoints and examples

## Environment Variables

Set these variables in your Postman environment:

| Variable      | Description              | Example                                   |
| ------------- | ------------------------ | ----------------------------------------- |
| `baseUrl`     | API base URL             | `http://localhost:3000`                   |
| `accessToken` | JWT authentication token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `orderId`     | Order ID for payment     | `673a1234567890abcdef1234`                |

## Payment Flow

### Standard Payment Flow

```
1. User completes checkout → Order created with status 'pending_payment'
2. Create Payment Intent → Prepares payment with provider
3. User completes payment on provider'satform
4. Confirm Payment → Verifies and completes payment
5. Order status updated to 'confirmed'
```

### Development/Testing Flow

```
1. User completes checkout → Order created with status 'pending_payment'
2. Mock Payment Complete → Instantly marks payment as complete
3. Order status updated to 'confirmed'
```

## API Endpoints

### 1. Create Payment Intent

**Endpoint:** `POST /api/payments/:orderId/intent`

**Description:** Creates a payment intent with the payment provider. This prepares the payment and returns provider-specific details needed to complete the transaction.

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `orderId` (string, required) - The order ID to create payment intent for

**Request Example:**

```bash
POST /api/payments/673a1234567890abcdef1234/intent
Authorization: Bearer <your-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "673a9876543210fedcba9876",
    "orderId": "673a1234567890abcdef1234",
    "amount": 25.5,
    "currency": "USD",
    "paymentMethod": "aba",
    "status": "pending",
    "providerIntentId": "ABA-INTENT-L8K9M2N-X7Y3Z1",
    "createdAt": "2024-11-17T10:30:00.000Z"
  },
  "message": "Payment intent created successfully"
}
```

**Error Responses:**

- `400` - Order payment status is not 'pending'
- `403` - Unauthorized access to order (not your order)
- `404` - Order not found

**Requirements:**

- Order must exist
- Order must belong to authenticated user
- Order payment status must be 'pending'

---

### 2. Confirm Payment

**Endpoint:** `POST /api/payments/:orderId/confirm`

**Description:** Confirms and processes payment for an order. Verifies payment with the provider and updates order status accordingly.

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `orderId` (string, required) - The order ID to confirm payment for

**Request Body:**

```json
{
  "paymentMethod": "aba",
  "providerTransactionId": "ABA-TXN-1234567890"
}
```

**Body Parameters:**

- `paymentMethod` (string, required) - Payment method used: `aba`, `acleda`, `wing`, or `cash`
- `providerTransactionId` (string, optional) - Transaction ID from payment provider

**Request Example:**

```bash
POST /api/payments/673a1234567890abcdef1234/confirm
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "paymentMethod": "aba",
  "providerTransactionId": "ABA-TXN-1234567890"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "673a1234567890abcdef1234",
    "orderNumber": "ORD-L8K9M2N-X7Y3",
    "status": "confirmed",
    "paymentStatus": "completed",
    "total": 25.5
  },
  "transactionId": "ABA-TXN-1234567890",
  "message": "Payment completed successfully"
}
```

**Failed Payment Response (400):**

```json
{
  "success": false,
  "data": {
    "id": "673a1234567890abcdef1234",
    "orderNumber": "ORD-L8K9M2N-X7Y3",
    "status": "pending_payment",
    "paymentStatus": "failed",
    "total": 25.5
  },
  "message": "Payment verification failed"
}
```

**Error Responses:**

- `400` - Payment already completed or verification failed
- `404` - Order not found

**Payment Success Flow:**

1. Verifies payment with provider
2. Updates order `paymentStatus` to `completed`
3. Updates order `status` to `confirmed`
4. Stores provider transaction ID
5. Returns success response

**Payment Failure Flow:**

1. Payment verification fails
2. Updates order `paymentStatus` to `failed`
3. Order `status` remains `pending_payment`
4. Returns error response with details

---

### 3. Mock Payment Complete (Development Only)

**Endpoint:** `POST /api/payments/mock/:orderId/complete`

**Description:** Instantly completes payment for an order without actual payment processing. This endpoint is ONLY available in non-production environments (when `NODE_ENV` is not `production`).

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `orderId` (string, required) - The order ID to complete mock payment for

**Request Example:**

```bash
POST /api/payments/mock/673a1234567890abcdef1234/complete
Authorization: Bearer <your-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Mock payment completed successfully"
}
```

**Production Environment Error (403):**

```json
{
  "success": false,
  "error": "Mock payment endpoint is not available in production"
}
```

**Error Responses:**

- `400` - Payment already completed
- `403` - Endpoint not available in production
- `404` - Order not found

**Use Cases:**

- Testing order flows without payment provider integration
- Development environment testing
- Automated testing scenarios
- Demo and presentation purposes

**Behavior:**

1. Checks `NODE_ENV` (rejects if production)
2. Finds order by ID
3. Generates mock transaction ID (format: `MOCK-{timestamp}-{random}`)
4. Updates `paymentStatus` to `completed`
5. Updates order `status` to `confirmed`
6. Stores mock transaction ID

---

## Payment Methods

The API supports the following payment methods:

| Method           | ID       | Type          | Description                 |
| ---------------- | -------- | ------------- | --------------------------- |
| ABA Bank         | `aba`    | Bank Transfer | ABA Bank payment gateway    |
| ACLEDA Bank      | `acleda` | Bank Transfer | ACLEDA Bank payment gateway |
| Wing Money       | `wing`   | Mobile Wallet | Wing mobile wallet          |
| Cash on Delivery | `cash`   | Cash          | Pay with cash on delivery   |

## Order Status Flow

### Payment Status Values

- `pending` - Payment not yet initiated
- `processing` - Payment intent created, awaiting completion
- `completed` - Payment successfully processed
- `failed` - Payment verification failed
- `refunded` - Payment refunded

### Order Status Values

- `pending_payment` - Order created, awaiting payment
- `confirmed` - Payment completed, order confirmed
- `preparing` - Store is preparing the order
- `ready` - Order ready for pickup
- `picked_up` - Customer picked up order
- `completed` - Order completed
- `cancelled` - Order cancelled

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Status Code | Description                                            |
| ----------- | ------------------------------------------------------ |
| 400         | Bad Request - Invalid input or business rule violation |
| 401         | Unauthorized - Missing or invalid authentication token |
| 403         | Forbidden - Insufficient permissions or access denied  |
| 404         | Not Found - Resource doesn't exist                     |
| 500         | Internal Server Error - Server-side error              |

## Testing Workflow

### Using Mock Payment (Development)

1. **Create an order** through checkout

   ```bash
   POST /api/checkout/{checkoutId}/confirm
   ```

   Save the returned `orderId`

2. **Complete mock payment**

   ```bash
   POST /api/payments/mock/{orderId}/complete
   ```

3. **Verify order status**
   ```bash
   GET /api/orders/{orderId}
   ```
   Check that `paymentStatus` is `completed` and `status` is `confirmed`

### Using Real Payment Flow (Production)

1. **Create an order** through checkout

   ```bash
   POST /api/checkout/{checkoutId}/confirm
   ```

   Save the returned `orderId`

2. **Create payment intent**

   ```bash
   POST /api/payments/{orderId}/intent
   ```

   Save the `providerIntentId` for payment provider integration

3. **User completes payment** on provider's platform
   (This happens outside your API)

4. **Confirm payment**

   ```bash
   POST /api/payments/{orderId}/confirm
   Body: {
     "paymentMethod": "aba",
     "providerTransactionId": "ABA-TXN-1234567890"
   }
   ```

5. **Verify order status**
   ```bash
   GET /api/orders/{orderId}
   ```

## Security Considerations

1. **Authentication Required**: All payment endpoints require valid JWT token
2. **User Authorization**: Users can only process payments for their own orders
3. **Idempotency**: Payment confirmation checks if payment already completed
4. **Environment Protection**: Mock endpoint disabled in production
5. **Transaction Tracking**: All payments tracked with provider transaction IDs

## Integration Notes

### Payment Provider Integration

The current implementation includes hooks for payment provider integration:

```typescript
// In production, implement these methods:
-generateProviderIntentId() - // Call actual provider API
  verifyPaymentWithProvider(); // Verify with provider API
```

**Supported Providers:**

- ABA Bank API
- ACLEDA Bank API
- Wing Money API

### Webhook Integration (Future)

For production, implement webhook handlers to receive payment notifications:

```
POST /api/webhooks/payment/aba
POST /api/webhooks/payment/acleda
POST /api/webhooks/payment/wing
```

## Troubleshooting

### Payment Intent Creation Fails

**Problem:** Getting 400 error when creating payment intent

**Solutions:**

- Verify order exists and belongs to authenticated user
- Check order payment status is 'pending'
- Ensure order hasn't been cancelled

### Payment Confirmation Fails

**Problem:** Payment confirmation returns failed status

**Solutions:**

- Verify provider transaction ID is correct
- Check payment was actually completed on provider's side
- Review payment provider logs
- Ensure payment amount matches order total

### Mock Payment Not Working

**Problem:** Mock payment endpoint returns 403

**Solutions:**

- Check `NODE_ENV` is not set to 'production'
- Verify environment variables are loaded correctly
- Restart server after changing `NODE_ENV`

## Support

For issues or questions:

- Check API logs for detailed error messages
- Review order status and payment status in database
- Contact payment provider support for provider-specific issues
- Review this guide for proper endpoint usage

## Changelog

### Version 1.0.0 (2024-11-17)

- Initial payment API implementation
- Payment intent creation
- Payment confirmation with provider verification
- Mock payment endpoint for development
- Support for ABA, ACLEDA, Wing, and Cash payment methods
