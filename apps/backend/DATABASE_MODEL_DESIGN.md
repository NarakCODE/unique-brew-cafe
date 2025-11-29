# Coffee Pickup App - Database Models & Schema Structure

## 1. USER MODEL

```
users
```

```
id: string (UUID, Primary Key)
phone_number: string (unique, indexed)
email: string (unique, indexed, nullable)
password_hash: string
full_name: string
profile_image: string (URL, nullable)
date_of_birth: date (nullable)
gender: string (enum: male, female, other, nullable)
email_verified: boolean (default: false)
phone_verified: boolean (default: false)
loyalty_points: integer (default: 0)
loyalty_tier: string (enum: bronze, silver, gold, platinum, default: bronze)
referral_code: string (unique, indexed)
referred_by: string (foreign key to users.referral_code, nullable)
total_orders: integer (default: 0)
total_spent: decimal (default: 0.00)
preferences: json
  - notifications_enabled: boolean
  - email_notifications: boolean
  - sms_notifications: boolean
  - push_notifications: boolean
  - language: string (en, km)
  - currency: string (USD, KHR)
status: string (enum: active, suspended, deleted, default: active)
created_at: timestamp
updated_at: timestamp
last_login_at: timestamp (nullable)
deleted_at: timestamp (nullable, soft delete)
```

**Indexes:**
- phone_number (unique)
- email (unique)
- referral_code (unique)
- status
- created_at

---

## 2. OTP MODEL

```
otps
```

```
id: string (UUID, Primary Key)
user_id: string (foreign key to users.id, nullable)
phone_number: string (indexed)
otp_code: string
verification_type: string (enum: registration, password_reset, phone_verification)
verified: boolean (default: false)
attempts: integer (default: 0)
max_attempts: integer (default: 5)
expires_at: timestamp
verified_at: timestamp (nullable)
created_at: timestamp
```

**Indexes:**
- phone_number
- expires_at
- verified

---

## 3. REFRESH TOKEN MODEL

```
refresh_tokens
```

```
id: string (UUID, Primary Key)
user_id: string (foreign key to users.id, indexed)
token: string (unique, indexed)
device_id: string (nullable)
device_type: string (enum: ios, android, web, nullable)
ip_address: string (nullable)
user_agent: string (nullable)
expires_at: timestamp
revoked: boolean (default: false)
revoked_at: timestamp (nullable)
created_at: timestamp
```

**Indexes:**
- user_id
- token (unique)
- expires_at

---

## 4. STORE MODEL

```
stores
```

```
id: string (UUID, Primary Key)
name: string
slug: string (unique, indexed)
description: text (nullable)
address: text
city: string
state: string
postal_code: string (nullable)
country: string (default: Cambodia)
phone: string
email: string (nullable)
latitude: decimal (10, 8)
longitude: decimal (11, 8)
image_url: string (nullable)
opening_hours: json
  - monday: {open: string, close: string}
  - tuesday: {open: string, close: string}
  - ...
special_hours: json (nullable, for holidays)
is_open: boolean (default: true)
is_active: boolean (default: true)
average_prep_time: integer (minutes, default: 15)
rating: decimal (2, 1, nullable)
total_reviews: integer (default: 0)
features: json
  - parking: boolean
  - wifi: boolean
  - outdoor_seating: boolean
  - drive_through: boolean
manager_id: string (foreign key to users.id, nullable)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- slug (unique)
- latitude, longitude (spatial index)
- is_active
- created_at

---

## 5. CATEGORY MODEL

```
categories
```

```
id: string (UUID, Primary Key)
name: string
slug: string (unique, indexed)
description: text (nullable)
image_url: string (nullable)
icon: string (nullable)
display_order: integer (default: 0)
is_active: boolean (default: true)
parent_category_id: string (foreign key to categories.id, nullable)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- slug (unique)
- display_order
- is_active

---

## 6. PRODUCT MODEL

```
products
```

