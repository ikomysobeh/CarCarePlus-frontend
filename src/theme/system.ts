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
    'html, body, #root': { height: '100%' },
    body: { bg: 'appBg', color: 'fg', fontFamily: 'body' },
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
        card: { value: '20px' },
        badge: { value: '12px' },
      },
      colors: {
        // Brand blue scale (500/600 = the reference blue) so `colorPalette="brand"` works.
        brand: {
          50: { value: '#e8f0ff' },
          100: { value: '#c9dbff' },
          200: { value: '#9bbcff' },
          300: { value: '#6d9dff' },
          400: { value: '#3f7eff' },
          500: { value: '#2D6BFF' },
          600: { value: '#2554d6' },
          700: { value: '#1d3fa3' },
          800: { value: '#152b70' },
          900: { value: '#0d183d' },
          950: { value: '#080f26' },
        },
        accent: { 500: { value: '#38BDF8' } },
      },
    },
    semanticTokens: {
      colors: {
        // Surfaces + text, per light/dark (base = light, _dark = dark).
        appBg: { value: { base: '#F4F6FB', _dark: '#0A0E17' } },
        surface: { value: { base: '#FFFFFF', _dark: '#121722' } },
        surfaceAlt: { value: { base: '#EEF1F7', _dark: '#0F131C' } },
        fg: { value: { base: '#1A2233', _dark: '#FFFFFF' } },
        fgMuted: { value: { base: '#5B6472', _dark: '#8A93A6' } },
        line: { value: { base: 'rgba(0,0,0,0.10)', _dark: 'rgba(255,255,255,0.06)' } },
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
