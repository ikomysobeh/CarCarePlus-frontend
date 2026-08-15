# Orders: Booking detail view (M16)

M15 gave us the orders **list** + status actions (assign/start/complete/cancel). M16 adds the
**detail view** — a "View" (eye) button on each row opens a tabbed dialog.

Backend contract: `car project/docs/12-bookings-detail-procurement-2026-08-15.md` §M16.

## New files

| File | What it does |
|---|---|
| `OrderDetailsDialog.tsx` | the tabbed dialog: Overview · Price · Sub-services · Materials · History · Service detail |
| `OrderServiceDetails.tsx` | the Service-detail tab: three editors (maintenance / road / towing) |

Plus new hooks in `api.ts` and new shapes in `types.ts` (search for "M16").

## How the tabs load data

The **Overview** tab uses data already on the order row (no fetch). Each other tab has its own
React Query hook (`useOrderPriceItems`, `useOrderSubServices`, `useOrderMaterials`,
`useOrderStatusHistory`) that is `enabled` only when the dialog is open for that order — so opening
the dialog doesn't fire five requests at once; each tab fetches when you click it. Think of it as
lazy-loading a relation only when the page section that needs it is shown.

## The "we don't know the service kind" problem

A booking is exactly one of maintenance / road / towing, but the list row doesn't tell us which.
Rather than guess from the category, the **Service detail** tab shows all three editors stacked.
Each one's GET returns either the saved detail or `null`; the operator fills in whichever applies
and saves it (POST). Each editor is its own little `react-hook-form` form with its own save button.

## Role note

The middle read tabs (Price/Sub-services/Materials/History) are blocked server-side for the
`workshop` role, so `OrderDetailsDialog` hides them when `user.role === 'workshop'` — Overview and
Service detail stay visible.

## When you'll touch this file

- Backend exposes the booking's service *kind* → replace the three stacked editors with just the
  relevant one.
- Employee reports / spare parts per order → they'd naturally become extra tabs here.
