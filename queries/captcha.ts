// * @tanstack/react-query
import { queryOptions } from '@tanstack/react-query';

// * api
import { getCaptcha } from '@/api/captcha';

export const queryKeys = {
  captcha: ['captcha'],
} as const;

export const getCaptchaQueryOptions = () => {
  return queryOptions({
    queryKey: queryKeys.captcha,
    queryFn: () => getCaptcha(),
  });
};
