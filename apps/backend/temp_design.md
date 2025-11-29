# Design Document

## Overview

This design document outlines the architecture and implementation approach for a Role-Based Access Control (RBAC) API system for a food delivery and e-commerce platform. The system follows a unified API architecture where role-based permissions are enforced through middleware rather than separate endpoint prefixes, providing a cleaner and more maintainable codebase.

### Key Design Principles

1. **Single Endpoint Architecture**: All endpoints use a unified structure without role-based prefixes (e.g., `/admin/`)
2. **Middleware-Based Authorization**: Role checking occurs in the authorization middleware layer
3. **JWT-Based Authentication**: User identity and role information are embedded in JWT tokens
4. **Service Layer Pattern**: Business logic is separated from controllers for better testability
5. **MongoDB with Mongoose**: Document-based data storage with schema validation
6. **RESTful API Design**: Standard HTTP methods and status codes
7. **Error Handling**: Centralized error handling with consistent error responses

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Brevo (formerly Sendinblue)
- **Validation**: Custom middleware with Mongoose schemas
- **Development**: tsx for hot reloading

## Architecture

### High-Level Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         Security Middleware             │
│  (Helmet, CORS, Rate Limiting)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Authentication Middleware          │
│     (JWT Token Validation)              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Authorization Middleware           │
│     (Role-Based Access Control)         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│           Route Handlers                │
│         (Controllers)                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Service Layer                  │
│      (Business Logic)                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Data Layer                     │
│      (Mongoose Models)                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          MongoDB Database               │
└─────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── config/              # Configuration files
│   ├── database.ts      # MongoDB connection
│   ├── env.ts           # Environment variables
│   └── brevo.ts         # Email service config
├── controllers/         # Request handlers
│   ├── authController.ts
│   ├── storeController.ts
│   ├── categoryController.ts
│   ├── productController.ts
│   ├── searchController.ts
│   ├── favoriteController.ts
│   ├── cartController.ts
│   ├── checkoutController.ts
│   ├── paymentController.ts
│   ├── orderController.ts
│   ├── userController.ts
│   ├── addressController.ts
│   ├── notificationController.ts
│   ├── announcementController.ts
│   ├── reportController.ts
│   └── supportController.ts
├── middlewares/         # Express middlewares
│   ├── auth.ts          # Authentication middleware
│   ├── authorize.ts     # Authorization middleware (NEW)
│   ├── errorHandler.ts  # Error handling
│   ├── notFound.ts      # 404 handler
│   ├── security.ts      # Security headers
│   └── validateRequest.ts
├── models/              # Mongoose schemas
│   ├── User.ts
│   ├── Otp.ts
│   ├── RefreshToken.ts
│   ├── Store.ts
│   ├── Category.ts
│   ├── Product.ts
│   ├── ProductCustomization.ts
│   ├── AddOn.ts
│   ├── ProductAddOn.ts
│   ├── StoreInventory.ts
│   ├── SearchHistory.ts (NEW)
│   ├── Favorite.ts (NEW)
│   ├── Cart.ts (NEW)
│   ├── CartItem.ts (NEW)
│   ├── Order.ts (NEW)
│   ├── OrderItem.ts (NEW)
│   ├── OrderStatusHistory.ts (NEW)
│   ├── Address.ts (NEW)
│   ├── Notification.ts (NEW)
│   ├── DeviceToken.ts (NEW)
│   ├── Announcement.ts (NEW)
│   ├── PromoCode.ts (NEW)
│   ├── PromoCodeUsage.ts (NEW)
│   ├── SupportTicket.ts (NEW)
│   ├── SupportMessage.ts (NEW)
│   ├── FAQ.ts (NEW)
│   └── AppConfig.ts (NEW)
├── routes/              # Route definitions
│   ├── index.ts
│   ├── authRoutes.ts
│   ├── storeRoutes.ts
│   ├── categoryRoutes.ts
│   ├── productRoutes.ts
│   ├── searchRoutes.ts (NEW)
│   ├── favoriteRoutes.ts (NEW)
│   ├── cartRoutes.ts (NEW)
│   ├── checkoutRoutes.ts (NEW)
│   ├── paymentRoutes.ts (NEW)
│   ├── orderRoutes.ts (NEW)
│   ├── userRoutes.ts
│   ├── addressRoutes.ts (NEW)
│   ├── notificationRoutes.ts (NEW)
│   ├── announcementRoutes.ts (NEW)
│   ├── reportRoutes.ts (NEW)
│   ├── supportRoutes.ts (NEW)
│   └── configRoutes.ts (NEW)
├── services/            # Business logic
│   ├── authService.ts
│   ├── otpService.ts
│   ├── emailService.ts
│   ├── storeService.ts
│   ├── categoryService.ts
│   ├── productService.ts
│   ├── searchService.ts (NEW)
│   ├── favoriteService.ts (NEW)
│   ├── cartService.ts (NEW)
│   ├── checkoutService.ts (NEW)
│   ├── paymentService.ts (NEW)
│   ├── orderService.ts (NEW)
│   ├── userService.ts
│   ├── addressService.ts (NEW)
│   ├── notificationService.ts (NEW)
│   ├── announcementService.ts (NEW)
│   ├── reportService.ts (NEW)
│   └── supportService.ts (NEW)
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Utility functions
│   ├── AppError.ts
│   ├── asyncHandler.ts
│   ├── jwt.ts
│   └── logger.ts
└── index.ts             # Application entry point
```

## Components and Interfaces

### 1. Authentication & Authorization Components

#### JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  iat: number;
  exp: number;
}
```

