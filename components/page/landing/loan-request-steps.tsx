'use client';

import { Card, CardContent, CardDescription, CardTitle } from '../../ui/card';

import StepHelpImage1 from '@/assets/images/illustrations/step1help.png';
import StepHelpImage2 from '@/assets/images/illustrations/step2help.png';
import StepHelpImage3 from '@/assets/images/illustrations/step3help.png';
import StepHelpImage4 from '@/assets/images/illustrations/step4help.png';
import Image from 'next/image';
import { useSiteTemplate } from '@/providers/site-template';

const STEPS = [
  {
    title: 'شارژ کیف پول اعتباری',
    description: 'با استفاده از اعتبار کیف پول خود از فروشگاه های طرف قرارداد خریدکنید.',
    image: StepHelpImage1,
  },
  {
    title: 'آپلود مدارک هویتی',
    description: 'پس از انجام اعتبارسنجی آنلاین مدارک شناسایی و تضامین خود رابارگذاری نمایید.',
    image: StepHelpImage2,
  },
  {
    title: 'ارسال نسخه فیزیکی چک',
    description: 'نسخه فیزیکی چک صیادی خود را در صورت لزوم برای ما ارسال نمایید.',
    image: StepHelpImage3,
  },
  {
    title: 'شارژ کیف پول اعتباری',
    description: 'با استفاده از اعتبار کیف پول خود از فروشگاه های طرف قرارداد خریدکنید.',
    image: StepHelpImage4,
  },
] as const;

export function LoanRequestSteps() {
  const { withBrand } = useSiteTemplate();

  return (
    <section className='container'>
      <div className='mb-12 flex flex-col items-center gap-y-4 text-center'>
        <p className='text-xs font-medium tracking-[0.28em] text-brand/70'>STEPS</p>
        <h3 className='text-2xl font-bold text-[#0f172a] md:text-3xl'>
          {withBrand('مراحل دریافت وام از کارالند')}
        </h3>
        <p className='max-w-xl text-base leading-8 text-[#64748b]'>
          با طی کردن چند مرحله ساده، می‌توانید وام مورد نیاز خود را به‌سرعت دریافت کنید و از مزایای
          خرید اعتباری بهره‌مند شوید.
        </p>
      </div>

      <section className='grid gap-4 sm:grid-cols-2 lg:gap-6'>
        {STEPS.map(({ title, image, description }, index) => (
          <Card
            key={index}
            className='overflow-hidden border-brand/10 bg-white boom-card-shadow gap-y-0 py-0 transition-shadow hover:shadow-[0_16px_48px_-16px_rgba(0,85,255,0.18)]'
          >
            <div className='aspect-[16/10] w-full bg-[#eef2f7]'>
              <Image
                src={image}
                alt={title}
                width={400}
                height={250}
                className='h-full w-full object-cover'
              />
            </div>
            <CardContent className='flex flex-col gap-y-3 px-5 py-6'>
              <div className='flex items-center gap-3'>
                <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white'>
                  {(index + 1).toLocaleString('fa')}
                </span>
                <CardTitle className='text-base md:text-lg'>{title}</CardTitle>
              </div>
              <CardDescription className='text-right leading-7 text-[#64748b]'>
                {description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </section>
  );
}
