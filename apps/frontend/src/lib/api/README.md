# API Client Documentation

This directory contains the API client implementation for the Corner Coffee application.

## Overview

The API client provides two implementations:

-   **Axios-based client** (default, recommended)
-   **Fetch-based client** (lightweight alternative)

Both implementations feature:

-   ✅ Automatic token management
-   ✅ Token refresh on 401 errors
-   ✅ Request/response interceptors
-   ✅ Error handling and transformation
-   ✅ TypeScript support
-   ✅ Centralized configuration

## Files

-   **`client.ts`** - Core API client implementation (Axios & Fetch)
-   **`config.ts`** - API configuration and endpoint definitions
-   **`index.ts`** - High-level API service layer with convenience methods

## Usage

### Basic Usage

```typescript
import { api } from "@/lib/api";

// Login
const response = await api.auth.login({
    email: "user@example.com",
    password: "password123",
});

// Get products with filters
const products = await api.products.list({
    page: 1,
    limit: 20,
    category: "coffee",
    search: "latte",
});

// Create an order
const order = await api.orders.create({
    items: [{ productId: "123", quantity: 2 }],
    deliveryAddress: "123 Main St",
});
```

### Using the Client Directly

```typescript
import { apiClient, fetchClient } from "@/lib/api";

// Using Axios client (default)
const data = await apiClient.get("/api/custom-endpoint");
const result = await apiClient.post("/api/custom-endpoint", { key: "value" });

// Using Fetch client
const data = await fetchClient.get("/api/custom-endpoint");
const result = await fetchClient.post("/api/custom-endpoint", { key: "value" });
```

### Error Handling

```typescript
import { api, ApiClientError } from "@/lib/api";

try {
    const user = await api.auth.login(credentials);
} catch (error) {
    if (error instanceof ApiClientError) {
        console.error("API Error:", error.message);
        console.error("Status:", error.statusCode);
        console.error("Code:", error.code);
        console.error("Details:", error.details);
    }
}
```

### Building Custom URLs

```typescript
import { buildUrl, buildQueryString } from "@/lib/api";

// Build URL with query params
const url = buildUrl("/api/products", {
    page: 1,
    limit: 20,
    category: "coffee",
});
// Result: '/api/products?page=1&limit=20&category=coffee'

// Build query string only
const queryString = buildQueryString({ search: "latte", sortBy: "price" });
// Result: '?search=latte&sortBy=price'
```

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Corner Coffee
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### API Endpoints

All API endpoints are defined in `config.ts`. To add a new endpoint:

```typescript
// In config.ts
export const apiConfig = {
    endpoints: {
        // ... existing endpoints
        myNewEndpoint: {
            list: "/api/my-endpoint",
            get: (id: string) => `/api/my-endpoint/${id}`,
        },
    },
};
```

Then add the corresponding service method in `index.ts`:

```typescript
// In index.ts
export const api = {
    // ... existing services
    myNewService: {
        async list(): Promise<any[]> {
            return apiClient.get(apiConfig.endpoints.myNewEndpoint.list);
        },
        async get(id: string): Promise<any> {
            return apiClient.get(apiConfig.endpoints.myNewEndpoint.get(id));
        },
    },
};
```

## Authentication Flow

The API client automatically handles authentication:

1. **Login**: Call `api.auth.login()` - tokens are automatically stored in Zustand
2. **Requests**: All subsequent requests include the access token in headers
3. **Token Refresh**: On 401 errors, the client automatically:
    - Attempts to refresh the access token
    - Retries the failed request
    - Queues other failed requests during refresh
4. **Logout**: On refresh failure, automatically logs out and redirects to login

### Manual Token Management

```typescript
import { useAuthStore } from "@/store/auth.store";

// Get tokens
const { accessToken, refreshToken } = useAuthStore.getState();

// Update tokens
useAuthStore.getState().setAuth({
    accessToken: "new-token",
    refreshToken: "new-refresh-token",
    user: userData,
});

// Logout
useAuthStore.getState().logout();
```

## Advanced Usage

### Custom Axios Configuration

```typescript
import { axiosClient } from "@/lib/api/client";

// Get the underlying Axios instance
const axiosInstance = axiosClient.getClient();

// Add custom interceptors
axiosInstance.interceptors.request.use((config) => {
    // Custom request logic
    return config;
});
```

### Request Timeout

The default timeout is 30 seconds (configured in `config.ts`). To override:

```typescript
import { apiClient } from "@/lib/api";

// With Axios
const data = await apiClient.get("/api/slow-endpoint", {
    timeout: 60000, // 60 seconds
});
```

### File Upload

```typescript
const formData = new FormData();
formData.append("file", file);

const result = await apiClient.post("/api/upload", formData, {
    headers: {
        "Content-Type": "multipart/form-data",
    },
});
```

### Cancellation

```typescript
import axios from "axios";

const source = axios.CancelToken.source();

try {
    const data = await apiClient.get("/api/endpoint", {
        cancelToken: source.token,
    });
} catch (error) {
    if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
    }
}

// Cancel the request
source.cancel("Operation canceled by user");
```

## React Query Integration

Use with React Query for advanced data fetching:

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Query
function useProducts(filters: ProductFilters) {
    return useQuery({
        queryKey: ["products", filters],
        queryFn: () => api.products.list(filters),
    });
}

// Mutation
function useCreateOrder() {
    return useMutation({
        mutationFn: (data: OrderData) => api.orders.create(data),
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
}
```

## Best Practices

1. **Use the high-level API service** (`api.*`) for common operations
2. **Handle errors appropriately** with try-catch blocks
3. **Use TypeScript types** for request/response data
4. **Leverage React Query** for data fetching and caching
5. **Keep endpoint definitions centralized** in `config.ts`
6. **Don't store sensitive data** in environment variables exposed to the client
7. **Use the fetch client** for blob/file downloads
8. **Test error scenarios** including network failures and token expiration

## Troubleshooting

### "No refresh token available" Error

The user is not authenticated. Redirect to login:

```typescript
if (typeof window !== "undefined") {
    window.location.href = "/login";
}
```

### CORS Errors

Ensure your backend allows requests from your frontend origin. Check backend CORS configuration.

### Network Errors

Check that:

-   The API server is running
-   The `NEXT_PUBLIC_API_URL` is correct
-   Firewall/network allows the connection

### Type Errors

Ensure you've defined proper TypeScript types for your API responses in `@/types/`.

## Testing

```typescript
import { vi } from "vitest";
import { api } from "@/lib/api";

// Mock API client
vi.mock("@/lib/api/client", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

// Test
it("should fetch products", async () => {
    const mockProducts = [{ id: "1", name: "Coffee" }];
    apiClient.get.mockResolvedValue(mockProducts);

    const result = await api.products.list();
    expect(result).toEqual(mockProducts);
});
```
