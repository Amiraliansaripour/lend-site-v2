<<<<<<< HEAD
export type LoanDetailStatus = 0 | 1 | 2;

export type LoanDetail = {
  id: string;
  loanHeaderId: string;
  amount: number;
  dueDate: string;
  payedAt: string | null;
  loanDetailStatus: LoanDetailStatus;
  createdAt: string;
  updatedAt: string | null;
};

export type LoanHeader = {
  id: string;
  userId: string;
  requestId: string;
  requestRequestNumber: string;
  amount: number;
  lastInstallmentDate: string | null;
  nearInstallmentDate: string;
  loanDetails: LoanDetail[];
  createdAt: string;
  updatedAt: string | null;
};

export type PaymentTokenResponse = {
  token: string;
  terminalID: string;
  merchantId: string;
};
=======
export type LoanDetailStatus = 0 | 1 | 2;

export type LoanDetail = {
  id: string;
  loanHeaderId: string;
  amount: number;
  dueDate: string;
  payedAt: string | null;
  loanDetailStatus: LoanDetailStatus;
  createdAt: string;
  updatedAt: string | null;
};

export type LoanHeader = {
  id: string;
  userId: string;
  requestId: string;
  requestRequestNumber: string;
  amount: number;
  lastInstallmentDate: string | null;
  nearInstallmentDate: string;
  loanDetails: LoanDetail[];
  createdAt: string;
  updatedAt: string | null;
};

export type PaymentTokenResponse = {
  token: string;
  terminalID: string;
  merchantId: string;
};
>>>>>>> a47b58a (pwa)
