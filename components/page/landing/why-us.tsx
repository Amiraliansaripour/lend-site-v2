'use client';

import { BadgeCheck, Globe2, Rocket, ShoppingBag } from 'lucide-react';

import { GlassPanel } from '@/components/page/landing/glass-panel';
import { Reveal } from '@/components/page/landing/reveal';
import { SectionHeading } from '@/components/page/landing/section-heading';
import { useSiteTemplate } from '@/providers/site-template';
import { cn } from '@/lib/utils';

const REASONS = [
  {
    icon: BadgeCheck,
    title: 'بدون نیاز به ضامن',
    description: 'دریافت اعتبار خرید تنها با ارائه یک برگ چک صیادی',
    tone: 'gold',
  },
  {
    icon: Rocket,
    title: 'فرآیند سریع و آسان',
    description: 'تنها طی چند مرحله کاملاً آنلاین در کمتر از بیست دقیقه',
    tone: 'glass',
  },
  {
    icon: ShoppingBag,
    title: 'تنوع بالای فروشگاه‌ها',
    description: 'خرید انواع کالاها و خدمات از فروشگاه‌های طرف قرارداد',
    tone: 'glass',
  },
  {
    icon: Globe2,
    title: 'بدون محدودیت جغرافیایی',
    description: 'امکان ثبت درخواست و خرید از هر نقطه ایران',
    tone: 'gold',
  },
] as const;

export function WhyUs() {
  const { withBrand } = useSiteTemplate();

  return (
    <section className='mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
      <Reveal>
        <SectionHeading
          eyebrow='مزایا'
          title={withBrand('چرا کارالند؟')}
          description={withBrand(
            'مسیر دریافت اعتبار را طوری طراحی کرده‌ایم که ساده، شفاف و قابل‌اتکا باشد—بدون پیچیدگی‌های رایج بانکی.',
          )}
        />
      </Reveal>

      <div className='grid gap-4 md:grid-cols-2'>
        {REASONS.map(({ icon: Icon, title, description, tone }, index) => (
          <Reveal key={title} delayMs={index * 70}>
            <GlassPanel
              className={cn(
                'group h-full p-6 transition-transform duration-300 hover:-translate-y-1',
                tone === 'gold' &&
                  'border-gold/40 bg-linear-to-br from-gold/25 via-gold/10 to-transparent dark:border-gold/30 dark:from-gold/20 dark:via-gold/5',
              )}
            >
              <div className='flex items-start gap-4'>
                <span
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                    tone === 'gold'
                      ? 'bg-gold text-navy'
                      : 'border border-gold/30 bg-gold/15 text-navy dark:border-gold/25 dark:bg-gold/10 dark:text-gold',
                  )}
                >
                  <Icon className='size-5 stroke-[1.5]' />
                </span>
                <div>
                  <h3 className='text-lg font-semibold text-navy dark:text-white'>{title}</h3>
                  <p className='mt-2 leading-7 text-navy/60 text-pretty dark:text-white/60'>
                    {description}
                  </p>
                </div>
              </div>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
