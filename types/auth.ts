export type User = {
  id?: string;
  firstName?: string;
  lastName?: string;
  nationalCode?: string;
  phoneNumber?: string;
  personInfo?: {
    birthDate?: string;
    phoneNumber?: string;
    cityProvinceName?: string;
    cityName?: string;
    address?: string;
    postalCode?: string;
    telephone?: string;
    fatherName?: string;
    issuePlace?: string;
    birthCertificateNumber?: string;
    email?: string;
    cityProvinceId?: string;
    nationalCode?: string;
    cityId?: string;
    jobTitle?: string;
  };
};

export type LoginByUsernameCredentials = User & {
  isActive?: boolean;
  captchaId?: string;
  captchaCode?: string;
  X_CaptchaId: string;
  X_CaptchaCode: string;
};

export type LoginByUsernameResult = {
  requireOtp: boolean;
  isComplete: boolean;
  requireNationalCode: boolean;
  requireSejamCaptch: boolean;
  requireSejamOtp: boolean;
  userId: string;
  id: string;
  isActive: boolean;
};

export type LoginByOtpCredentials = User & {
  grant_type: 'otp';
  otp: string;
};

export type LoginByOtpResult = {
  id: string;
  roles: 'user'[];
  access_token: string;
  expires_in: string;
  refresh_token: string;
};
