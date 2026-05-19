import Image, { StaticImageData } from 'next/image';
import LandingBannerMobile from '@/assets/images/banners/landing-mobile.png';
import LandingBanner from '@/assets/images/banners/landing.png';

interface BannerProps {
  src?: StaticImageData;
  children?: React.ReactNode;
}

export function Banner({ src, children }: BannerProps) {
  const desktopSrc = src ?? LandingBanner;
  const mobileSrc = src ?? LandingBannerMobile;

  return (
    <div className='relative overflow-hidden mb-11 md:mb-[70px]'>
      <Image
        className='w-full h-auto object-cover hidden md:block'
        src={desktopSrc}
        alt='Desktop Banner'
      />
      <Image
        className='w-full h-auto block md:hidden'
        src={mobileSrc}
        alt='Mobile Banner'
      />
      {children}
    </div>
  );
}
