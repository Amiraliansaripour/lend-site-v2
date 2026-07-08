import 'client-only';

import type { LoginByOtpResult } from '@/types/auth';

const USER_INFO_KEY = 'USER_INFO';

export const getUserInfo = (): LoginByOtpResult | null => {
  if (typeof window === 'undefined') return null;

  try {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  } catch {
    return null;
  }
};

export const getUserId = (): string | null => {
  const userInfo = getUserInfo();
  return userInfo?.id || null;
};

export const setUserInfo = (data: LoginByOtpResult): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(data));
};

export const clearUserInfo = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_INFO_KEY);
};
