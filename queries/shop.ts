import { useQuery } from '@tanstack/react-query';

import { getMerchantById, getMerchants } from '@/api/shop';
import { getCategoryTree, getProductsByCategory } from '@/api/product-category';
import type { Params } from '@/types/api';

export const shopsKeys = {
  all: ['shops'] as const,
  lists: () => [...shopsKeys.all, 'list'] as const,
  list: (params: Params) => [...shopsKeys.lists(), params] as const,
  details: () => [...shopsKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopsKeys.details(), id] as const,
  categoryTrees: () => [...shopsKeys.all, 'categoryTree'] as const,
  categoryTree: (merchantId: string) => [...shopsKeys.categoryTrees(), merchantId] as const,
  categoryProducts: () => [...shopsKeys.all, 'categoryProducts'] as const,
  categoryProduct: (categoryId: string) => [...shopsKeys.categoryProducts(), categoryId] as const,
};

export const useShops = (params: Params = {}) => {
  return useQuery({
    queryKey: shopsKeys.list(params),
    queryFn: () => getMerchants(params),
  });
};

export const useShop = (id: string) => {
  return useQuery({
    queryKey: shopsKeys.detail(id),
    queryFn: () => getMerchantById(id),
    enabled: !!id,
  });
};

export const useCategoryTree = (merchantId: string) => {
  return useQuery({
    queryKey: shopsKeys.categoryTree(merchantId),
    queryFn: () => getCategoryTree(merchantId),
    enabled: !!merchantId,
  });
};

export const useProductsByCategory = (categoryId: string | null | undefined) => {
  return useQuery({
    queryKey: shopsKeys.categoryProduct(categoryId ?? ''),
    queryFn: () => getProductsByCategory(categoryId!),
    enabled: !!categoryId,
  });
};
