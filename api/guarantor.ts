import { api } from '@/lib/api/client';
import type { APIResult } from '@/types/api';

/**
 * UserGuaranty endpoints (user panel):
 * GET  requested-user/{nationalCode}  — borrower info (ضامن looks up وام‌گیرنده)
 * POST accept/{nationalCode}          — ضامن announces guarantorship for borrower
 * GET  request/{requestId}            — list guarantors of a loan request
 * GET  guarantor-user/{nationalCode}  — وام‌گیرنده checks/nominates someone by national code as ضامن
 * POST {guarantorId}/approve          — borrower/admin approve
 * POST {guarantorId}/reject           — reject with reason string
 */
export const GUARANTOR_STATUS = {
  Pending: 0,
  /** اعلام ضمانت شده — awaiting borrower/admin */
  Requested: 1,
  Approved: 2,
  Rejected: 3,
} as const;

export type GuarantorStatus = (typeof GUARANTOR_STATUS)[keyof typeof GUARANTOR_STATUS];

export type Guarantor = {
  id: string;
  requestId?: string;
  /** Actual API fields from UserGuaranty/request/{id} */
  guarantorFullName?: string | null;
  guarantorNationalCode?: string | null;
  guarantorUserId?: string | null;
  requestedUserFullName?: string | null;
  requestedUserId?: string | null;
  status?: number | null;
  statusDisplay?: string | null;
  createdAt?: string | null;
  rejectReason?: string | null;
  /** Legacy / alternate shapes */
  userId?: string;
  firstName?: string | null;
  lastName?: string | null;
  nationalCode?: string | null;
  phoneNumber?: string | null;
  borrowerFirstName?: string | null;
  borrowerLastName?: string | null;
  borrowerNationalCode?: string | null;
  planName?: string | null;
  creditAmount?: number | null;
  [key: string]: unknown;
};

export type GuarantorRequestedUser = {
  id?: string;
  requestId?: string;
  firstName?: string | null;
  lastName?: string | null;
  nationalCode?: string | null;
  phoneNumber?: string | null;
  planName?: string | null;
  creditAmount?: number | null;
  period?: number | null;
  [key: string]: unknown;
};

export type ApiActionResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string };

function failureMessage(
  result: APIResult<unknown> | undefined,
  respOk: boolean,
  status: number,
  fallback: string,
): string {
  return result?.message || (!respOk ? `درخواست با وضعیت ${status} ناموفق بود` : fallback);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isGuarantorRequestedUserPayload(value: unknown): value is GuarantorRequestedUser {
  if (!isRecord(value)) return false;
  return (
    typeof value.nationalCode === 'string' ||
    typeof value.firstName === 'string' ||
    typeof value.lastName === 'string' ||
    typeof value.requestId === 'string' ||
    typeof value.id === 'string'
  );
}

function normalizeGuarantorList(value: unknown): Guarantor[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord) as Guarantor[];
  }
  if (isRecord(value) && Array.isArray(value.items)) {
    return value.items.filter(isRecord) as Guarantor[];
  }
  if (
    isRecord(value) &&
    (value.id ||
      value.nationalCode ||
      value.guarantorNationalCode ||
      value.guarantorFullName ||
      value.status != null)
  ) {
    return [value as Guarantor];
  }
  return [];
}

/** GET requested-user/{nationalCode} — اطلاعات وام‌گیرنده برای ضامن */
export const getGuarantorRequestedUser = async (
  nationalCode: string,
): Promise<ApiActionResult<GuarantorRequestedUser>> => {
  const resp = await api.get<APIResult<GuarantorRequestedUser | string | null>>(
    `/UserGuaranty/requested-user/${encodeURIComponent(nationalCode)}`,
    { suppressErrorToast: true },
  );

  const result = resp.data;
  if (!resp.resp.ok || result?.isSuccess !== true) {
    return {
      ok: false,
      message: failureMessage(
        result,
        resp.resp.ok,
        resp.resp.status,
        'دریافت اطلاعات وام‌گیرنده با خطا مواجه شد',
      ),
    };
  }

  const data = result.data;
  if (
    data == null ||
    data === 'null' ||
    typeof data === 'string' ||
    !isGuarantorRequestedUserPayload(data)
  ) {
    return {
      ok: false,
      message: result.message || 'اطلاعاتی برای این کد ملی یافت نشد',
    };
  }

  return { ok: true, data, message: result.message };
};

/** POST accept/{nationalCode} — اعلام ضمانت */
export const acceptGuarantorship = async (
  nationalCode: string,
): Promise<ApiActionResult<Guarantor | null>> => {
  const resp = await api.post<Record<string, never>, APIResult<Guarantor | string | null>>(
    `/UserGuaranty/accept/${encodeURIComponent(nationalCode)}`,
    {},
    { suppressErrorToast: true },
  );

  const result = resp.data;
  if (!resp.resp.ok || result?.isSuccess !== true) {
    return {
      ok: false,
      message: failureMessage(result, resp.resp.ok, resp.resp.status, 'خطا در اعلام ضمانت'),
    };
  }

  const data = result.data;
  if (data == null || data === 'null' || typeof data === 'string') {
    return { ok: true, data: null, message: result.message || 'ضمانت با موفقیت اعلام شد' };
  }

  return { ok: true, data: data as Guarantor, message: result.message };
};

/** GET request/{requestId} — لیست ضامن‌های یک درخواست */
export const getRequestGuarantors = async (requestId: string): Promise<Guarantor[]> => {
  const resp = await api.get<APIResult<unknown>>(`/UserGuaranty/request/${requestId}`, {
    suppressErrorToast: true,
  });

  if (!resp.resp.ok || resp.data?.isSuccess === false) {
    return [];
  }

  return normalizeGuarantorList(resp.data?.data);
};

