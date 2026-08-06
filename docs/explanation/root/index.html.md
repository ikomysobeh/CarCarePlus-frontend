# `index.html` — the single HTML page

**Real file:** [`../../../index.html`](../../../index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>carcareplus-frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## What it is

This is the **only** HTML file in the whole project. Compare that to Laravel where you
have many Blade files — here there is just one page, and React fills it in with JavaScript.

This is what "Single Page Application (SPA)" means: **one** HTML page, and JavaScript
redraws the content as the user navigates.

## Line by line

- `<div id="root"></div>` — an **empty box**. This is where React injects the entire app.
  Everything you see on screen is placed inside this one div by React.
- `<script type="module" src="/src/main.tsx"></script>` — loads our JavaScript entry file
  (`src/main.tsx`). This is the spark that starts everything. See [`main.tsx.md`](main.tsx.md).

## Laravel analogy

Think of this as a **layout Blade file** (`layouts/app.blade.php`) that contains only
`@yield('content')` — except the "content" is never rendered by the server; React fills
`#root` in the browser after the page loads.

## You rarely touch this file

You only edit it to change the `<title>`, favicon, or add a font/meta tag. Everything
else happens in `src/`.
