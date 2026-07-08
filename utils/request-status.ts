<<<<<<< HEAD
export type RequestStatusType = 'pending' | 'approved' | 'rejected' | 'unknown';

export type RequestStatusInfo = {
  text: string;
  type: RequestStatusType;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
};

export const getRequestStatusInfo = (requestState: number): RequestStatusInfo => {
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
=======
export type RequestStatusType = 'pending' | 'approved' | 'rejected' | 'unknown';

export type RequestStatusInfo = {
  text: string;
  type: RequestStatusType;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
};

export const getRequestStatusInfo = (requestState: number): RequestStatusInfo => {
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
>>>>>>> a47b58a (pwa)
