# Design Document

## Overview

This design document outlines the architecture and implementation approach for the Admin Dashboard frontend application for the Corner Coffee Pickup platform. The dashboard provides a comprehensive administrative interface for managing stores, products, orders, users, and platform configuration, integrating with the existing backend RBAC API system.

### Key Design Principles

1. **Component-Based Architecture**: Reusable, composable UI components following atomic design principles
2. **Type Safety**: Full TypeScript coverage with strict type checking
3. **Server Components First**: Leverage Next.js 15 Server Components for initial data fetching
4. **Client State Management**: React Query for client-side mutations and real-time updates, Zustand for UI state
5. **Form Validation**: Schema-based validation with Zod for runtime type safety
6. **Responsive Design**: Mobile-first approach with Tailwind CSS
7. **Accessibility First**: WCAG 2.1 AA compliance built into components
8. **Performance Optimization**: Automatic code splitting, streaming, and partial prerendering

### Technology Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **React**: React 19 (bundled with Next.js 15)
- **Routing**: Next.js App Router (file-based routing)
- **State Management**: React Query (TanStack Query) for client mutations, Zustand for UI state
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Native fetch with Next.js caching, Axios for client-side
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Image Optimization**: next/image
- **Testing**: Vitest + React Testing Library + fast-check (property-based testing)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js 15 Application                  │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │           Server Components (RSC)            │    │    │
│  │  │  - Initial data fetching                     │    │    │
│  │  │  - Layout rendering                          │    │    │
│  │  │  - Static content                            │    │    │
│  │  └──────────────────┬──────────────────────────┘    │    │
│  │                     │                               │    │
│  │  ┌──────────────────┴──────────────────────────┐    │    │
│  │  │           Client Components                  │    │    │
│  │  │  ┌─────────────┐  ┌─────────────────────┐   │    │    │
│  │  │  │  Interactive│  │   State Management  │   │    │    │
│  │  │  │     UI      │  │  React Query+Zustand│   │    │    │
│  │  │  └─────────────┘  └─────────────────────┘   │    │    │
│  │  └──────────────────┬──────────────────────────┘    │    │
│  │                     │                               │    │
│  │  ┌──────────────────┴──────────────────────────┐    │    │
│  │  │         Next.js Middleware                   │    │    │
│  │  │  - Auth verification                         │    │    │
│  │  │  - Route protection                          │    │    │
│  │  └──────────────────┬──────────────────────────┘    │    │
│  │                     │                               │    │
│  └─────────────────────┼───────────────────────────────┘    │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                        │
│              (Express.js + MongoDB + RBAC)                   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth route group (no layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/            # Dashboard route group (with layout)
│   │   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   │   ├── page.tsx            # Dashboard home
│   │   │   ├── stores/
│   │   │   │   ├── page.tsx        # Store list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # Create store
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Store detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── announcements/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── support/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── sales/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── products/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       └── delivery-zones/
│   │   │           └── page.tsx
│   │   ├── unauthorized/
│   │   │   └── page.tsx
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── footer.tsx
│   │   ├── common/
│   │   │   ├── data-table.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── confirm-dialog.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── search-input.tsx
│   │   │   ├── date-range-picker.tsx
│   │   │   └── image-upload.tsx
│   │   ├── charts/
│   │   │   ├── line-chart.tsx
│   │   │   ├── bar-chart.tsx
│   │   │   ├── pie-chart.tsx
│   │   │   └── area-chart.tsx
│   │   └── forms/
│   │       ├── store-form.tsx
│   │       ├── product-form.tsx
│   │       ├── category-form.tsx
│   │       ├── announcement-form.tsx
│   │       └── notification-form.tsx
│   ├── lib/
│   │   ├── api/                    # API client and endpoints
│   │   │   ├── client.ts           # Axios instance for client components
│   │   │   ├── server.ts           # Server-side fetch utilities
│   │   │   ├── auth.ts
│   │   │   ├── stores.ts
│   │   │   ├── products.ts
│   │   │   ├── categories.ts
│   │   │   ├── orders.ts
│   │   │   ├── users.ts
│   │   │   ├── notifications.ts
│   │   │   ├── announcements.ts
│   │   │   ├── support.ts
│   │   │   ├── reports.ts
│   │   │   └── config.ts
│   │   ├── utils/
│   │   │   ├── cn.ts               # Class name utility
│   │   │   ├── formatters.ts       # Date, currency formatters
│   │   │   ├── validators.ts       # Zod schemas
│   │   │   └── constants.ts        # App constants
│   │   └── auth/
│   │       ├── session.ts          # Session management
│   │       └── cookies.ts          # Cookie utilities
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-stores.ts
│   │   ├── use-products.ts
│   │   ├── use-categories.ts
│   │   ├── use-orders.ts
│   │   ├── use-users.ts
│   │   ├── use-notifications.ts
│   │   ├── use-announcements.ts
│   │   ├── use-support.ts
│   │   ├── use-reports.ts
│   │   ├── use-config.ts
│   │   └── use-debounce.ts
│   ├── providers/
│   │   ├── query-provider.tsx      # React Query provider (client)
│   │   ├── theme-provider.tsx      # Theme provider (client)
│   │   └── toast-provider.tsx      # Toast provider (client)
│   ├── store/
│   │   ├── auth-store.ts           # Zustand auth store
│   │   ├── ui-store.ts             # Zustand UI store
│   │   └── index.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── store.ts
│   │   ├── product.ts
│   │   ├── category.ts
│   │   ├── order.ts
│   │   ├── user.ts
│   │   ├── notification.ts
│   │   ├── announcement.ts
│   │   ├── support.ts
│   │   └── config.ts
│   └── middleware.ts               # Next.js middleware for auth
├── __tests__/
│   ├── setup.ts
│   ├── utils/
│   │   └── test-utils.tsx
│   ├── unit/
│   │   ├── utils/
│   │   └── hooks/
│   └── property/
│       ├── auth.property.test.ts
│       ├── forms.property.test.ts
│       └── data-table.property.test.ts
├── .env.example
├── .env.local
├── eslint.config.mjs
├── .prettierrc
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Components and Interfaces

### 1. Authentication Components

#### Auth Store (Zustand)

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;
```

#### Auth Provider

```typescript
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}
```

#### Protected Route Component

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}
```

