'use client';

import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/page/landing/reveal';
import { useSiteTemplate } from '@/providers/site-template';

/** YourBank closing CTA band. */
export function LandingCta() {
  const { brandName, withBrand } = useSiteTemplate();

  return (
    <Reveal>
      <section className='mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
        <div className='relative flex flex-col items-center gap-6 overflow-hidden rounded-xl bg-navy px-8 py-12 text-center md:flex-row md:justify-between md:px-12 md:text-right'>
          <div
            className='pointer-events-none absolute inset-0 opacity-40'
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 0% 0%, color-mix(in lab, var(--gold) 25%, transparent), transparent 50%)',
            }}
          />
          <div className='relative z-10 max-w-2xl space-y-3'>
            <h2 className='text-2xl font-semibold text-white md:text-3xl'>
              مسیر مالی‌تان را امروز با <span className='text-gold'>{brandName}</span> شروع کنید
            </h2>
            <p className='leading-8 text-white/55'>
              {withBrand(
                'کلید دسترسی به خرید اقساطی شفاف. درخواست اعتبار را ثبت کنید و در چند مرحله آنلاین، کیف پول اعتباری خود را فعال کنید.',
              )}
            </p>
          </div>
          <Link
            href='/requests'
            className='relative z-10 inline-flex shrink-0 items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gold/90'
          >
            درخواست اعتبار
          </Link>
        </div>
      </section>
    </Reveal>
  );
}
