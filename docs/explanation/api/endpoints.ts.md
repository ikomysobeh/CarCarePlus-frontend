# `src/api/endpoints.ts` — all API URLs in one place

**Real file:** [`../../../src/api/endpoints.ts`](../../../src/api/endpoints.ts)

## What it is

A single object holding **every API path** as a constant, so URLs are never hard-coded
(as loose strings) around the app. If a path changes on the backend, you fix it **here
only**.

**Laravel analogy:** like using **named routes** (`route('cars.index')`) instead of writing
the URL `/cars/all` everywhere. One source of truth.

## The code

```ts
export const endpoints = {
  auth: {
    registerCustomer: '/auth/register/customer',
    login: '/auth/login',
    logout: '/auth/logout',
    // ...
  },
  profile: {
    show: '/profile/showProfile',
    update: '/profile/updateProfile',
  },
  cars: {
    all: '/cars/all',
    indexClient: (customerId?: number) =>
      customerId ? `/cars/indexClient/${customerId}` : '/cars/indexClient',
    store: (customerId?: number) => (customerId ? `/cars/${customerId}` : '/cars'),
    show: (id: number) => `/cars/show/${id}`,
    update: (id: number) => `/cars/update/${id}`,
    destroy: (id: number) => `/cars/delete/${id}`,
  },
  admin: { /* approvals + create staff */ },
  categories: crud('/categories'),
  services: crud('/services'),
  subServices: crud('/sub-services'),
  carTypes: crud('/car-types'),
  carBrands: crud('/car-brands'),
} as const;
```

## How to read it

- **Static path** → a plain string: `endpoints.auth.login` → `'/auth/login'`.
- **Dynamic path** → a small **function** that builds the URL with an id:
  ```ts
  endpoints.cars.show(5)   // → '/cars/show/5'
  ```
  The `` `.../${id}` `` syntax is a **template string** (backticks) — same as PHP
  `"/cars/show/{$id}"`. It inserts the variable into the string.

- **Optional parameter**: `store(customerId?: number)` — the `?` means the argument is
  optional. This matches your API rule: a customer omits `customer_id` (acts on self),
  an admin passes it to act for a specific customer.
  ```ts
  endpoints.cars.store()     // → '/cars'         (customer adds own car)
  endpoints.cars.store(12)   // → '/cars/12'      (admin adds car for customer 12)
  ```

### The `crud()` helper
```ts
function crud(base: string) {
  return {
    index:   base,                          // GET  list
    show:    (id: number) => `${base}/${id}`,
    store:   base,                          // POST create
    update:  (id: number) => `${base}/${id}`,
    destroy: (id: number) => `${base}/${id}`,
  };
}
```
The 5 catalog resources (categories, services, sub-services, car-types, car-brands) all
follow the same URL pattern, so instead of repeating it 5 times, `crud('/categories')`
generates all five paths. DRY — same instinct as a Laravel `Route::apiResource()`.

### `as const`
```ts
} as const;
```
Tells TypeScript "these values never change" so it can give you precise autocomplete and
catch typos (e.g. `endpoints.auth.loginn` becomes a compile error). Small safety win.

## ⚠️ Note this reflects your API's quirks

This file mirrors `docs/03-api-endpoints.md` exactly, including the unusual bits:
- **Update = `POST`** (not PUT/PATCH), because updates carry image uploads.
- **Delete car = `GET`** `/cars/delete/{id}` (catalog deletes are real `DELETE`).

The URL constant just holds the path; the **HTTP method** is chosen where you call it
(`http.post(...)`, `http.get(...)`). Keep the method matching the docs.

## When you'll touch this file

Every time the backend ships a **new endpoint** (orders, branches, finance...), you add
its paths here first, then build the screen that uses them.
