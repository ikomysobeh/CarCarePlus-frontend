# 🔄 Migration Plan — MUI → Chakra UI

**Goal:** replace **MUI (Material UI)** with **Chakra UI**, to match the client's library list
(`docs/client-project-form.md`). Same screens, same features, same design (dark navy + royal
blue, RTL Arabic) — only the UI component library underneath changes.

> **What does NOT change** (all already match the client's list): React, React Router DOM,
> React Hook Form, React Query, Axios, i18next, zod, Vite, TypeScript, and our whole API layer
> (`src/api/*`), auth logic, permissions, and endpoints. We only swap the **view layer**.

---

## 0. Design reference (the look we're matching)

The client shared a **dark fintech-style dashboard** as the target look. We adopt its visual
language during this migration (it fits Chakra well). Key traits to replicate:

- **Near-black navy background** with **rounded dark cards** and very subtle borders.
- **Bright blue accent** (with a blue→cyan gradient for charts/highlights); **green/red** chips
  for positive/negative changes.
- **Sidebar:** dark panel, **grouped sections** (e.g. "MANAGE" / "PREFERENCES") with small
  uppercase muted labels, icon + label rows, and the **active item highlighted** (subtle light
  pill + blue icon + white text). Logout pinned at the bottom.
- **Header:** a friendly **greeting** ("Hey there! 👋 — here's what's happening") + a **rounded
  search bar** on the side.
- **Stat cards:** a **rounded icon badge** (blue) on the side, small muted label, big bold value,
  and a small **% change chip**.
- **Charts** (bars / gauge) in blue gradients — used on the dashboard when real data exists.

### Design tokens (dark)
| Token | Value | Use |
|-------|-------|-----|
| `bg` | `#0A0E17` | app background (near-black navy) |
| `surface` | `#121722` | cards / panels |
| `sidebar` | `#0F131C` | sidebar panel |
| `border` | `rgba(255,255,255,0.06)` | card/sidebar borders |
| `primary` | `#2D6BFF` | buttons, active nav, icon badges |
| `accent` | `#38BDF8` (cyan) | gradient end, chart highlights |
| `success` / `danger` | `#22C55E` / `#EF4444` | +% / −% chips |
| `text` / `muted` | `#FFFFFF` / `#8A93A6` | text / secondary |
| radii | cards `20px`, badges `12px`, buttons pill | rounded feel |

Light theme keeps the same accents on a light surface (toggle stays).

> These replace the earlier MUI tokens. Same spirit (dark + blue), just tuned to this reference:
> darker background, more rounding, sidebar grouping + active pill, greeting+search header,
> icon-badge stat cards.

**Where this lands in the phases:** tokens in **MP0** (theme); sidebar grouping + active pill +
greeting/search header in **MP2** (layout); icon-badge stat cards + charts in **MP6** (dashboard).

---

## 1. What actually changes

| Area | From (MUI) | To (Chakra) |
|------|-----------|-------------|
| Components | `@mui/material` | `@chakra-ui/react` |
| Icons | `@mui/icons-material` | `react-icons` (Material set `react-icons/md`) |
| Styling engine | `@emotion` + `stylis-plugin-rtl` | Chakra's built-in system (no stylis needed) |
| Theme | `createTheme` | Chakra theme/system (`createSystem`) |
| Dark/light | our `ColorModeContext` | Chakra color-mode |
| RTL | emotion RTL cache | Chakra `dir="rtl"` (simpler — uses CSS logical properties) |
| Table/pagination | MUI `Table` + `TablePagination` | Chakra `Table` + a small custom pager |
| Dialog | MUI `Dialog` | Chakra `Dialog` |
| Forms | MUI `TextField/Select/Switch` | Chakra `Field/Input/Select/Switch` |

**Removed after migration:** `@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`,
`@emotion/react`, `@emotion/styled`, `stylis`, `stylis-plugin-rtl`.
**Added:** `@chakra-ui/react`, `react-icons` (+ whatever Chakra requires, e.g. `next-themes` for
color mode — confirmed in MP0).

---

## 2. The strategy that saves us the most work

Our screens don't use MUI directly very much — they mostly use **our own shared components**
(`PageHeader`, `DataTable`, `ConfirmDialog`, `FormTextField`, …). So:

> **We rewrite the shared kit's *insides* to Chakra, but keep each component's *props the same*.**
> Then the feature screens (catalog, cars, admin, profile) barely change — they still call
> `<DataTable columns=… rows=… />` exactly as before.

This is the key: **port the kit once, and most screens follow for free.**

---

## 3. Phases (the work order)

Same idea as the original build: foundation → kit → screens → cleanup. Each phase ends with
**type-check + lint clean** and **browser verification**, and its explanation `.md` gets updated.

| Phase | What | Status |
|-------|------|--------|
| **MP0** | Install Chakra + react-icons; set up `ChakraProvider`, theme (image colors), color mode, RTL; get login page rendering | ✅ Done |
| **MP1** | Port the **shared UI kit** (`src/components/*`) — same props, Chakra inside | ✅ Done |
| **MP2** | Port **auth** (LoginPage, guards) + **layout** (DashboardLayout sidebar/topbar, navConfig icons) | ✅ Done |
| **MP3** | Port **catalog** (5 resources + dialogs) | ✅ Done |
| **MP4** | Port **cars** (form + image upload) | ✅ Done |
| **MP5** | Port **admin** (approvals, staff, reject dialog) | ✅ Done |
| **MP6** | Port **profile**, **dashboard home** (StatCards), **coming-soon** pages | ✅ Done |
| **MP7** | **Cleanup**: delete all MUI imports, uninstall MUI/emotion/stylis, full app re-verify, update docs | ✅ Done |

**🎉 Migration complete.** Zero `@mui`/`stylis` imports remain; `tsc` + `oxlint` clean. Design
tokens (dark fintech reference) live in `src/theme/system.ts`; icons are `react-icons/md`;
Cairo/Tajawal fonts loaded in `index.html`; a reusable `FormDialog` backs all create/edit
dialogs; dropdowns use Chakra `NativeSelect` (a real `<select>`). Deps now: @chakra-ui/react +
@emotion/react + react-icons + react-query + react-hook-form + axios + router + i18n + zod.

### MP0 — foundation (most important; do first)
- Pin the **Chakra version** (v3 is current) and confirm its provider + color-mode + theme API.
- Rebuild `theme/` for Chakra: same tokens (navy `#0B1220`, blue `#2F6BFF`, orange, green),
  pill buttons, rounded cards.
- Replace `providers.tsx`: `ChakraProvider` (with our theme) instead of
  ThemeProvider/CacheProvider/CssBaseline. Keep i18n, React Query, Auth providers.
- RTL: keep flipping `<html dir>` on language change (Chakra reads it). Drop `rtlCache.ts`.
- Color mode: replace our `ColorModeContext` with Chakra's color mode (or keep our context and
  drive Chakra) — decided in MP0.
