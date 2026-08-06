# `features/branches/` — Branches (M10)

This is the milestone that finally retires our oldest workaround. If you've read the catalog
docs, you already know 90% of this — it's the same CRUD recipe. This doc covers the two things
that are genuinely new: the **admin-picker dropdown** and **retiring `utils/branches.ts`**.

## The resource

`{ id, admin_id, manager?, name, name_ar, city, address, latitude, longitude, phone, is_active,
working_hours, is_24h }`. `manager` is the branch's admin, eager-loaded by the backend.
`working_hours` is free-form JSON (like pricing-rule `conditions`) — we skip building a form
field for it in v1, same call we made for pricing rules; add a JSON textarea later if needed.

## `BranchFormDialog.tsx` — the admin-picker dependency

The backend requires a branch's `admin_id` to already point at a user holding the `admin` role —
`admin_id` is `NOT NULL` at the database level, there's no way to create a "branch with no
manager yet." So the form's manager field isn't a free number input, it's a `FormSelect` fed by
**`useAdmins()`** — the hook M9 already built for the Admins screen:
```tsx
import { useAdmins } from '../admin/api';
// ...
const admins = useAdmins();
const adminOptions = admins.data?.map((a) => ({ value: a.id, label: `${a.name} (${a.email})` })) ?? [];
```
**Practical implication:** you must create at least one admin (via `/admins`, M9) *before* you can
create your first branch — the dropdown will just be empty otherwise. This is a real backend
constraint (the "bootstrap flow" in `docs/10` §1), not a frontend limitation — Laravel's
route-model binding would reject an `admin_id` that isn't a real admin anyway.

## `BranchesPage.tsx` — per-row permission, not just per-role

Every other screen so far gates writes with one role check (`canWriteCatalog(role) ===
'super_admin'`). Branches needs something finer: **an `admin` can edit the one branch they
manage, but never add or delete any branch**:
```tsx
const isSuperAdmin = user?.role === 'super_admin';
const canAddOrDelete = isSuperAdmin;                                  // role-level
const canEditRow = (b: Branch) => isSuperAdmin || b.admin_id === user?.id;  // per-row!
```
`canEditRow` is called **inside the column's `render`**, once per row, comparing that row's
`admin_id` to the logged-in user's own id — not a single role check computed once for the whole
page. This is the first screen where "can I write this?" depends on *which row*, not just *who I
am*. Keep this shape in mind for Workshops (M12) — a workshop owner has the same kind of
per-row-only permission (though out of scope for this admin dashboard).

## Retiring `utils/branches.ts`

The very first workaround from M4 (`SEEDED_BRANCHES`, a hardcoded array of the 5 seeded branch
IDs) is now **deleted**. Its two call sites were swapped to the real thing:
```diff
- import { SEEDED_BRANCHES } from '../../utils/branches';
+ import { useBranches } from '../branches/api';
  ...
- const branchOptions = SEEDED_BRANCHES.map((b) => ({ value: b.id, label: b.name_ar }));
+ const branchOptions = branches.data?.map((b) => ({ value: b.id, label: b.name_ar })) ?? [];
```
in `features/cars/CarFormDialog.tsx` and `features/admin/StaffPage.tsx`. Both now show whatever
branches actually exist in the database instead of a frozen list from the day M4 was built — if
someone deletes/adds a branch, those two dropdowns update automatically (they share the same
`['branches']` query cache as this new screen, so creating a branch here immediately shows up in
the Cars/Staff forms too, no refresh needed).

## What we verified

`tsc -b` + `oxlint` clean, both locale files parse. **Live verification pending** — the backend
server wasn't running while this milestone was built (see `docs/10` for the source-code-level
contract this was built against). Verify the full create → dropdown-appears-in-Cars → edit-own-
branch-as-admin → delete flow once the server is up.

## When you'll touch this

If the backend adds a `working_hours` structured shape, add it as a field here (JSON textarea,
same pattern as pricing-rule `conditions`, or structured if the backend documents fixed keys).
