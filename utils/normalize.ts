const convertPersianDigitsToEnglish = (input: string) => {
  return input.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
};

const convertArabicDigitsToEnglish = (input: string) => {
  return input.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

const convertEnglishDigitsToPersian = (input: string) => {
  return input.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'.charAt(Number(d)));
};

export const normalizeDigits = (input: string) => {
  return convertPersianDigitsToEnglish(convertArabicDigitsToEnglish(input));
};

export const normalizeToPersianDigits = (input: string) => {
  return convertEnglishDigitsToPersian(convertArabicDigitsToEnglish(input));
};

export const normalizePhoneNo = (phoneNo: string) => {
  let normalized = normalizeDigits(phoneNo)
    .replace(/^\+?98/, '')
    .replace(/\D+/g, '');

  if (!normalized.startsWith('0') && normalized.length === 10) {
    normalized = `0${normalized}`;
  }

  return normalized.trim();
};

// * handle the case of multiple '.' in a numeric string
export const normalizeDecimalPoints = (input: string) => {
  const trimmedInput = input.trim();
  const decimalPointIndex = trimmedInput.indexOf('.');
  const lastDecimalPointIndex = trimmedInput.lastIndexOf('.');

  if (decimalPointIndex === lastDecimalPointIndex) return trimmedInput;

  return [
    trimmedInput.slice(0, decimalPointIndex),
    trimmedInput.slice(decimalPointIndex + 1).replace(/\./g, ''),
  ].join('.');
  1;
};

// * replace `,` in a grouped numeric string and remove '.' at the end
export const normalizeGroupedNumeric = (input: string) => {
  let normalized = normalizeDecimalPoints(input);
  normalized = normalized.replace(/[^\d.]+/g, '');

  return normalized.endsWith('.') ? normalized.slice(0, -1) : normalized;
};
