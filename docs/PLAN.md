# 🗺️ CarCarePlus Frontend — Build Plan (خطة العمل)

> This is our roadmap: **what** we build, **in what order**, **against which endpoints**, and
> **which explanation doc** each step produces. Written after reviewing: the API docs
> (`docs/00`–`07`), the existing scaffold (`src/`), the web mockup (`mockup/index.html`),
> and the 7 design images in `images/`.

---

## 0. The one thing to get straight first (very important)

We have **three different things** that can be confused. Keep them separate in your head:

| # | Thing | Status for us |
|---|-------|---------------|
| A | **Our product = the Admin / Super-Admin WEB dashboard** | ✅ This is what we build. |
| B | **The design images in `images/`** = the *customer MOBILE app* (Emergency Assistance flow + tracking) | 🎨 We copy the **look** (theme, colors, components), **not** the flow. |
| C | **The backend endpoints that actually exist today** | 🔌 We can only wire screens that have an endpoint. |

**Why this matters:** the images show a beautiful emergency-request wizard and live tracking.
But that flow is (1) a *customer* feature, not admin, and (2) needs **orders / road-assistance
/ GPS** APIs that **don't exist yet** (`docs/07`). So we **borrow the visual style** from the
images and apply it to the **dashboard screens we *can* build**. When the backend ships orders
+ tracking, we build those screens too — and they'll already match this style.

> If the client actually wants us to build the **customer web app** (B) instead of / in
> addition to the dashboard — that's a different scope. See "Open decision" at the bottom.

---

## 1. The design system (extracted from `images/`)

These are the visual rules we pull from the images and bake into our MUI theme + components.

### Colors
| Token | Dark theme | Light theme | Used for |
|-------|-----------|-------------|----------|
| `background` | deep navy `#0B1220` | `#F4F6FB` | page background |
| `surface` (card) | near-black `#121A2B` | white `#FFFFFF` | cards, panels |
| `primary` | royal blue `#2F6BFF` | same | header bar, primary buttons, active step |
| `warning` (accent) | orange `#E8730C` | same | "متوسطة" severity, alerts |
| `success` | green `#2FBF71` | same | success checks, completed steps |
| `danger` | red `#E5484D` | same | destructive actions, map pin |
| `text.primary` | white | `#1A2233` | headings, body |
| `text.secondary` | muted blue-gray `#8A93A6` | `#5B6472` | labels, hints |

### Shape & type
- **Rounded**: cards ~14px, buttons are **pills** (fully rounded), inputs ~12px.
- **Fonts**: Cairo / Tajawal (Arabic-first) — already in the theme.
- **RTL** primary — already wired.
- **Two themes**: dark (primary, as in most images) + light, with a **toggle** (sun/moon icon,
  top-left in the images).

### Signature UI pieces seen in the images (our shared components)
1. **Top app bar** — solid blue, centered white title, back arrow, theme toggle.
2. **Stepper** — numbered circles joined by a line; checkmark when a step is done; blue = active.
3. **Segmented control** — 3 pill buttons (e.g. severity طارئة/متوسطة/بسيطة); selected one gets a colored border.
4. **Selectable icon card** — big tappable card with an icon + label (service type, car type); selected = blue border/glow.
5. **Status timeline** — vertical list of steps with check/○ markers (order/assistance progress).
6. **Info card with avatar + rating** — technician card (name, car, ⭐ rating, ETA) + call button.
7. **Summary list** — right-aligned label / left value rows + a totals block (order summary).
8. **Bottom action bar** — full-width primary pill + outline "back" button.
9. **Image upload dropzone** — dashed card with a camera icon.
10. **Map panel** — rounded map area with a pin (placeholder now; real map later).

> Most of #2–#6, #10 belong to the **customer/orders flow** (not buildable yet). We'll build
> the ones our current screens need **first** (see milestones), and the rest when their
> endpoints arrive — but design them all to this spec so they're consistent.

