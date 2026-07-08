'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'pwa-install-dismissed';

export function PwaInstallPrompt() {
  const t = useTranslations('PWA');
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(display-mode: standalone)').matches ||
      sessionStorage.getItem(STORAGE_KEY)
    )
      return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
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
  };

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className='fixed bottom-4 inset-x-4 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-background p-4 shadow-lg'>
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
