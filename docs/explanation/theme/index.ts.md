# `src/theme/index.ts` — the MUI theme (colors, fonts, dark/light)

**Real file:** [`../../../src/theme/index.ts`](../../../src/theme/index.ts)

> Upgraded in **M0** to match the design images: dark navy default + light option, royal-blue
> primary, orange warning, green success, rounded pill buttons.

## What it is

The **design settings** for the whole app. MUI reads this theme and styles every component,
so you get one consistent look without repeating CSS. It's built per **(mode, direction)** —
dark or light, and RTL (Arabic) or LTR (English) — and swapped at runtime.

**Laravel analogy:** a central UI config (like a `_variables.scss` / Tailwind config) — set
brand colors once, everything uses them.

## The code

```ts
const BRAND_BLUE = '#2F6BFF'; // header bar, primary buttons, active step
const WARNING = '#E8730C';    // "متوسطة" severity, alerts
const SUCCESS = '#2FBF71';    // success checks, completed steps
const DANGER  = '#E5484D';    // destructive actions, map pin

export function buildTheme(mode: ColorMode, direction: 'rtl' | 'ltr') {
  const isDark = mode === 'dark';
  return createTheme({
    direction,
    palette: {
      mode,
      primary:   { main: BRAND_BLUE },
      secondary: { main: '#00B8D4' },
      warning:   { main: WARNING },
      success:   { main: SUCCESS },
      error:     { main: DANGER },
      background: isDark
        ? { default: '#0B1220', paper: '#121A2B' }   // navy page / near-black cards
        : { default: '#F4F6FB', paper: '#FFFFFF' },
      text: isDark
        ? { primary: '#FFFFFF', secondary: '#8A93A6' }
        : { primary: '#1A2233', secondary: '#5B6472' },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    typography: {
      fontFamily: ['Cairo', 'Tajawal', 'Roboto', 'system-ui', 'sans-serif'].join(','),
      button: { fontWeight: 700 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: { root: { borderRadius: 999, textTransform: 'none', paddingInline: 20 } },
        defaultProps: { disableElevation: true },
      },
      MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
      MuiTextField: { defaultProps: { size: 'small' } },
    },
  });
}
```

## Block by block

### The color constants (top)
The 4 brand colors pulled straight from the images, named and commented so their **purpose**
is obvious. Defined once, reused in the palette.

### `buildTheme(mode, direction)`
- Takes **two** inputs now: `mode` (`'dark' | 'light'`) and `direction` (`'rtl' | 'ltr'`).
  Previously it only took direction — M0 added `mode`.
- `const isDark = mode === 'dark'` — a flag used to pick dark vs light values below.

### `palette`
- `mode` — tells MUI whether the base UI is light or dark (affects default component shades).
- `primary` … `error` — the brand colors. Components reference these by name
  (`<Button color="primary">`, `color="warning"`, etc.), so you rarely hard-code a hex.
- `background` — the two most visible colors:
  - dark: page `#0B1220` (navy), cards `#121A2B` (near-black).
  - light: page `#F4F6FB`, cards white.
- `text.primary` / `text.secondary` — heading/body vs muted labels, per mode.
- `divider` — subtle line color (semi-transparent white in dark, black in light).

### `typography` / `shape`
- Arabic-friendly fonts (Cairo/Tajawal), bold buttons, and a default `borderRadius: 12`.

### `components` (global component overrides)
This is where we make MUI look like the images **everywhere at once**:
- `MuiButton` → `borderRadius: 999` = **pill** buttons; `textTransform: 'none'` = no ALL-CAPS;
  `disableElevation` = flat (no drop shadow), matching the images.
- `MuiPaper` → cards get a `16px` radius (rounded panels).
- `MuiTextField` → default to the compact `small` size.

> These overrides mean you **don't** style each button/card individually — set it here once.

## How it's wired

`providers.tsx` calls `buildTheme(mode, dir)` (both from state) and passes the result to
`<ThemeProvider>`. When you toggle the mode or switch language, `providers.tsx` rebuilds the
theme and the whole app restyles instantly. See [`../app/providers.tsx.md`](../app/providers.tsx.md)
and [`colorMode.ts.md`](colorMode.ts.md).

## When you'll touch this file

When the client gives final brand colors/fonts, or to fine-tune component looks globally.
It's small and central — change here, see it everywhere.
