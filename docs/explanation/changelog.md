# 📓 Changelog — what we built, milestone by milestone

A running log so you can see exactly what changed in each step and why. Newest at top.

---

## 🧩 M23 / M25 / M26 — API localization, Order discount, Purchase payments (2026-08-16)

Wired the actionable parts of the 2026-08-16 backend pull (`car project/docs/13-...`).

- **M23 — API localization.** `api/client.ts` now sends `Accept-Language: <i18n.language>` on every
  request, so the backend's new `SetLocale` middleware returns messages + enum labels in the active
  UI language. One line in the request interceptor.
- **M25 — Order discount.** super_admin can apply a discount from the booking detail dialog:
  `POST /bookings/{id}/discount` (`{ value >0 ≤100, reason? }`). Added `bookings.discount` endpoint,
  `canDiscountOrders` helper, `useApplyDiscount` hook, `DiscountOrderDialog`, and a header button in
  `OrderDetailsDialog` (hidden for cancelled/completed orders and non-super-admins).
- **M26 — Purchase payments.** A payment row is created when a purchase request is approved.
  Added a read-only **Payments tab** inside `PurchaseRequestsPage` (super_admin only) via
  `PurchasePaymentsSection` + `usePurchasePayments` + `purchasePayments` endpoints.

**Deferred:** M24 (`/enums` adoption — optional), M27 (towing destination / workshop car-history —
minor / workshop-facing), M28 (**Notifications UI — blocked**: the backend built FCM + in-app
notifications but exposes no device-token or notifications-list endpoints yet; see docs/13 §8).

**Verified:** `tsc -b` clean.

---

## 🧩 M16–M22 — Booking detail, Procurement, Spare parts, Payments, Ratings, Wallets, Field ops (2026-08-15)

Wired the 2026-08-15 backend pull, documented in
`car project/docs/12-bookings-detail-procurement-2026-08-15.md`. Seven feature areas landed at
once. The dashboard is admin/super-admin facing, so we built the **operations + read + staff-decision**
side of each; the customer/employee *create* flows (booking quote→confirm, rating create, spare-part
create/approve) stay in their own app and are read-only here.

**Shared wiring first (to avoid conflicts):** added all new paths to `api/endpoints.ts`, new enums
to `utils/enums.ts` (purchase/spare-part/wallet/employee-report statuses + payment method/type),
6 new `ModuleKey`s + permission helpers to `utils/permissions.ts`, 6 sidebar items to
`layouts/navConfig.tsx`, 6 routes to `app/router.tsx`, new colors to `StatusChip`, and every
`en`/`ar` i18n key.

- **M16 Booking detail** (`features/orders/OrderDetailsDialog.tsx` + `OrderServiceDetails.tsx`) — a
  "View" button on each order row opens a tabbed dialog: Overview, Price, Sub-services, Materials,
  History (each its own lazy query), plus a Service-detail tab with maintenance/road/towing editors.
  The middle tabs are hidden for the `workshop` role (blocked server-side). Added 7 read hooks +
  3 update mutations to `features/orders/api.ts`.
- **M17 Purchase Requests** (`features/purchase-requests/`) — new feature with a **repeatable
  line-items editor** (`useFieldArray` — the first time we use it) + running total; admin creates/
  edits/deletes pending requests, super_admin approves/rejects/transfers stock between branches.
- **M18 Spare Parts** (`features/spare-parts/`) — read-only list (customers decide from their app).
- **M19 Payments** (`features/payments/`) — list + a "confirm cash" action on pending cash payments.
- **M20 Ratings** (`features/ratings/`) — read-only list with a small star display.
- **M21 Wallets** (`features/wallets/`) — balances list + adjust-balance dialog (signed amount) +
  a per-customer transaction-ledger dialog.
- **M22 Field Ops** (`features/field-ops/`) — two read-only tabs: employee reports + GPS logs (the
  data source for the future Live Tracking map).

**Verified:** `tsc -b` clean, `npm run build` clean. Live behavior to be verified by the user
(`npm run dev` + `php artisan serve`).

**Known limitations (unchanged from the backend):** no employee-picker or workshop-picker lookup
endpoint (assign + maintenance detail use plain numeric id fields); new list endpoints are
paginated and use the `ALL_ROWS_PARAMS` stopgap.

---

## 🧩 M15 — Orders/Bookings + pagination fix + two new fields (2026-08-06)

Wired the second backend pull of the day, documented in
`car project/docs/11-new-orders-bookings-pagination-2026-08-06.md`. Two unrelated things landed
together: a brand-new feature (Orders — the last original gap from doc 07) and a cross-cutting
pagination change that silently affected ~13 screens we'd already built.

**Pagination stopgap** — ~16 endpoints across M3/M8/M9/M10/M13/M14 started paginating server-side
(default 15/page, 10/page for Cars/Bookings) with no client-side handling. Went with the quick fix
(chose not to wait for a decision): added `ALL_ROWS_PARAMS` (`{ per_page: 200 }`) to
`api/client.ts` and passed it on every affected GET call (Categories, Car Types, Car Brands,
Admins, Pricing Rules + Rule Types, Branches, Materials, Material Units, Package Services,
Package Sub-Services, Problem Types, Suggested Problems, System Settings, AI Rules) — 13 hooks
across 7 `api.ts` files. **Cars and Bookings have no `per_page` override at all** (hardcoded
10/page server-side) — flagged as a known, currently-unfixable-from-the-frontend cap in both
`useCars()`'s call site and the new `useOrders()`.

**Two new backend fields on resources we already built:** Materials gained
`is_visible_to_customer` (switch added next to `is_vip_material`, default `false` matching the
migration); Packages gained `is_company_package` (switch + column added, default `false` — the
backend now actively filters which customer account type sees which package by this flag, though
super_admin/admin still see everything regardless).

**Settings tab-visibility fix** — admin gained `show.system_settings`/`show.ai_rules` in this pull
(it had neither when M14 was built, so both tabs were hidden entirely for admin). `SettingsPage`
now shows all 4 tabs unconditionally; `SystemSettingsSection`/`AiRulesSection` gained the same
`canManageSettings`-gated write-button pattern the other two tabs already had.

