import { api } from '@/lib/api/client';
import { APIResult } from '@/types/api';
import type { LoginByOtpResult } from '@/types/auth';

export type GetValidationCredentials = {
  nationalCode: string;
  phoneNumber: string;
};

const formatPhoneNumber = (phoneNumber: string) => {
  if (phoneNumber.startsWith('0')) return `+98${phoneNumber.replace(/^0/, '')}`;
  return phoneNumber;
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
      phoneNumber: formatPhoneNumber(credentials.phoneNumber.trim()),
    },
    {
      skipAuth: true,
      suppressErrorToast: true,
    },
  );

  return { data, resp };
};
