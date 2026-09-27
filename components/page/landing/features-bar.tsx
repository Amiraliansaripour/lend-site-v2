'use client';

import { CreditCard, ShieldCheck, Store } from 'lucide-react';

import { Accent, SectionHeading } from '@/components/page/landing/section-heading';
import { Reveal } from '@/components/page/landing/reveal';
import { useSiteTemplate } from '@/providers/site-template';
import { cn } from '@/lib/utils';

const PRODUCTS = [
  {
    icon: ShieldCheck,
    title: 'اعتبار بدون ضامن',
    description: 'دریافت اعتبار خرید با ارائه یک برگ چک صیادی—بدون ضامن و بدون مراجعه حضوری.',
  },
  {
    icon: CreditCard,
    title: 'اقساط منعطف',
    description:
      'مبلغ و مدت بازپرداخت را خودتان تنظیم کنید و قبل از ثبت، تصویر روشنی از اقساط ببینید.',
  },
  {
    icon: Store,
    title: 'شبکه فروشگاهی',
    description: 'از فروشگاه‌های طرف قرارداد آنلاین و حضوری، در سراسر ایران خرید کنید.',
  },
] as const;

/** YourBank ProductsSection: 3 columns with vertical separators. */
export function FeaturesBar({ className }: { className?: string }) {
  const { withBrand } = useSiteTemplate();

  return (
    <section className={cn('mx-auto max-w-6xl px-4 md:px-6 lg:px-10', className)}>
      <Reveal>
        <div className='flex flex-col items-center gap-6 md:flex-row md:items-end md:justify-between md:text-right'>
          <SectionHeading
            className='mb-0'
            title={
              <>
                محصولات <Accent>ما</Accent>
              </>
            }
            description={withBrand(
              'راه‌حل‌های اعتباری کارالند برای خرید اقساطی طراحی شده‌اند—ساده، شفاف و منطبق با نیاز شما.',
            )}
          />
        </div>
      </Reveal>

      <Reveal delayMs={80}>
        <div className='mt-10 hidden md:flex md:items-stretch md:justify-between md:gap-4'>
          {PRODUCTS.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className='flex flex-1 items-stretch gap-4'>
              <ProductCard icon={Icon} title={title} description={description} />
              {index < PRODUCTS.length - 1 ? (
                <div className='my-auto hidden h-44 w-px shrink-0 bg-navy/10 md:block dark:bg-white/10' />
              ) : null}
            </div>
          ))}
        </div>

        <div className='mt-8 grid gap-8 md:hidden'>
          {PRODUCTS.map(({ icon: Icon, title, description }, index) => (
            <div key={title}>
              <ProductCard icon={Icon} title={title} description={description} />
              {index < PRODUCTS.length - 1 ? (
                <div className='mt-8 h-px w-full bg-navy/10 dark:bg-white/10' />
              ) : null}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function ProductCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}) {
  return (
    <article className='mx-auto flex max-w-xs flex-1 flex-col items-center gap-5 text-center'>
      <div className='rounded-full bg-gold/10 p-1.5'>
        <div className='rounded-full bg-gold/15 p-3 text-navy dark:text-gold'>
          <Icon className='size-6' strokeWidth={1.5} />
        </div>
      </div>
      <div className='space-y-3 px-2'>
        <h3 className='text-base font-semibold text-navy dark:text-white'>{title}</h3>
        <p className='text-sm leading-7 text-navy/55 dark:text-white/55'>{description}</p>
      </div>
    </article>
  );
}
