'use client';

import Image from 'next/image';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { dirFor } from '@/i18n/routing';

import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { useSiteTemplate } from '@/providers/site-template';

type PageParams = Awaited<PageProps<'/[locale]'>['params']>;

const BACK_CARD =
  '-rotate-z-10 sm:-rotate-z-20 -translate-y-5 scale-90 -translate-x-24 z-0 opacity-75';

export function WalletsDescription() {
  const { locale } = useParams<PageParams>();
  const dir = dirFor(locale);
  const { getImageUrl } = useSiteTemplate();
  const creditCardUrl = getImageUrl('creditCard');
  const cashCardUrl = getImageUrl('cashCard');

  const [tab, setTab] = useState('credit');
  const index = tab === 'credit' ? 0 : 1;

  return (
    <section className='container grid lg:grid-cols-2 gap-x-8 gap-y-12 px-0 overflow-hidden py-4'>
      <Tabs
        dir={dir}
        value={tab}
        onValueChange={setTab}
        className='h-full flex flex-col justify-between'
      >
        <div>
          <p className='mb-2 text-xs font-medium tracking-[0.28em] text-brand/70'>WALLETS</p>
          <h3 className='mb-6 text-2xl font-bold text-[#0f172a]'>کیف پول‌های هوشمند</h3>
          <TabsList className='mb-6 h-auto rounded-xl bg-boom-blue-light p-1'>
            <TabsTrigger
              value='credit'
              className='rounded-lg px-4 py-2 data-[state=active]:bg-brand data-[state=active]:text-white'
            >
              کیف پول اعتباری
            </TabsTrigger>
            <TabsTrigger
              value='cash'
              className='rounded-lg px-4 py-2 data-[state=active]:bg-brand data-[state=active]:text-white'
            >
              کیف پول نقدی
            </TabsTrigger>
          </TabsList>

          <TabsContent value='credit' className='mt-0'>
            <p className='leading-8 text-[#64748b]'>
              این سرویس برای کسانی مناسب است که می‌خواهند هزینه خرید خود را در آینده و به صورت
              اقساطی پرداخت کنند. با استفاده از این کیف پول می‌توانید نسبت به دریافت اعتبار بانکی
              اقدام نمایید و پس از خرید از فروشگاه‌های طرف قرارداد، اقساط تسهیلات خود را به صورت
              ماهیانه و در بلندمدت پرداخت کنید.
            </p>
          </TabsContent>

          <TabsContent value='cash' className='mt-0'>
            <p className='leading-8 text-[#64748b]'>
              این سرویس برای کسانی مناسب است که می‌خواهند در هنگام خرید نقدی تخفیف بگیرند. با شارژ
              نقدی این کیف پول به هر میزان، همان لحظه ۳ درصد به موجودی کیف پول شما اضافه می‌شود و
              می‌توانید از تمامی فروشگاه‌های طرف قرارداد خرید کنید.
            </p>
          </TabsContent>
        </div>

        <TabsList asChild>
          <div className='mt-8 flex gap-2'>
            <TabsTrigger asChild value='credit'>
              <button
                type='button'
                className='rounded-full border border-brand/20 p-2.5 text-brand transition-colors hover:bg-brand/5'
              >
                <ArrowRight className='w-4' />
              </button>
            </TabsTrigger>
            <TabsTrigger asChild value='cash'>
              <button
                type='button'
                className='rounded-full border border-brand/20 p-2.5 text-brand transition-colors hover:bg-brand/5'
              >
                <ArrowLeft className='w-4' />
              </button>
            </TabsTrigger>
          </div>
        </TabsList>
      </Tabs>

      <section className='flex items-center justify-center lg:pl-16 mt-8 lg:mt-0'>
        <section className='stack -mr-34 md:-mr-45 lg:mr-0'>
          <div
            onClick={() => setTab('credit')}
            className={cn(
              'w-46 lg:w-60 origin-bottom-left transition-all duration-500 cursor-pointer',
              index === 0 ? 'z-10' : BACK_CARD,
            )}
          >
            {creditCardUrl ? (
              <Image
                alt='credit card'
                width={200}
                height={400}
                src={creditCardUrl}
                unoptimized
                className='size-full object-cover select-none pointer-events-none'
              />
            ) : null}
          </div>
          <div
            onClick={() => setTab('cash')}
            className={cn(
              'w-46 lg:w-60 origin-bottom-left transition-all duration-500 cursor-pointer',
              index === 1 ? 'z-10' : BACK_CARD,
            )}
          >
            {cashCardUrl ? (
              <Image
                alt='cash card'
                width={200}
                height={400}
                src={cashCardUrl}
                unoptimized
                className='size-full object-cover select-none pointer-events-none'
              />
            ) : null}
          </div>
        </section>
      </section>
    </section>
  );
}
