/** Customer-club (tcclub) SSO — browser + shared constants. */

export const CUSTOMER_CLUB_APP_URL = 'https://tcclub.ir/app';

/** POST target from the technical guide (form-urlencoded `assertion`). */
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

/**
 * Auto-submit browser form (guide §7). Must run in the user agent so the 302
 * redirect to tcclub.ir/app/sso#… is followed in the same window.
 */
export function submitClubSsoAssertion(assertion: string) {
  const form = document.createElement('form');
  form.id = 'club-sso';
  form.method = 'post';
  form.action = CUSTOMER_CLUB_SSO_URL;
  form.acceptCharset = 'UTF-8';
  form.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'assertion';
  input.value = assertion;
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
}
