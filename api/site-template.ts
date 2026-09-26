import { api } from '@/lib/api/client';
import type { APIResult } from '@/types/api';

/**
 * One white-label / tenant site configuration returned by GetImage.
 * The API returns many of these with identical keys and different values.
 */
export type SiteTemplateImages = {
  title?: string | null;
  textData?: string | null;
  siteType?: number | null;
  attachmentId?: string | null;
  filePath?: string | null;

  name: string;
  nameType?: number;
  phone: string;
  phoneType?: number;
  address: string;
  addressType?: number;
  email: string;
  emailType?: number;

  favicon: string;
  faviconId?: string;
  faviconType?: number;
  logo: string;
  logoId?: string;
  logoType?: number;
  darkLogo: string;
  darkLogoId?: string;
  darkLogoType?: number;
  lightLogo: string;
  lightLogoId?: string;
  lightLogoType?: number;
  homeBanner: string;
  homeBannerId?: string;
  homeBannerType?: number;
  slide_3: string;
  slide_3Id?: string;
  slide_3Type?: number;
  creditCard: string;
  creditCardId?: string;
  creditCardType?: number;
  cashCard: string;
  cashCardId?: string;
  cashCardType?: number;
  store: string;
  storeId?: string;
  storeType?: number;
  store_Res: string;
  store_ResId?: string;
  store_ResType?: number;
  shopBanner: string;
  shopBannerId?: string;
  shopBannerType?: number;
  shopBanner_Res: string;
  shopBanner_ResId?: string;
  shopBanner_ResType?: number;
  merchantBanner: string;
  merchantBannerId?: string;
  merchantBannerType?: number;
  merchantBanner_Res: string;
  merchantBanner_ResId?: string;
  merchantBanner_ResType?: number;
  merchantSignupBanner: string;
  merchantSignupBannerId?: string;
  merchantSignupBannerType?: number;

  hasCompany?: boolean | null;
  /** Empty / null → default (apex) site. Non-empty → tenant matched by subdomain. */
  companyName?: string | null;
  colorMain?: string | null;
  colorSecond?: string | null;
};

const normalizeList = (payload: unknown): SiteTemplateImages[] => {
  if (Array.isArray(payload)) {
    return payload.filter(Boolean) as SiteTemplateImages[];
  }

  if (payload && typeof payload === 'object') {
    return [payload as SiteTemplateImages];
  }

  return [];
};

/**
 * Fetches all site templates. Response may be an array (multi-tenant)
 * or a legacy single object — both are normalized to an array.
 */
export const getSiteTemplateImages = async (): Promise<SiteTemplateImages[]> => {
  const { data, resp } = await api.get<APIResult<SiteTemplateImages[] | SiteTemplateImages>>(
    '/SiteTemplate/GetImage',
    {
      skipAuth: true,
      suppressErrorToast: true,
    },
  );

  if (!resp.ok || !data?.isSuccess || data.data == null) {
    throw new Error(data?.message || 'Failed to load site template');
  }

  const list = normalizeList(data.data);
  if (list.length === 0) {
    throw new Error(data?.message || 'Failed to load site template');
  }

  return list;
};
