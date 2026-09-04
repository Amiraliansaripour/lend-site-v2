'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { dirFor } from '@/i18n/routing';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';

type PageParams = Awaited<PageProps<'/[locale]'>['params']>;

// حذف opacity-80 برای جلوگیری از شفاف شدن کارت عقب
const BACK_CARD = '-rotate-6 -translate-y-4 -translate-x-6 z-0 scale-95 opacity-100';

export function WalletsDescription() {
  const { locale } = useParams<PageParams>();
  const dir = dirFor(locale);

  const [tab, setTab] = useState('credit');
  const index = tab === 'credit' ? 0 : 1;

  return (
    <section className='container grid lg:grid-cols-2 gap-x-8 gap-y-12 px-4 overflow-hidden py-8 items-center'>
      <Tabs
        dir={dir}
        value={tab}
        onValueChange={setTab}
        className='h-full flex flex-col justify-between'
      >
        <div>
          <p className='mb-2 text-xs font-medium tracking-[0.28em] text-brand/70'>WALLETS</p>
          <h3 className='mb-6 text-2xl font-bold text-[#0f172a]'>کیف پول‌های هوشمند</h3>
          <TabsList className='mb-6 h-auto rounded-xl bg-slate-100 p-1'>
            <TabsTrigger
              value='credit'
              className='rounded-lg px-4 py-2 data-[state=active]:bg-brand data-[state=active]:text-white transition-all'
            >
              کیف پول اعتباری
            </TabsTrigger>
            <TabsTrigger
              value='cash'
              className='rounded-lg px-4 py-2 data-[state=active]:bg-brand data-[state=active]:text-white transition-all'
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

      {/* بخش کارت‌ها */}
      <section className='flex items-center justify-center relative py-8'>
        <div className='relative w-full max-w-[420px] aspect-[1.58/1]'>
          {/* کارت ۱: کیف پول اعتباری */}
          <div
            onClick={() => setTab('credit')}
            className={cn(
              'absolute inset-0 rounded-2xl p-6 text-white overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer select-none border border-white/10 bg-[#1a2e8a]',
              index === 0 ? 'z-10 scale-100 rotate-0' : BACK_CARD,
            )}
          >
            <Image
              src='/images/card.png'
              alt='Card Background'
              fill
              priority
              className='object-cover pointer-events-none -z-10'
            />

            <div className='h-full flex flex-col justify-between relative z-10'>
              <div className='flex justify-between items-start'>
                <span className='text-sm font-semibold tracking-wide text-white/90'>
                  کیف پول اعتباری
                </span>
                <Image
                  src='/images/Vector.png'
                  alt='Boom Logo'
                  width={40}
                  height={40}
                  className='w-10 h-10 object-contain pointer-events-none'
                />
              </div>
            </div>
          </div>

          {/* کارت ۲: کیف پول نقدی */}
          <div
            onClick={() => setTab('cash')}
            className={cn(
              'absolute inset-0 rounded-2xl p-6 text-white overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer select-none border border-white/10 bg-[#1a2e8a]',
              index === 1 ? 'z-10 scale-100 rotate-0' : BACK_CARD,
            )}
          >
            <Image
              src='/images/card.png'
              alt='Card Background'
              fill
              priority
              className='object-cover pointer-events-none -z-10'
            />

            <div className='h-full flex flex-col justify-between relative z-10'>
              <div className='flex justify-between items-start'>
                <span className='text-sm font-semibold tracking-wide text-white/90'>
                  کیف پول نقدی
                </span>
                <Image
                  src='/images/Vector.png'
                  alt='Boom Logo'
                  width={40}
                  height={40}
                  className='w-10 h-10 object-contain pointer-events-none'
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
