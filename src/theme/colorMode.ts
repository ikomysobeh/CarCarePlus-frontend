import { createContext, useContext } from 'react';

// Light or dark. Dark is our default (matches the design images).
export type ColorMode = 'dark' | 'light';

export const MODE_KEY = 'ccp_mode';

// Shared context so any component (e.g. the top-bar toggle) can read the current
// mode and flip it. The real state lives in <AppProviders> (see app/providers.tsx).
export interface ColorModeState {
  mode: ColorMode;
  toggle: () => void;
}

export const ColorModeContext = createContext<ColorModeState | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode must be used inside <AppProviders>');
  return ctx;
}
