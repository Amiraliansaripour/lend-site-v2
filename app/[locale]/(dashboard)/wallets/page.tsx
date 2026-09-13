'use client';

import { Suspense } from 'react';

import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';
import { LoyaltyPointsCard } from '@/components/loyalty-points-card';
import { WalletsPage, WalletsPageSkeleton, WalletActivitySummary } from '@/components/page/wallets';
import { PlatformWalletsGate } from '@/components/page/wallets/platform-wallets-gate';
import { useWalletInfo, useWalletTransactions } from '@/queries/wallet';
import { useUser, useUserClub, useUserWithStore } from '@/queries/users';
import { getUserId } from '@/lib/auth/client/user-info';

function WalletsContent() {
  const userId = getUserId();

  useUserWithStore(userId || '');

  const { data: user } = useUser(userId || '');
  const nationalCode = user?.nationalCode || user?.personInfo?.nationalCode || '';
  const {
    data: walletInfo,
    isLoading: isLoadingInfo,
    refetch: refetchWalletInfo,
  } = useWalletInfo(nationalCode);
  const { data: transactions, isLoading: isLoadingTransactions } = useWalletTransactions();
  const { data: userClub } = useUserClub(nationalCode);

  const isLoading = isLoadingInfo || isLoadingTransactions;

  if (!userId) {
    return (
      <div className='w-full pt-10'>
        <div className='rounded-xl bg-white p-12 text-center shadow-md'>
          <div className='flex flex-col items-center gap-4'>
            <svg
              className='h-20 w-20 text-gray-300'
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
            <p className='text-xl font-medium text-gray-600'>لطفاً وارد حساب کاربری خود شوید</p>
            <p className='text-sm text-gray-500'>برای مشاهده کیف پول خود ابتدا وارد شوید</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageContent title='کیف پول های من'>
        <WalletsPage
          walletInfo={walletInfo || null}
          transactions={transactions || []}
          isLoading={isLoading}
          onWalletUpdate={() => {
            void refetchWalletInfo();
          }}
        />
      </PageContent>

      {userClub && (userClub.available_points != null || userClub.point != null) && (
        <PageContent title='باشگاه مشتریان'>
          <div className='flex w-full justify-center'>
            <LoyaltyPointsCard
              points={Number(userClub.available_points ?? userClub.point ?? 0)}
              className='w-full max-w-md'
            />
          </div>
        </PageContent>
      )}

      <PageContent title='خلاصه فعالیت'>
        <WalletActivitySummary />
      </PageContent>
    </>
  );
}

export default function WalletPageRoute() {
  const breadcrumbs: Breadcrumbs = [{ label: 'کیف پول های من', href: '/wallets' }];

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <Suspense
        fallback={
          <PageContent title='کیف پول های من'>
            <WalletsPageSkeleton />
          </PageContent>
        }
      >
        <PlatformWalletsGate>
          <WalletsContent />
        </PlatformWalletsGate>
      </Suspense>
    </PageContainer>
  );
}
