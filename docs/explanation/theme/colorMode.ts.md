# `src/theme/colorMode.ts` — the light/dark switch (Context)

**Real file:** [`../../../src/theme/colorMode.ts`](../../../src/theme/colorMode.ts)

> Added in **M0**. Lets any component read the current theme mode (dark/light) and flip it.
> Dark is the default (matches the design images).

## What it is

A tiny **Context** (see `../01-react-for-laravel-devs.md`, section 6) that carries two things
app-wide: the current `mode` (`'dark'` or `'light'`) and a `toggle()` function to switch it.
The actual state lives in `<AppProviders>`; this file just defines the "channel" + a hook to
read it.

This mirrors exactly how `AuthContext` works — same pattern, different data.

## The code

```ts
export type ColorMode = 'dark' | 'light';
export const MODE_KEY = 'ccp_mode';

export interface ColorModeState {
  mode: ColorMode;
  toggle: () => void;
}

export const ColorModeContext = createContext<ColorModeState | null>(null);

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode must be used inside <AppProviders>');
  return ctx;
}
```

- `ColorMode` — the union type: only `'dark'` or `'light'` are valid.
- `MODE_KEY = 'ccp_mode'` — the `localStorage` key where we remember the user's choice
  between visits (like the language does).
- `ColorModeState` — what the context provides: the `mode` + a `toggle` function.
- `createContext<ColorModeState | null>(null)` — creates the channel (starts empty until the
  provider fills it in `providers.tsx`).
- `useColorMode()` — the hook a component calls to read `{ mode, toggle }`. The guard throws a
  clear error if used outside the provider.

## Where the state actually lives

In [`../app/providers.tsx.md`](../app/providers.tsx.md): `AppProviders` holds
`const [mode, setMode] = useState(...)`, defaults to `'dark'`, saves to `localStorage` on
toggle, and feeds `mode` into `buildTheme(mode, dir)`.

## Where it's used

The top-bar sun/moon button in [`../layouts/DashboardLayout.tsx.md`](../layouts/DashboardLayout.tsx.md):
```tsx
const { mode, toggle } = useColorMode();
<IconButton onClick={toggle}>{mode === 'dark' ? <LightMode /> : <DarkMode />}</IconButton>
```

## Laravel analogy

Like a session-backed user preference exposed through a helper — `useColorMode()` is a global
accessor for "what theme are we in", the same way `app()->getLocale()` gives you the language.

## When you'll touch this file

Almost never — it's stable. You *use* `useColorMode()` in components; you don't edit this file
unless you add a third theme or more theme-related global state.
