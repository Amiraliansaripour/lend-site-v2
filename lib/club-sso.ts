/** Customer-club (tcclub) SSO — browser + shared constants. */

export type ClubSsoTheme = 'light' | 'dark' | 'auto';

export const CUSTOMER_CLUB_APP_URL = 'https://tcclub.ir/app';

/** POST target from the technical guide (form-urlencoded `assertion` + `theme`). */
export const CUSTOMER_CLUB_SSO_URL = 'https://api.tcclub.ir/api/integrations/partners/lendtech/sso';

export const toIranMobile09 = (phone: string) => {
  let value = phone.trim().replace(/[\s-]/g, '');
  if (value.startsWith('+98')) value = `0${value.slice(3)}`;
  else if (value.startsWith('0098')) value = `0${value.slice(4)}`;
  else if (value.startsWith('98') && value.length >= 12) value = `0${value.slice(2)}`;
  else if (/^9\d{9}$/.test(value)) value = `0${value}`;
  return value;
};

export const isIranMobile09 = (phone: string) => /^09\d{9}$/.test(phone);

export const isNationalCode = (code: string) => /^\d{10}$/.test(code.trim());

export const toClubSsoTheme = (value: string | null | undefined): ClubSsoTheme => {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'light' || normalized === 'dark') return normalized;
  // system / empty / unknown → auto (club follows device)
  return 'auto';
};

export const getClubSsoThemeFromBrowser = (): ClubSsoTheme => {
  if (typeof window === 'undefined') return 'auto';

  try {
    return toClubSsoTheme(localStorage.getItem('theme'));
  } catch {
    return 'auto';
  }
};

export function submitClubSsoAssertion(assertion: string, theme?: ClubSsoTheme) {
  const resolvedTheme = toClubSsoTheme(theme ?? getClubSsoThemeFromBrowser());

  const form = document.createElement('form');
  form.id = 'club-sso';
  form.method = 'post';
  form.action = CUSTOMER_CLUB_SSO_URL;
  form.enctype = 'application/x-www-form-urlencoded';
  form.acceptCharset = 'UTF-8';
  form.style.display = 'none';

  const assertionInput = document.createElement('input');
  assertionInput.type = 'hidden';
  assertionInput.name = 'assertion';
  assertionInput.value = assertion;
  form.appendChild(assertionInput);

  const themeInput = document.createElement('input');
  themeInput.type = 'hidden';
  themeInput.name = 'theme';
  themeInput.value = resolvedTheme;
  form.appendChild(themeInput);

  document.body.appendChild(form);
  form.submit();
}
