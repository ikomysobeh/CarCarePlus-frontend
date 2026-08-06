# `src/app/router.tsx` — the routes (your `routes/web.php`)

**Real file:** [`../../../src/app/router.tsx`](../../../src/app/router.tsx)

## What it is

The **URL → page** map. This is the closest file to Laravel's `routes/web.php`. It says:
"when the browser URL is `/cars`, show the Cars page; when it's `/login`, show the Login
page." React Router swaps pages **without reloading** the browser.

## The code

```tsx
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Placeholder title="Dashboard" ... /> },
      { path: 'cars', element: <Placeholder title="Cars" ... /> },
      { path: 'catalog', element: <Placeholder title="Catalog" ... /> },
      { path: 'profile', element: <Placeholder title="Profile" ... /> },
      {
        path: 'approvals',
        element: (
          <RequireRole roles={['super_admin']}>
            <Placeholder title="Registration Requests" ... />
          </RequireRole>
        ),
      },
      { path: 'staff', element: <RequireRole roles={['super_admin']}>...</RequireRole> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
```

## Block by block

### `createBrowserRouter([ ... ])`
Takes an **array of route objects**. Each object = one route. Compare to Laravel:
```php
Route::get('/login', [AuthController::class, 'show']);   // Laravel
{ path: '/login', element: <LoginPage /> }               // React — element is the page component
```
Instead of a controller method, a route points to a **component** to render.

### Route 1 — public login
```tsx
{ path: '/login', element: <LoginPage /> }
```
No guard around it → anyone can reach `/login`. See [`../auth/pages/LoginPage.tsx.md`](../auth/pages/LoginPage.tsx.md).

### Route 2 — the protected dashboard (with nested children)
```tsx
{
  path: '/',
  element: <RequireAuth><DashboardLayout /></RequireAuth>,
  children: [ ... ]
}
```
- `<RequireAuth>` wraps it → you must be logged in, otherwise you're redirected to `/login`.
  This is exactly a **middleware** (`auth`) in Laravel. See [`../auth/guards.tsx.md`](../auth/guards.tsx.md).
- `<DashboardLayout />` is the shell (sidebar + topbar). See [`../layouts/DashboardLayout.tsx.md`](../layouts/DashboardLayout.tsx.md).
- `children` = **nested routes**. They render **inside** the layout, at the spot marked by
  `<Outlet />` in `DashboardLayout`. This is like a Blade layout with `@yield('content')`,
  where each child route fills the content area but the sidebar/topbar stay fixed.

### Nested children
```tsx
{ index: true, element: <Placeholder title="Dashboard" /> },   // the "/" home page
{ path: 'cars', element: <Placeholder title="Cars" /> },       // "/cars"
```
- `index: true` = the default page shown at the parent path `/` (the dashboard home).
- `path: 'cars'` (no leading slash) = child of `/`, so the full URL is `/cars`.

### Role-protected children
```tsx
{
  path: 'approvals',
  element: <RequireRole roles={['super_admin']}> ... </RequireRole>,
}
```
`<RequireRole roles={['super_admin']}>` = a middleware that only lets super admins in
(others get redirected). Same idea as Laravel's `->middleware('role:super_admin')`.
See [`../auth/guards.tsx.md`](../auth/guards.tsx.md).

### Catch-all
```tsx
{ path: '*', element: <Navigate to="/" replace /> }
```
`*` matches **any** URL that didn't match above → redirect to `/`. This is the 404 fallback.
`replace` means "don't add a new browser-history entry" (so Back doesn't loop).

## About the `<Placeholder>` pages

Right now most pages are `<Placeholder>` — a temporary "this screen isn't built yet" box
that also lists which API endpoints it will use (see [`../components/Placeholder.tsx.md`](../components/Placeholder.tsx.md)).
**As we build each real screen, we replace its `<Placeholder>` here with the real component.**
That's the main way this file changes over time.

## Laravel analogy summary

| React Router | Laravel |
|--------------|---------|
| `createBrowserRouter([...])` | `routes/web.php` |
| `element: <Page />` | `[Controller::class, 'method']` |
| `<RequireAuth>` | `->middleware('auth')` |
| `<RequireRole roles={['super_admin']}>` | `->middleware('role:super_admin')` |
| `children` + `<Outlet/>` | layout `@yield('content')` |
| `path: '*'` | fallback / 404 route |

## When you'll touch this file

**Often** — every time we add a new screen, we register its route here (and usually add a
sidebar item in `layouts/DashboardLayout.tsx` + `utils/permissions.ts`).
