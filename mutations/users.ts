import { useMutation } from '@tanstack/react-query';
import { loginByOtp, loginByUsername } from '@/api/users';
import { updateUserProfile, UpdateProfilePayload, UpdateProfileResponse } from '@/api/common';
import { LoginByUsernameCredentials, LoginByOtpCredentials, LoginByOtpResult, LoginByUsernameResult } from '@/types/auth';
import { APIResult } from '@/types/api';

export const useLoginByUsername = () => {
  return useMutation<APIResult<LoginByUsernameResult>, Error, LoginByUsernameCredentials>({
    mutationFn: loginByUsername,
  });
};

export const useLoginByOtp = () => {
  return useMutation<
    APIResult<LoginByOtpResult>,
    Error,
    LoginByOtpCredentials
  >({
    mutationFn: loginByOtp,
  });
};

export const useUpdateUserProfile = () => {
  return useMutation<APIResult<UpdateProfileResponse>, Error, UpdateProfilePayload>({
    mutationFn: updateUserProfile,
  });
};
