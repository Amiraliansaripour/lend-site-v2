'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';

import { readInboundThemeFromSearch, type InboundTheme } from '@/lib/theme-query';
import { appStore } from '@/stores';

/**
 * Syncs `?theme=light|dark` from partner deep links into next-themes (+ zustand).
 * Does not touch other query params. No-op when theme is absent/invalid.
 */
function InboundThemeSyncInner() {
  const searchParams = useSearchParams();
  const { setTheme, theme } = useTheme();
  const setStoreTheme = appStore.useSetTheme();
  const appliedRef = useRef<InboundTheme | null>(null);

  useEffect(() => {
    const inbound = readInboundThemeFromSearch(searchParams);
    if (!inbound) return;
    if (appliedRef.current === inbound && theme === inbound) return;

    appliedRef.current = inbound;
    setTheme(inbound);
    setStoreTheme(inbound);
  }, [searchParams, setTheme, setStoreTheme, theme]);

  return null;
}

export function InboundThemeSync() {
  return (
    <Suspense fallback={null}>
      <InboundThemeSyncInner />
    </Suspense>
  );
}
