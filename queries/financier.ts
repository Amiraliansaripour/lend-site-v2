// * @tanstack/react-query
import { queryOptions } from '@tanstack/react-query';

// * api
import { getFinanciers } from '@/api/financier';

export const queryKeys = {
  financiers: ['financiers'],
} as const;

export const getFinanciersQueryOptions = () => {
  return queryOptions({
    queryKey: queryKeys.financiers,
    queryFn: () => getFinanciers(),
  });
};
