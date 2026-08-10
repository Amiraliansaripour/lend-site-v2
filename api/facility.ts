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
import { REQUEST_CREATE_EXISTING_REQUEST_STATUS } from '@/types/request-credit';
import { resolveURL } from '@/utils/url';

export async function facilityInquiry(payload: FacilityInquiryPayload) {
  const { data, resp } = await api.post<FacilityInquiryPayload, FacilityInquiryResponse>(
    '/UserFacility/Inquiry',
    payload,
  );

  if (!resp.ok) {
    throw new Error(
      (data as FacilityInquiryResponse & { message?: string })?.message ??
        `Facility inquiry failed with status ${resp.status}`,
    );
  }

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

// * ICS validation flow (SendOtpIc → IcsFullProcess)
export type IcsValidationStatus =
  | 'Completed'
  | 'Pending'
  | 'ReportGenerated'
  | 'Unavailable'
  | 'InQueue'
  | 'waiting'
  | string;

export interface SendOtpIcPayload {
  nationalCode: string;
  mobileNumber: string;
}

export interface SendOtpIcData {
  success: boolean;
  message: string;
  requestId?: string;
  status: IcsValidationStatus;
  isComplete: boolean;
  isInQueue: boolean;
  isReportGenerated: boolean;
}

export interface IcsFullProcessPayload {
  lendRequestId: string;
  nationalCode: string;
  mobileNumber: string;
  token: string;
}

export interface IcsFullProcessData {
  gatewayRequestId?: string;
  risk?: string;
  score?: string | number;
  status: IcsValidationStatus;
  isComplete: boolean;
  success: boolean;
  message: string;
}

export async function sendOtpIc(payload: SendOtpIcPayload) {
  const { data, resp } = await api.post<SendOtpIcPayload, APIResult<SendOtpIcData>>(
    '/UserFacility/SendOtpIc',
    payload,
  );

  if (!resp.ok || !data.isSuccess) {
    throw new Error(data.message || 'خطا در ارسال کد تایید');
  }

  return data.data;
}

export async function icsFullProcess(payload: IcsFullProcessPayload) {
  const { data, resp } = await api.post<IcsFullProcessPayload, APIResult<IcsFullProcessData>>(
    '/UserFacility/IcsFullProcess',
    payload,
  );

  if (!resp.ok || !data.isSuccess) {
    throw new Error(data.message || 'خطا در انجام اعتبارسنجی');
  }

  return data.data;
}

export class ExistingRequestError extends Error {
  readonly statusCode = REQUEST_CREATE_EXISTING_REQUEST_STATUS;

  constructor(message: string) {
    super(message);
    this.name = 'ExistingRequestError';
  }
}

export async function createRequest(payload: CreateRequestPayload) {
  const { data, resp } = await api.post<CreateRequestPayload, APIResult<CreateRequestResponse>>(
    '/Request/Create',
    payload,
    { suppressErrorToast: true },
  );

  if (data.statusCode === REQUEST_CREATE_EXISTING_REQUEST_STATUS) {
    throw new ExistingRequestError(data.message);
  }

  if (!data.isSuccess) {
    throw new Error(data.message || 'خطا در ایجاد درخواست');
  }

  return data.data;
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
