# `src/api/client.ts` — the ONE place that talks to your Laravel API ⭐

**Real file:** [`../../../src/api/client.ts`](../../../src/api/client.ts)

> This is the **most important file in the project.** Read it carefully. Every single
> request to your Laravel API goes through here.

## What it is

A configured **axios** instance (axios = the HTTP client, like Laravel's `Http::` facade)
plus two interceptors and helpers. It handles, in ONE place:
- attaching the Bearer token to every request,
- understanding your API's response envelope `{ status, data, message, status_code, timestamp }`,
- turning failures into clean errors,
- redirecting to login on 401,
- extracting field errors on 422.

**Laravel analogy:** imagine a single `ApiService` class that every controller calls, which
already knows your auth header, your response shape, and your error handling. That's this file.

## Block by block

### The token store
```ts
const TOKEN_KEY = 'ccp_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};
```
- `localStorage` = a small key/value store in the browser that survives page refresh
  (like a persistent cookie you control from JS).
- We save the **Sanctum token** your API returns on login here, and read it back on every
  request. `clear()` is used on logout / 401.

### The axios instance
```ts
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: 'application/json' },
});
```
- `baseURL` comes from the `.env` file (`VITE_API_BASE_URL=http://localhost:8000/api`).
  So `http.get('/cars/all')` actually calls `http://localhost:8000/api/cars/all`.
- `import.meta.env.X` is how Vite exposes env vars (only vars starting with `VITE_`).
  This is Vite's version of Laravel's `env('...')`.
- `Accept: application/json` — always ask the API for JSON (important for Laravel: it makes
  validation return JSON 422 instead of a redirect).

### Request interceptor — attach the token automatically
```ts
http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
- An **interceptor** = code that runs on **every** request before it's sent (like Laravel
  **middleware**, but on the client).
- If we have a token, add `Authorization: Bearer <token>`. So you never manually add the
  auth header anywhere else. Ever.

### Response interceptor — understand the envelope & handle errors
```ts
http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    if (body && typeof body === 'object' && 'status' in body && body.status === 0) {
      throw new ApiError(body.message, body.status_code, undefined, body.data);
    }
    return response;
  },
  (error: AxiosError<...>) => { ... }
);
```
This runs on **every** response. There are two functions:

**1. The success handler** (first argument): even when the HTTP status is 200, your API
can still signal failure with `status: 0` in the body. So we check: if `status === 0`,
we **throw** an `ApiError` so the calling code treats it as a failure. Otherwise we pass
the response through.

> ⚠️ This is specific to your API design. Your envelope uses `status: 1` (ok) / `status: 0`
> (fail) as a **number**, not a boolean. This file is the one place that knows that.

**2. The error handler** (second argument) — runs when the HTTP status is 4xx/5xx:
```ts
const status = res?.status ?? 0;

if (status === 401) {
  tokenStore.clear();
  if (window.location.pathname !== '/login') window.location.assign('/login');
}
```
- **401 Unauthorized** (token missing/expired) → clear the token and send the user to
  `/login`. This is our global "session expired" handling.

```ts
const fieldErrors =
  (body?.errors as Record<string, string[]> | undefined) ??
  (body?.data as Record<string, string[]> | undefined);

throw new ApiError(
  body?.message || error.message || 'Network error',
  body?.status_code || status,
  status === 422 ? fieldErrors : undefined,
  body?.data,
);
```
- **422 Unprocessable** (validation failed) → we grab the per-field messages (Laravel puts
  them under `errors`, or possibly `data` in your custom envelope — it checks both) and
  attach them to the error as `fieldErrors`. Forms then show them under each input.
- Everything else → we throw a clean `ApiError` with the message and status code.
  (`ApiError` is our custom error class — see [`types.ts.md`](types.ts.md).)

> The `??` operator = "if the left side is null/undefined, use the right side" (like PHP's `??`).

### The `unwrap` helper
```ts
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise;
  return res.data.data as T;
}
```
- Your envelope nests the real payload under `data`. So a raw axios response is
  `response.data` (the envelope) `.data` (the actual payload) — `response.data.data`. Ugly.
- `unwrap()` does that digging for you, so calling code gets **just the payload**:
  ```ts
  const cars = await unwrap<Car[]>(http.get('/cars/all'));   // cars is the array directly
  ```
- `<T>` is a **generic** — a placeholder for "whatever type this returns" (like PHP generics
  in docblocks `@return Collection<Car>`). `unwrap<Car[]>` means "the payload is a Car array".
- `await` = wait for the async HTTP call to finish (like awaiting a promise; conceptually
  similar to synchronous PHP where the call just blocks until done).

## How you'll use it (the pattern for every screen)

```ts
import { http, unwrap } from '../api/client';
import { endpoints } from '../api/endpoints';

const cars = await unwrap<Car[]>(http.get(endpoints.cars.all));
```

You never touch tokens, headers, or the envelope — this file already did it.

## When you'll touch this file

**Almost never.** It's the stable foundation. You only edit it if the API's global
behavior changes (e.g. a new response field, a refresh-token flow). Day-to-day you just
`import` and use it.
