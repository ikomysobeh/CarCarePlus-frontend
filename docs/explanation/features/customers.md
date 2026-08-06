# `features/customers/` — Personal & Company Customers (M11)

Two tabs, two different backend resources, one shared edit form. This doc focuses on the three
things that make this screen different from a normal catalog-shaped CRUD: **no create**, **two
asymmetric permission levels**, and **a live backend bug** we had to design around.

## No "Add Customer" anywhere

Both Personal and Company customers **self-register** via `POST /auth/register/customer` and
`POST /auth/register/company` — there's no admin-side create endpoint at all. So this screen is
**edit + delete only**. `CustomerFormDialog.tsx` has no "create" branch like every other dialog in
this codebase (`CategoryFormDialog`, `AdminFormDialog`, etc. all handle both create and edit) —
it's the first dialog that's **always** an edit.

## One dialog, two resources

Personal customers are User-shaped; Company customers are *meant to be* Company-shaped (see the
bug below). But the **update payload** the backend accepts is identical for both — the same
`CustomerDTO` shape (`name`, `email`, `phone`, `password?`, `is_active`, `image_url?`). So instead
of writing two nearly-identical dialogs, `CustomerFormDialog` takes a small, resource-agnostic
`EditableCustomer` shape (`{ id, name, email, phone, is_active }`) plus `onSubmit`/`busy`/`error`
as **props** — the parent (`CustomersPage`) decides which mutation to call:
```tsx
<CustomerFormDialog
  open={!!editingPersonal}
  customer={editingPersonal}
  busy={updatePersonal.isPending}
  error={updatePersonal.error}
  onSubmit={(input) => updatePersonal.mutateAsync({ id: editingPersonal!.id, input }).then(() => undefined)}
  onClose={() => setEditingPersonal(null)}
/>
```
This is a different shape than our usual "dialog owns its own mutations" pattern
(`CategoryFormDialog` calls `useCreateCategory`/`useUpdateCategory` itself) — here the dialog is
**dumb** on purpose, because it's reused across two resources with two different mutation hooks.
For the Company tab, we adapt the shape at the call site since a `CompanyCustomer`'s editable
fields actually live under `owner`:
```tsx
customer={editingCompany ? {
  id: editingCompany.id,
  name: editingCompany.owner?.name ?? editingCompany.name,
  email: editingCompany.owner?.email ?? '',
  phone: editingCompany.owner?.phone ?? null,
  is_active: editingCompany.is_active,
} : null}
```

## Permission asymmetry — Company tab doesn't exist for `admin`

Every other screen with mixed permissions (Branches, later Workshops) shows the UI and just hides
the *write* buttons for lower roles. Customers goes one step further: **the whole Company tab is
absent** for `admin`:
```tsx
const showCompanyTab = user?.role === 'super_admin';
...
{showCompanyTab && <Tabs.Trigger value="company">{t('customers.company')}</Tabs.Trigger>}
```
This is because `admin` has `show.personal_customers` but genuinely **no** `show.company_customers`
permission at all (checked in `database/seeders/RolePermissionSeeder.php` — see docs/10 §2) — not
"read-only", **zero access**. Rendering a tab that would always 403 serves no one; hiding it
entirely is more honest than showing an error state for a screen the role can never use.

On the Personal tab (which `admin` *can* read), writes are still `canManageCustomers(role) ===
'super_admin'` only — `admin` sees the list but no edit/delete buttons, same pattern as everywhere
else.

## 🔴 The bug we designed around

While building this, cross-checking `CustomerCompanyController` → `CustomerCompanyService` →
`CustomerCompanyRepository` revealed that `CustomerCompanyResource` (which looks like it describes
a `Company` model: `name_ar`, `commercial_reg`, `tax_number`, `address`, `status`, nested `owner`)
is actually applied to a **User** instance with only the `company` relation eager-loaded — a
relation the resource never reads. Eloquent returns `null` for undefined attributes rather than
erroring, so **every Company-specific field comes back `null`**, and `owner` (which the resource
tries to read via `whenLoaded('owner')` — the wrong relation name) is **omitted from the JSON
entirely**. Full trace in `docs/10-new-branches-customers-workshops-inventory-2026-08-01.md` §2.

**How the frontend handles it:** `types.ts` types every affected field as nullable with a comment
explaining why, and every render in `CustomersPage` uses a `?? '—'` fallback:
```tsx
{ key: 'name_ar', header: t('field.nameAr'), render: (c) => c.name_ar ?? c.name ?? '—' },
{ key: 'commercial_reg', header: t('customers.commercialReg'), render: (c) => c.commercial_reg ?? '—' },
{ key: 'owner', header: t('admin.owner'), render: (c) => c.owner?.email ?? '—' },
```
So today the Company tab will show a lot of `—` dashes where company details should be — that's
expected and matches the bug, not a frontend defect. **No frontend change will be needed once the
backend fixes the resource** — the types and fallbacks already handle both the broken and the
eventually-fixed shape.

## What we verified

`tsc -b` + `oxlint` clean, both locale files parse. **Live verification pending** (backend server
wasn't running while this was built) — once it's up, confirm the Company tab actually shows the
`—` fallbacks as predicted (would confirm our read of the bug was correct) rather than crashing.

## When you'll touch this

Once the dev fixes `CustomerCompanyResource` (docs/10 §2 suggests two possible fixes), remove the
"⚠️ null today" comments from `types.ts` and tighten the types back to non-nullable — the `?? '—'`
fallbacks can stay (harmless once real data arrives) or be simplified away.
