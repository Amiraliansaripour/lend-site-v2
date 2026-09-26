'use client';

import { Clock3, MapPin, ShieldCheck, Store } from 'lucide-react';

import { GlassPanel } from '@/components/page/landing/glass-panel';
import { Reveal } from '@/components/page/landing/reveal';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'بدون ضامن',
    description: 'تنها با چک صیادی',
  },
  {
    icon: Clock3,
    title: 'فرآیند سریع',
    description: 'کاملاً آنلاین',
  },
  {
    icon: Store,
    title: 'فروشگاه متنوع',
    description: 'کالا و خدمات',
  },
  {
    icon: MapPin,
    title: 'سراسر ایران',
    description: 'بدون محدودیت',
  },
] as const;

export function FeaturesBar({ className }: { className?: string }) {
  return (
    <Reveal className={cn('relative z-10 mx-auto max-w-6xl px-4 md:px-6 lg:px-10', className)}>
      <GlassPanel className='grid gap-1 p-2 sm:grid-cols-2 lg:grid-cols-4'>
        {FEATURES.map(({ icon: Icon, title, description }, index) => (
          <article
            key={title}
            style={{ transitionDelay: `${index * 60}ms` }}
            className='group flex items-start gap-3 rounded-[1.5rem] px-4 py-5 transition-colors hover:bg-navy/5 dark:hover:bg-white/5'
          >
            <span className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold/20 text-navy transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-gold/15 dark:text-gold'>
              <Icon className='size-5 stroke-[1.5]' />
            </span>
            <div>
              <h3 className='font-semibold text-navy dark:text-white'>{title}</h3>
              <p className='mt-1 text-sm text-navy/50 dark:text-white/55'>{description}</p>
            </div>
          </article>
        ))}
      </GlassPanel>
    </Reveal>
  );
}
