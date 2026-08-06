# `src/layouts/DashboardLayout.tsx` — the app shell (sidebar + topbar)

**Real file:** [`../../../src/layouts/DashboardLayout.tsx`](../../../src/layouts/DashboardLayout.tsx)

## What it is

The **frame** that surrounds every logged-in page: the top bar (app name, language toggle,
user name, logout) and the left sidebar (navigation menu). The actual page content is shown
in the middle via `<Outlet />`.

**Laravel analogy:** this is your **master layout Blade** (`layouts/app.blade.php`) with the
navbar + sidebar, and `<Outlet />` is `@yield('content')`.

## Block by block

### The sidebar width and route map
```tsx
const DRAWER_WIDTH = 240;

const ROUTE_FOR: Record<ModuleKey, string> = {
  dashboard: '/',
  approvals: '/approvals',
  staff: '/staff',
  cars: '/cars',
  catalog: '/catalog',
  profile: '/profile',
};
```
- `DRAWER_WIDTH` — the sidebar width in pixels (a constant so it's reused consistently).
- `ROUTE_FOR` — maps each menu key to its URL. `Record<ModuleKey, string>` = an object whose
  keys are `ModuleKey`s and values are strings (a typed dictionary). The `ModuleKey` type
  comes from [`../utils/permissions.ts.md`](../utils/permissions.ts.md).

### Reading auth + choosing which menu items to show
```tsx
const { user, logout } = useAuth();
const location = useLocation();
const modules = user ? MODULES_BY_ROLE[user.role] : [];
```
- `useAuth()` gives the current user (and logout).
- `useLocation()` tells us the current URL (used to highlight the active menu item).
- `MODULES_BY_ROLE[user.role]` — looks up **which menu items this role may see**. So a
  `super_admin` sees more items than a `customer_personal`. This is the data-driven,
  role-based sidebar (source: `utils/permissions.ts`).

### The language toggle
```tsx
const toggleLang = () => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
```
- Flips between Arabic and English. `providers.tsx` listens for this and flips the whole
  page direction (RTL/LTR) — see [`../app/providers.tsx.md`](../app/providers.tsx.md).

### The top bar
```tsx
<AppBar position="fixed" sx={{ zIndex: (th) => th.zIndex.drawer + 1 }}>
  <Toolbar sx={{ gap: 2 }}>
    <Typography variant="h6" sx={{ flexGrow: 1 }}>{t('app.name')}</Typography>
    <Button color="inherit" onClick={toggleLang}>{i18n.language === 'ar' ? 'EN' : 'ع'}</Button>
    <Typography variant="body2">{user?.name}</Typography>
    <Button color="inherit" onClick={() => logout()}>{t('nav.logout')}</Button>
  </Toolbar>
</AppBar>
```
- `<AppBar>` = MUI's top navigation bar; `position="fixed"` keeps it pinned while scrolling.
- `flexGrow: 1` on the app name pushes the other items to the far side.
- `onClick={toggleLang}` and `onClick={() => logout()}` — event handlers, like a Blade
  button with a JS listener. `onClick` runs the function when clicked.
  - Note: `onClick={toggleLang}` passes the function; `onClick={() => logout()}` wraps it in
    an arrow function so `logout` is only called **on click**, not immediately during render.

### The sidebar menu (rendered from data)
```tsx
<Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, ... }}>
  <Toolbar />
  <List>
    {modules.map((m) => (
      <ListItemButton
        key={m}
        component={Link}
        to={ROUTE_FOR[m]}
        selected={location.pathname === ROUTE_FOR[m]}
      >
        <ListItemText primary={t(`nav.${m}`)} />
      </ListItemButton>
    ))}
  </List>
</Drawer>
```
- `<Drawer variant="permanent">` = a sidebar that's always visible.
- `{modules.map((m) => ( ... ))}` — **this is how React loops** (the equivalent of Blade's
  `@foreach`). `.map()` transforms each menu key into a `<ListItemButton>`. The result is a
  list of buttons.
- `key={m}` — React requires a unique `key` on each item in a list so it can track them
  efficiently. (Forget it and React warns you.)
- `component={Link} to={ROUTE_FOR[m]}` — makes the button navigate to that route on click,
  **without a page reload** (`Link` is React Router's `<a>`). `to` is like `href`.
- `selected={location.pathname === ROUTE_FOR[m]}` — highlight the button if its route is the
  current URL (the "active menu item" effect).
- `primary={t(\`nav.${m}\`)}` — the label, translated. `` `nav.${m}` `` builds keys like
  `nav.cars`, `nav.catalog` (template string).

### The content area
```tsx
<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
  <Toolbar />
  <Outlet />
</Box>
```
- `<Outlet />` — **the placeholder where the matched child route renders**. This is the
  single most important line: it's `@yield('content')`. When the URL is `/cars`, the Cars
  page appears here; the sidebar/topbar stay put.
- The empty `<Toolbar />` above it is a spacer that pushes content below the fixed top bar.

## The whole idea in one sentence

The layout draws the frame **once**; `<Outlet />` swaps the inner page as you navigate; the
sidebar items come from the user's role. So building a new screen = add a route (router.tsx)
+ maybe a menu item (permissions.ts) — the frame is already handled here.

## 🆕 What M0 added — the theme toggle

The top bar gained a sun/moon button that flips dark/light:
```tsx
const { mode, toggle } = useColorMode();   // from theme/colorMode.ts
<Tooltip title={mode === 'dark' ? t('common.lightMode') : t('common.darkMode')}>
  <IconButton color="inherit" onClick={toggle}>
    {mode === 'dark' ? <LightMode /> : <DarkMode />}
  </IconButton>
</Tooltip>
```
- `<IconButton>` = a button that shows just an icon. `<LightMode/>`/`<DarkMode/>` are MUI
  icons (imported from `@mui/icons-material`).
- We show the **opposite** icon to what we'd switch *to*: in dark mode we show a sun (switch
  to light). The tooltip label is translated.

## When you'll touch this file

When we add a new **menu item** (a new nav entry + its `ROUTE_FOR` mapping), or improve the
shell (mobile responsive drawer, notifications bell, user avatar dropdown). The mockup's
sidebar has ~11 items; we'll grow this to match as endpoints arrive.