### 2. Layout Components

#### Dashboard Layout

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  children?: SidebarItem[];
  roles?: UserRole[];
}
```

#### Header Component

```typescript
interface HeaderProps {
  onMenuToggle: () => void;
  user: User;
}
```

### 3. Data Table Component

#### DataTable Props

```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: {
    onEdit?: (row: TData) => void;
    onDelete?: (row: TData) => void;
    onView?: (row: TData) => void;
    custom?: Array<{
      label: string;
      icon?: LucideIcon;
      onClick: (row: TData) => void;
    }>;
  };
}
```

### 4. Form Components

#### Store Form

```typescript
interface StoreFormData {
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
  images: File[];
  openingHours: Record<
    string,
    { open: string; close: string; closed?: boolean }
  >;
  features: {
    parking?: boolean;
    wifi?: boolean;
    outdoorSeating?: boolean;
    driveThrough?: boolean;
  };
}

const storeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  phone: z.string().regex(/^\+?[\d\s-]+$/, "Invalid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  // ... additional validation
});
```

#### Product Form

```typescript
interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  images: File[];
  basePrice: number;
  currency: string;
  preparationTime: number;
  calories?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens?: string[];
  tags?: string[];
  customizations: ProductCustomization[];
  addOns: string[];
}
```

### 5. Chart Components

#### Chart Props

```typescript
interface ChartProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  title?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

interface ChartDataPoint {
  [key: string]: string | number;
}
```

## Data Models

### Type Definitions

```typescript
// User Types
interface User {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  role: "user" | "admin" | "moderator";
  status: "active" | "suspended" | "deleted";
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastLoginAt?: string;
}

// Store Types
interface Store {
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
  images: string[];
  openingHours: Record<
    string,
    { open: string; close: string; closed?: boolean }
  >;
  isOpen: boolean;
  isActive: boolean;
  rating?: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

// Product Types
interface Product {
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
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Order Types
interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "completed"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
```

## API Client

### Axios Instance Configuration

```typescript
// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshAccessToken();
        const newToken = useAuthStore.getState().accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### API Endpoint Modules

```typescript
// src/api/stores.ts
import { apiClient } from "./client";
import type { Store, ApiResponse, PaginatedResponse } from "@/types";

export const storesApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<PaginatedResponse<Store>>("/stores", { params }),

  getById: (id: string) => apiClient.get<ApiResponse<Store>>(`/stores/${id}`),

  create: (data: Partial<Store>) =>
    apiClient.post<ApiResponse<Store>>("/stores", data),

  update: (id: string, data: Partial<Store>) =>
    apiClient.put<ApiResponse<Store>>(`/stores/${id}`, data),

  delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/stores/${id}`),

