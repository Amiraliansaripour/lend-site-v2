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

const sumNullable = (values: (number | null | undefined)[]): number =>
  values.reduce<number>((total, value) => total + (value ?? 0), 0);

export const aggregateWalletInfo = (wallets: WalletInfo[]): WalletInfo | null => {
  if (wallets.length === 0) return null;

  const [first] = wallets;

  return {
    ...first,
    credit: sumNullable(wallets.map(wallet => wallet.credit)),
    cash: sumNullable(wallets.map(wallet => wallet.cash)),
    sumCreditCharg: sumNullable(wallets.map(wallet => wallet.sumCreditCharg)),
    sumCreditBuy: sumNullable(wallets.map(wallet => wallet.sumCreditBuy)),
  };
};

export const getWalletInfo = async (): Promise<WalletInfo | null> => {
  const { data } = await api.get<APIResult<WalletInfo[]>>('/WalletReport/GetWallets', {
    baseURL: 'REPORT',
  });

  if (data?.isSuccess && Array.isArray(data.data)) {
    return aggregateWalletInfo(data.data);
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
    },
  );
  return data ?? null;
};

// --- Installment payment (recipient) ---

export type HasInstallmentPlan = {
  id: string;
  name: string;
  period: number;
  minAmount: number;
  maxAmount: number;
  percentage: number;
  firstSystemFee: number;
  firstBankFee: number;
  duringSystemFee: number;
  duringBankFee: number;
  hasInstallment: boolean;
  isActive: boolean;
  score?: string;
  documentAmount?: number;
  ruleText?: string;
};

export const getHasInstallmentPlans = async (userToken: string): Promise<HasInstallmentPlan[]> => {
  const { data } = await api.get<APIResult<HasInstallmentPlan[]>>('/Plan/GetHasInstallment', {
    skipAuth: true,
    headers: { Authorization: `Bearer ${userToken}` },
  });

  if (data?.isSuccess && Array.isArray(data.data)) {
    return data.data.filter(p => p.isActive && p.hasInstallment);
  }
  return [];
};

export type CreateHasInstallmentPayload = {
  amount: number;
  planId: string | null;
  nationalcode: string;
  orderId: number;
  isOnline: true;
};

export type CreateHasInstallmentResult = {
  id: string;
  requestNumber: number;
  planId?: string;
  planName?: string;
  planPeriod?: string;
  period?: number;
  creditAmount?: number;
  feeAmount?: number;
  totalRefundAmount?: number;
};

export const createHasInstallment = async (
  payload: CreateHasInstallmentPayload,
  userToken: string,
): Promise<APIResult<CreateHasInstallmentResult> | null> => {
  const { data } = await api.post<
    CreateHasInstallmentPayload,
    APIResult<CreateHasInstallmentResult>
  >('/Request/CreateHasInstallment', payload, {
    skipAuth: true,
    headers: { Authorization: `Bearer ${userToken}` },
  });
  return data ?? null;
};

export type PaymentLoanDetail = {
  id: string;
  loanIndex: number;
  amount: number;
  loanDetailStatus: number;
  dueDate: string;
  payedAt?: string | null;
  penaltyAmount?: number;
  mainAmount?: number;
  systemFeeAmount?: number;
  bankFeeAmount?: number;
  orderId?: number;
  loanHeaderId?: string;
};

export type PaymentLoanHeader = {
  id: string;
  loanStatus: number;
  numberOfCoupons: number;
  couponAmount: number;
  feeAmount: number;
  totalInstallmentAmount: number;
  firstInstallmentDate: string;
  lastInstallmentDate: string;
  amount: number;
  requestPlanPeriod?: string;
  requestCreditAmount?: string;
  requestRequestNumber?: string;
  nearInstallmentDate?: string;
  requestId?: string;
  requestPlanFinancierName?: string;
  loanDetails: PaymentLoanDetail[];
  firstSystemFee?: number;
  firstBankFee?: number;
  duringSystemFee?: number;
  duringBankFee?: number;
  orderId?: number;
};

export const getUserLoan = async (userToken: string): Promise<PaymentLoanHeader[]> => {
  const { data } = await api.get<APIResult<PaymentLoanHeader[]>>('/LoanHeader/GetUserLoan', {
    skipAuth: true,
    headers: { Authorization: `Bearer ${userToken}` },
  });

  if (data?.isSuccess && Array.isArray(data.data)) return data.data;
  return [];
};
