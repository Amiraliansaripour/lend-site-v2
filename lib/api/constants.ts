export type MappedBaseURL = keyof typeof BASE_URLS;

export type BaseURL = MappedBaseURL | (string & Record<never, never>);

const normalizeApiBaseURL = (value: string | undefined) => {
  if (!value) return undefined;

  // Strip wrapping quotes from .env values like 'https://...'
  let url = value.trim().replace(/^['"]|['"]$/g, '');

  // Relative hosts become paths on the current site; force absolute.
  if (url && !/^https?:\/\//i.test(url)) {
    url = `https://${url.replace(/^\/+/, '')}`;
  }

  return url.replace(/\/+$/, '');
};

const apiBaseURL = normalizeApiBaseURL(process.env.NEXT_PUBLIC_API_BASE_URL);

if (!apiBaseURL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
}

export const BASE_URLS = {
  DEFAULT: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
} as const;

export const isMappedBaseURL = (baseURL: BaseURL): baseURL is MappedBaseURL => {
  return baseURL in BASE_URLS;
};
