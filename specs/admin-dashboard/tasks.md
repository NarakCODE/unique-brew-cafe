# Implementation Plan

## Phase 1: Project Setup and Core Infrastructure

-   [x] 1. Initialize Next.js 15 project with TypeScript

    -   [x] 1.1 Create Next.js 15 project in frontend directory

        -   Initialize with `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir`
        -   Configure TypeScript strict mode in tsconfig.json
        -   Set up path aliases (@/) for clean imports
        -   _Requirements: 15.1_

    -   [x] 1.2 Install and configure core dependencies

        -   Install React Query (TanStack Query), Zustand, Axios
        -   Install shadcn/ui CLI and initialize
        -   Install React Hook Form, Zod, date-fns, Recharts
        -   Install TanStack Table for data tables
        -   Install Lucide React for icons
        -   _Requirements: 15.2, 15.3, 15.5_

    -   [x] 1.3 Configure Tailwind CSS and shadcn/ui

        -   Initialize shadcn/ui with `npx shadcn@latest init`
        -   Configure components.json for shadcn/ui
        -   Create CSS variables for theming (dark/light mode)
        -   _Requirements: 15.6, 13.4_

    -   [x] 1.4 Set up project directory structure

        -   Create folders: lib (api, utils), components (ui, layout, common, charts, forms), hooks, store, types
        -   Set up app router structure with route groups: (auth), (dashboard)
        -   _Requirements: 15.1_

-   [ ] 2. Implement API client and type definitions

    -   [ ] 2.1 Create API client with fetch and Axios
        -   Create server-side fetch wrapper for Server Components
        -   Create Axios instance for Client Components with interceptors
        -   Add request interceptor for Authorization header
        -   Add response interceptor for token refresh on 401
        -   _Requirements: 14.4, 14.6_
    -   [ ]\* 2.2 Write property test for Authorization header inclusion
        -   **Property 20: Authorization Header Inclusion**
        -   **Validates: Requirements 14.4**
    -   [ ] 2.3 Create TypeScript type definitions
        -   Define User, Store, Product, Category, Order types
        -   Define Notification, Announcement, SupportTicket types
        -   Define API response types (ApiResponse, PaginatedResponse, ApiError)
        -   _Requirements: 15.1_
    -   [ ] 2.4 Create API endpoint modules
        -   Create auth.ts, stores.ts, products.ts, categories.ts
        -   Create orders.ts, users.ts, notifications.ts, announcements.ts
        -   Create support.ts, reports.ts, config.ts
        -   _Requirements: 15.1_

-   -   [x] 3.  Implement authentication system

    -   [x] 3.1 Create auth store with Zustand
        -   Implement AuthState interface with user, tokens, loading, error
        -   Implement login, logout, refreshAccessToken actions
        -   Implement secure token storage (cookies for SSR compatibility)
        -   _Requirements: 1.2, 1.5, 14.3_
    -   [x] 3.2 Write property test for token storage and cleanup
        -   **Property 1: Authentication Token Storage and Cleanup**
        -   **Validates: Requirements 1.2, 1.5**
    -   [x] 3.3 Create AuthProvider client component
        -   Wrap application with auth context
        -   Provide user, isAuthenticated, login, logout, hasRole
        -   Handle initial auth state restoration from cookies
        -   _Requirements: 1.2, 1.3_
    -   [x] 3.4 Create Next.js middleware for route protection
        -   Check authentication status via cookies/tokens
        -   Redirect to login if not authenticated
        -   Check role-based access and redirect to unauthorized page
        -   _Requirements: 4.6, 14.2_
    -   [x] 3.5 Write property test for protected route authorization
        -   **Property 4: Protected Route Authorization**
        -   **Validates: Requirements 4.6**
    -   [x] 3.6 Implement error message sanitization for auth failures
        -   Create sanitizeErrorMessage utility
        -   Ensure error messages don't reveal credential specifics
        -   _Requirements: 1.4_
    -   [x] 3.7 Write property test for authentication error message safety
        -   **Property 2: Authentication Error Message Safety**
        -   **Validates: Requirements 1.4**

