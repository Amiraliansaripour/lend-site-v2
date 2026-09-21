/** Inbound theme from external deep links (`?theme=light|dark`). */

export const THEME_QUERY_KEY = 'theme';

export type InboundTheme = 'light' | 'dark';

/**
 * Accepts only explicit light/dark from partner systems.
 * Ignores auto/system/empty so existing app preference is unchanged.
 */
export function parseInboundThemeParam(value: string | null | undefined): InboundTheme | null {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'light' || normalized === 'dark') return normalized;
  return null;
}

export function readInboundThemeFromSearch(
  searchParams: URLSearchParams | { get(name: string): string | null },
): InboundTheme | null {
  return parseInboundThemeParam(searchParams.get(THEME_QUERY_KEY));
}
