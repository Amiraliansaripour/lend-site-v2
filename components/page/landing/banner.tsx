'use client';

import Image from 'next/image';

import { useSiteTemplate, type SiteTemplateImageKey } from '@/providers/site-template';

interface BannerProps {
  src?: string;
  mobileSrc?: string;
  imageKey?: SiteTemplateImageKey;
  mobileImageKey?: SiteTemplateImageKey;
  children?: React.ReactNode;
}

export function Banner({
  src,
  mobileSrc,
  imageKey = 'homeBanner',
  mobileImageKey,
  children,
}: BannerProps) {
  const { getImageUrl, brandName } = useSiteTemplate();
  const desktopSrc = src || getImageUrl(imageKey);
  const resolvedMobileSrc =
    mobileSrc || (mobileImageKey ? getImageUrl(mobileImageKey) : '') || desktopSrc;

  return (
    <div className='relative overflow-hidden mb-11 md:mb-[70px]'>
      {desktopSrc ? (
        <Image
          className='w-full h-auto object-cover hidden md:block'
          src={desktopSrc}
          alt={`${brandName} banner`}
          width={1920}
          height={600}
          unoptimized
          priority
        />
      ) : null}
      {resolvedMobileSrc ? (
        <Image
          className='w-full h-auto block md:hidden'
          src={resolvedMobileSrc}
          alt={`${brandName} banner`}
          width={768}
          height={400}
          unoptimized
          priority
        />
      ) : null}
      {children}
    </div>
  );
}
