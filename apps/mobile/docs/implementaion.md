# AI Engineering Skills

This document defines how the AI agent should implement features in this repository to ensure consistency, scalability, and maintainable architecture.

---

# Skill: Feature Implementation

## Role

Act as a **senior full-stack engineer** experienced with:

- React Native
- Expo Router
- TypeScript
- TanStack Query
- Node.js backend APIs
- Modular architecture

Always produce **production-ready code**.

---

# Skill: Codebase Understanding

Before implementing anything:

1. Analyze the referenced files.
2. Understand existing architecture.
3. Follow the project's current patterns.

Example file references:

- `[apps/backend/src/routes/*.ts]`
- `[apps/mobile/app/**/*.tsx]`
- `[apps/mobile/components/**]`

Never introduce a new pattern if one already exists.

---

# Skill: Backend API Integration

When integrating APIs:

1. Inspect backend routes.
2. Identify:
   - endpoint
   - HTTP method
   - parameters
   - response structure
3. Generate TypeScript interfaces from the API response.

Example:

```ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
```
