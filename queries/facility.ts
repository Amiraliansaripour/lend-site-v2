<<<<<<< HEAD
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  facilityInquiry,
  sendValidationOtp,
  verifyValidationOtp,
  createRequest,
  changeRequestState,
  optOutRequest,
} from '@/api/facility';
import type {
  FacilityInquiryPayload,
  OtpVerifyPayload,
  CreateRequestPayload,
  RequestStateChangePayload,
} from '@/types/request-credit';

export const facilityKeys = {
  all: ['facility'] as const,
  inquiry: (userId: string, requestId?: string) =>
    [...facilityKeys.all, 'inquiry', userId, requestId] as const,
  validation: (requestId: string) => [...facilityKeys.all, 'validation', requestId] as const,
};

export function useFacilityInquiry(payload: FacilityInquiryPayload, enabled = true) {
  return useQuery({
    queryKey: facilityKeys.inquiry(payload.userId, payload.requestId),
    queryFn: () => facilityInquiry(payload),
    enabled: enabled && !!payload.userId,
  });
}

export function useSendValidationOtp() {
  return useMutation({
    mutationFn: (requestId: string) => sendValidationOtp(requestId),
  });
}

export function useVerifyValidationOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OtpVerifyPayload) => verifyValidationOtp(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: facilityKeys.validation(variables.requestId),
      });
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['requests'],
      });
    },
  });
}

export function useChangeRequestState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequestStateChangePayload) => changeRequestState(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['requests'],
      });
    },
  });
}

export function useOptOutRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => optOutRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['requests'],
      });
    },
  });
}
=======
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  facilityInquiry,
  sendValidationOtp,
  verifyValidationOtp,
  createRequest,
  changeRequestState,
  optOutRequest,
} from '@/api/facility';
import type {
  FacilityInquiryPayload,
  OtpVerifyPayload,
  CreateRequestPayload,
  RequestStateChangePayload,
} from '@/types/request-credit';

export const facilityKeys = {
  all: ['facility'] as const,
  inquiry: (userId: string, requestId?: string) =>
    [...facilityKeys.all, 'inquiry', userId, requestId] as const,
  validation: (requestId: string) => [...facilityKeys.all, 'validation', requestId] as const,
};

export function useFacilityInquiry(payload: FacilityInquiryPayload, enabled = true) {
  return useQuery({
    queryKey: facilityKeys.inquiry(payload.userId, payload.requestId),
    queryFn: () => facilityInquiry(payload),
    enabled: enabled && !!payload.userId,
  });
}

export function useSendValidationOtp() {
  return useMutation({
    mutationFn: (requestId: string) => sendValidationOtp(requestId),
  });
}

export function useVerifyValidationOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OtpVerifyPayload) => verifyValidationOtp(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: facilityKeys.validation(variables.requestId),
      });
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['requests'],
      });
    },
  });
}

export function useChangeRequestState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequestStateChangePayload) => changeRequestState(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['requests'],
      });
    },
  });
}

export function useOptOutRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => optOutRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['requests'],
      });
    },
  });
}
>>>>>>> a47b58a (pwa)