#### Authentication Middleware

The existing `auth.ts` middleware validates JWT tokens and attaches user information to the request object.

**Responsibilities:**

- Extract JWT token from Authorization header
- Validate token signature and expiration
- Decode token and attach user info to `req.user`
- Handle token expiration and invalid tokens

#### Authorization Middleware (NEW)

A new `authorize.ts` middleware will handle role-based access control.

```typescript
interface AuthorizeOptions {
  roles?: ('user' | 'admin' | 'moderator')[];
  allowSelf?: boolean; // Allow users to access their own resources
  resourceOwnerParam?: string; // Parameter name for resource owner ID
}

function authorize(options: AuthorizeOptions): RequestHandler;
```

**Responsibilities:**

- Check if authenticated user has required role
- Optionally allow users to access their own resources
- Return 403 Forbidden if authorization fails

**Usage Examples:**

```typescript
// Admin only
router.post(
  '/stores',
  authenticate,
  authorize({ roles: ['admin'] }),
  createStore
);

// User or Admin accessing their own resource
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

// Any authenticated user
router.get('/favorites', authenticate, getFavorites);
```

### 2. Store Management Components

#### Store Model

Extends existing Store model with additional fields for gallery, hours, and location management.

```typescript
interface IStore {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  phone: string;
  email?: string;
  latitude: number;
  longitude: number;
  images: string[]; // Gallery images
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  specialHours?: Array<{
    date: Date;
    open?: string;
    close?: string;
    closed: boolean;
    reason?: string;
  }>;
  isOpen: boolean;
  isActive: boolean;
  averagePrepTime: number;
  rating?: number;
  totalReviews: number;
  features: {
    parking?: boolean;
    wifi?: boolean;
    outdoorSeating?: boolean;
    driveThrough?: boolean;
  };
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Store Service

```typescript
class StoreService {
  async getAllStores(filters?: StoreFilters): Promise<IStore[]>;
  async getStoreById(storeId: string): Promise<IStore>;
  async getStoreGallery(storeId: string): Promise<string[]>;
  async getStoreHours(storeId: string): Promise<OpeningHours>;
  async getStoreLocation(storeId: string): Promise<Location>;
  async createStore(data: CreateStoreDTO): Promise<IStore>;
  async updateStore(storeId: string, data: UpdateStoreDTO): Promise<IStore>;
  async deleteStore(storeId: string): Promise<void>;
  async updateStoreStatus(storeId: string, isActive: boolean): Promise<IStore>;
}
```

### 3. Category Management Components

#### Category Model

Existing Category model with support for hierarchical categories.

```typescript
interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  parentCategoryId?: string;
  productCount?: number; // Virtual field
  createdAt: Date;
  updatedAt: Date;
}
```

#### Category Service

```typescript
class CategoryService {
  async getCategoriesByStore(storeId: string): Promise<ICategory[]>;
  async getCategoryById(categoryId: string): Promise<ICategory>;
  async createCategory(data: CreateCategoryDTO): Promise<ICategory>;
  async updateCategory(
    categoryId: string,
    data: UpdateCategoryDTO
  ): Promise<ICategory>;
  async deleteCategory(categoryId: string): Promise<void>;
  async reorderCategories(categoryIds: string[]): Promise<void>;
}
```

### 4. Product Management Components

#### Product Model

Existing Product model with inventory tracking.

```typescript
interface IProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  images: string[];
  basePrice: number;
  currency: string;
  preparationTime: number;
  calories?: number;
  rating?: number;
  totalReviews: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSelling: boolean;
  allergens?: string[];
  tags?: string[];
  nutritionalInfo?: NutritionalInfo;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

#### Product Service

```typescript
class ProductService {
  async getProductsByStore(
    storeId: string,
    filters?: ProductFilters
  ): Promise<IProduct[]>;
  async getProductById(productId: string): Promise<IProduct>;
  async createProduct(data: CreateProductDTO): Promise<IProduct>;
  async updateProduct(
    productId: string,
    data: UpdateProductDTO
  ): Promise<IProduct>;
  async deleteProduct(productId: string): Promise<void>;
  async updateProductStatus(
    productId: string,
    isAvailable: boolean
  ): Promise<IProduct>;
  async duplicateProduct(productId: string): Promise<IProduct>;
}
```

