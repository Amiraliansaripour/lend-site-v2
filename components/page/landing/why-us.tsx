'use client';

import { ShieldCheck, Zap, Store, MapPin } from 'lucide-react';

import { useSiteTemplate } from '@/providers/site-template';

const FEATURES = [
  {
    title: 'بدون نیاز به ضامن',
    description: 'دریافت اعتبار خرید تنها با ارائه یک برگ چک صیادی',
    Icon: ShieldCheck,
  },
  {
    title: 'فرآیند سریع و آسان',
    description: 'تنها طی بیست دقیقه با طی چند مرحله کاملا آنلاین',
    Icon: Zap,
  },
  {
    title: 'تنوع بالای فروشگاه‌ها',
    description: 'خرید انواع کالاها و خدمات از گسترده بالای فروشگاه های اینترنتی',
    Icon: Store,
  },
  {
    title: 'بدون محدودیت جغرافیایی',
    description: 'امکان ثبت درخواست و خرید از هر نقطه ایران',
    Icon: MapPin,
  },
] as const;

export function WhyUs() {
  const { withBrand } = useSiteTemplate();

  return (
    <section className='container'>
      <div className='mb-12 flex flex-col items-center gap-y-4 text-center md:mb-16'>
        <p className='text-xs font-medium tracking-[0.28em] text-brand/70'>WHY US</p>
        <h3 className='text-2xl font-bold text-[#0f172a] md:text-3xl'>
          {withBrand('چرا کارالند؟')}
        </h3>
        <p className='max-w-2xl text-base leading-8 text-[#64748b]'>
          {withBrand(
            'در کارالند مسیر دریافت اعتبار بانکی به شکلی ساده، سریع و شفاف طراحی شده تا همه بتوانند بدون پیچیدگی‌های رایج بانکی از آن استفاده کنند.',
          )}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6'>
        {FEATURES.map(({ title, description, Icon }) => (
          <article
            key={title}
            className='flex flex-col items-center rounded-2xl border border-brand/10 bg-white p-6 text-center transition-all hover:border-brand/25 hover:shadow-[0_12px_40px_-16px_rgba(0,85,255,0.2)] md:p-8'
          >
            <div className='mb-5 flex size-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_24px_-8px_rgba(0,85,255,0.5)]'>
              <Icon className='size-7' strokeWidth={1.75} />
            </div>
            <h4 className='mb-3 text-lg font-bold text-[#0f172a]'>{title}</h4>
            <p className='max-w-xs text-sm leading-7 text-[#64748b]'>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
