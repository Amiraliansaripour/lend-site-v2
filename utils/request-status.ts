export type RequestStatusType = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'unknown';

export type RequestStatusInfo = {
  text: string;
  type: RequestStatusType;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
};

export const REQUEST_STATE_CANCELLED = 29;

/** Cancel is allowed while status has not progressed beyond 18. */
export const canCancelRequest = (requestState: number): boolean => {
  return requestState > 0 && requestState <= 18;
};

/** Statuses 10–17 are locked — user cannot modify submitted data. */
export const canModifyRequestData = (requestState: number): boolean => {
  return !(requestState >= 10 && requestState <= 17);
};

/**
 * New request is blocked while any request sits in statuses 10–17.
 * Status 29 (cancelled) and incomplete (< 8) do not block (incomplete ones are cancelled on create).
 */
export const canSubmitNewRequest = (requests: Array<{ requestState: number }>): boolean => {
  return !requests.some(r => r.requestState >= 10 && r.requestState <= 17);
};

/** Requests with status < 8 must be cancelled (→ 29) before / when submitting a new one. */
export const getIncompleteRequestsToCancel = <T extends { requestState: number }>(
  requests: T[],
): T[] => {
  return requests.filter(r => r.requestState > 0 && r.requestState < 8);
};

export const getRequestStatusInfo = (requestState: number): RequestStatusInfo => {
  if (requestState === REQUEST_STATE_CANCELLED) {
    return {
      text: 'لغو شده توسط کاربر',
      type: 'cancelled',
      variant: 'outline',
    };
  }

  // User steps (1-8)
  if (requestState >= 1 && requestState <= 8) {
    const states: Record<number, string> = {
      1: 'انتخاب طرح توسط کاربر',
      2: 'تایید اطلاعات هویتی توسط کاربر',
      3: 'انجام پرداخت توسط کاربر',
      4: 'تایید اعتبارسنجی توسط کاربر',
      5: 'ثبت اطلاعات درآمدی توسط کاربر',
      6: 'ثبت پیش فاکتور توسط کاربر',
      7: 'ثبت ضمانت توسط کاربر',
      8: 'تایید نهایی توسط کاربر',
    };
    return {
      text: states[requestState] || 'در حال بررسی',
      type: 'pending',
      variant: 'secondary',
    };
  }

  // Admin confirmations (11-18)
  if (requestState >= 11 && requestState <= 18) {
    const states: Record<number, string> = {
      11: 'تایید طرح توسط ادمین',
      12: 'تایید اطلاعات هویتی توسط ادمین',
      13: 'تایید اطلاعات پرداخت توسط ادمین',
      14: 'تایید اعتبارسنجی توسط ادمین',
      15: 'تایید اطلاعات درآمدی توسط ادمین',
      16: 'تایید پیش فاکتور توسط ادمین',
      17: 'تایید ضمانت توسط ادمین',
      18: 'تایید نهایی توسط ادمین',
    };
    return {
      text: states[requestState] || 'تایید شده',
      type: 'approved',
      variant: 'default',
    };
  }

  // Admin rejections (21-28)
  if (requestState >= 21 && requestState <= 28) {
    const states: Record<number, string> = {
      21: 'رد طرح توسط ادمین',
      22: 'رد اطلاعات هویتی توسط ادمین',
      23: 'رد پرداخت توسط ادمین',
      24: 'رد اعتبارسنجی توسط ادمین',
      25: 'رد اطلاعات درآمدی توسط ادمین',
      26: 'رد پیش فاکتور توسط ادمین',
      27: 'رد ضمانت توسط ادمین',
      28: 'رد نهایی توسط ادمین',
    };
    return {
      text: states[requestState] || 'رد شده',
      type: 'rejected',
      variant: 'destructive',
    };
  }

  return {
    text: 'وضعیت نامشخص',
    type: 'unknown',
    variant: 'outline',
  };
};

export const canContinueRequest = (requestState: number): boolean => {
  return requestState >= 1 && requestState < 8;
};

/**
 * Admin rejections 22–28 can be resumed by the user.
 * Resume stage = requestState - 20 (e.g. 25 → stage 5).
 */
export const canResumeRequest = (requestState: number): boolean => {
  return requestState >= 22 && requestState <= 28;
};

export const getResumeStep = (requestState: number): number => {
  return requestState - 20;
};
