import { useQuery } from '@tanstack/react-query';

import { getMerchantById, getMerchants } from '@/api/shop';
import type { Params } from '@/types/api';

export const shopsKeys = {
  all: ['shops'] as const,
  lists: () => [...shopsKeys.all, 'list'] as const,
  list: (params: Params) => [...shopsKeys.lists(), params] as const,
  details: () => [...shopsKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopsKeys.details(), id] as const,
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
