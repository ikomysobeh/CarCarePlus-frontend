# 📖 ابدأ من هنا — Start Here

> This folder explains **every file and every important line** of our React frontend,
> written for a **Laravel developer** seeing React for the first time.
>
> هذا المجلد يشرح **كل ملف وكل سطر مهم** في مشروع الـ React، ومكتوب خصيصاً لمطوّر **Laravel** يعمل بـ React لأول مرة.

---

## How this documentation is organized

The folder `docs/explanation/` **mirrors the real `src/` folder** exactly.
For every real file like `src/api/client.ts`, there is an explanation file
`docs/explanation/api/client.ts.md`.

```
src/api/client.ts          →   docs/explanation/api/client.ts.md
src/auth/AuthContext.tsx    →   docs/explanation/auth/AuthContext.tsx.md
src/layouts/DashboardLayout.tsx → docs/explanation/layouts/DashboardLayout.tsx.md
```

So whenever you open a code file and don't understand it, open the matching `.md`.

---

## Read them in this order (first time)

1. **[00-START-HERE.md](00-START-HERE.md)** ← you are here
2. **[01-react-for-laravel-devs.md](01-react-for-laravel-devs.md)** — the mental model. **Read this fully before the rest.**
2b. **[02-react-query-data-fetching.md](02-react-query-data-fetching.md)** — how we load/save API data (read before the feature screens).
3. **[root/](root/)** — the entry point files (`index.html`, `main.tsx`, `index.css`)
4. **[app/](app/)** — how the whole app is wired together (`providers.tsx`, `router.tsx`)
5. **[api/](api/)** — how we talk to your Laravel API (`client.ts`, `endpoints.ts`, `types.ts`)
6. **[auth/](auth/)** — login, session, route protection
7. **[layouts/](layouts/)** — the sidebar + topbar shell
8. **[i18n/](i18n/)**, **[theme/](theme/)**, **[lib/](lib/)**, **[utils/](utils/)**, **[components/](components/)** — supporting pieces

After that, each time we build a **new screen**, we add a new `.md` here explaining it.

---

## The big picture of the project (30 seconds)

- **CarCarePlus** = a car-services platform (wash + inspection + roadside help).
- The **backend is your Laravel API** (in the `CarCarePlus/` folder) — already built.
- **We are building the Web Dashboard** (React) for **Admin** and **Super Admin** only.
- The mobile app and company portal are **not our job**.

⚠️ **Important reality:** the mockup shows 11 screens, but the Laravel API only
has endpoints for ~4 areas right now (auth, profile, cars, catalog, approvals/staff).
We build those for real; the rest stay as "coming soon" until the backend adds them.
Full details in `../07-gaps-and-questions.md` (one level up, in the main `docs/` folder).

---

## The golden rule of this project

Every request/response with your Laravel API goes through **one** file: `src/api/client.ts`.
It knows the response shape `{ status, data, message, status_code, timestamp }`.
You never write `fetch()` or `axios` calls scattered around — always go through that layer.
This is exactly like having **one Service class** in Laravel that every controller uses.
