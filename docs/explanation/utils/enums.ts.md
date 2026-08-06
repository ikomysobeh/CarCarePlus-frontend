# `src/utils/enums.ts` — the backend enum values

**Real file:** [`../../../src/utils/enums.ts`](../../../src/utils/enums.ts)

## What it is

TypeScript copies of your backend's PHP enums (`app/Enums/`), so the frontend uses the exact
same fixed value lists — for dropdowns, filters, and status badges. Mirrors
`docs/05-enums-reference.md`.

**Laravel analogy:** these are literally your PHP `enum FuelType: string { case Petrol =
'petrol'; ... }` re-expressed in TypeScript. Same values, so both sides agree.

## The code (examples)

```ts
export const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const EMPLOYEE_TYPES = ['washer', 'mechanic', 'admin'] as const;
export type EmployeeType = (typeof EMPLOYEE_TYPES)[number];

export const REGISTRATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
// ... WORKSHOP_STATUSES, ORDER_STATUSES, etc.
```

## How to read the two-line pattern

Each enum is expressed in **two** connected lines:

```ts
export const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'] as const;
//           ▲ a real array you can loop over to build a <select> dropdown
//                                                                    ▲ as const = "these
//                                                                      exact strings, frozen"

export type FuelType = (typeof FUEL_TYPES)[number];
//           ▲ a TYPE meaning "one of the values in that array":
//             'petrol' | 'diesel' | 'electric' | 'hybrid'
```

- The **`const` array** is the runtime data — you `.map()` over it to render dropdown options.
- The **`type`** is the compile-time guard — a variable typed `FuelType` can only hold one of
  those four strings. `(typeof FUEL_TYPES)[number]` is a TS trick meaning "the type of one
  element of that array." You don't need to write the union by hand; it's derived from the array.

## The important rule: send the VALUE, show a LABEL

Your API stores/returns the **raw value** (e.g. `"petrol"`). Never translate the value you
send. For display, look up a **localized label** from i18n. Example:
```tsx
{FUEL_TYPES.map((v) => (
  <MenuItem key={v} value={v}>{t(`enums.fuel.${v}`)}</MenuItem>   // value stays 'petrol', label is localized
))}
```
So the dropdown shows "بنزين"/"Petrol" but sends `"petrol"` to the API. This keeps Arabic-first
display without ever corrupting the stored value.

## Live vs future enums

The file separates two groups (matching `docs/05`):
- **Live today** — used by existing endpoints: `FUEL_TYPES`, `EMPLOYEE_TYPES`,
  `REGISTRATION_STATUSES`, `WORKSHOP_STATUSES`.
- **Future** — defined now but their endpoints don't exist yet (orders, payments, packages...).
  `ORDER_STATUSES` is there so we're ready when the backend ships orders. Kept here as a
  reference, not yet wired to any screen.

## When you'll touch this file

When the backend adds enums, or when you build a screen that needs a dropdown/badge for one
of the future enums. Keep values byte-for-byte identical to the PHP enums.
