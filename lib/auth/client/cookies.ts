import 'client-only';

import Cookies from 'js-cookie';
import { ACCESS_TOKEN_KEY } from '../constants/cookies';

export const getCookie = (key: string) => {
  return Cookies.get(key);
};

export const hasCookie = (key: string) => {
  return getCookie(key) !== undefined;
};

export const setCookie = (
  key: string,
  value: string,
  options?: Cookies.CookieAttributes
) => {
  return Cookies.set(key, value, options);
};

export const deleteCookie = (key: string) => {
  return Cookies.remove(key);
};

export const accessToken = {
  has: () => hasCookie(ACCESS_TOKEN_KEY),
  get: () => getCookie(ACCESS_TOKEN_KEY),
  set: (token: string) => setCookie(ACCESS_TOKEN_KEY, token),
  delete: () => deleteCookie(ACCESS_TOKEN_KEY),
};
