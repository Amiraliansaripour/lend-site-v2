import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  acceptGuarantorship,
  approveGuarantor,
  rejectGuarantor,
  type ApiActionResult,
  type Guarantor,
} from '@/api/guarantor';
import { guarantorQueryKeys } from '@/queries/guarantor';

export const useAcceptGuarantorship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nationalCode: string) => acceptGuarantorship(nationalCode),
    onSuccess: (result: ApiActionResult<Guarantor | null>) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: guarantorQueryKeys.all });
      }
    },
  });
};

export const useApproveGuarantor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guarantorId: string) => approveGuarantor(guarantorId),
    onSuccess: result => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: guarantorQueryKeys.all });
      }
    },
  });
};

export const useRejectGuarantor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guarantorId, reason }: { guarantorId: string; reason: string }) =>
      rejectGuarantor(guarantorId, reason),
    onSuccess: result => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: guarantorQueryKeys.all });
      }
    },
  });
};
