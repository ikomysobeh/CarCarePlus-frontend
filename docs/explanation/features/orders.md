# `features/orders/` — Orders/Bookings (M15)

The last original gap from `docs/07-gaps-and-questions.md` (Orders had **zero API** until the
2026-08-06 backend pull — see `car project/docs/11-new-orders-bookings-pagination-2026-08-06.md`
§2). This is the first feature in the whole app that **isn't a catalog-CRUD clone** — it's an
operations console over a state machine, not an add/edit/delete list.

## What this screen deliberately does NOT do

The real "create a booking" flow is a 2-step customer-facing dance: `POST /bookings/quote`
(price + validate, no DB write) → `POST /bookings/confirm` (redeem the quote token, actually
create the order — one per car, sharing a `booking_group_id`). **We don't build that here.** Per
the project's team split (this dashboard is Admin/Super-Admin; the mobile app handles customer
self-service), booking creation belongs to the mobile app. `OrdersPage` is the **operations
side**: view what's booked, and move it through its lifecycle.

## The list needs zero client-side role filtering — a first for this app

Every other list screen in this app either shows everyone the same rows (Categories, Car Types...)
or needs an explicit per-role query param (Subscriptions' customer-id picker). `GET /bookings` is
different: **the backend scopes the result set to the caller automatically** —
`super_admin`/`workshop` see everything, `admin` sees their branch's bookings, an employee sees
only what's assigned to them. `useOrders()` just calls the endpoint with no parameters; whatever
comes back is exactly what that user should see. The only thing the frontend gates is which
**action buttons** appear — see below.

## Action buttons are gated by role AND by the order's current status

This is new: elsewhere in the app, "can write" is a pure role question. Here, a button also has to
make sense for where the booking currently is in its lifecycle:
```tsx
{canAssign && o.status === 'pending' && <Button onClick={() => setAssigning(o)}>Assign</Button>}
{canEditStatus && o.status === 'assigned' && <Button onClick={() => setStarting(o)}>Start</Button>}
{canEditStatus && o.status === 'in_progress' && <Button onClick={() => setCompleting(o)}>Complete</Button>}
{canCancel && o.status !== 'completed' && o.status !== 'cancelled' && <Button onClick={() => setCancelling(o)}>Cancel</Button>}
```
`canAssignOrders`/`canEditOrderStatus`/`canCancelOrders` in `utils/permissions.ts` mirror the
backend's three separate permissions exactly (`assign.order`, `edit.order`, `cancel.order`) —
notice `edit.order` covers **both** start and complete, which is why one helper gates both
buttons. Customers aren't in any of these helpers — they don't have the `orders` module in this
dashboard's `MODULES_BY_ROLE` at all, so the question never comes up here.

## `booking_type` is a boolean now — the old `OrderType` enum is gone

If you've seen an older mockup or plan doc mention order "types" (`service`/`wash`/
`road_assistance`), that concept **no longer exists on the backend model** — it was deleted in
this same pull. `booking_type` is now a plain boolean (immediate vs. scheduled, per the migration
comment). Road-assistance bookings are identified by the *presence* of `problem_type_id` on the
create request, not by a type value — but since we don't build the create flow here, this only
matters if you're reading an older doc and get confused about "types."

## No employee picker — plain numeric field, same story as Workshops' `user_id`

`AssignOrderDialog` has one field: `employee_id`, a plain number input. There is **no `GET
/employees` list endpoint** — `POST /admin/employees` (staff creation, M5) is the only employee-
related endpoint that exists. Same "known limitation, not a bug we introduced" situation as
Workshops' unresolved `user_id` field (M12) and Cars' `customer_id` before Branches shipped. If a
`GET /employees` endpoint ever ships, swap this for a `FormSelect` fed by a new `useEmployees()`
hook — same treatment Branches got for `admin_id` once `useAdmins()` existed.

## Cancel sends its reason via a DELETE body — first time we've done that

Every other delete in this app is a bare `DELETE /resource/{id}` with no body. Cancelling a
booking is also a `DELETE`, but `CancelBookingRequest` validates an optional `cancel_reason` from
the request body — so `useCancelOrder()` is the first mutation to pass `{ data: input }` in axios's
delete config:
```ts
http.delete<ApiResponse<Order>>(endpoints.bookings.cancel(id), { data: input })
```
`CancelOrderDialog` mirrors `admin/RejectReasonDialog.tsx`'s shape (optional reason textarea) but
lives in this feature since the copy is order-specific.

## Pagination — stuck at 10/page, and we can't fix it from here

`GET /bookings` is `paginate(10)` fixed, with **no `per_page` query param support** at all (unlike
the ~13 other resources patched with `ALL_ROWS_PARAMS` in `api/client.ts` — see docs/11 §1). The
backend controller for this one specific endpoint never reads a per_page value, so there's nothing
to bump from our side. `useOrders()`'s doc comment flags this explicitly. Live with 10/page for now
(booking volume is presumably low early on); ask the dev to add the same
`$request->integer('per_page', ...)` pattern here, or build real server-side pagination into
`DataTable`, once it actually starts to bite.

## What we verified

`tsc -b` + `oxlint` clean, all static and dynamic i18n keys verified present in both locales.
**Live verification pending** — backend server wasn't running while this was built; the field
shapes came from reading `BookingController`, the five `BookingRequest` classes, `OrderResource`,
`PaymentResource`, and `OrderPriceItemResource` directly, not from guessing. In particular, watch
for whether a booking's own `POST /bookings/{id}` update endpoint (plain field edits — car,
schedule, location, notes) is worth exposing later; it exists but wasn't built here (kept this
milestone scoped to view + the 4 lifecycle actions).
