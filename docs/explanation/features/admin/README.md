# Admin feature (`src/features/admin/`) — approvals, staff & admin accounts

**Real files:** [`types.ts`](../../../../src/features/admin/types.ts),
[`api.ts`](../../../../src/features/admin/api.ts),
[`ApprovalsPage.tsx`](../../../../src/features/admin/ApprovalsPage.tsx),
[`RejectReasonDialog.tsx`](../../../../src/features/admin/RejectReasonDialog.tsx),
[`StaffPage.tsx`](../../../../src/features/admin/StaffPage.tsx),
[`AdminFormDialog.tsx`](../../../../src/features/admin/AdminFormDialog.tsx) (M9),
[`AdminsPage.tsx`](../../../../src/features/admin/AdminsPage.tsx) (M9).

> Super-admin-only screens (guarded by `<RequireRole roles={['super_admin']}>` in the router).
> Same list/mutation/React-Query recipe as before; this doc covers what's specific.

## Approvals — reviewing company & workshop registrations

`ApprovalsPage` has two tabs (Companies / Workshops), each a `DataTable` of **pending**
requests. Each row has two actions:
- **Approve** → a `ConfirmDialog`. On confirm, `POST /admin/registration-requests/{type}/{id}/approve`.
- **Reject** → a `RejectReasonDialog` that collects an optional reason, then
  `POST .../{id}/reject` with `{ reason }`.

Both mutations invalidate the matching pending-list query, so the row disappears once handled.

Two small design points worth seeing:
- **One set of handlers for both tabs:** `const approving = isCompanies ? approveCompany : approveWorkshop`
  picks the right mutation based on the active tab, so the dialogs are written once.
- **A generic actions column:** `actions<T extends Pending>()` returns a column whose buttons
  call `setToApprove(row)` / `setToReject(row)` — reused for both the Company and Workshop tables
  (they both have an `id`).

> **Route param = the model id.** The reject/approve URL uses the **Company/Workshop id**
> (e.g. `/companies/1/...`), which is different from the owner's **user id**. Our rows use
> `row.id` (the model id), which is correct — verified live.

## RejectReasonDialog — a controlled dialog with its own field

Like `ConfirmDialog`, the parent controls `open` and gets `onConfirm(reason)`. It keeps the
reason in its own local `useState` and clears it whenever it re-opens (a `useEffect` on `open`).
The reason is optional (the backend accepts an empty reason).

## Staff — creating an account

`StaffPage` is a single form (not a dialog) using the same `FormProvider` + zod pattern:
fields `name`, `email`, `phone`, `password` (min 8), `branch_id` (dropdown — the temporary
[seeded branches](../../../../src/utils/branches.ts)), `type` (`washer | mechanic | admin` from
the `EmployeeType` enum), and `is_active`.

- `POST /admin/employees` creates the account; the backend maps `type` → the role
  (`washer`→`employee_washer`, etc.) — verified: `type: "washer"` returned role
  `employee_washer`.
- On success we show a green `<Alert>` (`create.isSuccess`) and reset the form. There's **no
  staff-list endpoint** yet, so this screen only creates (no list/edit) — noted for the backlog.
- Server-side validation errors (422) are mapped back onto the fields via `setError`, same as
  the catalog/cars forms.

## Admins (M9) — a proper CRUD, not just create

`POST /admin/employees` (Staff, above) can create an admin account too, but has no list/edit/
delete. The newer `/api/admins` endpoint (docs/09) is a **full CRUD dedicated to admin accounts**,
so `AdminsPage` is a normal Categories-shaped screen (list + `DataTable` + `AdminFormDialog`),
plus two extra row actions for activate/deactivate.

Two things that differ from every other form we've built:

1. **`image_url` is a plain string here, not a file.** Cars use `image` as an uploaded `File`;
   Profile uses `image_url` as an uploaded `File`. This endpoint's `image_url` is validated as
   `string|max:2048` — a URL you type, not a picker. So `AdminFormDialog` uses a plain
   `FormTextField`, **not** `ImageUploadField`. Check the backend's validation rules before
   assuming "image field = upload" — it isn't always.

2. **Optional password with a *sent* confirmation.** On create, a password is required; on edit,
   leaving it blank means "keep the current one." When a password *is* provided, Laravel's
   `confirmed` validation rule doesn't just want you to check it matches client-side — it expects
   an actual `password_confirmation` field **in the request body** to compare against. So the
   submit handler only includes `password`/`password_confirmation` in the payload when a new
   password was typed:
   ```ts
   ...(values.password
     ? { password: values.password, password_confirmation: values.password_confirmation }
     : {}),
   ```

3. **Activate/deactivate are separate endpoints**, not a toggle on the update route:
   `POST /admins/{id}/activate` / `.../deactivate`. `useSetAdminActive({ id, active })` picks the
   right URL, and `AdminsPage` reuses `ConfirmDialog` for both (green "activate" text, red/
   destructive "deactivate" text, driven by the row's current `is_active`).

⚠️ **No `branch_id` on this endpoint** — so unlike Staff creation (which requires picking a
branch), there's currently no way to assign a branch to an admin through this screen. Noted as an
open question for the backend (docs/09 §8).

## What we verified
- Approvals page renders (empty state, and with a live pending company we registered for the
  test). **Reject flow verified end-to-end through the UI**: `POST .../companies/1/reject` with a
  reason → auto-refetch → row removed.
- Staff-create contract verified live: `POST /admin/employees` → 201 with the correct role.
- **Admins CRUD verified live end-to-end** (M9): created a test admin (`POST /admins` → 201,
  `role: "admin"` auto-assigned server-side) → deactivated it (`POST /admins/{id}/deactivate` →
  200, `is_active: false`) → deleted it (`DELETE /admins/{id}` → 200). Test account cleaned up,
  no residue left in the dev DB this time.
- `tsc` + `oxlint` clean; no console errors.

> **Test residue (dev DB):** the verification left (1) a **rejected** company account
> (`qa-company@test.local`) and (2) a **test washer** (`qa-washer@test.local`, "QA Test Washer
> (delete me)") — there's no delete-employee endpoint, so remove it manually or re-seed if you
> want it gone.

## When you'll touch this
When the backend adds staff **list/edit/delete** and company/workshop **CRUD** endpoints (docs/07),
this feature grows a management table beyond just create/approve.
