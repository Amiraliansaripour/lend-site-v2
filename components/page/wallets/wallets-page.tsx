'use client';

import { useState, useMemo } from 'react';
import { WalletInfoBar } from './wallet-info-bar';
import { WalletStatCard } from './wallet-stat-card';
import { WalletTransactionsTable } from './wallet-transactions-table';
import { WalletBalanceCards, WalletBalanceCardsSkeleton } from './wallet-balance-cards';
import { cn } from '@/lib/utils';
import type { WalletType, WalletStats } from './wallet-types';
import type { WalletInfo, WalletTransaction } from '@/api/wallet';

type WalletsPageProps = {
  walletInfo: WalletInfo | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  onWalletUpdate: () => void;
};

export function WalletsPage({
  walletInfo,
  transactions,
  isLoading,
  onWalletUpdate,
}: WalletsPageProps) {
  const [activeTab, setActiveTab] = useState<WalletType>('credit');
  const creditStats: WalletStats = useMemo(
    () => ({
      initial: walletInfo?.sumCreditCharg ?? 0,
      spent: walletInfo?.sumCreditBuy ?? 0,
      remaining: walletInfo?.credit ?? 0,
    }),
    [walletInfo],
  );

  const cashStats: WalletStats = useMemo(
    () => ({
      initial: walletInfo?.sumCachCharg ?? 0,
      spent: walletInfo?.sumCachBuy ?? 0,
      remaining: walletInfo?.cachRemain ?? 0,
    }),
    [walletInfo],
  );

  const filteredTransactions = useMemo(() => {
    const type = activeTab === 'credit' ? 'کیف اعتباری' : 'کیف نقدی';
    return transactions.filter(t => t.creditType === type);
  }, [activeTab, transactions]);

  const currentStats = activeTab === 'credit' ? creditStats : cashStats;

  if (isLoading) {
    return <WalletsPageSkeleton />;
  }

  return (
    <div>
      <WalletInfoBar />

      <div className='mb-6'>
        <WalletBalanceCards walletInfo={walletInfo} onWalletUpdate={onWalletUpdate} />
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-9'>
        <div className='flex gap-4 mb-8'>
          <button
            onClick={() => setActiveTab('credit')}
            className={cn(
              'flex border-r-[3px] cursor-pointer text-gray-600 border-gray-400 transition-all',
              activeTab === 'credit' && 'border-brand text-black font-bold',
            )}
          >
            <span className='text-base lg:text-xl pr-3'>کیف پول اعتباری</span>
          </button>
          <button
            onClick={() => setActiveTab('cash')}
            className={cn(
              'flex border-r-[3px] cursor-pointer text-gray-600 border-gray-400 transition-all',
              activeTab === 'cash' && 'border-brand text-black font-bold',
            )}
          >
            <span className='text-base lg:text-xl pr-3'>کیف پول نقدی</span>
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-11 md:mt-16'>
          <WalletStatCard type='initial' amount={currentStats.initial} />
          <WalletStatCard type='spent' amount={currentStats.spent} />
          <WalletStatCard type='remaining' amount={currentStats.remaining} />
        </div>

        <WalletTransactionsTable transactions={filteredTransactions} />
      </div>
    </div>
  );
}

export function WalletsPageSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='hidden md:flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-16 animate-pulse'>
        <div className='flex items-center gap-3'>
          <div className='w-6 h-6 bg-gray-200 rounded-full' />
          <div className='w-32 h-4 bg-gray-200 rounded' />
        </div>
        <div className='flex items-center gap-3'>
          <div className='w-6 h-6 bg-gray-200 rounded-full' />
          <div className='w-40 h-4 bg-gray-200 rounded' />
        </div>
      </div>

      <WalletBalanceCardsSkeleton />

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-9'>
        <div className='flex gap-4 mb-8'>
          <div className='w-40 h-8 bg-gray-200 rounded animate-pulse' />
          <div className='w-40 h-8 bg-gray-200 rounded animate-pulse' />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-11 md:mt-16'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='rounded-xl border border-gray-200 min-h-[110px] lg:min-h-40 p-4 lg:p-6 animate-pulse'
            >
              <div className='flex flex-col h-full'>
                <div className='pb-2 lg:pb-3 flex justify-end'>
                  <div className='w-9 lg:w-11 h-9 lg:h-11 rounded-full bg-gray-200' />
                </div>
                <div className='w-24 h-4 bg-gray-200 rounded mb-2' />
                <div className='w-32 h-5 bg-gray-200 rounded' />
              </div>
            </div>
          ))}
        </div>

        <div className='mt-10 md:mt-20'>
          <div className='w-32 h-6 bg-gray-200 rounded mb-5 animate-pulse' />
          <div className='border rounded-md p-4 space-y-3'>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className='flex gap-4 animate-pulse'>
                <div className='w-full h-12 bg-gray-100 rounded' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