### 5. Search Components

#### Search History Model (NEW)

```typescript
interface ISearchHistory {
  id: string;
  userId: string;
  query: string;
  searchType: 'store' | 'product' | 'all';
  resultsCount: number;
  createdAt: Date;
}
```

#### Search Service (NEW)

```typescript
class SearchService {
  async search(
    query: string,
    type?: string,
    filters?: SearchFilters
  ): Promise<SearchResults>;
  async getSuggestions(query: string, limit?: number): Promise<string[]>;
  async getRecentSearches(
    userId: string,
    limit?: number
  ): Promise<ISearchHistory[]>;
  async saveSearch(
    userId: string,
    query: string,
    type: string,
    resultsCount: number
  ): Promise<void>;
  async deleteAllSearches(userId: string): Promise<void>;
  async deleteSearch(userId: string, searchId: string): Promise<void>;
}
```

**Search Implementation:**

- Use MongoDB text indexes on Store.name, Store.description, Product.name, Product.description
- Implement fuzzy matching for typo tolerance
- Rank results by relevance score
- Cache popular searches for performance

### 6. Favorites Components

#### Favorite Model (NEW)

```typescript
interface IFavorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}
```

#### Favorite Service (NEW)

```typescript
class FavoriteService {
  async getFavorites(userId: string): Promise<IProduct[]>;
  async addFavorite(userId: string, productId: string): Promise<void>;
  async removeFavorite(userId: string, productId: string): Promise<void>;
  async isFavorite(userId: string, productId: string): Promise<boolean>;
}
```

### 7. Cart Components

#### Cart Model (NEW)

```typescript
interface ICart {
  id: string;
  userId: string;
  storeId: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  promoCode?: string;
  pickupTime?: Date;
  deliveryAddress?: string;
  notes?: string;
  status: 'active' | 'checked_out' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
```

#### Cart Item Model (NEW)

```typescript
interface ICartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  customization?: {
    size?: string;
    sugarLevel?: string;
    iceLevel?: string;
    coffeeLevel?: string;
  };
  addOns?: string[]; // Array of add-on IDs
  notes?: string;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Cart Service (NEW)

```typescript
class CartService {
  async getCart(userId: string): Promise<ICart>;
  async addItem(userId: string, item: AddCartItemDTO): Promise<ICart>;
  async updateItemQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<ICart>;
  async removeItem(userId: string, itemId: string): Promise<ICart>;
  async clearCart(userId: string): Promise<void>;
  async validateCart(userId: string): Promise<CartValidationResult>;
  async setDeliveryAddress(userId: string, addressId: string): Promise<ICart>;
  async setNotes(userId: string, notes: string): Promise<ICart>;
  async getCartSummary(userId: string): Promise<CartSummary>;
  private async calculateTotals(cart: ICart): Promise<void>;
}
```

**Cart Business Rules:**

- One active cart per user
- Cart items must belong to the same store
- Validate product availability and price on each operation
- Recalculate totals when items change
- Auto-expire abandoned carts after 24 hours

### 8. Checkout & Payment Components

#### Checkout Session (Temporary State)

```typescript
interface ICheckoutSession {
  id: string;
  userId: string;
  cartId: string;
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: IAddress;
  paymentMethod?: string;
  promoCode?: IPromoCode;
  expiresAt: Date;
  createdAt: Date;
}
```

#### Checkout Service (NEW)

```typescript
class CheckoutService {
  async validateCheckout(userId: string): Promise<ValidationResult>;
  async createCheckoutSession(userId: string): Promise<ICheckoutSession>;
  async getCheckoutSession(
    userId: string,
    checkoutId: string
  ): Promise<ICheckoutSession>;
  async getPaymentMethods(): Promise<PaymentMethod[]>;
  async applyCoupon(
    checkoutId: string,
    couponCode: string
  ): Promise<ICheckoutSession>;
  async removeCoupon(checkoutId: string): Promise<ICheckoutSession>;
  async calculateDeliveryCharges(addressId: string): Promise<number>;
  async confirmCheckout(userId: string, checkoutId: string): Promise<IOrder>;
}
```

#### Payment Service (NEW)

```typescript
class PaymentService {
  async createPaymentIntent(
    orderId: string,
    userId: string
  ): Promise<PaymentIntent>;
  async confirmPayment(
    orderId: string,
    paymentDetails: PaymentDetails
  ): Promise<PaymentResult>;
  async mockPaymentComplete(orderId: string): Promise<void>; // Development only
  async processRefund(orderId: string, amount: number): Promise<RefundResult>;
}
```

**Payment Integration:**

- Support for multiple payment providers (ABA, ACLEDA, Wing)
- Payment intent pattern for secure payment processing
- Webhook handling for payment confirmation
- Mock payment endpoint for development/testing

### 9. Order Management Components

#### Order Model (NEW)

```typescript
interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentProviderTransactionId?: string;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  promoCodeId?: string;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  pickupTime: Date;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  pickedUpAt?: Date;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'store' | 'system';
  refundAmount?: number;
  refundStatus?: RefundStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'completed'
  | 'cancelled';

