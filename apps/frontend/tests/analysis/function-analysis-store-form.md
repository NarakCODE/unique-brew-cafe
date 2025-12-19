# Function Analysis: store-form.tsx

**File:** `apps/frontend/src/components/stores/store-form.tsx`
**Date:** 2025-05-18
**Total Functions Found:** 1 (Main Component) + several handlers

## Summary

The `StoreForm` component is a complex form for creating and updating store details. It uses `react-hook-form` with `zod` validation. It handles image uploads using `FileDropzone`, manages form state for various fields including nested `features` and `openingHours` (implied in submit), and handles API interactions for create/update operations.

## Function Inventory

### Components

- Total: 1
- Complexity: Complex

## Detailed Function Analysis

### 1. StoreForm

**Type:** React Functional Component
**Location:** Lines 106-770
**Export:** Named Export
**Complexity:** Complex

#### Signature

```tsx
export function StoreForm({ initialData }: StoreFormProps);
```

#### Parameters

- `initialData?: Store`: Optional store data for editing mode.

#### Returns

- **Type:** `JSX.Element`
- **Description:** The rendered form component.

#### Dependencies

- **External:** `react`, `next/navigation`, `react-hook-form`, `zod`, `sonner`, `lucide-react`, `@hugeicons/react`
- **Internal:** `api`, `slugify`, `FileDropzone`, `FileList`
- **Side Effects:** API calls (`api.stores.create`, `api.stores.update`), Toast notifications, Navigation (`router.push`)

#### Testing Scenarios

1.  **Rendering (Create Mode):**
    - Should render all form fields empty (or default values).
    - Should show "Create Store" button.
    - Should hide "Current Logo" section.

2.  **Rendering (Edit Mode):**
    - Should render form fields populated with `initialData`.
    - Should show "Update Store" button.
    - Should show "Current Logo" if `initialData.imageUrl` exists.

3.  **Form Validation:**
    - Should show errors for strictly required fields (Name, Address, etc.) if submitted empty.
    - Should validate Lat/Long ranges.
    - Should validate slug format.

4.  **Interactions:**
    - **Slug Generation:** Clicking generate button should auto-fill slug from name.
    - **Image Upload:** Dropping or selecting a file should update the `image` field and show progress.
    - **Image Removal:** Clicking remove on new file should clear it.
    - **Existing Image Removal:** Clicking remove on existing image should clear the preview.

5.  **Submission (Create):**
    - Should call `api.stores.create` with `FormData` containing all fields.
    - Should handle success (toast + redirect).
    - Should handle error (toast).

6.  **Submission (Update):**
    - Should call `api.stores.update` with `storeId` and `FormData`.
    - Should not send image if no new image selected (unless backend logic specific handled, but frontend logic conditionally appends).

#### Mock Requirements

- `useRouter`: Mock `push`, `back`, `refresh`.
- `api.stores`: Mock `create`, `update`.
- `sonner`: Mock `toast`.
- `FileDropzone`: Can be shallow rendered or mocked if complex, but integration test with `fireEvent` on input is better.

## Testing Strategy Recommendations

### High Priority Functions

- `onSubmit`: Critical logic for data transformation and API calls.
- `handleNameChange` / Slug logic: UX feature.

### Mock Strategy

- Use `vi.mock` for `@/lib/api` and `next/navigation`.
- Mock `toast` to verify user feedback.

### Test File Organization

- Group by "Rendering", "Validation", "Interactions", "Submission".
