# `src/features/catalog/` — the Categories screen

**Real files:**
- [`CatalogPage.tsx`](../../../../src/features/catalog/CatalogPage.tsx) — the tabbed page
- [`CategoriesSection.tsx`](../../../../src/features/catalog/CategoriesSection.tsx) — the list + actions
- [`CategoryFormDialog.tsx`](../../../../src/features/catalog/CategoryFormDialog.tsx) — the create/edit form
- [`types.ts`](../../../../src/features/catalog/types.ts) — `Category` / `CategoryInput`

> This is our **first full CRUD screen**. It combines the UI kit (M2) + React Query (doc 02) +
> the form pattern (form/README). Every future list-with-CRUD screen follows this shape.

## How the pieces fit
```
CatalogPage (tabs)
  └─ CategoriesSection            ← list + toolbar + wires the dialogs
       ├─ useCategories()         ← React Query: load the list
       ├─ DataTable               ← renders rows, handles loading/error/empty/paging
       ├─ CategoryFormDialog      ← create/edit (react-hook-form + zod)
       └─ ConfirmDialog           ← delete confirmation
```

## `CatalogPage.tsx` — the tabs
The sidebar has one "Catalog" item, but there are 5 resources. So this page shows **tabs**
(Categories / Services / Sub-services / Car types / Car brands). Tab state is local:
```tsx
const [tab, setTab] = useState(0);
...
{tab === 0 && <CategoriesSection />}
{tab !== 0 && <Typography>{t('common.comingSoon')}</Typography>}
```
Categories (tab 0) is built; the others show "coming soon" until we implement them.

## `CategoriesSection.tsx` — the list + actions
### Loading the data
```tsx
const { data, isLoading, error, refetch } = useCategories();
```
One line gives us the list plus loading/error/refetch — all handed to `<DataTable>`.

### Role-gated writing
```tsx
const canWrite = user ? canWriteCatalog(user.role) : false;   // super_admin only
```
- The "Add category" button is rendered only if `canWrite`.
- The **actions column** (edit/delete) is `.push()`ed onto the columns array only if `canWrite`.
So a non-super-admin sees a clean read-only table. (Remember: the backend is the real gate —
this just tidies the UI. See [`../../auth/guards.tsx.md`](../../auth/guards.tsx.md).)

### Columns as data
```tsx
const columns: Column<Category>[] = [
  { key: 'name_ar', header: t('field.nameAr') },
  { key: 'name', header: t('field.name') },
  { key: 'description', header: t('field.description') },
  { key: 'is_active', header: t('field.status'),
    render: (c) => <StatusChip status={c.is_active ? 'active' : 'inactive'} /> },
];
```
The status column uses `render` to show a `<StatusChip>` instead of raw text. Headers are
translated. See [`../../components/DataTable.tsx.md`](../../components/DataTable.tsx.md).

### Managing the dialogs with state
```tsx
const [formOpen, setFormOpen] = useState(false);
const [editing, setEditing]   = useState<Category | null>(null);   // null = create
const [toDelete, setToDelete] = useState<Category | null>(null);
```
- Clicking **Add** → `setEditing(null); setFormOpen(true)` → dialog opens in "create" mode.
- Clicking a row's **Edit** → `setEditing(category); setFormOpen(true)` → dialog opens pre-filled.
- Clicking **Delete** → `setToDelete(category)` → the `ConfirmDialog` opens (`open={!!toDelete}`).
This is the controlled-component pattern again: the section owns the state, the dialogs just
render it.

### Delete flow
```tsx
<ConfirmDialog
  open={!!toDelete}
  message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
  loading={del.isPending}
  onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
  onClose={() => setToDelete(null)}
/>
```
`del.mutate(id)` runs the delete; its `api.ts` `onSuccess` invalidates the list so the row
disappears; `onSettled` closes the dialog either way. `t('...', { name })` fills the `{{name}}`
placeholder in the translation with the Arabic name.

## `CategoryFormDialog.tsx` — create & edit in one
- One zod schema for validation (name, name_ar required; description optional; is_active boolean).
- Wrapped in `<FormProvider>` so our `FormTextField`/`FormSwitch` fields work (see
  [`../../components/form/README.md`](../../components/form/README.md)).
- `useEffect(... [open, category])` **resets** the form when the dialog opens: to the row's
  values for edit, or blanks for create. (Without this, the form would keep stale values.)
- On submit: calls `update.mutateAsync` (edit) or `create.mutateAsync` (create); on success
  closes; on `ApiError` with `fieldErrors` (a 422), maps each server error onto its field with
  `setError` so the message shows under the right input.

## What we verified in the browser
List loads from the live API; **create** → auto-refetch → new row appears; **delete** → confirm
→ auto-refetch → row removed; write buttons only for super_admin; all Arabic. (See the changelog.)

## When you'll touch these
When we add the other 4 catalog resources (same pattern, new fields — e.g. the Service form adds
`base_price`, `is_vip_available`, and a conditional `vip_extra_price`).
