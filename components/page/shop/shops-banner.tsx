'use client';

import Image from 'next/image';

import { useSiteTemplate } from '@/providers/site-template';

export function ShopsBanner() {
  const { brandName, getImageUrl } = useSiteTemplate();
  const desktopSrc = getImageUrl('store');
  const mobileSrc = getImageUrl('store_Res') || desktopSrc;

  return (
    <div className='overflow-hidden mb-11 md:mb-[70px]'>
      {desktopSrc ? (
        <Image
          className='hidden w-full h-auto object-cover md:block'
          src={desktopSrc}
          alt={`${brandName} shops banner`}
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
          alt={`${brandName} shops banner`}
          width={768}
          height={400}
          priority
          unoptimized
        />
      ) : null}
    </div>
  );
}