---

## 2. Where we are now (already done — Phase 0 foundation)

✅ React 19 + Vite + TS + MUI, ✅ RTL/Arabic + i18n, ✅ API layer around the real envelope,
✅ auth context + login page, ✅ route guards, ✅ role→menu permission map, ✅ dashboard shell
with sidebar, ✅ placeholders for every route. All of this is **explained** in
`docs/explanation/`. So the plumbing is finished — now we build real screens.

---

## 3. What the backend supports today (our buildable scope)

From `docs/03` + `docs/06`. **Only these have endpoints:**

| Area | Endpoints | Who |
|------|-----------|-----|
| **Auth** | login, register (customer/company/workshop), forgot/reset (link + OTP), logout | all |
| **Profile** | show, update (+ avatar) | all |
| **Cars** | list all, list by customer, create, show, update, delete | admin/customer |
| **Catalog** | categories, services, sub-services, car-types, car-brands (read all; write = super_admin) | all read |
| **Super-admin** | approve/reject companies & workshops, create staff | super_admin |

**Blocked / not built on backend** (build later): orders, road-assistance, tracking/GPS,
payments, wallet, points, packages, inventory, contracts, ratings, notifications, reports,
**branches**, **customer list**. (Full list: `docs/07`.)

---

## 4. The milestones (this is the actual work order)

Each milestone lists: **screens**, **endpoints**, **new shared components**, **explanation
docs to write**, and **definition of done (DoD)**. We do them top to bottom.

### 📊 Progress at a glance (updated 2026-07-25)

| Milestone | Status | Notes |
|-----------|--------|-------|
| **M0** — Theme (dark default + light toggle) | ✅ **Done** | verified in browser |
| **M1** — Login end-to-end | ✅ **Done** | verified live; fixed a backend bug (profile route middleware) |
| **M2** — Shared UI kit | ✅ **Done** | 11 components built + documented |
| **M3** — Catalog CRUD | ✅ **Done** | all 5 resources (categories, services, sub-services, car types, car brands) verified live |
| **M4** — Cars | ✅ **Done** | list + create/edit/delete + image upload; used seeded branches + numeric customer-id (blockers §5) |
| **M5** — Approvals & staff | ✅ **Done** | approve/reject (with reason) + create staff; reject flow verified live |
| **M6** — Profile | ✅ **Done** | view/edit + avatar; verified live (fixed a 2nd backend bug) |
| **M7** — Coming-soon shells + dashboard home | ✅ **Done** | full icon sidebar, real-count dashboard, styled coming-soon pages |

**🎉 All milestones (M0–M7) complete — the buildable scope is finished.** Remaining modules are blocked on backend endpoints (§5 / docs/07).

**Legend:** ✅ done · 🟡 in progress · ⬜ not started.
Full history with what-changed/what-verified per step: [`explanation/changelog.md`](explanation/changelog.md).

### 🎨 M0 — Theme upgrade to match the images  ✅ DONE
Make the app *look* like the images before we build screens, so every screen is born styled.
- ✅ Extended `src/theme/index.ts` → `buildTheme(mode, direction)` with image color tokens
  (navy bg, royal blue, orange, green), pill buttons, rounded cards.
- ✅ Added `src/theme/colorMode.ts` (Context) + mode state in `providers.tsx` (default **dark**,
  saved to localStorage) + sun/moon toggle in the top bar.
- ✅ Docs: `explanation/theme/colorMode.ts.md`, updated `theme/index.ts.md`, providers, layout.
- ✅ **DoD met:** dark default confirmed (body `#0B1220`); toggle flips to light and persists.

### 🔐 M1 — Login working end-to-end (proves everything)  ✅ DONE
- **Endpoints:** `POST /auth/login`, `GET /profile/showProfile`.
- ✅ Verified live: login → dashboard, correct super_admin sidebar, **refresh keeps session**,
  logout clears token → login. No console errors.
