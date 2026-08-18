'use client';

import { RequestsCards, RequestsCardsSkeleton } from './requests-cards';
import { RequestsTableComponent } from './requests-table-component';
import type { Request } from './request-types';
import type { WalletInfo } from '@/api/wallet';

type RequestsPageContentProps = {
  walletInfo: WalletInfo | null;
  requests: Request[];
  isLoadingWallet: boolean;
  isLoadingRequests: boolean;
  onWalletUpdate: () => void;
};

export function RequestsPageContent({
  walletInfo,
  requests,
  isLoadingWallet,
  isLoadingRequests,
  onWalletUpdate,
}: RequestsPageContentProps) {
  const isLoading = isLoadingWallet || isLoadingRequests;

  return (
    <div className='w-full min-w-0'>
      {isLoading ? (
        <RequestsCardsSkeleton />
      ) : (
        <RequestsCards
          walletInfo={walletInfo}
          requests={requests}
          isLoading={isLoadingRequests}
          onWalletUpdate={onWalletUpdate}
        />
      )}

      <div className='mt-6 min-w-0 overflow-x-auto rounded-xl bg-white p-4 sm:p-6'>
        <RequestsTableComponent requests={requests} />
      </div>
    </div>
  );
}
