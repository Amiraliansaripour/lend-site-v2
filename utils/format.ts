import { normalizeDigits } from '@/utils/normalize';

export const formatInt = (input: string) => {
  let stringInput = String(input || '');

  const decimalIndex = stringInput.indexOf('.');
  stringInput = stringInput.slice(0, decimalIndex === -1 ? stringInput.length : decimalIndex);

  return Number(stringInput).toLocaleString();
};

export const formatFloat = (input: string, precision?: number) => {
  let stringInput = String(input || '');

  const dotIndex = stringInput.indexOf('.');
  if (dotIndex === -1) return formatInt(stringInput);

  const [int, decimal] = [
    stringInput.slice(0, dotIndex),
    stringInput.slice(dotIndex + 1).replace(/\D/g, ''),
  ];

  const [formattedInt, formattedDecimal] = [
    formatInt(int),
    decimal.slice(0, precision ?? decimal.length),
  ];

  return `${formattedInt}.${formattedDecimal}`;
};

/**
 * this function is intended to handle general number formatting
 * and is useful to globally change formatting all at once
 */
export const formatNumber = (
  input: string | number,
  options?: { int?: boolean; precision?: number },
) => {
  const { int = false, precision } = options ?? {};
  return int ? formatInt(String(input)) : formatFloat(String(input), precision);
};

export const capitalize = (input: string) => {
  return input[0].toUpperCase() + input.slice(1).toLowerCase();
};

export type CompactOptions = Partial<{
  threshold: number;
  chunkSize: number;
}>;

export const compact = (input: string, options: CompactOptions = {}) => {
  const { threshold, chunkSize = 4 } = options;
  const calculatedThreshold = chunkSize * 2 + 4;
  const len = input.length;

  const exceedsThreshold = (threshold != null && len <= threshold) || len <= calculatedThreshold;

  return exceedsThreshold ? input : `${input.slice(0, chunkSize)}...${input.slice(-chunkSize)}`;
};

/**
 * * handles invalid card numbers as well - less than 16 digits
 */
export const formatCardNo = (cardNo: string) => {
  const parts = cardNo.match(/.{4}/g) ?? [];
  const lastIndex = parts.length * 4;
  const remainedDigits = cardNo.slice(lastIndex);

  return `${parts.join(' ')} ${remainedDigits}`.trim();
};

export const formatJalaliDate = (
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
) => {
  if (!date) return '';

  try {
    return new Intl.DateTimeFormat('fa-IR', {
      month: opts.month ?? 'long',
      day: opts.day ?? 'numeric',
      year: opts.year ?? 'numeric',
      ...opts,
    }).format(new Date(date));
  } catch (_err) {
    return '';
  }
};

export const normalizedFormatJalaliDate = (
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
) => {
  return normalizeDigits(formatJalaliDate(date, opts));
};

const THOUSAND = 1_000;
const MILLION = 1_000_000;
const BILLION = 1_000_000_000;

export const abbreviateNumber = (input: string | number) => {
  const n = Number(input);
  let postfix: string = '';
  let abbr: number = n;

  if (n > BILLION) {
    abbr /= BILLION;
    postfix = 'B';
  } else if (n > MILLION) {
    abbr /= MILLION;
    postfix = 'M';
  } else if (n > THOUSAND) {
    abbr /= THOUSAND;
    postfix = 'K';
  }

  return `${formatNumber(abbr, { precision: 2 })}${postfix}`;
};
