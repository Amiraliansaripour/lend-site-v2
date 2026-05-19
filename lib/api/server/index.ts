import { resolveURL } from '@/utils/url';
import { accessToken } from '@/lib/auth/server/cookies';
import { isMappedBaseURL, BASE_URLS, type BaseURL } from '@/lib/api/constants';

import type { OverrideExtend, StrictOmit } from '@/types/utils';
import type { RequestInit } from 'next/dist/server/web/spec-extension/request';
import { clearUserInfo } from '@/lib/auth/client/user-info';

type $FetchOptions<P = never> = OverrideExtend<
  RequestInit,
  Partial<{
    body: P;
    baseURL: BaseURL;
    skipAuth: boolean;
  }>
>;

const $fetch = async <P, D>(url: string, options?: $FetchOptions<P>) => {
  let { body = {}, baseURL = 'DEFAULT', skipAuth = false, ...opts } = options ?? {};
  baseURL = isMappedBaseURL(baseURL) ? BASE_URLS[baseURL] : baseURL;

  const _url = resolveURL(url, baseURL);

  const payload: { body?: string } = {};

  if (options?.method !== 'GET') {
    payload.body = JSON.stringify(body);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (!skipAuth) {
    const token = accessToken.get();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(_url, {
    ...opts,
    ...payload,
    headers: { ...opts.headers, ...headers },
  });

  const data: D = await resp.json();

  if (resp.status === 401) {
    clearUserInfo();
    return { data, resp };
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
