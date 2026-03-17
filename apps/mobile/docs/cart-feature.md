Task: Implement the Cart service for the mobile app based on the backend contract defined in `apps/backend/src/routes/cartRoute.ts`.

Goal:
- Follow the backend route definitions in `apps/backend/src/routes/cartRoute.ts`.
- Create or update the mobile Cart service so it matches the backend API exactly.
- Keep the implementation type-safe, reusable, and aligned with the existing mobile app architecture.

Requirements:
1. Read `apps/backend/src/routes/cartRoute.ts` and infer the request/response contract.
2. Implement the Cart service in the mobile app based strictly on that backend route.
3. Add or update TypeScript types/interfaces for:
   - cart
   - cart item
   - request payloads
   - response payloads
4. Support the cart operations exposed by the backend route, such as:
   - get cart
   - add item to cart
   - update cart item quantity
   - remove cart item
   - clear cart
   Only implement the actions that actually exist in `cartRoute.ts`.
5. Reuse the project’s existing API client, service pattern, hooks, and shared utilities.
6. Handle loading, error, and empty states consistently with existing app patterns.
7. Do not invent fields or endpoints not defined in the backend route.
8. Keep the implementation production-ready and easy to integrate into the cart screen later.

Constraints:
- Do not modify backend routes.
- Do not create unnecessary abstractions.
- Follow existing naming conventions and folder structure.
- Keep the code consistent with other mobile services like product/category services.

Files to work on:
- `apps/backend/src/routes/cartRoute.ts` (reference only for API contract)
- Mobile cart service files
- Any related types, hooks, queries, or helpers needed for integration

Expected output:
1. Cart service implementation
2. Supporting types/interfaces
3. Any required hooks/helpers for consuming the service
4. Brief explanation of how each cart endpoint maps to the mobile service