- ✅ Frontend hardening: boot session-restore only logs out on real 401 (not on 500/network).
- 🐞 **Found & fixed a backend bug:** the `profile` route group was missing `auth:sanctum`
  middleware → `/profile/showProfile` 500'd. Fixed in `CarCarePlus/routes/api.php`.
  **→ tell the client to reflect it in their source.** (Details in the changelog.)
- ✅ Docs: updated `auth/AuthContext.tsx.md`; changelog entry.

### 🧱 M2 — Shared UI kit (build once, reuse everywhere)  ✅ DONE
Built the pieces our buildable screens need — styled to the design system.
- ✅ **Built:** `PageHeader`, `DataTable` (client-side paging, on plain MUI Table),
  `ConfirmDialog`, `StatusChip`, `FormTextField`/`FormSelect`/`FormSwitch`/`ImageUploadField`
  (RHF via FormProvider), `Loader`/`EmptyState`/`ErrorState`, plus a barrel `index.ts`.
- ⏸️ **Deferred:** `SelectableCard`, `SegmentedControl` — those belong to the *customer* flow
  (service-type/severity pickers). We'll build them when a screen needs them, not before.
- ✅ Docs: `explanation/components/README.md` + `DataTable.tsx.md` + `ConfirmDialog.tsx.md` +
  `form/README.md`.
- ✅ **DoD met:** kit compiles clean; visually verified via the M3 catalog screen.

### 📚 M3 — Catalog CRUD (do before Cars — it's the dropdown data)  ✅ DONE
Five resources, same pattern: **✅ categories · ✅ services · ✅ sub-services · ✅ car-types · ✅ car-brands** — all built & verified live.
- **Screens:** tabbed `CatalogPage`; each tab = list (DataTable) + create/edit dialog + delete
  confirm. Read for everyone; write buttons only for `super_admin` (`canWriteCatalog`).
- **Endpoints:** `GET/POST /categories`, `POST /categories/{id}`, `DELETE /categories/{id}` …
  (same shape for the other four — see `endpoints.ts`).
- **Special rules:** update = `POST` (not PUT); service form shows `vip_extra_price` only when
  `is_vip_available` is on; enum values come from `utils/enums.ts`.
- ✅ **Categories done & verified live:** list loads; create → auto-refetch (invalidation) → new
  row; delete → confirm → row removed; role-gated; Arabic RTL.
- ✅ **Taught React Query** in `explanation/02-react-query-data-fetching.md`; feature docs under
  `explanation/features/catalog/`.
- **Remaining DoD:** repeat the pattern for the other 4 resources (Services is the only one with
  extra fields: `base_price`, `is_vip_available`, conditional `vip_extra_price`, `duration_minutes`).

### 🚗 M4 — Cars  ✅ DONE
- **Screens:** cars list (`/cars/all` for admin), add car, edit car, car details, delete.
- **Endpoints:** `GET /cars/all`, `GET /cars/indexClient/{id?}`, `POST /cars/{customer_id?}`,
  `GET /cars/show/{id}`, `POST /cars/update/{id}`, `GET /cars/delete/{id}`.
- **Depends on:** M3 (brand/type dropdowns) + ⚠️ **branch list** (blocked — see §5) +
  ⚠️ **customer picker** for admins (blocked — see §5).
- **Special rules:** image upload via `multipart/form-data` field `image`; delete is a GET but
  still behind a confirm dialog.
- **Docs:** `explanation/features/cars/…`.
- **DoD:** full car CRUD works (with a temporary branch source until the API ships one).

### ✅ M5 — Super-admin: approvals & staff  ✅ DONE
- **Screens:** pending companies list, pending workshops list, approve/reject (with reason
  dialog), create staff form.
- **Endpoints:** `GET /admin/registration-requests/companies|workshops`,
  `POST …/{id}/approve|reject`, `POST /admin/employees`.
