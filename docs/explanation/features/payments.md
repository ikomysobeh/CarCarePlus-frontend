# Feature: Payments (M19)

A read-only list of every payment (booking, package, wallet top-up) with one staff action:
**confirm a cash payment was collected**.

Backend contract: `car project/docs/12-bookings-detail-procurement-2026-08-15.md` §M19.

## Files

| File | What it does |
|---|---|
| `types.ts` | the `Payment` shape (number, type, method, status, amount, points_used, order_id) |
| `api.ts` | `usePayments()` (list) + `useConfirmCash()` (POST `/payments/:id/confirm-cash`) |
| `PaymentsPage.tsx` | the table + the confirm-cash `ConfirmDialog` |

## Key idea: the action only appears when it's valid

The "Confirm cash" button is rendered only when `p.status === 'pending' && p.method === 'cash'`
AND the user has `canConfirmCashPayment(role)` (super_admin/admin). This is the same "gate the
button by both permission and current state" pattern as Orders — never show an action the backend
would reject.

`method`/`type`/`status` are enum strings; we translate them for display
(`enums.paymentMethod.*`, `enums.paymentType.*`) and colour `status` via the shared `StatusChip`.

## When you'll touch this file

- A payment detail view is needed → add a details dialog (the list already carries `order_id`).
- Refunds get an API → likely a sibling feature or an extra action here.