type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';
```

#### Order Item Model (NEW)

```typescript
interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string; // Snapshot
  productImage: string; // Snapshot
  quantity: number;
  customization?: object;
  addOns?: Array<{ id: string; name: string; price: number }>;
  notes?: string;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}
```

#### Order Status History Model (NEW)

```typescript
interface IOrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  changedBy: 'system' | 'customer' | 'store' | 'admin';
  createdAt: Date;
}
```

#### Order Service (NEW)

```typescript
class OrderService {
  async getOrders(
    userId: string,
    role: string,
    filters?: OrderFilters
  ): Promise<IOrder[]>;
  async getOrderById(
    orderId: string,
    userId: string,
    role: string
  ): Promise<IOrder>;
  async getOrderTracking(
    orderId: string,
    userId: string
  ): Promise<OrderTracking>;
  async generateInvoice(
    orderId: string,
    userId: string,
    role: string
  ): Promise<Buffer>;
  async generateReceipt(orderId: string): Promise<Buffer>; // Admin only
  async cancelOrder(
    orderId: string,
    userId: string,
    reason: string
  ): Promise<IOrder>;
  async rateOrder(
    orderId: string,
    userId: string,
    rating: number,
    review?: string
  ): Promise<void>;
  async reorder(orderId: string, userId: string): Promise<ICart>;
  async addInternalNotes(orderId: string, notes: string): Promise<IOrder>; // Admin only
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<IOrder>; // Admin only
  async assignDriver(orderId: string, driverId: string): Promise<IOrder>; // Admin only
}
```

**Order Business Rules:**

- Orders can only be cancelled within 5 minutes of placement
- Order status transitions must follow valid flow
- Automatic status updates based on time (e.g., auto-complete after pickup)
- Loyalty points earned after order completion
- Refunds processed for cancelled orders

### 10. User Management Components

#### User Model

Existing User model with role field.

```typescript
interface IUser {
  id: string;
  phoneNumber: string;
  email?: string;
  passwordHash: string;
  fullName: string;
  profileImage?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  emailVerified: boolean;
  phoneVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  referralCode: string;
  referredBy?: string;
  totalOrders: number;
  totalSpent: number;
  preferences: UserPreferences;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  deletedAt?: Date;
}
```

#### User Service

```typescript
class UserService {
  async getUserProfile(userId: string): Promise<IUser>;
  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<IUser>;
  async uploadAvatar(
    userId: string,
    file: Express.Multer.File
  ): Promise<string>;
  async deleteAccount(userId: string): Promise<void>;
  async getAllUsers(
    filters?: UserFilters,
    pagination?: Pagination
  ): Promise<PaginatedResult<IUser>>;
  async getUserById(userId: string): Promise<IUser>;
  async getUserOrders(userId: string): Promise<IOrder[]>;
  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended'
  ): Promise<IUser>;
}
```

### 11. Address Management Components

#### Address Model (NEW)

```typescript
interface IAddress {
  id: string;
  userId: string;
  label: string; // e.g., "Home", "Office"
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  deliveryInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Address Service (NEW)

```typescript
class AddressService {
  async getAddresses(userId: string): Promise<IAddress[]>;
  async addAddress(userId: string, data: CreateAddressDTO): Promise<IAddress>;
  async updateAddress(
    userId: string,
    addressId: string,
    data: UpdateAddressDTO
  ): Promise<IAddress>;
  async deleteAddress(userId: string, addressId: string): Promise<void>;
  async setDefaultAddress(userId: string, addressId: string): Promise<void>;
  async validateAddress(address: CreateAddressDTO): Promise<ValidationResult>;
}
```

### 12. Notification Components

#### Notification Model (NEW)

```typescript
interface INotification {
  id: string;
  userId: string;
  type: 'order_status' | 'promotion' | 'announcement' | 'system';
  title: string;
  message: string;
  imageUrl?: string;
  actionType?: 'order_details' | 'promotion' | 'external_url' | 'none';
  actionValue?: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}
```

#### Device Token Model (NEW)

```typescript
interface IDeviceToken {
  id: string;
  userId: string;
  fcmToken: string;
  deviceId?: string;
  deviceType: 'ios' | 'android';
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Notification Service (NEW)

```typescript
class NotificationService {
  async registerDevice(
    userId: string,
    data: RegisterDeviceDTO
  ): Promise<IDeviceToken>;
  async unregisterDevice(userId: string, tokenId: string): Promise<void>;
  async getNotifications(
    userId: string,
    filters?: NotificationFilters
  ): Promise<INotification[]>;
  async getUnreadCount(userId: string): Promise<number>;
  async markAsRead(userId: string, notificationId: string): Promise<void>;
  async markAllAsRead(userId: string): Promise<void>;
  async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<void>;
  async deleteAllNotifications(userId: string): Promise<void>;
  async getSettings(userId: string): Promise<NotificationSettings>;
  async updateSettings(
    userId: string,
    settings: NotificationSettings
  ): Promise<void>;
  async sendNotification(
    userId: string,
    notification: CreateNotificationDTO
  ): Promise<void>; // Admin
  async broadcastNotification(
    notification: CreateNotificationDTO
  ): Promise<void>; // Admin
  async sendSegmentNotification(
    segment: UserSegment,
    notification: CreateNotificationDTO
  ): Promise<void>; // Admin
  async getStatistics(): Promise<NotificationStats>; // Admin
  async getHistory(filters?: HistoryFilters): Promise<NotificationHistory[]>; // Admin
}
```

**Notification Delivery:**

- Use Firebase Cloud Messaging (FCM) for push notifications
- Queue notifications for batch processing
- Retry failed deliveries with exponential backoff
- Track delivery status and engagement metrics

### 13. Announcement Components

#### Announcement Model (NEW)

```typescript
interface IAnnouncement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  actionType?: 'promo_code' | 'deep_link' | 'external_url' | 'none';
  actionValue?: string;
  priority: number;
  targetAudience: 'all' | 'new_users' | 'loyal_users' | 'specific_tier';
  userTierFilter?: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Announcement Service (NEW)

```typescript
class AnnouncementService {
  async getActiveAnnouncements(userId?: string): Promise<IAnnouncement[]>;
  async getAnnouncementById(announcementId: string): Promise<IAnnouncement>;
  async createAnnouncement(data: CreateAnnouncementDTO): Promise<IAnnouncement>; // Admin
  async updateAnnouncement(
    announcementId: string,
    data: UpdateAnnouncementDTO
  ): Promise<IAnnouncement>; // Admin
  async deleteAnnouncement(announcementId: string): Promise<void>; // Admin
  async togglePublish(announcementId: string): Promise<IAnnouncement>; // Admin
  async trackView(announcementId: string): Promise<void>;
  async trackClick(announcementId: string): Promise<void>;
}
```

### 14. Reports & Analytics Components

#### Report Service (NEW)

```typescript
class ReportService {
  async getDashboardStats(filters?: DateRangeFilter): Promise<DashboardStats>; // Admin
  async getSalesReport(filters: ReportFilters): Promise<SalesReport>; // Admin
  async getOrdersReport(filters: ReportFilters): Promise<OrdersReport>; // Admin
  async getProductsPerformance(
    filters: ReportFilters
  ): Promise<ProductPerformance[]>; // Admin
  async getRevenueAnalytics(filters: ReportFilters): Promise<RevenueAnalytics>; // Admin
  async exportReport(
    reportType: string,
    format: 'csv' | 'excel' | 'pdf',
    filters: ReportFilters
  ): Promise<Buffer>; // Admin
}
```

**Report Types:**

1. **Dashboard Stats**
   - Total orders (today, week, month)
   - Total revenue (today, week, month)
   - Active users count
   - Average order value
   - Top selling products
   - Order status distribution

2. **Sales Report**
   - Revenue by date range
   - Revenue by store
   - Revenue by category
   - Payment method breakdown
   - Discount impact analysis

3. **Orders Report**
   - Order volume trends
   - Order status distribution
   - Average preparation time
   - Cancellation rate and reasons
   - Peak ordering hours

4. **Product Performance**
   - Best selling products
   - Low performing products
   - Product rating distribution
   - Stock availability issues

5. **Revenue Analytics**
   - Revenue trends over time
   - Revenue by store comparison
   - Revenue by category breakdown
   - Promo code effectiveness

### 15. Support Components

#### Support Ticket Model (NEW)

```typescript
interface ISupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  category: 'payment' | 'order' | 'account' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  orderId?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}
```

#### Support Message Model (NEW)

```typescript
interface ISupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'customer' | 'support' | 'system';
  message: string;
  attachments?: string[];
  isInternal: boolean;
  createdAt: Date;
}
```

#### FAQ Model (NEW)

```typescript
interface IFAQ {
  id: string;
  category: 'orders' | 'payment' | 'account' | 'general';
  question: string;
  answer: string;
  displayOrder: number;
  helpfulCount: number;
  notHelpfulCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Support Service (NEW)

```typescript
class SupportService {
  async getContactInfo(): Promise<ContactInfo>;
  async createTicket(
    userId: string,
    data: CreateTicketDTO
  ): Promise<ISupportTicket>;
  async getTickets(
    userId: string,
    role: string,
    filters?: TicketFilters
  ): Promise<ISupportTicket[]>;
  async getTicketById(
    ticketId: string,
    userId: string,
    role: string
  ): Promise<ISupportTicket>;
  async updateTicketStatus(
    ticketId: string,
    status: string
  ): Promise<ISupportTicket>; // Admin
  async addMessage(
    ticketId: string,
    userId: string,
    message: string,
    attachments?: string[]
  ): Promise<ISupportMessage>;
  async getFAQs(category?: string): Promise<IFAQ[]>;
}
```

### 16. System Configuration Components

#### App Config Model (NEW)

```typescript
interface IAppConfig {
  id: string;
  configKey: string;
  configValue: any;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Configuration Keys:**

- `app.version`: Current app version
- `app.maintenance_mode`: Boolean for maintenance status
- `app.min_order_amount`: Minimum order amount
- `app.tax_rate`: Tax percentage
- `app.loyalty_points_rate`: Points earned per dollar spent
- `payment.methods`: Available payment methods
- `delivery.base_fee`: Base delivery fee
- `delivery.per_km_fee`: Fee per kilometer

#### Delivery Zone Model

```typescript
interface IDeliveryZone {
  id: string;
  name: string;
  description?: string;
  coordinates: GeoJSON.Polygon; // Geographic boundary
  deliveryFee: number;
  minOrderAmount?: number;
  estimatedDeliveryTime: number; // minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Config Service (NEW)

```typescript
class ConfigService {
  async getAppConfig(): Promise<AppConfig>;
  async getDeliveryZones(): Promise<IDeliveryZone[]>;
  async healthCheck(): Promise<HealthStatus>;
  async updateAppConfig(key: string, value: any): Promise<IAppConfig>; // Admin
  async addDeliveryZone(data: CreateDeliveryZoneDTO): Promise<IDeliveryZone>; // Admin
  async updateDeliveryZone(
    zoneId: string,
    data: UpdateDeliveryZoneDTO
  ): Promise<IDeliveryZone>; // Admin
  async deleteDeliveryZone(zoneId: string): Promise<void>; // Admin
}
```

## Data Models

### Database Schema Relationships

```
User ──┬─── RefreshToken (1:N)
       ├─── Otp (1:N)
       ├─── Address (1:N)
       ├─── Cart (1:1 active)
       ├─── Order (1:N)
       ├─── Favorite (1:N)
       ├─── SearchHistory (1:N)
       ├─── Notification (1:N)
       ├─── DeviceToken (1:N)
       └─── SupportTicket (1:N)

Store ──┬─── Category (1:N)
        ├─── Product (1:N via StoreInventory)
        ├─── Order (1:N)
        └─── Cart (1:N)

Category ─── Product (1:N)

Product ──┬─── ProductCustomization (1:N)
          ├─── ProductAddOn (N:M via junction)
          ├─── CartItem (1:N)
          ├─── OrderItem (1:N)
          ├─── Favorite (1:N)
          └─── StoreInventory (1:N)

Cart ─── CartItem (1:N)

Order ──┬─── OrderItem (1:N)
        ├─── OrderStatusHistory (1:N)
        └─── PromoCodeUsage (1:1)

PromoCode ─── PromoCodeUsage (1:N)

SupportTicket ─── SupportMessage (1:N)
```

### Key Indexes

**Performance-Critical Indexes:**

1. **User Model**
   - `email` (unique)
   - `phoneNumber` (unique)
   - `role`
   - `status`

2. **Store Model**
   - `slug` (unique)
   - `isActive`
   - `{ latitude: 1, longitude: 1 }` (2dsphere for geospatial queries)

3. **Product Model**
   - `slug` (unique)
   - `categoryId`
   - `isAvailable`
   - `isFeatured`
   - `{ name: 'text', description: 'text' }` (text search)

4. **Order Model**
   - `orderNumber` (unique)
   - `userId`
   - `storeId`
   - `status`
   - `paymentStatus`
   - `createdAt`

5. **Cart Model**
   - `{ userId: 1, status: 1 }` (compound, unique for active carts)

6. **Notification Model**
   - `{ userId: 1, isRead: 1, createdAt: -1 }` (compound)

## Error Handling

### Error Response Format

All errors follow a consistent format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string; // Only in development
  };
}
```

### Error Types

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public isOperational: boolean = true,
    public details?: any
  ) {
    super(message);
  }
}
```

**Common Error Codes:**

- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Token invalid
- `AUTH_004`: Insufficient permissions
- `AUTH_005`: Email not verified
- `VAL_001`: Validation error
- `RES_001`: Resource not found
- `RES_002`: Resource already exists
- `BUS_001`: Business rule violation
- `BUS_002`: Invalid state transition
- `PAY_001`: Payment failed
- `PAY_002`: Payment already processed
- `SYS_001`: Internal server error
- `SYS_002`: Database error
- `SYS_003`: External service error

### Error Handling Middleware

```typescript
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
      },
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VAL_001',
        message: 'Validation error',
        details: err.errors,
      },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'RES_002',
        message: 'Resource already exists',
        details: err.keyValue,
      },
    });
  }

  // Default error
  logger.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'SYS_001',
      message: 'Internal server error',
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
}
```

## Testing Strategy

### Unit Testing

**Scope:**

- Service layer business logic
- Utility functions
- Middleware functions
- Model validation

**Tools:**

- Jest or Vitest as test runner
- Supertest for HTTP assertions
- MongoDB Memory Server for database tests

**Example Test Structure:**

```typescript
describe('CartService', () => {
  describe('addItem', () => {
    it('should add item to cart', async () => {
      // Arrange
      const userId = 'user123';
      const item = { productId: 'prod123', quantity: 2 };

      // Act
      const cart = await cartService.addItem(userId, item);

      // Assert
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
    });

    it('should throw error if product not available', async () => {
      // Test error case
    });
  });
});
```

### Integration Testing

**Scope:**

- API endpoint testing
- Database operations
- Authentication/Authorization flow
- Payment processing flow

**Example:**

```typescript
describe('POST /api/cart/items', () => {
  it('should add item to cart for authenticated user', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 'prod123', quantity: 2 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toHaveLength(1);
  });

  it('should return 401 for unauthenticated user', async () => {
    await request(app)
      .post('/api/cart/items')
      .send({ productId: 'prod123', quantity: 2 })
      .expect(401);
  });
});
```

### Test Coverage Goals

- Service layer: 80%+ coverage
- Controllers: 70%+ coverage
- Middleware: 90%+ coverage
- Overall: 75%+ coverage

### Testing Best Practices

1. **Arrange-Act-Assert Pattern**: Structure tests clearly
2. **Test Isolation**: Each test should be independent
3. **Mock External Services**: Don't call real payment APIs, email services
4. **Use Test Fixtures**: Reusable test data
5. **Test Edge Cases**: Not just happy paths
6. **Descriptive Test Names**: Clear whateing tested

## Security Considerations

### Authentication Security

1. **Password Hashing**: Use bcrypt with salt rounds >= 10
2. **JWT Security**:
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Store refresh tokens in database for revocation
   - Rotate refresh tokens on use
3. **OTP Security**:
   - 6-digit random codes
   - 10-minute expiration
   - Maximum 5 attempts
   - Rate limiting on OTP generation

### Authorization Security

1. **Role-Based Access Control**:
   - Validate role on every protected endpoint
   - Use middleware for consistent enforcement
   - Principle of least privilege
2. **Resource Ownership**:
   - Verify user owns resource before allowing access
   - Admin can access all resources
3. **API Rate Limiting**:
   - Global: 100 requests per 15 minutes per IP
   - Auth endpoints: 5 requests per 15 minutes per IP
   - Payment endpoints: 10 requests per hour per user

### Data Security

1. **Input Validation**:
   - Validate all user inputs
   - Sanitize data before database operations
   - Use Mongoose schema validation
2. **SQL/NoSQL Injection Prevention**:
   - Use parameterized queries
   - Mongoose handles this by default
3. **XSS Prevention**:
   - Sanitize HTML content
   - Set appropriate Content-Security-Policy headers
4. **CORS Configuration**:
   - Whitelist allowed origins
   - Restrict methods and headers
5. **Sensitive Data**:
   - Never log passwords or tokens
   - Mask sensitive data in logs
   - Use environment variables for secrets

### Payment Security

1. **PCI Compliance**:
   - Never store card details
   - Use payment provider SDKs
   - Implement payment intent pattern
2. **Transaction Security**:
   - Verify payment status with provider
   - Implement idempotency for payment operations
   - Log all payment attempts

### API Security Headers

```typescript
// Helmet configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        rc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

