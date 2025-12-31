import { accessToken } from '@/lib/auth/client/cookies';

export const isAuthenticated = () => {
  return accessToken.has();
};
