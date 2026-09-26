'use client';

import {
  WalletBalanceCards,
  WalletBalanceCardsSkeleton,
} from '@/components/page/wallets/wallet-balance-cards';
import type { WalletInfo } from '@/api/wallet';
import type { Request } from './request-types';

type RequestsCardsProps = {
  walletInfo: WalletInfo | null;
  requests: Request[];
  isLoading: boolean;
  onWalletUpdate: () => void;
};

export function RequestsCards({ walletInfo, onWalletUpdate }: RequestsCardsProps) {
  return <WalletBalanceCards walletInfo={walletInfo} onWalletUpdate={onWalletUpdate} />;
}

export function RequestsCardsSkeleton() {
  return <WalletBalanceCardsSkeleton />;
}
