import Image from 'next/image';
import type { Shop } from './shop-types';
import { getShopImageUrl } from '@/lib/shop-utils';
import ShopsBannerDesktop from '@/assets/images/banners/store.webp';
import ShopsBannerMobile from '@/assets/images/banners/store-res.png';
type ShopBannerProps = {
  shop: Shop;
};

export function ShopBanner({ shop }: ShopBannerProps) {
  const desktopSrc =
    getShopImageUrl(shop.attachmentBannerFilePath) ||
    (shop.banner ? `data:image/png;base64,${shop.banner}` : ShopsBannerDesktop);

  const mobileSrc =
    getShopImageUrl(shop.attachmentMobileFilePath) ||
    (shop.mobile ? `data:image/png;base64,${shop.mobile}` : null) ||
    getShopImageUrl(shop.attachmentBannerFilePath) ||
    (shop.banner ? `data:image/png;base64,${shop.banner}` : ShopsBannerMobile);

  return (
    <div className='overflow-hidden mb-11 md:mb-[70px]'>
      <Image
        className='hidden w-full h-auto object-cover md:block'
        src={desktopSrc}
        alt='Shop Banner'
        width={1920}
        height={600}
        priority
      />
      <Image
        className='w-full h-auto object-cover block md:hidden'
        src={mobileSrc}
        alt='Shop Banner Mobile'
        width={768}
        height={400}
        priority
      />
    </div>
  );
}
