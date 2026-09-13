'use client';

import { useEffect, useRef, useState } from 'react';
import { Coins } from 'lucide-react';

import { cn } from '@/lib/utils';
import { normalizeToPersianDigits } from '@/utils/normalize';

type LoyaltyPointsCardProps = {
  points?: number;
  className?: string;
};

function useCountUp(target: number, durationMs = 900, enabled = true) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [target, durationMs, enabled]);

  return enabled ? value : target;
}

const STUB_WIDTH = 96;

export function LoyaltyPointsCard({ points = 0, className }: LoyaltyPointsCardProps) {
  const animatedPoints = useCountUp(points, 900);
  const displayPoints = normalizeToPersianDigits(animatedPoints.toLocaleString('en-US'));

  return (
    <div
      dir='ltr'
      className={cn(
        'loyalty-card relative flex h-40 overflow-hidden rounded-[28px]',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_45px_-24px_rgba(0,0,0,0.3)]',
        className,
      )}
    >
      {/* Decorative stub — keeps ticket layout without convert action */}
      <div
        className={cn(
          'relative z-30 flex shrink-0 flex-col items-center justify-center',
          'gap-2 overflow-hidden',
          'rounded-l-[28px]',
          'border-r border-white/10',
          'text-center',
          'shadow-[6px_0_18px_-12px_rgba(0,0,0,0.35)]',
        )}
        style={{
          width: STUB_WIDTH,
          background:
            'linear-gradient(155deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 80%, black) 100%)',
        }}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-0',
            'bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.22),transparent_48%)]',
          )}
        />

        <div
          className={cn(
            'relative z-10 flex size-9 items-center justify-center',
            'rounded-full border border-white/20 bg-white/10',
            'shadow-[inset_0_1px_0_rgba(255,255,255,.2)]',
          )}
        >
          <Coins className='size-5 text-primary-foreground' />
        </div>

        <span className='relative z-10 text-[11px] font-medium leading-[15px] text-primary-foreground'>
          امتیاز
          <br />
          باشگاه
        </span>
      </div>

      <div
        className={cn(
          'relative z-20 flex flex-1 flex-col justify-center',
          'gap-2 overflow-hidden',
          'rounded-r-[28px]',
          'border border-l-0 border-border/60 bg-card',
          'px-7 text-right',
        )}
      >
        <div className='pointer-events-none absolute -right-16 -top-24 size-44 rounded-full bg-primary/10 blur-3xl' />

        <div
          className={cn(
            'absolute right-5 top-5 flex size-7 items-center justify-center',
            'rounded-full border border-primary/15 bg-primary/5 text-primary',
          )}
        >
          <Coins className='size-3.5' />
        </div>

        <div className='relative flex'>
          <p className='text-xs text-muted-foreground'>باشگاه مشتریان</p>
        </div>

        <div className='relative flex items-baseline justify-end gap-1.5'>
          <span
            className={cn(
              'animate-in fade-in slide-in-from-bottom-2',
              'text-4xl font-bold tracking-tight tabular-nums text-foreground',
              'duration-500',
            )}
          >
            {displayPoints}
          </span>
          <span className='text-sm text-muted-foreground'>امتیاز</span>
        </div>

        <div className='relative'>
          <p
            className={cn(
              'animate-in fade-in slide-in-from-bottom-1',
              'text-xs leading-6 text-muted-foreground',
              'duration-500',
            )}
          >
            امتیاز باشگاه مشتریان شما
          </p>
        </div>
      </div>
    </div>
  );
}