```
id: string (UUID, Primary Key)
name: string (indexed)
slug: string (unique, indexed)
description: text
category_id: string (foreign key to categories.id, indexed)
images: json (array of URLs)
base_price: decimal (10, 2)
currency: string (default: USD)
preparation_time: integer (minutes, default: 5)
calories: integer (nullable)
rating: decimal (2, 1, nullable)
total_reviews: integer (default: 0)
is_available: boolean (default: true)
is_featured: boolean (default: false)
is_best_selling: boolean (default: false)
allergens: json (array of strings)
tags: json (array of strings)
nutritional_info: json
  - protein: integer
  - carbohydrates: integer
  - fat: integer
  - caffeine: integer
display_order: integer (default: 0)
created_at: timestamp
updated_at: timestamp
deleted_at: timestamp (nullable, soft delete)
```

**Indexes:**
- slug (unique)
- name
- category_id
- is_available
- is_featured
- is_best_selling
- created_at

---

## 7. PRODUCT CUSTOMIZATION MODEL

```
product_customizations
```

```
id: string (UUID, Primary Key)
product_id: string (foreign key to products.id, indexed)
customization_type: string (enum: size, sugar_level, ice_level, coffee_level)
options: json
  - id: string
  - name: string
  - price_modifier: decimal
  - is_default: boolean
is_required: boolean (default: false)
display_order: integer (default: 0)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- product_id
- customization_type

---

## 8. ADD-ON MODEL

```
add_ons
```

```
id: string (UUID, Primary Key)
name: string
description: text (nullable)
price: decimal (10, 2)
category: string (enum: syrup, topping, extra_shot, dessert)
image_url: string (nullable)
is_available: boolean (default: true)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- is_available
- category

---

## 9. PRODUCT ADD-ONS MODEL (Junction Table)

```
product_add_ons
```

```
id: string (UUID, Primary Key)
product_id: string (foreign key to products.id, indexed)
add_on_id: string (foreign key to add_ons.id, indexed)
is_default: boolean (default: false)
created_at: timestamp
```

**Indexes:**
- product_id
- add_on_id
- Composite unique index on (product_id, add_on_id)

---

## 10. STORE INVENTORY MODEL

```
store_inventory
```

```
id: string (UUID, Primary Key)
store_id: string (foreign key to stores.id, indexed)
product_id: string (foreign key to products.id, indexed)
is_available: boolean (default: true)
stock_quantity: integer (nullable, for tracking)
out_of_stock_until: timestamp (nullable)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- store_id
- product_id
- Composite unique index on (store_id, product_id)
- is_available

---

## 11. CART MODEL

```
carts
```

```
id: string (UUID, Primary Key)
user_id: string (foreign key to users.id, indexed)
store_id: string (foreign key to stores.id, indexed)
subtotal: decimal (10, 2, default: 0.00)
discount: decimal (10, 2, default: 0.00)
tax: decimal (10, 2, default: 0.00)
total: decimal (10, 2, default: 0.00)
promo_code: string (nullable)
pickup_time: timestamp (nullable)
status: string (enum: active, checked_out, abandoned, default: active)
created_at: timestamp
updated_at: timestamp
expires_at: timestamp (nullable)
```

**Indexes:**
- user_id (unique for active carts)
- store_id
- status
- expires_at

---

## 12. CART ITEM MODEL

```
cart_items
```

```
id: string (UUID, Primary Key)
cart_id: string (foreign key to carts.id, indexed)
product_id: string (foreign key to products.id, indexed)
quantity: integer (default: 1)
customization: json
  - size: string
  - sugar_level: string
  - ice_level: string
  - coffee_level: string
add_ons: json (array of add_on_ids)
notes: text (nullable)
unit_price: decimal (10, 2)
total_price: decimal (10, 2)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- cart_id
- product_id

---

## 13. ORDER MODEL

```
orders
```

```
id: string (UUID, Primary Key)
order_number: string (unique, indexed)
user_id: string (foreign key to users.id, indexed)
store_id: string (foreign key to stores.id, indexed)
status: string (enum: pending_payment, confirmed, preparing, ready, picked_up, completed, cancelled)
payment_status: string (enum: pending, processing, completed, failed, refunded)
payment_method: string (enum: aba, acleda, wing, cash)
payment_provider_transaction_id: string (nullable, indexed)
subtotal: decimal (10, 2)
discount: decimal (10, 2, default: 0.00)
tax: decimal (10, 2)
delivery_fee: decimal (10, 2, default: 0.00)
total: decimal (10, 2)
currency: string (default: USD)
promo_code_id: string (foreign key to promo_codes.id, nullable)
loyalty_points_used: integer (default: 0)
loyalty_points_earned: integer (default: 0)
pickup_time: timestamp
estimated_ready_time: timestamp (nullable)
actual_ready_time: timestamp (nullable)
picked_up_at: timestamp (nullable)
notes: text (nullable)
cancellation_reason: text (nullable)
cancelled_by: string (enum: customer, store, system, nullable)
refund_amount: decimal (10, 2, nullable)
refund_status: string (enum: pending, processing, completed, failed, nullable)
created_at: timestamp
updated_at: timestamp
completed_at: timestamp (nullable)
cancelled_at: timestamp (nullable)
```

