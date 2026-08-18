import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginByOtp, loginByUsername } from '@/api/users';
import { updateUserProfile, UpdateProfilePayload, UpdateProfileResponse } from '@/api/common';
import {
  LoginByUsernameCredentials,
  LoginByOtpCredentials,
  LoginByOtpResult,
  LoginByUsernameResult,
} from '@/types/auth';
import { APIResult } from '@/types/api';
import { queryKeys } from '@/queries/users';

export const useLoginByUsername = () => {
  return useMutation<APIResult<LoginByUsernameResult>, Error, LoginByUsernameCredentials>({
    mutationFn: loginByUsername,
  });
};

export const useLoginByOtp = () => {
  return useMutation<APIResult<LoginByOtpResult>, Error, LoginByOtpCredentials>({
    mutationFn: loginByOtp,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};