## Performance Optimization

### Database Optimization

1. **Indexing Strategy**:
   - Index frequently queried fields
   - Compound indexes for multi-field queries
   - Text indexes for search functionality
   - Geospatial indexes for location queries

2. **Query Optimization**:
   - Use projection to limit returned fields
   - Implement pagination for large result sets
   - Use aggregation pipeline for complex queries
   - Avoid N+1 queries with population

3. **Connection Pooling**:
   - Configure appropriate pool size
   - Monitor connection usage

### Caching Strategy

1. **Redis Caching** (Future Enhancement):
   - Cache frequently accessed data (stores, products, categories)
   - Cache search results
   - Cache user sessions
   - Set appropriate TTL values

2. **Application-Level Caching**:
   - Cache configuration values
   - Cache computed values (cart totals)

### API Performance

1. **Response Compression**:
   - Use gzip compression for responses
   - Already implemented with compression middleware

2. **Pagination**:
   - Implement cursor-based pagination for large datasets
   - Default page size: 20 items
   - Maximum page size: 100 items

3. **Async Operations**:
   - Use async/await consistently
   - Implement background jobs for heavy operations (email sending, report generation)

4. **Database Connection**:
   e database connections
   - Implement connection retry logic

### Monitoring and Logging

1. **Logging Strategy**:
   - Use structured logging (JSON format)
   - Log levels: error, warn, info, debug
   - Include request ID for tracing
   - Log performance metrics

