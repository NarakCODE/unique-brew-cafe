# Payment API Quick Reference

## Endpoints

| Method | Endpoint                               | Auth | Description             |
| ------ | -------------------------------------- | ---- | ----------------------- |
| POST   | `/api/payments/:orderId/intent`        | ✓    | Create payment intent   |
| POST   | `/api/payments/:orderId/confirm`       | ✓    | Confirm payment         |
| POST   | `/api/payments/mock/:orderId/complete` | ✓    | Mock payment (dev only) |

## Quick Examples

### Create Payment Intent

```bash
curl -X POST http://localhost:3000/api/payments/{orderId}/intent \
  -H "Authorization: Bearer {token}"
```

### Confirm Payment

```bash
curl -X POST http://localhost:3000/api/payments/{orderId}/confirm \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "aba",
    "providerTransactionId": "ABA-TXN-1234567890"
  }'
```

### Mock Payment (Development)

```bash
curl -X POST http://localhost:3000/api/payments/mock/{orderId}/complete \
  -H "Authorization: Bearer {token}"
```

## Payment Methods

- `aba` - ABA Bank
- `acleda` - ACLEDA Bank
- `wing` - Wing Money
- `cash` - Cash on Delivery

## Status Values

### Payment Status

- `pending` → `processing` → `completed`
- `pending` → `processing` → `failed`

### Order Status

- `pending_payment` → `confirmed` (on payment success)
- `pending_payment` (remains on payment failure)

## Response Codes

| Code | Meaning                      |
| ---- | ---------------------------- |
| 200  | Success                      |
| 400  | Bad Request / Payment Failed |
| 401  | Unauthorized                 |
| 403  | Forbidden                    |
| 404  | Not Found                    |
| 500  | Server Error                 |

## Complete Flow (Where to Get Order ID)

### 1. Add Items to Cart

```bash
POST /api/cart/items
```

### 2. Create Checkout Session

```bash
POST /api/checkout
# Returns: { "data": { "id": "checkoutSessionId", ... } }
```

### 3. Confirm Checkout (GET ORDER ID HERE!)

```bash
POST /api/checkout/{checkoutSessionId}/confirm
Body: { "paymentMethod": "aba" }

# Response includes ORDER ID:
{
  "success": true,
  "data": {
    "id": "673a1234567890abcdef1234",  ← THIS IS YOUR ORDER ID!
    "orderNumber": "ORD-L8K9M2N-X7Y3",
    "status": "pending_payment",
    "paymentStatus": "pending",
    "total": 25.50,
    ...
  }
}
```

### 4. Use Order ID for Payment

```bash
# Development/Testing:
POST /api/payments/mock/{orderId}/complete

# Production:
POST /api/payments/{orderId}/intent
POST /api/payments/{orderId}/confirm
```

## Testing Flow

1. **Add items to cart** → `POST /api/cart/items`
2. **Create checkout** → `POST /api/checkout` → Save `checkoutSessionId`
3. **Confirm checkout** → `POST /api/checkout/{checkoutSessionId}/confirm` → **Save `orderId` from response**
4. **Mock payment** → `POST /api/payments/mock/{orderId}/complete`
5. **Verify** → Order status changed to `confirmed`

## Production Flow

1. **Add items to cart** → `POST /api/cart/items`
2. **Create checkout** → `POST /api/checkout` → Save `checkoutSessionId`
3. **Confirm checkout** → `POST /api/checkout/{checkoutSessionId}/confirm` → **Save `orderId` from response**
4. **Create payment intent** → `POST /api/payments/{orderId}/intent`
5. **User completes payment** on provider platform
6. **Confirm payment** → `POST /api/payments/{orderId}/confirm`
7. **Verify** → Order status changed to `confirmed`
