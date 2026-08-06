# `features/packages/` — Packages, Package-Services & Sub-Services

This folder is the **Packages** domain (M8). If you already read the catalog docs
(`docs/explanation/features/catalog/`), you know 90% of this — every file here is the **same
CRUD recipe** as a catalog resource. This doc focuses on **what's new** and maps each file, so
you understand the whole folder without me repeating the catalog explanation.

**Laravel mental model:** think of each resource here as a Model + Controller + FormRequest +
Blade view. `types.ts` = the Model's shape + the FormRequest's validated fields; `api.ts` = the
Controller actions (index/store/update/destroy); the `*FormDialog.tsx` = the create/edit Blade
form; the `*Section.tsx` = the index Blade view (a table + an "Add" button).

---

## The 3 resources (and how they nest)

```
Package  (a subscription plan, e.g. "Monthly Shiny")
  └─ PackageService        (a Service included in it, with an allowed_count)
        └─ PackageServiceSubService  (a Sub-service under that, optional price_override)
```

Same idea as Category → Service → Sub-service in the catalog, just a parallel tree for packages.

---

## `types.ts` — the shapes

Mirrors the API response from docs/08. **The one thing to remember:** `price`, `discount_pct`,
and `price_override` come back as **strings** (`"350.00"`), not numbers — exactly like
`Service.base_price`. That's a Laravel/MySQL decimal-column habit. So:

- In the **`Package` / `...SubService` interfaces**, those fields are typed `string`.
- In the **`...Input` interfaces** (what we *send*), they're `number`.
- The form bridges the two with `z.coerce.number()` (see below).

Each resource has two interfaces: the full record (`Package`) and the input payload
(`PackageInput`) — same split as `Category` vs `CategoryInput`.

---

## `api.ts` — the React Query hooks

Three blocks (packages / package-services / package-service-sub-services), each with four hooks:
`useX()` (list), `useCreateX`, `useUpdateX`, `useDeleteX`. **Identical** to
`features/catalog/api.ts` — read that doc for the line-by-line.

**What's new / worth noting:**
- The endpoints reuse the shared `crud()` helper in `api/endpoints.ts` (update is a **POST**, not
  PUT — the backend's convention).
- Each resource has its own **query key** (`['packages']`, `['package-services']`, …). After any
  create/update/delete we `invalidateQueries` that key, so React Query refetches the list and the
  table updates itself. (Laravel analogy: like the page auto-refreshing after a redirect, but
  without the full reload.)

---

## `PackageFormDialog.tsx` — the create/edit form

Cloned from `CategoryFormDialog`. **Differences from a catalog form:**
- A package has **no `name_ar`** (only `name`).
- New field **`type`** — a dropdown (`FormSelect`) fed by `PACKAGE_TYPES`
  (`weekly | monthly | company`), labels from i18n `enums.packageType.*`.
- Several **numeric** fields (`price`, `discount_pct`, `services_count`, `valid_days`). Each is a
  `FormTextField type="number"`, validated with **`z.coerce.number()`** — "coerce" because an
  HTML input always hands you a *string*, and we want a *number*. This is the bridge for the
  string↔number mismatch from `types.ts`.

The submit/error handling (map server `fieldErrors` back onto the form) is copied verbatim from
the catalog — it's our standard pattern.

## `PackagesSection.tsx` — the list screen

Cloned from `CategoriesSection`. Table columns: name, **type** (shown as a `Badge`),
price, services_count, valid_days, status (`StatusChip` active/inactive), and the edit/delete
actions (only when `canManagePackages(role)` — i.e. super-admin). Uses the shared `PageHeader`,
`DataTable`, and `ConfirmDialog`.

---

## `PackageServiceFormDialog.tsx` + `PackageServicesSection.tsx`

The **linking** resource: which service belongs to which package.
- The form has **two relation dropdowns** — package (`usePackages`) and service
  (`useServices` from the catalog) — plus an `allowed_count` number. Same "relation dropdown"
  idea as picking a category on a Service.
- The section table shows `package.name`, `service.name_ar`, and `allowed_count`. Because the API
  **nests** the related objects (`row.package`, `row.service`), we read those directly, with a
  `#{id}` fallback if a relation wasn't loaded.

## `PackageServiceSubServiceFormDialog.tsx` + `PackageServiceSubServicesSection.tsx`

One level deeper: which sub-service under a package-service, with an optional `price_override`.
- The package-service dropdown label is built as **"package · service"** so a human can tell the
  rows apart (there's no single natural name for a link row).
- `price_override` is **optional** — the submit only includes it when the user actually typed a
  value (`values.price_override !== '' && != null`); otherwise we omit the key so the backend
  keeps the sub-service's normal price.

---

## `PackagesPage.tsx` — the 3 tabs

Exactly like `CatalogPage`: a Chakra `Tabs.Root` with three triggers, each rendering one of the
Sections above. This is the component the router points `/packages` at.

---

## When you'll touch these files

- **New package field from the backend?** Add it to `types.ts` (both interfaces) → add a
  `FormTextField`/`FormSelect` in the dialog → optionally a column in the section.
- **Change who can write?** Edit `canManagePackages` in `utils/permissions.ts` (one place).
- **A "Package Builder" screen** (pick a package → add services → add sub-services in one guided
  flow) is the natural next polish — it would compose these same three api.ts hook sets.

See also: `../PLAN-M8-packages-points.md`, `../../08-new-endpoints-packages-points.md`, and the
catalog docs for the shared recipe.
