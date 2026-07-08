<<<<<<< HEAD
import { useQuery } from '@tanstack/react-query';

import { getWalletInfo, getUserTransactions } from '@/api/wallet';

export const walletKeys = {
  all: ['wallet'] as const,
  info: () => [...walletKeys.all, 'info'] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
};

export const useWalletInfo = () => {
  return useQuery({
    queryKey: walletKeys.info(),
    queryFn: getWalletInfo,
  });
};

export const useWalletTransactions = () => {
  return useQuery({
    queryKey: walletKeys.transactions(),
    queryFn: getUserTransactions,
  });
};
=======
import { useQuery } from '@tanstack/react-query';

import { getWalletInfo, getUserTransactions } from '@/api/wallet';

export const walletKeys = {
  all: ['wallet'] as const,
  info: () => [...walletKeys.all, 'info'] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
};

export const useWalletInfo = () => {
  return useQuery({
    queryKey: walletKeys.info(),
    queryFn: getWalletInfo,
  });
};

export const useWalletTransactions = () => {
  return useQuery({
    queryKey: walletKeys.transactions(),
    queryFn: getUserTransactions,
  });
};
>>>>>>> a47b58a (pwa)