-   [ ] 4. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 2: Layout and Core UI Components

-   [x] 5. Create layout components

    -   [x] 5.1 Create dashboard layout.tsx
        -   Implement responsive sidebar with collapsible navigation
        -   Create header with user menu and notifications
        -   Add main content area with breadcrumbs
        -   Use Server Component for layout shell, Client Components for interactive parts
        -   _Requirements: 13.1_
    -   [x] 5.2 Create Sidebar client component with navigation
        -   Define navigation items with icons and roles using next/link
        -   Implement active state highlighting with usePathname
        -   Support nested navigation items
        -   _Requirements: 13.1, 13.2_
    -   [x] 5.3 Create Header client component
        -   Display user avatar and name
        -   Add logout button and settings dropdown
        -   Implement mobile menu toggle
        -   _Requirements: 1.5, 13.1_

-   [x] 6. Install and configure shadcn/ui components

    -   [x] 6.1 Add essential UI components
        -   Add Button, Input, Label, Card components
        -   Add Dialog, DropdownMenu, Select components
        -   Add Table, Tabs, Toast components
        -   Add Badge, Avatar, Skeleton components
        -   _Requirements: 15.2_
    -   [x] 6.2 Create common utility components
        -   Create LoadingSpinner component
        -   Create ErrorBoundary component
        -   Create ConfirmDialog component
        -   Create StatusBadge component
        -   _Requirements: 13.5, 13.6_
    -   [ ]\* 6.3 Write property test for loading state display
        -   **Property 18: Loading State Display**
        -   **Validates: Requirements 13.5**

-   [x] 7. Create DataTable component

    -   [x] 7.1 Implement DataTable client component with TanStack Table
        -   Support column definitions with sorting
        -   Implement pagination controls
        -   Add row selection capability
        -   _Requirements: 3.1, 5.1, 6.1, 7.1_
    -   [x] 7.2 Write property test for data table rendering consistency
        -   **Property 5: Data Table Rendering Consistency**
        -   **Validates: Requirements 3.1, 5.1, 6.1, 7.1**
    -   [x] 7.3 Add filtering and search to DataTable
        -   Implement column filters
        -   Add global search input with debounce
        -   Support filter by status, date range
        -   _Requirements: 3.7, 5.7, 6.6, 7.5_
    -   [x] 7.4 Write property test for filter result subset
        -   **Property 8: Filter Result Subset**
        -   **Validates: Requirements 3.7, 5.7, 6.6, 7.5**
    -   [x] 7.5 Write property test for search result relevance
        -   **Property 9: Search Result Relevance**
        -   **Validates: Requirements 3.7, 7.5**
    -   [x] 7.6 Write property test for pagination consistency
        -   **Property 16: Pagination Consistency**
        -   **Validates: Requirements 7.1**

-   [x] 8. Implement theme system

    -   [x] 8.1 Create ThemeProvider with next-themes
        -   Install and configure next-themes for dark/light mode
        -   Persist theme preference automatically
        -   Apply theme class to document root
        -   _Requirements: 13.4_
    -   [x] 8.2 Write property test for theme persistence
        -   **Property 17: Theme Persistence**
        -   **Validates: Requirements 13.4**

-   [x] 9. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 3: Authentication Pages

