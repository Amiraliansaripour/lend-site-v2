import 'client-only';

import type { LoginByOtpResult } from '@/types/auth';

const USER_INFO_KEY = 'USER_INFO';

export const getUserInfo = (): LoginByOtpResult | null => {
  if (typeof window === 'undefined') return null;

  try {
    for (const key of [USER_INFO_KEY, 'userInfo'] as const) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as LoginByOtpResult & { userId?: string };
      if (parsed && (parsed.id || parsed.userId)) return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const getUserId = (): string | null => {
  const userInfo = getUserInfo() as (LoginByOtpResult & { userId?: string }) | null;
  return userInfo?.id || userInfo?.userId || null;
};

export const setUserInfo = (data: LoginByOtpResult): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(data));
};

export const clearUserInfo = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_INFO_KEY);
};
