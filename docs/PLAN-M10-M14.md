# M10–M14 Plan — Branches, Customers, Workshops, Inventory, Settings group

Implementation plan for wiring the huge backend pull from
[`docs/10-new-branches-customers-workshops-inventory-2026-08-01.md`](../../docs/10-new-branches-customers-workshops-inventory-2026-08-01.md)
into the React dashboard. Five focused milestones, same rhythm as M8/M9 — build, verify live,
document, move on.

**Golden rule for this batch: everything maps onto a recipe we already have, and — unlike M8/M9 —
nothing here is blocked.** No backend fixes to wait on. We can build all five milestones back to
back.

---

## 0. Ready vs blocked

| Milestone | Endpoints | Build now? |
|---|---|---|
| **M10** Branches | `/branches` | ✅ Yes |
| **M11** Customers (Personal + Company) | `/customers/personal`, `/customers/company` | ✅ Yes |
| **M12** Workshops | `/workshops` | ✅ Yes |
| **M13** Materials & Inventory | `/materials`, `/material-units`, `/inventories`, `/inventory-transactions` | ✅ Yes |
| **M14** Settings group | `/problem-types`, `/suggested-problems`, `/system-settings`, `/ai-rules` | ✅ Yes |

Nothing to tell the backend dev before starting (a first for this project!). The only open item
from doc 10 (§7 — whether `GET /cars/all` pagination actually reaches the JSON response) **does
not block anything here** — none of these five milestones touch the cars list, only the branches
*dropdown* used inside the cars/staff forms.

---

## 1. Decisions (proposed — flag if you'd rather do it differently before we start)

