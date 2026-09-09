import { getBankInfoWithCardNumber } from 'ir-banks-info';

import { normalizeDigits } from '@/utils/normalize';

export { normalizeDigits };

export const normalizeCardNumber = (value: string) => {
  return normalizeDigits(value).replace(/\D/g, '').slice(0, 16);
};

export const formatCardNumber = (value: string) => {
  const normalized = normalizeCardNumber(value);

  return normalized.replace(/(.{4})/g, '$1 ').trim();
};

export const getCardBankInfo = (cardNumber: string) => {
  const normalized = normalizeCardNumber(cardNumber);

  if (normalized.length < 6) {
    return null;
  }

  try {
    return getBankInfoWithCardNumber(normalized);
  } catch {
    return null;
  }
};

export const maskCardNumber = (cardNumber: string) => {
  const normalized = normalizeCardNumber(cardNumber);

  if (normalized.length !== 16) {
    return formatCardNumber(normalized);
  }

  return `${normalized.slice(0, 4)} ${normalized.slice(4, 6)}•••• •••• ${normalized.slice(14)}`;
};

export const maskCvv2 = (cvv2?: string) => {
  if (!cvv2) return '•••';

  return '•'.repeat(Math.min(cvv2.length, 4));
};

/** UI shows YYYY/MM; API may store MM/YYYY */
export const toExpiryDisplay = (value: string) => {
  const trimmed = value.trim();
  const monthFirst = trimmed.match(/^(0[1-9]|1[0-2])\/(\d{4})$/);
  if (monthFirst) return `${monthFirst[2]}/${monthFirst[1]}`;
  return trimmed;
};

/** Convert UI YYYY/MM → API MM/YYYY */
export const toExpiryApi = (value: string) => {
  const trimmed = value.trim();
  const yearFirst = trimmed.match(/^(\d{4})\/(0[1-9]|1[0-2])$/);
  if (yearFirst) return `${yearFirst[2]}/${yearFirst[1]}`;
  return trimmed;
};

export const formatExpiryInput = (raw: string) => {
  const digits = normalizeDigits(raw).replace(/\D/g, '').slice(0, 6);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}/${digits.slice(4)}`;
};
