<<<<<<< HEAD
// * @tanstack/react-query
import { queryOptions, useQuery } from '@tanstack/react-query';

// * api
import { getProvinces, getCitiesByProvince } from '@/api/common';

export const queryKeys = { common: ['common'] } as const;

export const getProvincesQueryOptions = () => {
  return queryOptions({
    queryKey: [...queryKeys.common, 'provinces'],
    queryFn: () => getProvinces(),
  });
};

export const getCitiesByProvinceQueryOptions = (provinceId: string) => {
  return queryOptions({
    queryKey: [...queryKeys.common, 'cities', provinceId],
    queryFn: () => getCitiesByProvince(provinceId),
    enabled: !!provinceId,
  });
};

export const useProvinces = () => {
  return useQuery(getProvincesQueryOptions());
};

export const useCitiesByProvince = (provinceId: string) => {
  return useQuery(getCitiesByProvinceQueryOptions(provinceId));
};
=======
// * @tanstack/react-query
import { queryOptions, useQuery } from '@tanstack/react-query';

// * api
import { getProvinces, getCitiesByProvince } from '@/api/common';

export const queryKeys = { common: ['common'] } as const;

export const getProvincesQueryOptions = () => {
  return queryOptions({
    queryKey: [...queryKeys.common, 'provinces'],
    queryFn: () => getProvinces(),
  });
};

export const getCitiesByProvinceQueryOptions = (provinceId: string) => {
  return queryOptions({
    queryKey: [...queryKeys.common, 'cities', provinceId],
    queryFn: () => getCitiesByProvince(provinceId),
    enabled: !!provinceId,
  });
};

export const useProvinces = () => {
  return useQuery(getProvincesQueryOptions());
};

export const useCitiesByProvince = (provinceId: string) => {
  return useQuery(getCitiesByProvinceQueryOptions(provinceId));
};
>>>>>>> a47b58a (pwa)
