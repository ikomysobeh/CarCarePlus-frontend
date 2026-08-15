# Feature: Field Ops (M22)

Two read-only lists submitted by employees in the field: **employee reports** (what they found on
an order) and **GPS logs** (their recorded location). The GPS logs are the data source for the
future Live Tracking map.

Backend contract: `car project/docs/12-bookings-detail-procurement-2026-08-15.md` §M22.

## Files

| File | What it does |
|---|---|
| `types.ts` | `EmployeeReport` + `GpsLog` shapes |
| `api.ts` | `useEmployeeReports()` + `useGpsLogs()` |
| `EmployeeReportsSection.tsx` | reports table |
| `GpsLogsSection.tsx` | GPS logs table |
| `FieldOpsPage.tsx` | wraps the two sections in tabs |

## Pattern: tabbed page = one page + N sections

Same shape as `InventoryPage`. `FieldOpsPage` is just a `Tabs.Root` with two `Tabs.Content`, each
rendering a self-contained section component. Each section owns its own query, loading/empty/error
states, and table — so the tabs stay independent (switching tabs doesn't refetch the other).

## When you'll touch this file

- Live Tracking (the map) gets built → it'll likely reuse `useGpsLogs` (or a websocket) to plot points.
- Report review workflow (approve/reject a report) is added → extend `EmployeeReportsSection`.
