# Demo Checkout and Admin Status Test Guide

This guide tests the direct mobile checkout flow implemented in the backend:

- customer creates an order with `POST /api/orders`
- admin updates the order status
- customer reads the updated status from the API

This guide is built around:

- [6_Demo_Mobile_Checkout_Admin_Status.postman_collection.json](/Users/narak/Documents/rupp/unique-brew-cafe/apps/backend/postman/6_Demo_Mobile_Checkout_Admin_Status.postman_collection.json)

## 1. Prerequisites

- Backend running at `http://localhost:8081`
- MongoDB running
- At least one active store
- At least one available product that belongs to that store
- One customer account
- One admin account

If you need seed data:

```bash
cd apps/backend
npm run seed
```

Default seeded admin credentials are typically:

- email: `admin@example.com`
- password: `Admin@123456`

## 2. Import the collection

1. Open Postman
2. Click `Import`
3. Select:
   - `apps/backend/postman/6_Demo_Mobile_Checkout_Admin_Status.postman_collection.json`
4. Import the collection

## 3. Set collection variables

Open the collection, then go to `Variables`.

Set these values:

- `baseUrl` = `http://localhost:8081/api`
- `customerEmail` = your test customer email
- `customerPassword` = your test customer password
- `adminEmail` = your admin email
- `adminPassword` = your admin password
- `storeId` = an active store ID
- `productId` = an available product ID from that store

These will be populated automatically after requests run:

- `accessToken`
- `adminAccessToken`
- `orderId`

## 4. How to find `storeId` and `productId`

Use the existing Postman collections already in this folder:

1. From `2_Stores_Products_Categories.postman_collection.json`
   - run `Get All Stores`
   - copy one active store ID into `storeId`
2. From the same collection
   - run a product listing request or store menu request
   - copy one available product ID from that store into `productId`

Important:

- the selected product must belong to the selected store
- the product must be available
- the store must be active

The backend now validates those relationships during direct order creation.

## 5. Run the demo flow

Run these requests in order.

### Step 1. Customer Login

Request:

- `Setup / Customer Login`

Expected result:

- `200 OK`
- `accessToken` saved automatically

### Step 2. Admin Login

Request:

- `Setup / Admin Login`

Expected result:

- `200 OK`
- `adminAccessToken` saved automatically

### Step 3. Customer creates order

Request:

- `Customer Flow / Create Mobile Order`

Expected result:

- `201 Created`
- order returned in `received` status
- `orderId` saved automatically

Expected response shape:

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "ORDER_OBJECT_ID",
    "status": "received"
  }
}
```

### Step 4. Customer checks order detail

Request:

- `Customer Flow / Get Order Detail`

Expected result:

- `200 OK`
- order is visible to the customer who created it

### Step 5. Customer checks tracking

Request:

- `Customer Flow / Get Order Tracking`

Expected result:

- `200 OK`
- status should be `received`
- status history should contain the initial creation event

### Step 6. Admin lists received orders

Request:

- `Admin Flow / Admin List Received Orders`

Expected result:

- `200 OK`
- the order should appear in the list when filtered by `received`

Important implementation detail:

- this backend uses `GET /api/orders?status=received` for admin listing
- there is no separate `/api/admin/orders` route for this flow

### Step 7. Admin confirms the order

Request:

- `Admin Flow / Admin Update Status to Confirmed`

Expected result:

- `200 OK`
- returned order status becomes `confirmed`

### Step 8. Customer checks tracking again

Request:

- `Admin Flow / Customer Tracking After Confirmed`

Expected result:

- `200 OK`
- status should now be `confirmed`

### Step 9. Admin marks order ready

Request:

- `Admin Flow / Admin Update Status to Ready`

Expected result:

- `200 OK`
- returned order status becomes `ready`

### Step 10. Customer checks final tracking state

Request:

- `Admin Flow / Customer Tracking After Ready`

Expected result:

- `200 OK`
- status should be `ready`
- status history should contain at least:
  - `received`
  - `confirmed`
  - `ready`

## 6. Supported status transitions in this demo

For the path implemented here, the relevant transitions are:

- `received -> confirmed`
- `confirmed -> ready`

If you try to skip a step, the backend should reject it as an invalid status transition.

Example invalid move:

- `received -> ready`

## 7. Common failure cases

### `401 Unauthorized`

Cause:

- login was not run first
- token variable was not saved
- wrong token is being used for admin endpoints

Fix:

- rerun both login requests
- confirm `accessToken` and `adminAccessToken` are populated

### `403 Forbidden`

Cause:

- a non-admin token is being used on `PATCH /orders/:orderId/status`

Fix:

- make sure the admin requests use `adminAccessToken`

### `400 Bad Request` on create order

Common causes:

- `storeId` is missing or invalid
- `productId` is missing or invalid
- product does not belong to the selected store
- product is unavailable
- request body shape does not match schema

Fix:

- choose a valid active store and a valid product from that store

### `400 Bad Request` on status update

Cause:

- invalid transition order

Fix:

- follow `received -> confirmed -> ready`

### `404 Not Found`

Cause:

- `orderId` was not saved or is invalid

Fix:

- rerun `Create Mobile Order`

## 8. Recommended manual verification

After running the full collection, verify:

- the order exists in the admin dashboard
- customer can only read their own order
- admin can move the order through the expected states
- customer tracking reflects the change immediately after each admin action
- status history is appended, not overwritten

## 9. What this collection does not test

This collection is intentionally focused. It does not test:

- cart-based checkout session flow
- payment intent flow
- invoice/receipt downloads
- cancellation or rating
- push notifications

Use the other Postman collections in this directory for those paths.
