# Implementation Plan

This implementation plan breaks down the RBAC API system into discrete, actionable coding tasks. Each task builds incrementally on previous work, with all code integrated into the system.

## Task List

- [x] 1. Implement authorization middleware and RBAC infrastructure
  - Create authorize middleware that checks user roles from JWT tokens
  - Add role field to User model schema with enum values (user, admin, moderator)
  - Update JWT token generation to include role in payload
  - Create admin user seeder script for initial admin account
  - Update existing auth middleware to extract and attach role to request
  - _Requirements: 30.1, 30.2, 30.3, 30.6, 30.7, 30.8_

- [x] 2. Enhance store management with gallery, hours, and location endpoints
  - Add gallery images array field to Store model
  - Add openingHours and specialHours JSON fields to Store model
  - Implement GET /stores/:storeId/gallery endpoint in storeController
  - Implement GET /stores/:storeId/hours endpoint in storeController
  - Implement GET /stores/:storeId/location endpoint in storeController
  - Add corresponding service methods in storeService
  - Apply authorize middleware to admin-only store endpoints (POST, PATCH, DELETE)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Implement category reordering functionality
  - Create PATCH /categories/reorder endpoint in categoryController
  - Implement reorderCategories method in categoryService
  - Add bulk update logic to modify displayOrder for multiple categories
  - Apply authorize middleware for admin-only access
  - _Requirements: 7.4_

-

- [x] 4. Implement product duplication and status management
  - Create PATCH /products/:productId/status endpoint in productController
  - Create POST /products/:productId/duplicate endpoint in productController
  - Implement updateProductStatus method in productService
  - Implement duplicateProduct method in productService that copies attributes and appends "Copy" to name
  - Apply authorize middleware for admin-only access
  - _Requirements: 9.4, 9.5_

- [x] 5. Implement search functionality with history tracking
  - Create SearchHistory model with userId, query, searchType, resultsCount fields
  - Create searchController with search, suggestions, recent searches endpoints
  - Create searchService with search logic using MongoDB text indexes
  - Implement GET /search endpoint with query and type parameters
  - Implement GET /search/suggestions endpoint with autocomplete logic (200ms response time)
  - Implement GET /search/recent endpoint for authenticated users
  - Implement DELETE /search/recent and DELETE /search/recent/:searchId endpoints
  - Add text indexes to Store and Product models for name and description fields
  - Implement search result ranking by relevance score
  - Create searchRoutes and integrate into main routes
  - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 11.4_

- [x] 6. Implement favorites feature
  - Create Favorite model with userId and productId fields
  - Add compound unique index on (userId, productId)
  - Create favoriteController with list, add, remove endpoints
  - Create favoriteService with business logic
  - Implement GET /favorites endpoint returning products with current price and availability
  - Implement POST /favorites/:productId endpoint with duplicate handling
  - Implement DELETE /favorites/:productId endpoint
  - Create favoriteRoutes with authentication middleware
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 7. Implement cart management system
  - Create Cart model with userId, storeId, totals, status fields
  - Create CartItem model with cartId, productId, quantity, customization, addOns fields
  - Add compound unique index on (userId, status) for Cart model
  - Create cartController with all cart operation endpoints
  - Create cartService with cart business logic
  - Implement GET /cart endpoint returning cart with items and totals
  - Implement POST /cart/items endpoint with store validation
  - Implement PATCH /cart/items/:itemId endpoint with stock validation
  - Implement DELETE /cart/items/:itemId and DELETE /cart endpoints
  - Implement POST /cart/validate endpoint checking availability and prices
  - Implement PATCH /cart/address and PATCH /cart/notes endpoints
  - Implement GET /cart/summary endpoint with itemized totals
  - Add calculateTotals private method for subtotal, tax, delivery fee calculation
  - Create cartRoutes with authentication middleware
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9_

- [x] 8. Implement checkout flow
  - Create PromoCode model with code, discount details, usage limits, validity dates
  - Create PromoCodeUsage model tracking promo code redemptions
  - Create checkoutController with validation, session, payment methods, coupon endpoints
  - Create checkoutService with checkout business logic
  - Implement POST /checkout/validate endpoint verifying cart, address, availability
  - Implement POST /checkout endpoint creating session with 15-minute expiration
  - Implement GET /checkout/:checkoutId endpoint returning session details
  - Implement GET /checkout/payment-methods endpoint
  - Implement POST /checkout/apply-coupon endpoint with validation and discount calculation
  - Implement DELETE /checkout/remove-coupon endpoint recalculating totals
  - Implement GET /checkout/delivery-charges endpoint calculating fee by distance
  - Implement POST /checkout/confirm endpoint creating Order with pending payment status
  - Add session expiration validation rejecting expired sessions
  - Create checkoutRoutes with authentication middleware
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9_