  updateStatus: (id: string, isActive: boolean) =>
    apiClient.patch<ApiResponse<Store>>(`/stores/${id}/status`, { isActive }),
};
```

## React Query Hooks

### Custom Hooks Pattern

```typescript
// src/hooks/useStores.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storesApi } from "@/api/stores";
import { toast } from "@/components/ui/toast";

export const storeKeys = {
  all: ["stores"] as const,
  lists: () => [...storeKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...storeKeys.lists(), filters] as const,
  details: () => [...storeKeys.all, "detail"] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
};

export function useStores(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: storeKeys.list(params || {}),
    queryFn: () => storesApi.getAll(params).then((res) => res.data),
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: storeKeys.detail(id),
    queryFn: () => storesApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      toast({ title: "Store created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create store", variant: "destructive" });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Store> }) =>
      storesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      toast({ title: "Store updated successfully" });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      toast({ title: "Store deleted successfully" });
    },
  });
}
```

## Routing Configuration

### Route Definitions

```typescript
// src/routes/routes.ts
import { lazy } from "react";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const StoresPage = lazy(() => import("@/pages/stores/StoresPage"));
const StoreFormPage = lazy(() => import("@/pages/stores/StoreFormPage"));
// ... other lazy imports

export const routes = [
  {
    path: "/login",
    element: LoginPage,
    public: true,
  },
  {
    path: "/",
    element: DashboardPage,
    roles: ["admin", "moderator"],
  },
  {
    path: "/stores",
    element: StoresPage,
    roles: ["admin"],
  },
  {
    path: "/stores/new",
    element: StoreFormPage,
    roles: ["admin"],
  },
  {
    path: "/stores/:id/edit",
    element: StoreFormPage,
    roles: ["admin"],
  },
  // ... other routes
];
```

### Protected Route Implementation

```typescript
// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "moderator" | "user")[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Based on the prework analysis, the following correctness properties have been identified. Redundant properties have been consolidated where one property can validate multiple related acceptance criteria.

### Property 1: Authentication Token Storage and Cleanup

_For any_ successful authentication with valid credentials, the JWT token SHALL be stored securely, and _for any_ logout action, the token SHALL be completely cleared from storage.

**Validates: Requirements 1.2, 1.5**

### Property 2: Authentication Error Message Safety

_For any_ failed authentication attempt (invalid email, wrong password, non-existent user), the error message displayed SHALL NOT reveal which specific credential was incorrect.

**Validates: Requirements 1.4**

### Property 3: Token Expiration Handling

_For any_ expired JWT token during an active session, the system SHALL either successfully refresh the token OR redirect to the login page, never leaving the user in an undefined state.

**Validates: Requirements 1.6, 14.6**

### Property 4: Protected Route Authorization

_For any_ user with a role not in the allowed roles list for a protected route, navigation to that route SHALL result in redirection to the unauthorized page.

**Validates: Requirements 4.6**

### Property 5: Data Table Rendering Consistency

_For any_ array of data items passed to the DataTable component, the table SHALL render exactly the same number of rows as items in the array (excluding header and pagination).

**Validates: Requirements 3.1, 5.1, 6.1, 7.1**

### Property 6: Form Pre-population Accuracy

_For any_ entity (store, product, category) loaded for editing, all form fields SHALL be pre-populated with values that exactly match the entity's current data.

**Validates: Requirements 3.4, 5.4**

### Property 7: Status Toggle Idempotence

_For any_ entity with a boolean status field (store.isActive, product.isAvailable, user.status), toggling the status twice SHALL return the entity to its original state.

**Validates: Requirements 3.6, 5.6, 7.3**

### Property 8: Filter Result Subset

_For any_ filter applied to a data list, the filtered results SHALL be a subset of the original unfiltered data, and every item in the result SHALL match the filter criteria.

**Validates: Requirements 3.7, 5.7, 6.6, 7.5**

### Property 9: Search Result Relevance

_For any_ search query on a searchable field (name, email, phone), every result returned SHALL contain the search query as a substring (case-insensitive) in at least one of the searchable fields.

