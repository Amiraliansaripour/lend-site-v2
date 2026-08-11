'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'pwa-install-dismissed';

declare global {
  interface Window {
    __pwaInstallPromptShown?: boolean;
  }
}

export function PwaInstallPrompt() {
  const t = useTranslations('PWA');
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const didShowOnceRef = useRef(false);
  const fadeTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Initialize "show once" from localStorage once, then use the ref
    // consistently inside the event handler.
    try {
      didShowOnceRef.current = Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      // If localStorage is blocked, fall back to in-memory only.
      didShowOnceRef.current = Boolean(window.__pwaInstallPromptShown);
    }

    // If we've already shown it, don't attach listeners again.
    if (didShowOnceRef.current || window.__pwaInstallPromptShown) return;

    const handler = (e: Event) => {
      if (didShowOnceRef.current || window.__pwaInstallPromptShown) return;
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);

      didShowOnceRef.current = true;
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // Ignore if storage is blocked.
      }
      window.__pwaInstallPromptShown = true;
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setPrompt(null);
    // Mark as handled so it won't come back again.
    didShowOnceRef.current = true;
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore if storage is blocked.
    }
    window.__pwaInstallPromptShown = true;
  };

  const handleDismiss = () => {
    didShowOnceRef.current = true;
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore if storage is blocked.
    }
    window.__pwaInstallPromptShown = true;
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    setIsFadingOut(false);
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;

    setIsFadingOut(false);

    // Start fading out after 7 seconds.
    fadeTimerRef.current = window.setTimeout(() => {
      setIsFadingOut(true);
    }, 7000);

    // After the fade transition finishes, fully hide it.
    hideTimerRef.current = window.setTimeout(() => {
      // Ensure we never show it again, even if some other
      // `beforeinstallprompt` edge-case tries to re-trigger it.
      didShowOnceRef.current = true;
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // Ignore if storage is blocked.
      }
      window.__pwaInstallPromptShown = true;
      setVisible(false);
      setPrompt(null);
    }, 7000 + 300);

    return () => {
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={[
        'fixed bottom-4 inset-x-4 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-background p-4 shadow-lg',
        'transition-opacity duration-300',
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100',
      ].join(' ')}
    >
      <div className='flex items-start gap-3'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/icons/icon-72x72.png'
          alt='Lend'
          width={48}
          height={48}
          className='rounded-xl shrink-0'
        />
        <div className='flex-1 min-w-0'>
          <p className='font-semibold text-sm leading-snug'>{t('installTitle')}</p>
          <p className='text-muted-foreground text-xs mt-0.5 leading-relaxed'>
            {t('installDescription')}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className='text-muted-foreground hover:text-foreground transition-colors shrink-0 -mt-0.5'
          aria-label='Dismiss'
        >
          <X size={16} />
        </button>
      </div>
      <div className='flex gap-2 mt-3'>
        <button
          onClick={handleInstall}
          className='flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-foreground text-background text-sm font-medium py-2 transition-opacity hover:opacity-80'
        >
          <Download size={14} />
          {t('install')}
        </button>
        <button
          onClick={handleDismiss}
          className='rounded-lg border border-border text-sm font-medium px-4 py-2 transition-colors hover:bg-muted'
        >
          {t('dismiss')}
        </button>
      </div>
    </div>
  );
}
