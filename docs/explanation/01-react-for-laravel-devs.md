# 01 — React for Laravel Developers 🧠

> Read this once, slowly. It is the single most useful page here. Everything else
> will make sense after this.

In Laravel you think in **requests → controllers → Blade views → HTML sent to browser**.
The server builds the page, sends it, and forgets about it. Every click = new request = new page.

React is different: the browser downloads the app **once**, then the app **runs in the
browser** and re-draws parts of the page instantly when data changes — usually **without**
reloading. The server (your Laravel API) is now just a **JSON provider**. No more Blade.

Here is the full translation table.

---

## 1. The mental shift: Blade vs Components

**Laravel Blade** — you write HTML with `@if`, `@foreach`, `{{ $var }}`:

```blade
@if($user)
  <p>Hello {{ $user->name }}</p>
@endif
```

**React** — you write **components**: JavaScript functions that *return* HTML-like markup.
That markup is called **JSX**. It's HTML written inside JavaScript.

```tsx
function Greeting({ user }) {
  if (!user) return null;
  return <p>Hello {user.name}</p>;   // {user.name} = like {{ $user->name }}
}
```

Key points:
- A **component** = a reusable piece of UI. Like a **Blade component** (`<x-greeting />`), but it also holds logic and data.
- `{ ... }` inside JSX = "run this JavaScript and print the result" = exactly like `{{ }}` in Blade.
- A component **returns** its markup with `return ( ... )`. It runs top-to-bottom like a normal function every time it needs to redraw.

---

## 2. Props = function arguments (like passing data to a Blade partial)

In Blade: `@include('greeting', ['user' => $user])`.
In React: `<Greeting user={user} />`.

The `{ user }` inside `function Greeting({ user })` is just destructuring the arguments.
**Props are read-only** — a child cannot change the parent's data directly (it can only call a function the parent gave it).

---

## 3. State = data that changes over time (`useState`)

Blade has no concept of this — the page is static once sent. React does, because the app keeps running.

```tsx
const [count, setCount] = useState(0);
//     ▲ current value   ▲ function to change it   ▲ initial value
```

- `count` is the current value (starts at `0`).
- `setCount(5)` changes it — and React **automatically redraws** the component to show the new value.
- **You never edit `count` directly.** You always call `setCount(...)`. (Think of it like `$model->update()` — you go through the method, not the raw property.)

> **The core idea of React:** the screen is always a picture of your current state.
> Change the state → React repaints the affected part. You describe *what it should look like*,
> not *how to change the DOM step by step*.

---

## 4. Hooks = special functions that start with `use`

`useState`, `useEffect`, `useForm`, `useTranslation`, `useAuth`, `useQuery`...
These are called **hooks**. They let a component "hook into" React features (state, lifecycle, context...).

**Two rules** (React enforces them):
1. Only call hooks at the **top level** of a component — never inside `if`, loops, or nested functions.
2. Only call them inside React components or other hooks.

The most important ones for us:

| Hook | What it does | Laravel-ish analogy |
|------|--------------|---------------------|
| `useState` | local data that changes | a variable that "remembers" between redraws |
| `useEffect` | run a side-effect (fetch, subscribe) after render | like a boot/`mounted` callback |
| `useContext` | read shared global data | like a singleton from the service container |
| `useQuery` (React Query) | fetch + cache server data | like calling a repository, but cached |
| `useForm` (react-hook-form) | manage a form + validation | Laravel FormRequest, but in the browser |
| `useTranslation` (i18next) | get translated text | Laravel's `__('messages.hello')` |

---

## 5. `useEffect` = "do something after the screen is drawn"

```tsx
useEffect(() => {
  // runs AFTER render — good for: fetching data, timers, subscriptions
  console.log('component appeared');

  return () => {
    // cleanup — runs when the component disappears (unmounts)
  };
}, []);   // ← the dependency array
```

The `[]` at the end controls **when** it re-runs:
- `[]` (empty) → run **once**, when the component first appears. (Like a constructor / boot.)
- `[count]` → run again every time `count` changes.
- no array → run after **every** render (rarely what you want).

---

## 6. Context = the service container (global shared data)

In Laravel, `auth()->user()` works anywhere because the container holds it globally.
React has no global by default — data flows down through props. That gets annoying for
things everyone needs (the logged-in user, the language).

**Context** solves this: a `Provider` at the top holds the data, and any component below
can grab it with a hook. We use this for auth:

```tsx
const { user, login, logout } = useAuth();   // available anywhere under <AuthProvider>
```

`useAuth()` is our version of `auth()` in Laravel. See `auth/AuthContext.tsx.md`.

---

## 7. Routing happens in the browser, not `routes/web.php`

Laravel: `routes/web.php` maps a URL to a controller, server returns a full page.
React: **React Router** maps a URL to a **component**, and swaps it in **without reloading**.

Our route table lives in `src/app/router.tsx` (explained in `app/router.tsx.md`).
It's the closest thing to your `routes/web.php`.

---

## 8. Where does the data come from? Your Laravel API.

React holds **no database**. Every list, every record comes from an HTTP call to your
Laravel API, returning JSON. We centralize those calls in `src/api/` and cache them with
**React Query**. So the flow is:

```
Component  →  React Query hook  →  api/client.ts (axios)  →  YOUR Laravel API  →  JSON back
```

---

## 9. TypeScript = PHP type hints, but stricter

Files end in `.ts` (logic) or `.tsx` (logic + JSX). The `: string`, `: number`,
`interface`, `type` you'll see are **types** — same idea as PHP type hints and
`declare(strict_types=1)`, but checked *before* the code runs. They prevent bugs like
passing a string where a number is expected. You already do this in modern PHP.

```ts
interface AuthUser { id: number; name: string; email: string; }   // like a DTO / typed array
```

---

## 10. The tools we use (and their Laravel cousins)

| Tool | Role | Laravel cousin |
|------|------|----------------|
| **Vite** | dev server + bundler (`npm run dev`) | `php artisan serve` + Mix/Vite |
| **React** | the UI library | Blade (but client-side) |
| **React Router** | URL → component | `routes/web.php` |
| **MUI** (Material UI) | ready-made styled components | a Blade UI kit / Bootstrap |
| **React Query** | fetch + cache server data | Eloquent repository + cache |
| **axios** | the HTTP client | Laravel's `Http::` facade |
| **react-hook-form + zod** | forms + validation | FormRequest + validation rules |
| **i18next** | translations (ar/en) | `lang/` files + `__()` |
| **Emotion / stylis-rtl** | CSS-in-JS + Arabic RTL flip | — |

---

## 11. How to run it

From inside `CarCarePlus-frontend/`:

```bash
npm install      # once — downloads dependencies into node_modules (like composer install)
npm run dev      # starts the dev server, usually http://localhost:5173
```

Open the URL in the browser. Change a file, save, and the page updates instantly
(**hot reload**). To point at your API, edit `.env` → `VITE_API_BASE_URL`.

---

## You're ready

Now open the files in `src/` next to their `.md` here. Start with `root/main.tsx.md` —
that's the very first line of code the browser runs.
