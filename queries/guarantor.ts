import { useQuery } from '@tanstack/react-query';
import { getRequestGuarantors } from '@/api/guarantor';

export const guarantorQueryKeys = {
  all: ['guarantor'] as const,
  byRequest: (requestId: string) => [...guarantorQueryKeys.all, 'request', requestId] as const,
} as const;

export const useRequestGuarantors = (requestId: string) => {
  return useQuery({
    queryKey: guarantorQueryKeys.byRequest(requestId),
    queryFn: () => getRequestGuarantors(requestId),
    enabled: !!requestId,
  });
};
