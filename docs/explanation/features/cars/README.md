# Cars feature (`src/features/cars/`)

**Real files:** [`types.ts`](../../../../src/features/cars/types.ts),
[`api.ts`](../../../../src/features/cars/api.ts),
[`CarFormDialog.tsx`](../../../../src/features/cars/CarFormDialog.tsx),
[`CarsPage.tsx`](../../../../src/features/cars/CarsPage.tsx),
plus [`src/utils/branches.ts`](../../../../src/utils/branches.ts).

> Structurally this is the same recipe as the catalog (list + form dialog + delete confirm +
> React Query hooks). Read [`../catalog/CategoriesSection.tsx.md`](../catalog/CategoriesSection.tsx.md)
> first; this doc covers only what's **new**: file uploads, a path-param owner, GET-delete, and
> the branches workaround.

## 1. The big new thing: file upload via multipart/form-data

A car can carry an **image file**, so its create/update requests can't be plain JSON — they use
`multipart/form-data` (the same encoding a normal HTML `<form>` with a file input sends).

In [`api.ts`](../../../../src/features/cars/api.ts) we convert the input to a `FormData` object:
```ts
function toFormData(input: CarInput): FormData {
  const fd = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;   // skip empties
    if (value instanceof File) fd.append(key, value);                    // the image file
    else if (typeof value === 'boolean') fd.append(key, value ? '1' : '0'); // Laravel booleans
    else fd.append(key, String(value));                                  // numbers/strings
  });
  return fd;
}
```
Then `http.post(url, fd)` — **axios detects the `FormData` and sets the multipart boundary
header automatically**, so we don't set `Content-Type` ourselves.

**Laravel side:** this arrives exactly like a normal form submission — `$request->file('image')`
for the upload, `$request->input('brand_id')` for the rest. That's why the API uses **POST for
updates** (PUT can't carry files cleanly). Booleans go as `'1'`/`'0'` because Laravel's `boolean`
validation rule accepts those, not the string `"true"`.

> **Image field detail:** on **edit**, the field starts as the existing `image_url` **string**
> (for preview). We only send `image` if the user picked a **new File** — otherwise we omit it so
> the backend keeps the current image. See the `if (v.image instanceof File)` check in the dialog.
> This is what [`ImageUploadField`](../../components/form/README.md) was built for.

## 2. The owner goes in the URL, not the body

The create route is `POST /cars/{customer_id?}`:
- a **customer** omits it (acts on themselves),
- an **admin/super_admin must pass** the owner's id in the **path**.

So the mutation takes `{ customerId, input }` and builds the URL with
`endpoints.cars.store(customerId)`; `customer_id` is **not** in the FormData. The form collects
it in a `customer_id` field (shown only when creating; hidden on edit because the owner can't
change).

⚠️ **Blocker:** there's no customer-lookup endpoint yet (docs/07), so for now `customer_id` is a
plain **numeric field** — the admin types the customer's id. When a `GET /customers` search ships,
we'll swap this for a proper picker.

## 3. Delete is a GET (backend quirk)

`useDeleteCar` calls `http.get(endpoints.cars.destroy(id))` — the backend deletes on **GET**
`/cars/delete/{id}` (unusual, but documented in docs/03). We still gate it behind a
`ConfirmDialog`.

## 4. The branches workaround

Adding a car needs a `branch_id`, but there's no branches endpoint yet. So
[`src/utils/branches.ts`](../../../../src/utils/branches.ts) hardcodes the **5 seeded branches**
(temporary). The form's branch dropdown reads from it. Replace with a `useBranches()` query when
the endpoint exists.

## 5. Displaying the list — a couple of details
- **Brand name:** the car response has `brand_id` but **no** `brand` object, so `CarsPage` loads
  car-brands with `useCarBrands()` and builds an `id → name` map (`useMemo`) to render the column.
  (`car_type`, `branch`, and `owner` *are* eager-loaded, so those show directly.)
- **Fuel type:** stored as a raw value (`petrol`…); displayed via `t('enums.fuel.<value>')`.
- **Image:** shown as an `<Avatar>` thumbnail, falling back to the model's first letter.
- **Permissions:** add/edit for super_admin + admin; delete for super_admin only (per docs/04).

## What we verified
List renders 10 cars with brand mapping, localized fuel, branch/owner from relations, and
pagination. The **multipart create** (`POST /cars/{customer_id}` with form-data) and **GET delete**
were verified against the live API (created + deleted a test car; owner set correctly from the
path param). `tsc` + `oxlint` clean; no console errors.

> Test note: the MUI dropdowns couldn't be driven by the browser-automation harness (portalled
> menus), so the full click-through create was verified at the API-contract level with the exact
> multipart request the form sends. Real users' mouse/keyboard operate the selects normally.
>
> Backend note to relay: create ignores `is_active` (only update honors it), so new cars start
> inactive.

## When you'll touch this
When the branches/customer endpoints ship (swap the workarounds), or to add a car **details**
view. The `indexClient` endpoint (a specific customer's cars) is also available for a future
"customer's garage" screen.
