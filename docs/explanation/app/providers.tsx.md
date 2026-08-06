# `src/app/providers.tsx` — global setup wrapper

**Real file:** [`../../../src/app/providers.tsx`](../../../src/app/providers.tsx)

## What it is

One component, `<AppProviders>`, that wraps the entire app and turns on every **global
feature**: translations, theme, right-to-left (RTL) for Arabic, the API cache, and the
logged-in user. Anything rendered inside it can use these features.

**Laravel analogy:** this is your set of **Service Providers** (`config/app.php` providers
array) — the boot code that makes global services available everywhere. In Laravel it's
invisible; in React you make it explicit by wrapping the app in these "Provider" components.

## The code, block by block

```tsx
export function AppProviders({ children }: { children: ReactNode }) {
```
- `children` is a **prop**. It means "whatever you put between `<AppProviders>` and
  `</AppProviders>`". In `main.tsx` that's the router. So this component decorates the
  router with all the global stuff.
- `ReactNode` is just the TypeScript type for "any renderable content".

```tsx
const [lang, setLang] = useState(i18n.language);
const dir = dirFor(lang);
```
- Remembers the current language in **state** (`ar` or `en`). `dir` is derived from it:
  `rtl` for Arabic, `ltr` for English. (`useState` explained in `01-react-for-laravel-devs.md`.)

```tsx
useEffect(() => {
  const handler = (lng: string) => {
    setLang(lng);
    localStorage.setItem(LANG_KEY, lng);
    document.documentElement.setAttribute('dir', dirFor(lng));
    document.documentElement.setAttribute('lang', lng);
  };
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
  i18n.on('languageChanged', handler);
  return () => void i18n.off('languageChanged', handler);
}, []);
```
- `useEffect(..., [])` runs **once** when the app starts (see the hook explanation in
  `01-react-for-laravel-devs.md`).
- It sets `<html dir="rtl" lang="ar">` so the whole page flips to right-to-left for Arabic.
- `i18n.on('languageChanged', handler)` — subscribes to language changes. When the user
  clicks the EN/ع button, this `handler` runs: it updates state, saves the choice in
  `localStorage` (browser storage that survives refresh, like a cookie), and re-flips the
  page direction.
- `return () => i18n.off(...)` — the **cleanup**: unsubscribe when the app unmounts, so we
  don't leak listeners.

```tsx
const theme = useMemo(() => buildTheme(dir), [dir]);
const cache = dir === 'rtl' ? rtlCache : ltrCache;
```
- `buildTheme(dir)` builds the MUI theme (colors, fonts, direction). See [`../theme/index.ts.md`](../theme/index.ts.md).
- `useMemo(..., [dir])` = "only rebuild the theme when `dir` changes" — a small performance
  optimization (caches the result).
- `cache` picks the RTL or LTR style engine so Arabic styles get mirrored correctly. See
  [`../theme/rtlCache.ts.md`](../theme/rtlCache.ts.md).

```tsx
return (
  <I18nextProvider i18n={i18n}>
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  </I18nextProvider>
);
```
Each `...Provider` turns on one global feature for everything inside it. Reading outermost → innermost:

| Provider | What it enables everywhere | Explained in |
|----------|----------------------------|--------------|
| `I18nextProvider` | translations (`t('...')`) | [`../i18n/index.ts.md`](../i18n/index.ts.md) |
| `CacheProvider` | RTL/LTR style engine | [`../theme/rtlCache.ts.md`](../theme/rtlCache.ts.md) |
| `ThemeProvider` | MUI colors, fonts, spacing | [`../theme/index.ts.md`](../theme/index.ts.md) |
| `CssBaseline` | MUI's CSS reset (not a provider, just a reset) | — |
| `QueryClientProvider` | server-data fetching & caching | [`../lib/queryClient.ts.md`](../lib/queryClient.ts.md) |
| `AuthProvider` | the logged-in user + `login`/`logout` | [`../auth/AuthContext.tsx.md`](../auth/AuthContext.tsx.md) |

Finally `{children}` is the app itself (the router). It sits at the bottom so it can use
**all** the features above it.

## Why the nesting order matters

A provider can only be used by things **inside** it. `AuthProvider` is innermost so the
whole app can call `useAuth()`. `I18nextProvider` is outermost so even the theme text can
be translated. You don't need to memorize the order — just know: "global feature = wrap
the app in its Provider here."

## 🆕 What M0 added — color mode state

M0 added dark/light theme switching here. Two pieces were inserted:
```tsx
// 1. Remember the mode (default dark), persist the choice.
const [mode, setMode] = useState<ColorMode>(
  () => (localStorage.getItem(MODE_KEY) as ColorMode | null) ?? 'dark',
);
// 2. Expose { mode, toggle } through ColorModeContext so the top-bar button can flip it.
const colorMode = useMemo(() => ({ mode, toggle: () => setMode(m => ...) }), [mode]);
```
and the theme is now built from **both** mode and direction: `buildTheme(mode, dir)`. The
tree gained one more wrapper, `<ColorModeContext.Provider>`, so any component can call
`useColorMode()`. See [`../theme/colorMode.ts.md`](../theme/colorMode.ts.md).

> `useState(() => ...)` with a function is a **lazy initializer** — the `localStorage` read
> runs only once on first render, not on every render. A small performance nicety.

## When you'll touch this file

Only when adding a **new global feature** (e.g. a notifications provider, a WebSocket
provider for live tracking). For normal screens, you never touch it.