**Indexes:**
- order_number (unique)
- user_id
- store_id
- status
- payment_status
- payment_provider_transaction_id
- created_at

---

## 14. ORDER ITEM MODEL

```
order_items
```

```
id: string (UUID, Primary Key)
order_id: string (foreign key to orders.id, indexed)
product_id: string (foreign key to products.id, indexed)
product_name: string (snapshot)
product_image: string (snapshot)
quantity: integer
customization: json
  - size: string
  - sugar_level: string
  - ice_level: string
  - coffee_level: string
add_ons: json (array of {id, name, price})
notes: text (nullable)
unit_price: decimal (10, 2)
total_price: decimal (10, 2)
created_at: timestamp
```

**Indexes:**
- order_id
- product_id

---

## 15. ORDER STATUS HISTORY MODEL

```
order_status_history
```

```
id: string (UUID, Primary Key)
order_id: string (foreign key to orders.id, indexed)
status: string
notes: text (nullable)
changed_by: string (enum: system, customer, store, admin)
created_at: timestamp
```

**Indexes:**
- order_id
- created_at

---

## 16. FAVORITE MODEL

```
favorites
```

```
id: string (UUID, Primary Key)
user_id: string (foreign key to users.id, indexed)
product_id: string (foreign key to products.id, indexed)
created_at: timestamp
```

**Indexes:**
- user_id
- product_id
- Composite unique index on (user_id, product_id)

---

## 17. REVIEW MODEL

```
reviews
```

```
id: string (UUID, Primary Key)
order_id: string (foreign key to orders.id, indexed)
user_id: string (foreign key to users.id, indexed)
store_id: string (foreign key to stores.id, indexed)
rating: integer (1-5)
review_text: text (nullable)
images: json (array of URLs, nullable)
is_verified_purchase: boolean (default: true)
helpful_count: integer (default: 0)
status: string (enum: pending, approved, rejected, default: pending)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- order_id (unique)
- user_id
- store_id
- status
- created_at

---

## 18. PRODUCT REVIEW MODEL

```
product_reviews
```

```
id: string (UUID, Primary Key)
review_id: string (foreign key to reviews.id, indexed)
product_id: string (foreign key to products.id, indexed)
rating: integer (1-5)
created_at: timestamp
```

**Indexes:**
- review_id
- product_id

---

## 19. PROMO CODE MODEL

```
promo_codes
```

```
id: string (UUID, Primary Key)
code: string (unique, indexed)
title: string
description: text
discount_type: string (enum: percentage, fixed_amount, free_delivery)
discount_value: decimal (10, 2)
min_order_amount: decimal (10, 2, nullable)
max_discount_amount: decimal (10, 2, nullable)
usage_limit_total: integer (nullable)
usage_limit_per_user: integer (nullable)
usage_count: integer (default: 0)
valid_from: timestamp
valid_until: timestamp
applicable_products: json (array of product_ids, nullable)
applicable_categories: json (array of category_ids, nullable)
applicable_stores: json (array of store_ids, nullable)
user_tier_required: string (enum: bronze, silver, gold, platinum, nullable)
is_active: boolean (default: true)
terms_and_conditions: text (nullable)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- code (unique)
- valid_from, valid_until
- is_active

---

## 20. PROMO CODE USAGE MODEL

```
promo_code_usage
```

```
id: string (UUID, Primary Key)
promo_code_id: string (foreign key to promo_codes.id, indexed)
user_id: string (foreign key to users.id, indexed)
order_id: string (foreign key to orders.id, indexed)
discount_amount: decimal (10, 2)
used_at: timestamp
```

**Indexes:**
- promo_code_id
- user_id
- order_id (unique)
- used_at

