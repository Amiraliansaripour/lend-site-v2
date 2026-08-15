'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type SiteTemplateLoaderProps = {
  className?: string;
};

const STATUS_MESSAGES = ['در حال آماده‌سازی', 'در حال آماده‌سازی', 'در حال آماده‌سازی'] as const;

export function SiteTemplateLoader({ className }: SiteTemplateLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);

  useEffect(() => {
    let fadeTimeout: number | undefined;

    const id = window.setInterval(() => {
      setMessageVisible(false);
      fadeTimeout = window.setTimeout(() => {
        setMessageIndex(i => (i + 1) % STATUS_MESSAGES.length);
        setMessageVisible(true);
      }, 280);
    }, 2400);

    return () => {
      window.clearInterval(id);
      if (fadeTimeout) window.clearTimeout(fadeTimeout);
    };
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden',
        'bg-[radial-gradient(ellipse_at_50%_30%,oklch(0.98_0.02_260)_0%,oklch(0.95_0.03_260)_42%,oklch(0.9_0.05_260)_100%)]',
        'site-template-loader-enter',
        className,
      )}
      role='status'
      aria-live='polite'
      aria-busy='true'
      aria-label='در حال بارگذاری هویت بصری سایت'
    >
      {/* Atmosphere */}
      <div className='pointer-events-none absolute inset-0' aria-hidden>
        <div className='site-template-orb absolute -left-20 top-[18%] size-80 rounded-full bg-brand/12 blur-3xl' />
        <div className='site-template-orb-delayed absolute -right-24 bottom-[12%] size-96 rounded-full bg-brand/8 blur-3xl' />
        <div className='absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,oklch(0.92_0.04_260/0.35)_100%)]' />
        <div
          className='absolute inset-0 opacity-[0.35]'
          style={{
            backgroundImage: 'radial-gradient(oklch(0.45_0.12_260_/_0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          }}
        />
      </div>

      <div className='relative flex flex-col items-center gap-10 px-6'>
        {/* Mark */}
        <div className='relative size-28' aria-hidden>
          <span className='site-template-ring absolute inset-0 rounded-full border border-brand/15' />
          <span className='site-template-spin absolute inset-0 rounded-full border-2 border-transparent border-t-brand/80 border-r-brand/30' />
          <span className='site-template-spin-reverse absolute inset-3 rounded-full border border-transparent border-b-brand/55 border-l-brand/20' />
          <span className='site-template-breathe absolute inset-[30%] rounded-[1.15rem] bg-brand shadow-[0_12px_40px_oklch(36.8%_0.255_260.458/0.28)]' />
          <span className='site-template-breathe absolute inset-[42%] rounded-md bg-white/90' />
        </div>

        {/* Copy + progress */}
        <div className='flex w-full max-w-[16rem] flex-col items-center gap-5 text-center'>
          <div className='flex min-h-13 flex-col items-center justify-center gap-1.5'>
            <p
              className={cn(
                'text-base font-medium tracking-wide text-brand transition-all duration-300',
                messageVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
              )}
            >
              {STATUS_MESSAGES[messageIndex]}
            </p>
            <p className='text-xs text-brand/55'>لطفاً چند لحظه صبر کنید</p>
          </div>

          <div className='h-1.5 w-full overflow-hidden rounded-full bg-brand/10'>
            <div className='site-template-progress h-full w-2/5 rounded-full bg-linear-to-l from-brand/40 via-brand to-brand/70' />
          </div>

          <div className='flex items-center gap-1.5' aria-hidden>
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className='site-template-dot size-1.5 rounded-full bg-brand/45'
                style={{ animationDelay: `${i * 0.22}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
