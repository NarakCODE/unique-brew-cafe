# Data Fetching Best Practices

This project uses a centralized approach for data fetching to ensure consistency, type safety, and efficient state management.

## Core Principles

1.  **Centralized API Client**: All HTTP requests should go through `src/lib/api-client.ts`. usage of raw `fetch` or `axios` directly in components/hooks is discouraged.
2.  **Separate API Logic**: API calls should be pure TypeScript functions located in `src/api/<resource>.ts`. They should return promises resolving to typed data.
3.  **Server State Management**: Use `TanStack Query` (React Query) for handling loading states, caching, error states, and deduplication.

## Architecture

### 1. API Client (`src/lib/api-client.ts`)

Manages the `axios` instance with base URL, request interceptors (for Auth), and response interceptors (for standardized error handling).

```typescript
// Example usage
import { apiClient } from "@/lib/api-client"

export const getProfile = () => apiClient.get("/profile")
```

### 2. API Definitions (`src/api/*.ts`)

Define your API calls here. Return the `ApiResponse` type where applicable.

```typescript
// src/api/profile.ts
import { apiClient } from "@/lib/api-client"
import { User } from "@/types/auth"
import { ApiResponse } from "@/types/api"

export const getProfile = async (): Promise<ApiResponse<User>> => {
  return apiClient.get("/profile")
}
```

### 3. Custom Hooks (`src/hooks/*.ts`)

Wrap API calls with `useQuery` or `useMutation`.

**For Fetching Use `useQuery`:**

```typescript
import { useQuery } from "@tanstack/react-query"
import { getProfile } from "@/api/profile"

export function useProfile() {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  })

  return {
    user: query.data?.data,
    isLoading: query.isLoading,
    // ...
  }
}
```

**For Mutations Use `useMutation`:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "@/api/profile"

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}
```

## Adding New Features

1. Create a function in `src/api/<feature>.ts` using `apiClient`.
2. Create or update a hook in `src/hooks/use-<feature>.ts` using `useQuery` or `useMutation`.
3. Use the hook in your component.
