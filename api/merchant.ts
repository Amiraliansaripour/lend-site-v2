import { api } from '@/lib/api/client';
import type { APIResult } from '@/types/api';

export type MerchantSignupData = {
  isActive: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  url: string;
  category: number;
  status: number;
  description: string;
  cityName: string;
  organName: string;
};

export type MerchantSignupResponse = {
  isSuccess: boolean;
  message?: string;
};

export const createMerchantSignupRequest = async (data: MerchantSignupData) => {
  const { data: response, resp } = await api.post<
    MerchantSignupData,
    APIResult<MerchantSignupResponse>
  >('/CooperateRequest/Create', data);

  if (resp.status === 401) {
    throw new Error('دسترسی برای ثبت درخواست همکاری مجاز نیست.');
  }

  if (!resp.ok) {
    throw new Error(response?.message || 'ارسال درخواست با خطا مواجه شد.');
  }

  return response;
};
