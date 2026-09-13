import { useQuery } from '@tanstack/react-query';

import {
  getWalletDakhl,
  getWalletInfo,
  getUserTransactions,
  mergeDakhlBalance,
} from '@/api/wallet';
import { accessToken } from '@/lib/auth/client/cookies';

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
      const token = accessToken.get();
      const code = nationalCode?.trim() || walletInfo?.nationalCode?.trim() || '';

      if (!code || !token) {
        return walletInfo;
      }

      try {
        const dakhl = await getWalletDakhl({ nationalCode: code, accessToken: token });
        return mergeDakhlBalance(walletInfo, dakhl?.balance ?? 0, code);
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
