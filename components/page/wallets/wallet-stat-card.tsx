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
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  spent: {
    title: 'مجموع برداشت',
    icon: TrendingDown,
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  remaining: {
    title: 'مانده',
    icon: TrendingUp,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
};

export function WalletStatCard({ type, amount }: WalletStatCardProps) {
  const config = STAT_CONFIG[type];
  const Icon = config.icon;
  const formattedAmount = normalizeToPersianDigits(formatNumber(amount, { int: true }));

  return (
    <div className='rounded-xl border border-gray-200 min-w-full lg:min-w-64 min-h-[110px] lg:min-h-40 p-4 lg:p-6 shadow-sm bg-white'>
      <div className='flex flex-col h-full'>
        <div className='pb-2 lg:pb-3 flex justify-end'>
          <div
            className={cn(
              'w-9 lg:w-11 h-9 lg:h-11 rounded-full flex items-center justify-center',
              config.bgColor,
            )}
          >
            <Icon className={cn('w-5 lg:w-6 h-5 lg:h-6', config.iconColor)} />
          </div>
        </div>
        <div className='text-gray-600 pb-1.5 text-xs lg:text-base'>{config.title}</div>
        <div className='font-bold text-xs lg:text-base text-gray-900'>{formattedAmount} ریال</div>
      </div>
    </div>
  );
}
