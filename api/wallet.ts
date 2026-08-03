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

// --- Merchant payment gateway ---

export type MerchantTokenPayload = {
  username: string;
  password: string;
  grant_type: 'password';
};

export type MerchantTokenResult = {
  access_token: string;
  expires_in: string;
};

export const getMerchantToken = async (
  payload: MerchantTokenPayload,
): Promise<APIResult<MerchantTokenResult>> => {
  const { data } = await api.post<MerchantTokenPayload, APIResult<MerchantTokenResult>>(
    '/User/MerchantToken',
    payload,
    { skipAuth: true },
  );
  return data;
};

export type GetOrderIdPayload = {
  nationalcode: string;
  amount: number;
  IsOnline: true;
};

export type GetOrderIdResult = {
  merchantId: string;
  orderId: number;
};

export const getOrderId = async (
  payload: GetOrderIdPayload,
  merchantToken: string,
): Promise<APIResult<GetOrderIdResult>> => {
  const { data } = await api.post<GetOrderIdPayload, APIResult<GetOrderIdResult>>(
    '/WalletReport/GetOrderId',
    payload,
    {
      skipAuth: true,
      headers: { Authorization: `Bearer ${merchantToken}` },
      baseURL: 'REPORT',
    },
  );
  return data;
};

export type MerchantInfo = {
  id: string;
  name: string;
  organName?: string;
  url?: string;
};

export const getMerchantInfo = async (merchantId: string): Promise<MerchantInfo | null> => {
  const { data } = await api.get<APIResult<MerchantInfo>>(`/Merchant/Get/${merchantId}`, {
    skipAuth: true,
  });
  if (data?.isSuccess && data.data) return data.data;
  return null;
};

export type ConfirmOtpPayload = {
  otp: string;
  orderId: number;
  inOnline: true;
};

export type ConfirmOtpResult = {
  otp?: string;
  isAccepted: boolean;
  userToken: string;
};

export const confirmOtp = async (payload: ConfirmOtpPayload): Promise<ConfirmOtpResult | null> => {
  const { data } = await api.post<
    ConfirmOtpPayload,
    ConfirmOtpResult | APIResult<ConfirmOtpResult>
  >('/WalletReport/ConfirmOtp', payload, { skipAuth: true });

  if (!data) return null;
  if ('userToken' in data && data.userToken) return data as ConfirmOtpResult;
  if ('data' in data && data.data?.userToken) return data.data;
  return null;
};

export type ValidWallet = {
  id: string;
  walletType: number;
  walletTypeDescription: string;
  remain: number;
};

export type ValidWalletsPayload = {
  orderId: number;
  nationalcode: string;
  isOnline: true;
};

export const getValidWallets = async (
  payload: ValidWalletsPayload,
  userToken: string,
): Promise<ValidWallet[]> => {
  const { data } = await api.post<ValidWalletsPayload, APIResult<ValidWallet[]> | ValidWallet[]>(
    '/WalletReport/ValidWallets',
    payload,
    {
      skipAuth: true,
      headers: { Authorization: `Bearer ${userToken}` },
      baseURL: 'REPORT',
    },
  );

  if (Array.isArray(data)) return data;
  if (data && 'data' in data && Array.isArray(data.data)) return data.data;
  return [];
};

export type WalletListItem = {
  id: string;
  walletType: number;
  amount: number;
};

export type FreezRequestPayload = {
  orderId: number;
  freezAmount: number;
  walletList: WalletListItem[];
};

export type FreezRequestResult = {
  success?: number;
  orderId?: number;
  freezAmount?: number;
  resultMessage?: string;
  dateTimeFreez?: string;
  message?: string;
  isSuccess?: boolean;
};

export const freezRequest = async (
  payload: FreezRequestPayload,
  userToken: string,
): Promise<FreezRequestResult | null> => {
  const { data } = await api.post<FreezRequestPayload, FreezRequestResult>(
    '/WalletReport/FreezRequest',
    payload,
    {
      skipAuth: true,
      headers: { Authorization: `Bearer ${userToken}` },
      baseURL: 'REPORT',
    },
  );
  return data ?? null;
};

export type ConfirmOrderPayload = {
  orderId: number;
};

export type ConfirmOrderResult = {
  orderId?: number;
  freezAmount?: number;
  resultMessage?: string;
  dateTimeFreez?: string;
  dateTimeFinal?: string;
  message?: string;
  isSuccess?: boolean;
};

export const confirmOrder = async (
  payload: ConfirmOrderPayload,
  merchantToken: string,
): Promise<ConfirmOrderResult | null> => {
  const { data } = await api.put<ConfirmOrderPayload, ConfirmOrderResult>(
    '/WalletReport/Confirm',
    payload,
    {
      skipAuth: true,
      headers: { Authorization: `Bearer ${merchantToken}` },
      baseURL: 'REPORT',
    },
  );
  return data ?? null;
};
