export type RequestCreditStep =
  | 'checking_otp_status'
  | 'showing_otp_modal'
  | 'loading_data'
  | 'loan_calc'
  | 'user_information'
  | 'pay_validation'
  | 'validation'
  | 'income_information'
  | 'proforma_invoice'
  | 'collateral'
  | 'accept_by_user'
  | 'error';

export interface OtpStatus {
  otpStatus: boolean;
  token?: string;
  trackId?: string;
}

export interface CreditStatusInfo {
  score?: number;
  risk?: string;
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  personInfo?: {
    birthDate?: string;
    phoneNumber?: string;
    cityProvinceName?: string;
    cityName?: string;
    address?: string;
    postalCode?: string;
    telephone?: string;
  };
}

export interface FacilityInquiryResponse {
  otpStatus: boolean;
  token?: string;
  trackId?: string;
  creditStatusInfo?: CreditStatusInfo;
  userInfo?: UserInfo;
}

export interface FacilityInquiryPayload {
  userId: string;
  requestId?: string;
  otp?: string;
  isActive?: boolean;
}

export interface OtpVerifyPayload {
  trackId: string;
  token: string;
  otp: string;
  requestId: string;
}

export interface ValidationData {
  score?: number;
  risk?: string;
  token?: string;
  trackId?: string;
}

export interface PlanData {
  id: string;
  name: string;
  financierName: string;
  period: number;
  minAmount: number;
  maxAmount: number;
  firstSystemFee: number;
  firstBankFee: number;
  duringSystemFee: number;
  duringBankFee: number;
  guarantees?: Guarantee[] | string[];
}

export interface Guarantee {
  id: string;
  name: string;
  value: string;
}

export interface LoanCalculation {
  originalAmount: number;
  netAmountReceived: number;
  totalRepaymentAmount: number;
  monthlyInstallment: number;
  totalInterest: number;
  fees: {
    firstSystemFeeAmount: number;
    firstBankFeeAmount: number;
    duringSystemFeeAmount: number;
    duringBankFeeAmount: number;
    systemFeePerInstallment: number;
    bankFeePerInstallment: number;
    couponMainAmount: number;
    totalFees: number;
  };
  period: number;
}

export interface AttachmentType {
  nationalCardFront: number;
  nationalCardBack: number;
  birthCertificate: number;
  [key: string]: number;
}

export interface UploadedFile {
  file: File;
  preview: string;
  format: string;
}

export interface UploadProgress {
  status: 'uploading' | 'success' | 'error';
  message: string;
  progress?: number;
}

export interface AttachmentData {
  id: string;
  name: string;
  attachmentType: number;
  url?: string;
}

export interface UserInformationFormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  nationalCode: string;
  phoneNumber: string;
  branchCityName: string;
  branchName: string;
  address: string;
  postalCode: string;
  telephone: string;
}

export interface StepLabel {
  label: string;
  key: number;
}

export interface RequestStateChangePayload {
  id: string;
  requestState: number;
}

export interface CreateRequestPayload {
  userId: string;
  planId: string;
  creditAmount: number;
  period: number;
}

export interface CreateRequestResponse {
  id: string;
  requestState: number;
  planId: string;
  userId: string;
  creditAmount: number;
  period: number;
  requestNumber: number;
  loanDetailAmount: number;
  requestDate: string;
  feeAmount: number;
  guaranteedAmount: number;
  totalRefundAmount: number;
  remainCreditAmount: number;
  creditValidityDate: string | null;
  settledInstallmentAmount: number;
  remainInstallmentAmount: number;
  contractFilePath: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userNationalCode: string | null;
  userPhoneNumber: string | null;
  userAttachments: unknown[];
  userFileImage: unknown[];
  financierId: string | null;
  financierName: string | null;
  lastSuccessState: number | null;
  mode: number;
  forCorrections: unknown | null;
  validateType: unknown | null;
  chequeId: string;
  chequeSayadId: string | null;
  chequeFileImage: unknown | null;
  chequeFileImageBack: unknown | null;
  chequeAttachmentFilePath: string | null;
  chequeAttachmentBackFilePath: string | null;
  chequeFileImagePromissory: unknown | null;
  chequeAttachmentPromissoryFilePath: string | null;
  chequeFileImageDeductionSalary: unknown | null;
  chequeAttachmentDeductionSalaryFilePath: string | null;
  incomeInfoId: string;
  incomeInfoIncome: string;
  incomeInfoPayAbility: string;
  incomeInfoAttachments: unknown[];
  incomeInfoFileImage: unknown[];
  rejectDescription: string | null;
  loanHeaderId: string;
  planGuarantees: string[];
  planName: string | null;
  planPercentage: string;
  planFee: string;
  planFinancierName: string | null;
  planDuringBankFee: number;
  planDuringSystemFee: number;
  planFirstBankFee: number;
  planFirstSystemFee: number;
  planPeriod: string;
  planIsGuaranteeRequired: boolean;
  planIsIncomeRequired: boolean;
  planIsValidateRequired: boolean;
  planIsInvoiceRequired: boolean;
  planScore: string | null;
  invoiceId: string;
  invoiceAttachmentFilePath: string | null;
  invoiceFileImage: unknown | null;
  userCreditStatusId: string;
  userCreditStatusChequeColorStatus: unknown | null;
  userCreditStatusIsBlocked: string;
  userCreditStatusOver18: string;
  userCreditStatusLifeStatus: string;
  userCreditStatusFacilityDeferred: string;
  userCreditStatusGuarantyDeferred: string;
  userCreditStatusScore: unknown | null;
  userCreditStatusRisk: unknown | null;
  userFacilityId: string;
  userGuarantyId: string;
  isActive: boolean;
}
