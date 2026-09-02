'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Check, Coins, Sparkles, WalletCards } from 'lucide-react';

import { cn } from '@/lib/utils';
import { normalizeToPersianDigits } from '@/utils/normalize';

type LoyaltyPointsCardProps = {
  points?: number;
  creditAmount?: number;
  conversionRatio?: number;
  creditUnit?: string;
  onConvert?: () => void;
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

export function LoyaltyPointsCard({
  points = 1250,
  creditAmount,
  conversionRatio = 10,
  creditUnit = 'تومان',
  onConvert,
  className,
}: LoyaltyPointsCardProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [isConverted, setIsConverted] = useState(false);

  const calculatedCredit = creditAmount ?? Math.floor(points / conversionRatio);

  const animatedPoints = useCountUp(points, 900, !isConverted);

  const animatedCredit = useCountUp(calculatedCredit, 1100, isConverted);

  const handleConvert = () => {
    if (isConverting || isConverted) return;

    setIsConverting(true);

    window.setTimeout(() => {
      setIsConverting(false);
      setIsConverted(true);
      onConvert?.();
    }, 1550);
  };

  const displayPoints = normalizeToPersianDigits(animatedPoints.toLocaleString('en-US'));

  const displayCredit = normalizeToPersianDigits(animatedCredit.toLocaleString('en-US'));

  return (
    <>
      <div
        dir='ltr'
        className={cn(
          'loyalty-card relative flex h-40 overflow-hidden rounded-[28px]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_45px_-24px_rgba(0,0,0,0.3)]',
          'transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]',

          isConverting &&
            'scale-[1.02] rotate-[0.15deg] shadow-[0_24px_55px_-22px_rgba(0,0,0,0.4)]',

          isConverted && 'shadow-[0_24px_60px_-25px_rgba(16,185,129,0.35)]',

          className,
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute -inset-4 rounded-[36px]',
            'opacity-0 blur-2xl transition-opacity duration-700',

            isConverting && 'opacity-35',
            isConverted && 'opacity-20',
          )}
          style={{
            background: isConverted ? 'rgb(16 185 129)' : 'var(--primary)',
          }}
        />

        {isConverting && (
          <>
            <div className='pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-[28px]'>
              <div className='conversion-beam absolute -left-1/2 top-0 h-full w-[42%] rotate-[12deg] bg-gradient-to-r from-transparent via-white/55 to-transparent blur-md' />
            </div>

            {/* Floating particles */}
            <div className='pointer-events-none absolute inset-0 z-40 overflow-hidden rounded-[28px]'>
              <div className='absolute left-[62px] top-1/2 size-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_20px_6px_rgba(255,255,255,.9)] conversion-particle-1' />

              <div className='absolute left-[74px] top-[34%] size-1.5 rounded-full bg-white shadow-[0_0_15px_4px_rgba(255,255,255,.8)] conversion-particle-2' />

              <div className='absolute left-[82px] top-[68%] size-1 rounded-full bg-white shadow-[0_0_12px_3px_rgba(255,255,255,.9)] conversion-particle-3' />

              <div className='absolute left-[88px] top-[48%] size-1.5 rounded-full bg-white shadow-[0_0_14px_4px_rgba(255,255,255,.9)] conversion-particle-4' />
            </div>
          </>
        )}

        <button
          type='button'
          onClick={handleConvert}
          disabled={isConverting || isConverted}
          aria-label={isConverted ? 'اعتبار شما آماده است' : 'تبدیل امتیاز به اعتبار'}
          className={cn(
            'group relative z-30 flex shrink-0 flex-col items-center justify-center',
            'gap-2 overflow-hidden',
            'rounded-l-[28px]',
            'border-r border-white/10',
            'text-center outline-none',

            'shadow-[6px_0_18px_-12px_rgba(0,0,0,0.35)]',

            'transition-all duration-700',
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',

            isConverting && 'cursor-wait',
            isConverted && 'cursor-default',
          )}
          style={{
            width: STUB_WIDTH,
            background: isConverted
              ? 'linear-gradient(155deg, rgb(16 185 129) 0%, rgb(5 150 105) 100%)'
              : 'linear-gradient(155deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 80%, black) 100%)',
          }}
        >
          <div
            className={cn(
              'pointer-events-none absolute inset-0 opacity-0',
              'bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.3),transparent_48%)]',
              'transition-opacity duration-500',

              'group-hover:opacity-100',

              isConverting && 'opacity-100 animate-pulse',
            )}
          />

          <div
            className={cn(
              'pointer-events-none absolute size-16 rounded-full',
              'border border-white/20',
              'opacity-0',

              'transition-all duration-500',

              'group-hover:scale-110 group-hover:opacity-100',

              isConverting && 'scale-125 animate-spin-slow opacity-100',
            )}
          />

          <div
            className={cn(
              'relative z-10 flex size-9 items-center justify-center',
              'rounded-full border border-white/20 bg-white/10',
              'shadow-[inset_0_1px_0_rgba(255,255,255,.2)]',

              'transition-all duration-500',

              'group-hover:scale-110',
              'group-hover:bg-white/15',

              isConverting && 'scale-125 rotate-[180deg] bg-white/20',

              isConverted && 'scale-110 rotate-0 bg-white/20',
            )}
          >
            {isConverted ? (
              <Check className='size-5 animate-in zoom-in text-white duration-300' />
            ) : (
              <ArrowLeftRight
                className={cn(
                  'size-5 text-primary-foreground',
                  'transition-transform duration-500',

                  'group-hover:scale-110',

                  isConverting && 'rotate-180',
                )}
              />
            )}
          </div>

          <span
            className={cn(
              'relative z-10 text-[11px] font-medium leading-[15px]',
              'text-primary-foreground',
              'transition-all duration-500',

              isConverting && 'opacity-70',
            )}
          >
            {isConverted ? (
              <>
                اعتبار
                <br />
                آماده است
              </>
            ) : (
              <>
                تبدیل به
                <br />
                اعتبار
              </>
            )}
          </span>
          <div
            className={cn(
              'absolute bottom-0 left-0 h-[2px] bg-white/70',
              isConverting ? 'animate-conversion-progress' : 'w-0',
            )}
          />
        </button>

        <div
          className={cn(
            'relative z-20 flex flex-1 flex-col justify-center',
            'gap-2 overflow-hidden',

            'rounded-r-[28px]',

            'border border-l-0',
            'px-7 text-right',

            'transition-all duration-700',

            isConverted
              ? 'border-emerald-200/70 bg-gradient-to-br from-card via-card to-emerald-500/[0.06]'
              : 'border-border/60 bg-card',
          )}
        >
          <div
            className={cn(
              'pointer-events-none absolute -right-16 -top-24 size-44 rounded-full blur-3xl',
              'transition-all duration-1000',

              isConverted ? 'bg-emerald-400/15' : 'bg-primary/10',
            )}
          />

          <div
            className={cn(
              'absolute right-5 top-5 flex size-7 items-center justify-center',
              'rounded-full border',
              'transition-all duration-700',

              isConverted
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                : 'border-primary/15 bg-primary/5 text-primary',

              isConverting && 'scale-125 rotate-12',
            )}
          >
            {isConverted ? <WalletCards className='size-3.5' /> : <Coins className='size-3.5' />}
          </div>

          <div
            className={cn(
              'relative flex',
              'transition-all duration-500',

              isConverted && 'translate-y-[-1px]',
            )}
          >
            <p className='text-xs text-muted-foreground'>
              {isConverted ? 'اعتبار خرید شما' : 'باشگاه مشتریان'}
            </p>
          </div>

          <div
            className={cn(
              'relative flex items-baseline justify-end gap-1.5',
              'transition-all duration-700',

              isConverting && 'scale-[1.04]',
            )}
          >
            <span
              key={isConverted ? 'credit' : 'points'}
              className={cn(
                'animate-in fade-in slide-in-from-bottom-2',
                'text-4xl font-bold tracking-tight tabular-nums',
                'duration-500',

                isConverted ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
              )}
            >
              {isConverted ? displayCredit : displayPoints}
            </span>

            <span
              className={cn(
                'text-sm text-muted-foreground',
                'transition-all duration-500',

                isConverted && 'text-emerald-700/70 dark:text-emerald-400/70',
              )}
            >
              {isConverted ? creditUnit : 'امتیاز'}
            </span>
          </div>

          <div className='relative'>
            <p
              key={isConverted ? 'converted-description' : 'points-description'}
              className={cn(
                'animate-in fade-in slide-in-from-bottom-1',
                'text-xs leading-6 text-muted-foreground',
                'duration-500',
              )}
            >
              {isConverted
                ? 'اعتبار شما با موفقیت برای خرید آماده شد.'
                : 'امتیازهای خود را به اعتبار خرید تبدیل کنید.'}
            </p>
          </div>

          {isConverted && (
            <>
              <Sparkles className='pointer-events-none absolute bottom-5 left-8 size-3 animate-success-sparkle text-emerald-500/60' />

              <Sparkles className='pointer-events-none absolute right-24 top-8 size-2.5 animate-success-sparkle-delayed text-emerald-500/40' />
            </>
          )}
        </div>

        {isConverted && (
          <div className='pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-[28px]'>
            <div className='success-flash absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent' />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes conversionBeam {
          0% {
            transform: translateX(-180%) rotate(12deg);
          }

          100% {
            transform: translateX(430%) rotate(12deg);
          }
        }

        @keyframes conversionParticle1 {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.3);
          }

          20% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translate(250px, -24px) scale(0);
          }
        }

        @keyframes conversionParticle2 {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.3);
          }

          20% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translate(210px, 35px) scale(0);
          }
        }

        @keyframes conversionParticle3 {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.3);
          }

          20% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translate(280px, -42px) scale(0);
          }
        }

        @keyframes conversionParticle4 {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.3);
          }

          20% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translate(190px, 12px) scale(0);
          }
        }

        @keyframes conversionProgress {
          0% {
            width: 0%;
          }

          100% {
            width: 100%;
          }
        }

        @keyframes successFlash {
          0% {
            transform: translateX(-180%);
          }

          100% {
            transform: translateX(500%);
          }
        }

        @keyframes successSparkle {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.8) rotate(0deg);
          }

          50% {
            opacity: 1;
            transform: scale(1.25) rotate(25deg);
          }
        }

        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .conversion-beam {
          animation: conversionBeam 1.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .conversion-particle-1 {
          animation: conversionParticle1 1.15s ease-out 0.05s forwards;
        }

        .conversion-particle-2 {
          animation: conversionParticle2 1.2s ease-out 0.12s forwards;
        }

        .conversion-particle-3 {
          animation: conversionParticle3 1.1s ease-out 0.2s forwards;
        }

        .conversion-particle-4 {
          animation: conversionParticle4 1.25s ease-out 0.08s forwards;
        }

        .animate-conversion-progress {
          animation: conversionProgress 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .success-flash {
          animation: successFlash 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }

        .animate-success-sparkle {
          animation: successSparkle 1.8s ease-in-out infinite;
        }

        .animate-success-sparkle-delayed {
          animation: successSparkle 1.8s ease-in-out 0.6s infinite;
        }

        .animate-spin-slow {
          animation: spinSlow 2.2s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .conversion-beam,
          .conversion-particle-1,
          .conversion-particle-2,
          .conversion-particle-3,
          .conversion-particle-4,
          .animate-conversion-progress,
          .success-flash,
          .animate-success-sparkle,
          .animate-success-sparkle-delayed,
          .animate-spin-slow {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
