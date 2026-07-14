import { api } from '@/lib/api/client';
import type { APIResult } from '@/types/api';
import type { CategoryProduct, ProductCategory } from '@/components/page/shop/shop-types';

const asArray = <T>(value: T[] | null | undefined): T[] => {
  return Array.isArray(value) ? value : [];
};

export const getCategoryTree = async (merchantId: string): Promise<ProductCategory[]> => {
  if (!merchantId) return [];

  try {
    const resp = await api.get<APIResult<ProductCategory[] | null>>(
      `/ProductCategory/GetCategoryTree/tree/${merchantId}`,
    );
    return asArray(resp.data?.data);
  } catch {
    return [];
  }
};

export const getProductsByCategory = async (categoryId: string): Promise<CategoryProduct[]> => {
  if (!categoryId) return [];

  try {
    const resp = await api.get<APIResult<CategoryProduct[] | null>>(
      `/ProductCategory/GetProductsByCategory/products/${categoryId}`,
    );
    return asArray(resp.data?.data);
  } catch {
    return [];
  }
};
