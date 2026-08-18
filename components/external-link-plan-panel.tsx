'use client';

import { ArrowUpLeft, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExternalLinkPlanPanelProps {
  planName?: string;
  onContinue: () => void;
  className?: string;
  /** Landing calculator uses a denser card; request flow is more card-like */
  variant?: 'landing' | 'request';
}

export function ExternalLinkPlanPanel({
  planName,
  onContinue,
  className,
  variant = 'landing',
}: ExternalLinkPlanPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        variant === 'landing'
          ? 'p-4 sm:p-5 lg:p-[17px] px-4 sm:px-5 calculator-shadow h-full'
          : 'bg-card shadow-lg p-6 h-fit',
        className,
      )}
    >
      {/* Atmospheric background */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,0,0,0.06),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.04),transparent_50%)]'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute -left-16 top-10 size-40 rounded-full bg-primary/5 blur-2xl'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute -right-10 bottom-0 size-36 rounded-full bg-primary/8 blur-3xl'
      />

      <div className='relative flex flex-col h-full min-h-[320px] sm:min-h-[360px]'>
        <div className='mb-6 sm:mb-8 flex items-center justify-between gap-3'>
          <span className='inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary'>
            <Sparkles className='size-3.5' />
            لینک اختصاصی
          </span>
          {planName && (
            <span className='truncate max-w-[55%] text-xs sm:text-sm text-muted-foreground'>
              {planName}
            </span>
          )}
        </div>

        <div className='flex flex-1 flex-col items-center text-center px-2 sm:px-4'>
          {/* Portal visual */}
          <div className='relative mb-6 sm:mb-8'>
            <div
              aria-hidden
              className='absolute inset-0 -m-3 rounded-full border border-primary/10 animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_infinite]'
            />
            <div
              aria-hidden
              className='absolute inset-0 -m-6 rounded-full border border-dashed border-primary/15 animate-[spin_18s_linear_infinite]'
            />
            <div className='relative flex size-14 sm:size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)]'>
              <ExternalLink className='size-6 sm:size-7' strokeWidth={1.75} />
            </div>
          </div>

          <h3 className='text-lg sm:text-xl font-bold tracking-tight mb-2'>
            ادامه مسیر در صفحه اختصاصی
          </h3>
          <p className='text-sm sm:text-base text-muted-foreground leading-7 max-w-sm mb-6 sm:mb-8'>
            این طرح داخل سامانه محاسبه نمی‌شود. برای دریافت اعتبار، به لینک اختصاصی طرح منتقل
            می‌شوید و مسیر را آنجا ادامه می‌دهید.
          </p>

          <ol className='w-full max-w-sm space-y-2.5 text-right mb-8 sm:mb-10'>
            {[
              {
                key: 'selected',
                content: planName ? (
                  <>
                    طرح <span className='font-bold text-primary'>{planName}</span> را انتخاب
                    کرده‌اید
                  </>
                ) : (
                  'این طرح را انتخاب کرده‌اید'
                ),
              },
              {
                key: 'redirect',
                content: 'با یک کلیک به صفحه اختصاصی می‌روید',
              },
              {
                key: 'complete',
                content: 'فرآیند دریافت اعتبار را آنجا تکمیل می‌کنید',
              },
            ].map((step, index) => (
              <li
                key={step.key}
                className='flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-xs sm:text-sm'
              >
                <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground'>
                  {index + 1}
                </span>
                <span className='text-foreground/85 leading-6'>{step.content}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className='mt-auto w-full'>
          <button
            type='button'
            onClick={onContinue}
            className={cn(
              'group relative w-full overflow-hidden rounded-xl h-12 sm:h-14',
              'bg-primary text-primary-foreground font-medium text-sm sm:text-base',
              'transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]',
              'shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)]',
            )}
          >
            <span className='relative z-10 inline-flex items-center justify-center gap-2'>
              ورود به صفحه دریافت اعتبار
              <ArrowUpLeft className='size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
            </span>
            <span
              aria-hidden
              className='absolute inset-0 -translate-x-full bg-linear-to-l from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full'
            />
          </button>
          <p className='mt-3 text-center text-[11px] sm:text-xs text-muted-foreground'>
            لینک در تب جدید مرورگر باز می‌شود
          </p>
        </div>
      </div>
    </div>
  );
}
