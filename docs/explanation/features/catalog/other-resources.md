# Catalog — the other 4 resources (Services, Sub-services, Car types, Car brands)

**Real files:** `ServicesSection.tsx` + `ServiceFormDialog.tsx`, `SubServicesSection.tsx` +
`SubServiceFormDialog.tsx`, `CarTypesSection.tsx` + `CarTypeFormDialog.tsx`,
`CarBrandsSection.tsx` + `CarBrandFormDialog.tsx` (all in
[`../../../../src/features/catalog/`](../../../../src/features/catalog/)).

> These four follow the **exact same pattern as Categories**
> ([`CategoriesSection.tsx.md`](CategoriesSection.tsx.md)) — list + form dialog + delete confirm,
> React Query hooks in [`api.ts`](api.ts.md). This doc only covers **what's different** in each,
> so read the Categories doc first.

All their hooks live in the same [`api.ts`](api.ts.md) (grouped by resource, each with its own
query key like `serviceKeys`, `carBrandKeys`). All are wired as tabs in `CatalogPage.tsx`.

---

## Services — the richest form
New things vs Categories:
- **A relation dropdown:** a service belongs to a category. The form loads categories with
  `useCategories()` and shows them as options; the table shows `s.category?.name_ar` via a
  column `render`. (`?.` = optional chaining — the relation is only present when the API
  eager-loads it.)
- **Number fields:** `base_price`, `duration_minutes` use `<FormTextField type="number">`.
  The zod schema uses `z.coerce.number()` — the input hands us a *string*, and `coerce` turns
  it into a number before validation/submit. (The API also returns prices as strings like
  `"120.00"`; we display them as-is with a `ر.س` suffix.)
- **A conditional field:** `vip_extra_price` only shows when `is_vip_available` is on. We read
  the toggle live with `const vipOn = methods.watch('is_vip_available')` and render the field
  only when `vipOn`. A zod `.refine(...)` requires the value when VIP is on (the backend
  demands it). On submit we include `vip_extra_price` **only** if VIP is on.
- Services have **no `is_active`** field (the API doesn't return one) — instead the table shows
  a VIP yes/no chip.

`methods.watch('field')` is react-hook-form's way to react to a field's current value during
render — like a live `$request->input('is_vip_available')` you can branch on.

## Sub-services
- Same as Services but simpler: belongs to a **service** (dropdown from `useServices()`), has a
  single `price` (number) and an `is_active` toggle. Table shows the parent service's `name_ar`.

## Car types
- Standalone (no relations). Fields: `name`, `name_ar`, `price_multiplier` (number, shown as
  `×1.20`), `is_active`. Nothing new beyond number coercion.

## Car brands — the odd one out
- **No `name_ar`** (the only catalog resource without it) — so its form has just `name`,
  `logo`, `is_active`, and its table/search use `name` only.
- **`logo` is a path string** (e.g. `"logos/toyota.png"`), not a file upload. We show it as an
  `<Avatar>`; `CarBrandsSection` builds the absolute URL from the API origin
  (`VITE_API_BASE_URL` minus `/api`, plus `/storage/…`). If the image is missing, the Avatar
  falls back to the brand's first letter.

---

## What we verified in the browser
All four tabs load real seeded data (Services 6 with category names, Sub-services 4 with
service names, Car types 4 with multipliers, Car brands 14 with logos + pagination). Created &
deleted a test Car Type (number coercion + mutation + auto-refetch confirmed); confirmed the
Service form's VIP field appears only when the toggle is on. No console errors. (Changelog has
the details.)

## When you'll touch these
When a resource gains a field, or when we later swap the Car brand `logo` text field for a real
`ImageUploadField` (if the backend accepts brand-logo uploads).
