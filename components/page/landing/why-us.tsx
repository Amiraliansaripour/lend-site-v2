'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import FirstWhyUs from '@/assets/images/slider-1.png';
import SecondWhyUs from '@/assets/images/slider-2.png';
import ThirdWhyUs from '@/assets/images/slider-3.png';
import FourthWhyUs from '@/assets/images/slider-4.png';

const SLIDES = [
  {
    title: 'بدون نیاز به ضامن',
    description: 'دریافت اعتبار خرید تنها با ارائه یک برگ چک صیادی',
    image: FirstWhyUs,
  },
  {
    title: 'فرآیند سریع و آسان',
    description: 'تنها طی بیست دقیقه با طی چند مرحله کاملا آنلاین',
    image: SecondWhyUs,
  },
  {
    title: 'تنوع بالای فروشگاه‌ها',
    description: 'خرید انواع کالاها و خدمات از گسترده بالای فروشگاه های اینترنتی',
    image: ThirdWhyUs,
  },
  {
    title: 'بدون محدودیت جغرافیایی',
    description: 'امکان ثبت درخواست و خرید از هر نقطه ایران',
    image: FourthWhyUs,
  },
] as const;

const SLIDE_COUNT = 4;

const SLIDE_STATUS = {
  current: 'z-20',
  before: 'z-10 scale-60 opacity-80 -translate-x-30',
  after: 'z-10 scale-60 opacity-80 translate-x-30',
  middle: 'z-0 scale-50 opacity-80 translate-x-0',
} as const;

function WhyUsMobile() {
  const [index, setIndex] = useState<number>(0);

  const before = (SLIDE_COUNT + (index - 1)) % SLIDE_COUNT;
  const middle = (SLIDE_COUNT + (index - 2)) % SLIDE_COUNT;
  const after = (SLIDE_COUNT + (index + 1)) % SLIDE_COUNT;

  const statusByIndex = {
    [after]: 'after',
    [before]: 'before',
    [middle]: 'middle',
    [index]: 'current',
  } as const;

  const rotateIndex = () => {
    setIndex(prevIndex => (prevIndex + 1) % SLIDE_COUNT);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      rotateIndex();
    }, 3_000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='block lg:hidden'>
      <section className='stack gap-4'>
        {SLIDES.map(({ title, description, image }, index) => {
          const status = statusByIndex[index];
          const statusClass = SLIDE_STATUS[status];

          return (
            <article
              key={index}
              className={cn(
                'w-60 h-80 stack transition-all duration-300 ease-in-out overflow-hidden rounded-xl mx-auto',
                statusClass,
              )}
            >
              <Image
                width={350}
                height={350}
                alt='banner'
                src={image}
                className='size-full object-cover'
              />
              <div
                className={cn(
                  'size-full inset-0 bg-black/15 backdrop-blur-md text-white z-10 transition-opacity p-4',
                  status === 'current' ? 'opacity-100' : 'opacity-0',
                )}
              >
                <hgroup className='flex flex-col items-center justify-center gap-3 size-full'>
                  <h4 className='text-lg font-bold'>{title}</h4>
                  <p className='max-w-52 text-center leading-7 text-pretty'>{description}</p>
                </hgroup>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function WhyUsDesktop() {
  return (
    <div className='hidden lg:block'>
      <section className='flex space-between gap-4'>
        {SLIDES.map(({ title, description, image }, index) => (
          <article
            key={index}
            className='h-72 stack flex-1 hover:grow-[1.5] transition-all ease-in-out overflow-hidden rounded-xl'
          >
            <Image
              width={350}
              height={350}
              alt='banner'
              src={image}
              className='h-72 w-full inset-0 object-cover'
            />
            <div className='h-72 w-full inset-0 bg-black/15 backdrop-blur-sm text-white z-10 opacity-0 hover:opacity-100 transition-opacity p-4'>
              <hgroup className='flex flex-col items-center justify-center gap-3 size-full'>
                <h4 className='text-lg font-bold'>{title}</h4>
                <p className='max-w-52 text-center leading-7 text-pretty'>{description}</p>
              </hgroup>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function WhyUs() {
  return (
    <section className='container overflow-hidden'>
      <hgroup className='flex flex-col items-center gap-y-4 mb-10'>
        <h3 className='text-lg text-center font-semibold'>چرا نیکالِند؟</h3>
        <p className='max-w-xl text-center leading-7 text-pretty'>
          در نیکالند مسیر دریافت اعتبار بانکی به شکلی ساده، سریع و شفاف طراحی شده تا همه بتوانند
          بدون پیچیدگی‌های رایج بانکی از آن استفاده کنند. از لحظه ثبت درخواست تا خرید از فروشگاه‌های
          طرف قرارداد، تمام مراحل به ‌صورت آنلاین، در هر نقطه از ایران و بدون نیاز به مراجعه حضوری
          انجام می‌شود.
        </p>
      </hgroup>

      <WhyUsMobile />
      <WhyUsDesktop />
    </section>
  );
}
