'use client';

import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';

type StatType = 'initial' | 'spent' | 'remaining';

type WalletStatCardProps = {
  type: StatType;
  amount: number;
};

const STAT_CONFIG: Record<
  StatType,
  {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    iconColor: string;
  }
> = {
  initial: {
    title: 'موجودی اولیه',
    icon: Wallet,
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  spent: {
    title: 'مجموع برداشت',
    icon: TrendingDown,
    bgColor: 'bg-red-50 dark:bg-red-500/15',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  remaining: {
    title: 'مانده',
    icon: TrendingUp,
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
};

export function WalletStatCard({ type, amount }: WalletStatCardProps) {
  const config = STAT_CONFIG[type];
  const Icon = config.icon;
  const formattedAmount = normalizeToPersianDigits(formatNumber(amount, { int: true }));

  return (
    <div className='min-h-[110px] min-w-full rounded-xl border border-border bg-card p-4 shadow-sm lg:min-h-40 lg:min-w-64 lg:p-6'>
      <div className='flex h-full flex-col'>
        <div className='flex justify-end pb-2 lg:pb-3'>
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full lg:h-11 lg:w-11',
              config.bgColor,
            )}
          >
            <Icon className={cn('h-5 w-5 lg:h-6 lg:w-6', config.iconColor)} />
          </div>
        </div>
        <div className='pb-1.5 text-xs text-muted-foreground lg:text-base'>{config.title}</div>
        <div className='text-xs font-bold text-foreground lg:text-base'>{formattedAmount} ریال</div>
      </div>
    </div>
  );
}