-   [x] 10. Create authentication pages

    -   [x] 10.1 Create login page at `app/(auth)/login/page.tsx`
        -   Implement login form with email/password
        -   Add form validation with Zod schema
        -   Handle login submission and error display
        -   Use router.push to redirect to dashboard on success
        -   _Requirements: 1.1, 1.2, 1.3, 1.4_
    -   [x] 10.2 Implement session timeout handling
        -   Display warning before session expires (30 min inactivity)
        -   Redirect to login on session expiration
        -   Implement activity tracking for timeout reset
        -   _Requirements: 14.1, 14.2_
    -   [x] 10.3 Write property test for token expiration handling
        -   **Property 19: Token Expiration**
        -   **Validates: Requirements 14.2**
    -   [x] 10.4 Write property test for session expiration redirect
        -   **Property 18: Session Expiration**
        -   **Validates: Requirements 14.1**
    -   [x] 10.5 Create error pages
        -   Create `app/not-found.tsx` (404)
        -   Create `app/(dashboard)/unauthorized/page.tsx` (403)
        -   _Requirements: 4.6_

-   [ ] 11. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 4: Dashboard Overview

-   [ ] 12. Create dashboard home page

    -   [ ] 12.1 Create dashboard page at app/(dashboard)/page.tsx
        -   Fetch initial metrics data in Server Component
        -   Display total orders, revenue, active users in metric cards
        -   Implement metric cards with icons and trends
        -   _Requirements: 2.1_
    -   [ ] 12.2 Create chart client components
        -   Create LineChart for order trends
        -   Create BarChart for revenue analytics
        -   Create PieChart for category distribution
        -   _Requirements: 2.2_
    -   [ ] 12.3 Add recent orders section
        -   Display latest orders with status badges
        -   Link to order detail page using next/link
        -   _Requirements: 2.3_
    -   [ ] 12.4 Add top-selling products section
        -   Display best-selling products with next/image
        -   Show sales count and revenue
        -   _Requirements: 2.4_
    -   [ ] 12.5 Implement auto-refresh for dashboard data
        -   Set up React Query refetch interval (5 minutes) in client component
        -   Show last updated timestamp
        -   _Requirements: 2.5_

-   [ ] 13. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 5: Store Management

-   [ ] 14. Implement store management

    -   [ ] 14.1 Create useStores hook with React Query
        -   Implement CRUD operations for stores
        -   Set up query keys and cache invalidation
        -   _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
    -   [ ] 14.2 Create stores page at app/(dashboard)/stores/page.tsx
        -   Fetch initial store data in Server Component
        -   Pass to DataTable client component
        -   Add create, edit, delete actions
        -   Implement status toggle
        -   _Requirements: 3.1, 3.6, 3.7_
    -   [ ] 14.3 Create StoreForm client component
        -   Implement form with all store fields
        -   Add opening hours configuration
        -   Add features checkboxes (parking, wifi, etc.)
        -   Validate with Zod schema
        -   _Requirements: 3.2, 3.3_
    -   [ ]\* 14.4 Write property test for form pre-population accuracy
        -   **Property 6: Form Pre-population Accuracy**
        -   **Validates: Requirements 3.4, 5.4**
    -   [ ] 14.5 Create store form pages
        -   Create app/(dashboard)/stores/new/page.tsx for create
        -   Create app/(dashboard)/stores/[id]/edit/page.tsx for edit
        -   Load existing store data for edit mode
        -   Handle form submission and navigation with router.push
        -   _Requirements: 3.3, 3.4_
    -   [ ] 14.6 Implement store status toggle
        -   Add toggle switch in table row
        -   Confirm status change with dialog
        -   _Requirements: 3.6_
    -   [ ]\* 14.7 Write property test for status toggle idempotence
        -   **Property 7: Status Toggle Idempotence**
        -   **Validates: Requirements 3.6, 5.6, 7.3**
    -   [ ] 14.8 Implement delete confirmation dialog
        -   Show confirmation before deletion
        -   Display store name in dialog
        -   _Requirements: 3.5_
    -   [ ]\* 14.9 Write property test for delete confirmation requirement
        -   **Property 11: Delete Confirmation Requirement**
        -   **Validates: Requirements 3.5, 4.5**

-   [ ] 15. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 6: Category Management

