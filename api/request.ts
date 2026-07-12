import z from 'zod';
import { api } from '@/lib/api/client';
import type { APIResult, Params } from '@/types/api';

// * types
export type Request = {
  loanDetailAmount: number;
  requestDate: string;
  creditAmount: number;
  remainCreditAmount: number;
  creditValidityDate: string | null;
  period: number;
  contractFilePath: string | null;
  requestNumber: number;
  planFinancierName: string | null;
  planName: string;
  planGuarantees: string[];
  requestState: number;
  lastSuccessState: number | null;
  mode: number;
  forCorrections: string | null;
  rejectDescription: string | null;
  incomeInfoAttachmentFilePath: string | null;
  loanHeaderId: string;
  planId: string;
  invoiceId: string;
  invoiceAttachmentId: string | null;
  userCreditStatusId: string;
  userFacilityId: string;
  userGuarantyId: string;
  chequeId: string;
  userId: string;
  incomeInfoId: string;
  validateType: number | null;
  id: string;
  isActive: boolean;
  guaranteedAmount?: number;
};

export const RequestSchema = z.object({});

export const getRequest = async (id: string, params: Params = {}) => {
  const resp = await api.get<APIResult<Request>>(`/Request/Get/${id}`, params);
  return resp.data.data as Request;
};

export const createRequest = async (data: Request) => {
  const resp = await api.post<Request, APIResult<Request>>('/Request/Create', data);
  return resp.data;
};

export const getUserRequests = async (userId: string): Promise<Request[]> => {
  const { data } = await api.get<{ isSuccess: boolean; data: Request[] }>(
    `/Request/GetUserRequest/${userId}`,
  );

  if (data.isSuccess && data.data && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

export const getRequestsByNationalCode = async (nationalCode: string): Promise<Request[]> => {
  const { data } = await api.get<{ isSuccess: boolean; data: Request[] }>(
    `/Request/GetByNationalCode/${nationalCode}`,
  );

  if (data.isSuccess && data.data && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

export type RequestWithPlanData = Request & {
  planIsInvoiceRequired: boolean;
  planIsGuaranteeRequired: boolean;
  planIsIncomeRequired: boolean;
  planIsValidateRequired: boolean;
};

export const getRequestWithPlanData = async (requestId: string) => {
  const resp = await api.get<APIResult<RequestWithPlanData>>(`/Request/Get/${requestId}`);
  return resp.data.data as RequestWithPlanData;
};

// * Update request state
export type ChangeRequestStateData = {
  id: string;
  requestState: number;
};

export const changeRequestState = async (data: ChangeRequestStateData) => {
  const resp = await api.post<ChangeRequestStateData, APIResult<unknown>>(
    '/Request/ChangeRequestState',
    data,
  );
  return resp.data;
};

// * Upload attachments to user
export type UploadUserAttachmentsData = {
  userId: string;
  attachmentIdsToSend: string[];
};

export const uploadUserAttachments = async (data: UploadUserAttachmentsData) => {
  const resp = await api.put<{ attachmentIdsToSend: string[] }, APIResult<unknown>>(
    `/User/Upload/${data.userId}`,
    { attachmentIdsToSend: data.attachmentIdsToSend },
  );
  return resp.data;
};

// * Validate user identity info
export const validateUserIdentityInfo = async (requestId: string) => {
  const resp = await api.get<APIResult<unknown>>(`/Request/UserIdentityInfo/${requestId}`);
  return resp.data;
};

// * Update salary info
export type UpdateSalaryInfoData = {
  requestId: string;
  income: number;
  installment: number;
};

export const updateSalaryInfo = async (data: UpdateSalaryInfoData) => {
  const resp = await api.post<UpdateSalaryInfoData, APIResult<unknown>>(
    '/Request/UpdateSalaryInfo',
    data,
  );
  return resp.data;
};

// * Create income info
export type CreateIncomeInfoData = {
  income: number;
  payAbility: number;
  requestId: string;
  attachmentIds: string[];
};

export const createIncomeInfo = async (data: CreateIncomeInfoData) => {
  const resp = await api.post<CreateIncomeInfoData, APIResult<unknown>>('/IncomeInfo/Create', data);
  return resp.data;
};

// * Create invoice
export type CreateInvoiceData = {
  requestId: string;
  attachmentId: string;
};

export const createInvoice = async (data: CreateInvoiceData) => {
  const resp = await api.post<CreateInvoiceData, APIResult<unknown>>('/Invoice/Create', data);
  return resp.data;
};

// * Get payment token
export type GetPaymentTokenData = {
  requestId: string;
  payType: number;
};

export type GetPaymentTokenResponse = {
  token: string;
  terminalID: string;
  merchantId: string;
};

export const getPaymentToken = async (data: GetPaymentTokenData) => {
  const resp = await api.post<GetPaymentTokenData, APIResult<GetPaymentTokenResponse>>(
    '/Pay/GetToken',
    data,
  );
  return resp.data;
};

// * Register cheque
export type RegisterChequeData = {
  sayadId: string | null;
  requestId: string;
  attachmentId: string | null;
  attachmentBackId: string | null;
  attachmentPromissoryId: string | null;
  attachmentDeductionSalaryId: string | null;
};

export const registerCheque = async (data: RegisterChequeData) => {
  const resp = await api.post<RegisterChequeData, APIResult<unknown>>(
    '/Cheque/Chequeregister',
    data,
  );
  return resp.data;
};

// * Get request preview
export type RequestPreviewData = {
  userFirstName?: string;
  userLastName?: string;
  userNationalCode?: string;
  chequeSayadId?: string;
  chequeFileImage?: string;
  chequeFileImageBack?: string;
  chequeFileImagePromissory?: string;
  chequeFileImageDeductionSalary?: string;
  invoiceFileImage?: string;
  incomeInfo?: {
    income: number;
    payAbility: number;
    incomeInfoFileImage?: string[];
  };
  plan?: {
    planName?: string;
    planPercentage?: number;
    planPeriod?: number;
    planGuarantees?: string;
  };
  planName?: string;
  period?: number;
  loanDetailAmount?: number;
  creditAmount?: number;
  feeAmount?: number;
  totalRefundAmount?: number;
  guaranteedAmount?: number;
  planIsInvoiceRequired?: boolean;
  planFirstSystemFee?: number;
  planFirstBankFee?: number;
};

export const getRequestPreview = async (requestId: string) => {
  const resp = await api.get<APIResult<RequestPreviewData>>(`/Request/preview/${requestId}`);
  return resp.data.data as RequestPreviewData;
};

// * Confirm request by user
export const confirmRequestByUser = async (requestId: string): Promise<APIResult<unknown>> => {
  const resp = await api.get<APIResult<unknown>>(`/Request/UserConfirm/${requestId}`);

  // The UserConfirm endpoint returns HTTP 200 with an empty body on success.
  // If the response is ok and data is empty/incomplete, treat it as success.
  if (resp.resp.ok && (!resp.data || Object.keys(resp.data as object).length === 0)) {
    return { isSuccess: true, data: null, message: '', statusCode: 0 } as APIResult<unknown>;
  }

  return resp.data;
};