---

## 21. ANNOUNCEMENT MODEL

```
announcements
```

```
id: string (UUID, Primary Key)
title: string
description: text
image_url: string (nullable)
action_type: string (enum: promo_code, deep_link, external_url, none, nullable)
action_value: string (nullable)
priority: integer (default: 0)
target_audience: string (enum: all, new_users, loyal_users, specific_tier)
user_tier_filter: json (array of tiers, nullable)
start_date: timestamp
end_date: timestamp
is_active: boolean (default: true)
view_count: integer (default: 0)
click_count: integer (default: 0)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- start_date, end_date
- is_active
- priority

---

## 22. NOTIFICATION MODEL

```
notifications
```

```
id: string (UUID, Primary Key)
user_id: string (foreign key to users.id, indexed)
type: string (enum: order_status, promotion, announcement, system)
title: string
message: text
image_url: string (nullable)
action_type: string (enum: order_details, promotion, external_url, none, nullable)
action_value: string (nullable)
priority: string (enum: low, medium, high, default: medium)
is_read: boolean (default: false)
read_at: timestamp (nullable)
created_at: timestamp
```

**Indexes:**
- user_id
- type
- is_read
- created_at

---

## 23. DEVICE TOKEN MODEL

```
device_tokens
```

```
id: string (UUID, Primary Key)
user_id: string (foreign key to users.id, indexed)
fcm_token: string (unique, indexed)
device_id: string (nullable)
device_type: string (enum: ios, android)
device_model: string (nullable)
os_version: string (nullable)
app_version: string (nullable)
is_active: boolean (default: true)
last_used_at: timestamp
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- user_id
- fcm_token (unique)
- is_active

---

## 24. LOYALTY POINT TRANSACTION MODEL

```
loyalty_point_transactions
```

```
id: string (UUID, Primary Key)
user_id: string (foreign key to users.id, indexed)
transaction_type: string (enum: earned, redeemed, expired, adjusted)
amount: integer (can be negative)
balance_after: integer
description: text
order_id: string (foreign key to orders.id, nullable, indexed)
reward_id: string (foreign key to rewards.id, nullable, indexed)
expires_at: timestamp (nullable)
created_at: timestamp
```

**Indexes:**
- user_id
- order_id
- reward_id
- transaction_type
- created_at

---

## 25. REWARD MODEL

```
rewards
```

```
id: string (UUID, Primary Key)
name: string
description: text
points_required: integer
category: string (enum: beverage, food, discount, merchandise)
image_url: string (nullable)
reward_type: string (enum: free_product, discount_percentage, discount_fixed, free_delivery)
reward_value: decimal (10, 2, nullable)
product_id: string (foreign key to products.id, nullable)
validity_days: integer (default: 30)
usage_limit: integer (nullable)
terms_and_conditions: text (nullable)
is_active: boolean (default: true)
display_order: integer (default: 0)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- is_active
- display_order
- points_required

---

## 26. REWARD REDEMPTION MODEL

```
reward_redemptions
```

```
id: string (UUID, Primary Key)
user_id: string (foreign key to users.id, indexed)
reward_id: string (foreign key to rewards.id, indexed)
reward_code: string (unique, indexed)
points_used: integer
status: string (enum: active, used, expired, cancelled)
order_id: string (foreign key to orders.id, nullable, indexed)
redeemed_at: timestamp
expires_at: timestamp
used_at: timestamp (nullable)
created_at: timestamp
```

**Indexes:**
- user_id
- reward_id
- reward_code (unique)
- order_id
- status
- expires_at

---

## 27. SUPPORT TICKET MODEL

```
support_tickets
```

```
id: string (UUID, Primary Key)
ticket_number: string (unique, indexed)
user_id: string (foreign key to users.id, indexed)
subject: string
category: string (enum: payment, order, account, technical, other)
priority: string (enum: low, medium, high, urgent, default: medium)
status: string (enum: open, in_progress, resolved, closed)
order_id: string (foreign key to orders.id, nullable, indexed)
assigned_to: string (foreign key to users.id for support staff, nullable)
created_at: timestamp
updated_at: timestamp
resolved_at: timestamp (nullable)
closed_at: timestamp (nullable)
```

**Indexes:**
- ticket_number (unique)
- user_id
- order_id
- status
- created_at

---

## 28. SUPPORT MESSAGE MODEL

```
support_messages
```

```
id: string (UUID, Primary Key)
ticket_id: string (foreign key to support_tickets.id, indexed)
sender_id: string (foreign key to users.id, indexed)
sender_type: string (enum: customer, support, system)
message: text
attachments: json (array of URLs, nullable)
is_internal: boolean (default: false)
created_at: timestamp
```

**Indexes:**
- ticket_id
- sender_id
- created_at

---

## 29. FAQ MODEL

```
faqs
```

```
id: string (UUID, Primary Key)
category: string (enum: orders, payment, account, general)
question: string
answer: text
display_order: integer (default: 0)
helpful_count: integer (default: 0)
not_helpful_count: integer (default: 0)
is_active: boolean (default: true)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- category
- display_order
- is_active