-   [ ] 16. Implement category management

    -   [ ] 16.1 Create useCategories hook
        -   Implement CRUD operations for categories
        -   Support reordering functionality
        -   _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
    -   [ ] 16.2 Create categories page at app/(dashboard)/categories/page.tsx
        -   Fetch categories in Server Component
        -   Group categories by store in display
        -   Display category name, description, product count
        -   _Requirements: 4.1_
    -   [ ]\* 16.3 Write property test for category store grouping
        -   **Property 10: Category Store Grouping**
        -   **Validates: Requirements 4.1**
    -   [ ] 16.4 Create CategoryForm client component
        -   Implement form with name, description, store selection
        -   Validate with Zod schema
        -   _Requirements: 4.2_
    -   [ ] 16.5 Implement drag-and-drop reordering
        -   Add drag handles to category rows
        -   Save new order on drop
        -   _Requirements: 4.3, 4.4_
    -   [ ] 16.6 Implement category deletion with warning
        -   Show warning about associated products
        -   Require confirmation before deletion
        -   _Requirements: 4.5_

-   [ ] 17. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 7: Product Management

-   [ ] 18. Implement product management

    -   [ ] 18.1 Create useProducts hook
        -   Implement CRUD operations for products
        -   Support filtering by category, availability, featured
        -   _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
    -   [ ] 18.2 Create products page at app/(dashboard)/products/page.tsx
        -   Fetch products in Server Component
        -   Display products with next/image, name, price, status
        -   Add filter controls for category, availability, featured
        -   _Requirements: 5.1, 5.7_
    -   [ ] 18.3 Create ProductForm client component (multi-step)
        -   Step 1: Basic details (name, description, category, price)
        -   Step 2: Images with preview
        -   Step 3: Customizations and add-ons
        -   _Requirements: 5.2, 5.3, 5.4_
    -   [ ] 18.4 Create ImageUpload client component with preview
        -   Support multiple image upload
        -   Show image previews before submission
        -   Allow image removal
        -   _Requirements: 5.3_
    -   [ ]\* 18.5 Write property test for image upload preview
        -   **Property 13: Image Upload Preview**
        -   **Validates: Requirements 5.3**
    -   [ ] 18.6 Implement product duplication
        -   Add duplicate action to product row
        -   Create copy with "(Copy)" suffix
        -   _Requirements: 5.5_
    -   [ ]\* 18.7 Write property test for product duplication naming
        -   **Property 12: Product Duplication Naming**
        -   **Validates: Requirements 5.5**
    -   [ ] 18.8 Implement product availability toggle
        -   Add toggle in table row
        -   Update via API on change
        -   _Requirements: 5.6_

-   [ ] 19. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 8: Order Management

-   [ ] 20. Implement order management

    -   [ ] 20.1 Create useOrders hook
        -   Implement order listing with filters
        -   Support status updates and notes
        -   _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
    -   [ ] 20.2 Create orders page at app/(dashboard)/orders/page.tsx
        -   Fetch orders in Server Component
        -   Display orders with number, customer, status, total
        -   Add filters for status, date range, store
        -   _Requirements: 6.1, 6.6_
    -   [ ] 20.3 Create order detail page at app/(dashboard)/orders/[id]/page.tsx
        -   Fetch order details in Server Component
        -   Display complete order information
        -   Show order items with customizations
        -   Display customer information
        -   Show status history
        -   _Requirements: 6.2_
    -   [ ]\* 20.4 Write property test for order detail completeness
        -   **Property 15: Order Detail Completeness**
        -   **Validates: Requirements 6.2, 7.2**
    -   [ ] 20.5 Implement order status update client component
        -   Create status dropdown with valid transitions
        -   Update status via API
        -   _Requirements: 6.3_
    -   [ ]\* 20.6 Write property test for order status transition validity
        -   **Property 14: Order Status Transition Validity**
        -   **Validates: Requirements 6.3**
    -   [ ] 20.7 Implement internal notes feature
        -   Add notes input field
        -   Save notes via API
        -   _Requirements: 6.4_
    -   [ ] 20.8 Implement receipt PDF download
        -   Generate PDF with order details
        -   Trigger download on button click
        -   _Requirements: 6.5_
    -   [ ] 20.9 Implement real-time order updates
        -   Set up polling for order status changes with React Query
        -   Update UI when status changes
        -   _Requirements: 6.7_

