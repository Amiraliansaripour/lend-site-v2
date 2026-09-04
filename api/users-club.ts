// * zod
import z from 'zod';

// * api
import { api } from '@/lib/api/client';
import { APIResult } from '@/types/api';

// * types
import {
  LoginByUsernameCredentials,
  LoginByUsernameResult,
  LoginByOtpCredentials,
  LoginByOtpResult,
  User,
} from '@/types/auth';

export const LoginSchema = z.object({
  phoneNumber: z.string().min(1, 'فیلد اجباری'),
  X_CaptchaCode: z.string().min(1, 'فیلد اجباری'),
});

export const LoginOtpSchema = z.object({
  otp: z.string().min(1, 'فیلد اجباری'),
});

// * platform club (loyalty points)
export type PlatformClubCustomer = {
  nationalCode: string;
  point: number;
  [key: string]: unknown;
};

export const getPlatformClubCustomer = async (nationalCode: string) => {
  const resp = await api.get<APIResult<PlatformClubCustomer>>(
    `/PlatformClub/GetCustomer/${nationalCode}`,
  );

  return resp.data.data;
};
