'use client';

import { FileUp, BadgeCheck, Send, WalletCards } from 'lucide-react';

import { GlassPanel } from '@/components/page/landing/glass-panel';
import { Reveal } from '@/components/page/landing/reveal';
import { SectionHeading } from '@/components/page/landing/section-heading';
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
          eyebrow='فرآیند'
          title={withBrand('مسیر دریافت اعتبار در کارالند')}
          description='چهار ایستگاه شفاف تا فعال‌شدن اعتبار خرید—بدون مراجعه حضوری.'
        />
      </Reveal>

      <div className='relative grid gap-4 lg:grid-cols-4'>
        <div
          className='pointer-events-none absolute top-16 right-8 left-8 hidden h-px bg-linear-to-l from-transparent via-gold/50 to-transparent lg:block'
          aria-hidden
        />
        {STEPS.map(({ title, description, icon: Icon }, index) => (
          <Reveal key={title} delayMs={index * 80}>
            <GlassPanel className='relative h-full overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1'>
              <div className='mb-6 flex items-center justify-between'>
                <span className='flex size-12 items-center justify-center rounded-2xl bg-gold text-navy'>
                  <Icon className='size-5 stroke-[1.5]' />
                </span>
                <span className='text-3xl font-bold tabular-nums text-navy/15 dark:text-gold/35'>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className='text-lg font-semibold text-navy dark:text-white'>{title}</h3>
              <p className='mt-2 text-sm leading-7 text-navy/60 dark:text-white/60'>
                {description}
              </p>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
