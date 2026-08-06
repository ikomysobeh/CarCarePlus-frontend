# M8 Plan — Packages & Points (frontend)

Implementation plan for wiring the new backend domain from
[`docs/08-new-endpoints-packages-points.md`](../../docs/08-new-endpoints-packages-points.md)
into the React dashboard. Written to be followed step-by-step; every phase reuses a pattern we
already have, so there is almost no new invention — just repetition of the catalog/cars recipe.

**Golden rule for this milestone:** we already solved every shape here before.
- **Packages / Package-Services / Package-Service-Sub-Services** = exactly the **catalog** recipe
  (`crud()` endpoint + `api.ts` hooks + `FormDialog` + `Section` + `DataTable`).
- **User-Packages** = exactly the **cars** recipe (optional `customer_id` in the URL, `/show/` and
  `/update/` segments).
- **Points** = simple **read-only lists** + one config form.

---

## 0. Ready vs blocked (decide scope before coding)

| Feature | Endpoints | Build now? |
|---|---|---|
| Packages CRUD | `/packages` | ✅ Yes |
| Package-Services CRUD | `/package-services` | ✅ Yes |
| Package-Service-Sub-Services CRUD | `/package-service-sub-services` | ✅ Yes |
| User-Packages (subscriptions) | `/user-packages/...` | ✅ Yes |
| Points balance — one customer | `/points/show/{id?}` | ✅ Yes |
| Points history — one customer | `/points/transactions/{id?}` | ✅ Yes |
| **All-customers points list** | `/points` | ⛔ **Blocked** — 403 until dev re-seeds |
| **Points config** | `/points-configs` | ⛔ **Blocked** — 403 until dev re-seeds |
| **"Give points" action** | `POST /points/transactions` | ⛔ **Blocked** — route commented out |

