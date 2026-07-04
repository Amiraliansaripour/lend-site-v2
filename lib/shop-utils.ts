import { env } from '@/lib/env';

export const getShopImageUrl = (filePath?: string | null): string | null => {
  if (!filePath) return null;
  const baseUrl = env.NEXT_PUBLIC_API_BASE_URL.replace('/api/v1', '');
  return `${baseUrl}/uploads/${filePath}`;
};
