'use client';

import { useState, useMemo } from 'react';
import { WalletOverview, WalletOverviewSkeleton } from './wallet-overview';
import { WalletTransactionsTable } from './wallet-transactions-table';
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

  if (isLoading) {
    return <WalletsPageSkeleton />;
  }

  return (
    <div className='space-y-5'>
      <WalletOverview
        activeTab={activeTab}
        onTabChange={setActiveTab}
        creditStats={creditStats}
        cashStats={cashStats}
        onWalletUpdate={onWalletUpdate}
      />

      <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6'>
        <WalletTransactionsTable
          transactions={filteredTransactions}
          walletLabel={activeTab === 'credit' ? 'کیف پول اعتباری' : 'کیف پول نقدی'}
        />
      </div>
    </div>
  );
}

export function WalletsPageSkeleton() {
  return (
    <div className='space-y-5'>
      <WalletOverviewSkeleton />

      <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6'>
        <div className='mb-4 h-6 w-40 animate-pulse rounded bg-gray-200' />
        <div className='space-y-3 rounded-md border p-4'>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className='h-12 animate-pulse rounded bg-gray-100' />
          ))}
        </div>
      </div>
    </div>
  );
}
