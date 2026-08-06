# 02 — Data fetching with React Query 🔄

> Read this once. It's the "data half" of every screen (the "form half" is in
> `components/form/README.md`). After this, the catalog/cars/staff screens will make sense.

In Laravel, a controller asks a **repository/model** for data, and the framework caches if you
tell it to. In React there's no server doing that per request — the browser app must fetch data
over HTTP **and** decide when to refetch, cache, show spinners, and handle errors. Doing that by
hand (with `useState` + `useEffect` + `fetch`) is tedious and buggy. **React Query** does it for
us.

**One-line analogy:** React Query is a **caching repository layer for your API**, living in the
browser. You declare "this screen needs the categories list"; it fetches once, caches it, shares
it across components, tracks loading/error, and refetches when you tell it the data is stale.

---

## The two hooks you'll use everywhere

### 1. `useQuery` — READ data (GET)
```ts
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['categories'],
  queryFn: () => unwrap<Category[]>(http.get(endpoints.categories.index)),
});
```
- `queryKey: ['categories']` — the **cache identity**. Think of it as a **cache tag**. Any
  component that uses this key shares the same cached data. Ask for it in 3 places → **one**
  network request.
- `queryFn` — the function that actually fetches (uses our `http` + `unwrap`, so it returns the
  plain payload).
- The hook returns state React Query manages **for you**:
  - `data` — the result (undefined until loaded).
  - `isLoading` — true during the first fetch → show `<Loader/>`.
  - `error` — set if the request threw → show `<ErrorState/>`.
  - `refetch` — call it to fetch again (wired to our "Retry" button).

No more manual `useState`/`useEffect`/loading flags. You *declare* what you need; it manages the
rest.

### 2. `useMutation` — WRITE data (POST / DELETE)
```ts
const qc = useQueryClient();
const create = useMutation({
  mutationFn: (input) => unwrap<Category>(http.post(endpoints.categories.store, input)),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
});
// later:
create.mutate(formValues);          // fire it
create.isPending;                    // true while the request runs (disable the Save button)
```
- `mutationFn` — the write call.
- `onSuccess` — runs after it succeeds. Here we **invalidate** the `['categories']` query.
- `create.mutate(payload)` — triggers it; `create.mutateAsync(payload)` returns a promise you can
  `await` (we use that in the form so we can `catch` 422 errors).
- `create.isPending` — request in flight (disable buttons, show progress).

---

## The most important idea: invalidation keeps the UI in sync

The problem: you add a category. The list on screen still shows the **old** data (it was cached).
How does it update?

**Answer:** in the mutation's `onSuccess`, we call
```ts
queryClient.invalidateQueries({ queryKey: ['categories'] });
```
This tells React Query: "the `categories` cache is now stale — refetch it." Every `useQuery`
using that key automatically re-runs and the table re-renders with the fresh list. You saw this
live: **POST /categories → then an automatic GET /categories**, and the new row appeared with no
manual state juggling.

**Laravel analogy:** like `Cache::tags('categories')->flush()` after a write — except the UI is
subscribed to that cache and repaints itself the moment it refreshes.

```
                 ┌─────────── useQuery(['categories']) ⟶ shows the table
create.mutate() ─┤
                 └── POST /categories ⟶ onSuccess ⟶ invalidate(['categories'])
                                                       │
                                          React Query refetches GET /categories
                                                       │
                                          table re-renders with the new row ✅
```

---

## Where React Query is configured

The shared "brain" (`QueryClient`) is created in `lib/queryClient.ts` and provided app-wide in
`app/providers.tsx` via `<QueryClientProvider>`. Defaults there: retry once, treat data fresh for
30s, don't refetch on window focus. See [`lib/queryClient.ts.md`](lib/queryClient.ts.md).

---

## Our convention: one `api.ts` per feature

We don't scatter `useQuery` calls in components. Each feature has an `api.ts` exporting named
hooks (`useCategories`, `useCreateCategory`, …). Screens import those. Benefits: the query keys
live in one place, and screens stay about UI, not fetching. See
[`features/catalog/api.ts.md`](features/catalog/api.ts.md) for the real example.

---

## Cheat sheet

| You want to… | Use | Key part |
|--------------|-----|----------|
| Load a list/record | `useQuery` | `queryKey` + `queryFn` |
| Create/update/delete | `useMutation` | `mutationFn` + `onSuccess` invalidate |
| Refresh a list after a write | `queryClient.invalidateQueries({ queryKey })` | same key as the query |
| Show a spinner | `isLoading` | from `useQuery` |
| Show an error + retry | `error`, `refetch` | from `useQuery` |
| Disable a button mid-save | `isPending` | from `useMutation` |
