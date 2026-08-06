# `src/components/DataTable.tsx` — the generic table

**Real file:** [`../../../src/components/DataTable.tsx`](../../../src/components/DataTable.tsx)

## What it is

A reusable table that takes a list of rows + column definitions and renders a paginated,
optionally-searchable table — with the loading/error/empty states handled inside. Built on
plain MUI `Table` primitives (not the heavier DataGrid), so we fully control it.

**Why client-side paging:** the API returns a **plain array** today (no server pagination — see
[`../api/client.ts.md`](../api/client.ts.md) and docs/02). So we slice the array in the browser.
When the backend adds server pagination, we change *this file's* internals only; screens using
it don't change.

## The two TypeScript ideas here

### 1. Generics — `DataTable<T>`
```tsx
export default function DataTable<T>({ columns, rows, getRowId, ... }: DataTableProps<T>) {
```
`<T>` is a **type placeholder** — "whatever row type you pass". Give it `Category[]` and TS
knows each row is a `Category`; give it `Car[]` and it adapts. Same idea as a PHP
`Collection<Category>` — one table, any row type, fully type-checked. (In `.tsx`, generic
functions are written as `function Name<T>(...)`, not arrow functions, to avoid JSX ambiguity.)

### 2. Column definitions — data, not markup
```ts
export interface Column<T> {
  key: string;                      // unique id for the column
  header: string;                   // the column title (already translated)
  render?: (row: T) => ReactNode;   // custom cell (chip, buttons…); optional
  align?: 'left' | 'right' | 'center';
}
```
You describe columns as an **array of objects**, and the table renders them. A column either
prints `row[key]` as text, or — if you give a `render` function — shows custom content:
```tsx
const columns: Column<Category>[] = [
  { key: 'name_ar', header: t('field.nameAr') },
  { key: 'is_active', header: t('field.status'), render: (c) => <StatusChip status={c.is_active ? 'active' : 'inactive'} /> },
  { key: 'actions', header: '', render: (c) => <IconButton onClick={() => edit(c)}><Edit/></IconButton> },
];
```

## Block by block

### State (all client-side)
```tsx
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [search, setSearch] = useState('');
```
Three pieces of local state: current page, page size, and the search text.

### Filtering + paging with `useMemo`
```tsx
const filtered = useMemo(() => { /* filter rows by search across searchKeys */ }, [rows, search, searchKeys]);
const paged   = useMemo(() => filtered.slice(page*rowsPerPage, page*rowsPerPage + rowsPerPage), [filtered, page, rowsPerPage]);
```
- `filtered` — if `searchKeys` were provided and there's a search term, keep only rows where one
  of those fields contains the term (case-insensitive). Otherwise all rows.
- `paged` — the slice for the current page.
- `useMemo(..., [deps])` recomputes **only when a dependency changes** — so we don't re-filter a
  big list on every keystroke elsewhere. A performance guard.

### The early returns (async states)
```tsx
if (loading) return <Loader />;
if (error)   return <ErrorState error={error} onRetry={onRetry} />;
```
Before rendering the table, short-circuit to the loading/error UI. Clean and consistent.

### The search box
Rendered only if `searchKeys` were passed. Typing updates `search` and resets to page 0 (so you
don't sit on an empty page 3 of filtered results). Uses `slotProps={{ input: {...} }}` (the MUI
v9 way to add an adornment icon).

### The table + empty state
If `filtered.length === 0` → `<EmptyState>`. Otherwise render:
- `<TableHead>` — one `<TableCell>` per column header.
- `<TableBody>` — for each row in `paged`, one `<TableRow>`; for each column, a `<TableCell>`
  that shows `c.render(row)` or the raw `row[key]`.
- `key={getRowId(row)}` — React needs a stable unique key per row; you tell it how to get the id
  (usually `(row) => row.id`).
- `<TablePagination>` — the page controls; `count` is the **filtered** length so paging respects
  the search.

## How a screen uses it (preview of M3)
```tsx
<DataTable
  columns={columns}
  rows={categories}
  getRowId={(c) => c.id}
  loading={isLoading}
  error={error}
  onRetry={refetch}
  searchKeys={['name', 'name_ar']}
  emptyMessage={t('catalog.empty')}
/>
```

## When you'll touch this file

When we add server-side pagination (swap the client slicing for API `page`/`per_page` params +
`meta`), or add features like column sorting. Screens won't need to change when we do.
