import { api } from '@/lib/api/client';
import { APIResult } from '@/types/api';
import type { LoginByOtpResult } from '@/types/auth';

export type GetValidationCredentials = {
  nationalCode: string;
  phoneNumber: string;
};

export type LendtechLoginPayload = {
  phoneNumber: string;
};

/** Inner payload from TCI, as returned by Platform/lendtech-login */
export type LendtechLoginData = {
  token?: string;
  refresh_token?: string;
  expires_in?: number;
  login_url?: string;
  deep_link?: string;
  message?: string;
  user?: {
    id?: string;
    phone?: string;
    name?: string;
    lastname?: string;
    national_id?: string;
    kyc_level?: number;
    is_new?: boolean;
  };
  /** Some backends nest the TCI body again under data */
  data?: {
    login_url?: string;
    deep_link?: string;
    message?: string;
  };
};

/** Backend always expects E.164 Iran numbers: +98XXXXXXXXXX */
export const formatPlatformPhoneNumber = (phoneNumber: string) => {
  let phone = phoneNumber.trim().replace(/[\s-]/g, '');

  if (phone.startsWith('+98')) return phone;
  if (phone.startsWith('98')) return `+${phone}`;
  if (phone.startsWith('0')) return `+98${phone.slice(1)}`;
  if (/^9\d{9}$/.test(phone)) return `+98${phone}`;

  return phone.startsWith('+') ? phone : `+98${phone}`;
};

/**
 * External-site entry validation.
 * POST /Platform/GetValidation — returns the same token payload shape as OTP login.
 * Must use skipAuth: this call authenticates the user; no cookie exists yet.
 */
export const getValidation = async (credentials: GetValidationCredentials) => {
  const { data, resp } = await api.post<GetValidationCredentials, APIResult<LoginByOtpResult>>(
    '/Platform/GetValidation',
    {
      nationalCode: credentials.nationalCode.trim(),
      phoneNumber: formatPlatformPhoneNumber(credentials.phoneNumber),
    },
    {
      skipAuth: true,
      suppressErrorToast: true,
    },
  );

  return { data, resp };
};

/**
 * Mokhaberat SSO — logged-in users with a phone.
 * POST /Platform/lendtech-login → { login_url } (possibly nested under data.data)
 */
export const lendtechLogin = async (phoneNumber: string) => {
  const { data, resp } = await api.post<LendtechLoginPayload, APIResult<LendtechLoginData>>(
    '/Platform/lendtech-login',
    { phoneNumber: formatPlatformPhoneNumber(phoneNumber) },
    { suppressErrorToast: true },
  );

  return { data, resp };
};

export const extractLendtechLoginUrl = (result?: APIResult<LendtechLoginData> | null) => {
  const payload = result?.data;
  if (!payload) return undefined;
  return payload.login_url || payload.data?.login_url || undefined;
};
