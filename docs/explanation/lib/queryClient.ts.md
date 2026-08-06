# `src/lib/queryClient.ts` — the server-data cache (React Query)

**Real file:** [`../../../src/lib/queryClient.ts`](../../../src/lib/queryClient.ts)

## What it is

The configuration for **React Query** (a.k.a. TanStack Query) — the library that fetches
data from your Laravel API and **caches** it, so the app is fast and doesn't refetch the same
data over and over.

**Laravel analogy:** think of it as a smart repository layer with built-in caching — you ask
for "cars", it fetches once, remembers the result, shares it across all components, and
knows when to refresh. You don't manage loading flags or cache keys by hand.

## The code

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
```

- `new QueryClient({...})` — creates the cache "brain". It's mounted once in `providers.tsx`
  via `<QueryClientProvider>`, so all screens share the same cache.
- `defaultOptions.queries` — default behavior for every data fetch:
  - `retry: 1` — if a request fails, try **once** more before giving up (handles a flaky
    network without hammering the server).
  - `staleTime: 30_000` — data is considered "fresh" for **30 seconds** (30,000 ms). Within
    that window, navigating back to a screen shows cached data instantly instead of
    refetching. (`30_000` — the `_` is just a readability separator for digits.)
  - `refetchOnWindowFocus: false` — don't auto-refetch every time the user clicks back into
    the browser tab (default is `true`, which can feel noisy). We keep it off for now.

## How you'll actually use React Query (preview)

You won't call `queryClient` directly much. Instead, in screens you'll use the `useQuery`
and `useMutation` hooks, which use this client under the hood:

```tsx
// Fetch data (GET) — automatic loading/error/cache:
const { data: cars, isLoading, error } = useQuery({
  queryKey: ['cars'],                               // the cache key (like a cache tag)
  queryFn: () => unwrap<Car[]>(http.get(endpoints.cars.all)),
});

// Change data (POST/DELETE) — then refresh the list:
const create = useMutation({
  mutationFn: (payload) => http.post(endpoints.cars.store(), payload),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),   // refetch cars
});
```
- `queryKey: ['cars']` — the identity of this data in the cache. Same key = shared cache.
- `isLoading` / `error` — React Query tracks these for you, so you show a spinner or error
  without manual state. (No more juggling `loading` booleans yourself.)
- `invalidateQueries` — after creating/updating/deleting, mark the list stale so it refetches
  and the UI stays in sync. This is the "cache tag flush" idea.

> We'll explain `useQuery`/`useMutation` in depth in the **first data screen we build**
> (Catalog or Cars). This file is just the shared config they rely on.

## When you'll touch this file

Rarely — maybe to tune `staleTime` or retry behavior globally. The per-screen fetching logic
lives in the feature files, not here.
