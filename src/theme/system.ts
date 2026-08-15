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
    // name top-right, `to top right`); RTL sidebar is on the right (`to top left`).
    // Two anchored glows instead of a linear band, so the colour STARTS exactly at the Logout
    // corner (green) and ENDS exactly at the user-name corner (blue), with a dark gap between.
    // LTR: sidebar left → green at bottom-left, blue at top-right.
    // RTL: sidebar right → mirror (green at bottom-right, blue at top-left).
    // Brand-palette glows: emerald-green (#10B981) "plus" at the Logout corner, brand-blue
    // (#2563EB) "carcare" at the user-name corner, over the navy-slate base.
    'html[dir="rtl"]': {
      '--app-bg-grad':
        'radial-gradient(60% 65% at 100% 100%, rgba(16,185,129,0.14), transparent 72%), radial-gradient(60% 65% at 0% 0%, rgba(37,99,235,0.13), transparent 72%)',
      '--brand-bg-grad': 'linear-gradient(to top left, #059669 0%, #1E3A8A 60%, #0F172A 100%)',
    },
    'html[dir="ltr"]': {
      '--app-bg-grad':
        'radial-gradient(60% 65% at 0% 100%, rgba(16,185,129,0.14), transparent 72%), radial-gradient(60% 65% at 100% 0%, rgba(37,99,235,0.13), transparent 72%)',
      '--brand-bg-grad': 'linear-gradient(to top right, #059669 0%, #1E3A8A 60%, #0F172A 100%)',
    },
    'html.dark[dir="rtl"]': {
      '--app-bg-grad':
        'radial-gradient(60% 65% at 100% 100%, rgba(16,185,129,0.26), transparent 72%), radial-gradient(60% 65% at 0% 0%, rgba(37,99,235,0.24), transparent 72%)',
    },
    'html.dark[dir="ltr"]': {
      '--app-bg-grad':
        'radial-gradient(60% 65% at 0% 100%, rgba(16,185,129,0.26), transparent 72%), radial-gradient(60% 65% at 100% 0%, rgba(37,99,235,0.24), transparent 72%)',
    },

    body: {
      bg: 'appBg',
      backgroundImage: 'var(--app-bg-grad)',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
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
        card: { value: '14px' },
        badge: { value: '10px' },
      },
      colors: {
        // Brand blue scale — logo blue. 500 = active/primary (#1D4ED8), 400 = hover (#2563EB).
        brand: {
          50: { value: '#eff6ff' },
          100: { value: '#dbeafe' },
          200: { value: '#bfdbfe' },
          300: { value: '#93c5fd' },
          400: { value: '#2563EB' },
          500: { value: '#1D4ED8' },
          600: { value: '#1E40AF' },
          700: { value: '#1E3A8A' },
          800: { value: '#172554' },
          900: { value: '#0f1e42' },
          950: { value: '#0a142e' },
        },
        // Secondary cyan accent from the logo transition / water drop.
        accent: { 500: { value: '#06B6D4' } },
      },
    },
    semanticTokens: {
      colors: {
        // Surfaces + text, per light/dark (base = light, _dark = dark).
        // Dark values follow the brand palette (Slate family): a deep navy-slate app bg with
        // one-step-lighter panels/cards, so the whole UI speaks the logo's blue/green language.
        appBg: { value: { base: '#F4F6FB', _dark: '#0F172A' } },
        surface: { value: { base: '#FFFFFF', _dark: '#1E293B' } },
        surfaceAlt: { value: { base: '#EEF1F7', _dark: '#172033' } },
        fg: { value: { base: '#1A2233', _dark: '#F8FAFC' } },
        fgMuted: { value: { base: '#5B6472', _dark: '#94A3B8' } },
        line: { value: { base: 'rgba(0,0,0,0.10)', _dark: '#2B3A52' } },
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