### Tell the backend dev (2 blockers) before starting the blocked screens
1. **Re-run the permission seeder** so super-admin actually has `show.all_user_points` +
   `show.point_config` (they're in code, not in the DB yet):
   ```bash
   php artisan db:seed --class=RolePermissionSeeder
   ```
   Unblocks `GET /points` and `GET /points-configs`.
2. **Uncomment `POST /points/transactions`** in `routes/api.php` (controller + DTO already exist).
   Unblocks the "give points to a customer" action.

> Build order: do all the ✅ work first (it's the bulk of the value and 100% unblocked), then
> come back for the ⛔ items once the dev confirms both fixes.

---

## 1. Decisions (locked 2026-07-29)

- ✅ **Packages get their own top-level sidebar item "Packages"** — a dedicated tabbed page
  (Packages / Package-Services / Sub-Services). (Chosen over folding into the Catalog page.)
- **Customer subscriptions + points** → a standalone **User Packages / Subscriptions** page where
  the admin picks a `customer_id` (same as cars); points balance + history render there too.

*The plan below assumes this layout.*

---

## 2. Shared plumbing (Phase 0 — do once, before any screen)

These files are the "wiring" every screen depends on. Same edits we made for catalog/cars.

### 2.1 `src/api/endpoints.ts`
- **Packages family reuses the existing `crud()` helper** (update/destroy are `POST`/`DELETE` on
  `/{base}/{id}`, store on `/{base}` — identical to catalog):
  ```ts
  packages: crud('/packages'),
  packageServices: crud('/package-services'),
  packageServiceSubServices: crud('/package-service-sub-services'),
  ```
- **User-packages needs a custom block (cars-style):**
  ```ts
  userPackages: {
    index: (customerId?: number) =>
      customerId ? `/user-packages/${customerId}` : '/user-packages',
    show: (id: number) => `/user-packages/show/${id}`,
    store: (customerId?: number) =>
      customerId ? `/user-packages/${customerId}` : '/user-packages',
    update: (id: number) => `/user-packages/update/${id}`,
    destroy: (id: number) => `/user-packages/${id}`,
  },
  ```
- **Points block:**
  ```ts
  points: {
    all: '/points',                                   // ⛔ blocked (§0)
    show: (customerId?: number) =>
      customerId ? `/points/show/${customerId}` : '/points/show',
    transactions: (customerId?: number) =>
      customerId ? `/points/transactions/${customerId}` : '/points/transactions',
    transactionShow: (id: number) => `/points/transactions/show/${id}`,
    addTransaction: '/points/transactions',           // ⛔ blocked (§0)
  },
  pointsConfig: '/points-configs',                    // ⛔ blocked (§0)
  ```

### 2.2 `src/utils/enums.ts`
Add the new enums (mirror `EMPLOYEE_TYPES`):
```ts
export const PACKAGE_TYPES = ['weekly', 'monthly', 'company'] as const;
export const USER_PACKAGE_STATUSES = ['active', 'expired', 'cancelled', 'suspended'] as const;
export const POINTS_TX_TYPES = ['earn', 'redeem'] as const;
```

### 2.3 `src/utils/permissions.ts`
- Add module keys to `ModuleKey`: `'packages'`, `'subscriptions'` (drop the ones you don't use).
- Add them to `BUILT_MODULES`.
- Add to `MODULES_BY_ROLE` for `super_admin` (and `admin` where it makes sense; customers may see
  their own subscriptions/points later).
- Packages are **super-admin-write** → reuse `canWriteCatalog` (already `role === 'super_admin'`),
  or add a clearer `canManagePackages = (r) => r === 'super_admin'`.

### 2.4 `src/layouts/navConfig.tsx`
Add `NAV_ITEMS` entries with icons (e.g. `MdOutlineCardMembership` for packages,
`MdOutlineStars` for points/subscriptions), `group: 'main'`. They'll automatically leave the
"Coming soon" collapsed group and become real rows.

### 2.5 `src/app/router.tsx`
Register the new routes (e.g. `/packages`, `/subscriptions`) pointing at the new pages, inside
the same protected layout as catalog/cars.

### 2.6 i18n
Add label keys under `nav.*`, and a `packages.*` / `points.*` namespace for titles, fields,
statuses, and buttons (both `en` and `ar`).

---

## 3. Phase 1 — Packages CRUD  ✅

Clone the **catalog** recipe exactly. New folder `src/features/packages/`.

- **`types.ts`** — `Package` + `PackageInput`:
  ```ts
  export interface Package {
    id: number; name: string; description: string | null;
    type: 'weekly' | 'monthly' | 'company';
    price: string;            // ⚠️ decimal-as-STRING (like Service.base_price)
    discount_pct: string;     // ⚠️ also string
    services_count: number; valid_days: number; is_active: boolean;
    created_at: string; updated_at: string | null;
  }
  export interface PackageInput {
    name: string; description?: string;
    type: 'weekly' | 'monthly' | 'company';
    price: number; discount_pct?: number;
    services_count: number; valid_days: number; is_active: boolean;
  }
  ```
- **`api.ts`** — copy the categories block; swap `endpoints.packages`, keys `['packages']`.
- **`PackageFormDialog.tsx`** — copy `CategoryFormDialog`; fields: name, name? (no `name_ar`
  here — packages have only `name`), description (multiline), `type` via `FormSelect`
  (`PACKAGE_TYPES`), price / discount_pct / services_count / valid_days via `FormTextField`,
  `is_active` via `FormSwitch`. **Use `z.coerce.number()` for the numeric fields** (same trick as
  Service prices) so the string/number boundary is handled.
- **`PackagesSection.tsx`** — copy `CategoriesSection`; columns: name, type (chip), price,
  services_count, valid_days, status, actions.
- **Page:** `PackagesPage.tsx` with `Tabs` (Packages / Package-Services / Sub-Services) — the
  three phases below become the three tabs.

**Gotcha:** display `price`/`discount_pct` as-is (strings); only convert to number on input.

---

## 4. Phase 2 — Package Services (nested)  ✅

`/package-services` links a package → a service with an `allowed_count`.

- **Type:** `PackageService { id, package_id, package?, service_id, service?, allowed_count }`.
- **Input:** `{ package_id, service_id, allowed_count }`.
- **Dialog:** two **relation dropdowns** (packages list + services list) — same as Service's
  `category_id` dropdown — plus `allowed_count` number field.
- **Section table:** package name, service name, allowed_count, actions.
- **api.ts:** `crud()` block, keys `['package-services']`.

---

## 5. Phase 3 — Package Service Sub-Services (nested)  ✅

`/package-service-sub-services` — one level deeper: which sub-services under a package-service,
with an optional `price_override`.

- **Type:** `{ id, package_service_id, package_service?, sub_service_id, sub_service?,
  price_override: string | null, is_active }`.
- **Input:** `{ package_service_id, sub_service_id, price_override?, is_active }`.
- **Dialog:** dropdown of package-services + dropdown of sub-services + optional
  `price_override` (`z.coerce.number().optional()`) + `is_active` switch.

> **Nice-to-have (later): a "Package Builder" screen** — pick a package, add services with
> allowances, then per service add sub-services with price overrides. Same three resources, just
> composed into one guided flow. Ship the plain tabs first; the builder is polish.

---

## 6. Phase 4 — User Packages / subscriptions  ✅

Follow the **cars** recipe (`src/features/cars/api.ts`) — it's the same URL shape.

- **New folder** `src/features/userPackages/` (or `subscriptions/`).
- **api.ts:** mirror cars — `index(customerId)`, `store(customerId)`, `show(id)`,
  `update(id)`, `destroy(id)`. **No multipart** here (no files), so use plain JSON bodies (like
  catalog), *not* `toFormData`.
- **Admin flow:** a numeric `customer_id` field (same as cars — there is still no `/customers`
  lookup endpoint, see [07-gaps](../../docs/07-gaps-and-questions.md)), then list that customer's
  subscriptions.
- **Create fields:** `package_id` (dropdown of packages), `status?`.
- **Update fields:** `remaining_count`, `status`.
- **Business rule:** when `status` is `expired`/`cancelled`, render a `StatusChip` and **disable
  edit** (read-only) — reuse `StatusChip` (already maps `expired`→gray, `cancelled`→red,
  `active`→green, `suspended`→red).

---

## 7. Phase 5 — Points (single customer, read-only)  ✅

Two simple read-only views; no writes needed (the write is blocked, §0).

- **Balance:** `GET /points/show/{customer_id?}` → `{ balance, customer }`. Show as a `StatCard`
  ("Loyalty points") — drop it on the customer's subscriptions page or Profile.
- **History:** `GET /points/transactions/{customer_id?}` → list → `DataTable` with columns: type
  (`earn`/`redeem` as a chip), points, balance_before/after, expires_at, note, created_at.
- No dialog, no mutations — pure display. Easiest phase.

---

## 8. Phase 6 — Blocked items (do LAST, after dev fixes)  ⛔

Only start once the dev confirms §0 fixes:
1. **All-customers points list** (`GET /points`) — a `DataTable` of `{ customer, balance }`.
2. **Points config form** (`/points-configs`) — a single settings form (all numeric fields:
   `earn_per_amount`, `redeem_value`, `min_redeem`, `expiry_days`, `max_earn_per_order`,
   `is_active`). Same `FormProvider` + `FormTextField` shape as StaffPage; likely POST to save.
3. **"Give points" action** (`POST /points/transactions`) — a small dialog: `type` (earn/redeem),
   `points`, `note`; on success invalidate the balance + history queries.

---

## 9. Design & consistency checklist (per screen)

Run the `frontend-design` skill's checklist on every new screen. Specifically for M8:
- Use `PageHeader` + `DataTable` + `FormDialog` — do **not** hand-roll tables/dialogs.
- Handle **loading / empty / error** (DataTable already does; forms need the `Alert` pattern from
  StaffPage).
- Decimal-as-string fields: display raw, input via `z.coerce.number()`.
- Every write is super-admin-only → the UI hides the Add/Edit/Delete controls for others
  (`canWriteCatalog`/`canManagePackages`), and the backend 403 is the real gate.
- Add a teaching doc under `docs/explanation/features/packages/...` for each new file
  (project convention) and a `changelog.md` entry.

---

## 10. Suggested order & rough size

| Step | Phase | Effort | Blocked? | Status |
|---|---|---|---|---|
| 1 | §2 plumbing (endpoints, enums, permissions, nav, router, i18n) | S | no | ✅ done 2026-07-29 |
| 2 | §3 Packages CRUD | M | no | ✅ done |
| 3 | §4 Package-Services | S | no | ✅ done |
| 4 | §5 Package-Service-Sub-Services | S | no | ✅ done |
| 5 | §6 User-Packages | M | no | ✅ done |
| 6 | §7 Points (balance + history) | S | no | ✅ done |
| 7 | §8 all-points list + config + give-points | M | ⛔ yes | ⏳ waiting on backend §0 |

Steps 1–6 built + typechecked (`tsc -b`) + linted clean. Step 7 waits on the two backend fixes
in §0 (re-seed permissions; uncomment `POST /points/transactions`).
