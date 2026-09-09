import { api } from '@/lib/api/client';
import { APIResult } from '@/types/api';
import type { LoginByOtpResult } from '@/types/auth';

export type GetValidationCredentials = {
  nationalCode: string;
  phoneNumber: string;
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
