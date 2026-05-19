import { useQuery, useMutation } from '@tanstack/react-query';

import { getUserLoans, getPaymentToken } from '@/api/installments';

export const installmentsKeys = {
  all: ['installments'] as const,
  lists: () => [...installmentsKeys.all, 'list'] as const,
  list: (userId: string) => [...installmentsKeys.lists(), userId] as const,
};

export const useUserLoans = (userId: string) => {
  return useQuery({
    queryKey: installmentsKeys.list(userId),
    queryFn: () => getUserLoans(userId),
    enabled: !!userId,
  });
};

export const usePaymentToken = () => {
  return useMutation({
    mutationFn: ({ loanDetailId, payType = 1 }: { loanDetailId: string; payType?: number }) =>
      getPaymentToken(loanDetailId, payType),
  });
};
