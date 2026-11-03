import { accessToken } from '@/lib/auth/client/cookies';
import { BASE_URLS } from '@/lib/api/constants';
import { resolveURL } from '@/utils/url';
import { api } from '@/lib/api/client';
import type { APIResult } from '@/types/api';

/**
 * User-panel RequestDocument endpoints (from LendApi):
 * GET  /RequestDocument/request/{requestId}
 * POST /RequestDocument/upload  (multipart)
 * GET  /RequestDocument/check-completeness/{requestId}
 *
 * Status: 0 Pending | 1 Uploaded | 2 Approved | 3 Rejected | 4 NeedsCorrection
 */
export const REQUEST_DOCUMENT_STATUS = {
  Pending: 0,
  Uploaded: 1,
  Approved: 2,
  Rejected: 3,
  NeedsCorrection: 4,
} as const;

export type RequestDocumentStatus =
  (typeof REQUEST_DOCUMENT_STATUS)[keyof typeof REQUEST_DOCUMENT_STATUS];

export type RequestDocument = {
  id: string;
  requestId: string;
  planDocumentId: string;
  title: string;
  description?: string | null;
  isRequired: boolean;
  displayOrder: number;
  templateAttachmentId?: string | null;
  templateFileName?: string | null;
  templateFilePath?: string | null;
  completedAttachmentId?: string | null;
  completedFileName?: string | null;
  completedFilePath?: string | null;
  userNote?: string | null;
  adminNote?: string | null;
  status: number;
  uploadedAt?: string | null;
};

export type RequestDocumentCompleteness = {
  isComplete: boolean;
  totalRequired: number;
  totalUploaded: number;
  missingDocuments: string[];
};

export type UploadRequestDocumentPayload = {
  requestId: string;
  planDocumentId: string;
  completedFile: File;
  userNote?: string;
};

export type ApiActionResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string };

const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']);

export const REQUEST_DOCUMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
export const REQUEST_DOCUMENT_MAX_SIZE_MB = 10;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeDocumentsList(value: unknown): RequestDocument[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord) as RequestDocument[];
  }
  if (isRecord(value) && Array.isArray(value.items)) {
    return value.items.filter(isRecord) as RequestDocument[];
  }
  if (isRecord(value) && (value.planDocumentId || value.title)) {
    return [value as RequestDocument];
  }
  return [];
}

/** GET list of request documents for the user */
export const getRequestDocuments = async (
  requestId: string,
): Promise<ApiActionResult<RequestDocument[]>> => {
  const resp = await api.get<APIResult<unknown>>(`/RequestDocument/request/${requestId}`, {
    suppressErrorToast: true,
  });

  const result = resp.data;
  if (!resp.resp.ok || result?.isSuccess !== true) {
    return {
      ok: false,
      message: result?.message || 'دریافت لیست مدارک با خطا مواجه شد',
    };
  }

  return {
    ok: true,
    data: normalizeDocumentsList(result.data),
    message: result.message,
  };
};

/** POST multipart upload of a completed document */
export const uploadRequestDocument = async (
  payload: UploadRequestDocumentPayload,
): Promise<ApiActionResult<RequestDocument>> => {
  if (!payload.requestId || !payload.planDocumentId) {
    return { ok: false, message: 'شناسه درخواست یا مدرک نامعتبر است' };
  }

  const validationError = validateRequestDocumentFile(payload.completedFile);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const formData = new FormData();
  formData.append('RequestId', payload.requestId);
  formData.append('PlanDocumentId', payload.planDocumentId);
  formData.append('CompletedFile', payload.completedFile);
  if (payload.userNote?.trim()) {
    formData.append('UserNote', payload.userNote.trim());
  }

  const baseURL = BASE_URLS.DEFAULT || '';
  const token = accessToken.get();
  const response = await fetch(resolveURL('/RequestDocument/upload', baseURL), {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = (await response.json().catch(() => null)) as APIResult<RequestDocument> | null;

  if (!response.ok || result?.isSuccess !== true) {
    return {
      ok: false,
      message: result?.message || 'آپلود مدرک با خطا مواجه شد',
    };
  }

  return {
    ok: true,
    data: result.data as RequestDocument,
    message: result.message || 'مدرک با موفقیت آپلود شد',
  };
};

/** GET completeness check before leaving the documents step */
export const checkRequestDocumentCompleteness = async (
  requestId: string,
): Promise<ApiActionResult<RequestDocumentCompleteness>> => {
  const resp = await api.get<APIResult<RequestDocumentCompleteness>>(
    `/RequestDocument/check-completeness/${requestId}`,
    { suppressErrorToast: true },
  );

  const result = resp.data;
  if (!resp.resp.ok || result?.isSuccess !== true || !result.data) {
    return {
      ok: false,
      message: result?.message || 'بررسی کامل بودن مدارک با خطا مواجه شد',
    };
  }

  return { ok: true, data: result.data, message: result.message };
};

export function validateRequestDocumentFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return 'فقط فایل‌های pdf، jpg، jpeg، png، doc و docx مجاز هستند';
  }
  if (file.size > REQUEST_DOCUMENT_MAX_SIZE_MB * 1024 * 1024) {
    return `حداکثر حجم فایل ${REQUEST_DOCUMENT_MAX_SIZE_MB} مگابایت است`;
  }
  if (file.size <= 0) {
    return 'فایل انتخاب‌شده خالی است';
  }
  return null;
}

export const getRequestDocumentStatusLabel = (status?: number | null): string => {
  switch (Number(status)) {
    case REQUEST_DOCUMENT_STATUS.Pending:
      return 'در انتظار آپلود';
    case REQUEST_DOCUMENT_STATUS.Uploaded:
      return 'آپلود شده';
    case REQUEST_DOCUMENT_STATUS.Approved:
      return 'تأیید شده';
    case REQUEST_DOCUMENT_STATUS.Rejected:
      return 'رد شده';
    case REQUEST_DOCUMENT_STATUS.NeedsCorrection:
      return 'نیاز به اصلاح';
    default:
      return 'نامشخص';
  }
};

export const isRequestDocumentUploaded = (doc: RequestDocument): boolean => {
  const status = Number(doc.status);
  return (
    status === REQUEST_DOCUMENT_STATUS.Uploaded ||
    status === REQUEST_DOCUMENT_STATUS.Approved ||
    Boolean(doc.completedAttachmentId)
  );
};

export const needsRequestDocumentReupload = (doc: RequestDocument): boolean => {
  const status = Number(doc.status);
  return (
    status === REQUEST_DOCUMENT_STATUS.Rejected ||
    status === REQUEST_DOCUMENT_STATUS.NeedsCorrection
  );
};

export const formatRequestDocumentUploadedAt = (uploadedAt?: string | null): string => {
  if (!uploadedAt) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(uploadedAt));
  } catch {
    return uploadedAt;
  }
};
