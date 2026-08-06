# `features/pricing/` — Pricing Rule Types & Pricing Rules

This folder is the **dynamic pricing engine** (M9, docs/09). Like `features/packages/`, most of
it is the **same catalog CRUD recipe** — this doc focuses on the one genuinely new idea: editing a
**free-form JSON field** through a normal form.

**Laravel mental model:** `PricingRuleType` ≈ `Category` (a simple named lookup table).
`PricingRule` ≈ `Service`, but instead of fixed columns like `base_price`, it has a `conditions`
**JSON column** whose shape depends on which rule type it belongs to — closer to a Laravel model
with a `casts => ['conditions' => 'array']` and no fixed schema for that column.

---

## The 2 resources

```
PricingRuleType   (a category, e.g. "vehicle_type", "day_of_week" — 10 seeded)
PricingRule        (a specific adjustment within a type, e.g. "+20 SAR for SUV")
```
Not nested like Packages — a `PricingRule` just has a `pricing_rule_type_id` foreign key, one
level, like `Service.category_id`.

## `types.ts` — the shapes

`PricingRuleType` is the simplest resource in the whole app: `{ id, name, name_ar }`, nothing else
(no `is_active`, no timestamps — the migration genuinely doesn't have them).

`PricingRule` has one field unlike anything else we've built:
```ts
conditions: Record<string, unknown> | null;
```
This is **not** a fixed shape — the backend stores whatever JSON object you send. The seeded
examples use different keys per type (`{"vehicle_type":"SUV"}`, `{"service_type":"washing"}`,
`{"sub_service":"interior_cleaning"}`) — see docs/09 §2 for the full list. We don't (yet) know a
fixed key-per-type contract, so we can't build 10 different structured mini-forms with confidence.

## `PricingRuleTypeFormDialog.tsx` + `Section.tsx`

Literally `CategoryFormDialog`/`CategoriesSection` with the `description`/`is_active` fields
removed — 2 required text fields, nothing else. If you understand Categories, you understand this.

## `PricingRuleFormDialog.tsx` — the interesting one

Same shape as `ServiceFormDialog` (a relation dropdown + a few fields), plus **one new pattern**:
editing JSON as text.

### The problem
`conditions` on the wire is an **object**. A text input can only hold a **string**. We need a
bridge, the same way `z.coerce.number()` bridges a string input to a numeric field — except there
is no built-in coercion for "string → validated JSON object", so we write it by hand:

```ts
function parseConditions(text: string): Record<string, unknown> | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;               // empty box = no conditions
  const parsed = JSON.parse(trimmed);            // throws on invalid JSON
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('not an object');            // reject arrays/numbers/strings
  }
  return parsed as Record<string, unknown>;
}
```

### Wiring it into the form
The RHF field is `conditions_json: string` (what the textarea holds), **not** `conditions`. A zod
`.refine()` calls `parseConditions()` inside a `try/catch` — if it throws, validation fails and
the field shows an error, exactly like any other rule:
```ts
.refine((d) => {
  if (!d.conditions_json?.trim()) return true;   // optional field
  try { parseConditions(d.conditions_json); return true; }
  catch { return false; }
}, { path: ['conditions_json'], message: '...' })
```
Then at the two boundaries where the shapes need to switch:
- **Loading an existing rule** (`useEffect` on `open`): `JSON.stringify(rule.conditions, null, 2)`
  — turn the object *back into* pretty-printed text for editing.
- **Submitting**: `conditions: parseConditions(v.conditions_json ?? '')` — turn the text *back
  into* an object for the API call.

So the object only exists as JSON text while it's inside the form; everywhere else (loading,
saving, displaying in the table) it's a normal object.

### Displaying it in the table
`PricingRulesSection` shows `conditions` as an inline, monospace preview using Chakra's `<Code>`:
```tsx
<Code fontSize="xs">{r.conditions ? JSON.stringify(r.conditions) : '—'}</Code>
```
No parsing needed here — read-only display just stringifies once.

## `PricingPage.tsx`

Same 2-tab shape as `CatalogPage`/`PackagesPage` — nothing new.

---

## What we verified — and what we found

- `GET /pricing-rules` works (200, empty array).
- `GET /pricing-rule-types` currently **403s for everyone**, including super_admin — a stale
  permission seeder, not a frontend bug (docs/09 §5). The Rule Types tab will show our generic
  error state until the dev re-seeds.
- **`POST /pricing-rules` (create) currently 500s** — the live `pricing_rules` database table is
  missing the `name_ar` column the model/request/resource all expect (docs/09 §4 — a migration
  was edited after it had already run). Verified by creating a real rule via curl and reading the
  exact SQL error. This is a genuine backend bug, not something wrong with our form or the JSON
  parsing — once the dev adds the missing-column migration, our create/edit should just work with
  no frontend changes.
- `tsc -b` + `oxlint` clean.

## When you'll touch these files

- **If the backend documents a fixed shape per rule type** (e.g. "vehicle_type rules always use
  `{vehicle_type: string}`"), replace the raw JSON textarea with a proper `FormSelect`/
  `FormTextField` chosen based on the selected `pricing_rule_type_id` — the same "watch a field to
  conditionally render another" trick used for `Service.vip_extra_price`.
- **New rule type-specific validation?** Add it inside `parseConditions` or a sibling function.

See also: `../../09-new-admins-pricing-2026-07-30.md`, and the catalog docs for the base recipe.
