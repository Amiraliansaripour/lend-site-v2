'use client';

import Image from 'next/image';

import { HeroSlider } from '@/components/page/landing/hero-slider';
import { useSiteTemplate, type SiteTemplateImageKey } from '@/providers/site-template';
import { cn } from '@/lib/utils';

interface BannerProps {
  src?: string;
  mobileSrc?: string;
  imageKey?: SiteTemplateImageKey;
  mobileImageKey?: SiteTemplateImageKey;
  children?: React.ReactNode;
  variant?: 'hero' | 'image';
  className?: string;
}

export function Banner({
  src,
  mobileSrc,
  imageKey = 'homeBanner',
  mobileImageKey,
  children,
  variant = 'hero',
  className,
}: BannerProps) {
  const { getImageUrl, brandName } = useSiteTemplate();
  const desktopSrc = src || getImageUrl(imageKey);
  const resolvedMobileSrc =
    mobileSrc || (mobileImageKey ? getImageUrl(mobileImageKey) : '') || desktopSrc;

  if (variant === 'image') {
    return (
      <div className={cn('relative mb-11 overflow-hidden bg-navy md:mb-[70px]', className)}>
        {desktopSrc ? (
          <Image
            className='hidden h-auto w-full object-cover md:block'
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
            className='block h-auto w-full md:hidden'
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

  return (
    <>
      <HeroSlider className={className} />
      {children}
    </>
  );
}
