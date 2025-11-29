# Frontend Documentation

Welcome to the Corner Coffee frontend documentation! This directory contains comprehensive guides for the new state management architecture.

## 📚 Documentation Index

### Getting Started

-   **[Quick Start Guide](./QUICK_START.md)** - Start here! 5-minute guide with common use cases
-   **[Migration Guide](./MIGRATION_GUIDE.md)** - How to migrate existing components

### Architecture

-   **[State Management](./STATE_MANAGEMENT.md)** - Complete architecture documentation
-   **[Architecture Diagram](./ARCHITECTURE_DIAGRAM.md)** - Visual diagrams and flow charts
-   **[Refactoring Summary](./REFACTORING_SUMMARY.md)** - What was built and why

### API

-   **[API Client README](../src/lib/api/README.md)** - API client usage and configuration
-   **[API Examples](../src/lib/api/examples.ts)** - Code examples

## 🎯 Quick Links

### For New Developers

1. Read [Quick Start Guide](./QUICK_START.md)
2. Review [State Management](./STATE_MANAGEMENT.md) principles
3. Check [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md) for visual overview

### For Existing Developers (Migration)

1. Read [Migration Guide](./MIGRATION_GUIDE.md)
2. Review [Refactoring Summary](./REFACTORING_SUMMARY.md)
3. Start migrating components incrementally

### For Debugging

1. Use React Query Devtools (enabled in development)
2. Use Redux DevTools for Zustand stores
3. Check [Quick Start Guide](./QUICK_START.md) debugging section

## 🏗️ Architecture Overview

```
State Management
├── Client State (Zustand)
│   ├── Auth Store (tokens, localStorage)
│   ├── UI Store (modals, toasts, sidebar)
│   └── Preferences Store (settings, localStorage)
│
└── Server State (TanStack Query)
    ├── Authentication hooks
    ├── Product hooks
    ├── Order hooks
    ├── Cart hooks (optimistic updates)
    ├── Favorites hooks (optimistic updates)
    ├── User hooks (admin)
    └── Notification hooks (auto-polling)
```

## 💡 Key Concepts

### Separation of Concerns

**Never mix client and server state!**

✅ **Client State (Zustand)**

-   UI state (modals, sidebars, loading)
-   User preferences (theme, language)
-   Authentication tokens
-   Local filters

✅ **Server State (TanStack Query)**

-   API data (products, orders, users)
-   Cached responses
-   Background synchronization
-   Optimistic updates

### When to Use What

**Use TanStack Query hooks when:**

-   Data comes from or goes to the backend
-   You need caching and synchronization
-   You want automatic refetching
-   You need optimistic updates

**Use Zustand stores when:**

-   It's purely UI state
-   It's user preferences
-   It needs localStorage persistence
-   It doesn't involve the backend

## 🚀 Common Patterns

### Pattern 1: Fetching and Displaying Data

```typescript
import { useProducts } from "@/hooks/use-products";

const { data, isLoading } = useProducts({ page: 1 });
```

### Pattern 2: Creating/Updating Data

```typescript
import { useCreateProduct } from "@/hooks/use-products";
import { useUIStore } from "@/store/ui.store";

const createProduct = useCreateProduct();
const { addToast } = useUIStore();

await createProduct.mutateAsync(data);
addToast({ type: "success", message: "Created!" });
```

### Pattern 3: Managing UI State

```typescript
import { useUIStore } from "@/store/ui.store";

const { openModal, closeModal } = useUIStore();
openModal("product-form", { productId: "123" });
```

### Pattern 4: User Preferences

```typescript
import { usePreferencesStore } from "@/store/preferences.store";

const { viewMode, setViewMode } = usePreferencesStore();
setViewMode("grid"); // Auto-saved to localStorage
```

## 📖 Available Hooks & Stores

### Server State Hooks

-   `useAuth` - Authentication
-   `useProducts` - Product management
-   `useOrders` - Order management
-   `useCart` - Shopping cart (optimistic)
-   `useFavorites` - Favorites (optimistic)
-   `useUsers` - User management (admin)
-   `useNotifications` - Notifications (polling)

### Client State Stores

