# `src/utils/permissions.ts` — role → menu map (frontend RBAC)

**Real file:** [`../../../src/utils/permissions.ts`](../../../src/utils/permissions.ts)

## What it is

A **data-driven** map of which navigation modules each role can see, plus small helper
functions. It mirrors your backend's Spatie roles (`docs/04-roles-and-permissions.md`) and
drives the sidebar + route guards.

**Laravel analogy:** like a config array mapping roles to abilities that you use in Blade
`@can` checks — except here it decides which menu items render and which routes are allowed.

## The code

```ts
export type ModuleKey =
  | 'dashboard' | 'approvals' | 'staff' | 'cars' | 'catalog' | 'profile';

export const MODULES_BY_ROLE: Record<Role, ModuleKey[]> = {
  super_admin:       ['dashboard', 'approvals', 'staff', 'cars', 'catalog', 'profile'],
  admin:             ['dashboard', 'cars', 'catalog', 'profile'],
  workshop:          ['dashboard', 'profile'],
  customer_personal: ['dashboard', 'cars', 'profile'],
  customer_company:  ['dashboard', 'cars', 'profile'],
  employee_washer:   ['dashboard', 'profile'],
  employee_mechanic: ['dashboard', 'profile'],
};

export const canWriteCatalog = (role: Role) => role === 'super_admin';

export const can = (role: Role, module: ModuleKey) =>
  MODULES_BY_ROLE[role]?.includes(module) ?? false;
```

## Block by block

### `ModuleKey`
```ts
export type ModuleKey = 'dashboard' | 'approvals' | 'staff' | 'cars' | 'catalog' | 'profile';
```
- The list of navigation "modules" the dashboard currently has. A union type, so only these
  exact strings are valid (typos are compile errors). As we add screens, we add keys here.

### `MODULES_BY_ROLE`
```ts
export const MODULES_BY_ROLE: Record<Role, ModuleKey[]> = { ... };
```
- The core map: for each of the 7 roles, which modules they may see.
- `Record<Role, ModuleKey[]>` = "an object with a key for **every** `Role`, each holding an
  array of `ModuleKey`s." TypeScript will error if you forget a role — that's a feature: you
  can't accidentally leave a role unmapped.
- Example: `super_admin` sees everything (including `approvals` and `staff`); a regular
  `admin` doesn't see those two.
- The sidebar reads this: `MODULES_BY_ROLE[user.role]` → the menu items to render
  (see [`../layouts/DashboardLayout.tsx.md`](../layouts/DashboardLayout.tsx.md)).

### `canWriteCatalog`
```ts
export const canWriteCatalog = (role: Role) => role === 'super_admin';
```
- A tiny helper: only super admins can create/edit/delete catalog items (your API rule).
  Screens use this to show/hide the Add/Edit/Delete buttons — everyone can **read** the
  catalog, only super admin can **write**.

### `can`
```ts
export const can = (role: Role, module: ModuleKey) =>
  MODULES_BY_ROLE[role]?.includes(module) ?? false;
```
- A generic check: "does this role have access to this module?" Returns `true`/`false`.
- `?.` = optional chaining (safe access if the role isn't found), `?? false` = default to
  `false`. It reads like Laravel's `@can`.

## ⚠️ Same warning as the guards

This is **UX only** — hiding a menu item does not secure anything. The real permission
enforcement is on your Laravel API (Spatie `can:`/`role:` middleware → 403). This file just
keeps the UI clean and matching the user's role.

## The doc says "keep it data-driven"

`docs/04` recommends we don't hardcode permission checks all over the app — instead keep them
here as data. When a new module ships, you add one key to `ModuleKey` and one entry per role
in `MODULES_BY_ROLE`, and the sidebar/guards update automatically.

## When you'll touch this file

**Every time we add a screen** that should appear in the sidebar: add its `ModuleKey` and
decide which roles see it. It's a 2-line change per feature.
