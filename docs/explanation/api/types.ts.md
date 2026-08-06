# `src/api/types.ts` — shared TypeScript types (DTOs)

**Real file:** [`../../../src/api/types.ts`](../../../src/api/types.ts)

## What it is

The **shapes** of data shared across the app: the API envelope, the error class, the user
roles, and the logged-in user object. Types don't produce any runtime behavior — they're
compile-time contracts that catch mistakes while you code.

**Laravel analogy:** think **DTOs** / typed value objects / the shape of an API Resource.
`interface AuthUser` here ≈ what your `UserResource` returns, described as a type.

## The pieces

### `ApiResponse<T>` — the envelope
```ts
export interface ApiResponse<T> {
  status: 0 | 1;         // 1 = success, 0 = failure (a NUMBER, not boolean)
  data: T | null;        // the real payload
  message: string;
  status_code: number;
  timestamp: string;
}
```
- `interface` = defines the shape of an object (like describing an array's keys/types).
- `<T>` = a **generic placeholder** for the payload type. `ApiResponse<Car[]>` means
  "the envelope whose `data` is an array of cars". Same idea as PHP `Collection<Car>`.
- `status: 0 | 1` = a **union type** — the value can only be `0` or `1`, nothing else. The
  compiler rejects `status: 2`.
- `data: T | null` = the payload, or `null` (your API returns `null`/`[]` on some writes).

This exactly matches `docs/02-response-format.md`. The whole app agrees on this one shape.

### `ApiError` — our custom error class
```ts
export class ApiError extends Error {
  status_code: number;
  fieldErrors?: Record<string, string[]>;   // Laravel 422 messages, per field
  data?: unknown;
  constructor(message, status_code, fieldErrors?, data?) { ... }
}
```
- `class ... extends Error` = a normal class that inherits from JS's built-in `Error`
  (like extending `Exception` in PHP).
- When the API layer detects a failure, it `throw new ApiError(...)`. Screens `catch` it
  and can read `.message`, `.status_code`, and `.fieldErrors`.
- `fieldErrors?: Record<string, string[]>` — optional (`?`) map of `field → [messages]`.
  `Record<K, V>` = an object used as a dictionary (like a PHP associative array
  `['email' => ['The email is taken']]`). This is what forms use to show errors under inputs.
- `unknown` = "some value, type not known yet" — safer than `any`; you must check it before use.

### `Role` — the 7 roles
```ts
export type Role =
  | 'super_admin' | 'admin' | 'workshop'
  | 'customer_personal' | 'customer_company'
  | 'employee_washer' | 'employee_mechanic';
```
- `type X = A | B | C` = a union of allowed string values (an **enum-like** type). The API
  returns one of these in the user's `role` field. TypeScript now guarantees we never
  compare against a role that doesn't exist (typos become errors).
- These match your Spatie roles exactly (see `docs/04-roles-and-permissions.md`).

### `AuthUser` — the logged-in user
```ts
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  image_url: string | null;
  is_active: boolean;
  role: Role;
  token?: string;   // only present on login / customer-register
}
```
- The shape of the user object your `UserResource` returns.
- `token?` is optional (`?`) because it's **only** attached on login and customer register
  (per your API docs), not on other responses.

## Why this file matters

Because everything imports these types, if the API shape changes you update it **here**
and TypeScript instantly shows you **every** place that needs fixing — no silent bugs.
It's the same benefit you get from strict types + DTOs in modern Laravel.

## When you'll touch this file

When a new API resource appears (e.g. `Order`, `Branch`), you'll add its `interface` here
(or in a feature-specific `types.ts`), so screens and API calls share one definition.