- [x] 9. Implement payment processing
  - Create paymentController with intent, confirm, mock payment endpoints
  - Create paymentService with payment provider integration
  - Implement POST /payments/:orderId/intent endpoint generating payment intent
  - Implement POST /payments/:orderId/confirm endpoint processing payment and updating order status
  - Add error handling for failed payments maintaining pending status
  - Implement POST /payments/mock/:orderId/complete endpoint for development (conditional on NODE_ENV)
  - Create paymentRoutes with authentication middleware
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 10. Implement order management for users
  - Create Order model with orderNumber, userId, storeId, status, payment details, totals
  - Create OrderItem model with orderId, productId, snapshots, customization, pricing
  - Create OrderStatusHistory model tracking status changes
  - Add indexes on orderNumber (unique), userId, storeId, status, createdAt
  - Create orderController with user-facing order endpoints
  - Create orderService with order business logic
  - Implement GET /orders endpoint returning user's orders or all orders for admin
  - Implement GET /orders/:orderId endpoint with ownership validation
  - Implement GET /orders/:orderId/tracking endpoint returning status and estimated delivery
  - Implement GET /orders/:orderId/invoice endpoint generating PDF invoice
  - Implement POST /orders/:orderId/cancel endpoint with 5-minute time limit validation
  - Implement POST /orders/:orderId/rate endpoint storing rating and review
  - Implement POST /orders/:orderId/reorder endpoint adding items to cart
  - Add order status transition validation
  - Create orderRoutes with authentication middleware
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8_

- [x] 11. Implement admin order management features
  - Implement GET /orders with admin filters (status, storeId, userId, date range)
  - Implement GET /orders/:orderId/receipt endpoint for admin generating receipt
  - Implement POST /orders/:orderId/notes endpoint for admin internal notes
  - Implement PATCH /orders/:orderId/status endpoint for admin with notification trigger
  - Implement PATCH /orders/:orderId/assign endpoint for admin assigning driver
  - Apply authorize middleware for admin-only endpoints
  - Add role-based query filtering in orderService
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

- [x] 12. Implement user profile and account management
  - Add avatar upload functionality to userController
  - Implement PATCH /users/me/avatar endpoint with file upload handling
  - Implement DELETE /users/me endpoint with account anonymization logic
  - Add email and phone format validation in userService
  - Update existing profile endpoints to use validation
  - _Requirements: 18.3, 18.4, 18.5_

- [x] 13. Implement admin user management features
  - Implement GET /users endpoint for admin with pagination
  - Implement GET /users/:userId endpoint for admin
  - Implement GET /users/:userId/orders endpoint for admin
  - Implement PATCH /users/:userId/status endpoint toggling active/suspended
  - Add authentication rejection for suspended users in auth middleware
  - Apply authorize middleware for admin-only endpoints
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [x] 14. Implement address management
  - Create Address model with userId, address fields, isDefault flag
  - Add postal code format validation
  - Create addressController with CRUD endpoints
  - Create addressService with address business logic
  - Implement GET /users/me/addresses endpoint
  - Implement POST /users/me/addresses endpoint with validation
  - Implement PATCH /users/me/addresses/:addressId endpoint
  - Implement DELETE /users/me/addresses/:addressId endpoint
  - Implement PATCH /users/me/addresses/:addressId/default endpoint unmarking other defaults
  - Create addressRoutes with authentication middleware
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

- [x] 15. Implement notification system
  - Create Notification model with userId, type, title, message, action, priority, isRead
  - Create DeviceToken model with userId, fcmToken, device details
  - Add compound index on (userId, isRead, createdAt) for Notification model
  - Create notificationController with user notification endpoints
  - Create notificationService with FCM integration
  - Implement POST /notifications/devices/register endpoint storing device token
  - Implement DELETE /notifications/devices/:tokenId endpoint
  - Implement GET /notifications endpoint with filtering
  - Implement GET /notifications/unread-count endpoint
  - Implement PATCH /notifications/:id/read and PATCH /notifications/read-all endpoints
  - Implement DELETE /notifications/:id and DELETE /notifications endpoints
  - Implement GET /notifications/settings and PATCH /notifications/settings endpoints
  - Create notificationRoutes with authentication middleware
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 21.10_

- [ ] 16. Implement admin notification features
  - Implement POST /notifications/send endpoint for specific user
  - Implement POST /notifications/broadcast endpoint for all users
  - Implement POST /notifications/segment endpoint with user criteria filtering
  - Implement GET /notifications/stats endpoint with delivery and engagement metrics
  - Implement GET /notifications/history endpoint with sent notifications log
  - Apply authorize middleware for admin-only endpoints
  - Add notification queuing for batch processing
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6_

