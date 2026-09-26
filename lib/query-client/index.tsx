import { QueryCache, QueryClient, MutationCache, type QueryKey } from '@tanstack/react-query';

import { AxiosError } from 'axios';

import { toast } from 'sonner';

import { log } from '@/lib/log';
import { captureHttpError, shouldCaptureHttpStatus } from '@/lib/sentry';

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

const retry = Number(process.env.NEXT_PUBLIC_QUERY_RETRY);
const gcTime = Number(process.env.NEXT_PUBLIC_QUERY_GC_TIME);
const staleTime = Number(process.env.NEXT_PUBLIC_QUERY_STALE_TIME);

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
          const status = error.response?.status;
          if (status != null && shouldCaptureHttpStatus(status)) {
            captureHttpError({
              status,
              method: error.config?.method,
              url: error.config?.url ?? 'unknown',
              message: error.response?.data?.message || error.message,
            });
          }

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
            const status = error.response?.status;
            if (status != null && shouldCaptureHttpStatus(status)) {
              captureHttpError({
                status,
                method: error.config?.method,
                url: error.config?.url ?? 'unknown',
                message: error.response?.data?.message || error.message,
              });
            }

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
