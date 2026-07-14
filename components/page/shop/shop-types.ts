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

export type ProductCategoryField = {
  id: string;
  categoryId: string;
  fieldName: string;
  dataType: number;
  isRequired: boolean;
  displayOrder: number;
  description?: string | null;
  defaultValues?: string | null;
  isActive?: boolean;
};

export type ProductCategory = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: ProductCategory[] | null;
  level?: number;
  path?: string;
  displayOrder?: number;
  merchantId?: string;
  childrenCount?: number;
  totalChildrenCount?: number;
  categoryFields?: ProductCategoryField[] | null;
  isActive?: boolean;
};

export type ProductImage = {
  attachmentId?: string;
  displayOrder?: number;
  isMain?: boolean;
  title?: string | null;
  alt?: string | null;
  filePath?: string | null;
};

export type CategoryProduct = {
  id: string;
  name: string;
  code?: number;
  serial?: string | null;
  categoryId?: string;
  categoryName?: string | null;
  merchantId?: string;
  merchantName?: string | null;
  basePrice?: number | null;
  description?: string | null;
  isAvailable?: boolean;
  path?: string | null;
  fieldValues?: Record<string, string> | null;
  productImages?: ProductImage[] | null;
};
