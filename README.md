# CarCarePlus — Frontend

React + TypeScript + Vite + Chakra UI admin/super-admin dashboard for the CarCarePlus Laravel API.

## Stack

- **React 19 + Vite + TypeScript**
- **Chakra UI v3** + Emotion — dark theme by default with a light toggle; Arabic/English with
  automatic RTL/LTR direction switching
- **React Router v7** — routing + role guards
- **TanStack Query** — server state / caching
- **Axios** — one client wired to the real API envelope
- **react-hook-form + zod** — forms & validation
- **i18next** — Arabic (primary) / English

## Getting started

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL to the backend URL
npm run dev                # http://localhost:5173
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

See [`docs/دليل-تشغيل-المشروع-للعميل.md`](docs/دليل-تشغيل-المشروع-للعميل.md) for a full, no-assumed-knowledge
walkthrough (Arabic) covering the backend too.

## Folder structure

```
src/
├── api/                    # THE API layer (start here)
│   ├── types.ts            # ApiResponse<T>, ApiError, Role, AuthUser
│   ├── client.ts           # axios instance + interceptors + unwrap() + token store
│   └── endpoints.ts        # every API path (mirrors ../docs/03 + later pull docs)
├── app/
│   ├── providers.tsx        # theme + i18n + query + auth providers
│   └── router.tsx           # every route
├── auth/
│   ├── AuthContext.tsx      # user/token, login(), logout(), session restore
│   ├── guards.tsx           # RequireAuth, RequireRole
│   └── pages/LoginPage.tsx
├── layouts/
│   ├── DashboardLayout.tsx  # sidebar (role-filtered) + topbar + theme/lang switch
│   └── navConfig.tsx        # nav items + icons; built vs. "coming soon" grouping
├── theme/                   # Chakra design tokens (dark/light) + colorMode context
├── i18n/                    # setup + locales/ar.json + locales/en.json
├── utils/
│   ├── enums.ts             # backend enum values (see ../docs/05)
│   └── permissions.ts       # role → visible modules, and every "who can write" helper
├── components/              # shared UI kit — PageHeader, DataTable, ConfirmDialog, FormDialog,
│                            # StatusChip, StatCard/FeatureStatCard, ComingSoon, form/*, states/*
└── features/                # one folder per business feature (see below)
```

## Features

Every feature folder follows the same shape: `types.ts` (API shapes), `api.ts` (React Query
hooks), one `*FormDialog.tsx` + one `*Section.tsx`/`*Page.tsx` per resource.

| Feature | What it is |
|---|---|
| `dashboard` | Home page with live counts from the catalog/cars hooks |
| `catalog` | Categories, Services, Sub-services, Car Types, Car Brands |
| `cars` | Car CRUD, multipart image upload |
| `admin` | Registration approvals (companies/workshops), staff creation, Admins CRUD |
| `pricing` | Dynamic pricing rule types + rules (super_admin only) |
| `branches` | Branch CRUD — admin can edit only their own branch |
| `customers` | Personal + Company customers — edit-only, no self-service create |
| `workshops` | Workshop CRUD |
| `packages` | Subscription packages + package-services + sub-services |
| `subscriptions` | Customer subscriptions (user-packages) + loyalty points |
| `inventory` | Materials, material units, stock levels, the transaction ledger |
| `settings` | Problem Types, Suggested Problems, System Settings, AI Rules |
| `orders` | Bookings operations console — assign / start / complete / cancel |
| `profile` | Own profile + avatar |
| `shell` | `ComingSoon` placeholder for modules with no backend endpoint yet |

**Still `ComingSoon`** (no backend endpoint exists yet): tracking, contracts, finance, reports —
see `../docs/07-gaps-and-questions.md`.

## How to add a feature (the established pattern)

1. `types.ts` + `api.ts` (React Query hooks) using `http` + `endpoints` + `unwrap()`.
2. Build a `*FormDialog.tsx` (react-hook-form + zod + the shared `components/form/*`) and a
   `*Section.tsx`/`*Page.tsx` (a `DataTable` + `PageHeader` + `ConfirmDialog`).
3. Wire the page into `app/router.tsx`; add a `ModuleKey` + write-permission helper in
   `utils/permissions.ts`, and a nav icon in `layouts/navConfig.tsx` if it's a new sidebar item.
4. Map `ApiError.fieldErrors` to form fields on a 422.
5. Add matching `en`/`ar` i18n keys, and a teaching doc under
   `docs/explanation/features/<name>.md`.

## Important notes

- Reference docs for the **backend contract** live in `../docs/` (numbered `00`–`11`, one per
  backend pull — read `02-response-format.md` and `03-api-endpoints.md` first).
- Reference docs for **this codebase's own conventions** live in `docs/explanation/` — one file
  per feature, written for a Laravel developer new to React, plus `changelog.md`.
- **Update endpoints use POST** (not PUT). Only Cars and Profile use `multipart/form-data`
  (image uploads) — everything else is plain JSON.
- Several list endpoints started paginating server-side (default 15/page) — `api/client.ts`'s
  `ALL_ROWS_PARAMS` is a stopgap that keeps full lists visible until real server-side pagination
  is built into `DataTable` (see `../docs/11-new-orders-bookings-pagination-2026-08-06.md` §1).
  Cars and Bookings are stuck at a fixed 10/page with no override.
- A couple of fields have **no lookup endpoint yet** (Orders' employee picker, Workshops'
  `user_id`) — plain numeric fields for now, documented as known limitations in their feature docs.
