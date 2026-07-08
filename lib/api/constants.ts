<<<<<<< HEAD
import { env } from '@/lib/env';

=======
>>>>>>> a47b58a (pwa)
export type MappedBaseURL = keyof typeof BASE_URLS;

export type BaseURL = MappedBaseURL | (string & Record<never, never>);

export const BASE_URLS = {
<<<<<<< HEAD
  DEFAULT: env.NEXT_PUBLIC_API_BASE_URL,
=======
  DEFAULT: process.env.NEXT_PUBLIC_API_BASE_URL,
>>>>>>> a47b58a (pwa)
} as const;

export const isMappedBaseURL = (baseURL: BaseURL): baseURL is MappedBaseURL => {
  return baseURL in BASE_URLS;
};