- **Done when:** app boots, login page renders in Chakra, dark default + toggle works.

### MP1 — shared kit (unlocks everything)
Rewrite these with identical prop signatures: `PageHeader`, `StatusChip`, `StatCard`,
`ComingSoon`, `ConfirmDialog`, `DataTable` (+ pager), `Loader`/`EmptyState`/`ErrorState`,
`FormTextField`/`FormSelect`/`FormSwitch`/`ImageUploadField`. Update `components/index.ts`.
- **Done when:** kit compiles; a quick render check passes.

### MP2–MP6 — port the screens
Because the kit keeps the same props, these are mostly: swap any *direct* MUI usage (e.g. `Box`,
`Stack`, `Grid`, `Tabs`, `Card`, `Button`, `IconButton`) for Chakra equivalents, and swap MUI
icons for `react-icons`. Logic (react-hook-form, React Query, zod) is untouched. Verify each
feature in the browser against the live API after porting.

### MP7 — cleanup
- `grep` the codebase for any remaining `@mui` / `@emotion` / `stylis` imports → zero.
- Uninstall those packages; install stays minimal.
- Re-run the full flow (login → catalog CRUD → cars → approvals → profile → dashboard) in the
  browser. `tsc` + `oxlint` clean.
- Update `docs/explanation/*` (theme, providers, components, each feature) to say Chakra, and add
  a changelog entry. Update `PLAN.md`.

---

## 4. Risks / things to watch

- **Chakra v3 API is different from v2** (new component structure, color mode via `next-themes`).
  MP0 confirms the exact API so the rest is consistent.
- **Icons:** MUI has thousands of named icons; `react-icons/md` (Material Design) covers our set
  (dashboard, car, category, map, people, etc.) — we map each one.
- **DataGrid:** we already avoided MUI's DataGrid (built our own on `Table`), so there's **no**
  heavy grid to replace — good.
- **RTL is actually easier** in Chakra (no emotion/stylis cache), so this may remove complexity.
- **No behavior changes:** validation, permissions, API calls, routes all stay — lower risk.

---

## 5. Effort (honest estimate)

Every UI file gets touched (~30 files), but most edits are mechanical (swap components/icons,
keep logic). The heavy thinking is only in **MP0** (theme + providers) and **MP1** (the kit).
After that it's repetitive porting. No features are added or removed.

---

## 6. What I need from you before I start

Just a **go-ahead**. When you say go, I start with **MP0** (install Chakra, set up the theme +
providers, get login rendering), verify it in the browser, then continue phase by phase — same
rhythm as before (build → verify → document).

> Note: I'll keep the app working at each phase where possible, but during the port some screens
> will briefly look unstyled until their phase is done. The final MP7 leaves everything clean and
> MUI-free.
