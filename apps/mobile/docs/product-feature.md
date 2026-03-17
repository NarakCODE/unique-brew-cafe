Implement the Explore tab for the mobile app.

Context:
- Backend route contracts are defined in:
  - `apps/backend/src/routes/productRoutes.ts`
  - `apps/backend/src/routes/categoryRoutes.ts`
- Mobile screen to update:
  - `apps/mobile/app/(tabs)/explore.tsx`

Your tasks:
1. Read the backend route definitions and infer the expected request/response structure.
2. Implement the Product service in the mobile app based strictly on `productRoutes.ts`.
3. Fetch categories based on `categoryRoutes.ts`.
4. Build the Explore screen UI in `explore.tsx` with:
   - a vertical `ScrollView`
   - category-driven content
   - a 2-column grid of product cards
5. Reuse existing shared UI components and app patterns.
6. Add loading, empty, and error states.
7. Keep the implementation strongly typed and clean.

UI requirements:
- Mobile-first layout
- 2-column product grid
- Scrollable page
- Consistent spacing and card layout
- Good default handling for missing images/text

Constraints:
- Do not change backend routes
- Do not invent fields not present in the route contracts
- Avoid unnecessary refactors outside this feature
- Follow existing project architecture and styling conventions

Return:
- Product service code
- Updated Explore screen code
- Any required types/hooks/helpers
- Short explanation of data flow and UI structure
