import { resolveURL } from '@/utils/url';
import { accessToken } from '@/lib/auth/client/cookies';
import { isMappedBaseURL, BASE_URLS, type BaseURL } from '@/lib/api/constants';
import { toast } from 'sonner';
import { clearUserInfo } from '@/lib/auth/client/user-info';

import type { OverrideExtend, StrictOmit } from '@/types/utils';
import type { RequestInit } from 'next/dist/server/web/spec-extension/request';
import { APIResult } from '@/types/api';

type $FetchOptions<P = never> = OverrideExtend<
  RequestInit,
  Partial<{
    body: P;
    baseURL: BaseURL;
    skipAuth: boolean;
    suppressErrorToast: boolean;
  }>
>;

const $fetch = async <P, D>(url: string, options?: $FetchOptions<P>) => {
  let {
    body = {},
    baseURL = 'DEFAULT',
    skipAuth = false,
    suppressErrorToast = false,
    ...opts
  } = options ?? {};
  baseURL = isMappedBaseURL(baseURL) ? BASE_URLS[baseURL] : baseURL;

  const _url = resolveURL(url, baseURL);

  const payload: { body?: string } = {};

  if (options?.method !== 'GET') {
    payload.body = JSON.stringify(body);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = accessToken.get();
  if (!skipAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(_url, {
    ...opts,
    ...payload,
    // Caller headers win so explicit Authorization (e.g. recipient userToken) is preserved
    headers: { ...headers, ...opts.headers },
  });

  if (resp.status === 401) {
    // Public pages (or explicit skipAuth calls) should never force a redirect.
    if (!skipAuth) {
      clearUserInfo();
      accessToken.delete();

      const pathname = window.location.pathname || '';
      const isDashboardLikeRoute =
        pathname.includes('/dashboard') ||
        pathname.includes('/requests') ||
        pathname.includes('/wallets') ||
        pathname.includes('/installments') ||
        pathname.includes('/profile') ||
        pathname.includes('/cards');

      if (isDashboardLikeRoute) {
        window.location.href = '/';
      }
    }

    return { data: undefined as unknown as D, resp };
  }

  const text = await resp.text();
  let data: D = {} as D;

  if (text) {
    try {
      data = JSON.parse(text) as D;
    } catch {
      if (!resp.ok) {
        toast.error(`Request failed with status ${resp.status}`);
      }
      return { data, resp };
    }
  }

  if (!resp.ok && !suppressErrorToast) {
    toast.error((data as APIResult<D>)?.message ?? `Request failed with status ${resp.status}`);
  }

  return { data, resp };
};

type ApiClientOptions = StrictOmit<$FetchOptions, 'body'>;

export const api = {
  get: <D>(url: string, options?: ApiClientOptions) => {
    return $fetch<never, D>(url, { ...options, method: 'GET' });
  },

  post: <P, D>(url: string, payload: P, options?: ApiClientOptions) => {
    return $fetch<P, D>(url, { ...options, body: payload, method: 'POST' });
  },

  put: <P, D>(url: string, payload: P, options?: ApiClientOptions) => {
    return $fetch<P, D>(url, { ...options, body: payload, method: 'PUT' });
  },

  patch: <P, D>(url: string, payload: P, options?: ApiClientOptions) => {
    return $fetch<P, D>(url, { ...options, body: payload, method: 'PATCH' });
  },

  delete: <P, D>(url: string, payload: P, options?: ApiClientOptions) => {
    return $fetch<P, D>(url, { ...options, body: payload, method: 'DELETE' });
  },
};