2. **Monitoring** (Future Enhancement):
   - Track API response times
   - Monitor database query performance
   - Alert on error rate spikes
   - Track business metrics (orders, revenue)

## Deployment Considerations

### Environment Configuration

```typescript
// Required environment variables
{
  NODE_ENV: 'development' | 'production',
  PORT: number,
  MONGODB_URI: string,
  JWT_SECRET: string,
  JWT_REFRESH_SECRET: string,
  JWT_EXPIRES_IN: string,
  JWT_REFRESH_EXPIRES_IN: string,
  BREVO_API_KEY: string,
  BREVO_SENDER_EMAIL: string,
  CORS_ORIGIN: string,
  // Payment provider credentials
  ABA_API_KEY?: string,
  ACLEDA_API_KEY?: string,
  WING_API_KEY?: string,
  // FCM for notifications
  FCM_SERVER_KEY?: string,
}
```

### Build Process

```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Linting
npm run lint

# Build TypeScript
npm run build

# Start production server
npm start
```

### Health Check Endpoint

```typescript
GET /health

Response:
{
  status: 'ok',
  timestamp: '2024-01-01T00:00:00.000Z',
  uptime: 12345,
  database: 'connected',
  version: '1.0.0'
}
```

### Graceful Shutdown

```typescript
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  // Stop accepting new requests
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Close database connection
  await mongoose.connection.close();
  logger.info('Database connection closed');

  process.exit(0);
});
```