---

## 30. FEEDBACK MODEL

```
feedback
```

```
id: string (UUID, Primary Key)
user_id: string (foreign key to users.id, indexed)
type: string (enum: bug_report, feature_request, general_feedback)
title: string
description: text
rating: integer (1-5, nullable)
device_info: json
  - os: string
  - os_version: string
  - app_version: string
  - device_model: string
attachments: json (array of URLs, nullable)
status: string (enum: new, in_review, resolved, dismissed)
admin_notes: text (nullable)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- user_id
- type
- status
- created_at

---

## 31. APP CONFIG MODEL

```
app_configs
```

```
id: string (UUID, Primary Key)
config_key: string (unique, indexed)
config_value: json
description: text (nullable)
is_active: boolean (default: true)
created_at: timestamp
updated_at: timestamp
```

**Indexes:**
- config_key (unique)

---

## 32. ANALYTICS EVENT MODEL

```
analytics_events
```

```
id: string (UUID, Primary Key)
user_id: string (foreign key to users.id, nullable, indexed)
event_type: string (indexed)
properties: json
device_info: json
  - platform: string
  - device_id: string
  - app_version: string
session_id: string (indexed, nullable)
ip_address: string (nullable)
created_at: timestamp
```

**Indexes:**
- user_id
- event_type
- session_id
- created_at (partitioned by month)

---

## RELATIONSHIPS SUMMARY

```
User (1) -> (Many) Orders
User (1) -> (Many) Reviews
User (1) -> (Many) Favorites
User (1) -> (Many) Notifications
User (1) -> (Many) DeviceTokens
User (1) -> (Many) LoyaltyPointTransactions
User (1) -> (Many) RewardRedemptions
User (1) -> (Many) SupportTickets
User (1) -> (1) Cart

Store (1) -> (Many) Orders
Store (1) -> (Many) StoreInventory
Store (1) -> (Many) Reviews

Category (1) -> (Many) Products
Category (1) -> (Many) Categories (self-referencing for subcategories)

Product (1) -> (Many) CartItems
Product (1) -> (Many) OrderItems
Product (1) -> (Many) Favorites
Product (1) -> (Many) ProductCustomizations
Product (Many) -> (Many) AddOns (through ProductAddOns)
Product (1) -> (Many) StoreInventory

Order (1) -> (Many) OrderItems
Order (1) -> (Many) OrderStatusHistory
Order (1) -> (1) Review

PromoCode (1) -> (Many) PromoCodeUsage
PromoCode (1) -> (Many) Orders

Reward (1) -> (Many) RewardRedemptions
Reward (1) -> (Many) LoyaltyPointTransactions

SupportTicket (1) -> (Many) SupportMessages
```

---

## TOTAL MODELS: 32

1. Users
2. OTPs
3. RefreshTokens
4. Stores
5. Categories
6. Products
7. ProductCustomizations
8. AddOns
9. ProductAddOns
10. StoreInventory
11. Carts
12. CartItems
13. Orders
14. OrderItems
15. OrderStatusHistory
16. Favorites
17. Reviews
18. ProductReviews
19. PromoCodes
20. PromoCodeUsage
21. Announcements
22. Notifications
23. DeviceTokens
24. LoyaltyPointTransactions
25. Rewards
26. RewardRedemptions
27. SupportTickets
28. SupportMessages
29. FAQs
30. Feedback
31. AppConfigs
32. AnalyticsEvents