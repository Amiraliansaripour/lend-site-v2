'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  ShieldCheck,
  Store,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useSiteTemplate } from '@/providers/site-template';
import { cn } from '@/lib/utils';

type HeroSlide = {
  id: string;
  title: string;
  titleAccent: string;
  description: string;
  cta: string;
  ctaHref: '/requests' | '/shops' | '#calculator';
  card: {
    amountLabel: string;
    amount: string;
    footerNote: string;
    features: { icon: typeof Wallet; label: string }[];
  };
};

const SLIDES: HeroSlide[] = [
  {
    id: 'credit',
    title: 'اعتبار خرید،',
    titleAccent: 'شفاف و سریع',
    description:
      'بدون ضامن و بدون مراجعه حضوری، مسیر دریافت اعتبار و خرید اقساطی را در چند مرحله آنلاین طی کنید.',
    cta: 'شروع درخواست اعتبار',
    ctaHref: '/requests',
    card: {
      amountLabel: 'اعتبار قابل استفاده',
      amount: '۷۵,۰۰۰,۰۰۰',
      footerNote: 'شماره اعتبار',
      features: [
        { icon: Users, label: 'فروشگاه متنوع' },
        { icon: CreditCard, label: 'اقساط منعطف' },
        { icon: CircleDollarSign, label: 'نرخ شفاف' },
      ],
    },
  },
  {
    id: 'installments',
    title: 'اقساط منعطف،',
    titleAccent: 'با برنامه شما',
    description:
      'مدت بازپرداخت و مبلغ اعتبار را خودتان تنظیم کنید و قبل از ثبت درخواست، تصویر روشنی از اقساط داشته باشید.',
    cta: 'محاسبه اقساط',
    ctaHref: '#calculator',
    card: {
      amountLabel: 'قسط ماهانه نمونه',
      amount: '۶,۲۵۰,۰۰۰',
      footerNote: '۱۲ ماهه',
      features: [
        { icon: Zap, label: 'تأیید سریع' },
        { icon: CreditCard, label: 'بازپرداخت آسان' },
        { icon: ShieldCheck, label: 'بدون ضامن' },
      ],
    },
  },
  {
    id: 'shops',
    title: 'خرید از فروشگاه‌ها،',
    titleAccent: 'با یک اعتبار',
    description:
      'با شارژ کیف پول اعتباری، از فروشگاه‌های طرف قرارداد آنلاین و حضوری خرید کنید—در سراسر ایران.',
    cta: 'مشاهده فروشگاه‌ها',
    ctaHref: '/shops',
    card: {
      amountLabel: 'سقف خرید فروشگاهی',
      amount: '۱۲۰,۰۰۰,۰۰۰',
      footerNote: 'طرف قرارداد',
      features: [
        { icon: Store, label: 'فروشگاه آنلاین' },
        { icon: Users, label: 'فروشگاه حضوری' },
        { icon: CircleDollarSign, label: 'تخفیف نقدی' },
      ],
    },
  },
];