## API Documentation

### Documentation Strategy

1. **OpenAPI/Swagger Specification**:
   - Generate API documentation from code
   - Include request/response examples
   - Document authentication requirements
   - Document error responses

2. **Postman Collection**:
   - Provide Postman collection for testing
   - Include environment variables
   - Add example requests

3. **README Documentation**:
   - Getting started guide
   - Environment setup
   - API overview
   - Authentication flow

### Example API Documentation Format

```yaml
/api/stores:
  get:
    summary: Get all stores
    tags: [Stores]
    security
    parameters:
      - name: city
        in: query
        schema:
          type: string
      - name: isActive
        in: query
        schema:
          type: boolean
    responses:
      200:
        description: List of stores
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                data:
                  type: array
                  items:
                    $ref: '#/components/schemas/Store'
```

## Migration Strategy

### Phased Implementation

Given the existing codebase has authentication, stores, categories, and products already implemented, the migration will be phased:

**Phase 1: Core Infrastructure** (Week 1)

- Implement authorization middleware
- Add role field to User model
- Update authentication to include role in JWT
- Add admin user seeder

**Phase 2: Search & Favorites** (Week 1-2)

- Implement search functionality
- Implement favorites feature
- Add search history tracking

**Phase 3: Cart & Checkout** (Week 2-3)

