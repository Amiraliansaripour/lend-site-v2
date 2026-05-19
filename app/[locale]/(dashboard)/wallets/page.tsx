'use client';

import { Suspense } from 'react';

import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';
import { WalletsPage, WalletsPageSkeleton } from '@/components/page/wallets';
import { useWalletInfo, useWalletTransactions } from '@/queries/wallet';
import { getUserId } from '@/lib/auth/client/user-info';

function WalletsContent() {
  const userId = getUserId();

  const { data: walletInfo, isLoading: isLoadingInfo } = useWalletInfo();
  const { data: transactions, isLoading: isLoadingTransactions } = useWalletTransactions();

  const isLoading = isLoadingInfo || isLoadingTransactions;

  if (!userId) {
    return (
      <div className='w-full pt-10'>
        <div className='bg-white rounded-xl shadow-md p-12 text-center'>
          <div className='flex flex-col items-center gap-4'>
            <svg
              className='w-20 h-20 text-gray-300'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
              />
            </svg>
            <p className='text-xl text-gray-600 font-medium'>لطفاً وارد حساب کاربری خود شوید</p>
            <p className='text-gray-500 text-sm'>برای مشاهده کیف پول خود ابتدا وارد شوید</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WalletsPage
      walletInfo={walletInfo || null}
      transactions={transactions || []}
      isLoading={isLoading}
    />
  );
}

export default function WalletPageRoute() {
  const breadcrumbs: Breadcrumbs = [
    { label: 'داشبورد', href: '/dashboard' },
    { label: 'کیف پول های من', href: '/wallets' },
  ];

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='کیف پول های من'>
        <Suspense fallback={<WalletsPageSkeleton />}>
          <WalletsContent />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
}
