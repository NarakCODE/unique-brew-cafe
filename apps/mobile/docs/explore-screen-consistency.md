# Explore Screen Consistency

This note documents the implementation pattern used for the mobile Explore tab so it stays aligned with the rest of the app.

## Goal

Keep Explore practical and consistent with a real-world product UI:

- centered screen title at the top
- no decorative screen description under the title
- simple section grouping
- neutral surfaces, borders, and spacing
- category filters as compact chips
- 2-column product grid with standard cards

## Implemented Structure

File:
- `apps/mobile/app/(tabs)/explore.tsx`

Layout order:
1. Top centered title: `Explore`
2. Category section
3. Product section
4. Loading, empty, and error states inside the content area

## Header Pattern

Use a minimal header block instead of a hero.

Rules:
- title is centered horizontally
- title uses the same restrained sizing used across app screens
- do not place descriptive copy directly under the screen title unless the product explicitly requires it
- keep top spacing modest

Reference:
- `apps/mobile/app/(tabs)/explore.tsx`

## Section Pattern

Each content area should use:

- a left-aligned section title
- an optional lightweight metadata label on the right
- standard card spacing
- no oversized icons or decorative backgrounds

Current examples:
- `Categories`
- `All products` or selected category name

## Category Chip Pattern

Use chips as filters, not as decorative pills.

Rules:
- filled only when selected
- bordered when not selected
- text stays compact and readable
- use theme foreground/background/border tokens
- avoid gradients, glows, and large shadows

## Product Card Pattern

File:
- `apps/mobile/components/product/explore-product-card.tsx`

Rules:
- medium radius
- border + card background
- practical image height
- compact content spacing
- standard price and availability treatment
- metadata row for prep time and rating/reviews
- fallback image state must be simple and quiet

## State Pattern

Use the existing shared empty-state pattern for:

- network error
- empty category results
- initial loading skeletons

Rules:
- keep messaging short
- keep actions obvious
- avoid adding special illustrations or marketing copy unless already used elsewhere in the app

## Reuse Guidance

When building future mobile tab screens, prefer this structure:

1. `ScreenLayout`
2. centered title row
3. one or more simple content sections
4. shared cards/chips/list items
5. shared empty/error/loading states

This keeps new screens visually compatible with Account, Search, Store Detail, and Explore without introducing one-off presentation styles.