/**
 * GET guarantor-user/{nationalCode}
 * وام‌گیرنده: بررسی / معرفی فرد با کد ملی به‌عنوان ضامن
 */
export const lookupGuarantorByNationalCode = async (
  nationalCode: string,
): Promise<ApiActionResult<Guarantor[]>> => {
  const resp = await api.get<APIResult<unknown>>(
    `/UserGuaranty/guarantor-user/${encodeURIComponent(nationalCode)}`,
    { suppressErrorToast: true },
  );

  const result = resp.data;
  if (!resp.resp.ok || result?.isSuccess !== true) {
    return {
      ok: false,
      message: failureMessage(
        result,
        resp.resp.ok,
        resp.resp.status,
        'بررسی ضامن با این کد ملی ناموفق بود',
      ),
    };
  }

  return {
    ok: true,
    data: normalizeGuarantorList(result.data),
    message: result.message,
  };
};

/** @deprecated use lookupGuarantorByNationalCode */
export const getGuarantorUserStatus = lookupGuarantorByNationalCode;

/** POST {guarantorId}/approve — تأیید ضامن */
export const approveGuarantor = async (guarantorId: string): Promise<ApiActionResult<unknown>> => {
  const resp = await api.post<Record<string, never>, APIResult<unknown>>(
    `/UserGuaranty/${guarantorId}/approve`,
    {},
    { suppressErrorToast: true },
  );

  const result = resp.data;
  if (!resp.resp.ok || result?.isSuccess !== true) {
    return {
      ok: false,
      message: failureMessage(result, resp.resp.ok, resp.resp.status, 'خطا در تأیید ضامن'),
    };
  }

  return { ok: true, data: result.data, message: result.message };
};

/** POST {guarantorId}/reject — رد ضامن (body: JSON string) */
export const rejectGuarantor = async (
  guarantorId: string,
  reason: string,
): Promise<ApiActionResult<unknown>> => {
  const resp = await api.post<string, APIResult<unknown>>(
    `/UserGuaranty/${guarantorId}/reject`,
    reason,
    { suppressErrorToast: true },
  );

  const result = resp.data;
  if (!resp.resp.ok || result?.isSuccess !== true) {
    return {
      ok: false,
      message: failureMessage(result, resp.resp.ok, resp.resp.status, 'خطا در رد ضامن'),
    };
  }

  return { ok: true, data: result.data, message: result.message };
};

export const isGuarantorRejected = (guarantor: Guarantor): boolean => {
  const status = Number(guarantor.status);
  if (status === GUARANTOR_STATUS.Rejected) return true;
  const display = String(guarantor.statusDisplay || '').toLowerCase();
  return display === 'rejected' || display.includes('reject');
};

export const isGuarantorApproved = (guarantor: Guarantor): boolean => {
  if (isGuarantorRejected(guarantor)) return false;
  const status = Number(guarantor.status);
  if (Number.isFinite(status)) return status === GUARANTOR_STATUS.Approved;
  const display = String(guarantor.statusDisplay || '').toLowerCase();
  if (display === 'approved' || display === 'accepted') return true;
  return guarantor.isApproved === true;
};

export const isGuarantorPendingReview = (guarantor: Guarantor): boolean => {
  if (isGuarantorApproved(guarantor) || isGuarantorRejected(guarantor)) return false;
  const status = Number(guarantor.status);
  return (
    status === GUARANTOR_STATUS.Requested ||
    status === GUARANTOR_STATUS.Pending ||
    !Number.isFinite(status)
  );
};

export const getGuarantorDisplayName = (guarantor: Guarantor): string => {
  const fromApi = guarantor.guarantorFullName?.trim();
  if (fromApi) return fromApi;
  const fullName = [guarantor.firstName, guarantor.lastName].filter(Boolean).join(' ').trim();
  return fullName || guarantor.guarantorNationalCode || guarantor.nationalCode || 'ضامن';
};

export const getGuarantorNationalCode = (guarantor: Guarantor): string | null => {
  const code = guarantor.guarantorNationalCode || guarantor.nationalCode;
  return code ? String(code) : null;
};

export const getBorrowerDisplayName = (guarantor: Guarantor): string => {
  const fromApi = guarantor.requestedUserFullName?.trim();
  if (fromApi) return fromApi;
  const fullName = [guarantor.borrowerFirstName, guarantor.borrowerLastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return fullName || guarantor.borrowerNationalCode || 'وام‌گیرنده';
};

const STATUS_DISPLAY_FA: Record<string, string> = {
  Pending: 'در انتظار',
  Requested: 'اعلام شده — در انتظار تأیید',
  Accepted: 'اعلام شده — در انتظار تأیید',
  Approved: 'تأیید شده',
  Rejected: 'رد شده',
};

export const getGuarantorStatusLabel = (
  status?: number | null,
  statusDisplay?: string | null,
): string => {
  if (statusDisplay) {
    const mapped = STATUS_DISPLAY_FA[statusDisplay] || STATUS_DISPLAY_FA[statusDisplay.trim()];
    if (mapped) return mapped;
  }

  switch (Number(status)) {
    case GUARANTOR_STATUS.Pending:
      return 'در انتظار';
    case GUARANTOR_STATUS.Requested:
      return 'اعلام شده — در انتظار تأیید وام‌گیرنده';
    case GUARANTOR_STATUS.Approved:
      return 'تأیید شده';
    case GUARANTOR_STATUS.Rejected:
      return 'رد شده';
    default:
      return statusDisplay?.trim() || 'نامشخص';
  }
};

export const formatGuarantorCreatedAt = (createdAt?: string | null): string => {
  if (!createdAt) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(createdAt));
  } catch {
    return createdAt;
  }
};
