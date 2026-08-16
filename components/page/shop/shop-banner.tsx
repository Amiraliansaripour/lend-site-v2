'use client';

import Image from 'next/image';

import type { Shop } from './shop-types';
import { getShopImageUrl } from '@/lib/shop-utils';
import { useSiteTemplate } from '@/providers/site-template';

type ShopBannerProps = {
  shop: Shop;
};

export function ShopBanner({ shop }: ShopBannerProps) {
  const { brandName, getImageUrl } = useSiteTemplate();
  const desktopSrc = getShopImageUrl(shop.attachmentBannerFilePath) || getImageUrl('shopBanner');
  const mobileSrc =
    getShopImageUrl(shop.attachmentMobileFilePath) || getImageUrl('shopBanner_Res') || desktopSrc;

  return (
    <div className='overflow-hidden mb-11 md:mb-[70px]'>
      {desktopSrc ? (
        <Image
          className='hidden w-full h-auto object-cover md:block'
          src={desktopSrc}
          alt={`${shop.name || brandName} banner`}
          width={1920}
          height={600}
          priority
          unoptimized
        />
      ) : null}
      {mobileSrc ? (
        <Image
          className='w-full h-auto object-cover block md:hidden'
          src={mobileSrc}
          alt={`${shop.name || brandName} banner`}
          width={768}
          height={400}
          priority
          unoptimized
        />
      ) : null}
    </div>
  );
}
