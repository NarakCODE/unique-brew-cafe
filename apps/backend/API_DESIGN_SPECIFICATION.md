# **API Design with Role-Based Access Control**

## **Architecture Approach**
- **Single set of endpoints** - No separate `/admin/` prefix
- **Role-based permissions** - Check user role in middleware/authorization layer
- **JWT token contains role** - Admin, User, Moderator, etc.
- **Cleaner codebase** - Shared logic, easier to maintain

---

## **1. Authentication**
```
POST   /auth/register
POST   /auth/verify-email
POST   /auth/resend-otp
POST   /auth/complete-profile
POST   /auth/login
POST   /auth/social/google
POST   /auth/social/apple
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/verify-reset-otp
POST   /auth/reset-password
```

---

## **2. Stores**
```
GET    /stores                    # Public: list all stores
GET    /stores/:storeId           # Public: store details
GET    /stores/:storeId/gallery   # Public: store images
GET    /stores/:storeId/hours     # Public: opening hours
GET    /stores/:storeId/location  # Public: location info

POST   /stores                    # Admin: create store
PATCH  /stores/:storeId           # Admin: update store
DELETE /stores/:storeId           # Admin: delete store
PATCH  /stores/:storeId/status    # Admin: activate/deactivate
```

---

## **3. Categories**
```
GET    /stores/:storeId/categories  # Public: list categories
GET    /categories/:categoryId      # Public: category details

POST   /categories                  # Admin: create category
PATCH  /categories/:categoryId      # Admin: update category
DELETE /categories/:categoryId      # Admin: delete category
PATCH  /categories/reorder           # Admin: reorder categories
```

---

## **4. Products**
```
GET    /stores/:storeId/products  # Public: list products
GET    /products/:productId       # Public: product details

POST   /products                  # Admin: create product
PATCH  /products/:productId       # Admin: update product
DELETE /products/:productId       # Admin: delete product
PATCH  /products/:productId/status # Admin: activate/deactivate
POST   /products/:productId/duplicate # Admin: duplicate product
```

---

## **5. Search**
```
GET    /search?q=&type=           # Public: search
GET    /search/suggestions?q=     # Public: auto-suggest
GET    /search/recent             # User: recent searches
DELETE /search/recent             # User: clear all recent
DELETE /search/recent/:searchId   # User: delete one search
```

---

## **6. Favorites**
```
GET    /favorites                 # User: list favorites
POST   /favorites/:productId      # User: add to favorites
DELETE /favorites/:productId      # User: remove from favorites
```

---

## **7. Cart**
```
GET    /cart                      # User: get cart
POST   /cart/items                # User: add item
PATCH  /cart/items/:itemId        # User: update quantity
DELETE /cart/items/:itemId        # User: remove item
DELETE /cart                      # User: clear cart
POST   /cart/validate             # User: validate cart
PATCH  /cart/address              # User: set delivery address
PATCH  /cart/notes                # User: add order notes
GET    /cart/summary              # User: cart summary
```

---

## **8. Checkout & Payment**
```
POST   /checkout/validate         # User: validate before checkout
POST   /checkout                  # User: create checkout session
GET    /checkout/:checkoutId      # User: get checkout details
GET    /checkout/payment-methods  # User: available payment methods
POST   /checkout/apply-coupon     # User: apply discount
DELETE /checkout/remove-coupon    # User: remove coupon
GET    /checkout/delivery-charges # User: calculate delivery
POST   /checkout/confirm          # User: confirm order

POST   /payments/:orderId/intent  # User: create payment intent
POST   /payments/:orderId/confirm # User: confirm payment
POST   /payments/mock/:orderId/complete # Dev: mock payment
```

---

