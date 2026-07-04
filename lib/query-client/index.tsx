import { QueryCache, QueryClient, MutationCache, type QueryKey } from '@tanstack/react-query';

import { AxiosError } from 'axios';

import { toast } from 'sonner';

import { log } from '@/lib/log';
import { env } from '@/lib/env';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: Partial<{
      invalidatesQueries: QueryKey[];
    }>;

    queryMeta: Partial<{
      uncaughtException: boolean;
      invalidatesQueries: QueryKey[];
    }>;
  }
}

const retry = env.NEXT_PUBLIC_QUERY_RETRY;
const gcTime = env.NEXT_PUBLIC_QUERY_GC_TIME;
const staleTime = env.NEXT_PUBLIC_QUERY_STALE_TIME;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry,
      gcTime,
      staleTime,
    },
    mutations: {
      retry,
      gcTime,

      onError(error) {
        log.error(error);

        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.message || error.message);
          return;
        }

        toast.error(error.message);
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const { uncaughtException = true } = query.meta ?? {};

      if (error != null) {
        log.error(error.message);

        if (uncaughtException) {
          if (error instanceof AxiosError) {
            toast.error(error.response?.data?.message || error.message);
            return;
          }

          toast.error(error.message);
        }
        return;
      }
    },
    onSettled(_data, _error, query) {
      const { invalidatesQueries = [] } = query.meta ?? {};

      invalidatesQueries.forEach(invalidatedQuery => {
        queryClient.invalidateQueries({
          queryKey: invalidatedQuery,
        });
      });
    },
  }),
  mutationCache: new MutationCache({
    onSettled(_data, _error, _variables, _context, mutation) {
      const { invalidatesQueries = [] } = mutation.meta ?? {};

      invalidatesQueries.forEach(invalidatedQuery => {
        queryClient.invalidateQueries({
          queryKey: invalidatedQuery,
        });
      });
    },
  }),
});
