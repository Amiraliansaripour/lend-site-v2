'use client';

import { CreditCard, ShieldCheck, Store, Zap } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { useSiteTemplate } from '@/providers/site-template';
import { cn } from '@/lib/utils';

/**
 * YourBank-inspired hero: brand-led copy + one product panel.
 * Light-first, navy/gold, RTL — no carousel, no floating overlay chips.
 */
export function HeroSection({ className }: { className?: string }) {
  const { brandName, withBrand } = useSiteTemplate();
  const year = String(new Date().getFullYear()).slice(-2);

  return (
    <section
      className={cn(
        'relative mx-auto max-w-6xl overflow-hidden px-4 pt-28 pb-16 md:px-6 md:pt-32 md:pb-20 lg:px-10',
        className,
      )}
    >
      {/* Subtle abstract dots — YourBank top-left motif */}
      <div
        className='pointer-events-none absolute top-16 right-0 size-48 opacity-40 md:size-64'
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle, color-mix(in lab, var(--navy) 18%, transparent) 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
        }}
      />

      <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        <div className='landing-hero-copy flex flex-col items-center gap-8 text-center lg:items-start lg:text-right'>
          <p className='text-sm font-medium tracking-wide text-navy/50 dark:text-white/50'>
            {brandName}
          </p>

          <div className='flex flex-col gap-5'>
            <h1 className='text-3xl font-medium text-balance text-navy md:text-5xl dark:text-white'>
              {withBrand('به کارالند خوش آمدید')}
              <br />
              مسیر مالی <span className='font-semibold text-brand dark:text-gold'>شفاف و سریع</span>
            </h1>
            <p className='max-w-lg leading-8 text-navy/55 dark:text-white/55'>
              {withBrand(
                'بدون ضامن و بدون مراجعه حضوری، اعتبار خرید اقساطی را آنلاین بگیرید و از فروشگاه‌های طرف قرارداد کارالند خرید کنید.',
              )}
            </p>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-3 lg:justify-start'>
            <Link
              href='/requests'
              className='inline-flex items-center justify-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gold/90'
            >
              شروع درخواست اعتبار
            </Link>
            <Link
              href='#calculator'
              className='inline-flex items-center justify-center rounded-full border border-navy/15 px-7 py-3 text-sm font-medium text-navy transition-colors hover:bg-navy/5 dark:border-white/20 dark:text-white dark:hover:bg-white/5'
            >
              محاسبه اقساط
            </Link>
          </div>
        </div>

        <div className='landing-hero-visual relative mx-auto w-full max-w-md lg:mx-0 lg:ms-auto'>
          <div className='relative overflow-hidden rounded-xl border border-navy/10 bg-navy p-5 text-white sm:p-6 dark:border-white/10'>
            <div
              className='pointer-events-none absolute inset-0 opacity-30'
              aria-hidden
              style={{
                backgroundImage:
                  'radial-gradient(circle at 80% 20%, color-mix(in lab, var(--gold) 35%, transparent), transparent 45%)',
              }}
            />

            <div className='relative z-10'>
              <div className='flex items-center justify-between gap-3'>
                <span className='text-sm text-white/55'>اعتبار قابل استفاده</span>
                <CreditCard className='size-5 text-gold' strokeWidth={1.5} aria-hidden />
              </div>

              <p className='mt-6 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl'>
                ۷۵,۰۰۰,۰۰۰
                <span className='ms-2 text-base font-medium text-white/45'>ریال</span>
              </p>

              <div className='mt-8 space-y-3'>
                {[
                  { icon: ShieldCheck, label: 'بدون ضامن — فقط چک صیادی' },
                  { icon: Zap, label: 'فرآیند کاملاً آنلاین' },
                  { icon: Store, label: 'خرید از فروشگاه‌های طرف قرارداد' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className='flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5'
                  >
                    <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold'>
                      <Icon className='size-4' strokeWidth={1.5} />
                    </span>
                    <span className='text-sm text-white/80'>{label}</span>
                  </div>
                ))}
              </div>

              <div className='mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/40'>
                <span>{brandName}</span>
                <span className='tabular-nums'>۲۰{year} · اعتبار خرید</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
