'use client';

import { Link } from '@/i18n/navigation';
import { useSiteTemplate } from '@/providers/site-template';

export function MerchantSignupBanner() {
  const { withBrand } = useSiteTemplate();

  const scrollToForm = () => {
    const formSection = document.getElementById('merchant-signup-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className='relative overflow-hidden'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#dbeafe_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#eff6ff_0%,transparent_50%)]'
      />
      <div className='container relative py-16 md:py-24'>
        <div className='max-w-2xl'>
          <p className='mb-3 text-xs font-medium tracking-[0.28em] text-brand/70'>MERCHANTS</p>
          <h1 className='mb-4 text-3xl font-bold leading-tight text-[#0f172a] md:text-4xl lg:text-5xl'>
            به جمع فروشگاه‌های ما بپیوندید
          </h1>
          <p className='mb-8 max-w-xl text-base leading-8 text-[#64748b] md:text-lg'>
            {withBrand('با ثبت نام در بوم آپ، فروشگاه خود را به هزاران مشتری معرفی کنید.')}
          </p>
          <div className='flex flex-wrap gap-3'>
            <button
              type='button'
              onClick={scrollToForm}
              className='inline-flex h-12 min-w-40 items-center justify-center rounded-xl bg-brand px-8 text-sm font-medium text-white transition-colors hover:bg-brand/90 md:h-14 md:text-base'
            >
              ثبت درخواست
            </button>
            <Link
              href='/shops'
              className='inline-flex h-12 items-center justify-center rounded-xl border border-brand/25 bg-white px-8 text-sm font-medium text-brand transition-colors hover:bg-brand/5 md:h-14 md:text-base'
            >
              فروشگاه‌های فعال
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
