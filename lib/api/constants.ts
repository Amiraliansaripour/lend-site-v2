import { env } from '@/lib/env';

export type MappedBaseURL = keyof typeof BASE_URLS;

export type BaseURL = MappedBaseURL | (string & Record<never, never>);

export const BASE_URLS = {
  DEFAULT: env.NEXT_PUBLIC_API_BASE_URL,
} as const;

export const isMappedBaseURL = (baseURL: BaseURL): baseURL is MappedBaseURL => {
  return baseURL in BASE_URLS;
};
