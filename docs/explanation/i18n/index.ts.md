# `src/i18n/index.ts` — translations (Arabic + English)

**Real files:**
- [`../../../src/i18n/index.ts`](../../../src/i18n/index.ts) — the setup
- [`../../../src/i18n/locales/ar.json`](../../../src/i18n/locales/ar.json) — Arabic text
- [`../../../src/i18n/locales/en.json`](../../../src/i18n/locales/en.json) — English text

## What it is

The translation system. Arabic is the **primary** language (the app defaults to Arabic +
RTL); English is secondary. This is exactly Laravel's localization:

| Laravel | Here |
|---------|------|
| `lang/ar.json`, `lang/en.json` | `locales/ar.json`, `locales/en.json` |
| `__('auth.login')` | `t('auth.login')` |
| `app()->setLocale('ar')` | `i18n.changeLanguage('ar')` |

## The setup code

```ts
import ar from './locales/ar.json';
import en from './locales/en.json';

export const LANG_KEY = 'ccp_lang';
const saved = (localStorage.getItem(LANG_KEY) as 'ar' | 'en' | null) ?? 'ar';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export const dirFor = (lng: string): 'rtl' | 'ltr' => (lng === 'ar' ? 'rtl' : 'ltr');
```

- `import ar from './locales/ar.json'` — load the translation dictionaries.
- `LANG_KEY = 'ccp_lang'` — the `localStorage` key where we remember the user's language
  choice between visits.
- `const saved = ... ?? 'ar'` — read the saved language; if none, **default to Arabic**.
- `.init({ resources, lng, fallbackLng, interpolation })`:
  - `resources` — the dictionaries, keyed by language.
  - `lng: saved` — start in the saved (or default Arabic) language.
  - `fallbackLng: 'en'` — if a key is missing in the current language, use English.
  - `escapeValue: false` — React already protects against injection, so no double-escaping.
- `dirFor(lng)` — returns `'rtl'` for Arabic, `'ltr'` otherwise. Used by `providers.tsx` to
  flip the whole page direction.

## The locale files (the actual text)

```json
// en.json
{
  "app": { "name": "CarCarePlus" },
  "nav": { "dashboard": "Dashboard", "cars": "Cars", "logout": "Logout", ... },
  "auth": { "login": "Login", "email": "Email", "password": "Password" },
  "common": { "save": "Save", "cancel": "Cancel", "delete": "Delete", ... }
}
```
- Nested JSON — you reach a value with a **dot path**: `t('nav.cars')` → "Cars".
- `ar.json` has the same keys with Arabic values. **Keep both files in sync** — every key in
  one must exist in the other, or you'll see the fallback / the raw key.

## How you use it in a component

```tsx
import { useTranslation } from 'react-i18next';

function Example() {
  const { t } = useTranslation();
  return <button>{t('common.save')}</button>;   // "Save" or "حفظ"
}
```

## Rule for our project

**Never hard-code visible text.** Instead of `<button>Save</button>`, write
`<button>{t('common.save')}</button>` and add the key to both `ar.json` and `en.json`.
This is what makes the Arabic-first requirement work everywhere.

## When you'll touch these files

**Every screen.** Each new screen adds its labels to `ar.json` + `en.json`. The setup file
(`index.ts`) itself you rarely change.
