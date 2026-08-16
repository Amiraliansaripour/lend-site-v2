// * api
import { api } from '@/lib/api/client';

// * types
import { APIResult } from '@/types/api';

export type SiteTemplateImages = {
  name: string;
  nameType: number;
  phone: string;
  phoneType: number;
  address: string;
  addressType: number;
  email: string;
  emailType: number;
  favicon: string;
  faviconId: string;
  faviconType: number;
  logo: string;
  logoId: string;
  logoType: number;
  darkLogo: string;
  darkLogoId: string;
  darkLogoType: number;
  lightLogo: string;
  lightLogoId: string;
  lightLogoType: number;
  homeBanner: string;
  homeBannerId: string;
  homeBannerType: number;
  slide_3: string;
  slide_3Id: string;
  slide_3Type: number;
  creditCard: string;
  creditCardId: string;
  creditCardType: number;
  cashCard: string;
  cashCardId: string;
  cashCardType: number;
  store: string;
  storeId: string;
  storeType: number;
  store_Res: string;
  store_ResId: string;
  store_ResType: number;
  shopBanner: string;
  shopBannerId: string;
  shopBannerType: number;
  shopBanner_Res: string;
  shopBanner_ResId: string;
  shopBanner_ResType: number;
  merchantBanner: string;
  merchantBannerId: string;
  merchantBannerType: number;
  merchantBanner_Res: string;
  merchantBanner_ResId: string;
  merchantBanner_ResType: number;
  merchantSignupBanner: string;
  merchantSignupBannerId: string;
  merchantSignupBannerType: number;
};

export const getSiteTemplateImages = async () => {
  const { data, resp } = await api.get<APIResult<SiteTemplateImages>>('/SiteTemplate/GetImage', {
    skipAuth: true,
    suppressErrorToast: true,
  });

  if (!resp.ok || !data?.isSuccess || !data.data) {
    throw new Error(data?.message || 'Failed to load site template');
  }

  return data.data;
};
