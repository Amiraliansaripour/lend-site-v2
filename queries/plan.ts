import { queryOptions, useQuery } from '@tanstack/react-query';
import type { Params } from '@/types/api';

import { getPlan, getPlanWithoutAuth, getPlans, getFinancierPlans } from '@/api/plan';

export const queryKeys = {
  plans: ['plans'],
  financierPlans: ['financier-plans'],
} as const;

export const getPlansQueryOptions = (params?: Params) => {
  return queryOptions({
    queryKey: [...queryKeys.plans, params],
    queryFn: () => getPlans(params),
  });
};

export const getPlanQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: [...queryKeys.plans, id],
    queryFn: () => getPlan(id),
  });
};

export const getPlanWithoutAuthQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: [...queryKeys.plans, id],
    queryFn: () => getPlanWithoutAuth(id),
  });
};

export const getFinancierPlansQueryOptions = () => {
  return queryOptions({
    queryKey: queryKeys.financierPlans,
    queryFn: () => getFinancierPlans(),
  });
};

export const usePlan = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.plans, id],
    queryFn: () => getPlan(id),
    enabled: !!id,
  });
};
