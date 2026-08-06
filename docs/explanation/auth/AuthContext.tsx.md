# `src/auth/AuthContext.tsx` — the logged-in user, globally

**Real file:** [`../../../src/auth/AuthContext.tsx`](../../../src/auth/AuthContext.tsx)

## What it is

This provides the app's **auth state** — the current user, plus `login()` and `logout()` —
to every component, via React **Context** (explained in `../01-react-for-laravel-devs.md`,
section 6). It's the React equivalent of Laravel's `auth()` helper being available everywhere.

Two things live here:
1. `<AuthProvider>` — holds the state, mounted once in `providers.tsx`.
2. `useAuth()` — the hook any component calls to read the user or trigger login/logout.

## Block by block

### The shape of the auth state
```ts
interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (u: AuthUser | null) => void;
}
```
This is the "API" of our auth system: who's logged in (`user`, or `null`), whether we're
still checking (`loading`), and the actions.

### Creating the context
```ts
const AuthContext = createContext<AuthState | null>(null);
```
Creates the "channel" that carries the auth state down the component tree. Starts as `null`
until the provider fills it.

### The provider component
```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
```
- Holds `user` and `loading` in **state**. When `user` changes, every component using
  `useAuth()` re-renders automatically (e.g. the sidebar updates to the new role).

### Restoring the session on page load
```tsx
useEffect(() => {
  const token = tokenStore.get();
  if (!token) { setLoading(false); return; }

  unwrap<AuthUser>(http.get(endpoints.profile.show))
    .then(setUser)
    .catch(() => { tokenStore.clear(); setUser(null); })
    .finally(() => setLoading(false));
}, []);
```
- Runs **once** when the app starts (`[]`).
- If there's a saved token (from a previous session), it calls `GET /profile/showProfile`
  to fetch the current user and restore the session — so a refresh doesn't log you out.
- `.then(setUser)` = on success, store the user. `.catch(...)` = if the token is invalid,
  clear it. `.finally(...)` = either way, stop showing the loading spinner.
- `loading` matters: while we check the token, the route guards show a spinner instead of
  bouncing you to `/login` prematurely.

### `login()`
```tsx
const login = async (email, password) => {
  const u = await unwrap<AuthUser>(
    http.post(endpoints.auth.login, { email, password }),
  );
  if (u.token) tokenStore.set(u.token);
  setUser(u);
  return u;
};
```
- Calls `POST /auth/login`. Your API returns the user **with a `token`**.
- Saves the token (so future requests are authenticated — see `../api/client.ts.md`), then
  stores the user in state → the whole app instantly knows you're logged in.

### `logout()`
```tsx
const logout = async () => {
  try { await http.post(endpoints.auth.logout); }
  finally { tokenStore.clear(); setUser(null); }
};
```
- Calls `POST /auth/logout` to revoke the token on the server, then clears it locally and
  wipes the user. `finally` ensures we log out locally **even if** the server call fails.

### Exposing the state
```tsx
return (
  <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
    {children}
  </AuthContext.Provider>
);
```
Everything inside `{children}` (i.e. the whole app) can now read this via `useAuth()`.

### The `useAuth()` hook
```tsx
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
```
- Reads the context. The guard `if (!ctx) throw` protects you from calling `useAuth()`
  somewhere the provider isn't mounted (a helpful error instead of a confusing crash).

## How you'll use it in any screen

```tsx
const { user, logout } = useAuth();

return <p>Hello {user?.name}</p>;   // user?.name = safe access, like $user?->name
```

`useAuth()` is your `auth()->user()`. It works anywhere under `<AuthProvider>` (which is
the whole app).

## 🆕 What M1 changed — smarter session restore

The boot `.catch` used to log you out on **any** error. Now it only drops the token on a real
**401** (invalid/expired token); a server hiccup (500) or network blip keeps you logged in:
```tsx
.catch((e) => {
  if (e instanceof ApiError && e.status_code === 401) {
    tokenStore.clear();
    setUser(null);
  }
})
```
**Why this mattered:** during M1 we hit a backend bug where `GET /profile/showProfile`
returned **500**, which (with the old code) wiped the token on every refresh and kicked you to
login. The backend was fixed (missing `auth:sanctum` middleware — see
[`../changelog.md`](../changelog.md)), and this frontend change makes us resilient to future
transient errors too.

## When you'll touch this file

Rarely. Maybe to add a `register()` action, or an idle-timeout auto-logout (the SRS mentions
30-minute timeout). For normal screens you just **consume** it with `useAuth()`.
