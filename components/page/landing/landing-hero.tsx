'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useSiteTemplate } from '@/providers/site-template';
import { cn } from '@/lib/utils';

export function LandingHero() {
  const { getImageUrl, brandName, withBrand } = useSiteTemplate();
  const desktopBanner = getImageUrl('homeBanner');

  return (
    <section className='relative overflow-hidden mb-16 md:mb-24'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#dbeafe_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#eff6ff_0%,transparent_50%)]'
      />
      <div className='container relative py-14 md:py-20 lg:py-24'>
        <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-16'>
          <div className='flex flex-col items-start gap-6 text-right'>
            <span className='rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-medium text-brand'>
              {withBrand('پلتفرم اعتباری هوشمند')}
            </span>
            <h1 className='text-3xl font-bold leading-tight text-[#0f172a] md:text-4xl lg:text-5xl'>
              {withBrand('اعتباری که می‌شود به آن اعتماد کرد')}
            </h1>
            <p className='max-w-xl text-base leading-8 text-[#64748b] md:text-lg'>
              {withBrand(
                'در کارالند مسیر دریافت اعتبار بانکی به شکلی ساده، سریع و شفاف طراحی شده تا بتوانید بدون پیچیدگی‌های رایج بانکی از آن استفاده کنید.',
              )}
            </p>
            <div className='flex flex-wrap items-center gap-3'>
              <Link
                href='/requests'
                className='inline-flex h-12 min-w-40 items-center justify-center rounded-xl bg-brand px-8 text-sm font-medium text-white transition-colors hover:bg-brand/90 md:h-14 md:text-base'
              >
                درخواست اعتبار
              </Link>
              <Link
                href='/shops'
                className='inline-flex h-12 items-center justify-center rounded-xl border border-brand/25 bg-white px-8 text-sm font-medium text-brand transition-colors hover:bg-brand/5 md:h-14 md:text-base'
              >
                مشاهده فروشگاه‌ها
              </Link>
            </div>
          </div>

          <div className='relative mx-auto w-full max-w-xl lg:max-w-none'>
            <div
              aria-hidden
              className='absolute -inset-4 rounded-[2rem] bg-brand/10 blur-2xl md:-inset-6'
            />
            {desktopBanner ? (
              <Image
                src={desktopBanner}
                alt={`${brandName} banner`}
                width={720}
                height={480}
                unoptimized
                priority
                className={cn(
                  'relative w-full rounded-2xl object-cover shadow-[0_24px_60px_-24px_rgba(0,85,255,0.35)]',
                  'aspect-[4/3]',
                )}
              />
            ) : (
              <div className='relative flex aspect-[4/3] items-center justify-center rounded-2xl bg-linear-to-br from-brand/15 to-brand/5 shadow-[0_24px_60px_-24px_rgba(0,85,255,0.25)]'>
                <BoomPercentMark className='scale-150 opacity-80' />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BoomPercentMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <span className='text-6xl font-black leading-none text-brand md:text-7xl'>%</span>
    </div>
  );
}