-   [ ] 21. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 9: User Management

-   [ ] 22. Implement user management

    -   [ ] 22.1 Create useUsers hook
        -   Implement user listing with pagination
        -   Support search and status updates
        -   _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
    -   [ ] 22.2 Create users page at app/(dashboard)/users/page.tsx
        -   Fetch users in Server Component
        -   Display users with name, email, status, tier
        -   Add search by name, email, phone
        -   _Requirements: 7.1, 7.5_
    -   [ ] 22.3 Create user detail page at app/(dashboard)/users/[id]/page.tsx
        -   Fetch user details in Server Component
        -   Display user profile information
        -   Show order history
        -   Display loyalty tier and spending
        -   _Requirements: 7.2, 7.6_
    -   [ ] 22.4 Implement user status toggle
        -   Toggle between active and suspended
        -   Show confirmation dialog with reason input for suspension
        -   _Requirements: 7.3, 7.4_

-   [ ] 23. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 10: Announcements and Notifications

-   [ ] 24. Implement announcement management

    -   [ ] 24.1 Create useAnnouncements hook
        -   Implement CRUD operations for announcements
        -   Support scheduling and targeting
        -   _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
    -   [ ] 24.2 Create announcements page at app/(dashboard)/announcements/page.tsx
        -   Fetch announcements in Server Component
        -   Display announcements with status and dates
        -   Show view/click statistics
        -   _Requirements: 8.1, 8.6_
    -   [ ] 24.3 Create AnnouncementForm client component
        -   Add title, content, image upload fields
        -   Add target audience selection
        -   Add scheduling date pickers
        -   _Requirements: 8.2, 8.3, 8.5_
    -   [ ] 24.4 Implement publish/unpublish functionality
        -   Toggle announcement publish status
        -   Update targeted users
        -   _Requirements: 8.4_

-   [ ] 25. Implement notification management

    -   [ ] 25.1 Create useNotifications hook
        -   Implement notification creation and history
        -   Support recipient selection
        -   _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
    -   [ ] 25.2 Create notifications page at app/(dashboard)/notifications/page.tsx
        -   Fetch notification history in Server Component
        -   Display delivery statistics
        -   _Requirements: 9.1, 9.6_
    -   [ ] 25.3 Create NotificationForm client component
        -   Add title and message fields
        -   Add recipient selection (specific user, all, segment)
        -   Show estimated recipient count for broadcasts
        -   _Requirements: 9.2, 9.3, 9.4, 9.5_

-   [ ] 26. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 11: Support Ticket Management

-   [ ] 27. Implement support ticket management

    -   [ ] 27.1 Create useSupport hook
        -   Implement ticket listing and updates
        -   Support message sending
        -   _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
    -   [ ] 27.2 Create tickets page at app/(dashboard)/support/page.tsx
        -   Fetch tickets in Server Component
        -   Display tickets with status and priority badges
        -   Add filters for status, priority, category
        -   _Requirements: 10.1, 10.6_
    -   [ ] 27.3 Create ticket detail page at app/(dashboard)/support/[id]/page.tsx
        -   Fetch ticket details in Server Component
        -   Display conversation thread
        -   Show ticket details and history
        -   _Requirements: 10.2_
    -   [ ] 27.4 Implement ticket response client component
        -   Add message input and send button
        -   Update ticket status on response
        -   _Requirements: 10.3, 10.4_
    -   [ ] 27.5 Implement ticket assignment
        -   Add staff member selection dropdown
        -   Assign ticket via API
        -   _Requirements: 10.5_

-   [ ] 28. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 12: Reports and Analytics

