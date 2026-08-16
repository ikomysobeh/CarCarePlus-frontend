import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  type SystemStyleObject,
} from '@chakra-ui/react';

// Chakra UI theme "system" for CarCarePlus. Tokens match the client's dark fintech
// reference (see docs/CHAKRA-MIGRATION-PLAN.md §0): near-black navy bg, rounded dark
// cards, bright-blue primary, cyan accent.
//
// Dark/light is driven by a `.dark` class on <html> (Chakra's default `_dark` condition
// is `.dark &`). Our ColorModeContext toggles that class — see app/providers.tsx.
//
// MUI is fully removed (MP7), so Chakra's CSS reset (preflight) is on and we set the
// page background/text globally.
const config = defineConfig({
  preflight: true,
  cssVarsPrefix: 'ccp',
  globalCss: {
    // Smaller, denser base (matches the reference dashboard). Everything sized in rem/Chakra
    // units shrinks proportionally from this one lever.
    'html, body, #root': { height: '100%', fontSize: '14px' },

    // --- Brand background gradients (logo navy → green) ---
    // The gradient ORIGIN follows the reading direction: it starts from the bottom-right in
    // Arabic (RTL) and mirrors to the bottom-left in English (LTR). `dir` is set on <html> by
    // app/providers.tsx, and `.dark` toggles the palette — so we define one CSS var per
    // (direction × mode) and reference it everywhere. Changing language flips it automatically.
    // The sweep runs corner-to-corner: it STARTS at the Logout button (bottom of the sidebar)
    // and travels to the user's name (opposite top corner). The sidebar mirrors with the
    // language, so the direction flips too: LTR sidebar is on the left (logout bottom-left →
    // A single SMOOTH, fully-opaque diagonal gradient across the whole viewport — no radial
    // "glow" edges and no transparent stops, so there are zero visible rings/seams. It's
    // painted on one fixed layer that covers the screen (see DashboardLayout), and its
    // direction flips with the language. The colour stays a very subtle brand tint.
    // Light mode → clean white; dark mode → the vivid login-style blue gradient. Direction
    // flips with the language. `--brand-bg-grad` (login page) stays the blue gradient always.
    'html[dir="rtl"]': {
      '--app-bg-grad': 'linear-gradient(225deg, #FFFFFF 0%, #F5F7FA 100%)',
      '--brand-bg-grad': 'linear-gradient(to top left, #0066FF 0%, #14306b 60%, #080D1A 100%)',
    },
    'html[dir="ltr"]': {
      '--app-bg-grad': 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
      '--brand-bg-grad': 'linear-gradient(to top right, #0066FF 0%, #14306b 60%, #080D1A 100%)',
    },
    // Dark dashboard = a TAMED version of the login gradient: same blue family, same corner-
    // to-corner direction, but the vivid `#0066FF` peak is removed. Reason: the gradient's
    // bright end lands exactly under the bottom of the sidebar, where `fgMuted` text and the
    // Logout button lost all contrast. Peak brightness now tops out at `#14306b` and sits at
    // ~40% along the axis (i.e. out in the content area, not under the 260px sidebar), so
    // every nav row keeps a dark backdrop while the screen still reads as the login blue.
    'html.dark[dir="rtl"]': {
      '--app-bg-grad':
        'linear-gradient(to top left, #0B1A3A 0%, #14306b 40%, #0D1A32 72%, #080D1A 100%)',
    },
    'html.dark[dir="ltr"]': {
      '--app-bg-grad':
        'linear-gradient(to top right, #0B1A3A 0%, #14306b 40%, #0D1A32 72%, #080D1A 100%)',
    },

    // --- Logo ink (see components/Logo.tsx) ---
    // The emblem is two-tone: `base` = the car + gear, `accent` = the arc + sparkles. Defined
    // as plain CSS vars (same idiom as --app-bg-grad above) because they are consumed by
    // `fill` on raw <path> elements, which sit outside Chakra's style-prop pipeline.
    // In dark mode the base flips to white — the emblem then reads directly on the gradient
    // with NO white disc behind it, which is the whole reason we moved off the PNG.
    // The `-on-light` pair never flips: the login card is white glass in BOTH modes, so a
    // logo that followed the colour mode there would turn white-on-white and disappear.
    ':root': {
      '--logo-base': '#0F1D33',
      '--logo-accent': '#0066FF',
      '--logo-base-on-light': '#0F1D33',
      '--logo-accent-on-light': '#0066FF',
      '--logo-base-on-dark': '#FFFFFF',
      '--logo-accent-on-dark': '#3385FF',

      // --- Frosted glass (login card) ---
      // Three layers make a translucent panel read as GLASS rather than as a flat see-through
      // box, and all three are needed:
      //   1. `--glass-bg`      a dark tint, kept low-alpha so the gradient still shows through
      //   2. `--glass-border`  a hairline lighter than the fill = the lit edge of a pane
      //   3. `--glass-noise`   fine grain, which is what actually sells "frosted" — a pure
      //                        blur looks like plastic; real frosted glass scatters light.
      // The noise is an inline SVG feTurbulence, so there is no image file and no request.
      // `#` must be written `%23` inside a CSS url(), hence `url(%23n)` below.
      '--glass-bg': 'rgba(10,20,44,0.42)',
      '--glass-border': 'rgba(255,255,255,0.16)',
      '--glass-highlight': 'rgba(255,255,255,0.20)',
      '--glass-noise':
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
    },
    'html.dark': {
      '--logo-base': '#FFFFFF',
      // One step lighter than brand.500 so the arc keeps its punch against a dark backdrop.
      '--logo-accent': '#3385FF',
    },

    body: {
      bg: 'appBg',
      color: 'fg',
      fontFamily: 'body',
    },
    // Smoothly fade colours when the .dark class flips (light <-> dark toggle) instead of
    // snapping. Only colour properties transition, so layout/hover motion is unaffected.
    // Components that set their own `transition` (e.g. nav hover) override this for themselves.
    '*, *::before, *::after': {
      transitionProperty: 'background-color, border-color, color, fill',
      transitionDuration: '0.4s',
      transitionTimingFunction: 'ease',
    },
    // Kill the browser's white/yellow autofill background on inputs. The box-shadow trick
    // repaints the field with our own `surface` colour and keeps the text readable.
    'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, textarea:-webkit-autofill, select:-webkit-autofill':
      {
        // Vendor-prefixed props aren't in Chakra's typed style object, so cast this one rule.
        WebkitTextFillColor: 'var(--ccp-colors-fg)',
        WebkitBoxShadow: '0 0 0px 1000px var(--ccp-colors-surface) inset',
        caretColor: 'var(--ccp-colors-fg)',
        borderColor: 'var(--ccp-colors-line)',
      } as unknown as SystemStyleObject,
  },
  theme: {
    // Recipe tweaks merge into Chakra's defaults (they don't replace them). Buttons become
    // pill-shaped with a touch more weight, so every button across the app is consistent.
    recipes: {
      button: defineRecipe({
        base: { borderRadius: 'full', fontWeight: '600' },
      }),
    },
    tokens: {
      fonts: {
        heading: { value: "'Cairo','Tajawal','Roboto',system-ui,sans-serif" },
        body: { value: "'Cairo','Tajawal','Roboto',system-ui,sans-serif" },
      },
      radii: {
        card: { value: '16px' },
        badge: { value: '12px' },
      },
      colors: {
        // Brand blue scale — logo blue. 500 = active/primary (#1D4ED8), 400 = hover (#2563EB).
        brand: {
          50: { value: '#eff6ff' },
          100: { value: '#dbeafe' },
          200: { value: '#bfdbfe' },
          300: { value: '#93c5fd' },
          400: { value: '#3385FF' },
          500: { value: '#0066FF' },
          600: { value: '#0052CC' },
          700: { value: '#1E3A8A' },
          800: { value: '#172554' },
          900: { value: '#0f1e42' },
          950: { value: '#0a142e' },
        },
        // Secondary accent — a lighter blue (the logo is blue-only, no green/cyan).
        accent: { 500: { value: '#3385FF' } },
      },
    },
    semanticTokens: {
      colors: {
        // Surfaces + text, per light/dark (base = light, _dark = dark).
        // Dark values follow the brand palette (Slate family): a deep navy-slate app bg with
        // one-step-lighter panels/cards, so the whole UI speaks the logo's blue/green language.
        appBg: { value: { base: '#F5F7FA', _dark: '#080D1A' } },
        surface: { value: { base: '#FFFFFF', _dark: '#141F33' } },
        surfaceAlt: { value: { base: '#EEF1F7', _dark: '#1A263B' } },
        fg: { value: { base: '#1E293B', _dark: '#FFFFFF' } },
        fgMuted: { value: { base: '#5B6472', _dark: '#94A3B8' } },
        line: { value: { base: 'rgba(0,0,0,0.10)', _dark: '#223049' } },
        // Sidebar/nav states. These are deliberately TRANSLUCENT (not `surface`/`surfaceAlt`)
        // because the sidebar is transparent and sits on the app gradient: an opaque hover
        // colour would punch a flat rectangle through the gradient, while an alpha tint just
        // lightens whatever is behind it and therefore looks correct at every point of the
        // sweep — and in both light and dark mode.
        navActiveBg: { value: { base: 'rgba(0,102,255,0.10)', _dark: 'rgba(51,133,255,0.18)' } },
        navHoverBg: { value: { base: 'rgba(0,0,0,0.05)', _dark: 'rgba(255,255,255,0.07)' } },
        primary: { value: { base: '#2D6BFF', _dark: '#2D6BFF' } },
        // Make Chakra's default "brand" colorPalette point at our scale.
        'brand.solid': { value: { base: '{colors.brand.500}', _dark: '{colors.brand.500}' } },
        'brand.contrast': { value: '#FFFFFF' },
        'brand.fg': { value: { base: '{colors.brand.600}', _dark: '{colors.brand.300}' } },
        'brand.muted': { value: { base: '{colors.brand.100}', _dark: '{colors.brand.900}' } },
        'brand.subtle': { value: { base: '{colors.brand.50}', _dark: '{colors.brand.950}' } },
        'brand.emphasized': { value: { base: '{colors.brand.200}', _dark: '{colors.brand.800}' } },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
