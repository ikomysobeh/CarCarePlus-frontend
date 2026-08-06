# `src/theme/rtlCache.ts` — making Arabic RTL styling work

**Real file:** [`../../../src/theme/rtlCache.ts`](../../../src/theme/rtlCache.ts)

## What it is

A small technical helper that makes MUI's styles flip correctly for **right-to-left**
(Arabic). You mostly don't need to understand the internals — just know **why** it exists.

## The code

```ts
export const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

export const ltrCache = createCache({
  key: 'mui',
  stylisPlugins: [prefixer],
});
```

## What's going on (plain explanation)

- MUI generates its CSS at runtime using a library called **Emotion**. A "cache" here is
  just Emotion's engine for producing that CSS.
- For Arabic, CSS properties like `margin-left` should become `margin-right`, and layouts
  should mirror. The `rtlPlugin` (`stylis-plugin-rtl`) does exactly that mirroring
  **automatically**, so you write normal CSS and it flips for RTL.
- `prefixer` adds vendor prefixes for older browsers. Standard housekeeping.
- So there are **two** caches:
  - `rtlCache` — used when the language is Arabic (mirrors everything).
  - `ltrCache` — used when the language is English (no mirroring).

`providers.tsx` picks the right one based on the current direction:
```tsx
const cache = dir === 'rtl' ? rtlCache : ltrCache;
```
and passes it to `<CacheProvider>`. See [`../app/providers.tsx.md`](../app/providers.tsx.md).

## Why this matters for us

Arabic is the primary language. Without this, an Arabic UI would look "backwards" —
paddings, icons, and alignment on the wrong side. This file is what makes the app feel
native in Arabic. It was set up once as part of the foundation.

## When you'll touch this file

**Basically never.** It's foundation plumbing. Leave it as is; just benefit from it by
writing normal CSS and letting it mirror for Arabic.
