import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getHomeCategories,
  getMerchantById,
  getMerchants,
  getMerchantsFullPagination,
} from '@/api/shop';
import { getCategoryTree, getProductsByCategory } from '@/api/product-category';
import type { Params } from '@/types/api';
import type { MerchantPaginationParams } from '@/components/page/shop/shop-types';

export const shopsKeys = {
  all: ['shops'] as const,
  lists: () => [...shopsKeys.all, 'list'] as const,
  list: (params: Params) => [...shopsKeys.lists(), params] as const,
  paginatedLists: () => [...shopsKeys.all, 'paginated'] as const,
  paginatedList: (params: MerchantPaginationParams) =>
    [...shopsKeys.paginatedLists(), params] as const,
  details: () => [...shopsKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopsKeys.details(), id] as const,
  homeCategories: () => [...shopsKeys.all, 'homeCategories'] as const,
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

export const useShopsFullPagination = (params: MerchantPaginationParams = {}) => {
  return useQuery({
    queryKey: shopsKeys.paginatedList(params),
    queryFn: () => getMerchantsFullPagination(params),
    // Keep previous shops visible while filters change so the list does not
    // collapse into a skeleton (which jumps scroll to the banner).
    placeholderData: keepPreviousData,
  });
};

export const useHomeCategories = () => {
  return useQuery({
    queryKey: shopsKeys.homeCategories(),
    queryFn: getHomeCategories,
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
