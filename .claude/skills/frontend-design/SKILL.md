---
name: frontend-design
description: >
  Design system, Chakra UI v3 patterns, and a visual-polish checklist for the CarCarePlus
  React dashboard. Use whenever building, styling, or reviewing any frontend/UI/layout —
  pages, components, cards, forms, sidebar, dashboard, spacing, colors, dark/light theme,
  or when the user wants a screen to "look good / look pro". Also covers the teaching-doc
  convention required for every source file.
---

# CarCarePlus Frontend Design

The user is a **Laravel developer, new to React**. Explain choices in plain terms, use
Laravel analogies when teaching, and never assume frontend intuition. Stack: **React 19 +
Vite + TypeScript + Chakra UI v3 + Emotion**. Icons: `react-icons/md`. Data: React Query +
axios. Forms: react-hook-form + zod. i18n + RTL (Arabic/English). Dark is default; light via
`.dark` class on `<html>`.

## The one rule above all others

**Never hardcode a color, spacing, radius, or font.** Always use a token. This is the
difference between "amateur" and "pro" more than anything else. Tokens live in
`src/theme/system.ts`. If a value you need isn't a token, add it to `system.ts` first, then
use it — do not inline a raw `#hex` or `13px`.

## Design tokens (the source of truth)

Reference target: a dark fintech dashboard. Colors are defined as **semantic tokens** in
`src/theme/system.ts` so they auto-swap between light/dark. Always use the semantic name, not
the hex.

| Token | Light | Dark | Use for |
|---|---|---|---|
| `appBg` | `#F4F6FB` | `#0A0E17` | page background |
| `surface` | `#FFFFFF` | `#121722` | cards, panels, inputs |
| `surfaceAlt` | `#EEF1F7` | `#0F131C` | sidebar, subtle raised areas |
| `fg` | `#1A2233` | `#FFFFFF` | primary text |
| `fgMuted` | `#5B6472` | `#8A93A6` | labels, secondary text, icons |
| `line` | `rgba(0,0,0,.10)` | `rgba(255,255,255,.06)` | all borders/dividers |
| `brand.500` | `#2D6BFF` | `#2D6BFF` | primary actions, active state |
| `accent.500` | `#38BDF8` | `#38BDF8` | cyan accent, chart highlights |

Semantic colors: `green` = success, `red` = danger, `orange` = warning/"Soon". Use Chakra
`colorPalette="green|red|orange|brand"` on Badge/Button, not raw hex.

**Radii:** `rounded="card"` (20px) for cards/panels, `rounded="badge"` (12px) for chips/icon
tiles, `rounded="full"` for pills (search, buttons, avatars, badges).

**Spacing scale (Chakra units, 1 = 4px):** only use `1, 2, 3, 4, 5, 6, 8, 10, 12`. A screen
body uses `p={6}`. Cards use `p={5}`. Gaps between related items `gap={3}`, between sections
`gap={6}`. Never use odd values like `p={7}` or raw px.

**Type scale:** page title `Heading size="lg" fontWeight="800"`; card KPI value `fontSize="3xl"
fontWeight="800"`; body `fontSize="sm"`; labels `fontSize="xs"` uppercase for section headers.
Font is Cairo/Tajawal (Arabic-friendly), already loaded.

## The 4 rules that make it look good

1. **Spacing consistency** — every value comes from the scale above. Generous whitespace
   reads as premium. When unsure, add more space, not less.
2. **Hierarchy** — one focal point per screen. Big+bold `fg` for what matters; `fgMuted` for
   everything supporting. A screen where everything is the same weight looks flat.
3. **Alignment** — left edges align; cards in a row are equal height (use `Grid`/`SimpleGrid`,
   not manual widths); actions align to one edge.
4. **Restraint** — `brand.500` is the *only* strong color, reserved for the primary action /
   active nav item. Everything else is `surface` + `fg` + `fgMuted` + `line`. More colors =
   more amateur.

## Reusable components — use these, don't re-roll

Barrel export at `src/components/index.ts`. Prefer composing these over new JSX:

- `PageHeader` — every screen's title row. `title`, `subtitle?`, `action?` (e.g. Add button).
- `StatCard` — KPI tile: `label, value, icon, accent, delta?, deltaUp?, loading?`. Gradient
  icon badge, hover lift.
- `StatusChip` / `Badge colorPalette=… variant="subtle" rounded="full"` — status pills.
- `DataTable` — client-side paged table (plain Chakra Table).
- `FormDialog` + `form/{FormTextField,FormSelect,FormSwitch,ImageUploadField}` — all
  create/edit dialogs. Fields use the `FormProvider` + `useFormContext` pattern. Dropdowns are
  Chakra `NativeSelect` (a real `<select>`, so it's testable and RTL-safe).
- `states/{Loader,EmptyState,ErrorState}` — every data screen must handle loading / empty /
  error, not just the happy path. This is a common polish gap.

**If you copy-paste JSX twice, extract a component** (the DRY instinct from Laravel services).

## Chakra v3 gotchas (this version specifically)

- Style props go directly on components (`fontWeight`, `align`, `gap`) — no `sx` prop like MUI.
- Gradients: `bgGradient="to-br" gradientFrom="blue.400" gradientTo="blue.600"` (v3 syntax).
- Color mode: driven by `.dark` class + `ColorModeContext` (`useColorMode`), **not**
  next-themes. Semantic tokens (`base`/`_dark`) do the swapping automatically — don't branch
  on mode in components for colors; just use the semantic token.
- After any dependency change: delete `node_modules/.vite` and restart dev server, or Vite
  throws "Failed to resolve import".
- RTL: use logical props (`borderInlineEndWidth`, `ps`/`pe`, `ms`/`me`) instead of
  left/right, so Arabic mirrors correctly.

## Design-review checklist (run before calling any screen "done")

Go through this list on every UI change. Fix anything that fails.

- [ ] **Tokens only** — no raw hex, no raw px. Every color/space/radius is a token.
- [ ] **Token actually exists** — if you reference `bg="foo"`, confirm `foo` is defined in
      `system.ts`. An undefined token silently renders transparent (this is a real bug we hit:
      `bg="sidebar"` with no `sidebar` token).
- [ ] **Spacing on-scale** — page `p={6}`, cards `p={5}`, consistent `gap`.
- [ ] **Hierarchy** — clear focal point; supporting text is `fgMuted`.
- [ ] **Alignment** — rows use a grid; cards equal height; edges line up.
- [ ] **States** — loading, empty, and error are all handled (not just success).
- [ ] **Interactive feedback** — hover/active/focus states on anything clickable.
- [ ] **Both themes** — looks right in dark AND light (toggle and check).
- [ ] **RTL** — logical props used; check the Arabic layout mirrors correctly.
- [ ] **Responsive** — usable at narrow widths (Chakra responsive arrays `{ base, md }`).
- [ ] **Teaching doc updated** — see below.

## Workflow

The **user runs their own dev server** (`npm run dev` on :5173) and verifies visually — do
NOT use `preview_start`. After editing, tell the user concretely what to look at and what
"correct" looks like, so they can confirm in their browser.

## Teaching-doc convention (required)

`docs/explanation/` mirrors `src/` exactly: `src/x/y.tsx` → `docs/explanation/x/y.tsx.md`.
Whenever you build or change a file, create/update its `.md`: beginner-friendly,
block-by-block, **explain React concepts via Laravel analogies** (Blade = JSX, middleware =
route guards, FormRequest = zod schema, service container = React context, DTO = TS type).
Show the snippet, then explain it, then note "when you'll touch this file." Ask Arabic vs
English if unsure. Update `docs/explanation/changelog.md`.
