// * queries
import { queryKeys } from '@/queries/request';

// * react-query
import { useMutation } from '@tanstack/react-query';

// * api
import {
  createRequest,
  changeRequestState,
  uploadUserAttachments,
  validateUserIdentityInfo,
  updateSalaryInfo,
  createIncomeInfo,
  createInvoice,
  getPaymentToken,
  registerCheque,
  confirmRequestByUser,
  type Request,
  type ChangeRequestStateData,
  type UploadUserAttachmentsData,
  type UpdateSalaryInfoData,
  type CreateIncomeInfoData,
  type CreateInvoiceData,
  type GetPaymentTokenData,
  type GetPaymentTokenResponse,
  type RegisterChequeData,
} from '@/api/request';

// * types
import type { APIResult } from '@/types/api';

export const mutationKeys = {
  requests: {
    crud: ['requests'],
    update: () => [...mutationKeys.requests.crud, 'requests.update'],
    delete: () => [...mutationKeys.requests.crud, 'requests.delete'],
    create: () => [...mutationKeys.requests.crud, 'requests.create'],
    changeState: () => [...mutationKeys.requests.crud, 'requests.changeState'],
    uploadAttachments: () => [...mutationKeys.requests.crud, 'requests.uploadAttachments'],
    validateIdentity: () => [...mutationKeys.requests.crud, 'requests.validateIdentity'],
    updateSalary: () => [...mutationKeys.requests.crud, 'requests.updateSalary'],
    createIncome: () => [...mutationKeys.requests.crud, 'requests.createIncome'],
    createInvoice: () => [...mutationKeys.requests.crud, 'requests.createInvoice'],
    getPaymentToken: () => [...mutationKeys.requests.crud, 'requests.getPaymentToken'],
    registerCheque: () => [...mutationKeys.requests.crud, 'requests.registerCheque'],
    confirmByUser: () => [...mutationKeys.requests.crud, 'requests.confirmByUser'],
  },
} as const;

export const useCreateRequest = () => {
  return useMutation({
    mutationKey: mutationKeys.requests.create(),
    mutationFn: (data: Request) => {
      return createRequest(data);
    },
    meta: { invalidatesQueries: [queryKeys.requests] },
  });
};

export const useChangeRequestState = () => {
  return useMutation<APIResult<unknown>, Error, ChangeRequestStateData>({
    mutationKey: mutationKeys.requests.changeState(),
    mutationFn: (data: ChangeRequestStateData) => {
      return changeRequestState(data);
    },
    meta: { invalidatesQueries: [queryKeys.requests] },
  });
};

export const useUploadUserAttachments = () => {
  return useMutation<APIResult<unknown>, Error, UploadUserAttachmentsData>({
    mutationKey: mutationKeys.requests.uploadAttachments(),
    mutationFn: (data: UploadUserAttachmentsData) => {
      return uploadUserAttachments(data);
    },
  });
};

export const useValidateUserIdentityInfo = () => {
  return useMutation<APIResult<unknown>, Error, string>({
    mutationKey: mutationKeys.requests.validateIdentity(),
    mutationFn: (requestId: string) => {
      return validateUserIdentityInfo(requestId);
    },
  });
};

export const useUpdateSalaryInfo = () => {
  return useMutation<APIResult<unknown>, Error, UpdateSalaryInfoData>({
    mutationKey: mutationKeys.requests.updateSalary(),
    mutationFn: (data: UpdateSalaryInfoData) => {
      return updateSalaryInfo(data);
    },
  });
};

export const useCreateIncomeInfo = () => {
  return useMutation<APIResult<unknown>, Error, CreateIncomeInfoData>({
    mutationKey: mutationKeys.requests.createIncome(),
    mutationFn: (data: CreateIncomeInfoData) => {
      return createIncomeInfo(data);
    },
  });
};

export const useCreateInvoice = () => {
  return useMutation<APIResult<unknown>, Error, CreateInvoiceData>({
    mutationKey: mutationKeys.requests.createInvoice(),
    mutationFn: (data: CreateInvoiceData) => {
      return createInvoice(data);
    },
  });
};

export const useGetPaymentToken = () => {
  return useMutation<APIResult<GetPaymentTokenResponse>, Error, GetPaymentTokenData>({
    mutationKey: mutationKeys.requests.getPaymentToken(),
    mutationFn: (data: GetPaymentTokenData) => {
      return getPaymentToken(data);
    },
  });
};

export const useRegisterCheque = () => {
  return useMutation<APIResult<unknown>, Error, RegisterChequeData>({
    mutationKey: mutationKeys.requests.registerCheque(),
    mutationFn: (data: RegisterChequeData) => {
      return registerCheque(data);
    },
  });
};

export const useConfirmRequestByUser = () => {
  return useMutation<APIResult<unknown>, Error, string>({
    mutationKey: mutationKeys.requests.confirmByUser(),
    mutationFn: (requestId: string) => {
      return confirmRequestByUser(requestId);
    },
    meta: { invalidatesQueries: [queryKeys.requests] },
  });
};
