import 'server-only';

/**
 * Setting cookies only happen on the client-side
 */

import { cookies } from 'next/headers';

import { ACCESS_TOKEN_KEY } from '@/lib/auth/constants/cookies';

export const hasCookie = async (key: string) => {
  const cookieStore = await cookies();
  return cookieStore.has(key);
};

export const getCookie = async (key: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value;
};

export const accessToken = {
  has: () => hasCookie(ACCESS_TOKEN_KEY),
  get: () => getCookie(ACCESS_TOKEN_KEY),
};