## **9. Orders**
```
GET    /orders                    # User: my orders | Admin: all orders
GET    /orders/:orderId           # User: order details | Admin: any order
GET    /orders/:orderId/tracking  # User: track order
GET    /orders/:orderId/invoice   # User: download invoice | Admin: any invoice
GET    /orders/:orderId/receipt   # Admin: get receipt

POST   /orders/:orderId/cancel    # User: cancel order
POST   /orders/:orderId/rate      # User: rate order
POST   /orders/:orderId/reorder   # User: reorder items
POST   /orders/:orderId/notes     # Admin: add internal notes

PATCH  /orders/:orderId/status    # Admin: update order status
PATCH  /orders/:orderId/assign    # Admin: assign to driver
```

**Query Parameters for GET /orders:**
- For users: Returns their own orders only
- For admins: `?status=pending&store_id=123&user_id=456&date_from=&date_to=`

---

## **10. Users**
```
GET    /users/me                  # User: own profile
PATCH  /users/me                  # User: update profile
PATCH  /users/me/avatar           # User: update avatar
DELETE /users/me                  # User: delete account

GET    /users                     # Admin: list all users
GET    /users/:userId             # Admin: user details
GET    /users/:userId/orders      # Admin: user's order history
PATCH  /users/:userId/status      # Admin: activate/suspend user
```

---

## **11. Addresses**
```
GET    /users/me/addresses              # User: list addresses
POST   /users/me/addresses              # User: add address
PATCH  /users/me/addresses/:addressId   # User: update address
DELETE /users/me/addresses/:addressId   # User: delete address
PATCH  /users/me/addresses/:addressId/default # User: set default
```

---

## **12. Notifications**
```
POST   /notifications/devices/register  # User: register device token
DELETE /notifications/devices/:tokenId  # User: unregister device

GET    /notifications                   # User: my notifications
GET    /notifications/unread-count      # User: count unread
PATCH  /notifications/:id/read          # User: mark as read
PATCH  /notifications/read-all          # User: mark all read
DELETE /notifications/:id               # User: delete notification
DELETE /notifications                   # User: delete all

GET    /notifications/settings          # User: notification preferences
PATCH  /notifications/settings          # User: update preferences
GET    /notifications/test              # Dev: test notification

POST   /notifications/send              # Admin: send to specific user
POST   /notifications/broadcast         # Admin: send to all users
POST   /notifications/segment           # Admin: send to segment
GET    /notifications/stats             # Admin: notification statistics
GET    /notifications/history           # Admin: sent notifications log
```

---

## **13. Announcements**
```
GET    /announcements                   # Public: active announcements
GET    /announcements/:id               # Public: announcement details

POST   /announcements                   # Admin: create announcement
PATCH  /announcements/:id               # Admin: update announcement
DELETE /announcements/:id               # Admin: delete announcement
PATCH  /announcements/:id/publish       # Admin: publish/unpublish
```

---

## **14. Reports & Analytics**
```
GET    /reports/dashboard               # Admin: dashboard stats
GET    /reports/sales                   # Admin: sales report
GET    /reports/orders                  # Admin: orders report
GET    /reports/products                # Admin: products performance
GET    /reports/revenue                 # Admin: revenue analytics
GET    /reports/export                  # Admin: export data (CSV/Excel)
```

**Query Parameters:**
- `?date_from=2024-01-01&date_to=2024-12-31`
- `?store_id=123`
- `?format=csv|excel|pdf`

---

## **15. Support**
```
GET    /support/contact                 # Public: contact info
POST   /support/tickets                 # User: create ticket
GET    /support/tickets                 # User: my tickets | Admin: all tickets
GET    /support/tickets/:ticketId       # User/Admin: ticket details
PATCH  /support/tickets/:ticketId       # Admin: update ticket status
GET    /support/faq                     # Public: FAQ list
```

---

## **16. System Configuration**
```
GET    /config/app                      # Public: app config
GET    /config/delivery-zones           # Public: delivery zones
GET    /health                          # Public: health check

PATCH  /config/app                      # Admin: update app config
POST   /config/delivery-zones           # Admin: add delivery zone
PATCH  /config/delivery-zones/:zoneId   # Admin: update zone
DELETE /config/delivery-zones/:zoneId   # Admin: delete zone
```