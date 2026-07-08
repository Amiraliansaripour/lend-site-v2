export type MappedBaseURL = keyof typeof BASE_URLS;

export type BaseURL = MappedBaseURL | (string & Record<never, never>);

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseURL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
}

export const BASE_URLS = {
  DEFAULT: apiBaseURL,
} as const;

export const isMappedBaseURL = (baseURL: BaseURL): baseURL is MappedBaseURL => {
  return baseURL in BASE_URLS;
};
