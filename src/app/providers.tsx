import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n, { dirFor, LANG_KEY } from '../i18n';
import { system } from '../theme/system';
import { ColorModeContext, MODE_KEY, type ColorMode } from '../theme/colorMode';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../auth/AuthContext';

export function AppProviders({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState(i18n.language);
  const dir = dirFor(lang);

  // Color mode (dark is the default; the user's choice is remembered in localStorage).
  const [mode, setMode] = useState<ColorMode>(
    () => (localStorage.getItem(MODE_KEY) as ColorMode | null) ?? 'dark',
  );
  const colorMode = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((m) => {
          const next = m === 'dark' ? 'light' : 'dark';
          localStorage.setItem(MODE_KEY, next);
          return next;
        }),
    }),
    [mode],
  );

  // Sync the <html> `.dark`/`.light` class so Chakra's `_dark` tokens apply.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.classList.toggle('light', mode === 'light');
  }, [mode]);

  // Keep <html dir/lang> in sync with the active language (RTL for Arabic).
  useEffect(() => {
    const handler = (lng: string) => {
      setLang(lng);
      localStorage.setItem(LANG_KEY, lng);
      document.documentElement.setAttribute('dir', dirFor(lng));
      document.documentElement.setAttribute('lang', lng);
    };
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    i18n.on('languageChanged', handler);
    return () => void i18n.off('languageChanged', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ColorModeContext.Provider value={colorMode}>
        <ChakraProvider value={system}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
          </QueryClientProvider>
        </ChakraProvider>
      </ColorModeContext.Provider>
    </I18nextProvider>
  );
}
