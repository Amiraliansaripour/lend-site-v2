'use client';

import { useState } from 'react';
import { CreditCard, Headphones, Wallet } from 'lucide-react';

import { Accent, SectionHeading } from '@/components/page/landing/section-heading';
import { Reveal } from '@/components/page/landing/reveal';
import { useSiteTemplate } from '@/providers/site-template';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'credit', label: 'کیف پول اعتباری', icon: CreditCard },
  { id: 'cash', label: 'کیف پول نقدی', icon: Wallet },
  { id: 'support', label: 'پشتیبانی', icon: Headphones },
] as const;

type TabId = (typeof TABS)[number]['id'];

const FEATURES: Record<TabId, { title: string; description: string }[]> = {
  credit: [
    {
      title: 'خرید اقساطی',
      description:
        'پس از دریافت اعتبار بانکی، از فروشگاه‌های طرف قرارداد خرید کنید و اقساط را ماهانه تسویه نمایید.',
    },
    {
      title: 'سقف شفاف',
      description: 'میزان اعتبار و شرایط بازپرداخت را قبل از ثبت درخواست ببینید و انتخاب کنید.',
    },
    {
      title: 'بدون ضامن',
      description: 'تنها با چک صیادی مسیر اعتبار را شروع کنید—بدون ضامن و بدون مراجعه حضوری.',
    },
    {
      title: 'کیف پول یکپارچه',
      description:
        'اعتبار در کیف پول شما شارژ می‌شود و خرید آنلاین یا حضوری از شبکه فروشگاهی ممکن است.',
    },
  ],
  cash: [
    {
      title: 'شارژ با پاداش',
      description: 'با شارژ نقدی کیف پول، همان لحظه ۳٪ به موجودی اضافه می‌شود.',
    },
    {
      title: 'خرید آنی',
      description: 'مناسب کسانی که می‌خواهند نقدی بخرند و از تخفیف آنی بهره‌مند شوند.',
    },
    {
      title: 'شبکه فروشگاهی',
      description: 'از تمامی فروشگاه‌های طرف قرارداد با موجودی نقدی خرید کنید.',
    },
    {
      title: 'مدیریت ساده',
      description: 'موجودی، تراکنش‌ها و وضعیت کیف پول را در یک داشبورد ببینید.',
    },
  ],
  support: [
    {
      title: 'راهنمای گام‌به‌گام',
      description: 'از ثبت درخواست تا شارژ اعتبار، مسیر را با راهنما و پشتیبانی طی کنید.',
    },
    {
      title: 'پاسخگویی شفاف',
      description: 'سوالات متداول و تیم پشتیبانی برای روشن‌شدن هر ابهام در مسیر اعتبار.',
    },
    {
      title: 'پیگیری وضعیت',
      description: 'وضعیت درخواست، مدارک و اعتبار خود را در پنل کاربری دنبال کنید.',
    },
    {
      title: 'امنیت اطلاعات',
      description: 'فرآیندها مطابق مقررات بانکی و حریم خصوصی طراحی شده‌اند.',
    },
  ],
};

/** YourBank OurFeatures: sidebar tabs + feature cards grid. */
export function WalletsDescription() {
  const { withBrand } = useSiteTemplate();
  const [tab, setTab] = useState<TabId>('credit');

  return (
    <section className='mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
      <Reveal>
        <SectionHeading
          title={
            <>
              ویژگی‌های <Accent>ما</Accent>
            </>
          }
          description={withBrand(
            'ابزارهایی که تجربه اعتبار و خرید در کارالند را ساده، شفاف و قابل کنترل می‌کنند.',
          )}
        />
      </Reveal>

      <Reveal delayMs={80}>
        <div className='flex flex-col gap-4 lg:flex-row'>
          <div className='flex h-min w-full gap-2 overflow-x-auto rounded-xl border border-navy/10 bg-navy/[0.03] p-3 lg:max-w-fit lg:flex-col dark:border-white/10 dark:bg-white/[0.03]'>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type='button'
                onClick={() => setTab(id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors lg:w-full',
                  tab === id
                    ? 'border-navy/15 bg-white text-brand shadow-sm dark:border-white/15 dark:bg-white/10 dark:text-gold'
                    : 'border-transparent text-navy/60 hover:bg-white/60 dark:text-white/55 dark:hover:bg-white/5',
                )}
              >
                <Icon className='size-4' strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>

          <div className='grid w-full gap-3 sm:grid-cols-2'>
            {FEATURES[tab].map(feature => (
              <article
                key={feature.title}
                className='group relative rounded-xl border border-navy/10 bg-white p-6 transition-colors hover:border-navy/20 dark:border-white/10 dark:bg-white/[0.04]'
              >
                <h3 className='mb-4 pe-6 text-lg font-semibold text-navy dark:text-white'>
                  {feature.title}
                </h3>
                <p className='leading-7 text-navy/55 dark:text-white/55'>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
