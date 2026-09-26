'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { CreditCard, Wallet } from 'lucide-react';

import { cn } from '@/lib/utils';
import { dirFor } from '@/i18n/routing';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { GlassPanel } from '@/components/page/landing/glass-panel';
import { Reveal } from '@/components/page/landing/reveal';
import { SectionHeading } from '@/components/page/landing/section-heading';
import { useSiteTemplate } from '@/providers/site-template';

type PageParams = Awaited<PageProps<'/[locale]'>['params']>;

export function WalletsDescription() {
  const { locale } = useParams<PageParams>();
  const dir = dirFor(locale);
  const { withBrand, brandName } = useSiteTemplate();
  const [tab, setTab] = useState('credit');

  return (
    <section className='mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
      <Reveal>
        <SectionHeading
          align='start'
          eyebrow='کیف پول'
          title={withBrand('دو مسیر برای هزینه کردن در کارالند')}
          description='اعتباری برای اقساط بلندمدت، یا نقدی برای خرید با تخفیف آنی.'
          className='mb-8'
        />
      </Reveal>

      <Reveal delayMs={80}>
        <div className='grid items-stretch gap-6 lg:grid-cols-2'>
          <GlassPanel className='p-5 sm:p-6'>
            <Tabs dir={dir} value={tab} onValueChange={setTab}>
              <TabsList className='h-11 w-full rounded-2xl border border-navy/10 bg-navy/5 p-1 dark:border-white/10 dark:bg-white/5'>
                <TabsTrigger
                  value='credit'
                  className='rounded-xl text-navy data-[state=active]:bg-gold data-[state=active]:text-navy dark:text-white/70'
                >
                  کیف پول اعتباری
                </TabsTrigger>
                <TabsTrigger
                  value='cash'
                  className='rounded-xl text-navy data-[state=active]:bg-gold data-[state=active]:text-navy dark:text-white/70'
                >
                  کیف پول نقدی
                </TabsTrigger>
              </TabsList>

              <TabsContent value='credit' className='mt-6'>
                <p className='leading-8 text-navy/65 text-pretty dark:text-white/65'>
                  مناسب کسانی که می‌خواهند هزینه خرید را به‌صورت اقساطی پرداخت کنند. پس از دریافت
                  اعتبار بانکی و خرید از فروشگاه‌های طرف قرارداد، اقساط را ماهانه تسویه کنید.
                </p>
              </TabsContent>

              <TabsContent value='cash' className='mt-6'>
                <p className='leading-8 text-navy/65 text-pretty dark:text-white/65'>
                  مناسب خرید نقدی با تخفیف. با شارژ نقدی کیف پول، همان لحظه ۳٪ به موجودی اضافه
                  می‌شود و می‌توانید از تمامی فروشگاه‌های طرف قرارداد خرید کنید.
                </p>
              </TabsContent>
            </Tabs>
          </GlassPanel>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
            <button
              type='button'
              onClick={() => setTab('credit')}
              className={cn(
                'rounded-[1.75rem] p-5 text-right transition-all duration-300',
                tab === 'credit'
                  ? 'bg-linear-to-br from-gold via-[#f0c961] to-[#e0b84a] text-navy shadow-lg shadow-gold/20'
                  : 'border border-navy/10 bg-navy/5 text-navy/70 hover:bg-navy/10 dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10',
              )}
            >
              <CreditCard className='mb-8 size-8 stroke-[1.5]' />
              <p className='text-sm opacity-70'>کیف پول</p>
              <p className='mt-1 text-xl font-bold'>اعتباری</p>
              <p className='mt-6 text-xs font-medium tracking-wide opacity-60'>
                {brandName.toUpperCase()}
              </p>
            </button>

            <button
              type='button'
              onClick={() => setTab('cash')}
              className={cn(
                'rounded-[1.75rem] p-5 text-right transition-all duration-300',
                tab === 'cash'
                  ? 'bg-linear-to-br from-gold via-[#f0c961] to-[#e0b84a] text-navy shadow-lg shadow-gold/20'
                  : 'border border-navy/10 bg-navy/5 text-navy/70 hover:bg-navy/10 dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10',
              )}
            >
              <Wallet className='mb-8 size-8 stroke-[1.5]' />
              <p className='text-sm opacity-70'>کیف پول</p>
              <p className='mt-1 text-xl font-bold'>نقدی</p>
              <p className='mt-6 text-xs font-medium tracking-wide opacity-60'>+۳٪ شارژ</p>
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
