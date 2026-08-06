# `features/subscriptions/` — Customer subscriptions & loyalty points

This folder is the **Subscriptions** screen (M8): for a given customer, show their package
subscriptions (`user-packages`) and their loyalty **points** (balance + history).

**The key difference from Packages:** everything here is **scoped to one customer**. There is
still no `/customers` list endpoint (see docs/07), so — exactly like the **Cars** screen — the
admin **types a customer ID** and we load that customer's data. If you understood Cars, you
understand the data flow here.

**Laravel mental model:** the page is like a Blade view that takes a `?customer_id=` query param
and renders three partials (a points card, a subscriptions table, a history table). The
`customer_id` in the URL of each API call is the same as `Route::get('/user-packages/{customer}')`.

---

## `types.ts`

Four shapes:
- **`UserPackage`** — one subscription (which package, `remaining_count`, `status`, dates). It
  nests `package` (the full `Package` object) so we can show the package name.
- **`UserPackageInput`** (create: just `package_id` + optional `status`) and
  **`UserPackageUpdateInput`** (update: `remaining_count` + `status`) — note create and update
  take **different** fields, which is why the dialog renders different inputs for each (below).
- **`PointsBalance`** — `{ customer_id, balance }`.
- **`PointsTransaction`** — one earn/redeem row.

---

## `api.ts` — hooks scoped by `customerId`

Same React Query shape as everywhere else, with **two new ideas**:

1. **`enabled: customerId != null`** on the queries. This tells React Query *"don't fire this
   request until we actually have a customer ID."* Before the admin picks one, the hooks sit
   idle — no wasted 404/403 calls. (Laravel analogy: an early `return` guard before you query.)
2. **The query keys include the customerId** — `['user-packages', customerId]`. So each
   customer's data is cached separately, and switching customers loads the right cache. The write
   hooks take `customerId` too, so after a create/update/delete they invalidate *that customer's*
   list, not a global one.

Endpoints follow the cars convention: optional `customer_id` in the URL for list/create, and the
literal `/show/` and `/update/` segments for single records (see `api/endpoints.ts`).

`usePointsBalance` and `usePointsHistory` are plain read-only queries — no mutations, because the
"give points" write is still blocked backend-side (docs/08 §6).

---

## `UserPackageFormDialog.tsx` — create OR edit, different fields

One dialog, two modes (driven by whether `row` is passed):
- **Create** (`row` is null): shows the **package** dropdown (`usePackages`) + a status select.
- **Edit** (`row` set): shows a **`remaining_count`** number field + status select (you don't
  change which package an existing subscription is for).

The zod schema keeps `package_id` required so create is valid; on edit we pre-fill it from `row`
even though the field is hidden, so validation still passes. `status` defaults to `active`.
Takes a `customerId` prop so the create hook posts to the right customer.

---

## `SubscriptionsPage.tsx` — the screen that ties it together

Flow, top to bottom:
1. **`PageHeader`** with title + hint.
2. **Customer picker** — a rounded `Input` (type number) + a "Load" button. Typing an id and
   clicking Load (or pressing Enter) sets `customerId` state, which switches on all the queries.
   Until then we show an `EmptyState` ("enter a customer id").
3. Once a customer is loaded, a `Stack` of three sections:
   - **Points balance** — a single `StatCard` (reuses the dashboard component).
   - **Subscriptions** — a `DataTable` of the customer's `user-packages`, with an "Add" button
     and edit/delete actions.
   - **Points history** — a read-only `DataTable`.

**Business rule (from docs/08 §4) implemented here:** a subscription whose status is
`expired` or `cancelled` is **read-only** — the edit button is `disabled` for those rows
(`LOCKED_STATUSES`). **Delete** is shown only to super-admin (`canDelete`), while add/edit are
allowed for admin + super-admin (`canWrite`). The backend 403 is still the real gate; this is
just so the UI doesn't offer actions that would fail.

---

## When you'll touch these files

- **A `/customers` endpoint ships** → replace the manual id `Input` with a searchable customer
  dropdown; everything else stays.
- **The backend wires "give points"** (`POST /points/transactions`) → add a mutation hook in
  `api.ts` + a small dialog (type / points / note), then invalidate the balance + history keys.
- **Show more subscription fields** → add to `types.ts` + a column in `subColumns`.

See also: `../PLAN-M8-packages-points.md` and the Cars docs for the `customer_id`-in-URL recipe.
