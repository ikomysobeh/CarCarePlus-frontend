# `features/workshops/` — Workshops (M12)

Full CRUD (previously only approval endpoints existed — see `features/admin/ApprovalsPage.tsx`
for that older, still-separate flow). Same catalog-shaped recipe as everything else; the one
thing worth explaining is a permission rule that's stricter than it first looks.

## No `is_active`/`status` field in this form

Workshops have a `status` (`pending | approved | rejected`), but it's **not editable here** — it's
set exclusively through the registration-approval flow (`ApprovalsPage`, built back in M0-era,
`POST /admin/registration-requests/workshops/{id}/approve|reject`). `WorkshopFormDialog` only has
`name`, `name_ar`, `city`, `address`, `latitude`, `longitude` — deliberately no status toggle, so
there's exactly one place in the app that changes a workshop's approval state.

## `admin` can read the whole list, but can NEVER write — not even 403-and-hope

Every other mixed-permission screen we've built so far (Branches) uses a **role check** possibly
combined with a **per-row ownership check**. Workshops is different: the backend's
`WorkshopController::update()` has an explicit, unconditional block —
```php
if ($user->hasRole('admin')) {
    return Response::Error(..., code: 403); // Admin cannot edit workshops. Full stop.
}
```
— `admin` is blocked **even for workshops it might otherwise have edit rights to**, no ownership
carve-out like the workshop owner gets. So the frontend's `canManageWorkshops` helper is simply:
```ts
export const canManageWorkshops = (role: Role) => role === 'super_admin';
```
No per-row logic needed here (unlike Branches) — it really is just one role, unconditionally.
`WorkshopsPage` hides the entire actions column (and the "Add workshop" button) unless
`canManageWorkshops(user.role)` — `admin` gets a clean read-only table, never a button that would
just 403 when clicked.

## `user_id` — an optional, unresolved attach-to-existing-user field

`WorkshopInput.user_id` lets you attach a workshop to an existing user account on create. Like
Cars' `customer_id` before Branches shipped, there's still no user-lookup/search endpoint for
this specific case, so we don't expose a `user_id` field in the form at all for now (a workshop
created here starts unattached; the *self-registration* flow — `POST /auth/register/workshop` —
is the normal way a workshop gets attached to its owner). If a real need for admin-side
attach-to-user comes up, revisit once a user search endpoint exists.

## What we verified

`tsc -b` + `oxlint` clean, i18n keys verified present in both locales. **Live verification
pending** — backend server wasn't running while this was built.

## When you'll touch this

If the backend adds a workshop user-lookup endpoint, add the `user_id` field back as a proper
`FormSelect` (same treatment Branches got for `admin_id` once `useAdmins()` existed).
