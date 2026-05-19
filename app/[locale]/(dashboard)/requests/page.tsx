'use client';

import { Suspense } from 'react';

import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';
import { RequestsPageContent, RequestsCardsSkeleton } from '@/components/page/requests';
import { useUserRequests } from '@/queries/request';
import { useWalletInfo } from '@/queries/wallet';
import { getUserId } from '@/lib/auth/client/user-info';

function RequestsContent() {
  const userId = getUserId();

  const { data: walletInfo, isLoading: isLoadingWallet, refetch: refetchWallet } = useWalletInfo();
  const { data: requests, isLoading: isLoadingRequests } = useUserRequests(userId || '');

  const handleWalletUpdate = () => {
    refetchWallet();
  };

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
            <p className='text-gray-500 text-sm'>برای مشاهده درخواست‌های خود ابتدا وارد شوید</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequestsPageContent
      walletInfo={walletInfo ?? null}
      requests={requests || []}
      isLoadingWallet={isLoadingWallet}
      isLoadingRequests={isLoadingRequests}
      onWalletUpdate={handleWalletUpdate}
    />
  );
}

export default function RequestsPage() {
  const breadcrumbs: Breadcrumbs = [{ label: 'درخواست های من', href: '/requests' }];

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='درخواست های من'>
        <Suspense fallback={<RequestsCardsSkeleton />}>
          <RequestsContent />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
}