**Validates: Requirements 3.7, 7.5**

### Property 10: Category Store Grouping

_For any_ set of categories belonging to multiple stores, the category management view SHALL group categories such that all categories with the same storeId appear together.

**Validates: Requirements 4.1**

### Property 11: Delete Confirmation Requirement

_For any_ delete action on a store, category, or product, a confirmation dialog SHALL be displayed before the deletion is executed.

**Validates: Requirements 3.5, 4.5**

### Property 12: Product Duplication Naming

_For any_ product that is duplicated, the new product's name SHALL equal the original product's name with " (Copy)" appended.

**Validates: Requirements 5.5**

### Property 13: Image Upload Preview

_For any_ image file uploaded through the image upload component, a preview of that image SHALL be displayed before form submission.

**Validates: Requirements 5.3**

### Property 14: Order Status Transition Validity

_For any_ order with a given status, the status update dropdown SHALL only display statuses that are valid transitions from the current status according to the order state machine.

**Validates: Requirements 6.3**

### Property 15: Order Detail Completeness

_For any_ order displayed in the detail view, all order items, customer information, payment details, and status history SHALL be visible.

**Validates: Requirements 6.2, 7.2**

### Property 16: Pagination Consistency

_For any_ paginated data set, navigating through all pages and collecting items SHALL yield exactly the total number of items reported by the pagination metadata.

**Validates: Requirements 7.1**

### Property 17: Theme Persistence

_For any_ theme selection (dark/light), the selected theme SHALL be applied to all components and SHALL persist across page refreshes.

**Validates: Requirements 13.4**

### Property 18: Loading State Display

_For any_ API request initiated by a user action, a loading indicator SHALL be displayed while the request is pending.

**Validates: Requirements 13.5**

### Property 19: API Error User Feedback

_For any_ API error response, a user-friendly error message SHALL be displayed that does not expose technical details or stack traces.

**Validates: Requirements 13.6**

### Property 20: Authorization Header Inclusion

_For any_ API request made while authenticated, the request SHALL include an Authorization header with the format "Bearer {token}".

**Validates: Requirements 14.4**

### Property 21: Session Expiration Redirect

_For any_ expired session (token invalid and refresh failed), the user SHALL be redirected to the login page.

**Validates: Requirements 14.2**

### Property 22: Keyboard Navigation Accessibility

_For any_ interactive element (button, link, input, dropdown), the element SHALL be focusable via keyboard Tab navigation and activatable via Enter or Space key.

**Validates: Requirements 13.2**

## Error Handling

### Error Response Handling

```typescript
// src/utils/errorHandler.ts
import { AxiosError } from "axios";
import { toast } from "@/components/ui/toast";

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiErrorResponse;

    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      AUTH_001: "Invalid credentials. Please try again.",
      AUTH_002: "Your session has expired. Please log in again.",
      AUTH_004: "You do not have permission to perform this action.",
      VAL_001: "Please check your input and try again.",
      RES_001: "The requested resource was not found.",
      RES_002: "This resource already exists.",
      SYS_001: "An unexpected error occurred. Please try again later.",
    };

    const message =
      errorMessages[apiError?.error?.code] ||
      apiError?.error?.message ||
      "An error occurred. Please try again.";

    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });

    return message;
  }

  toast({
    title: "Error",
    description: "An unexpected error occurred.",
    variant: "destructive",
  });

  return "An unexpected error occurred.";
}
```

### Error Boundary Component

```typescript
// src/components/common/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 classNaml font-semibold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            We're sorry, but something unexpected happened.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### Unit Testing

**Scope:**

- Utility functions (formatters, validators, helpers)
- Custom hooks (isolated with mock providers)
- Pure components (presentational components)
- Zod validation schemas

**Tools:**

- Vitest as test runner
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking

**Example Test Structure:**

```typescript
// tests/unit/utils/formatters.test.ts
import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatOrderStatus,
} from "@/utils/formatters";

describe("formatCurrency", () => {
  it("should format USD currency correctly", () => {
    expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
  });

  it("should handle zero values", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });
});
```

### Property-Based Testing

**Library:** fast-check

**Scope:**

- Form validation schemas
- Data transformation functions
- Filter and search logic
- State transitions

**Configuration:**

- Minimum 100 iterations per property test
- Each test tagged with property reference from design document

**Example Property Tests:**

```typescript
// tests/property/auth.property.test.ts
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sanitizeErrorMessage } from '@/utils/errorHandler';

