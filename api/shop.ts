import { api } from '@/lib/api/client';
import type { APIResult, Params } from '@/types/api';
import type {
  HomeCategory,
  MerchantPaginationParams,
  MerchantPaginationResult,
  Shop,
} from '@/components/page/shop/shop-types';

export const getMerchants = async (params: Params = {}) => {
  const resp = await api.get<APIResult<Shop[]>>('/Merchant/GetAll', params);
  return resp.data.data as Shop[];
};

export const getMerchantById = async (id: string) => {
  const resp = await api.get<APIResult<Shop>>(`/Merchant/Get/${id}`);
  return resp.data.data as Shop;
};

const buildMerchantPaginationQuery = (params: MerchantPaginationParams = {}) => {
  const search = new URLSearchParams();

  if (params.pageSize != null) {
    search.set('pageSize', String(params.pageSize));
  }
  if (params.pageNumber != null) {
    search.set('pageNumber', String(params.pageNumber));
  }
  if (params.status != null && params.status !== '2') {
    search.set('status', params.status);
  }
  params.filter?.forEach(categoryId => {
    if (categoryId) search.append('filter', categoryId);
  });

  const query = search.toString();
  return query ? `?${query}` : '';
};

const unwrapMerchantPagination = (
  payload: MerchantPaginationResult | APIResult<MerchantPaginationResult | null> | null | undefined,
): MerchantPaginationResult | null => {
  if (!payload || typeof payload !== 'object') return null;
  // GetFullPagination returns the page object at the top level (not APIResult-wrapped).
  if ('items' in payload) return payload as MerchantPaginationResult;
  if ('data' in payload) {
    const nested = (payload as APIResult<MerchantPaginationResult | null>).data;
    return nested && typeof nested === 'object' && 'items' in nested ? nested : null;
  }
  return null;
};

export const getMerchantsFullPagination = async (
  params: MerchantPaginationParams = {},
): Promise<MerchantPaginationResult> => {
  const query = buildMerchantPaginationQuery(params);
  const resp = await api.get<MerchantPaginationResult | APIResult<MerchantPaginationResult | null>>(
    `/Merchant/GetFullPagination${query}`,
  );

  const data = unwrapMerchantPagination(resp.data);
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    totalCount: data?.totalCount ?? 0,
    pageNumber: data?.pageNumber ?? params.pageNumber ?? 1,
    pageSize: data?.pageSize ?? params.pageSize ?? 12,
  };
};

export const getHomeCategories = async (): Promise<HomeCategory[]> => {
  try {
    const resp = await api.get<APIResult<HomeCategory[] | null>>(
      '/ProductCategory/GetHomeCetegory',
    );
    const categories = Array.isArray(resp.data?.data) ? resp.data.data : [];
    return categories.filter(category => category?.isActive !== false);
  } catch {
    return [];
  }
};