-   [ ] 29. Implement reports and analytics

    -   [ ] 29.1 Create useReports hook
        -   Implement report data fetching
        -   Support date range filtering
        -   _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
    -   [ ] 29.2 Create reports page at app/(dashboard)/reports/page.tsx
        -   Fetch KPI data in Server Component
        -   Display key performance indicators
        -   Add date range picker client component
        -   _Requirements: 11.1, 11.2_
    -   [ ] 29.3 Create sales report page at app/(dashboard)/reports/sales/page.tsx
        -   Display revenue charts by day/week/month
        -   Show order volume trends
        -   Display peak ordering hours
        -   _Requirements: 11.3, 11.6_
    -   [ ] 29.4 Create product performance page at app/(dashboard)/reports/products/page.tsx
        -   Display best and worst selling products
        -   Show product performance metrics
        -   _Requirements: 11.4_
    -   [ ] 29.5 Implement report export functionality
        -   Support CSV, Excel, PDF export formats
        -   Generate and download reports
        -   _Requirements: 11.5_

-   [ ] 30. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 13: System Configuration

-   [ ] 31. Implement system configuration

    -   [ ] 31.1 Create useConfig hook
        -   Implement config fetching and updates
        -   Support delivery zone management
        -   _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
    -   [ ] 31.2 Create settings page at app/(dashboard)/settings/page.tsx
        -   Fetch config in Server Component
        -   Display configurable system parameters
        -   Add edit capabilities for each setting
        -   _Requirements: 12.1, 12.2, 12.6_
    -   [ ] 31.3 Create delivery zones page at app/(dashboard)/settings/delivery-zones/page.tsx
        -   Display delivery zones in a list/map view
        -   Add zone creation form with name, fee, area
        -   _Requirements: 12.3, 12.4_
    -   [ ] 31.4 Implement maintenance mode toggle
        -   Add toggle with confirmation warning
        -   Display current maintenance status
        -   _Requirements: 12.5_

-   [ ] 32. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 14: Accessibility and Error Handling

-   [ ] 33. Implement accessibility features

    -   [ ] 33.1 Add keyboard navigation support
        -   Ensure all interactive elements are focusable
        -   Add proper focus indicators
        -   Support Enter/Space activation
        -   _Requirements: 13.2, 13.3_
    -   [ ]\* 33.2 Write property test for keyboard navigation accessibility
        -   **Property 22: Keyboard Navigation Accessibility**
        -   **Validates: Requirements 13.2**
    -   [ ] 33.3 Add ARIA labels and roles
        -   Add aria-label to icon buttons
        -   Add proper roles to custom components
        -   Ensure screen reader compatibility
        -   _Requirements: 13.3_

-   [ ] 34. Implement error handling

    -   [ ] 34.1 Create error handler utility
        -   Map API error codes to user-friendly messages
        -   Sanitize error messages to hide technical details
        -   _Requirements: 13.6_
    -   [ ]\* 34.2 Write property test for API error user feedback
        -   **Property 19: API Error User Feedback**
        -   **Validates: Requirements 13.6**
    -   [ ] 34.3 Create error.tsx boundary components
        -   Create app/(dashboard)/error.tsx for dashboard errors
        -   Create app/global-error.tsx for root errors
        -   Display user-friendly error page with refresh button
        -   _Requirements: 13.6_

-   [ ] 35. Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.

## Phase 15: Loading States and Final Polish

-   [ ] 36. Implement loading states

    -   [ ] 36.1 Create loading.tsx files for route segments
        -   Create app/(dashboard)/loading.tsx
        -   Create loading.tsx for each major route
        -   Display skeleton loaders during navigation
        -   _Requirements: 13.5, 15.7_
    -   [ ] 36.2 Add Suspense boundaries for streaming
        -   Wrap slow components with Suspense
        -   Display loading spinner during data fetch
        -   _Requirements: 13.5_

-   [ ] 37. Final Checkpoint - Ensure all tests pass
    -   Ensure all tests pass, ask the user if questions arise.
