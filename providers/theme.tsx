'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

import { appStore, type Theme } from '@/stores';

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * System-wide theme provider (light / dark / system).
 * Keeps `next-themes` as source of truth and mirrors into zustand for any store readers.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
      storageKey='theme'
      {...props}
    >
      <ThemeStoreSync />
      {children}
    </NextThemesProvider>
  );
}

function ThemeStoreSync() {
  const { theme } = useTheme();
  const setTheme = appStore.useSetTheme();

  React.useEffect(() => {
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      setTheme(theme as Theme);
    }
  }, [theme, setTheme]);

  return null;
}
