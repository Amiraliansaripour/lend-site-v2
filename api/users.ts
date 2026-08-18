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

const formatPhoneNumber = (phoneNumber: string) => {
  if (phoneNumber.startsWith('0')) return `+98${phoneNumber.replace(/^0/, '')}`;

  return phoneNumber;
};

export const loginByUsername = async (credentials: LoginByUsernameCredentials) => {
  const resp = await api.post<LoginByUsernameCredentials, APIResult<LoginByUsernameResult>>(
    '/Register/UserRegister',
    { ...credentials, phoneNumber: formatPhoneNumber(credentials.phoneNumber || '') },
    {
      skipAuth: true,
      headers: {
        'X-CaptchaCode': credentials.X_CaptchaCode,
        'X-CaptchaId': credentials.X_CaptchaId,
      },
    },
  );

  return resp.data;
};

export const loginByOtp = async (credentials: LoginByOtpCredentials) => {
  const resp = await api.post<LoginByOtpCredentials, APIResult<LoginByOtpResult>>('/User/Token', {
    ...credentials,
    phoneNumber: formatPhoneNumber(credentials.phoneNumber || ''),
  });

  return resp.data;
};

export const getUser = async (id: string) => {
  const resp = await api.get<APIResult<User>>(`/User/Get/${id}`);

  return resp.data.data;
};

export const getUserAndUpdateStore = async (id: string) => {
  const resp = await api.get<APIResult<User>>(`/User/Get/${id}`);

  if (resp.data.isSuccess && resp.data.data) {
    // Update localStorage with fresh user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(resp.data.data));
    }
  }

  return resp.data.data;
};
