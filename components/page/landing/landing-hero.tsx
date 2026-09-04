'use client';

import { Link } from '@/i18n/navigation';
import { useSiteTemplate } from '@/providers/site-template';

/** Light landing hero — no banner image (Figma has no banner). */
export function LandingHero() {
  const { withBrand } = useSiteTemplate();

  return (
    <section className='relative overflow-hidden'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#dbeafe_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#eff6ff_0%,transparent_50%)]'
      />
      <div className='container relative flex flex-col items-center py-16 text-center md:py-24 lg:py-28'>
        <h1 className='max-w-3xl text-3xl font-bold leading-tight text-[#0f172a] md:text-4xl lg:text-5xl'>
          {withBrand('اعتباری که می‌شود به آن اعتماد کرد')}
        </h1>
        <p className='mt-5 max-w-2xl text-base leading-8 text-[#64748b] md:text-lg'>
          {withBrand(
            'در کارالند مسیر دریافت اعتبار بانکی به شکلی ساده، سریع و شفاف طراحی شده تا بتوانید بدون پیچیدگی‌های رایج بانکی از آن استفاده کنید.',
          )}
        </p>
        <Link
          href='/requests'
          className='mt-8 inline-flex h-12 min-w-44 items-center justify-center rounded-xl bg-brand px-8 text-sm font-medium text-white transition-colors hover:bg-brand/90 md:h-14 md:text-base'
        >
          درخواست اعتبار
        </Link>
      </div>
    </section>
  );
}
