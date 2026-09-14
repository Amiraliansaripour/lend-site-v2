'use client';

import { FileText, Handshake, Plug, ShoppingBag } from 'lucide-react';

import { useSiteTemplate } from '@/providers/site-template';

const PROCESS_STEPS = [
  {
    step: 1,
    title: 'ثبت درخواست اولیه',
    Icon: FileText,
    description: 'فرم ثبت فروشگاه را کامل کنید، تا در کوتاه ترین زمان ممکن با شما تماس بگیریم.',
  },
  {
    step: 2,
    title: 'انعقاد قرارداد',
    Icon: Handshake,
    description: 'پس از بررسی و امضای تفاهم نامه، فرآیند عملیاتی آغاز می‌شود.',
  },
  {
    step: 3,
    title: 'اتصال به درگاه پرداخت',
    Icon: Plug,
    description:
      'کیف پول بوم آپ با استفاده از وب‌سرویس به سایت یا پایانه فروشگاهی شما متصل می‌شود.',
  },
  {
    step: 4,
    title: 'آغاز فروش اقساطی',
    Icon: ShoppingBag,
    description: 'فروش اقساطی از طریق کیف پول بوم آپ اجرایی می‌شود.',
  },
];

export function MerchantSignupProcess() {
  const { withBrand } = useSiteTemplate();

  return (
    <div className='w-full bg-white py-12 md:py-16'>
      <div className='container mb-12 flex flex-col items-center px-4 text-center'>
        <p className='mb-3 text-xs font-medium tracking-[0.28em] text-brand/70'>PROCESS</p>
        <div className='mb-4 text-2xl font-bold text-[#0f172a] md:text-3xl'>
          فرآیند همکاری و ثبت فروشگاه
        </div>
        <div className='max-w-[720px] text-base leading-8 text-[#64748b]'>
          با طی کردن چند مرحله ساده، می‌توانید فروش اقساطی خود را آغاز نمایید.
        </div>
      </div>

      <div className='container'>
        <div className='relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          <div
            aria-hidden
            className='pointer-events-none absolute top-10 right-16 left-16 hidden h-px bg-brand/20 lg:block'
          />
          {PROCESS_STEPS.map(step => (
            <div key={step.step} className='relative flex flex-col items-center text-center'>
              <div className='relative z-10 mb-5 flex size-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_24px_-8px_rgba(0,85,255,0.5)]'>
                <step.Icon className='size-7' strokeWidth={1.75} />
                <span className='absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-white text-xs font-bold text-brand'>
                  {step.step.toLocaleString('fa')}
                </span>
              </div>
              <h3 className='mb-2 text-lg font-bold text-[#0f172a]'>{step.title}</h3>
              <p className='max-w-xs text-sm leading-7 text-[#64748b]'>
                {withBrand(step.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
