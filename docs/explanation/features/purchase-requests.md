# Feature: Purchase Requests (M17)

Branch procurement. An **admin** raises a request to buy materials for their branch (a list of
line items: material + quantity + unit price). A **super_admin** approves it (stock gets added),
rejects it (with a reason), or does a direct **branch-to-branch transfer**.

Backend contract: `car project/docs/12-bookings-detail-procurement-2026-08-15.md` §M17.

## Files

| File | Laravel analogy | What it does |
|---|---|---|
| `types.ts` | DTOs | TS shapes for `PurchaseRequest`, its `items`, and the create/transfer inputs |
| `api.ts` | a thin API client + cache | React Query hooks: list, create, update, delete, approve, reject, transfer |
| `PurchaseRequestFormDialog.tsx` | a Blade form + FormRequest | create/edit form with a **repeatable line-items editor** |
| `TransferStockDialog.tsx` | another form | from-branch → to-branch transfer (items have no unit price) |
| `PurchaseRequestDetailsDialog.tsx` | a read-only `show` view | shows the request's line items + totals |
| `RejectPurchaseRequestDialog.tsx` | a confirm-with-reason modal | collects the required `rejection_reason` |
| `PurchaseRequestsPage.tsx` | a Controller `index` + Blade table | the screen: table + all the dialogs |

## The one new React concept: `useFieldArray`

A purchase request has *many* items (like a `hasMany`). In a Laravel form you'd loop
`@foreach($items as $i => $item)` and name inputs `items[0][material_id]`. React's
`react-hook-form` gives us `useFieldArray` for exactly this:

```tsx
const { fields, append, remove } = useFieldArray({ control: methods.control, name: 'items' });
// fields = the current rows; append() adds one; remove(i) deletes row i.
fields.map((f, i) => <FormSelect name={`items.${i}.material_id`} … />)
```

The field names use the array index (`items.0.material_id`) — the same `items[0][material_id]`
idea, just dot-notation. On submit, zod validates the whole array (min 1 item), and the running
total is computed live with `useWatch` (like a Livewire computed property).

## Who can do what (from `utils/permissions.ts`)

- `canCreatePurchaseRequest(role)` → **admin** only (raises/edits/deletes pending requests).
- `canApprovePurchaseRequest(role)` → **super_admin** only (approve/reject/transfer).
- Both see the list; the action buttons per row are gated by these + the row's `status === 'pending'`.

## When you'll touch this file

- Backend adds a status filter or server pagination → wire it into `usePurchaseRequests`.
- A real material/branch picker with search arrives → the `FormSelect`s already use those lists.
