import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
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

export default i18n;