- [ ] 17. Implement announcements feature
  - Create Announcement model with title, content, targeting, dates, metrics
  - Create announcementController with public and admin endpoints
  - Create announcementService with announcement logic
  - Implement GET /announcements endpoint filtering by active status and user eligibility
  - Implement GET /announcements/:id endpoint
  - Implement POST /announcements endpoint for admin with unpublished default status
  - Implement PATCH /announcements/:id endpoint for admin
  - Implement DELETE /announcements/:id endpoint for admin
  - Implement PATCH /announcements/:id/publish endpoint toggling published status
  - Add view and click tracking methods
  - Apply authorize middleware for admin-only endpoints
  - Create announcementRoutes
  - _Requirements: 23.1, 23.2, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6_

- [ ] 18. Implement reports and analytics
  - Create reportController with admin analytics endpoints
  - Create reportService with aggregation queries
  - Implement GET /reports/dashboard endpoint with key metrics (orders, revenue, users)
  - Implement GET /reports/sales endpoint with date range aggregation
  - Implement GET /reports/orders endpoint with status distribution and trends
  - Implement GET /reports/products endpoint with sales rankings
  - Implement GET /reports/revenue endpoint with store and category breakdown
  - Implement GET /reports/export endpoint generating CSV, Excel, or PDF
  - Apply authorize middleware for admin-only access
  - Create reportRoutes
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7_

- [ ] 19. Implement support ticket system
  - Create SupportTicket model with ticketNumber, userId, subject, category, status
  - Create SupportMessage model with ticketId, senderId, message, attachments
  - Create FAQ model with category, question, answer, display order
  - Create supportController with ticket and FAQ endpoints
  - Create supportService with support logic
  - Implement GET /support/contact endpoint returning contact information
  - Implement POST /support/tickets endpoint creating ticket with open status
  - Implement GET /support/tickets endpoint with role-based filtering
  - Implement GET /support/tickets/:ticketId endpoint with ownership validation
  - Implement PATCH /support/tickets/:ticketId endpoint for admin with notification
  - Implement GET /support/faq endpoint
  - Apply authorize middleware for admin-only ticket management
  - Create supportRoutes
  - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 27.1, 27.2, 27.3_

- [ ] 20. Implement system configuration management
  - Create AppConfig model with configKey, configValue, description
  - Add unique index on configKey
  - Create delivery zone model with geographic boundaries and fees
  - Create configController with public and admin endpoints
  - Create configService with configuration logic
  - Implement GET /config/app endpoint returning public configuration
  - Implement GET /config/delivery-zones endpoint
  - Implement GET /health endpoint with system status and uptime
  - Implement PATCH /config/app endpoint for admin
  - Implement POST /config/delivery-zones endpoint for admin
  - Implement PATCH /config/delivery-zones/:zoneId endpoint for admin
  - Implement DELETE /config/delivery-zones/:zoneId endpoint for admin
  - Apply authorize middleware for admin-only configuration management
  - Create configRoutes
  - _Requirements: 28.1, 28.2, 28.3, 29.1, 29.2, 29.3, 29.4, 29.5_

- [ ] 21. Add comprehensive error handling and validation
  - Create custom error codes for all error types (AUTH, VAL, RES, BUS, PAY, SYS)
  - Update AppError class to include error codes
  - Add Mongoose validation error handling in errorHandler middleware
  - Add duplicate key error handling in errorHandler middleware
  - Implement request validation middleware for all endpoints
  - Add business rule validation in service layer
  - Ensure consistent error response format across all endpoints
  - _Requirements: 30.4, 30.5_

- [ ] 22. Integrate all routes into main router
  - Import all new route modules in routes/index.ts
  - Mount search routes at /search
  - Mount favorite routes at /favorites
  - Mount cart routes at /cart
  - Mount checkout routes at /checkout
  - Mount payment routes at /payments
  - Mount order routes at /orders
  - Mount address routes at /users/me/addresses
  - Mount notification routes at /notifications
  - Mount announcement routes at /announcements
  - Mount report routes at /reports
  - Mount support routes at /support
  - Mount config routes at /config
  - Verify all routes follow RESTful conventions
  - _Requirements: All_

- [ ] 23. Create database seeders for development
  - Create admin user seeder with default admin credentials
  - Create promo code seeder with sample discount codes
  - Create FAQ seeder with common questions
  - Create app config seeder with default configuration values
  - Create delivery zone seeder with sample zones
  - Update package.json with seeder scripts
  - _Requirements: 1.1, 14.5, 26.5, 28.1, 29.2_

- [ ]\* 24. Add API documentation
  - Create OpenAPI/Swagger specification file
  - Document all endpoints with request/response schemas
  - Add authentication requirements to documentation
  - Include error response examples
  - Create Postman collection with example requests
  - Update README with API overview and authentication flow
  - _Requirements: All_

- [ ]\* 25. Performance optimization
  - Add pagination to all list endpoints with default page size 20
  - Implement cursor-based pagination for large datasets
  - Add database query projection to limit returned fields
  - Review and optimize database indexes
  - Add query performance logging
  - Implement connection pooling configuration
  - _Requirements: All_