- Implement cart management
- Implement checkout flow
- Add promo code support

**Phase 4: Payment & Orders** (Week 3-4)

- Implement payment integration
- Implement order management
- Add order tracking

**Phase 5: User Features** (Week 4-5)

- Implement address management
- Implement notification system
- Add device token management

**Phase 6: Admin Features** (Week 5-6)

- Implement announcements
- Implement reports & analytics
- Add support ticket system

**Phase 7: Configuration & Polish** (Week 6-7)

- Implement system configuration
- Add delivery zones
- Performance optimization
- Documentation

### Data Migration

Since this is a new implementation, no data migration is required. However, existing data should be preserved:

1. **User Data**: Add default role 'user' to existing users
2. **Store Data**: Ensure all stores have required fields
3. **Product Data**: Verify product availability flags
4. **Category Data**: Maintain existing category structure

## Conclusion

This design provides a comprehensive blueprint for implementing a role-based access control API system for a food delivery platform. The architecture emphasizes:

- **Security**: JWT-based authentication with role-based authorization
- **Scalability**: Service layer pattern with clear separation of concerns
- **Maintainability**: Consistent error handling and logging
- **Performance**: Optimized database queries and caching strategy
- **Testability**: Clear testing strategy with good coverage goals

The phased implementation approach allows for incremental development while maintaining system stability.
