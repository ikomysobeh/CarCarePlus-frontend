# Feature: Ratings (M20)

Read-only list of customer ratings for completed bookings (service / employee / workshop stars +
a comment). Customers create ratings from their own app, so there's no form here.

Backend contract: `car project/docs/12-bookings-detail-procurement-2026-08-15.md` §M20.

## Files

| File | What it does |
|---|---|
| `types.ts` | the `Rating` shape (three 1–5 ratings, comment, image_urls) |
| `api.ts` | `useRatings()` — a single read hook |
| `RatingsPage.tsx` | the table, with a small `<Stars>` helper that draws 1–5 filled/empty stars |

## Note: a local presentational component

`<Stars value={n} />` is defined inside `RatingsPage.tsx` because it's only used here. If another
screen ever needs stars, promote it to `src/components/` (the "extract on second use" rule). It's a
pure function of its props — no state, no fetching — the React equivalent of a small Blade partial.

## When you'll touch this file

- A ratings detail view (with the photos) is wanted → add a details dialog reading `image_urls`.
- Filtering by rating value / date → add `searchKeys` or a filter bar.