describe('Authentication Properties', () => {
  /**
   * **Feature: admin-dashboard, Property 2: Authentication Error Message Safety**
   * **Validates: Requirements 1.4**
   */
  it('should never reveal specific credential failures in error messages', () => {
    fc.assert(
      fc.property(
        fc.record({
          code: fc.constantFrom('AUTH_001', 'AUTH_INVALID_EMAIL', 'AUTH_WRONG_PASSWORD'),
          message: fc.string(),
        }),
        (errorResponse) => {
          const sanitized = sanitizeErrorMessage(errorResponse);
          expect(sanitized).not.toContain('email');
          expect(sanitized).not.toContain('password');
          expect(sanitized).not.toContain('not found');
          expect(sanitized).not.toContain('incorrect');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// tests/property/data-table.property.test.ts
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterData, searchData } from '@/utils/dataTableHelpers';

describe('DataTable Properties', () => {
  /**
   * **Feature: admin-dashboard, Property 8: Filter Result Subset**
   * **Validates: Requirements 3.7, 5.7, 6.6, 7.5**
   */
  it('filtered results should always be a subset of original data', () => {
    const storeArbitrary = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1 }),
      isActive: fc.boolean(),
      city: fc.string(),
    });

    fc.assert(
      fc.property(
        fc.array(storeArbitrary, { minLength: 0, maxLength: 100 }),
        fc.record({ isActive: fc.boolean() }),
        (stores, filter) => {
          const filtered = filterData(stores, filter);

          // Result is subset
          expect(filtered.length).toBeLessThanOrEqual(stores.length);

          // Every filtered item matches creria
          filtered.forEach(item => {
            expect(item.isActive).toBe(filter.isActive);
          });

          // Every filtered item exists in original
          filtered.forEach(item => {
            expect(stores.some(s => s.id === item.id)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: admin-dashboard, Property 9: Search Result Relevance**
   * **Validates: Requirements 3.7, 7.5**
   */
  it('search results should contain query in searchable fields', () => {
    const userArbitrary = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      email: fc.emailAddress(),
      phone: fc.string({ minLength: 10, maxLength: 15 }),
    });

    fc.assert(
      fc.property(
        fc.array(userArbitrary, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (users, query) => {
          const results = searchData(users, query, ['name', 'email', 'phone']);

          results.forEach(user => {
            const matchesName = user.name.toLowerCase().includes(query.toLowerCase());
            const matchesEmail = user.email.toLowerCase().includes(query.toLo;
            const matchesPhone = user.phone.includes(query);

            expect(matchesName || matchesEmail || matchesPhone).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// tests/property/forms.property.test.ts
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { storeSchema } from '@/utils/validators';

describe('Form Validation Properties', () => {
  /**
   * **Feature: admin-dashboard, Property 6: Form Pre-population Accuracy**
   * **Validates: Requirements 3.4, 5.4**
   */
  it('valid store data should pass validation and round-trip correctly', () => {
    const validStoreArbitrary = fc.record({
      name: fc.string({ minLength: 2, maxLength: 100 }),
      slug: fc.stringMatching(/^[a-z0-9-]{2,50}$/),
      address: fc.string({ minLength: 5, maxLength: 200 }),
      city: fc.string({ minLength: 2, maxLength: 50 }),
      state: fc.string({ minLength: 2, maxLength: 50 }),
      country: fc.string({ minLength: 2, maxLength: 50 }),
      phone: fc.stringMatching(/^\+?[\d\s-]{10,20}$/),
      latitude: fc.double({ min: -90, max: 90 }),
      longitude: fc.double({ min: -180, max: 180 }),
     fc.assert(
      fc.property(validStoreArbitrary, (storeData) => {
        const result = storeSchema.safeParse(storeData);
        if (result.success) {
          // Round-trip: parsed data should equal input
          expect(result.data.name).toBe(storeData.name);
          expect(result.data.slug).toBe(storeData.slug);
          expect(result.data.latitude).toBe(storeData.latitude);
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// tests/property/status-toggle.property.test.ts
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Status Toggle Properties', () => {
  /**
   * **Feature: admin-dashboard, Property 7: Status Toggle Idempotence**
   * **Validates: Requirements 3.6, 5.6, 7.3**
   */
  it('toggling status twice should return to original state', () => {
    fc.assert(
      fc.property(fc.boolean(), (initialStatus) => {
        const toggle = (status: boolean) => !status;

        const afterFirstToggle = toggle(initialStatus);
        const afterSecondToggle = toggle(afterFirstToggle);

        expect(afterSecondToggle).toBe(initialStatus);
      }),
      { numRuns: 100 }
    );
  });
});

// tests/property/product-duplication.property.test.ts
import , it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateDuplicateName } from '@/utils/productHelpers';

describe('Product Duplication Properties', () => {
  /**
   * **Feature: admin-dashboard, Property 12: Product Duplication Naming**
   * **Validates: Requirements 5.5**
   */
  it('duplicated product name should have (Copy) suffix', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (originalName) => {
          const duplicateName = generateDuplicateName(originalName);

          expect(duplicateName).toBe(`${originalName} (Copy)`);
          expect(duplicateName.endsWith(' (Copy)')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Scope:**

- Page-level component rendering
- Form submission flows
- Navigation and routing
- Authentication flows

**Example:**

```typescript
// tests/integration/stores.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoresPage } from "@/pages/stores/StoresPage";
import { TestProviders } from "../utils/test-utils";
import { server } from "../mocks/server";
import { rest } from "msw";

describe("StoresPage", () => {
  it("should display stores in data table", async () => {
    render(<Stoage />, { wrapper: TestProviders });

    await waitFor(() => {
      expect(screen.getByText("Store Management")).toBeInTheDocument();
    });

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("should filter stores by status", async () => {
    const user = userEvent.setup();
    render(<StoresPage />, { wrapper: TestProviders });

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox", { name: /status/i }));
    await user.click(screen.getByRole("option", { name: /active/i }));

    // Verify filter is applied
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      // All visible stores should be active
    });
  });
});
```

### Test Coverage Goals

- Utility functions: 90%+ coverage
- Custom hooks: 80%+ coverage
- Components: 70%+ coverage
- Overall: 75%+ coverage

## Security Considerations

### Token Storage

```typescript
// Secure token storage using httpOnly cookies (preferred) or encrypted localStorage
// For SPA without BFF, use memory + encrypted localStorage with short expiry

const TOKEN_KEY = "admin_access_token";
const REFRESH_KEY = "admiefresh_token";

export const tokenStorage = {
  setTokens: (accessToken: string, refreshToken: string) => {
    // Store in memory for current session
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    // Refresh token in localStorage (encrypted in production)
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  getAccessToken: () => sessionStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),

  clearTokens: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
```

### XSS Prevention

- Use React's built-in XSS protection (JSX escaping)
- Sanitize any user-generated HTML content with DOMPurify
- Set Content-Security-Policy headers

### CSRF Protection

- Include CSRF token in state-changing requests
- Validate Origin/Referer headers on backend

## Performance Optimization

### Code Splitting

```typescript
// Lazy load pages for better initial bundle size
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const StoresPage = lazy(() => import("@/pages/stores/StoresPage"));
```

### React Query Caching

```typescript
// Configure stale time and cache time for optimal performance
const queryClient = new QueryClient({
  defaultOptions: {
    ueries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Memoization

```typescript
// Use React.memo for expensive components
export const DataTable = memo(function DataTable<TData>({ ... }) {
  // Component implementation
});

// Use useMemo for expensive computations
const filteredData = useMemo(
  () => data.filter(item => matchesFilter(item, filters)),
  [data, filters]
);
```

## Deployment Considerations

### Environment Variables

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Corner Coffee Admin
VITE_SESSION_TIMEOUT=1800000  # 30 minutes in ms
VITE_REFRESH_INTERVAL=300000  # 5 minutes in ms
```

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          charts: ["recharts"],
        },
      },
    },
  },
});
```

## Conclusion

This design provides a comprehensive blueprint for implementing the Admin Dashboard frontend application. The architecture emphasizes:

- **Type Safety**: Full TypeScript coverage with strict validation
- **Performance**: Code splitting, caching, and memoization strategies
- **Testability**: Property-based testing for correctness guarantees
- **Security**: Secure token handling and XSS prevention
- **Accessibility**: WCAG 2.1 AA compliance built into components
- **Maintainability**: Clear separation of concerns with modular architecture

The implementation follows modern React best practices with React Query for server state management, Zustand for client state, and shadcn/ui for consistent, accessible UI components.
