# `features/settings/` — Problem Types, Suggested Problems, System Settings, AI Rules (M14)

The last milestone of this batch, and the plan doc's "easiest of the five" — three of the four
tabs are almost pure Categories clones. What actually needed care here was **read-permission**,
not write-permission, and one enum name collision worth knowing about.

## The 4 tabs

```
Problem Types       { name, name_ar, is_active }               — Categories clone, minus description
Suggested Problems  { name, name_ar, description, category }   — fixed 6-value category enum
System Settings     { key, value, type, description }          — a key/value config store
AI Rules            { brand_id?, name, name_ar, type, condition_key?, condition_value?,
                       car_type?, fuel_type?, response_template, is_active }
```

## Read access is NOT uniform across the 4 tabs — the actual new thing here

Every prior multi-tab feature in this batch had one consistent write rule per feature (Inventory
was the exception, split by *sub-resource*, not by role-per-tab). Settings is the first one where
**two tabs are invisible to `admin` entirely**, confirmed straight from the backend's
`RolePermissionSeeder`:

| Tab | Admin can... | Backend permission admin has |
|---|---|---|
| Problem Types | read only | `show.problem_types` (no `manage.*`) |
| Suggested Problems | read only | `show.suggested_problems` (no `manage.*`) |
| System Settings | **nothing** | *(absent from admin's permission list entirely)* |
| AI Rules | **nothing** | *(absent from admin's permission list entirely)* |

`SettingsPage.tsx` hides the last two tabs outright for non-super_admin — same "hide the tab,
don't render a 403" call as Customers' Company tab in M11:
```tsx
const isSuperAdmin = user?.role === 'super_admin';
...
{isSuperAdmin && <Tabs.Trigger value="systemSettings">{t('settings.systemSettings')}</Tabs.Trigger>}
{isSuperAdmin && <Tabs.Trigger value="aiRules">{t('settings.aiRules')}</Tabs.Trigger>}
```
Because of that, `SystemSettingsSection` and `AiRulesSection` don't bother with a `canWrite`
branch at all — by the time an `admin` could render either component, something upstream is
already broken. Problem Types and Suggested Problems, on the other hand, keep the usual
`canManageSettings(role)` write-gate (super_admin only) while still rendering their list for
`admin` to browse.

## `car_type` on AI Rules is a DIFFERENT thing from `car_type_id` on Cars — don't merge them

This is the one genuine "gotcha" of the milestone. The app already has a `CarType` concept: a
real catalog resource (`car_types` table, `id`/`name`/`price_multiplier`, picked via
`car_type_id` on a `Car`). It would be natural to assume AI Rules' `car_type` field reuses that
same relation. **It doesn't.** Tracing the actual backend model (`App\Models\AiRule`) shows:
```php
protected $casts = [
    'car_type' => CarTypeSize::class,   // a fixed PHP enum: sedan|suv|hatchback|pickup
    ...
];
```
`car_type` here is a plain string column cast to an unrelated four-value enum
(`App\Enums\CarEnums\CarTypeSize`) — it has nothing to do with the `car_types` table. Sending an
`id` would fail validation; the backend expects one of the four literal strings. We added a
**separate** constant for this in `utils/enums.ts`:
```ts
// NOT the same thing as catalog's `CarType` (a real relation, `car_type_id` on Car) — this is
// a separate fixed enum used only by AI Rules' `car_type` column.
export const CAR_TYPE_SIZES = ['sedan', 'suv', 'hatchback', 'pickup'] as const;
```
with a comment flagging the collision so a future reader doesn't "simplify" this into reusing
`useCarTypes()`. If you're ever unsure whether a field is a relation or a fixed enum, check the
Eloquent model's `$casts` array, not just the migration column type — `enum()` at the DB level is
used for both relations-that-happen-to-validate-against-an-enum and truly-fixed-value columns, and
only the model tells you which.

## AI Rules — the "only send what's set" pattern, five fields deep

Every optional field on `AiRuleFormDialog` (`brand_id`, `condition_key`, `condition_value`,
`car_type`, `fuel_type`) is left out of the submitted payload entirely when empty, same spirit as
Inventory Transactions' conditional `destination_branch_id`, just applied to more fields at once:
```ts
const input = {
  name: parsed.name, name_ar: parsed.name_ar, type: parsed.type,
  response_template: parsed.response_template, is_active: parsed.is_active,
  ...(parsed.brand_id ? { brand_id: parsed.brand_id } : {}),
  ...(parsed.condition_key ? { condition_key: parsed.condition_key } : {}),
  ...(parsed.condition_value ? { condition_value: parsed.condition_value } : {}),
  ...(parsed.car_type ? { car_type: parsed.car_type } : {}),
  ...(parsed.fuel_type ? { fuel_type: parsed.fuel_type } : {}),
};
```
This matters because the backend DTO (`AiRuleDTO::toArray()`) filters out `null` values before
persisting — sending an empty string for `car_type` instead of omitting the key entirely would
fail the `Rule::in(CarTypeSize::values())` validation, since `''` isn't one of the four allowed
values.

## System Settings — the simplest tab, one thing worth knowing

`key` is unique server-side; a duplicate `key` on create just comes back as an ordinary 422 that
the existing `fieldErrors → setError` path already handles — no special-casing needed, which is
why the plan doc correctly called this "the simplest of the four." `value` is always sent/received
as a plain string regardless of what `type` says it represents (`string`/`number`/`boolean`/
`json`) — this screen doesn't parse or validate the value against its declared type, it's just a
label for whoever consumes the setting downstream.

## What we verified

`tsc -b` + `oxlint` clean. All static i18n keys present in both locales; the five dynamic
`t(\`enums.X.${...}\`)` lookups (aiRuleType, carTypeSize, fuel, problemCategory,
systemSettingType) were checked by hand against every enum value each can produce — all present.
**Live verification pending** — backend server wasn't running while this was built; the `brand_id`
column errors were cross-checked directly against `CreateAiRuleRequest`'s validation rules
(`nullable|integer|exists:car_brands,id`) rather than guessed.
