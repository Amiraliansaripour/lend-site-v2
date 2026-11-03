import { useQuery } from '@tanstack/react-query';
import { checkRequestDocumentCompleteness, getRequestDocuments } from '@/api/request-document';

export const requestDocumentQueryKeys = {
  all: ['request-document'] as const,
  byRequest: (requestId: string) =>
    [...requestDocumentQueryKeys.all, 'request', requestId] as const,
  completeness: (requestId: string) =>
    [...requestDocumentQueryKeys.all, 'completeness', requestId] as const,
} as const;

export const useRequestDocuments = (requestId: string) => {
  return useQuery({
    queryKey: requestDocumentQueryKeys.byRequest(requestId),
    queryFn: async () => {
      const result = await getRequestDocuments(requestId);
      if (!result.ok) {
        throw new Error(result.message);
      }
      return result.data;
    },
    enabled: !!requestId,
    retry: false,
  });
};

export const useRequestDocumentCompleteness = (requestId: string, enabled = true) => {
  return useQuery({
    queryKey: requestDocumentQueryKeys.completeness(requestId),
    queryFn: async () => {
      const result = await checkRequestDocumentCompleteness(requestId);
      if (!result.ok) {
        throw new Error(result.message);
      }
      return result.data;
    },
    enabled: enabled && !!requestId,
    retry: false,
  });
};