-   `useAuthStore` - Auth tokens and status
-   `useUIStore` - UI state (modals, toasts, sidebar)
-   `usePreferencesStore` - User preferences

See [Quick Start Guide](./QUICK_START.md) for complete API reference.

## 🎓 Learning Path

### Week 1: Basics

-   [ ] Read Quick Start Guide
-   [ ] Understand separation of concerns
-   [ ] Use existing hooks in components
-   [ ] Practice with simple queries

### Week 2: Advanced

-   [ ] Learn about optimistic updates
-   [ ] Understand query invalidation
-   [ ] Use mutation hooks
-   [ ] Work with infinite queries

### Week 3: Migration

-   [ ] Read Migration Guide
-   [ ] Identify components to migrate
-   [ ] Migrate simple components
-   [ ] Migrate complex components

### Week 4: Mastery

-   [ ] Understand cache strategies
-   [ ] Create custom hooks
-   [ ] Optimize performance
-   [ ] Debug with devtools

## 🔧 Development Tools

### React Query Devtools

-   **Location**: Bottom-left floating button (dev mode)
-   **Features**: Inspect queries, mutations, cache
-   **Usage**: Click to expand, explore query states

### Redux DevTools (for Zustand)

-   **Extension**: Install Redux DevTools Extension
-   **Features**: Time-travel debugging, state inspection
-   **Usage**: Open browser DevTools > Redux tab

## 🧪 Testing

### Testing Queries

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "./test-utils";

test("should fetch products", async () => {
    const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
});
```

### Testing Stores

```typescript
import { renderHook, act } from "@testing-library/react";
import { useUIStore } from "@/store/ui.store";

test("should toggle sidebar", () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
        result.current.toggleSidebar();
    });

    expect(result.current.isSidebarOpen).toBe(false);
});
```

## 🐛 Troubleshooting

### Common Issues

**Data not updating after mutation**

-   Check query invalidation in mutation hooks
-   Use React Query Devtools to inspect cache

**Too many re-renders**

-   Use Zustand selectors for granular subscriptions
-   Split large stores into smaller ones

**Stale data showing**

-   Adjust `staleTime` configuration
-   Check network requests in DevTools

**Optimistic update not rolling back**

-   Verify `onError` handler returns context
-   Check mutation implementation

See individual docs for more troubleshooting tips.

## 📞 Support

### Documentation

-   Check this README index
-   Read specific guides linked above
-   Review code examples in `lib/api/examples.ts`

### Debugging

-   Use React Query Devtools
-   Use Redux DevTools for Zustand
-   Check browser console for errors
-   Review network requests

### Help

-   Ask team members
-   Check TanStack Query docs
-   Check Zustand docs
-   Create GitHub issues for bugs

## 🔄 Updates

This documentation is maintained as part of the frontend codebase. When making architectural changes:

1. Update relevant documentation files
2. Add examples if introducing new patterns
3. Update this README index
4. Notify team of changes

## 📝 Contributing

When adding new features:

1. **Add hooks**: Create in `hooks/use-*.ts`
2. **Add stores**: Create in `store/*.store.ts`
3. **Document**: Update relevant docs
4. **Examples**: Add to examples file
5. **Tests**: Add test coverage

## 🌟 Best Practices

1. **Always separate client and server state**
2. **Use TypeScript for type safety**
3. **Leverage optimistic updates for better UX**
4. **Invalidate queries properly after mutations**
5. **Use selectors to optimize re-renders**
6. **Add proper error handling**
7. **Write tests for critical paths**
8. **Document complex patterns**

## 📚 External Resources

### TanStack Query

-   [Official Docs](https://tanstack.com/query/latest)
-   [Practical React Query](https://tkdodo.eu/blog/practical-react-query)
-   [Query Invalidation](https://tanstack.com/query/latest/docs/react/guides/query-invalidation)

### Zustand

-   [Official Docs](https://zustand-demo.pmnd.rs/)
-   [Recipes](https://docs.pmnd.rs/zustand/guides/recipes)
-   [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)

### TypeScript

-   [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
-   [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Last Updated**: 2025-11-29
**Version**: 1.0.0
**Maintainer**: Development Team
