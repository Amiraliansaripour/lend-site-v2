'use client';

import {
  BadgeCheck,
  Globe2,
  Rocket,
  ShoppingBag,
  Clock3,
  MapPin,
  ShieldCheck,
  Store,
} from 'lucide-react';

import { Accent, SectionHeading } from '@/components/page/landing/section-heading';
import { Reveal } from '@/components/page/landing/reveal';
import { useSiteTemplate } from '@/providers/site-template';

const USE_CASES = [
  { icon: ShieldCheck, title: 'بدون ضامن' },
  { icon: Clock3, title: 'فرآیند سریع' },
  { icon: Store, title: 'فروشگاه متنوع' },
  { icon: MapPin, title: 'سراسر ایران' },
] as const;

const STATS = [
  { score: '۲۰', unit: 'دقیقه', caption: 'میانگین تکمیل درخواست' },
  { score: '۰', unit: 'ضامن', caption: 'فقط چک صیادی' },
  { score: '۱۰۰٪', unit: '', caption: 'مسیر کاملاً آنلاین' },
] as const;

const REASONS = [
  {
    icon: BadgeCheck,
    title: 'بدون نیاز به ضامن',
    description: 'دریافت اعتبار خرید تنها با ارائه یک برگ چک صیادی',
  },
  {
    icon: Rocket,
    title: 'فرآیند سریع و آسان',
    description: 'تنها طی چند مرحله کاملاً آنلاین در کمتر از بیست دقیقه',
  },
  {
    icon: ShoppingBag,
    title: 'تنوع بالای فروشگاه‌ها',
    description: 'خرید انواع کالاها و خدمات از فروشگاه‌های طرف قرارداد',
  },
  {
    icon: Globe2,
    title: 'بدون محدودیت جغرافیایی',
    description: 'امکان ثبت درخواست و خرید از هر نقطه ایران',
  },
] as const;

/** YourBank UseCases: dark panel with 2×2 tiles + stats column. */
export function WhyUs() {
  const { withBrand } = useSiteTemplate();

  return (
    <section className='mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
      <Reveal>
        <SectionHeading
          title={
            <>
              موارد <Accent>استفاده</Accent>
            </>
          }
          description={withBrand(
            'کارالند برای کسانی ساخته شده که می‌خواهند خرید کنند—نه اینکه در صف بانک بمانند.',
          )}
        />
      </Reveal>

      <Reveal delayMs={60}>
        <div className='grid items-center gap-8 lg:grid-cols-2 lg:gap-10'>
          <div className='relative overflow-hidden rounded-xl bg-navy p-6 sm:p-10'>
            <div
              className='pointer-events-none absolute -top-8 -left-8 size-40 opacity-20'
              aria-hidden
              style={{
                backgroundImage:
                  'radial-gradient(circle, color-mix(in lab, var(--gold) 80%, transparent) 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />
            <div className='relative z-10 grid grid-cols-2 gap-3 sm:gap-4'>
              {USE_CASES.map(({ icon: Icon, title }) => (
                <div
                  key={title}
                  className='flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-5 text-center'
                >
                  <Icon className='size-10 text-gold sm:size-12' strokeWidth={1.25} />
                  <h3 className='text-xs font-medium text-white sm:text-sm'>{title}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-4 text-right'>
            <h3 className='text-2xl font-semibold text-navy md:text-3xl dark:text-white'>
              {withBrand('چرا کارالند؟')}
            </h3>
            <p className='leading-8 text-navy/55 dark:text-white/55'>
              {withBrand(
                'مسیر دریافت اعتبار را طوری طراحی کرده‌ایم که ساده، شفاف و قابل‌اتکا باشد—بدون پیچیدگی‌های رایج بانکی.',
              )}
            </p>

            <div className='mt-4 hidden gap-4 md:flex md:items-stretch md:justify-between'>
              {STATS.map(({ score, unit, caption }, index) => (
                <div key={caption} className='flex flex-1 items-stretch gap-4'>
                  <div className='flex flex-col items-center gap-2 text-center'>
                    <span className='text-3xl font-bold text-brand lg:text-4xl dark:text-gold'>
                      {score}
                      {unit ? <span className='ms-1 text-base font-semibold'>{unit}</span> : null}
                    </span>
                    <span className='text-xs text-navy/50 dark:text-white/45'>{caption}</span>
                  </div>
                  {index < STATS.length - 1 ? (
                    <div className='my-auto h-20 w-px bg-navy/10 dark:bg-white/10' />
                  ) : null}
                </div>
              ))}
            </div>

            <div className='mt-4 grid gap-4 md:hidden'>
              {STATS.map(({ score, unit, caption }) => (
                <div
                  key={caption}
                  className='flex flex-col items-center gap-1 border-b border-navy/10 pb-4 last:border-0 dark:border-white/10'
                >
                  <span className='text-3xl font-bold text-brand dark:text-gold'>
                    {score}
                    {unit ? <span className='ms-1 text-base'>{unit}</span> : null}
                  </span>
                  <span className='text-xs text-navy/50'>{caption}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delayMs={100}>
        <div className='mt-12 grid gap-4 sm:grid-cols-2'>
          {REASONS.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className='group rounded-xl border border-navy/10 bg-white p-6 transition-colors hover:border-navy/20 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20'
            >
              <div className='flex items-start gap-4'>
                <span className='flex size-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-navy dark:text-gold'>
                  <Icon className='size-5' strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className='text-lg font-semibold text-navy dark:text-white'>{title}</h3>
                  <p className='mt-2 leading-7 text-navy/55 dark:text-white/55'>{description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
