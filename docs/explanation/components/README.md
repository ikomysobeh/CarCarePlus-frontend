# Shared UI kit (`src/components/`) — overview

**Added in M2.** These are the reusable building blocks every screen is made from — styled
once to the design system, so screens stay consistent and small. Import them from the barrel:

```tsx
import { PageHeader, DataTable, ConfirmDialog, StatusChip, FormTextField } from '../../components';
```

**Laravel analogy:** think of these as your **Blade components** (`<x-table>`, `<x-modal>`,
`<x-form.input>`) — a private component library your "views" (screens) compose.

## The files

| File | What it is | Doc |
|------|-----------|-----|
| `PageHeader.tsx` | screen title + optional action button | this file ↓ |
| `StatusChip.tsx` | colored status badge (localized) | this file ↓ |
| `states/Loader.tsx` | centered spinner | this file ↓ |
| `states/EmptyState.tsx` | "no data" placeholder | this file ↓ |
| `states/ErrorState.tsx` | error + retry | this file ↓ |
| `ConfirmDialog.tsx` | yes/no modal for risky actions | [`ConfirmDialog.tsx.md`](ConfirmDialog.tsx.md) |
| `DataTable.tsx` | generic paginated table | [`DataTable.tsx.md`](DataTable.tsx.md) |
| `form/*` | form fields wired to react-hook-form | [`form/README.md`](form/README.md) |

---

## Two cross-cutting ideas (used everywhere below)

### 1. `sx` — inline styling
MUI components take an `sx={{ ... }}` prop = CSS written as a JS object. `sx={{ py: 6 }}` means
padding-top+bottom of `6 × 8px = 48px` (MUI's spacing unit). It's how we style without separate
CSS files. In MUI v9, style-ish values (e.g. `fontWeight`, `alignItems`) go **inside `sx`**,
not as direct props.

### 2. The three async states
Any screen that loads data from the API is always in one of four states. Our kit has a
component for three of them, so every screen handles them the same way:
- **loading** → `<Loader />`
- **error** → `<ErrorState error={...} onRetry={...} />`
- **empty** (loaded, but zero rows) → `<EmptyState message="..." />`
- **has data** → the actual content

`DataTable` handles all four internally, so most screens don't even wire them by hand.

---

## The simple display components (full walkthrough)

### `PageHeader.tsx`
```tsx
<PageHeader title={t('nav.catalog')} action={<Button>+ Add</Button>} />
```
A flex row: title (+ optional `subtitle`) on one side, an optional `action` node on the other.
`justifyContent: 'space-between'` pushes them apart; RTL flips the sides automatically.

### `StatusChip.tsx`
```tsx
<StatusChip status="approved" />   // green chip reading "معتمد" / "Approved"
```
- Maps a backend status string → a MUI chip color via the `COLOR_BY_STATUS` table
  (approved/active → green, pending → orange, rejected/cancelled → red, …).
- Localizes the label with `t('status.<value>')`, falling back to the raw value. So you add the
  Arabic/English text once in `i18n/locales` and every chip shows it.
- Covers today's statuses (registration/workshop) and future ones (orders/payments), so it's
  ready when those screens arrive.

### `states/Loader.tsx`
A centered `<CircularProgress>` + a "loading…" caption. Drop it in while a request is running.

### `states/EmptyState.tsx`
An inbox icon + a message + an optional `action` (e.g. "add the first item"). Shown when a list
loaded successfully but is empty.

### `states/ErrorState.tsx`
An error icon + a friendly message + a "Retry" button. It reads the message from our `ApiError`
(so the user sees the API's message), and calls `onRetry` — which we wire to React Query's
`refetch`. Explained more when we use React Query in M3.

---

## When you'll touch these

You **use** them constantly (every screen), but rarely **edit** them. When a screen needs a new
generic piece (e.g. a date-range picker, a stat card), we add it here so the next screen reuses
it. Screen-specific one-offs stay in the feature folder, not here.
