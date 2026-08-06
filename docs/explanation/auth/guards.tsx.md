# `src/auth/guards.tsx` — route protection (your middleware)

**Real file:** [`../../../src/auth/guards.tsx`](../../../src/auth/guards.tsx)

## What it is

Two wrapper components that protect routes:
- `<RequireAuth>` — "must be logged in" (like Laravel's `auth` middleware).
- `<RequireRole roles={[...]}>` — "must have one of these roles" (like `role:super_admin`).

You saw them used in [`../app/router.tsx.md`](../app/router.tsx.md). Here's how they work.

## Block by block

### A small loading spinner
```tsx
function FullscreenLoader() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}
```
- A tiny component that centers a spinner on the screen.
- `<Box>` is an MUI `div` with a styling prop `sx={{ }}`. `sx` = inline styles written as a
  JS object (`placeItems: 'center'` = CSS `place-items: center`). Think of it as writing CSS
  right where you use it.
- Shown while we're still checking the token, so the UI doesn't flicker.

### `RequireAuth` — must be logged in
```tsx
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullscreenLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
```
Reads like a middleware, top to bottom:
1. `if (loading)` — still checking the saved token? Show the spinner, decide nothing yet.
2. `if (!user)` — not logged in? **Redirect** to `/login`. `<Navigate>` is React Router's
   "redirect now" component (like `return redirect('/login')` in Laravel).
   - `state={{ from: location }}` remembers which page they wanted, so after login you can
     send them back there.
   - `replace` = don't add a history entry (Back won't return to the blocked page).
3. Otherwise, render `{children}` — the actual protected page.
   - `<>...</>` is a **Fragment**: an invisible wrapper to return children without adding a
     real `<div>`. (Just a "return these as-is".)

### `RequireRole` — must have an allowed role
```tsx
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullscreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```
- `roles: Role[]` — the list of allowed roles is passed as a prop:
  `<RequireRole roles={['super_admin']}>`.
- `roles.includes(user.role)` — is the user's role in the allowed list? If **not**, redirect
  to `/` (home) — they're logged in but not permitted. Same idea as `role:super_admin`
  middleware returning 403.

## ⚠️ Important security note

These guards are **UX only** — they hide/redirect on the client. A determined user can
bypass client-side checks. **The real gate is your Laravel API** (Spatie permissions,
`can:` / `role:` middleware returning 403). Always enforce permissions on the backend; the
frontend guards just make the UI clean. This is stated in `docs/04-roles-and-permissions.md`.

## Laravel analogy

| Guard | Laravel |
|-------|---------|
| `<RequireAuth>` | `->middleware('auth')` |
| `<RequireRole roles={['super_admin']}>` | `->middleware('role:super_admin')` |
| `<Navigate to="/login" />` | `return redirect('/login')` |

## When you'll touch this file

Occasionally — e.g. to add a `<RequirePermission ability="edit.car">` guard when we start
hiding buttons by fine-grained permission. For now the two guards cover our needs.
