import { api } from '@/lib/api/client';
import type { APIResult, Params } from '@/types/api';

type Plan = {
  id: string;
  guarantedAmount: number;
  interestRate: number;
  period: number;
  planName: string;
};

export type PlanDetail = {
  id: string;
  name: string;
  financierName: string;
  period: number;
  minAmount: number;
  maxAmount: number;
  percentage: number;
  firstSystemFee: number;
  firstBankFee: number;
  duringSystemFee: number;
  duringBankFee: number;
  documentAmount?: number;
  isActive: boolean;
  guarantees?: string[];
  validateType?: number;
  ruleText?: string;
  score?: number;
};

export type FinancierPlansResponse = {
  plans: PlanDetail[];
};

export const getPlans = async (params: Params = {}) => {
  const resp = await api.get<APIResult<Plan>>('/Plan/Get', params);
  return resp.data.data as Plan;
};

export const getPlan = async (id: string, params: Params = {}) => {
  const resp = await api.get<APIResult<PlanDetail>>(`/Plan/Get/${id}`, params);
  return resp.data.data as PlanDetail;
};

export const getPlanWithoutAuth = async (id: string, params: Params = {}) => {
  const resp = await api.get<APIResult<Plan>>(`/Plan/Get/${id}`, params);
  return resp.data.data as Plan;
};

export const getFinancierPlans = async () => {
  const resp = await api.get<APIResult<FinancierPlansResponse>>('/Financier/GetPlanForLend');
  return resp.data.data;
};
