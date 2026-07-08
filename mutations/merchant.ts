// * react-query
import { useMutation } from '@tanstack/react-query';

// * api
import {
  createMerchantSignupRequest,
  type MerchantSignupData,
  type MerchantSignupResponse,
} from '@/api/merchant';

// * types
import type { APIResult } from '@/types/api';

export const mutationKeys = {
  merchant: {
    crud: ['merchant'],
    create: () => [...mutationKeys.merchant.crud, 'merchant.create'],
  },
} as const;

export const useCreateMerchantSignup = () => {
  return useMutation<APIResult<MerchantSignupResponse>, Error, MerchantSignupData>({
    mutationKey: mutationKeys.merchant.create(),
    mutationFn: (data: MerchantSignupData) => {
      return createMerchantSignupRequest(data);
    },
  });
};
