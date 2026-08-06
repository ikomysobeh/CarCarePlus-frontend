# `src/components/Placeholder.tsx` — the temporary "not built yet" page

**Real file:** [`../../../src/components/Placeholder.tsx`](../../../src/components/Placeholder.tsx)

## What it is

A tiny reusable component that shows a page title and an info box listing which API
endpoints that page will eventually use. It's a **stand-in** for screens we haven't built
yet, so the app runs and you can click around the whole navigation from day one.

## The code

```tsx
export default function Placeholder({ title, hint }: { title: string; hint?: string }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>{title}</Typography>
      {hint && (
        <Alert severity="info" sx={{ maxWidth: 640 }}>{hint}</Alert>
      )}
    </Box>
  );
}
```

## Block by block

- `export default function Placeholder({ title, hint })` — a component that takes two
  **props**: `title` (required) and `hint` (optional, marked `hint?`).
- `<Typography variant="h4">{title}</Typography>` — renders the title as a big heading.
  `<Typography>` is MUI's text component; `variant="h4"` picks the size/weight.
- `{hint && <Alert>...</Alert>}` — the inline `@if` idiom: **only** show the info alert if a
  `hint` was passed. `<Alert severity="info">` is MUI's blue info box.
- `gutterBottom` — adds spacing under the heading (an MUI convenience prop).

## Where it's used

In [`../app/router.tsx.md`](../app/router.tsx.md), most routes currently render a
`<Placeholder>` with a hint naming the endpoints, e.g.:
```tsx
<Placeholder title="Cars" hint="GET /cars/all, POST /cars, ..." />
```

## Its real purpose in our workflow

It lets us:
1. Wire up **all** routes and the sidebar now, so navigation is complete and testable.
2. See, on each unbuilt page, exactly which endpoints it needs (a to-do note baked into the UI).
3. Replace them **one at a time** with real screens as we build — no broken links meanwhile.

## When it goes away

Each time we finish a real screen, we swap its `<Placeholder>` in `router.tsx` for the real
component. When every screen is built, `Placeholder` may still stay for the "coming soon"
modules whose backend endpoints don't exist yet (orders, finance, etc.).
