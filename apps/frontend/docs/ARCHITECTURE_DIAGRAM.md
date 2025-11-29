# State Management Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           React Components                                  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    ▼                            ▼
         ┌──────────────────────┐    ┌─────────────────────┐
         │   CLIENT STATE       │    │   SERVER STATE      │
         │   (Zustand)          │    │   (TanStack Query)  │
         └──────────────────────┘    └─────────────────────┘
                    │                            │
      ┌─────────────┼─────────────┐             │
      │             │             │             │
      ▼             ▼             ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐   ┌──────────────┐
│   Auth   │ │    UI    │ │  Prefs   │   │   API Client │
│  Store   │ │  Store   │ │  Store   │   │ (Axios/Fetch)│
└──────────┘ └──────────┘ └──────────┘   └──────────────┘
      │             │             │             │
      │             │             ▼             │
      │             │      localStorage         │
      │             │                           │
      ▼             ▼                           ▼
localStorage    (ephemeral)            Backend API Server
```

## Data Flow

### Query Flow (Reading Data)

```
Component
  ↓ useProducts()
TanStack Query
  ↓ check cache
  ├─ cached? → return data
  └─ stale?
      ↓ api.products.list()
    API Client
      ↓ add auth token
      ↓ fetch
    Backend API
      ↓ response
    API Client
      ↓ transform
    TanStack Query
      ↓ cache & return
    Component
      ↓ render
```

### Mutation Flow (Writing Data)

```
Component
  ↓ createProduct.mutate(data)
TanStack Query
  ↓ onMutate (optimistic update)
  ↓ api.products.create(data)
API Client
  ↓ add auth token
  ↓ POST
Backend API
  ├─ success ✓
  │   ↓
  │ onSuccess
  │   ↓
  │ invalidateQueries
  │   ↓
  │ refetch products
  │   ↓
  │ Component re-renders
  │
  └─ error ✗
      ↓
    onError
      ↓
    rollback optimistic update
      ↓
    Component shows error
```

### Client State Flow

```
Component
  ↓ openModal('form', { id: 123 })
UI Store (Zustand)
  ↓ set({ activeModal: 'form', modalData: { id: 123 } })
  ↓ notify subscribers
Components
  ↓ re-render with new state
```

## Component Integration

### Example: Product List Page

```
┌─────────────────────────────────────────────────┐
│         ProductListPage Component               │
├─────────────────────────────────────────────────┤
│                                                 │
│  const { data, isLoading } = useProducts()      │
│  const { viewMode } = usePreferencesStore()     │
│  const { addToast } = useUIStore()              │
│                                                 │
│  ┌───────────────┐  ┌──────────────┐           │
│  │  Server State │  │ Client State │           │
│  │               │  │              │           │
│  │ • products    │  │ • viewMode   │           │
│  │ • isLoading   │  │ • toasts     │           │
│  │ • error       │  │ • sidebar    │           │
│  └───────────────┘  └──────────────┘           │
│                                                 │
└─────────────────────────────────────────────────┘
```

## State Ownership

### Auth State

```
┌─────────────────────────────────────────┐
│  Authentication State (Split)           │
├─────────────────────────────────────────┤
│                                         │
│  Zustand (authStore)                    │
│  ├─ accessToken      (localStorage)     │
│  ├─ refreshToken     (localStorage)     │
│  └─ isAuthenticated  (derived)          │
│                                         │
│  TanStack Query (useMe)                 │
│  └─ user data        (cache)            │
│                                         │
└─────────────────────────────────────────┘
```

### Cart State

```
┌─────────────────────────────────────────┐
│  Cart State (Server-side)               │
├─────────────────────────────────────────┤
│                                         │
│  TanStack Query (useCart)               │
│  ├─ cart items       (from server)      │
│  ├─ total            (from server)      │
│  └─ optimistic data  (temporary)        │
│                                         │
│  Mutations                              │
│  ├─ useAddToCart     (optimistic)       │
│  ├─ useUpdateCartItem (optimistic)      │
│  └─ useRemoveFromCart (optimistic)      │
│                                         │
└─────────────────────────────────────────┘
```

### UI State

```
┌─────────────────────────────────────────┐
│  UI State (Client-side only)            │
├─────────────────────────────────────────┤
│                                         │
│  Zustand (uiStore)                      │
│  ├─ isSidebarOpen    (ephemeral)        │
│  ├─ activeModal      (ephemeral)        │
│  ├─ toasts           (ephemeral)        │
│  └─ globalLoading    (ephemeral)        │
│                                         │
└─────────────────────────────────────────┘
```

## Cache Strategy

### TanStack Query Cache Layers

```
┌─────────────────────────────────────────┐
│  Query Cache (Memory)                   │
├─────────────────────────────────────────┤
│                                         │
│  Fresh (0-60s)                          │
│  ├─ Return immediately                  │
│  └─ No refetch                          │
│                                         │
│  Stale (60s-5m)                         │
│  ├─ Return cached data                  │
│  └─ Refetch in background               │
│                                         │
│  Garbage (>5m)                          │
│  └─ Removed from cache                  │
│                                         │
└─────────────────────────────────────────┘
```

### Zustand Persistence

```
┌─────────────────────────────────────────┐
│  Zustand Store Persistence              │
├─────────────────────────────────────────┤
│                                         │
│  authStore                              │
│  └─ localStorage (persisted)            │
│                                         │
│  preferencesStore                       │
│  └─ localStorage (persisted)            │
│                                         │
│  uiStore                                │
│  └─ Memory only (ephemeral)             │
│                                         │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
Error Occurs
  │
  ├─ API Error (4xx/5xx)
  │   ↓
  │ ApiClientError
  │   ↓
  │ TanStack Query catches
  │   ├─ 401? → Refresh token flow
  │   ├─ 4xx? → No retry
  │   └─ 5xx? → Retry with backoff
  │       ↓
  │   Component error state
  │       ↓
  │   Show error UI
  │
  ├─ Network Error
  │   ↓
  │ Retry (exponential backoff)
  │   ↓
  │ Max retries reached
  │   ↓
  │ Show error UI
  │
  └─ Optimistic Update Failed
      ↓
    Automatic rollback
      ↓
    Show previous state
      ↓
    Show error toast
```

## Key Benefits of This Architecture

1. **Automatic Synchronization**: Server data stays in sync automatically
2. **Optimistic Updates**: Instant UI feedback with automatic rollback
3. **Efficient Caching**: Smart cache management reduces API calls
4. **Type Safety**: Full TypeScript support throughout
5. **Devtools Integration**: Easy debugging with React Query Devtools
6. **Separation of Concerns**: Clear boundaries between client and server state
7. **Persistence**: Auth and preferences automatically saved
8. **Error Recovery**: Automatic retry logic and rollback mechanisms
