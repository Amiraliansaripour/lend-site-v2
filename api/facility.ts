<<<<<<< HEAD
import { api } from '@/lib/api/client';
import { BASE_URLS } from '@/lib/api/constants';
import { accessToken } from '@/lib/auth/client/cookies';

import type { APIResult } from '@/types/api';
import type {
  FacilityInquiryPayload,
  FacilityInquiryResponse,
  OtpVerifyPayload,
  ValidationData,
  CreateRequestPayload,
  CreateRequestResponse,
  RequestStateChangePayload,
} from '@/types/request-credit';
import { resolveURL } from '@/utils/url';

export async function facilityInquiry(payload: FacilityInquiryPayload) {
  const { data } = await api.post<FacilityInquiryPayload, FacilityInquiryResponse>(
    '/UserFacility/Inquiry',
    payload,
  );
  return data;
}

export async function sendValidationOtp(requestId: string) {
  const { data } = await api.post<{ requestId: string; otp: string }, ValidationData>(
    '/UserFacility/SendOtp',
    { requestId, otp: '' },
  );
  return data;
}

export async function verifyValidationOtp(payload: OtpVerifyPayload) {
  const { data } = await api.post<OtpVerifyPayload, ValidationData>(
    '/UserFacility/VerifyOtp',
    payload,
  );
  return data;
}

// * Finotech validation flow
export interface FinotechInquiryResponse {
  otpStatus?: boolean;
  token?: string;
  trackId?: string;
}

export interface FinotechCreditData {
  lifeStatus?: boolean;
  chequeColorStatus?: number;
  isBlocked?: boolean;
  over18?: boolean;
  facilityDeferred?: boolean;
  guarantyDeferred?: boolean;
  score?: number;
  risk?: string;
}

export async function sendFinotechInquiry(requestId: string, otp = '') {
  const { data } = await api.post<{ requestId: string; otp: string }, FinotechInquiryResponse>(
    '/UserFacility/Inquiry',
    { requestId, otp },
  );
  return data;
}

export async function getFinotechCreditStatus(userId: string, requestId: string) {
  const { data } = await api.post<
    { userId: string; requestId: string },
    APIResult<FinotechCreditData>
  >('/UserCreditStatus/CreditStatus', { userId, requestId });
  return data.data as FinotechCreditData;
}

export async function createRequest(payload: CreateRequestPayload) {
  const { data } = await api.post<CreateRequestPayload, APIResult<CreateRequestResponse>>(
    '/Request/Create',
    payload,
  );
  return data.data; // Return the unwrapped data from APIResult
}

export async function changeRequestState(payload: RequestStateChangePayload) {
  const { data } = await api.post<RequestStateChangePayload, void>(
    '/Request/ChangeRequestState',
    payload,
  );
  return data;
}

export async function optOutRequest(requestId: string) {
  const { data } = await api.get<void>(`/Request/OptOut/${requestId}`);
  return data;
}

export async function uploadAttachment(formData: FormData) {
  const baseURL = BASE_URLS.DEFAULT || '';
  const token = accessToken.get();
  const response = await fetch(resolveURL('/Attachment/create1', baseURL), {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const result = await response.json();
  return result.data as { id: string };
}

export async function deleteAttachment(attachmentId: string) {
  const formData = new FormData();
  formData.append('oldId', attachmentId);

  const baseURL = BASE_URLS.DEFAULT || '';
  const token = accessToken.get();
  const response = await fetch(resolveURL('/Attachment/create1', baseURL), {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Delete failed');
  }

  return response.json();
}
=======
import { api } from '@/lib/api/client';
import { BASE_URLS } from '@/lib/api/constants';
import { accessToken } from '@/lib/auth/client/cookies';

import type { APIResult } from '@/types/api';
import type {
  FacilityInquiryPayload,
  FacilityInquiryResponse,
  OtpVerifyPayload,
  ValidationData,
  CreateRequestPayload,
  CreateRequestResponse,
  RequestStateChangePayload,
} from '@/types/request-credit';
import { resolveURL } from '@/utils/url';

export async function facilityInquiry(payload: FacilityInquiryPayload) {
  const { data } = await api.post<FacilityInquiryPayload, FacilityInquiryResponse>(
    '/UserFacility/Inquiry',
    payload,
  );
  return data;
}

export async function sendValidationOtp(requestId: string) {
  const { data } = await api.post<{ requestId: string; otp: string }, ValidationData>(
    '/UserFacility/SendOtp',
    { requestId, otp: '' },
  );
  return data;
}

export async function verifyValidationOtp(payload: OtpVerifyPayload) {
  const { data } = await api.post<OtpVerifyPayload, ValidationData>(
    '/UserFacility/VerifyOtp',
    payload,
  );
  return data;
}

// * Finotech validation flow
export interface FinotechInquiryResponse {
  otpStatus?: boolean;
  token?: string;
  trackId?: string;
}

export interface FinotechCreditData {
  lifeStatus?: boolean;
  chequeColorStatus?: number;
  isBlocked?: boolean;
  over18?: boolean;
  facilityDeferred?: boolean;
  guarantyDeferred?: boolean;
  score?: number;
  risk?: string;
}

export async function sendFinotechInquiry(requestId: string, otp = '') {
  const { data } = await api.post<{ requestId: string; otp: string }, FinotechInquiryResponse>(
    '/UserFacility/Inquiry',
    { requestId, otp },
  );
  return data;
}

export async function getFinotechCreditStatus(userId: string, requestId: string) {
  const { data } = await api.post<
    { userId: string; requestId: string },
    APIResult<FinotechCreditData>
  >('/UserCreditStatus/CreditStatus', { userId, requestId });
  return data.data as FinotechCreditData;
}

export async function createRequest(payload: CreateRequestPayload) {
  const { data } = await api.post<CreateRequestPayload, APIResult<CreateRequestResponse>>(
    '/Request/Create',
    payload,
  );
  return data.data; // Return the unwrapped data from APIResult
}

export async function changeRequestState(payload: RequestStateChangePayload) {
  const { data } = await api.post<RequestStateChangePayload, void>(
    '/Request/ChangeRequestState',
    payload,
  );
  return data;
}

export async function optOutRequest(requestId: string) {
  const { data } = await api.get<void>(`/Request/OptOut/${requestId}`);
  return data;
}

export async function uploadAttachment(formData: FormData) {
  const baseURL = BASE_URLS.DEFAULT || '';
  const token = accessToken.get();
  const response = await fetch(resolveURL('/Attachment/create1', baseURL), {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const result = await response.json();
  return result.data as { id: string };
}

export async function deleteAttachment(attachmentId: string) {
  const formData = new FormData();
  formData.append('oldId', attachmentId);

  const baseURL = BASE_URLS.DEFAULT || '';
  const token = accessToken.get();
  const response = await fetch(resolveURL('/Attachment/create1', baseURL), {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Delete failed');
  }

  return response.json();
}
>>>>>>> a47b58a (pwa)
