'use client';

import { FileUp, BadgeCheck, Send, WalletCards } from 'lucide-react';

import { Accent, SectionHeading } from '@/components/page/landing/section-heading';
import { Reveal } from '@/components/page/landing/reveal';
import { useSiteTemplate } from '@/providers/site-template';

const STEPS = [
  {
    title: 'ثبت درخواست',
    description: 'مبلغ و طرح اعتباری خود را انتخاب کنید و درخواست را ثبت نمایید.',
    icon: WalletCards,
  },
  {
    title: 'آپلود مدارک',
    description: 'مدارک شناسایی و تضامین را به‌صورت کاملاً آنلاین بارگذاری کنید.',
    icon: FileUp,
  },
  {
    title: 'ارسال چک',
    description: 'در صورت نیاز، نسخه فیزیکی چک صیادی را برای ما ارسال کنید.',
    icon: Send,
  },
  {
    title: 'شارژ اعتبار',
    description: 'پس از تأیید، کیف پول اعتباری شما شارژ می‌شود و خرید را شروع کنید.',
    icon: BadgeCheck,
  },
] as const;

export function LoanRequestSteps() {
  const { withBrand } = useSiteTemplate();

  return (
    <section className='mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
      <Reveal>
        <SectionHeading
          title={
            <>
              مسیر دریافت <Accent>اعتبار</Accent>
            </>
          }
          description={withBrand(
            'چهار ایستگاه شفاف تا فعال‌شدن اعتبار خرید در کارالند—بدون مراجعه حضوری.',
          )}
        />
      </Reveal>

      <div className='relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {STEPS.map(({ title, description, icon: Icon }, index) => (
          <Reveal key={title} delayMs={index * 70}>
            <article className='relative h-full rounded-xl border border-navy/10 bg-white p-5 transition-colors hover:border-navy/20 dark:border-white/10 dark:bg-white/[0.04]'>
              <div className='mb-6 flex items-center justify-between'>
                <span className='flex size-11 items-center justify-center rounded-full bg-gold/15 text-navy dark:text-gold'>
                  <Icon className='size-5' strokeWidth={1.5} />
                </span>
                <span className='text-3xl font-bold tabular-nums text-navy/10 dark:text-white/15'>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className='text-lg font-semibold text-navy dark:text-white'>{title}</h3>
              <p className='mt-2 text-sm leading-7 text-navy/55 dark:text-white/55'>
                {description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