- **Depends on:** ⚠️ **branch list** for the staff form (blocked — §5).
- **Docs:** `explanation/features/admin/…`.
- **DoD:** super_admin can approve/reject and create staff.

### 👤 M6 — Profile  ✅ DONE
- **Screens:** view profile, edit profile + avatar upload.
- **Endpoints:** `GET /profile/showProfile`, `POST /profile/updateProfile` (multipart).
- **Docs:** `explanation/features/profile/…`.
- **DoD:** user can update their info and avatar.

### 🚧 M7 — "Coming soon" shells + dashboard home  ✅ DONE
- Keep the remaining sidebar items (orders, tracking, finance, inventory, contracts, reports,
  branches, users, settings) as styled **"coming soon"** pages (upgrade `Placeholder`), so the
  full navigation from the web mockup exists and matches the design.
- Build a simple **dashboard home** with `StatCard`s (static/placeholder numbers until the
  reports API exists).
- **DoD:** the app feels complete to click through; every unbuilt module clearly says why.

---

## 5. Blockers to raise with the client (before M4/M5)

These stop existing features from working. From `docs/07`:
1. **No `GET /branches`** — but `branch_id` is **required** to add a car and create staff.
   → Ask for a branches endpoint, or a fixed list of branch IDs to use temporarily.
   🩹 *Temporary workaround found:* the DB is seeded with **5 branches** (Riyadh, Jeddah, Dammam,
   Makkah, Madinah — IDs ~1–5). We can hardcode these as a constant until the endpoint ships.
2. **No customer list/search** — but admins add cars *for a customer* by `customer_id`.
   → Ask how the admin selects the customer (need a `GET /customers` or search).
3. **422 validation shape** — confirm exactly where per-field errors live in the envelope.
4. **Token expiry / refresh** — Sanctum token has no refresh endpoint; confirm policy.
5. **Backend fix to relay:** the `profile` route middleware fix from M1 — make sure it's in the
   client's source, not just our local copy.

(Also worth asking for the **roadmap**: which module ships next — ideally **orders + branches**.)

**Test logins (seeded, all password `password123`):** `superadmin@system.com` (super_admin),
`admin@system.com` (admin), plus workshop/customer/company/washer/mechanic `@system.com`.

---

## 6. Order rationale (why this sequence)

```
M0 theme ─► M1 login e2e ─► M2 UI kit ─► M3 catalog ─► M4 cars ─► M5 approvals/staff ─► M6 profile ─► M7 shells
   look         proof         tools      dropdown data   needs M3     admin tools        easy       polish
```
- Theme first so nothing gets restyled later.
- Login proves the whole API layer before we invest in screens.
- The UI kit is the vocabulary every screen speaks.
- Catalog before Cars because cars need catalog data in dropdowns.
- Profile is easy and reuses everything (good confidence checkpoint).
- Shells last so navigation looks complete and we can hand the blockers list to the client.

---

## 7. Our working rhythm (per screen)

For **every** screen we build, we will:
1. Add its route (`app/router.tsx`) + menu entry (`utils/permissions.ts`) if needed.
2. Add API calls in a feature `api.ts` (React Query hooks) using `endpoints.ts`.
3. Build the screen from shared components, styled to the design system.
4. Add Arabic + English labels to `i18n/locales`.
5. **Write the matching explanation `.md`** in `docs/explanation/` (Laravel analogies, line by
   line) — this is a required deliverable, not optional.

---

## 8. Confirmed decisions ✅

Locked in with the client-side owner (kami):

1. **Scope = the Admin / Super-Admin WEB dashboard.** The `images/` are the *customer mobile
   app*; we **borrow their visual style only** (dark/blue/cards/RTL) and apply it to the
   dashboard. We do **not** build the customer flow now (blocked by missing endpoints anyway).
2. **Theme = DARK is the default**, with a **light/dark toggle** (sun/moon, top bar).

➡️ Next up: **M0 (theme upgrade)** then **M1 (login end-to-end)**.
