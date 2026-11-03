import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadRequestDocument, type UploadRequestDocumentPayload } from '@/api/request-document';
import { requestDocumentQueryKeys } from '@/queries/request-document';

export const useUploadRequestDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadRequestDocumentPayload) => uploadRequestDocument(payload),
    onSuccess: (result, variables) => {
      if (!result.ok) return;
      void queryClient.invalidateQueries({
        queryKey: requestDocumentQueryKeys.byRequest(variables.requestId),
      });
      void queryClient.invalidateQueries({
        queryKey: requestDocumentQueryKeys.completeness(variables.requestId),
      });
    },
  });
};
