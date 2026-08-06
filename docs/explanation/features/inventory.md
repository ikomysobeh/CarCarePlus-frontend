# `features/inventory/` — Materials, Units, Stock & Transactions (M13)

The biggest folder of this batch — 4 tabs, 4 resources, and the one screen in the whole app with
real business logic beyond plain CRUD. If you've read the catalog docs, three of these four tabs
are pure repetition; this doc focuses on what's different, especially the **Transactions** tab.

## The 4 tabs and how they relate

```
MaterialUnit   (e.g. "Liters", "Pieces")
  └─ Material    (belongs to a unit, has a price — e.g. "Engine Oil 5W-30")
       └─ Inventory        (a STOCK LEVEL: how much of this material exists at one branch)
       └─ InventoryTransaction  (the LEDGER: every stock movement, append-only)
```

**Two very different mental models for the last two tabs, even though they're both about
"stock":**
- **Inventories** = a snapshot (`quantity` right now). You can edit it directly — think of it as a
  spreadsheet cell you can type a new number into. No history is kept when you do.
- **Inventory Transactions** = a *ledger* — an accounting-style log of every `in`/`out`/transfer
  event, each row recording `quantity_before` → `quantity_after`. You never edit a ledger row;
  you only ever add new ones.

`InventoriesSection`'s `PageHeader` subtitle says this out loud
(`"Adjust stock levels directly. For day-to-day movements, use Transactions."`) so the screen
itself nudges you toward the right tool.

## Permission split is NOT uniform across the 4 tabs — read this before copying a helper

Unlike every other multi-tab feature so far, **not all 4 tabs share one write-permission rule**:

| Tab | Who writes | Helper used |
|---|---|---|
| Material Units | super_admin only | `canWriteCatalog` |
| Materials | super_admin only | `canWriteCatalog` |
| Inventories (stock) | super_admin **and** admin | `canManageInventory` |
| Inventory Transactions | super_admin **and** admin (create only) | `canManageInventory` |

`permissions.ts`'s `canManageInventory` comment spells this out explicitly — it's easy to
accidentally reach for the "obvious" name (`canManageInventory`) on all four tabs since they're
all in the same feature folder, but Units/Materials are catalog-shaped (super_admin-only), while
Stock/Transactions let a branch admin operate their own branch's inventory day-to-day.

## Materials — the "not eager-loaded on create" gotcha

Per docs/10 §5: `unit` is **not** included in the response right after `POST /materials` — only
`GET`/`show`/`update` load it. If you ever need the unit's name immediately after creating a
material, you'd have to `GET /materials/{id}` — right now `MaterialsSection` just relies on the
next `invalidateQueries`-triggered refetch (which *does* come from `index`, presumably loaded) to
populate the column, so this isn't a problem in practice, just worth knowing if you extend this
screen later.

## Cascade-delete warnings

Deleting a `MaterialUnit` cascade-deletes every `Material` using it (and *their* inventory +
transaction history); deleting a `Material` cascade-deletes its inventory + transaction history
directly. Both confirm dialogs say so explicitly instead of the generic
"are you sure?" — see `inventory.deleteUnitMessage` / `inventory.deleteMaterialMessage` in the
locale files. This is the first place in the app where a delete confirmation carries a real
warning beyond boilerplate, because the blast radius here is genuinely bigger than "this one row."

## Inventories & Transactions — the "hide the branch field for admin" pattern

Both `InventoryFormDialog` and `InventoryTransactionFormDialog` only show a **branch picker** when
`user.role === 'super_admin'`:
```tsx
{isSuperAdmin && <FormSelect name="branch_id" label={t('cars.branch')} options={branchOptions} required />}
```
For `admin`, the field simply doesn't render — the backend ignores/overrides whatever `branch_id`
is sent and forces the admin's own branch anyway, so offering the dropdown would create a
"I picked X but it saved to Y" moment. This is the same "conditionally render the whole field"
trick as Cars' `customer_id` (hidden in edit mode) and Service's `vip_extra_price` (shown only
when VIP is on) — three different reasons, same mechanism.

## Inventory Transactions — the actual new pattern: `transfer_out`

This is the one form in the app with real conditional business logic, not just conditional
visibility:

```tsx
const TX_TYPES = ['in', 'out', 'transfer_out'] as const;  // 'transfer_in' NEVER an option
```
`transfer_in` is deliberately **excluded from the dropdown entirely** — it's system-generated
only, and the backend rejects it if you try to send it. We don't just hide it conditionally, we
never offer it as a choice in the first place.

```tsx
const type = methods.watch('type');
...
{type === 'transfer_out' && (
  <FormSelect name="destination_branch_id" label={t('inventory.destinationBranch')} options={branchOptions} required />
)}
```
`destination_branch_id` only appears when `type === 'transfer_out'` — same `watch()` trick as
before. We also mirror the backend's "destination must differ from source" rule client-side via a
zod `.refine()`, so a mismatched pick gets caught before a round-trip 422:
```ts
.refine((d) => d.type !== 'transfer_out' || d.destination_branch_id !== d.branch_id, {
  path: ['destination_branch_id'],
  message: 'mustDifferFromSource',
})
```
And on submit, `destination_branch_id` is only **included in the payload** when `type ===
'transfer_out'` — sending it for `in`/`out` is prohibited server-side, so we don't even risk it:
```ts
...(v.type === 'transfer_out' ? { destination_branch_id: v.destination_branch_id } : {}),
```

**The two-row side effect.** Submitting a `transfer_out` creates **two** ledger rows atomically on
the backend — the `transfer_out` you asked for on the source branch, and a system-generated
`transfer_in` on the destination branch. Only the first comes back in the response; the second
shows up later if you look at that *other* branch's transaction history. We surface this as a
plain note under the form when `transfer_out` is selected (`inventory.transferOutNote`) so nobody
is confused when a create only shows one new row but two branches' stock actually changed.

**Cache invalidation — two caches, not one.** Because a transaction changes stock levels too,
`useCreateInventoryTransaction`'s `onSuccess` invalidates **both** query keys:
```ts
onSuccess: () => {
  qc.invalidateQueries({ queryKey: inventoryTransactionKeys.all });
  qc.invalidateQueries({ queryKey: inventoryKeys.all });   // ← easy to forget this one
}
```
Forgetting the second line would leave the Stock tab showing stale quantities until some unrelated
refetch happened to fire.

## What we verified

`tsc -b` + `oxlint` clean, all static i18n keys present in both locales (the one dynamic key,
`inventory.txType.${type}`, manually confirmed to cover all 4 possible values). **Live
verification pending** — backend server wasn't running while this was built; in particular, watch
for whether `quantity`/`unit_price` arrive as numbers or decimal-strings (like Packages' `price`)
the first time you hit the real API — if they're strings, wrap the display/`z.coerce.number()`
handling the same way we did for Packages.

## When you'll touch this

If Purchase Requests ship (still unbuilt per docs/07), they'd likely live as a 5th tab here,
consuming Materials the same way Inventories does.
