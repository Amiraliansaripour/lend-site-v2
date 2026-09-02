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
