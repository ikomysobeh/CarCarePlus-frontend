# `src/features/catalog/api.ts` — Categories data hooks

**Real file:** [`../../../../src/features/catalog/api.ts`](../../../../src/features/catalog/api.ts)

> Prerequisite: read [`../../02-react-query-data-fetching.md`](../../02-react-query-data-fetching.md)
> first. This file is that theory applied to Categories.

## What it is

The React Query hooks for the Categories resource — the **only** place category API calls live.
Screens import `useCategories()`, `useCreateCategory()`, etc. **Laravel analogy:** a
`CategoryRepository` with built-in caching that the UI subscribes to.

## The query key
```ts
export const categoryKeys = {
  all: ['categories'] as const,
};
```
One cache tag for all category data. We reuse `categoryKeys.all` for both reading (the query)
and invalidating (after writes) so they always match. Keeping keys in an object (not scattered
string literals) prevents typos and makes them easy to find.

## Reading — `useCategories`
```ts
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => unwrap<Category[]>(http.get<ApiResponse<Category[]>>(endpoints.categories.index)),
  });
}
```
- Fetches `GET /categories` and returns the plain `Category[]` (via `unwrap`).
- The screen calls `const { data, isLoading, error, refetch } = useCategories();` and passes
  those straight into `<DataTable>`.

## Writing — create / update / delete
All three follow the same shape: a `mutationFn` that calls the API, and an `onSuccess` that
invalidates the list so the table refreshes.

```ts
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) =>
      unwrap<Category>(http.post<ApiResponse<Category>>(endpoints.categories.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
```
- **create** → `POST /categories`.
- **update** → `POST /categories/{id}` (the API uses **POST** for updates, not PUT — see
  docs/03). Its `mutationFn` takes `{ id, input }`.
- **delete** → `DELETE /categories/{id}`.
- `useQueryClient()` gives the shared cache so `onSuccess` can invalidate `categoryKeys.all`.

## Why this pattern scales

The other four catalog resources (services, sub-services, car types, car brands) will each get
an `api.ts` exactly like this — only the type, endpoint, and key change. Once you understand
this file, you understand all of them.

## When you'll touch this file

When categories gain a field, or when the backend adds server pagination (the `queryFn` would
pass `page`/`per_page` and the key would include them, e.g. `['categories', { page }]`).
