import { api } from '@/lib/api/client';
import type { APIResult } from '@/types/api';

export type WalletInfo = {
  nationalCode: string;
  creationTime: string;
  cash: number;
  firstName: string;
  lastName: string;
  credit: number;
  id: string;
  cachRemain: number | null;
  cachId: string | null;
  cachMinDateCharg: string | null;
  cachMaxDateCharg: string | null;
  sumCachCharg: number | null;
  cachMinDateBuy: string | null;
  cachMaxDateBuy: string | null;
  sumCachBuy: number | null;
  creditMinDateCharg: string | null;
  creditMaxDateCharg: string | null;
  sumCreditCharg: number | null;
  creditMinDateBuy: string | null;
  creditMaxDateBuy: string | null;
  sumCreditBuy: number | null;
};

export type WalletTransaction = {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  dateTimeFreez: string;
  dateTimeFinal: string | null;
  orderId: number;
  freezAmount: number;
  transactionType: number;
  merchantName: string | null;
  creditType: string;
  creditAccountId: string;
  creditCachAccountId: string | null;
  amountAfterPercentFree: number | null;
  creditPercentFree: number | null;
  cashPercentFree: number | null;
  isClear: boolean | null;
  dateTimeClear: string | null;
};

export const getWalletInfo = async (): Promise<WalletInfo | null> => {
  const { data } = await api.get<APIResult<WalletInfo[]>>('/WalletReport/GetWallets', {
    baseURL: 'REPORT',
  });

  if (data?.isSuccess && Array.isArray(data.data)) {
    return data.data[0] ?? null;
  }

  return null;
};

export const getUserTransactions = async (): Promise<WalletTransaction[]> => {
  const { data } = await api.get<APIResult<WalletTransaction[]>>('/WalletReport/UserTransaction', {
    baseURL: 'REPORT',
  });

  if (data?.isSuccess && Array.isArray(data.data)) {
    return [...data.data].sort((a, b) => {
      const aTime = new Date(a.dateTimeFreez).getTime();
      const bTime = new Date(b.dateTimeFreez).getTime();
      return bTime - aTime;
    });
  }

  return [];
};

export type WalletUser = {
  cachId: string | null;
  creditId: string | null;
};

export type PaymentTokenResponse = {
  token: string;
  terminalID: string;
  merchantId: string;
};

export const getWalletUser = async (): Promise<WalletUser[]> => {
  const { data } = await api.get<APIResult<WalletUser[]>>('/WalletReport/GetWalletUser', {
    baseURL: 'REPORT',
  });

  if (data?.isSuccess && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

export const createCashWallet = async (): Promise<void> => {
  await api.post('/WalletReport/CachRequest', {}, { baseURL: 'REPORT' });
};

export type PaymentTokenPayload = {
  creditCachAccountId: string;
  amount: number;
  payType: number;
};

export const getPaymentToken = async (
  payload: PaymentTokenPayload,
): Promise<PaymentTokenResponse | null> => {
  const { data } = await api.post<PaymentTokenPayload, APIResult<PaymentTokenResponse>>(
    '/Pay/GetToken',
    payload,
  );

  if (data?.isSuccess && data.data) {
    return data.data;
  }

  return null;
};
