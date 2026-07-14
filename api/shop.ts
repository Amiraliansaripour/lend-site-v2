import { api } from '@/lib/api/client';
import type { APIResult, Params } from '@/types/api';
import type { Shop } from '@/components/page/shop/shop-types';

export const getMerchants = async (params: Params = {}) => {
  const resp = await api.get<APIResult<Shop[]>>('/Merchant/GetAll', params);
  return resp.data.data as Shop[];
};

export const getMerchantById = async (id: string) => {
  const resp = await api.get<APIResult<Shop>>(`/Merchant/Get/${id}`);
  return resp.data.data as Shop;
};