- **M10 Branches** slots into the **existing** `branches` nav item (already in `navConfig.tsx`,
  currently a `ComingSoon`). We'll **add `'branches'` to `admin`'s `MODULES_BY_ROLE`** too (it's
  missing today) — admin can read all branches and edit their own, so they should see the item;
  write buttons (Add/Delete, and Edit on branches they don't manage) stay super_admin/owner-only.
- **M11 Customers** slots into the **existing** `users` nav item (already assigned to both
  super_admin and admin). One page, two tabs (Personal / Company). The Company tab is **hidden
  entirely for `admin`** (not shown as a 403) since admin has no `show.company_customers`
  permission at all — no point rendering a tab that always errors.
- **M12 Workshops** needs a **new** `ModuleKey: 'workshops'`, added to `BUILT_MODULES` and to
  both `super_admin` and `admin` in `MODULES_BY_ROLE` (admin can read). New icon
  `MdOutlineCarRepair`, new route `/workshops`. Write controls (add/edit/delete) are
  **super_admin + the workshop's own owner only** — `admin` never gets write buttons here, even
  though it can view the list (this mirrors the backend's explicit 403-for-admin-on-write rule).
- **M13 Materials & Inventory** slots into the **existing** `inventory` nav item (already
  assigned to both roles). One page, 4 tabs (Materials / Units / Stock / Transactions).
- **M14 Settings group** slots into the **existing** `settings` nav item. **Add `'settings'` to
  `admin`'s `MODULES_BY_ROLE`** too (currently super_admin-only, but admin has `show.*` on all 4
  sub-resources per docs/10 §9) — one page, 4 tabs (Problem Types / Suggested Problems / System
  Settings / AI Rules), all read-for-both/write-for-super_admin, same as Catalog.
- **Once M10 ships, immediately retire `utils/branches.ts`** — replace its two call sites
  (`CarFormDialog.tsx`, `StaffPage.tsx`) with a real `useBranches()` query. Do this as the last
  step of M10, not a separate task, so we're never mixing the fake and real branch lists.

---

## 2. Shared plumbing additions (do incrementally, one block per milestone below)

### `src/api/endpoints.ts`
```ts
// M10
branches: crud('/branches'),

// M11 — no `store` (customers self-register), so NOT the crud() helper
customersPersonal: {
  index: '/customers/personal',
  show: (id: number) => `/customers/personal/${id}`,
  update: (id: number) => `/customers/personal/${id}`,
  destroy: (id: number) => `/customers/personal/${id}`,
},
customersCompany: {
  index: '/customers/company',
  show: (id: number) => `/customers/company/${id}`,
  update: (id: number) => `/customers/company/${id}`,
  destroy: (id: number) => `/customers/company/${id}`,
},

// M12
workshops: {
  ...crud('/workshops'),
  my: '/workshops/my',
},

// M13
materials: crud('/materials'),
materialUnits: crud('/material-units'),
inventories: crud('/inventories'),
// append-only ledger — no update/destroy
inventoryTransactions: {
  index: '/inventory-transactions',
  show: (id: number) => `/inventory-transactions/${id}`,
  store: '/inventory-transactions',
},

// M14
problemTypes: crud('/problem-types'),
suggestedProblems: crud('/suggested-problems'),
systemSettings: crud('/system-settings'),
aiRules: crud('/ai-rules'),
```
All of these fit the existing `crud()` helper (`GET base`, `GET base/{id}`, `POST base`,
`POST base/{id}`, `DELETE base/{id}`) **except** Customers (no `store` — self-registration only)
and Inventory Transactions (no `update`/`destroy` — append-only ledger).

### `src/utils/permissions.ts`
```ts
export type ModuleKey =
  ... // existing
  | 'workshops'; // M12 — new

export const BUILT_MODULES: ModuleKey[] = [
  ..., 'branches', 'users', 'workshops', 'inventory', 'settings', // move these out of "coming soon"
];

// admin gains branches + settings (both missing today, see §1)
admin: [..., 'branches', ..., 'settings'],
super_admin: [..., 'workshops', ...],   // insert workshops
admin: [..., 'workshops', ...],          // insert workshops
```
New helpers (mirror `canWriteCatalog`):
```ts
export const canWriteBranches = (role: Role) => role === 'super_admin'; // + owner-admin check done in-screen
export const canManageWorkshops = (role: Role) => role === 'super_admin'; // + owner check done in-screen
export const canManageCustomers = (role: Role) => role === 'super_admin';
export const canManageInventory = (role: Role) => role === 'super_admin' || role === 'admin'; // both write, per docs/10 §5
export const canManageSettings = (role: Role) => role === 'super_admin';
```
> Note `canManageInventory` is the one resource where **admin also writes** (scoped to their own
> branch server-side) — don't reuse `canWriteCatalog`'s super_admin-only assumption here.

### `src/layouts/navConfig.tsx`
Add one new import + one new `NAV_ITEMS` entry:
```tsx
import { MdOutlineCarRepair } from 'react-icons/md';
// ...
{ key: 'workshops', route: '/workshops', icon: <MdOutlineCarRepair />, group: 'main' },
```
`branches`, `users`, `inventory`, `settings` already have entries + icons — nothing to add for
those four, they just stop being dimmed once their `ModuleKey` leaves `ComingSoon` territory (i.e.
once they're in `BUILT_MODULES`).

### `src/app/router.tsx`
Replace 4 `ComingSoonRoute` lines, add 1 new route:
```tsx
{ path: 'branches', element: <BranchesPage /> },
{ path: 'users', element: <CustomersPage /> },
{ path: 'workshops', element: <RequireRole roles={['super_admin','admin']}><WorkshopsPage /></RequireRole> },
{ path: 'inventory', element: <InventoryPage /> },
{ path: 'settings', element: <SettingsPage /> },
```
(No `RequireRole` needed on branches/users/inventory/settings — both allowed roles reach them; the
pages themselves hide write controls per §1. `workshops` explicit `RequireRole` is just belt-and-
suspenders since only 2 roles are relevant, matching the `admins`/`pricing` pattern from M9.)

### i18n
New namespaces `branches.*`, `customers.*`, `workshops.*`, `inventory.*`, `settings.*` — plus
`nav.workshops`. Both `en` and `ar`, following the exact key style already used (`add*`, `edit*`,
`delete*Title`, `empty*`).

---

## 3. M10 — Branches

New folder `src/features/branches/`.

- **`types.ts`**
  ```ts
  export interface Branch {
    id: number; admin_id: number; manager?: { id: number; name: string; email: string };
    name: string; name_ar: string; city: string; address: string;
    latitude: number | null; longitude: number | null; phone: string;
    is_active: boolean; working_hours: Record<string, unknown> | null; is_24h: boolean;
  }
  export interface BranchInput {
    admin_id: number; name: string; name_ar: string; city: string; address: string;
    latitude?: number; longitude?: number; phone: string; is_active?: boolean;
    working_hours?: Record<string, unknown>; is_24h?: boolean;
  }
  ```
- **`api.ts`** — copy the categories block (`useBranches`, `useCreateBranch`, `useUpdateBranch`,
  `useDeleteBranch`), key `['branches']`.
- **`BranchFormDialog.tsx`** — clone `CategoryFormDialog`. Fields: `admin_id` via `FormSelect`
  **fed by `useAdmins()`** (M9's hook — `features/admin/api.ts`, already exists) — this is the
  bootstrap dependency from docs/10 §1, so **build/verify M9's Admins screen has at least one
  admin before testing Branch creation**. Then `name`/`name_ar`/`city`/`address`/`phone`
  (`FormTextField`), `latitude`/`longitude` (optional numbers, `z.coerce.number().optional()`),
  `is_active`/`is_24h` (`FormSwitch`). Skip `working_hours` for v1 (free-form JSON, same
  "not worth a structured form yet" call we made for pricing-rule `conditions` — textarea it later
  if needed, don't block the milestone on it).
- **`BranchesSection.tsx`** / **`BranchesPage.tsx`** — clone `CategoriesSection`. Columns:
  name_ar, city, phone, manager name (`b.manager?.name ?? '#'+b.admin_id`), status, is_24h chip.
  **Row-level write gate:** `canWriteBranches(role) || (role === 'admin' && branch.admin_id ===
  user.id)` — an admin only gets edit on their *own* branch (no add/delete ever for admin).

**Last step of M10 — retire the hack:**
1. `src/features/cars/CarFormDialog.tsx` line 10 + 106: replace
   `import { SEEDED_BRANCHES } from '../../utils/branches';` /
   `SEEDED_BRANCHES.map(...)` with `useBranches()` from the new `features/branches/api.ts`.
2. `src/features/admin/StaffPage.tsx` line 9 + 46: same swap.
3. Delete `src/utils/branches.ts` once both call sites are updated and verified.

---

## 4. M11 — Customers (Personal + Company)

New folder `src/features/customers/`. **Two resources, two different response shapes** — don't
try to unify them into one type.

- **`types.ts`**
  ```ts
  // Personal — User-shaped
  export interface PersonalCustomer {
    id: number; name: string; email: string; phone: string | null;
    image_url: string | null; is_active: boolean; role: 'customer_personal';
    created_at: string; updated_at: string;
  }
  // Company — Company-shaped, nested owner
  export interface CompanyCustomer {
    id: number; name: string; name_ar: string; commercial_reg: string; tax_number: string;
    address: string; status: 'pending' | 'approved' | 'rejected'; is_active: boolean;
    owner?: { id: number; name: string; email: string; phone: string | null };
    created_at: string; updated_at: string;
  }
  // Same update payload shape for both (CustomerDTO on the backend)
  export interface CustomerUpdateInput {
    name?: string; email?: string; phone?: string; password?: string; is_active?: boolean;
    image_url?: string;
  }
  ```
- **`api.ts`** — `usePersonalCustomers`/`useUpdatePersonalCustomer`/`useDeletePersonalCustomer`
  and the `Company` equivalents. **No create hooks** — there's no `store` endpoint for either.
- **`CustomerFormDialog.tsx`** — **edit-only** (no "Add" button anywhere on this screen — these
  users self-register). Fields: name, email, phone, password (optional, "leave blank to keep" —
  same trick as `AdminFormDialog`), is_active (super_admin only — `admin` should see it disabled/
  hidden since the backend strips `is_active` from admin-submitted updates for Personal, and
  Company customers can't touch it at all per docs/10 §4 asymmetry... actually re-read: for
  **Personal**, `admin` write permission doesn't exist at all (`edit.personal_customers` is
  super_admin only) — so **admin gets NO edit button on Personal customers either**, view-only.
  Simplify: **the entire write path (edit + delete) on both tabs is super_admin-only** — admin's
  role here is 100% read-only, on both Personal and Company. Don't build a partial-permission
  edit form; just gate the whole dialog behind `canManageCustomers(role)`.
- **`CustomersPage.tsx`** — 2 tabs. **Tab visibility:** show "Company" tab only if
  `user.role === 'super_admin'` (per §1). Personal tab: columns name/email/phone/status; row
  actions (edit/delete) only for super_admin. Company tab: columns name_ar/commercial_reg/
  tax_number/status/owner-email; same super_admin-only actions. Reuse `StatusChip` for `status`
  (already maps pending/approved/rejected).

> This finally gives admins (in the sense of daily operators) a real place to **look up** a
> customer — but note it does NOT give a picker for the Cars/User-Packages "which customer_id"
> problem, since **admin can't even see Company customers** and gets no write here. If you want
> this screen to double as a customer-picker source for other forms, that's a follow-up decision,
> not part of M11 — flag it after building if it comes up.

---

## 5. M12 — Workshops

New folder `src/features/workshops/`.

- **`types.ts`**
  ```ts
  export interface Workshop {
    id: number; name: string; name_ar: string; address: string; city: string;
    latitude: number | null; longitude: number | null;
    status: 'pending' | 'approved' | 'rejected'; rating_avg: number | null;
    owner?: { id: number; name: string; email: string; phone: string | null };
    created_at: string;
  }
  export interface WorkshopInput {
    user_id?: number; name: string; name_ar: string; address: string; city: string;
    latitude?: number; longitude?: number;
  }
  ```
- **`api.ts`** — `useWorkshops`, `useCreateWorkshop`, `useUpdateWorkshop`, `useDeleteWorkshop`.
  Skip `my` for now (that's the *workshop role's own* self-service view — out of scope for an
  admin dashboard; note it exists in `endpoints.ts` for later).
- **`WorkshopFormDialog.tsx`** — clone `CategoryFormDialog`-shape but no `is_active` field (this
  resource doesn't have one — `status` is set via the *approval* flow already built in M0-era
  `ApprovalsPage`, not here). Fields: `user_id` (optional — a number field for now, same "no
  lookup endpoint" situation as Cars' `customer_id`, since Workshops don't have a picker either;
  note this as a known limitation, not a new blocker), name/name_ar/address/city,
  latitude/longitude (optional numbers).
- **`WorkshopsPage.tsx`** — clone `CategoriesSection`. Columns: name_ar, city, status (StatusChip),
  rating_avg, owner email. **Write gate:** `role === 'super_admin'` for Add/Delete always; Edit
  additionally allowed if `role === 'super_admin' || workshop.owner?.id === user.id` — but since
  this is an *admin dashboard* (not a workshop-owner self-service portal), in practice only
  super_admin will ever see write buttons here day-to-day. Keep the ownership check anyway for
  correctness/future-proofing, it's cheap.

---

## 6. M13 — Materials & Inventory

New folder `src/features/inventory/`. **The biggest of the five** — 4 tabs, and the one resource
with real business logic (stock ledger) rather than plain CRUD.

### Tab 1 — Material Units (simplest, build first to prove the pattern)
- `types.ts`: `MaterialUnit { id, name, name_ar, is_decimal }`.
- Clone Categories exactly, minus `description`/`is_active`. 2 text fields + 1 switch.

### Tab 2 — Materials
- `types.ts`: `Material { id, material_unit_id, unit?: MaterialUnit, name, name_ar,
  description, unit_price, is_vip_material, is_active }`.
- Relation dropdown to Material Units (like Service→Category). Numeric `unit_price`
  (`z.coerce.number()`). **Delete confirm must warn about cascade** (docs/10 §5 — deleting a
  material wipes its inventory rows + transaction history) — use `ConfirmDialog`'s `destructive`
  + a stronger message than usual, e.g. "This also deletes all stock records and history for this
  material. This cannot be undone."

### Tab 3 — Inventories (stock levels, NOT the ledger)
- `types.ts`: `Inventory { id, branch_id, branch?, material_id, material?, quantity,
  min_quantity, updated_at }`.
- Two relation dropdowns (Branch from M10's `useBranches()`, Material from Tab 2's
  `useMaterials()`). **For `admin`, hide/disable the branch dropdown** — the backend ignores/
  overrides whatever `admin` sends and forces their own branch anyway, so don't even offer the
  choice (avoids a confusing "I picked X but it saved as Y" moment). `super_admin` gets the full
  dropdown.
- Frame this screen's copy/subtitle as **"corrections only"** (docs/10 §5) — e.g. a `PageHeader`
  subtitle like "Adjust stock levels directly. For day-to-day movements, use Transactions." so
  users aren't tempted to use this for routine stock changes.

### Tab 4 — Inventory Transactions (the ledger — read list + a create dialog, no edit/delete)
- `types.ts`: `InventoryTransaction { id, branch_id, branch?, destination_branch_id,
  destination_branch?, material_id, material?, created_by, creator?, type: 'in'|'out'|
  'transfer_out'|'transfer_in', quantity, quantity_before, quantity_after, reference_id, note,
  created_at }`.
- **List is read-only** (`DataTable`, no actions column) — this is a ledger, nothing to edit.
- **Create dialog** (`InventoryTransactionFormDialog.tsx`) — the one place with real conditional
  logic worth calling out:
  - `type` dropdown: only `in | out | transfer_out` as options (**never** `transfer_in` — it's
    system-generated, don't even list it).
  - `destination_branch_id` dropdown: **only rendered when `type === 'transfer_out'`**
    (`methods.watch('type')`, same "watch and conditionally render" trick as Service's
    `vip_extra_price`). Validate `different from branch_id` client-side too, so the user isn't
    surprised by a 422 for picking the same branch twice.
  - `branch_id`: hidden/disabled for `admin` (server derives it), shown for `super_admin`.
  - `quantity`: `z.coerce.number().min(0.01)`.
  - On success, invalidate **both** the transactions list AND the inventories list (a transaction
    changes stock levels — Tab 3's numbers go stale otherwise).
  - Show a note near the submit button: creating a `transfer_out` also creates a matching
    `transfer_in` on the destination branch automatically — the user doesn't create that second
    row themselves.

### `InventoryPage.tsx` — 4-tab shell, same pattern as `CatalogPage`/`PricingPage`.

---

## 7. M14 — Settings group

New folder `src/features/settings/`. **All four are simple lookup/config CRUDs** — this is the
easiest milestone, do it if you want a quick win after M13's complexity.

### Tab 1 — Problem Types
`{ id, name, name_ar, is_active }` — exact Categories clone minus `description`.

### Tab 2 — Suggested Problems
`{ id, name, name_ar, description, category }` where `category` is a fixed enum: `engine |
brakes | electrical | tires | mechanical | locksmith`. Add `SUGGESTED_PROBLEM_CATEGORIES` to
`utils/enums.ts`, render as a `FormSelect` with localized labels (`enums.problemCategory.*`).

### Tab 3 — System Settings
`{ id, key, value, type, description }` where `type` ∈ `string | number | boolean | json`. Add
`SYSTEM_SETTING_TYPES` to `utils/enums.ts`. `key` is unique — surface the 422 uniqueness error via
the existing `fieldErrors` → `setError` pattern, nothing special needed. Simplest of the four.

### Tab 4 — AI Rules
The most fields of this batch: `{ id, brand_id, brand?, name, name_ar, type, condition_key,
condition_value, car_type, fuel_type, response_template, is_active }`.
- `type` enum: `maintenance | recommendation | warning | promotion | upsell | diagnosis`.
- `brand_id` — optional relation dropdown to `useCarBrands()` (catalog, already exists).
- `car_type` — reuses the **existing** `CarTypeSize` shape (`sedan|suv|hatchback|pickup`) — check
  `utils/enums.ts`, this might already exist from the original SRS enum list (docs/05); confirm
  before adding a duplicate.
- `fuel_type` — reuse the existing `FUEL_TYPES` from `utils/enums.ts` (already used by Cars).
- `response_template` — a `FormTextField` with `multiline` (this is a text template, likely long).

### `SettingsPage.tsx` — 4-tab shell.

---

## 8. Design & consistency checklist (per screen, all five milestones)

- `PageHeader` + `DataTable` + `FormDialog` — never hand-roll.
- Loading/empty/error via `DataTable`'s built-ins; form-level errors via the `Alert` +
  `fieldErrors→setError` pattern used everywhere since Categories.
- Every "who can write" check goes through a named helper in `permissions.ts` (§2) — never inline
  `role === 'super_admin'` scattered across a component.
- Decimal-as-string fields: none expected in this batch (unlike M8's packages) — double-check
  `unit_price`/`quantity` come back as numbers, not strings, when you first hit the live API; if
  they're strings, apply the same `z.coerce.number()` treatment as before.
- A teaching doc per feature folder under `docs/explanation/features/` (project convention) + a
  `changelog.md` entry, same as every prior milestone.

---

## 9. Suggested order & rough size

| Step | Milestone | Effort | Depends on | Status |
|---|---|---|---|---|
| 1 | M10 Branches | M | M9's Admins screen (for the `admin_id` picker) | ✅ done |
| 2 | M10 cleanup — retire `utils/branches.ts` | S | step 1 | ✅ done |
| 3 | M11 Customers | S–M | — | ✅ done |
| 4 | M12 Workshops | S–M | — | ✅ done |
| 5 | M13 Materials & Inventory (4 tabs) | L | M10 (Inventories tab needs the branch dropdown) | ✅ done |
| 6 | M14 Settings group (4 tabs) | M | — | ✅ done |

M10 first (it's both high-value and a dependency for M13's Inventories tab). M11/M12 are
independent of everything else and can be done in either order. M14 has no dependencies and is
the easiest — good filler if you want to break up M13's size.

**Total new nav items:** just 1 (`workshops`) — the other four slot into placeholders we already
built the shell for back in M7.

---

## 10. What actually happened (deviations from the plan above)

All five milestones shipped, `tsc -b` + `oxlint` clean throughout, teaching docs written for each
(`docs/explanation/features/{branches,customers,workshops,inventory,settings}.md`) and a combined
entry added to `docs/explanation/changelog.md`. Three real deviations worth flagging for anyone
reading this plan after the fact instead of the finished code:

1. **§2's permission block was wrong about M13.** It listed one blanket `canManageInventory`
   (super_admin + admin) for the whole feature. The real split, confirmed against docs/10 §5: only
   **Inventories + Inventory Transactions** let admin write; **Material Units + Materials** are
   super_admin-only (`canWriteCatalog`). Caught mid-build before shipping, not after.
2. **§7's AI Rules `car_type` guess was right about the values, wrong about the source.** The plan
   said "reuses the existing `CarTypeSize` shape... confirm before adding a duplicate" — there was
   no existing frontend enum to reuse; `car_type` in Cars/Catalog is a *relation* (`car_type_id` →
   the `car_types` table), while AI Rules' `car_type` is a *fixed enum* cast
   (`App\Enums\CarEnums\CarTypeSize`) with the same four values but no relation to that table. A
   new `CAR_TYPE_SIZES` constant was added instead of reusing anything.
3. **§7 didn't anticipate that System Settings and AI Rules are invisible to `admin` entirely** —
   the backend's permission seeder has no `show.system_settings`/`show.ai_rules` for admin at all
   (unlike Problem Types/Suggested Problems, where admin at least reads). Both tabs are hidden
   outright in `SettingsPage.tsx`, same pattern as Customers' Company tab in M11.

**Not built:** the M11 note about a Company-resource bug (§4's callout) turned into a full,
separately-tracked backend bug write-up in doc 10 §2 — not a frontend task, no code follow-up
needed on this side.
