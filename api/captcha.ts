// * types
import { api } from '@/lib/api/client';
import type { APIResult, Params } from '@/types/api';

type Captcha = {
  id: string;
  captchaImage: string;
  isActive: boolean;
};

export const getCaptcha = async (params: Params = {}) => {
  const resp = await api.get<APIResult<Captcha>>('/Captcha/GenerateCaptcha', params);
  return resp.data.data as Captcha;
};
