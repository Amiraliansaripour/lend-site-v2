import { useQuery } from '@tanstack/react-query';

import {
  getDakhlWalletBalance,
  getWalletInfo,
  getUserTransactions,
  mergeDakhlBalance,
} from '@/api/wallet';

export const walletKeys = {
  all: ['wallet'] as const,
  info: (nationalCode?: string) => [...walletKeys.all, 'info', nationalCode ?? ''] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
};

export const useWalletInfo = (nationalCode?: string) => {
  return useQuery({
    queryKey: walletKeys.info(nationalCode),
    queryFn: async () => {
      const walletInfo = await getWalletInfo();
      const code = nationalCode?.trim() || walletInfo?.nationalCode?.trim() || '';

      if (!code) {
        return walletInfo;
      }

      try {
        const dakhlBalance = await getDakhlWalletBalance(code);
        return mergeDakhlBalance(walletInfo, dakhlBalance, code);
      } catch {
        return walletInfo;
      }
    },
  });
};

export const useWalletTransactions = () => {
  return useQuery({
    queryKey: walletKeys.transactions(),
    queryFn: getUserTransactions,
  });
};
