import { accessToken } from '@/lib/auth/client/cookies';
import { clearUserInfo } from '@/lib/auth/client/user-info';

export const isAuthenticated = () => {
  return accessToken.has();
};

export const logout = () => {
  accessToken.delete();
  clearUserInfo();
};
