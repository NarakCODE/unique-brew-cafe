# Product API Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYERS                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  1. COMPONENTS LAYER (UI)                                        │
│  ─────────────────────────────────────────────────────────────  │
│  • ProductsPage.tsx         - List products with filters         │
│  • SearchPage.tsx           - Search products                    │
│  • ProductDetailPage.tsx    - Single product with customizations │
│  • AdminPanel.tsx           - Admin CRUD operations              │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. HOOKS LAYER (State Management)                               │
│  ─────────────────────────────────────────────────────────────  │
│  PUBLIC HOOKS:                                                   │
│  • useProducts()             - Get paginated product list        │
│  • useSearchProducts()       - Search products                   │
│  • useProduct()              - Get single product by ID          │
│  • useProductBySlug()        - Get product by slug               │
│  • useProductCustomizations() - Get customizations              │
│  • useProductAddOns()        - Get add-ons                       │
│                                                                  │
│  ADMIN HOOKS:                                                    │
│  • useCreateProduct()        - Create new product                │
│  • useUpdateProduct()        - Update product                    │
│  • useDeleteProduct()        - Delete product                    │
│  • useUpdateProductStatus()  - Toggle availability               │
│  • useDuplicateProduct()     - Duplicate product                 │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. API CLIENT LAYER (HTTP)                                      │
│  ─────────────────────────────────────────────────────────────  │
│  api.products.*                                                  │
│  • list()                    → GET    /products                  │
│  • search()                  → GET    /products/search           │
│  • get()                     → GET    /products/:id              │
│  • getBySlug()              → GET    /products/slug/:slug        │
│  • getCustomizations()      → GET    /products/:id/customizations│
│  • getAddOns()              → GET    /products/:id/addons        │
│  • create()                 → POST   /products                   │
│  • update()                 → PATCH  /products/:id               │
│  • delete()                 → DELETE /products/:id               │
│  • updateStatus()           → PATCH  /products/:id/status        │
│  • duplicate()              → POST   /products/:id/duplicate     │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. API CONFIG LAYER (Endpoints)                                 │
│  ─────────────────────────────────────────────────────────────  │
│  apiConfig.endpoints.products.*                                  │
│  • Endpoint path definitions                                     │
│  • Base URL configuration                                        │
│  • Timeout & retry settings                                      │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. TYPE DEFINITIONS                                             │
│  ─────────────────────────────────────────────────────────────  │
│  • Product                   - Main product interface            │
│  • CreateProductData         - Create DTO                        │
│  • UpdateProductData         - Update DTO                        │
│  • ProductCustomization      - Customization interface           │
│  • CustomizationOption       - Option interface                  │
│  • ProductAddOnsResponse     - Add-ons response                  │
│  • PaginatedResponse<T>      - Generic pagination wrapper        │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│  ─────────────────────────────────────────────────────────────  │
│  /api/products/* (Express Routes)                                │
└─────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                        DATA FLOW EXAMPLE
═══════════════════════════════════════════════════════════════════

USER CLICKS "Search for Coffee"
       ↓
┌──────────────────────────────────────────────────┐
│ SearchPage Component                             │
│ ──────────────────────────────────────────────── │
│ const { data } = useSearchProducts({             │
│   q: "coffee",                                   │
│   page: 1,                                       │
│   limit: 20                                      │
│ });                                              │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ useSearchProducts Hook                           │
│ ──────────────────────────────────────────────── │
│ • Creates React Query                            │
│ • Manages loading/error states                   │
│ • Handles caching                                │
│ • Calls api.products.search()                    │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ api.products.search()                            │
│ ──────────────────────────────────────────────── │
│ • Builds query string                            │
│ • Calls apiClient.getPaginated()                 │
│ • Returns Promise<PaginatedResponse<Product>>    │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ HTTP Request                                     │
│ ──────────────────────────────────────────────── │
│ GET /api/products/search?q=coffee&page=1&limit=20│
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ Backend API Response                             │
│ ──────────────────────────────────────────────── │
│ {                                                │
│   success: true,                                 │
│   data: [...],                                   │
│   pagination: { ... }                            │
│ }                                                │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ React Query Cache                                │
│ ──────────────────────────────────────────────── │
│ • Stores response                                │
│ • Updates component                              │
│ • Shows results to user                          │
└──────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                    MUTATION FLOW EXAMPLE
═══════════════════════════════════════════════════════════════════

ADMIN CREATES NEW PRODUCT
       ↓
┌──────────────────────────────────────────────────┐
│ CreateProductForm Component                      │
│ ──────────────────────────────────────────────── │
│ const createProduct = useCreateProduct();        │
│ createProduct.mutate(productData);               │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ useCreateProduct Hook                            │
│ ──────────────────────────────────────────────── │
│ • Calls api.products.create()                    │
│ • Shows loading state                            │
│ • On success:                                    │
│   - Invalidates product queries                  │
│   - Shows success toast                          │
│ • On error:                                      │
│   - Shows error toast                            │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ api.products.create()                            │
│ ──────────────────────────────────────────────── │
│ • Calls apiClient.post()                         │
│ • Handles FormData or JSON                       │
│ • Returns Promise<Product>                       │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ HTTP Request                                     │
│ ──────────────────────────────────────────────── │
│ POST /api/products                               │
│ Authorization: Bearer <token>                    │
│ Body: { name, slug, description, ... }           │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ Backend Validation & Processing                  │
│ ──────────────────────────────────────────────── │
│ • Authenticate user                              │
│ • Authorize admin role                           │
│ • Validate product data                          │
│ • Create in database                             │
│ • Return created product                         │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ Success Handler                                  │
│ ──────────────────────────────────────────────── │
│ • queryClient.invalidateQueries()                │
│ • toast.success("Product created")               │
│ • All product lists auto-refresh                 │
└──────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                      AUTHENTICATION FLOW
═══════════════════════════════════════════════════════════════════

PUBLIC ENDPOINTS (No Auth)
  GET /products
  GET /products/search
  GET /products/:id
  GET /products/slug/:slug
  GET /products/:id/customizations
  GET /products/:id/addons

ADMIN ENDPOINTS (Auth + Role Check)
  POST   /products                    ← Requires: authenticate + authorize(['admin'])
  PATCH  /products/:id                ← Requires: authenticate + authorize(['admin'])
  DELETE /products/:id                ← Requires: authenticate + authorize(['admin'])
  PATCH  /products/:id/status         ← Requires: authenticate + authorize(['admin'])
  POST   /products/:id/duplicate      ← Requires: authenticate + authorize(['admin'])


═══════════════════════════════════════════════════════════════════
                         CACHING STRATEGY
═══════════════════════════════════════════════════════════════════

React Query Keys:
  ["products", "list", { page, limit, ... }]     → Product lists
  ["products", "search", { q, page, ... }]       → Search results
  ["products", "detail", productId]              → Single product
  ["products", "slug", slug]                     → Product by slug
  ["products", "customizations", productId]      → Customizations
  ["products", "addons", productId]              → Add-ons

Cache Invalidation:
  On Create  → Invalidate all "list" queries
  On Update  → Invalidate "list" + specific "detail" query
  On Delete  → Invalidate all "list" queries
  On Status  → Invalidate "list" + specific "detail" query
  On Duplicate → Invalidate all "list" queries
```
