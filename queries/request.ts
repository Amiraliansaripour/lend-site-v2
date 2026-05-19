// * @tanstack/react-query
import { queryOptions, useQuery } from '@tanstack/react-query';

// * api
import {
  getRequest,
  getUserRequests,
  getRequestsByNationalCode,
  getRequestWithPlanData,
  getRequestPreview,
} from '@/api/request';

export const queryKeys = {
  requests: ['requests'] as const,
  userRequests: (userId: string) => [...queryKeys.requests, 'user', userId] as const,
  nationalCodeRequests: (nationalCode: string) =>
    [...queryKeys.requests, 'nationalCode', nationalCode] as const,
  requestWithPlan: (requestId: string) => [...queryKeys.requests, 'withPlan', requestId] as const,
  requestPreview: (requestId: string) => [...queryKeys.requests, 'preview', requestId] as const,
} as const;

export const getRequestQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: [queryKeys.requests, id],
    queryFn: () => getRequest(id),
  });
};

export const useUserRequests = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userRequests(userId),
    queryFn: () => getUserRequests(userId),
    enabled: !!userId,
  });
};

export const useRequestsByNationalCode = (nationalCode: string) => {
  return useQuery({
    queryKey: queryKeys.nationalCodeRequests(nationalCode),
    queryFn: () => getRequestsByNationalCode(nationalCode),
    enabled: !!nationalCode,
  });
};

export const useRequestWithPlanData = (requestId: string) => {
  return useQuery({
    queryKey: queryKeys.requestWithPlan(requestId),
    queryFn: () => getRequestWithPlanData(requestId),
    enabled: !!requestId,
  });
};

export const useRequestPreview = (requestId: string) => {
  return useQuery({
    queryKey: queryKeys.requestPreview(requestId),
    queryFn: () => getRequestPreview(requestId),
    enabled: !!requestId,
  });
};
