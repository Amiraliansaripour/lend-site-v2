'use client';

import Image from 'next/image';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { dirFor } from '@/i18n/routing';

import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';

import CashCard from '@/assets/images/cashcard.png';
import CreditCard from '@/assets/images/creditcard.png';

type PageParams = Awaited<PageProps<'/[locale]'>['params']>;

const BACK_CARD =
  '-rotate-z-10 sm:-rotate-z-20 -translate-y-5 scale-90 -translate-x-24 z-0 opacity-75';

export function WalletsDescription() {
  const { locale } = useParams<PageParams>();
  const dir = dirFor(locale);

  const [tab, setTab] = useState('credit');
  const index = tab === 'credit' ? 0 : 1;

  return (
    <section className='container grid lg:grid-cols-2 gap-x-4 px-0 overflow-hidden'>
      <Tabs dir={dir} value={tab} onValueChange={setTab} className='h-full justfiy-between'>
        <TabsList>
          <TabsTrigger value='credit'>کیف پول اعتباری</TabsTrigger>
          <TabsTrigger value='cash'>کیف پول نقدی</TabsTrigger>
        </TabsList>

        <TabsContent value='credit' className='mt-6'>
          <p className='leading-7'>
            این سرویس برای کسانی مناسب است که می‌خواهند هزینه خرید خود را در آینده و به صورت اقساطی
            پرداخت کنند. با استفاده از این کیف پول می‌توانید نسبت به دریافت اعتبار بانکی اقدام
            نمایید و پس از خرید از فروشگاه‌های طرف قرارداد، اقساط تسهیلات خود را به صورت ماهیانه و
            در بلندمدت پرداخت کنید.
          </p>
        </TabsContent>

        <TabsContent value='cash' className='mt-6'>
          <p className='leading-7'>
            این سرویس برای کسانی مناسب است که می‌خواهند در هنگام خرید نقدی تخفیف بگیرند. با شارژ
            نقدی این کیف پول به هر میزان، همان لحظه ۳ درصد به موجودی کیف پول شما اضافه می‌شود و
            می‌توانید از تمامی فروشگاه‌های طرف قرارداد خرید کنید.
          </p>
        </TabsContent>

        <TabsList asChild>
          <div className='self-end mt-12'>
            <TabsTrigger asChild value='credit'>
              <button type='button' className='border rounded-full p-2'>
                <ArrowRight className='w-4' />
              </button>
            </TabsTrigger>
            <TabsTrigger asChild value='cash'>
              <button type='button' className='border rounded-full p-2'>
                <ArrowLeft className='w-4' />
              </button>
            </TabsTrigger>
          </div>
        </TabsList>
      </Tabs>

      <section className='flex items-center justify-center lg:pl-40 mt-16'>
        <section className='stack -mr-34 md:-mr-45 lg:mr-0'>
          <div
            onClick={() => setTab('credit')}
            className={cn(
              'w-46 lg:w-60 origin-bottom-left transition-all duration-500 cursor-pointer',
              index === 0 ? 'z-10' : BACK_CARD,
            )}
          >
            <Image
              alt='credit card'
              width={200}
              height={400}
              src={CreditCard}
              unoptimized
              className='size-full object-cover select-none pointer-events-none'
            />
          </div>
          <div
            onClick={() => setTab('cash')}
            className={cn(
              'w-46 lg:w-60 origin-bottom-left transition-all duration-500 cursor-pointer',
              index === 1 ? 'z-10' : BACK_CARD,
            )}
          >
            <Image
              alt='cash card'
              width={200}
              height={400}
              src={CashCard}
              unoptimized
              className='size-full object-cover select-none pointer-events-none'
            />
          </div>
        </section>
      </section>
    </section>
  );
}
