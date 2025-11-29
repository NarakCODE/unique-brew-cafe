---
trigger: always_on
---

# Antigravity Rules - Next.js + TypeScript Development

## Core Identity

You are an expert in modern Next.js development with TypeScript, specializing in type-safe, performant, and accessible web applications using the App Router architecture.

---

## TypeScript Principles

### Strict Type Safety

-   Always enable `strict: true` in tsconfig.json with all strict flags
-   **Never use `any`** - use `unknown` for uncertain types
-   Use type inference when possible to reduce verbosity
-   Handle `null` and `undefined` explicitly
-   Document complex types with JSDoc

### Type System Rules

-   Prefer **interfaces** over types for object shapes and public APIs
-   Use **union types** for multiple possibilities
-   Use **intersection types** for combining types
-   Use **discriminated unions** for state management
-   Implement **type guards** for runtime safety
-   Use **mapped types** for transformations
-   Use **conditional types** for complex logic

### Utility Types

-   Use built-in utilities: `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`
-   Create custom utility types for domain-specific needs
-   Use `satisfies` operator for type checking
-   Use template literal types for string manipulation
-   Use `as const` for literal types

### Generics Guidelines

-   Use generics for reusable, type-safe components
-   Apply constraints: `<T extends { id: string }>`
-   Provide default type parameters
-   Use meaningful names: `TData`, `TProps`, `TResponse` not `T`, `U`, `V`
-   Avoid excessive nesting (max 2-3 levels)
-   Only use generics when they provide clear value

---

## Next.js App Router Architecture

### Component Classification

**Server Components (Default)**

-   Data fetching and backend operations
-   Sensitive information handling
-   Large dependencies
-   Direct database queries
-   SEO-critical content

**Client Components (`'use client'`)**

-   Event listeners and interactivity
-   React hooks (useState, useEffect, useContext)
-   Browser APIs (localStorage, window)
-   Custom hooks and context providers
-   Third-party interactive libraries

### File Conventions

-   `page.tsx` - Unique UI for routes (Server Component)
-   `layout.tsx` - Shared UI wrapper
-   `loading.tsx` - Loading states with Suspense
-   `error.tsx` - Error boundaries
-   `not-found.tsx` - 404 pages
-   `route.ts` - API endpoints
-   `_folder` - Private folders (not routed)
-   `(folder)` - Route groups (layout without URL)

### Data Fetching Rules

-   Fetch data directly in Server Components
-   Use native `fetch` with caching options
-   Default to Static Site Generation (SSG)
-   Use `revalidate` for ISR
-   Use Server Actions for mutations
-   Cache with `'force-cache'` or opt-out with `'no-store'`

---

## Performance Standards

### Image Requirements

-   Always use `next/image` component
-   Specify width and height (prevent layout shift)
-   Use `priority` for LCP images
-   Prefer WebP/AVIF formats
-   Configure `remotePatterns` for external images

### Font Requirements

-   Use `next/font` for optimization
-   Prefer variable fonts
-   Apply font subsetting
-   Use `display: 'swap'`

### Rendering Strategy

-   Static Rendering (default)
-   Dynamic Rendering (use `no-store`)
-   Streaming with Suspense
-   Partial Prerendering (experimental)

### Code Splitting

-   Dynamic imports for heavy components
-   Use `next/script` for third-party scripts
-   Lazy load below-the-fold content
-   Monitor bundle size

---

## Accessibility Standards

### Semantic HTML Requirements

-   Use proper document structure: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`
-   Maintain heading hierarchy (h1-h6)
-   Use `<button>` for actions, `<a>` for navigation
-   Use `<table>` only for tabular data
-   Use `<figure>` and `<figcaption>` for images

### WCAG 2.1 Level AA Compliance

-   4.5:1 contrast for normal text
-   3:1 contrast for large text/UI
-   Text alternatives for all non-text content
-   Full keyboard accessibility
-   Visible focus indicators
-   Skip links for navigation

### Form Standards

-   Use `<label>` for all inputs
-   Group with `<fieldset>` and `<legend>`
-   Use appropriate input types
-   Implement clear validation
-   Use `autocomplete` attributes

### ARIA Usage

-   Use ARIA only when semantic HTML insufficient
-   Never override native semantics
-   Use `aria-label` for icon buttons
-   Use `aria-describedby` for context
-   Use `aria-live` for dynamic updates
-   Test with screen readers

### Image Accessibility

-   Meaningful `alt` text (describe content/function)
-   Empty `alt=""` for decorative images
-   Lazy load below-the-fold images

---

## Code Quality Standards

### TypeScript Configuration

```json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "strictFunctionTypes": true,
        "strictPropertyInitialization": true,
        "noImplicitReturns": true
    }
}
```

### Error Handling

-   Never throw strings; throw `Error` objects
-   Use Result types for functional error handling
-   Implement exhaustiveness checking
-   Use error boundaries in Next.js
-   Provide user-friendly error messages

### Immutability & Encapsulation

-   Use `readonly` for immutable data
-   Use `private`/`protected` for class members
-   Prefer functional patterns
-   Use interfaces for contracts

### Code Organization

-   Prefer ES6 modules over namespaces
-   Use barrel exports
-   Keep components small and focused
-   Colocate route-specific components
-   Proper separation of concerns

---

## Development Tools

### Required Tools

-   ESLint with `typescript-eslint` and `eslint-config-next`
-   Prettier for formatting
-   Husky & lint-staged for pre-commit checks

### Type Generation

-   Generate from database schema (Prisma, Drizzle)
-   Generate from GraphQL schemas
-   Generate from OpenAPI specs

### Testing Requirements

-   Type all test files
-   Use `ts-jest` or `vitest`
-   Test type definitions
-   Implement unit, integration, E2E tests

---

## SEO Requirements

-   Implement proper meta tags (Next.js Metadata API)
-   Use structured data (Schema.org)
-   Optimize titles (50-60 chars) and descriptions (150-160 chars)
-   Use canonical URLs
-   Proper heading structure
-   Generate sitemaps and robots.txt

---

## Pre-Deployment Checklist

-   [ ] TypeScript strict mode enabled, zero errors
-   [ ] No `any` type usage
-   [ ] All images using `next/image`
-   [ ] All fonts optimized with `next/font`
-   [ ] Server/Client Components properly classified
-   [ ] Loading and error states implemented
-   [ ] Semantic HTML throughout
-   [ ] WCAG 2.1 AA compliance
-   [ ] Full keyboard navigation
-   [ ] Alt text on all images
-   [ ] Proper SEO metadata
-   [ ] ESLint/Prettier passing
-   [ ] Core Web Vitals optimized

---

## Key Principles Summary

1. **Type Safety First** - Strict TypeScript, no `any`, explicit null handling
2. **Server by Default** - Use Server Components unless interactivity needed
3. **Performance Matters** - Optimize images, fonts, code splitting
4. **Accessibility Always** - WCAG 2.1 AA, semantic HTML, keyboard nav
5. **Error Handling** - Proper boundaries, user-friendly messages
6. **Code Quality** - ESLint, Prettier, testing, documentation
