'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { dirFor } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { BoomLogo } from '@/components/brand/boom-logo';
import { normalizeToPersianDigits } from '@/utils/normalize';
import { formatNumber } from '@/utils/format';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';

type PageParams = Awaited<PageProps<'/[locale]'>['params']>;

type WalletKind = 'credit' | 'cash';

const WALLET_COPY: Record<
  WalletKind,
  {
    title: string;
    description: string;
    amount: number;
    amountLabel: string;
  }
> = {
  credit: {
    title: 'کیف پول اعتباری',
    description:
      'این سرویس برای کسانی مناسب است که می‌خواهند هزینه خرید خود را در آینده و به صورت اقساطی پرداخت کنند. با استفاده از این کیف پول می‌توانید نسبت به دریافت اعتبار بانکی اقدام نمایید و پس از خرید از فروشگاه‌های طرف قرارداد، اقساط تسهیلات خود را به صورت ماهیانه و در بلندمدت پرداخت کنید.',
    amount: 90_000_000,
    amountLabel: 'اعتبار قابل استفاده',
  },
  cash: {
    title: 'کیف پول نقدی',
    description:
      'این سرویس برای کسانی مناسب است که می‌خواهند در هنگام خرید نقدی تخفیف بگیرند. با شارژ نقدی این کیف پول به هر میزان، همان لحظه ۳ درصد به موجودی کیف پول شما اضافه می‌شود و می‌توانید از تمامی فروشگاه‌های طرف قرارداد خرید کنید.',
    amount: 45_000_000,
    amountLabel: 'موجودی قابل استفاده',
  },
};

function CardCircles() {
  return (
    <div aria-hidden className='pointer-events-none absolute inset-0 overflow-hidden'>
      <div className='absolute -left-10 -top-12 size-44 rounded-full border border-white/20' />
      <div className='absolute left-4 top-6 size-28 rounded-full border border-white/15' />
      <div className='absolute -right-14 -bottom-20 size-56 rounded-full border border-white/15' />
      <div className='absolute right-10 -bottom-4 size-36 rounded-full border border-white/20' />
      <div className='absolute left-[38%] top-[28%] size-24 rounded-full border border-white/10' />
    </div>
  );
}

export function WalletsDescription() {
  const { locale } = useParams<PageParams>();
  const dir = dirFor(locale);

  const [tab, setTab] = useState<WalletKind>('credit');
  const copy = WALLET_COPY[tab];

  return (
    <section
      dir='ltr'
      className='container grid items-center gap-x-10 gap-y-12 overflow-hidden px-4 py-8 lg:grid-cols-2'
    >
      <Tabs
        dir={dir}
        value={tab}
        onValueChange={value => setTab(value as WalletKind)}
        className='order-1 flex h-full flex-col justify-center'
      >
        <TabsList className='mb-6 h-auto w-fit gap-2 rounded-none bg-transparent p-0'>
          <TabsTrigger
            value='credit'
            className='rounded-full border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm text-[#334155] shadow-none transition-all data-[state=active]:border-brand data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-none'
          >
            کیف پول اعتباری
          </TabsTrigger>
          <TabsTrigger
            value='cash'
            className='rounded-full border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm text-[#334155] shadow-none transition-all data-[state=active]:border-brand data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-none'
          >
            کیف پول نقدی
          </TabsTrigger>
        </TabsList>

        <TabsContent value='credit' className='mt-0'>
          <p
            dir='rtl'
            className='max-w-xl text-right text-sm leading-8 text-[#475569] sm:text-base'
          >
            {WALLET_COPY.credit.description}
          </p>
        </TabsContent>

        <TabsContent value='cash' className='mt-0'>
          <p
            dir='rtl'
            className='max-w-xl text-right text-sm leading-8 text-[#475569] sm:text-base'
          >
            {WALLET_COPY.cash.description}
          </p>
        </TabsContent>
      </Tabs>

      <section className='relative order-2 flex items-center justify-center py-8'>
        <div className='relative aspect-[1.58/1] w-full max-w-110'>
          {/* Back plate */}
          <div
            aria-hidden
            className='absolute inset-0 -translate-x-7 -translate-y-6 -rotate-6 rounded-3xl bg-[#3d74d9] shadow-lg'
          />

          {/* Front card */}
          <div
            className={cn(
              'relative z-10 flex h-full flex-col justify-between overflow-hidden rounded-3xl p-6 text-white',
              'shadow-[0_28px_60px_-18px_rgba(12,40,120,0.55)]',
            )}
            style={{
              background: 'linear-gradient(125deg, #0a2d86 0%, #1649b5 48%, #2b6de0 100%)',
            }}
          >
            <CardCircles />

            <div className='relative z-10 flex items-start justify-between gap-3'>
              <span className='text-sm font-semibold tracking-wide text-white/95'>
                {copy.title}
              </span>
              <BoomLogo showWordmark={false} variant='white' markClassName='size-12 sm:size-14' />
            </div>

            <div className='relative z-10 flex items-end justify-between gap-4'>
              <Link
                href='/shops'
                className='inline-flex shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#0f172a] transition-colors hover:bg-white/90'
              >
                مشاهده و خرید
              </Link>

              <div className='text-right'>
                <div className='text-lg font-bold leading-none sm:text-xl'>
                  {normalizeToPersianDigits(formatNumber(copy.amount, { int: true }))} ریال
                </div>
                <div className='mt-1.5 text-xs text-white/75'>{copy.amountLabel}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
