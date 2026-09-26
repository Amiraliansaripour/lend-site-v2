'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

import { appStore, type Theme } from '@/stores';

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * System-wide theme provider (light / dark).
 * next-themes owns the `class` on <html>; zustand mirrors for store readers.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='light'
      enableSystem={false}
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
