// * api
import { api } from '@/lib/api/client';

// * types
import { APIResult } from '@/types/api';

export type Province = {
  id: string;
  name: string;
  isActive: boolean;
};

export type City = {
  id: string;
  name: string;
  provinceId: string;
  isActive: boolean;
};

export const getProvinces = async () => {
  const resp = await api.get<APIResult<Province[]>>('/Province/Get');
  return resp.data;
};

export const getCitiesByProvince = async (provinceId: string) => {
  const resp = await api.get<APIResult<City[]>>(`/City/GetProvinceCity/${provinceId}`);
  return resp.data;
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  fatherName: string;
  birthDate: string | null;
  issuePlace: string;
  birthCertificateNumber: string;
  email: string;
  provinceId: string;
  cityId: string;
  postalCode: string;
  jobTitle: string;
  telephone: string;
  address: string;
  userId: string;
};

export type UpdateProfileResponse = {
  id: string;
  firstName?: string;
  lastName?: string;
  nationalCode?: string;
  personInfo?: {
    birthDate?: string;
    phoneNumber?: string;
    cityProvinceName?: string;
    cityName?: string;
    address?: string;
    postalCode?: string;
    telephone?: string;
    fatherName?: string;
    issuePlace?: string;
    birthCertificateNumber?: string;
    email?: string;
    cityProvinceId?: string;
    cityId?: string;
    jobTitle?: string;
  };
};

export const updateUserProfile = async (payload: UpdateProfilePayload) => {
  const resp = await api.put<UpdateProfilePayload, APIResult<UpdateProfileResponse>>(
    '/user/UpdateProfile',
    payload,
  );
  return resp.data;
};
