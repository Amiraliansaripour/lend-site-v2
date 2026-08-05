// * types
import { api } from '@/lib/api/client';
import type { APIResult, Params } from '@/types/api';

type Captcha = {
  id: string;
  captchaImage: string;
  isActive: boolean;
};

export const getCaptcha = async (_params: Params = {}) => {
  const resp = await api.get<APIResult<Captcha>>('/Captcha/GenerateCaptcha', {
    skipAuth: true,
  });
  return resp.data.data as Captcha;
};
