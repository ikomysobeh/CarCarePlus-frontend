# `src/index.css` — global base styles

**Real file:** [`../../../src/index.css`](../../../src/index.css)

```css
:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100vh;
}

body {
  font-family: 'Cairo', 'Tajawal', Roboto, system-ui, sans-serif;
}
```

## What it is

Plain CSS applied to the **whole app**. It's imported once in `main.tsx`
(`import './index.css'`). These are just baseline resets so the app starts from a clean,
consistent state.

Most of our styling does **not** live here — MUI components are styled through the
**theme** (see [`../theme/index.ts.md`](../theme/index.ts.md)) and inline `sx={{ }}` props.
This file is only the global groundwork.

## Line by line

- `:root { color-scheme: light; }` — tells the browser we use a light UI (affects default
  scrollbar/input colors).
- `* { box-sizing: border-box; }` — the classic reset: an element's `width` includes its
  padding and border, so sizes are predictable. Every project does this.
- `html, body, #root { margin: 0; min-height: 100vh; }` — remove default page margin and
  make the app fill at least the full screen height (`100vh` = 100% of viewport height).
- `body { font-family: 'Cairo', 'Tajawal', ... }` — default fonts. **Cairo** and **Tajawal**
  are Arabic-friendly fonts (this app is Arabic-first). If the font isn't installed/loaded,
  it falls back to the next one in the list.

## Laravel analogy

Like a small `app.css` you `@vite` once in your layout — the site-wide reset before any
component styling. Nothing here is business logic.

## You rarely touch this file

Only for truly global tweaks. Per-screen styling goes on the components themselves.
