# `src/main.tsx` — the entry point (first code that runs)

**Real file:** [`../../../src/main.tsx`](../../../src/main.tsx)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './app/providers';
import { router } from './app/router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
```

## What it is

This is the **starting point** of the whole app — the equivalent of `public/index.php`
in Laravel (the file that boots everything). The browser loads this first (because
`index.html` points to it).

## Line by line

### The `import` lines
```tsx
import { StrictMode } from 'react';
```
`import` = like `use App\...` in PHP: it pulls in code from another file/package.
Here we import the pieces we need: React's `StrictMode`, the `createRoot` function,
the router, our providers, and the global CSS.

- `import './index.css';` — importing a CSS file just means "apply these styles globally".

### The `createRoot(...).render(...)` call
```tsx
createRoot(document.getElementById('root')!).render( ... );
```
- `document.getElementById('root')` — find that empty `<div id="root">` from `index.html`.
- `!` — a TypeScript signal meaning "trust me, this element definitely exists" (not null).
- `.render( ... )` — draw our React app **inside** that div.

This is the moment React "takes over" the empty page and fills it with our UI.

### What gets rendered (the nesting)
```tsx
<StrictMode>
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
</StrictMode>
```
Read it as layers wrapping each other, outermost first:

1. **`<StrictMode>`** — a development-only helper. It runs some code twice on purpose to
   catch bugs early. It has **no effect in production**. Ignore it.
2. **`<AppProviders>`** — our wrapper that sets up everything global: theme, language,
   the API cache, and the auth/login state. See [`../app/providers.tsx.md`](../app/providers.tsx.md).
   Anything inside it can use those features.
3. **`<RouterProvider router={router} />`** — the router. It looks at the current URL and
   shows the matching page. See [`../app/router.tsx.md`](../app/router.tsx.md).

## Laravel analogy

`main.tsx` is `public/index.php`: it boots the framework (providers), then hands control
to the router, which decides which "page" (component) to show — just like Laravel's
`index.php` boots the app and hands off to the router.

## You rarely touch this file

It's set-and-forget. You only edit it if you add another **global provider** that must
wrap the entire app.
