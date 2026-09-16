'use client';

import { Link } from '@/i18n/navigation';
import { useSiteTemplate } from '@/providers/site-template';

/** Light landing hero — aligned with floating header design */
export function LandingHero() {
  const { withBrand } = useSiteTemplate();

  return (
    <section className='relative overflow-hidden'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#dbeafe_0%,#eff6ff_45%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--brand)_22%,transparent)_0%,transparent_60%)]'
      />

      <div className='container relative flex flex-col items-center pt-28 pb-16 text-center md:pt-36 md:pb-24 lg:pt-40 lg:pb-28'>
        <h1 className='max-w-3xl text-3xl font-extrabold leading-tight text-[#0f172a] dark:text-foreground md:text-4xl lg:text-5xl'>
          اعتباری که می‌شود به آن <span className='text-brand dark:text-[#bfdbfe]'>اعتماد</span>
          <span className='px-2'>کرد</span>
        </h1>

        <p className='mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-muted-foreground md:text-lg'>
          {withBrand(
            'در بوم آپ مسیر دریافت اعتبار بانکی به شکلی ساده، سریع و شفاف طراحی شده تا بتوانید بدون پیچیدگی‌های رایج بانکی از آن استفاده کنید.',
          )}
        </p>

        <div className='mt-8 flex items-center justify-center gap-3'>
          <Link
            href='/requests'
            className='inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 text-sm font-semibold text-white transition-colors hover:bg-brand/90 shadow-md shadow-brand/20'
          >
            درخواست اعتبار
          </Link>

          <Link
            href='/help'
            className='inline-flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white/80 px-6 text-sm font-medium text-slate-700 transition-colors hover:bg-white dark:border-border dark:bg-card/90 dark:text-foreground dark:hover:bg-card'
          >
            مراحل دریافت اعتبار
          </Link>
        </div>
      </div>
    </section>
  );
}
