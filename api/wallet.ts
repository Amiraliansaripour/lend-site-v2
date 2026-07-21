import { api } from '@/lib/api/client';

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
  const { data } = await api.get<WalletInfo[]>('/WalletReport/GetWallets');

  if (data && Array.isArray(data) && data.length > 0) {
    return data[0];
  }

  return null;
};

export const getUserTransactions = async (): Promise<WalletTransaction[]> => {
  const { data } = await api.get<WalletTransaction[]>('/WalletReport/UserTransaction', {
    baseURL: 'REPORT',
  });

  if (data && Array.isArray(data)) {
    // Sort by orderId descending (newest first)
    return data.sort((a, b) => b.orderId - a.orderId);
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
  const { data } = await api.get<WalletUser[]>('/WalletReport/GetWalletUser', {
    baseURL: 'REPORT',
  });

  if (data && Array.isArray(data)) {
    return data;
  }

  return [];
};

export const createCashWallet = async (): Promise<void> => {
  await api.post('/WalletReport/CachRequest', {});
};

export type PaymentTokenPayload = {
  creditCachAccountId: string;
  amount: number;
  payType: number;
};

export const getPaymentToken = async (
  payload: PaymentTokenPayload,
): Promise<PaymentTokenResponse | null> => {
  const { data } = await api.post<PaymentTokenPayload, { data: PaymentTokenResponse }>(
    '/Pay/GetToken',
    payload,
  );
  console.log(data);
  if (data && data.data) {
    return data.data;
  }

  return null;
};
