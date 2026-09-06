import 'client-only';

import { accessToken } from '@/lib/auth/client/cookies';
import { clearUserInfo, setUserInfo } from '@/lib/auth/client/user-info';
import { getValidation } from '@/api/platform';
import type { LoginByOtpResult } from '@/types/auth';

export type PlatformEntryParams = {
  nationalCode: string;
  phoneNumber: string;
};

/** Query keys accepted from the external site link. */
export const readPlatformEntryParams = (
  searchParams: URLSearchParams,
): PlatformEntryParams | null => {
  const nationalCode =
    searchParams.get('nationalCode') ||
    searchParams.get('nationalcode') ||
    searchParams.get('NationalCode') ||
    '';
  const phoneNumber =
    searchParams.get('phoneNumber') ||
    searchParams.get('phonenumber') ||
    searchParams.get('mobile') ||
    searchParams.get('phone') ||
    '';

  if (!nationalCode.trim() || !phoneNumber.trim()) return null;
  return {
    nationalCode: nationalCode.trim(),
    phoneNumber: phoneNumber.trim(),
  };
};

export const applyPlatformSession = (data: LoginByOtpResult) => {
  accessToken.set(data.access_token);
  setUserInfo(data);
};

export const clearPlatformSession = () => {
  clearUserInfo();
  accessToken.delete();
};

/**
 * Calls GetValidation and applies session on success.
 * Returns true when the user is authorized (HTTP 200 + isSuccess + access_token).
 */
export const validatePlatformEntry = async (
  params: PlatformEntryParams,
): Promise<{ ok: true; data: LoginByOtpResult } | { ok: false }> => {
  try {
    const { data, resp } = await getValidation(params);

    if (resp.status === 200 && data?.isSuccess && data?.data?.access_token && data?.data?.id) {
      applyPlatformSession(data.data);
      return { ok: true, data: data.data };
    }

    return { ok: false };
  } catch {
    return { ok: false };
  }
};
