import { api } from '@/lib/api/client';
import type { APIResult } from '@/types/api';
import type {
  LoanHeader,
  PaymentTokenResponse,
} from '@/components/page/installments/installments-types';

export const getUserLoans = async (userId: string) => {
  const resp = await api.get<APIResult<LoanHeader[]>>(`/LoanHeader/GetUserLoan?userid=${userId}`);
  return resp.data.data as LoanHeader[];
};

type PaymentTokenPayload = {
  loanDetailId: string;
  payType: number;
};

export const getPaymentToken = async (loanDetailId: string, payType: number = 1) => {
  const payload: PaymentTokenPayload = {
    loanDetailId,
    payType,
  };
  const resp = await api.post<PaymentTokenPayload, APIResult<PaymentTokenResponse>>(
    '/Pay/GetToken',
    payload,
  );
  return resp.data.data as PaymentTokenResponse;
};
