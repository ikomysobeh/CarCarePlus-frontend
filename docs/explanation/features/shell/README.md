# Shell: dashboard home, sidebar & coming-soon pages (M7)

**Real files:**
- [`src/features/dashboard/DashboardHome.tsx`](../../../../src/features/dashboard/DashboardHome.tsx)
- [`src/features/shell/ComingSoonRoute.tsx`](../../../../src/features/shell/ComingSoonRoute.tsx)
- [`src/components/StatCard.tsx`](../../../../src/components/StatCard.tsx), [`src/components/ComingSoon.tsx`](../../../../src/components/ComingSoon.tsx)
- [`src/layouts/navConfig.tsx`](../../../../src/layouts/navConfig.tsx), [`src/layouts/DashboardLayout.tsx`](../../../../src/layouts/DashboardLayout.tsx)
- [`src/utils/permissions.ts`](../../../../src/utils/permissions.ts)

M7 makes the app feel **complete to click through**: the full mockup sidebar exists, the
dashboard has a landing page, and every unbuilt module says clearly why it's not ready.

## The sidebar is now data-driven with icons

`navConfig.tsx` is an **ordered list** of every nav item (`key`, `route`, `icon`) — in the
mockup's order. `DashboardLayout` renders it like this:
```tsx
const allowed = MODULES_BY_ROLE[user.role];              // which modules this role sees
const items = NAV_ITEMS.filter(i => allowed.includes(i.key));  // keep order, filter by role
```
Each item shows its icon + translated label, and — if it's **not** in `BUILT_MODULES` — a small
"Soon" chip. So the sidebar advertises the whole product while making clear what's live today.

`utils/permissions.ts` grew: `ModuleKey` now includes the coming-soon modules (orders, tracking,
users, branches, inventory, contracts, finance, reports, settings), `BUILT_MODULES` lists what's
real, and `MODULES_BY_ROLE` gives super_admin everything and admin a branch-scoped subset.

## Coming-soon pages

`ComingSoon` (shared component) is a styled card: a construction icon, a "Coming soon" chip, and
a note. `ComingSoonRoute` wraps it for the router, feeding a **localized title** (`nav.<module>`)
and a **per-module note** (`comingSoonNote.<module>`) that says which backend API it's waiting on
— e.g. Orders → "waiting on the Orders API". The router maps each unbuilt path to
`<ComingSoonRoute module="…"/>`.

This replaces the old dev-only `Placeholder`. When a module's endpoints ship, we swap its
`ComingSoonRoute` for the real page — same as we did for catalog/cars/etc.

## Dashboard home — real numbers, not fake KPIs

`DashboardHome` shows a grid of `StatCard`s. Crucially, the numbers are **real counts** pulled
from endpoints we already have (via the existing React Query hooks): cars, categories, services,
sub-services, car types, car brands. Each card shows a `<Skeleton>` while its query loads.

We deliberately did **not** invent operational KPIs (orders today, revenue) — those need APIs
that don't exist yet. Instead an info `<Alert>` explains they'll appear once the backend ships
them. Honest over flashy.

`StatCard` is a small reusable tile (icon badge + big value + label) added to the shared kit.

> **MUI v9 Grid:** layout uses the new Grid API — `<Grid size={{ xs: 12, sm: 6, md: 4 }}>` — not
> the old `item xs={12}` props.

## What we verified
Dashboard shows the correct live counts (10 cars, 3 categories, 6 services, 4 sub-services, 4 car
types, 14 brands — matching the seeded data). The full sidebar renders with icons + "Soon" chips.
A coming-soon page (orders) shows its localized title, chip, and the "waiting on the Orders API"
note. `tsc` + `oxlint` clean; no console errors.

## When you'll touch this
Every time a backend module ships: move its key into `BUILT_MODULES`, and swap its
`ComingSoonRoute` for the real feature page. Add real operational KPIs to `DashboardHome` when
the reports/orders endpoints exist.
