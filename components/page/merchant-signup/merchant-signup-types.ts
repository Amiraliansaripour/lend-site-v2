import { StaticImageData } from 'next/image';

export type MerchantCategory = 0 | 1 | 3;

export type MerchantSignupFormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  url?: string;
  category: MerchantCategory;
  cityName?: string;
  organName: string;
  description?: string;
};

export type MerchantSignupPayload = MerchantSignupFormData & {
  isActive: boolean;
  status: number;
};

export type MerchantSignupResponse = {
  isSuccess: boolean;
  message?: string;
};

export type ProcessStep = {
  step: number;
  title: string;
  img?: StaticImageData | string;
  description: string;
};
