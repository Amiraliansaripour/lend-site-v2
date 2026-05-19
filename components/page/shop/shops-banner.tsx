import Image from 'next/image';
import ShopsBannerDesktop from '@/assets/images/banners/store.png';
import ShopsBannerMobile from '@/assets/images/banners/store-res.png';
export function ShopsBanner() {
  return (
    <div className='overflow-hidden mb-11 md:mb-[70px]'>
      <Image
        className='hidden w-full h-auto object-cover md:block'
        src={ShopsBannerDesktop}
        alt='Shops Banner'
        width={1920}
        height={600}
        priority
      />
      <Image
        className='w-full h-auto object-cover block md:hidden'
        src={ShopsBannerMobile}
        alt='Shops Banner Mobile'
        width={768}
        height={400}
        priority
      />
    </div>
  );
}