**`features/orders/` (new)** — the operations console for bookings, not the booking-creation flow
(that's 2-step quote→confirm, customer-facing, out of scope for this admin dashboard). `useOrders()`
needs no client-side role filtering — the backend auto-scopes the list per caller. Action buttons
(Assign/Start/Complete/Cancel) are gated by BOTH role (`canAssignOrders`/`canEditOrderStatus`/
`canCancelOrders`, mirroring the backend's `assign.order`/`edit.order`/`cancel.order` permissions)
AND the order's current status — the first screen in the app where a write button's visibility
depends on more than just who's looking. `AssignOrderDialog` is a plain numeric `employee_id`
field (no employee-lookup endpoint exists, same known-limitation story as Workshops' `user_id`).
`CancelOrderDialog` is the first mutation to send a body on a DELETE request. New `ModuleKey`
`orders` moved from `ComingSoon` to `BUILT_MODULES`; new enums `OrderStatus` (already existed as
`ORDER_STATUSES`, unused, since M0 — the guessed values matched exactly),
`PaymentMethod`/`PaymentStatus`/`PaymentType`.

Verified: `tsc -b` + `oxlint` clean; both locale files symmetric (377/377 keys); all static and
dynamic i18n keys in the new feature confirmed present. **Live verification pending** — backend
server wasn't running this session; every shape came from reading `BookingController`, the 5
`BookingRequest` classes, and the 3 new Resources directly. Teaching doc:
`docs/explanation/features/orders.md`.

---

## 🧩 M10–M14 — Branches, Customers, Workshops, Inventory, Settings (2026-08-06)

Wired the huge backend pull documented in
`car project/docs/10-new-branches-customers-workshops-inventory-2026-08-01.md`, following
`docs/PLAN-M10-M14.md`. Five milestones, all unblocked — built back to back, no backend fixes to
wait on this time.

**M10 — Branches** (`features/branches/`, new): full CRUD. `admin_id` picked via `useAdmins()`
(M9). New **per-row** write gate — the first screen where write access depends on the specific
row, not just the role: `canWriteBranches(role) || (role === 'admin' && branch.admin_id ===
user.id)`. **Retired `utils/branches.ts`** (the M4 hardcoded 5-branch hack) — `CarFormDialog` and
`StaffPage` now call the real `useBranches()`.

**M11 — Customers** (`features/customers/`, new): 2 tabs (Personal/Company), **edit-only** — no
"Add Customer" anywhere, these users self-register. Company tab hidden entirely for `admin` (no
`show.company_customers` permission at all). **Found a live backend bug while building this:**
`CustomerCompanyResource` reads fields (`name_ar`, `commercial_reg`, `tax_number`, `status`,
`owner`) off a **User** model instance that only has the `company` relation loaded — those fields
silently resolve to `null`/missing in the JSON. Documented in doc 10 §2 with two suggested fixes;
`types.ts` marks every affected field nullable with an inline `⚠️` comment, and the UI renders
`?? '—'` everywhere.

**M12 — Workshops** (`features/workshops/`, new): full CRUD, but deliberately **no `is_active`/
`status` field** — status is set exclusively via the existing `ApprovalsPage` approve/reject flow,
not here. New `ModuleKey: 'workshops'`, new nav icon (`MdOutlineCarRepair`), new route. Also fixed
a missing `nav.workshops` i18n key (only the unrelated `admin.workshops` — an ApprovalsPage tab
label — existed).

**M13 — Materials & Inventory** (`features/inventory/`, new): the biggest of the five, 4 tabs
(Units/Materials/Stock/Transactions). **Permission split is not uniform**: Units + Materials are
`canWriteCatalog` (super_admin only); Inventories + Transactions are `canManageInventory`
(super_admin **and** admin, scoped to their own branch server-side) — corrected mid-build after
re-checking doc 10 §5 against the plan's initial blanket assumption. Transactions tab has the
batch's only real conditional business logic: a `type` dropdown that never offers `transfer_in`
(system-generated only), a `destination_branch_id` field shown only when `type === 'transfer_out'`
(`methods.watch`), a client-side "destination ≠ source" check mirroring the backend, and a
create-success handler that invalidates **both** the transactions AND inventories caches (a
transaction changes stock levels too).

**M14 — Settings group** (`features/settings/`, new): 4 tabs (Problem Types/Suggested
Problems/System Settings/AI Rules). Like M13, **read access isn't uniform** — admin can browse
Problem Types and Suggested Problems (read-only) but has **zero** permission for System Settings
or AI Rules, so `SettingsPage` hides those two tabs entirely for non-super_admin. Found that AI
Rules' `car_type` field is a **fixed 4-value enum** (`CarTypeSize`, cast on the backend model) —
completely unrelated to the catalog's `CarType` relation (`car_type_id` on Car) despite the
same-looking name; added a separate `CAR_TYPE_SIZES` constant with a comment flagging the
collision so it doesn't get "simplified" into reusing `useCarTypes()` later.

**Plumbing across all five:** `api/endpoints.ts` (`branches`, `customersPersonal`/
`customersCompany` — no `store`, self-registration only, `workshops`, `materials`/
`materialUnits`/`inventories`/`inventoryTransactions` — the last with no `update`/`destroy`,
append-only ledger, `problemTypes`/`suggestedProblems`/`systemSettings`/`aiRules`);
`utils/permissions.ts` (5 new/expanded `ModuleKey`s, `canWriteBranches`/`canManageCustomers`/
`canManageWorkshops`/`canManageInventory`/`canManageSettings`); `utils/enums.ts`
(`SUGGESTED_PROBLEM_CATEGORIES`, `SYSTEM_SETTING_TYPES`, `AI_RULE_TYPES`, `CAR_TYPE_SIZES`);
`app/router.tsx` (5 `ComingSoonRoute`s replaced with real pages); i18n (`branches.*`,
`customers.*`, `workshops.*`, `inventory.*`, `settings.*`, `enums.problemCategory.*`/
`systemSettingType.*`/`aiRuleType.*`/`carTypeSize.*`, ar + en).

Verified: `tsc -b` + `oxlint` clean across all five; every static i18n key checked in both locales,
every dynamic key manually confirmed against its enum's full value set. **Live verification
pending on all five** — the backend server wasn't running while this batch was built; every field
shape was cross-checked against the actual PHP source (migrations, models, DTOs, Resources,
Requests) rather than assumed from docs alone. Teaching docs added:
`docs/explanation/features/{branches,customers,workshops,inventory,settings}.md`.

---

## 🧩 M9 — Admins CRUD & Pricing Rules (2026-07-31)

Wired the newest backend pull (`car project/docs/09-new-admins-pricing-2026-07-30.md`).
**Admins is fully working end-to-end** (verified live). **Pricing Rule Types + Pricing Rules are
code-complete but blocked by two live-confirmed backend bugs** — see doc 09 §4/§5. No frontend
follow-up needed once the dev applies those two fixes.

**Admins** (`features/admin/`, added to the existing feature):
- `types.ts`: `Admin` + `AdminInput` (note: `image_url` is a plain URL **string** here, not a file
  — unlike Cars/Profile).
- `api.ts`: `useAdmins`, `useCreateAdmin`, `useUpdateAdmin`, `useDeleteAdmin`, `useSetAdminActive`
  (wraps the two dedicated `/activate` + `/deactivate` action endpoints).
- `AdminFormDialog.tsx`: password optional on edit ("leave blank to keep"); when a password *is*
  set, sends `password_confirmation` alongside it (Laravel's `confirmed` rule needs it in the
  request body, not just checked client-side).
- `AdminsPage.tsx`: list + create/edit/activate-deactivate/delete, same recipe as Categories.
- **Verified live:** create → 201, deactivate → 200 (`is_active: false`), delete → 200. Full
  round-trip against the real API with a throwaway test account (cleaned up after).

**Pricing** (`features/pricing/`, new feature):
- `types.ts` / `api.ts`: `PricingRuleType` (name/name_ar only) + `PricingRule` (relation to a
  type, `value`, `conditions`, `is_active`) — plain JSON POST, not multipart.
- `PricingRuleTypeFormDialog.tsx` + `Section`: identical shape to `CategoryFormDialog` (2 fields).
- `PricingRuleFormDialog.tsx` + `Section`: relation dropdown to rule type (like `ServiceFormDialog`),
  plus a **raw JSON textarea for `conditions`** — parsed/validated as a plain object at the form
  boundary (`JSON.parse` + type check), since the shape is backend-free-form per rule type (see
  doc 09 §2). Rules list shows `conditions` as an inline `<Code>` preview.
- `PricingPage.tsx`: 2-tab page (Rule Types / Rules), same shape as `CatalogPage`.
- **Live testing surfaced two real backend bugs** (documented in doc 09, flagged to the dev):
  the `pricing_rules` table is missing `name_ar` (a migration was edited after already running,
  so `POST /pricing-rules` 500s) and `GET /pricing-rule-types` 403s for everyone including
  super_admin (the permission seeder wasn't re-run after being split into finer-grained names).

**Plumbing:** `api/endpoints.ts` (`admins` with `activate`/`deactivate`, `pricingRuleTypes`,
`pricingRules` — all via the existing `crud()` helper); `utils/permissions.ts` (`admins` +
`pricing` module keys, both super_admin-only in `MODULES_BY_ROLE`); `layouts/navConfig.tsx` (two
new "system"-group sidebar items); `app/router.tsx` (`/admins`, `/pricing`, both
`RequireRole(['super_admin'])`); i18n `admin.*` additions + new `pricing.*` namespace (ar + en).

Verified: `tsc -b` + `oxlint` both clean; both locale JSON files parse. Teaching doc:
`docs/explanation/features/admin.md` extended; `docs/explanation/features/pricing.md` added.

---

## 🧩 M8 — Packages & Points (2026-07-29)

Wired the new backend domain (docs/08) following the plan in `docs/PLAN-M8-packages-points.md`.
All the ✅-unblocked phases are built; the ⛔ ones (all-points list, points config, "give
points") wait on the two backend fixes in docs/08 §6.

**Phase 0 — plumbing:**
- `api/endpoints.ts`: added `packages`/`packageServices`/`packageServiceSubServices` (reuse
  `crud()`), plus custom `userPackages` (cars-style URLs) and `points` + `pointsConfig`.
- `utils/enums.ts`: `PACKAGE_TYPES`, `USER_PACKAGE_STATUSES`, `POINTS_TX_TYPES`.
- `utils/permissions.ts`: new module keys `packages` + `subscriptions` (built + role maps) and
  `canManagePackages` (super-admin write).
- `layouts/navConfig.tsx`: two new sidebar items. `components/StatusChip.tsx`: added `earn`
  (green) / `redeem` (blue) mappings. `app/router.tsx`: `/packages` + `/subscriptions` routes.
- i18n: `packages.*`, `subscriptions.*`, new `field.*`, `enums.packageType.*`, `status.*`
  (expired/earn/redeem) in both en + ar.

**Phases 1–3 — Packages page** (`features/packages/`): a 3-tab page (Packages /
Package-services / Sub-services), each the catalog CRUD recipe (types + api hooks + FormDialog
+ Section). Prices handled as decimal-strings via `z.coerce.number()`.

**Phases 4–5 — Subscriptions page** (`features/subscriptions/`): a customer-id picker (cars
pattern), then that customer's loyalty-points `StatCard`, a user-packages CRUD table (edit
disabled once status is expired/cancelled, delete = super-admin only), and a read-only points
history table.

Verified: `tsc -b` + `oxlint` both clean. Teaching docs written:
`docs/explanation/features/packages.md` + `.../subscriptions.md` (folder-level, focused on what's
new vs the catalog/cars recipes).

---

## 🎨 Dashboard & sidebar polish pass (2026-07-29)

**Goal:** make the dashboard look closer to the client's fintech reference, using our colours.

**What changed:**
- **New `components/FeatureStatCard.tsx`** — gradient "hero" KPI card with a frosted icon badge
  and a blurred **backlight glow** behind it. See its explanation doc for the layered technique.
- **Dashboard** (`features/dashboard/DashboardHome.tsx`): the first 4 metrics (Cars, Categories,
  Services, Sub-services) now use `FeatureStatCard` with a cohesive blue → cyan → violet gradient
  set (not the old rainbow). Car types + Car brands stay as plain `StatCard`s for now.
- **Sidebar** (`layouts/DashboardLayout.tsx`): fixed a real bug — it used `bg="sidebar"`, a token
  that doesn't exist, so it silently rendered as the page background. Now `bg="surfaceAlt"`
  (`#0F131C`), so the sidebar is a distinct panel. Also tightened spacing (padding, row height,
  logo size) so **all nav items fit without scrolling**.

**Still open (bugs, not design):** the user's name shows as `?????? ?????` in the header/greeting
— an Arabic font/encoding issue to chase separately (the fonts load, so likely the stored value
or the API response encoding).

**Follow-up tweak (same day):**
- `FeatureStatCard` reworked from a bright saturated gradient (too harsh) to a **soft dark card
  with a low-opacity colour wash** driven by a single `tint` prop, and made a **true square**
  (`aspectRatio={1}`).
- Sidebar scroll eliminated properly: the 9 "coming soon" modules are now collapsed into one
  toggle section (collapsed by default) so the everyday nav fits, and the scrollbar itself is
  hidden via CSS (`scrollbarWidth: none`).

**Tables, buttons & forms polish (2026-07-29):**
- **Buttons:** added a `button` recipe tweak in `theme/system.ts` (pill radius + weight) so
  every button/icon-button across the app is consistent — one change, applied everywhere.
- **Forms:** `FormTextField` + `FormSelect` now have muted bold labels, rounded (`lg`) inputs,
  a hover border, and a brand-blue focus ring. Fixed the **white autofill boxes** bug (the
  email/password fields the browser had auto-filled) via a global `-webkit-autofill` override
  that repaints the field with our `surface` colour.
- **Table (`DataTable`):** uppercase spaced header labels, roomier rows (`py={4}`), explicit
  `surface` row bg with a smooth hover, and a clearer pagination readout (`1–3 of 3`).

**Second tweak (same day):**
- `FeatureStatCard` reworked again to a **bright light→dark gradient** of the tint (matching the
  client's reference card) with a glossy top-left highlight; squares made smaller by capping the
  row width. Uses `shade()`/`rgba()` helpers so one `tint` hex drives every layer.
- Dashboard headline row grew from 4 → **5 gradient squares** (added Car types); Car brands is a
  plain card beside the KPI info panel.
- **Smooth theme toggle:** added a colour-only CSS transition (0.4s) in `theme/system.ts`
  `globalCss`, so switching light/dark fades instead of snapping.

---

## ✅ Chakra UI migration (MP0–MP7) — replaced MUI

**Goal:** switch the UI library from **MUI → Chakra UI** to match the client's stack
(`docs/client-project-form.md`), and adopt the client's dark fintech design reference.

**What changed:**
- **Theme:** new `src/theme/system.ts` (Chakra `createSystem`) with the reference tokens
  (near-black navy `#0A0E17`, cards `#121722`, brand blue `#2D6BFF`, cyan accent, rounded cards).
  Dark/light driven by a `.dark` class on `<html>` from our `ColorModeContext` (no next-themes).
- **Providers:** `providers.tsx` now uses `ChakraProvider` (MUI ThemeProvider/CssBaseline/emotion
  RTL cache removed). Deleted `theme/index.ts`, `theme/rtlCache.ts`, `components/Placeholder.tsx`,
  `types/stylis-plugin-rtl.d.ts`.
- **Icons:** `@mui/icons-material` → `react-icons/md`.
- **Fonts:** Cairo + Tajawal now actually loaded via `index.html` (fixes the "?????" Arabic name).
- **Shared kit** (`src/components/*`) rewritten in Chakra with the SAME props, plus a new reusable
  `FormDialog` and `StatCard`. Dropdowns use Chakra `NativeSelect` (a real `<select>` — also fixes
  the earlier dropdown-automation limitation).
- **Layout redesign:** sidebar with grouped sections ("Manage"/"System"), active-item pill, icons,
  logout at bottom; slim top bar with search + theme/lang controls.
- **Dashboard:** Chakra `StatCard`s with gradient icon badges (real counts).
- **All feature screens** (catalog ×5 + dialogs, cars, approvals, staff, profile, coming-soon)
  ported to Chakra.
- **Removed deps:** `@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`, `@emotion/styled`,
  `stylis`, `stylis-plugin-rtl`, `next-themes`. Kept `@emotion/react` (Chakra peer).

**Status:** `tsc` + `oxlint` clean; zero `@mui`/`stylis` imports remain. Behavior/logic unchanged
(React Query, RHF, zod, routes, API layer all intact). Visual verification pending in the user's
running dev server.

> Note: after the switch, restart the dev server + clear `node_modules/.vite` so Vite re-optimizes
> the new deps (a stale cache shows "Failed to resolve import react-icons/md").

---

## ✅ M7 — Coming-soon shells + dashboard home (FINAL milestone)

**Goal:** complete the app's shell — full mockup sidebar, a dashboard landing, and styled
"coming soon" pages for unbuilt modules.

**Files added:** `src/components/StatCard.tsx`, `src/components/ComingSoon.tsx` (+ barrel exports),
`src/layouts/navConfig.tsx` (ordered nav items with icons), `src/features/dashboard/DashboardHome.tsx`,
`src/features/shell/ComingSoonRoute.tsx`. **Changed:** `utils/permissions.ts` (added coming-soon
`ModuleKey`s + `BUILT_MODULES` + fuller `MODULES_BY_ROLE`), `DashboardLayout.tsx` (icon sidebar +
"Soon" chips), `app/router.tsx` (dashboard home + 9 coming-soon routes). i18n: nav labels for all
modules + `dashboard.*` + `comingSoonBody` + `comingSoonNote.*` + `common.soon` (ar + en).
Doc: [`features/shell/README.md`](features/shell/README.md).

**Design choice:** dashboard shows **real counts** (cars/categories/services/sub-services/car
types/brands from existing hooks), not fake KPIs; an info alert notes operational KPIs come with
their endpoints.

**Verified live:** dashboard shows correct counts (10/3/6/4/4/14 = seeded data); full sidebar with
icons + "Soon" chips; coming-soon page (orders) shows localized title + per-module note. `tsc` +
`oxlint` clean; no console errors. (Browser-pane screenshot unavailable this session — verified via
page text.)

**🎉 All 8 milestones (M0–M7) complete.** The buildable scope (docs/06) is done. Remaining work is
blocked on backend endpoints (docs/07).

---

## ✅ M6 — Profile

**Goal:** view/edit own profile + avatar upload.

**Files:** `src/features/profile/api.ts` (already scaffolded — multipart `useUpdateProfile`) +
new `ProfilePage.tsx`. Router: `/profile` now renders `ProfilePage`. i18n: added `profile.*` and
`roles.*` (ar + en). Doc: [`features/profile/README.md`](features/profile/README.md).

**Details:** reads the current user from `useAuth()` (no separate query); image field is named
`image_url` (not `image` like cars); on success calls `setUser(updated)` so the top bar refreshes.

**Verified live:** page renders with data pre-filled + localized role chip; save posts
multipart → **200** + success alert. `tsc` + `oxlint` clean; no console errors.

**🐞 Backend bug #2 found & fixed:** `POST /profile/updateProfile` 500'd —
`UserService::updateUserProfile()` was typed `: User` but returns (and the controller consumes)
an **array** `['user'=>...]`. Fixed the return type to `: array` in
`CarCarePlus/app/Services/Operations/UserService.php`. **Relay to the client** (2nd profile-area
fix after the M1 middleware one).

> During this milestone the backend `php artisan serve` had stopped and the frontend restarted on
> **port 5174** (5173 was busy). Note the port when reconnecting the browser.

---

## ✅ M5 — Super-admin: approvals & staff

**Goal:** review company/workshop registration requests (approve/reject + reason) and create
staff accounts.

**Files added (`src/features/admin/`):** `types.ts`, `api.ts` (approve/reject/staff hooks),
`ApprovalsPage.tsx` (tabbed companies/workshops), `RejectReasonDialog.tsx`, `StaffPage.tsx`.
Router: `/approvals` and `/staff` now render the real pages (still `RequireRole super_admin`).
i18n: added `admin.*` (ar + en). Doc: [`features/admin/README.md`](features/admin/README.md).

**Verified:** Approvals renders (empty + with a pending company we registered). **Reject flow
end-to-end via UI** — `POST .../companies/1/reject` with reason → auto-refetch → row removed.
Staff-create contract live — `POST /admin/employees` → 201 with role mapped from `type`
(washer→employee_washer). Staff form renders with all fields. `tsc` + `oxlint` clean; no console
errors.

**Notes:** approve/reject route param is the **Company/Workshop model id** (≠ owner user id);
staff form uses the temporary seeded branches. **Test residue in dev DB:** a rejected company
(`qa-company@test.local`) + a test washer (`qa-washer@test.local`) — no delete-employee endpoint,
so re-seed/remove manually if desired.

---

## ✅ M4 — Cars

**Goal:** cars list + create/edit/delete, introducing **file uploads (multipart/form-data)**.

**Files added:** `src/utils/branches.ts` (⚠️ temporary 5 seeded branches), and
`src/features/cars/` → `types.ts`, `api.ts` (multipart `toFormData` + hooks), `CarFormDialog.tsx`,
`CarsPage.tsx`. Router: `/cars` now renders `CarsPage` (was placeholder). i18n: added `cars.*` and
`enums.fuel.*` (ar + en). Doc: [`features/cars/README.md`](features/cars/README.md).

**New patterns:** multipart uploads via `FormData` (image file + boolean→'1'/'0'); owner passed as
a **path param** (`POST /cars/{customer_id}`); **GET**-based delete; brand-id→name mapping for the
list (brand isn't eager-loaded); the branches workaround.

**Verified:** list renders 10 cars (brand mapping, localized fuel, branch/owner relations,
pagination). Multipart **create** (`POST /cars/4` form-data → 200, owner set from path) and
**GET delete** (`/cars/delete/{id}` → 200) verified against the live API; test car deleted. `tsc`
+ `oxlint` clean; no console errors.

**Notes:** (1) MUI dropdowns can't be driven by the browser-automation harness, so the full
click-through UI create wasn't automated — verified at the API-contract level instead (real users
are unaffected). (2) Backend to relay: create ignores `is_active` (only update honors it) → new
cars start inactive. (3) Blocker still open: no customer-lookup endpoint, so `customer_id` is a
numeric field for now.

---

## ✅ M3 (part 2) — Catalog: the other 4 resources

**Goal:** finish the catalog — Services, Sub-services, Car types, Car brands.

**Files added (`src/features/catalog/`):** `ServiceFormDialog.tsx` + `ServicesSection.tsx`,
`SubServiceFormDialog.tsx` + `SubServicesSection.tsx`, `CarTypeFormDialog.tsx` +
`CarTypesSection.tsx`, `CarBrandFormDialog.tsx` + `CarBrandsSection.tsx`. Extended `types.ts`
(Service/SubService/CarType/CarBrand + Inputs) and `api.ts` (React Query hooks for all four).
`CatalogPage.tsx` now wires all 5 tabs. i18n: added `field.*` (basePrice, price, priceMultiplier,
duration, vip…, logo) + `catalog.*` (add/edit/delete/empty per resource) + `common` yes/no/sar/min.
Doc: [`features/catalog/other-resources.md`](features/catalog/other-resources.md).

**New patterns introduced:** relation dropdowns (Service→category, Sub-service→service via
`useCategories`/`useServices`), number fields with `z.coerce.number()`, a **conditional field**
(`vip_extra_price` shown only when `is_vip_available` via `methods.watch(...)`), and image
preview from a path (`Avatar` + built URL) for car-brand logos.

**Verified in the browser (live API):** all 5 tabs load real seeded data (services show category
name, sub-services show service name, car types show ×multiplier, brands show logos +
pagination "1–10 of 14"). Created & deleted a test Car Type (number coercion + mutation +
auto-refetch). Confirmed the Service VIP price field appears only when the toggle is on.
`tsc` + `oxlint` clean; no console errors; DB left unchanged.

**M3 is now complete.** Next: M4 Cars.

---

## ✅ M3 (part 1) — Catalog: Categories CRUD

**Goal:** first full read/write screen; teach React Query.

**Files added (`src/features/catalog/`):** `types.ts`, `api.ts` (React Query hooks),
`CategoryFormDialog.tsx`, `CategoriesSection.tsx`, `CatalogPage.tsx` (tabs). Router: `/catalog`
now renders `CatalogPage` (was a placeholder). i18n: added `field.*`, `catalog.*`,
`common.comingSoon` in ar + en.

**New teaching doc:** [`02-react-query-data-fetching.md`](02-react-query-data-fetching.md) —
`useQuery` / `useMutation` / invalidation. Feature docs:
[`features/catalog/api.ts.md`](features/catalog/api.ts.md),
[`features/catalog/CategoriesSection.tsx.md`](features/catalog/CategoriesSection.tsx.md).

**Verified in the browser (live API):** list loads (3 seeded categories); **create** → observed
`POST /categories` then an automatic `GET /categories` (invalidation) → new row appeared;
**delete** → confirm dialog (localized, name interpolated) → row removed; write buttons show only
for super_admin; fully Arabic RTL. `tsc` + `oxlint` clean; no console errors. Test row was
deleted afterwards, so the DB is unchanged.

> Note on testing: browser input automation (`form_input` / typed keystrokes) didn't reliably
> trigger react-hook-form; setting values via the native setter + dispatching an `input` event
> works. This is a **test-harness quirk, not an app bug** — real users typing work fine (proven
> in M1).

**Still to do in M3:** Services, Sub-services, Car types, Car brands (same pattern), then M4 Cars.

---

## ✅ M2 — Shared UI kit

**Goal:** build the reusable components every screen is made from, styled to the design system.

**Files added (all under `src/components/`):**
- `PageHeader.tsx`, `StatusChip.tsx`, `states/Loader.tsx`, `states/EmptyState.tsx`,
  `states/ErrorState.tsx` — simple display pieces. Doc: [`components/README.md`](components/README.md).
- `ConfirmDialog.tsx` — yes/no modal for risky actions. Doc: [`components/ConfirmDialog.tsx.md`](components/ConfirmDialog.tsx.md).
- `DataTable.tsx` — generic client-side-paginated table. Doc: [`components/DataTable.tsx.md`](components/DataTable.tsx.md).
- `form/FormTextField.tsx`, `form/FormSelect.tsx`, `form/FormSwitch.tsx`,
  `form/ImageUploadField.tsx` — react-hook-form fields. Doc: [`components/form/README.md`](components/form/README.md).
- `index.ts` — barrel export.
- i18n: added `common.*` (confirm/retry/error/noData/rowsPerPage) + a `status.*` namespace.

**MUI v9 notes learned here** (differences from older MUI): style props like `fontWeight` /
`alignItems` must go inside `sx`; `Switch` no longer takes `inputRef`; the icon is
`ErrorOutlined` (not `ErrorOutline`); adornments use `slotProps={{ input: {...} }}`.

**Status:** code-complete; `tsc` + `oxlint` clean. Not wired to any route yet, so they'll be
**visually verified in M3** when the catalog screen renders them.

---

## ✅ M0 — Theme upgrade (dark default + light toggle)

**Goal:** make the app look like the design images before building screens.

**Files changed / added:**
- 🆕 `src/theme/colorMode.ts` — a Context carrying `{ mode, toggle }`. Doc: [`theme/colorMode.ts.md`](theme/colorMode.ts.md).
- ✏️ `src/theme/index.ts` — `buildTheme(mode, direction)` with the image color tokens (navy
  bg, royal blue, orange, green), pill buttons, rounded cards. Doc: [`theme/index.ts.md`](theme/index.ts.md).
- ✏️ `src/app/providers.tsx` — holds the `mode` state (default **dark**, saved to
  `localStorage`), provides `ColorModeContext`. Doc: [`app/providers.tsx.md`](app/providers.tsx.md).
- ✏️ `src/layouts/DashboardLayout.tsx` — sun/moon toggle button in the top bar. Doc:
  [`layouts/DashboardLayout.tsx.md`](layouts/DashboardLayout.tsx.md).
- ✏️ `src/i18n/locales/ar.json` + `en.json` — added `common.darkMode` / `common.lightMode`.

**Verified in the browser:** dark is the default (body `#0B1220`); toggle flips to light
(`#F4F6FB`) and the choice persists across reloads.

---

## ✅ M1 — Login working end-to-end

**Goal:** prove the whole API layer against the real Laravel backend.

**Verified in the browser (with the live API):**
- ✅ Login (`superadmin@system.com`) → redirected to the dashboard.
- ✅ Sidebar shows the correct **super_admin** menu (role-based).
- ✅ **Refresh keeps you logged in** (session restored via `GET /profile/showProfile`).
- ✅ Logout revokes the token and returns to `/login`.
- ✅ No console errors; `tsc` + `oxlint` clean.

**Frontend change:** `src/auth/AuthContext.tsx` — boot session-restore now only logs out on a
real **401**, not on any error. Doc: [`auth/AuthContext.tsx.md`](auth/AuthContext.tsx.md).

### 🐞 Backend bug found & fixed during M1
`GET /profile/showProfile` returned **HTTP 500**:
> `UserService::getUserProfile(): Return value must be of type App\Models\User, null returned`

**Root cause:** in `CarCarePlus/routes/api.php`, the `profile` route group was **missing the
`auth:sanctum` middleware** (the group was labeled "Authenticated user" but wasn't protected).
So the token was ignored, `auth()->user()` was `null`, and the typed return blew up.

**Fix (one line):** added the middleware to the group, matching the `cars` group pattern:
```php
Route::middleware('auth:sanctum')   // ← added
    ->prefix('profile')
    ->group(function () {
        Route::get('/showProfile', [UserController::class, 'showProfile']);
        Route::post('/updateProfile', [UserController::class, 'updateProfile']);
    });
```
After the fix the endpoint returns **200** with the user object. Laravel's dev server picked
up the change automatically (routes weren't cached).

> ⚠️ Note for the backend owner: the same `updateProfile` route was in that unprotected group,
> so profile updates were affected too — both are fixed now. Worth telling the client so it's
> reflected in their source.

---

## خلفية الوضع الداكن = خلفية صفحة الدخول (2026-08-16)

**الملف:** `src/theme/system.ts`

كانت خلفية الداشبورد في الوضع الداكن تستخدم نفس ألوان صفحة الدخول لكن **باتجاه معكوس**:

| | صفحة الدخول | الداشبورد (قبل) |
|---|---|---|
| إنجليزي (LTR) | `to top right` (الأزرق أسفل يسار ← الداكن أعلى يمين) | `135deg` = `to bottom right` (الأزرق **أعلى**) |
| عربي (RTL) | `to top left` | `225deg` = `to bottom left` |

النتيجة أن الشاشتين تبدوان مختلفتين رغم أن الألوان واحدة. الإصلاح: بدل تكرار التدرّج،
جعلنا متغيّر الداشبورد **اسماً بديلاً (alias)** لمتغيّر الدخول:

```css
html.dark[dir="rtl"] { --app-bg-grad: var(--brand-bg-grad); }
html.dark[dir="ltr"] { --app-bg-grad: var(--brand-bg-grad); }
```

> **الفكرة (بلغة Laravel):** بدل نسخ نفس القيمة في مكانين ثم نسيان تحديث أحدهما، جعلنا
> أحدهما يقرأ من الآخر — تماماً مثل `config('app.url')` بدل كتابة الرابط يدوياً في كل ملف.
> الآن أي تعديل على تدرّج الدخول ينعكس تلقائياً على الداشبورد، ولا يمكن أن يتباعدا مرة أخرى.

الوضع الفاتح لم يتغيّر (أبيض نظيف `#FFFFFF → #F5F7FA`).

**التحقق:** `npx tsc -b` = 0. بصرياً: بدّل للوضع الداكن → الأزرق الساطع يبدأ من أسفل جهة
السايدبار ويتدرّج للداكن في الأعلى المقابل، بنفس مشهد صفحة الدخول. جرّبه بالعربي والإنجليزي.
قد تحتاج **Ctrl+Shift+R**.

---

## ترويض التدرّج + توكنات السايدبار (2026-08-16)

**الملفات:** `src/theme/system.ts` · `src/layouts/DashboardLayout.tsx`

بعد جعل خلفية الداكن مطابقة للدخول ظهرت مشكلة: التدرّج يبدأ **أزرق ساطع `#0066FF` من الركن
السفلي**، وهناك بالضبط يقع **أسفل السايدبار** — فصار نصف القائمة داكناً ونصفها أزرق ساطع،
وذاب نص `fgMuted` واختفى زر Logout.

### 1) ترويض التدرّج (الداكن)
أبقينا نفس عائلة اللون ونفس الاتجاه، لكن أزلنا ذروة السطوع وأبعدناها عن السايدبار:

```css
/* قبل: #0066FF 0% ← الأزرق الساطع تحت السايدبار مباشرة */
linear-gradient(to top right, #0B1A3A 0%, #14306b 40%, #0D1A32 72%, #080D1A 100%)
```

السايدبار عرضه 260px ≈ 14% من الشاشة، فهو يقع في أول ~0–14% من محور التدرّج → يجلس الآن على
`#0B1A3A` (كحلي داكن، تباين ممتاز)، بينما ذروة الأزرق `#14306b` انتقلت إلى 40% أي **داخل
منطقة المحتوى**.

### 2) توكنان جديدان بدل الألوان اليدوية

```ts
navActiveBg: { base: 'rgba(0,102,255,0.10)', _dark: 'rgba(51,133,255,0.18)' }
navHoverBg:  { base: 'rgba(0,0,0,0.05)',     _dark: 'rgba(255,255,255,0.07)' }
```

> **لماذا شفّافة وليست `surfaceAlt`؟** السايدبار `bg="transparent"` فوق تدرّج. لون **معتم**
> عند hover يثقب مستطيلاً مسطّحاً في التدرّج (كان هذا سبب الوميض المزعج). أما لون **شفّاف**
> فيُفتّح ما خلفه فقط، فيبدو صحيحاً في كل نقطة من التدرّج وفي الوضعين معاً.
>
> **بلغة Laravel:** مثل استخدام `@include` مع متغيّر بدل نسخ HTML ثابت — قيمة واحدة تتكيّف
> مع سياقها بدل قيمة مكتوبة يدوياً تكسر في نصف الحالات.

استبدلنا في `DashboardLayout.tsx`:
- العنصر النشط: `rgba(37,99,235,0.12)` (مكتوب يدوياً، مخالف لقاعدة «توكنات فقط») → `navActiveBg`.
- hover عنصر القائمة: `surfaceAlt` → `navHoverBg`.
- hover زر Logout: `surface` → `navHoverBg`.

**التحقق:** `npx tsc -b` = 0. بصرياً في الداكن: السايدبار كامله بلون داكن واحد من أعلاه
لأسفله، Logout ظاهر، والأزرق يظهر كتوهّج في وسط منطقة المحتوى. جرّب hover على عنصر غير نشط
في أعلى القائمة وفي أسفلها — يجب أن يبدو التفتيح متساوياً. **Ctrl+Shift+R**.

---

## إصلاح «إضافة ورشة» + منتقي المالك (2026-08-16)

**الواجهة:** `api/endpoints.ts` · `features/workshops/{types,api,WorkshopFormDialog}.tsx` ·
`components/form/FormTextField.tsx` · `i18n/locales/{ar,en}.json`
**الباك:** `routes/api.php` · `WorkshopController` · `WorkshopService` · `WorkshopRepository` ·
`CreateWorkshopRequest`

### المشكلة
زر «إضافة ورشة» يرجع 500 بنصّ SQL خام. السبب: `workshops.user_id` عمود `NOT NULL` بينما
التحقّق يصفه `nullable` — فالطلب يمرّ ثم ترفضه MySQL.

### ما هو `user_id` أصلاً؟
الورشة **تسجّل دخولها** إلى النظام (مثل حساب `workshop@system.com`): تستقبل الحجوزات وتُسند
الفنيين. فـ `user_id` هو **حساب مالك الورشة** — علاقة `Workshop belongsTo User`. ورشة بلا
`user_id` = ورشة لا يستطيع أحد الدخول إليها.

### لماذا لم يكن الحقل موجوداً؟
لأن المسار المصمَّم لإنشاء ورشة هو `POST register/workshop` (تسجيل ذاتي → موافقة السوبر أدمن)،
وهناك يملأ الخادمُ `user_id` تلقائياً. أما `POST /workshops` فمسار ثانوي يفترض أن الحساب موجود.

### الحل — قائمة منسدلة، لا حقل رقمي
حقل رقمي يطلب من الأدمن حفظ أرقام المستخدمين = تصميم سيّئ. لكن القائمة المنسدلة تحتاج مصدراً،
ولم يكن في الباك أي `GET /users` (فقط `GET /users/{user}`). فأضفنا endpoint مخصّصاً:

```
GET /api/workshops/owner-candidates      (can:add.workshop — سوبر أدمن فقط)
→ User::role('workshop')->whereDoesntHave('workshop')->orderBy('name')->get()
```

> **لماذا endpoint مخصّص وليس `GET /users?role=workshop`؟** لأن الصلاحية `show.users` يملكها
> **العميل الشخصي** أيضاً (`RolePermissionSeeder` سطر 246) — فقائمة مستخدمين عامة محميّة بها
> تسرّب كل الحسابات للعملاء. الـ endpoint المخصّص يُرجع **فقط** حسابات دور `workshop` غير
> المرتبطة، ولسوبر أدمن فقط. صفر سطح تسريب.
>
> **بلغة Laravel:** الفرق بين `Route::apiResource('users')` عامّ، وبين `route` يجيب على سؤال
> واحد محدّد. الثاني أضيق وأأمن ولا يحتاج صلاحية جديدة (= لا `migrate:fresh --seed`، = لا فقدان بيانات).

**ترتيب المسارات مهم:** سُجِّل `owner-candidates` **قبل** `/workshops/{workshop}`، وإلا ابتلعه
المسار العام وحاول Laravel إيجاد ورشة رقمها `"owner-candidates"`. وأضفنا `->whereNumber('workshop')`
على مسار العرض تحصيناً دائماً.

### التحقّق أيضاً
`CreateWorkshopRequest`: `user_id` صار `required` + `unique:workshops,user_id` (مطابقةً لـ
`User::workshop()` وهي `HasOne` — حساب واحد لا يملك ورشتين). النتيجة: **422 على الحقل** بدل 500 خام.

### الواجهة
- `useWorkshopOwnerCandidates(enabled)` — يجلب فقط عندما يكون الحوار **مفتوحاً وفي وضع إنشاء**.
- `FormSelect` بعنوان «حساب المالك»، تسمية كل خيار `الاسم — البريد`.
- تظهر في **الإنشاء فقط**؛ التعديل يحذف `user_id` من الحمولة لأن الـ API يرفض إعادة تعيين المالك.
- تنبيه واضح حين تكون القائمة فارغة.
- `FormTextField` اكتسب خاصية `helper` اختيارية (نصّ رمادي صغير تحت الحقل، يختفي عند وجود خطأ).

### التحقّق الفعلي
`npx tsc -b` = 0 · `php artisan route:list --path=workshops` يُظهر المسار الجديد ·
`GET /workshops/owner-candidates` = 200 · إنشاء بلا `user_id` = **422** (كان 500).

### ⚠️ قيد متبقٍّ
`registerWorkshop` ينشئ المستخدم والورشة **معاً**، فلا ينشأ حساب ورشة بلا ورشة طبيعياً →
القائمة **فارغة على قاعدة مزروعة حديثاً**، وتمتلئ فقط بعد **حذف** ورشة. الحل الكامل: أن ينشئ
`POST /workshops` حساب المالك ضمنياً. موثّق في `docs/إصلاحات-الباك-المطلوبة.md §8`.

---

## شاشة السيارات: 404 ثم 500 — منتقي العميل (2026-08-16)

**الواجهة:** `features/cars/CarFormDialog.tsx` · `i18n/locales/{ar,en}.json`
**الباك:** `routes/api.php` · `CarController.php` · `RolePermissionSeeder.php`

### 1) الشاشة فارغة — 404
`GET /api/cars/all` كان 404 لأن مسارات `CarController` **الستّة** مسجَّلة **بلا بادئة `cars/`**
وموزّعة على أربع مجموعات مختلفة. أضفنا البادئة في الباك؛ **الواجهة لم تتغيّر** لأنها كانت
تطلب المسار الصحيح منذ البداية.

اكتشفنا أثناء ذلك أن `POST /api/{customer_id?}` كان **مسار التقاط عام على جذر الـ API**:
أي `POST /api/5` ينشئ سيارة. أي مسار POST جديد بمقطع رقمي واحد كان معرّضاً للابتلاع صامتاً.

### 2) الإضافة تنفجر — 500 بمفتاح أجنبي
```
SQLSTATE[23000]: 1452 ... cars_user_id_foreign ... values (5555, ...)
```
النموذج كان يعرض حقلاً رقمياً «رقم العميل»، والباك يأخذه من **الرابط** ويكتبه مباشرةً.

> **لماذا لم يلتقطه `CreateCarRequest`؟** لأن `FormRequest` يتحقّق من **جسم الطلب فقط**،
> و`customer_id` مقطع في الرابط (`/cars/{customer_id?}`). و`whereNumber` يضمن أنه **رقم** لا
> أنه **موجود**.
>
> **بلغة Laravel:** الفرق بين `$request->validated()` و `Route::bind`/`findOrFail`. المقاطع
> في الرابط تحتاج إمّا Route Model Binding وإمّا تحقّقاً يدوياً — وهنا لم يوجد أيّهما.

**الباك:** أضفنا فحص `User::find()` + التأكّد من أن الدور عميل، وأرجعنا `Response::Validation`
(422) بدل `Response::Error` التي قيمتها الافتراضية **500**.

### 3) الواجهة: قائمة منسدلة بدل الحقل الرقمي
نفس مبدأ منتقي مالك الورشة. المصادر موجودة مسبقاً هنا:

```ts
const personalCustomers = usePersonalCustomers();   // GET /customers/personal
const companyCustomers  = useCompanyCustomers();    // GET /customers/company
```

> ⚠️ **فخّ تحقّقنا منه قبل الكتابة:** السيارة تنتمي إلى **مستخدم** (`cars.user_id`)، فالقائمة
> يجب أن تعطي **معرّفات مستخدمين**. فحصنا قاعدة البيانات: `GET /customers/company` يُرجع
> `id: 5`، والمستخدم رقم 5 هو صاحب دور `customer_company` — بينما `companies.id` للسجلّ نفسه
> هو **1**. لو افترضنا أنه معرّف الشركة لأُنشئت السيارة **لمالك خاطئ بلا أي خطأ ظاهر** — وهو
> أسوأ من الانفجار، لأنه يمرّ صامتاً.

الشركات تُعرَض بوسم `(شركة)` لتمييزها في قائمة واحدة مسطّحة. دور `admin` لا يملك
`show.company_customers` فيحصل على 403 وتظهر له قائمة الأفراد فقط — تدهور مقبول.

المفتاح `cars.customerId` («رقم العميل») استُبدل بـ `cars.customer` («العميل (المالك)»)
و`cars.customerCompanyTag` في اللغتين.

### التحقّق الفعلي
`npx tsc -b` = 0 · `GET /cars/all` = 200 مع 9 سيارات (كان 404) ·
`POST /cars/5555` = **422** (كان 500) · `POST /cars/1` (سوبر أدمن) = **422** ·
`POST /cars/26` (عميل حقيقي) = **نجح**، ثم حذفنا سيارة الاختبار.

---

## منتقي العميل المشترك + صفحة الاشتراكات (2026-08-16)

**الملفات:** `features/customers/api.ts` · `features/subscriptions/SubscriptionsPage.tsx` ·
`features/cars/CarFormDialog.tsx` · `i18n/locales/{ar,en}.json`

### المشكلة
صفحة **الاشتراكات والنقاط** كانت تطلب **رقم عميل** يدوياً + زرّ «عرض». وكان التعليق في الكود
يبرّر ذلك بأنه «لا يوجد endpoint للعملاء» — وهو **افتراض قديم لم يعد صحيحاً**:
`GET /customers/personal` و`GET /customers/company` موجودان ونستخدمهما في شاشة العملاء.

### الحل: استخرجنا الدالّة المشتركة أوّلاً
كنّا سنكتب منطق دمج قائمتَي العملاء **مرّة ثانية** (بعد `CarFormDialog`). القاعدة في
`.claude/skills/frontend-design`: «إن نسخت JSX مرّتين، استخرج مكوّناً». هنا المتكرّر ليس الشكل
بل **منطق البيانات**، فاستخرجنا **hook** لا مكوّناً:

```ts
export function useCustomerOptions(): { isLoading: boolean; options: CustomerOption[] }
```

> **بلغة Laravel:** هذا ما تفعله حين تنقل استعلاماً متكرّراً من عدّة Controllers إلى **Service**
> أو **Query Scope**. القاعدة الحرجة (أن `value` هو **معرّف المستخدم** لا معرّف الشركة) تُوثَّق
> وتُطبَّق في **مكان واحد**، بدل أن تُنسى في الاستخدام الثالث.

أعدنا كتابة `CarFormDialog` ليستهلكها بدل منطقه الخاص.

### صفحة الاشتراكات
استبدلنا `Input` الرقمي **وزرّ «عرض» معاً** بقائمة `NativeSelect`:

```tsx
onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : undefined)}
```

> **لماذا حذفنا الزر؟** لأن **الاختيار نفسه هو الفعل**. الزر كان ضرورياً حين يُكتب الرقم يدوياً
> (لتفادي طلب على كل ضغطة مفتاح)، أما مع القائمة فالاختيار حدث واحد مكتمل. نقرة أقلّ،
> **ولا سبيل لإدخال رقم غير موجود أصلاً**.

حذفنا `load` و`customerInput` والمفتاح `subscriptions.load`، وحدّثنا `hint` و`enterCustomer`
من «أدخل رقم العميل» إلى «اختر عميلاً» في اللغتين، وأضفنا `subscriptions.selectCustomer`.

### ملاحظتان تقنيّتان (Chakra v3)
- `NativeSelect.Field` **لا يقبل** `disabled` — يوضع على `NativeSelect.Root`.
- عند بناء مصفوفة خيارات بحقل اختياري (`isCompany`)، يستنتج TS النوع من **أوّل** عنصر
  فيسقط الحقل. الحلّ: تعريف `CustomerOption` صراحةً وتحديد نوع خرج الـ hook.

### المتبقّي من نفس النمط
`AssignOrderDialog` ما زال يستخدم حقل `employee_id` رقمياً. **لا ينهار** —
`AssignBookingRequest` يتحقّق من `exists:employees,id` فيعطي 422 نظيفاً — لكنه يحتاج
endpoint جديداً `GET /employees` ليصبح قائمة منسدلة. لم يُنفَّذ بعد.

**التحقّق:** `npx tsc -b` = 0.

---

## الشعار: من PNG أبيض إلى SVG متكيّف مع الثيم (2026-08-16)

**الملفات:** `components/Logo.tsx` · `theme/system.ts` · `layouts/DashboardLayout.tsx` ·
`auth/pages/LoginPage.tsx` · `index.html` · `public/brand/{emblem.svg,logo-source.svg}`

### التشخيص — فحصنا الـ PNG بكسلاً بكسل
| القياس | النتيجة |
|---|---|
| الشفافية | **معدومة** — كل البكسلات `alpha=255` |
| الزوايا | `(255,255,255)` أبيض صافٍ |
| «القرص» | `(248,249,253)` — لا يكاد يُميَّز عن محيطه |
| نسبة الأبيض | **39% أبيض صافٍ** |
| الأبعاد | `896×937` غير مربّعة، والشعار **غير متمركز** (183px فوقه مقابل 82px تحته) |

الملف لم يكن «شعاراً على قرص أبيض» بل **مستطيلاً أبيض** في وسطه الشعار، و«القرص» كان مجرّد
دائرة يقتطعها قناع CSS. هذا يفسّر الوهج (ألمع شيء على الشاشة)، والحجم الوهمي (104px منها
~75px شعار فقط)، والإحساس بأنه «طافٍ» (لأنه فعلاً غير متمركز).

### كيف حدّدنا ألوان المسارات — بالقياس لا بالتخمين
المستخدم زوّدنا بـ SVG متجه، لكنه **تتبّع أحادي اللون** (`fill=\"#000000\"` لكل المسارات
الستّة) — فقد التلوين الثنائي. فبدل التخمين:

1. رندرنا **كل مسار على حدة** إلى PNG بقناع (`cairosvg`).
2. لكل بكسل داخل القناع، قرأنا لون **الـ PNG الأصلي** في نفس الإحداثي.
3. صنّفنا الألوان إلى BLUE / NAVY / white وأحصينا.

```
path 1:  20308px  BLUE=100%     → القوس
path 2:  23755px  NAVY=99%      → الترس
path 3/4/5: BLUE=100%           → البريقات
path 6:  60560px  NAVY=79% BLUE=13%  → السيارة + المفتاح (مدموجان)
```

> **المفتاح:** ظهر أنه مدموج مع السيارة في outline واحد (`M` واحدة فقط في `d`). جرّبنا عزله
> بقصّ مستطيل فوجدنا **48% تلوّثاً** ببدن السيارة — فالفصل مستحيل بلا تحرير متجهي يدوي.
> قبلناه بلون السيارة؛ غير محسوس بحجم 44px.

### الحل
`Logo.tsx` صار **SVG مضمّناً** (~6KB بدل 279KB)، بمجموعتَي مسارات ولونين من متغيّرات CSS
معرّفة في `system.ts`:

| | فاتح | داكن |
|---|---|---|
| `--logo-base` (السيارة + الترس) | `#0F1D33` | **`#FFFFFF`** |
| `--logo-accent` (القوس + البريقات) | `#0066FF` | `#3385FF` |

في الداكن يصبح الشعار **أبيض مباشرةً على التدرّج — بلا أي قرص إطلاقاً**. هذا هو الغرض كلّه.

> **لماذا متغيّرات CSS خام لا توكنات دلالية؟** لأنها تُستهلك في خاصية `fill` على عناصر
> `<path>` نيّئة، وهي خارج مسار خصائص Chakra. نفس أسلوب `--app-bg-grad` المُثبت في الملف،
> والقيم تبقى في `system.ts` لا في المكوّن.

**الإطار:** `viewBox=\"166 151 601 601\"` — حسبناه من اتّحاد أُطر المسارات الستّة، مربّعاً
ومتمركزاً بحشو 4%، فزال الانزياح تماماً.

### فخّ صفحة الدخول ⚠️
بطاقة الدخول **زجاجية بيضاء في الوضعين**. فلو تبع الشعارُ الوضعَ لصار **أبيض على أبيض =
مختفٍ تماماً** عند تسجيل الدخول في الوضع الداكن. أضفنا `tone=\"onLight\"` يثبّت الحبر الداكن،
مع زوج متغيّرات `--logo-*-on-light` **لا ينقلب أبداً**.

### السايدبار
`<Logo height={104} fade />` فوق توهّج مكتوب يدوياً `rgba(0,102,255,0.16)` (مخالف لقاعدة
«توكنات فقط») ← استُبدل بـ **لوحة هوية**: شعار 44px + اسم «CarCarePlus» نصّاً. نفس الهوية
بجزء يسير من الوزن البصري، والتوهّج حُذف لأن الشعار لم يعد يحتاج اختراق قرص أبيض.

### الأيقونة (favicon)
`emblem.jpeg` (JPEG بمربّع أبيض) ← أضفنا `emblem.svg` متجهاً، وبداخله
`@media (prefers-color-scheme: dark)` فيتكيّف حبره مع ثيم **المتصفّح** (لا ثيم التطبيق —
الأيقونة تُعرض على شريط التبويبات). أبقينا الـ JPEG كاحتياطي ولأيقونة Apple (يجب أن تكون نقطية).

### ملفات
- `public/brand/logo-source.svg` — المتجه الأصلي محفوظاً كمرجع.
- `public/brand/logo.png` — **لم يعد مستخدماً** (279KB). آمن حذفه.

**التحقّق:** `npx tsc -b` = 0 · رندرنا الشعار في الوضعين وفحصنا الصورتين بصرياً · `emblem.svg`
XML صالح.

---

## M28 — واجهة الإشعارات (2026-08-16)

**ملفات جديدة:** `features/notifications/{types.ts,api.ts,NotificationsDialog.tsx}`
**معدّلة:** `api/endpoints.ts` · `utils/permissions.ts` · `layouts/DashboardLayout.tsx` · `i18n/*`

### لماذا كانت محجوبة ولماذا فُتحت الآن
M28 كانت موقوفة لأن الباك يولّد الإشعارات ولا يوفّر endpoints لقراءتها. التزام الباك
`6b4b477` أضاف المسارات الخمسة، فسحبناها وبنينا الواجهة.

### تشخيص «الإشعارات لا تصل» — ثلاث طبقات
عند الإبلاغ عن أن الإشعارات لا تصل رغم عمل `queue:work`، تبيّن أن الطابور **سليم تماماً**:

```
notifications rows in DB: 4      ← تُولَّد وتُخزَّن فعلاً
failed_jobs: 0 | pending: 0      ← لا أعطال
GET /api/notifications → 404     ← الكود المشغَّل بلا المسارات (نسخة قديمة)
```

السبب كان تراكم ثلاث طبقات: (1) الباك المحلي متأخّر التزاماً واحداً، (2) لا واجهة أصلاً،
(3) الصلاحيات موجودة كصفوف لكن **غير ممنوحة** لأي دور. الطبقة الثالثة كانت ستُظهر **403 لا 404**
بعد السحب — ولولا فحصها لبدا الأمر عطلاً جديداً.

### البنية
- `useUnreadCount(enabled)` — يستطلع كل **60 ثانية**.
- `useNotifications(enabled)` — يُجلب **فقط عند فتح اللوحة**.
- `useMarkNotificationRead` / `useMarkAllNotificationsRead`.

> **لماذا الاستطلاع (polling)؟** لا يوجد WebSocket ولا SSE في الباك، فهو السبيل الوحيد لملاحظة
> إشعار جديد. اخترنا 60 ثانية عمداً: أقصر منها يُرهق الـ API من أجل رقم نادر التغيّر.
>
> **مفتاح دقيق:** `notificationKeys.all` **بادئة** لكلٍّ من `list` و`unread`، فإبطال واحد
> يحدّث الصفّ **والعدّاد معاً**. لو فصلناهما لأمكن أن يقول الشارة «3» والقائمة كلها مقروءة.

### الصلاحيات — مطابقة حرفية للباك
`canSeeNotifications(role)` يعكس **بالضبط** الأدوار الخمسة التي منحها الـ Seeder. **العملاء
مستثنون في الباك**، فلو أظهرنا لهم الجرس لعرضنا زرّاً كل نقرة عليه تُرجع 403.

### الواجهة
جرس في النافبار + شارة حمراء بالعدد (`99+` عند التجاوز)، تفتح `Dialog` (استخدمنا
`Dialog` لا `Popover` لأنه النمط **المُثبت** في المشروع — `ConfirmDialog`/`FormDialog` —
ولا مخاطرة في واجهة Chakra v3 غير مجرّبة). كل صفّ: نقطة ملوّنة حسب `type` (بارتداد إلى
`gray` للقيم غير المعروفة، فالـ enum قد ينمو في الخادم)، وخلفية `navActiveBg` لغير المقروء.

### التحقّق الفعلي
`npx tsc -b` = 0. والدورة كاملة على خادم حيّ بإشعار اختبار أنشأناه ثم **حذفناه**:
```
badge before: 1  →  POST /{id}/read: 0  →  POST /read-all: 0
```

### 🔴 ثغرة في الباك أبلغنا عنها
`NotificationController::show` حارس الملكية فيها **معطّل بتعليق** (`//$this->authorizeOwnership`)
بينما `markAsRead`/`destroy` تستدعيانه. أي مستخدم يقرأ إشعار أي مستخدم آخر بتخمين الرقم —
IDOR. موثّقة في `docs/تعديلات-الباك-للمطوّر.md §ب-6`. **لم نعدّل ملفات الباك** لأجلها.

---

## How to keep this log

Each milestone (M2 UI kit, M3 catalog, …) adds a section here when it's done: files changed,
what was verified, and any bugs found. It's the human-readable history of the project.