function SlideCard({
  slide,
  brandName,
  year,
}: {
  slide: HeroSlide;
  brandName: string;
  year: string;
}) {
  const { card } = slide;

  return (
    <div className='hero-slide-card rounded-[2rem] border border-navy/8 bg-white p-5 shadow-[0_24px_60px_-28px_rgba(11,18,36,0.35)] sm:p-6 dark:border-white/12 dark:bg-white/[0.06] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl'>
      <div className='relative overflow-hidden rounded-[1.5rem] bg-linear-to-l from-[#e8c05a] via-gold to-[#f8e0a0] p-5 text-navy sm:p-6'>
        <div
          className='pointer-events-none absolute -top-10 -left-8 size-36 rounded-full bg-white/30 blur-2xl'
          aria-hidden
        />
        <div className='relative flex items-start justify-between gap-3'>
          <Wallet className='size-7 stroke-[1.5]' aria-hidden />
          <span className='text-sm font-medium'>{card.amountLabel}</span>
        </div>
        <div className='relative mt-8 flex items-end justify-center gap-2'>
          <span className='text-4xl font-bold tracking-tight tabular-nums sm:text-5xl'>
            {card.amount}
          </span>
          <span className='mb-1 text-base font-medium'>تومان</span>
        </div>
        <div className='relative mt-10 flex items-end justify-between gap-3 text-sm'>
          <span className='font-semibold tracking-wide'>
            {brandName.toUpperCase()} • {year}
          </span>
          <span className='text-navy/55'>{card.footerNote}</span>
        </div>
      </div>

      <ul className='mt-6 grid grid-cols-3 gap-2 sm:gap-4'>
        {card.features.map(({ icon: Icon, label }) => (
          <li key={label} className='flex flex-col items-center gap-2 text-center'>
            <span className='flex size-11 items-center justify-center rounded-2xl border border-gold/35 bg-gold/15 text-navy dark:border-gold/25 dark:bg-gold/10 dark:text-gold'>
              <Icon className='size-5 stroke-[1.5]' />
            </span>
            <span className='text-[11px] leading-5 text-navy/70 sm:text-xs dark:text-gold/90'>
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeroSlider({ className }: { className?: string }) {
  const { brandName, withBrand } = useSiteTemplate();
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date());
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((next: number, dir: 1 | -1) => {
    setDirection(dir);
    setIndex((next + SLIDES.length) % SLIDES.length);
    setAnimKey(k => k + 1);
  }, []);

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setDirection(1);
      setIndex(i => (i + 1) % SLIDES.length);
      setAnimKey(k => k + 1);
    }, 6500);
    return () => window.clearInterval(id);
  }, [paused]);

  const slide = SLIDES[index];

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden px-4 pb-16 pt-28 md:px-6 md:pt-32 md:pb-20 lg:px-10',
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription='carousel'
      aria-label='اسلایدر معرفی'
    >
      <div
        className='pointer-events-none absolute -top-24 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-gold/20 blur-[110px] dark:bg-gold/15'
        aria-hidden
      />
      <div
        className='pointer-events-none absolute top-48 -right-20 size-80 rounded-full bg-navy/[0.04] blur-[90px] dark:bg-gold/10'
        aria-hidden
      />

      <div className='relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16'>
        <div
          key={`copy-${animKey}`}
          className={cn(
            'hero-slide-copy order-2 flex flex-col items-start gap-6 lg:order-1',
            direction === 1 ? 'hero-copy-from-start' : 'hero-copy-from-end',
          )}
        >
          <p className='text-sm font-medium tracking-[0.2em] text-navy/55 dark:text-gold'>
            {brandName}
          </p>
          <h1 className='max-w-xl text-3xl leading-tight font-bold text-balance text-navy md:text-5xl dark:text-white'>
            {slide.title} <span className='text-gold'>{slide.titleAccent}</span>
          </h1>
          <p className='max-w-lg text-base leading-8 text-navy/60 text-pretty md:text-lg dark:text-white/65'>
            {withBrand(slide.description)}
          </p>
          <div className='flex flex-wrap items-center gap-3'>
            {slide.ctaHref.startsWith('#') ? (
              <Button
                asChild
                size='lg'
                className='h-12 rounded-2xl bg-gold px-6 font-semibold text-navy hover:bg-gold/90'
              >
                <a href={slide.ctaHref}>
                  {slide.cta}
                  <ArrowDownLeft className='size-4' />
                </a>
              </Button>
            ) : (
              <Button
                asChild
                size='lg'
                className='h-12 rounded-2xl bg-gold px-6 font-semibold text-navy hover:bg-gold/90'
              >
                <Link href={slide.ctaHref}>{slide.cta}</Link>
              </Button>
            )}
          </div>

          <div className='mt-2 flex items-center gap-3'>
            <button
              type='button'
              onClick={prev}
              aria-label='اسلاید قبلی'
              className='flex size-10 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition hover:border-gold hover:bg-gold/20 dark:border-white/20 dark:bg-white/5 dark:text-white'
            >
              <ChevronRight className='size-4' />
            </button>
            <div className='flex items-center gap-1.5'>
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type='button'
                  aria-label={`اسلاید ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    i === index
                      ? 'w-8 bg-gold'
                      : 'w-1.5 bg-navy/20 hover:bg-navy/35 dark:bg-white/25 dark:hover:bg-white/40',
                  )}
                />
              ))}
            </div>
            <button
              type='button'
              onClick={next}
              aria-label='اسلاید بعدی'
              className='flex size-10 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition hover:border-gold hover:bg-gold/20 dark:border-white/20 dark:bg-white/5 dark:text-white'
            >
              <ChevronLeft className='size-4' />
            </button>
          </div>
        </div>

        <div className='hero-slide-stage order-1 relative mx-auto w-full max-w-md lg:order-2 lg:max-w-none'>
          <div
            key={`card-${animKey}`}
            className={cn(
              'hero-slide-visual',
              direction === 1 ? 'hero-card-enter-next' : 'hero-card-enter-prev',
            )}
          >
            <SlideCard slide={slide} brandName={brandName} year={year} />
          </div>
        </div>
      </div>
    </section>
  );
}
