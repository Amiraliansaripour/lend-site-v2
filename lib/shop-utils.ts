export const getShopImageUrl = (filePath?: string | null): string | null => {
  if (!filePath) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || '';
  return `${baseUrl}/uploads/${filePath}`;
};
