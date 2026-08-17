import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
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
    () => (localStorage.getItem(MODE_KEY) as ColorMode | null) ?? 'light',
  );
  const colorMode = useMemo(
    () => ({
      mode,
      // `e` is the click event the toggle button already passes to `onClick={toggle}` — we
      // just stopped ignoring it. Its coordinates become the centre of the reveal, so the
      // new theme appears to spread out from under the user's finger. Called without an
      // event (or from a keyboard) it falls back to the middle of the screen.
      toggle: (e?: { clientX?: number; clientY?: number }) => {
        const next = mode === 'dark' ? 'light' : 'dark';
        const apply = () => {
          localStorage.setItem(MODE_KEY, next);
          // Flip the class HERE too, not only in the effect below. startViewTransition
          // snapshots the DOM the instant this callback returns, and `.dark` normally lands
          // via a passive effect — which may run after that snapshot. The result would be
          // two identical frames and no visible sweep. The effect remains the source of
          // truth for any other way `mode` changes; setting the same class twice is a no-op.
          const el = document.documentElement;
          el.classList.toggle('dark', next === 'dark');
          el.classList.toggle('light', next === 'light');
          setMode(next);
        };

        const root = document.documentElement;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Not every browser has the API. Without this guard the theme would simply never
        // change on those, which is far worse than losing an animation.
        if (!document.startViewTransition || reduced) {
          apply();
          return;
        }

        const x = e?.clientX ?? window.innerWidth / 2;
        const y = e?.clientY ?? window.innerHeight / 2;
        // The circle has to reach the FARTHEST corner, otherwise the old theme survives in
        // whichever corner is furthest from the button. Distance to the far corner on each
        // axis, combined with Pythagoras.
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );
        root.classList.add('vt-switching');

        // flushSync is REQUIRED: startViewTransition snapshots the DOM the moment this
        // callback returns. React 19 batches state updates, so without it the callback
        // returns before the theme has actually been applied and the browser snapshots
        // two identical frames — no visible transition at all.
        const transition = document.startViewTransition(() => flushSync(apply));

        // Drive the reveal from here rather than from a CSS @keyframes. The CSS version had
        // to read the click position through custom properties on <html>, and those do not
        // reliably inherit into the view-transition pseudo-element tree — so the circle kept
        // falling back to the centre of the screen. Passing the pixel values straight into
        // Web Animations API removes the inheritance step entirely.
        // `transition.ready` (not `.finished`) is the moment the pseudo-elements exist.
        transition.ready
          .then(() => {
            root.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${radius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration: 520,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                // Clip the INCOMING theme; the outgoing one stays still underneath it.
                pseudoElement: '::view-transition-new(root)',
              },
            );
          })
          // A skipped transition (e.g. another one starts mid-flight) rejects `ready`.
          // Nothing to recover from — the theme still changed — so just don't let it
          // surface as an unhandled rejection.
          .catch(() => {});

        transition.finished.finally(() => root.classList.remove('vt-switching'));
      },
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
