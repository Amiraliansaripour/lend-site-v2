'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CreditCard, Wallet } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { CashChargeDialog } from './cash-charge-dialog';
import { useSiteTemplate } from '@/providers/site-template';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';
import type { WalletType, WalletStats } from './wallet-types';

type WalletOverviewProps = {
  activeTab: WalletType;
  onTabChange: (tab: WalletType) => void;
  creditStats: WalletStats;
  cashStats: WalletStats;
  onWalletUpdate: () => void;
};

function formatAmount(amount: number) {
  return normalizeToPersianDigits(formatNumber(amount, { int: true }));
}

type WalletPanelProps = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: WalletStats;
  isActive: boolean;
  onSelect: () => void;
  action: React.ReactNode;
  brandName: string;
  logoUrl?: string | null;
  variant?: 'credit' | 'cash';
};

function WalletPanel({
  title,
  icon: Icon,
  stats,
  isActive,
  onSelect,
  action,
  brandName,
  logoUrl,
  variant = 'credit',
}: WalletPanelProps) {
  return (
    <div
      role='button'
      tabIndex={0}
      aria-pressed={isActive}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'group relative flex min-h-45 cursor-pointer flex-col overflow-hidden rounded-2xl p-5 text-white outline-none transition-all',
        'shadow-[0_12px_28px_-12px_rgba(17,27,40,0.55)]',
        'focus-visible:ring-2 focus-visible:ring-[#f5d277]/60 focus-visible:ring-offset-2',
        variant === 'credit'
          ? 'bg-linear-to-br from-[#111b28] via-[#182436] to-[#2a2414]'
          : 'bg-linear-to-bl from-[#111b28] via-[#1a2030] to-[#3a3018]',
        isActive
          ? 'ring-2 ring-[#f5d277] scale-[1.01]'
          : 'ring-1 ring-white/10 hover:ring-[#f5d277]/40',
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -left-10 -top-16 size-44 rounded-full bg-[#f5d277]/25 blur-3xl transition-opacity',
          isActive ? 'opacity-100' : 'opacity-55 group-hover:opacity-85',
        )}
      />
      <div
        aria-hidden
        className='pointer-events-none absolute -right-8 top-1/2 size-36 -translate-y-1/2 rounded-full bg-[#f5d277]/12 blur-2xl'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#f5d277]/8 to-transparent'
      />

      {/* Card chip + brand */}
      <div className='relative z-10 flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-md bg-linear-to-br from-[#f5d277] to-[#c9a84a] shadow-sm'>
            <Icon className='size-4 text-[#111b28]' />
          </div>
          <div>
            <p className='text-sm font-semibold tracking-wide'>{title}</p>
            <p className='text-xs text-white/65'>مانده قابل استفاده</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {isActive && (
            <span className='rounded-md bg-[#f5d277]/20 px-2 py-0.5 text-[11px] font-medium text-[#f5d277] ring-1 ring-[#f5d277]/35'>
              فعال
            </span>
          )}
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={brandName}
              width={72}
              height={28}
              className='h-7 w-auto max-w-20 object-contain opacity-90'
              unoptimized
            />
          ) : (
            <span className='text-xs font-semibold tracking-widest text-[#f5d277]/80'>
              {brandName}
            </span>
          )}
        </div>
      </div>

      <p className='relative z-10 mt-5 text-2xl font-bold tracking-tight lg:text-[1.75rem]'>
        {formatAmount(stats.remaining)}
        <span className='mr-1.5 text-sm font-medium text-white/70'>ریال</span>
      </p>

      <div className='relative z-10 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/15 pt-3 text-xs text-white/65'>
        <span>
          موجودی اولیه:{' '}
          <span className='font-medium text-white/90'>{formatAmount(stats.initial)}</span>
        </span>
        <span className='hidden text-white/25 sm:inline'>|</span>
        <span>
          مجموع برداشت:{' '}
          <span className='font-medium text-white/90'>{formatAmount(stats.spent)}</span>
        </span>
      </div>

      <div
        className='relative z-10 mt-auto pt-4'
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        {action}
      </div>
    </div>
  );
}

const cardActionClassName =
  'w-full border-[#f5d277]/55 bg-[#f5d277]/10 text-[#f5d277] hover:bg-[#f5d277] hover:text-[#111b28] sm:w-auto';

export function WalletOverview({
  activeTab,
  onTabChange,
  creditStats,
  cashStats,
  onWalletUpdate,
}: WalletOverviewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { brandName, getImageUrl } = useSiteTemplate();
  const lightLogoUrl = getImageUrl('lightLogo') || getImageUrl('logo');

  return (
    <>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <WalletPanel
          title='کیف پول اعتباری'
          icon={CreditCard}
          stats={creditStats}
          isActive={activeTab === 'credit'}
          onSelect={() => onTabChange('credit')}
          brandName={brandName}
          logoUrl={lightLogoUrl}
          variant='credit'
          action={
            <Link href='/requests/request-credit' className='block'>
              <Button variant='outline' size='sm' className={cardActionClassName}>
                درخواست اعتبار
              </Button>
            </Link>
          }
        />

        <WalletPanel
          title='کیف پول نقدی'
          icon={Wallet}
          stats={cashStats}
          isActive={activeTab === 'cash'}
          onSelect={() => onTabChange('cash')}
          brandName={brandName}
          logoUrl={lightLogoUrl}
          variant='cash'
          action={
            <Button
              variant='outline'
              size='sm'
              className={cn('cursor-pointer', cardActionClassName)}
              onClick={() => setModalOpen(true)}
            >
              شارژ کیف پول
            </Button>
          }
        />
      </div>

      <CashChargeDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        onWalletUpdate={onWalletUpdate}
      />
    </>
  );
}

export function WalletOverviewSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      {[1, 2].map(i => (
        <div
          key={i}
          className='flex min-h-45 animate-pulse flex-col gap-3 overflow-hidden rounded-2xl bg-linear-to-br from-[#111b28] to-[#1a2740] p-5'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='size-9 rounded-md bg-[#f5d277]/25' />
              <div className='space-y-1.5'>
                <div className='h-3.5 w-24 rounded bg-white/20' />
                <div className='h-3 w-20 rounded bg-white/10' />
              </div>
            </div>
            <div className='h-7 w-16 rounded bg-white/10' />
          </div>
          <div className='mt-4 h-7 w-40 rounded bg-white/20' />
          <div className='mt-2 h-3 w-full rounded bg-white/10' />
          <div className='mt-auto h-8 w-28 rounded bg-[#f5d277]/20' />
        </div>
      ))}
    </div>
  );
}
