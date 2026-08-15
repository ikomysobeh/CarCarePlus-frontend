# Feature: Spare Parts (M18)

Read-only list of spare-part requests raised by field staff on an active order. The **customer**
approves or rejects them from their own app, so this dashboard just displays them.

Backend contract: `car project/docs/12-bookings-detail-procurement-2026-08-15.md` §M18.

## Files

| File | What it does |
|---|---|
| `types.ts` | the `SparePartRequest` shape (order, material, quantity, specifications, status) |
| `api.ts` | `useSparePartRequests()` — a single read hook |
| `SparePartsPage.tsx` | the table |

## Why read-only?

The backend exposes create (employee) and approve/reject (customer) endpoints, but neither actor
uses this admin dashboard — see the scope decision in doc 12 §8. So we surface the data for
oversight and leave the actions to the customer/employee apps. If those surfaces later join this
project, add the create form + approve/reject actions here (the endpoints are already in
`api/endpoints.ts` under `sparePartRequests`).

## When you'll touch this file

- Employee/customer flows come into scope → add create + approve/reject (endpoints already wired).
- Status filtering → add a filter control feeding the query.
