const PLACEHOLDER_BRANDS = ['بوم آپ', 'BoomUp', 'boomUp'] as const;

export const getUploadUrl = (filePath?: string | null): string => {
  if (!filePath) return '';
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || '';
  return `${baseUrl}/uploads/${filePath}`;
};

export const applyBrandName = (text: string, brandName: string) => {
  if (!text || !brandName) return text;

  return PLACEHOLDER_BRANDS.reduce(
    (result, placeholder) => result.replaceAll(placeholder, brandName),
    text,
  );
};
