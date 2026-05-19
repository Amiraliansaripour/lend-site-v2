// * types
import { api } from '@/lib/api/client';
import type { APIResult, Params } from '@/types/api';

type Financier = {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
};

export const getFinanciers = async (params: Params = {}) => {
  const resp = await api.get<APIResult<Financier>>('/Financier/GetPlanForLend', params);
  return resp.data.data as Financier;
};
