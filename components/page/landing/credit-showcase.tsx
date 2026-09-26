'use client';

import { CreditCard, Users, CircleDollarSign, Wallet } from 'lucide-react';

import { GlassPanel } from '@/components/page/landing/glass-panel';
import { useSiteTemplate } from '@/providers/site-template';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: Users, label: 'فروشگاه متنوع' },
  { icon: CreditCard, label: 'اقساط منعطف' },
  { icon: CircleDollarSign, label: 'نرخ شفاف' },
] as const;

type CreditShowcaseProps = {
  className?: string;
  amountLabel?: string;
  amount?: string;
  showFeatures?: boolean;
};

export function CreditShowcase({
  className,
  amountLabel = 'اعتبار قابل استفاده',
  amount = '۷۵,۰۰۰,۰۰۰',
  showFeatures = true,
}: CreditShowcaseProps) {
  const { brandName } = useSiteTemplate();
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date());

  return (
    <GlassPanel className={cn('p-5 sm:p-6', className)}>
      <div className='landing-credit-card relative overflow-hidden rounded-[1.5rem] bg-linear-to-l from-[#e8c05a] via-gold to-[#f8e0a0] p-5 text-navy sm:p-6'>
        <div
          className='pointer-events-none absolute -top-10 -left-8 size-36 rounded-full bg-white/25 blur-2xl'
          aria-hidden
        />
        <div className='relative flex items-start justify-between gap-3'>
          <Wallet className='size-7 stroke-[1.5]' aria-hidden />
          <span className='text-sm font-medium'>{amountLabel}</span>
        </div>
        <div className='relative mt-8 flex items-end justify-center gap-2'>
          <span className='text-4xl font-bold tracking-tight tabular-nums sm:text-5xl'>
            {amount}
          </span>
          <span className='mb-1 text-base font-medium'>تومان</span>
        </div>
        <div className='relative mt-10 flex items-end justify-between gap-3 text-sm'>
          <span className='font-semibold tracking-wide'>
            {brandName.toUpperCase()} • {year}
          </span>
          <span className='text-navy/55'>شماره اعتبار</span>
        </div>
      </div>

      {showFeatures ? (
        <ul className='mt-6 grid grid-cols-3 gap-2 sm:gap-4'>
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className='flex flex-col items-center gap-2 text-center'>
              <span className='flex size-11 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-navy dark:border-gold/25 dark:bg-gold/10 dark:text-gold'>
                <Icon className='size-5 stroke-[1.5]' />
              </span>
              <span className='text-[11px] leading-5 text-navy/70 sm:text-xs dark:text-gold'>
                {label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </GlassPanel>
  );
}

export function LandingFeaturePills({ className }: { className?: string }) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-3', className)}>
      {FEATURES.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className='flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-navy dark:border-gold/20 dark:bg-gold/5 dark:text-gold'
        >
          <Icon className='size-5 shrink-0 stroke-[1.5]' />
          <span className='text-sm font-medium'>{label}</span>
        </li>
      ))}
    </ul>
  );
}
