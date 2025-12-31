import { accessToken } from '@/lib/auth/server/cookies';

export const isAuthenticated = () => {
  return accessToken.has();
};
