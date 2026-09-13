'use client';

import { Link } from '@/i18n/navigation';
import { BoomLogo } from '@/components/brand/boom-logo';
import { MokhaberatButton } from '@/components/mokhaberat-button';
import { CUSTOMER_CLUB_URL } from '@/components/customer-club-back-button';

export function DashboardHeader() {
  return (
    <header className='sticky top-0 z-20 border-b border-brand/10 bg-white/90 backdrop-blur-md'>
      <div className='flex h-[52px] w-full items-center justify-between gap-2 px-3 md:px-4'>
        <Link href='/wallets' className='shrink-0' aria-label='BOOM UP'>
          <BoomLogo markClassName='size-6' wordmarkClassName='text-sm' />
        </Link>

        <div className='flex min-w-0 items-center gap-1.5 sm:gap-2'>
          <MokhaberatButton className='shrink-0 px-2.5 py-1.5 text-[11px] sm:px-3 sm:text-xs' />
          <a
            href={CUSTOMER_CLUB_URL}
            rel='noopener noreferrer'
            className='inline-flex shrink-0 items-center rounded-full border border-brand px-2.5 py-1.5 text-[11px] font-semibold text-brand transition-colors hover:bg-brand/5 sm:px-3 sm:text-xs'
            aria-label='بازگشت به باشگاه مشتریان'
          >
            باشگاه مشتریان
          </a>
        </div>
      </div>
    </header>
  );
}
