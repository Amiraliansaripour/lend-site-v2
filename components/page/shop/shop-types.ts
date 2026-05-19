export const SHOP_CATEGORIES = [
  {
    name: 'مد و پوشاک',
    id: '34f0ba6a-6b2c-45c8-b0fa-202183aa1160',
  },
  {
    name: 'زیبایی وسلامت',
    id: 'd348fb09-e8db-475e-b2d3-6200ab309a19',
  },
  {
    name: 'کالای دیجیتال',
    id: '4f90d831-eae1-4f82-9f16-68c4e3994049',
  },
  {
    name: 'طلا',
    id: '9f9901a9-c137-4e30-ab79-84768df6ba81',
  },
  {
    name: 'خانه و آشپزخانه',
    id: '071c42f6-ada4-4840-8f41-b0b47ca18c85',
  },
  {
    name: 'وسایل نقلیه',
    id: '6dadd428-8e72-4dc6-9ab7-e375f0c49f74',
  },
  {
    name: 'گردشگری و سفر',
    id: '246d8fb1-fe6c-45af-be89-e9e5464d9030',
  },
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export type ShopType = '0' | '1' | '2' | '3';

export type ShopStatus = 0 | 1 | 2;

export type Shop = {
  id: string;
  name: string;
  logo?: string | null;
  logoPath?: string;
  banner?: string | null;
  mobile?: string | null;
  thumbnail?: string | null;
  bannerPath?: string | null;
  index?: number;
  attachmentFilePath?: string | null;
  attachmentBannerFilePath?: string | null;
  attachmentMobileFilePath?: string | null;
  attachmentThumbnailFilePath?: string | null;
  ownerMerchant?: boolean;
  status: ShopStatus;
  creditPercentFree?: number;
  cashPercentFree?: number;
  phoneNumber?: string | null;
  isActive: boolean;
  categoryIds?: string[];
  description?: string;
  phone?: string;
  address?: string;
  type?: ShopType;
  url?: string;
};
