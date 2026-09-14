// * api
import { api } from '@/lib/api/client';

// * types
import { APIResult } from '@/types/api';

export type SiteTemplateImages = {
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

  /** null / empty → default site row (used by this panel) */
  companyName?: string | null;
  colorMain?: string | null;
  colorSecond?: string | null;
  hasCompany?: boolean | null;
  title?: string | null;
  textData?: string | null;
};

const isDefaultCompany = (companyName?: string | null) => !(companyName ?? '').trim();

const normalizeList = (payload: unknown): SiteTemplateImages[] => {
  if (Array.isArray(payload)) {
    return payload.filter(Boolean) as SiteTemplateImages[];
  }
  if (payload && typeof payload === 'object') {
    return [payload as SiteTemplateImages];
  }
  return [];
};

/** Always the default row: companyName is null / empty. */
export const pickDefaultSiteTemplate = (
  templates: SiteTemplateImages[],
): SiteTemplateImages | null => {
  if (!templates.length) return null;
  return templates.find(item => isDefaultCompany(item.companyName)) ?? templates[0] ?? null;
};

/**
 * Loads site template images/contact fields.
 * Backend now returns an array of identical-shaped objects; this panel always
 * uses the default entry (companyName = null). Callers still receive a single
 * object — provider / UI structure unchanged.
 */
export const getSiteTemplateImages = async () => {
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

  const selected = pickDefaultSiteTemplate(normalizeList(data.data));
  if (!selected) {
    throw new Error(data?.message || 'Failed to load site template');
  }

  return selected;
};
