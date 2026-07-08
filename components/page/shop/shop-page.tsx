<<<<<<< HEAD
import { Calculator } from '@/components/page/landing';
import { ShopBanner } from './shop-banner';
import { ShopSteps } from './shop-steps';
import type { Shop } from './shop-types';

type ShopPageProps = {
  shop: Shop;
};

export function ShopPage({ shop }: ShopPageProps) {
  return (
    <div className='w-full'>
      <ShopBanner shop={shop} />

      <div className='max-w-screen-2xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
          <div className='bg-white rounded-2xl shadow-md p-6'>
            <h2 className='text-xl font-bold mb-4 text-right'>درباره فروشگاه</h2>
            <p className='text-gray-700 text-right leading-7'>{shop.description}</p>
          </div>

          <div className='bg-white rounded-2xl shadow-md p-6'>
            <h2 className='text-xl font-bold mb-4 text-right'>اطلاعات تماس</h2>
            <div className='space-y-3 text-right'>
              {shop.phoneNumber && (
                <div className='flex items-center justify-end gap-2'>
                  <span className='text-gray-700'>{shop.phoneNumber}</span>
                  <span className='text-gray-500'>:تلفن</span>
                </div>
              )}
              {shop.address && (
                <div className='flex items-start justify-end gap-2'>
                  <span className='text-gray-700 flex-1'>{shop.address}</span>
                  <span className='text-gray-500 whitespace-nowrap'>:آدرس</span>
                </div>
              )}
              {shop.url && (
                <div className='flex items-center justify-end gap-2'>
                  <a
                    href={shop.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline'
                  >
                    {shop.url}
                  </a>
                  <span className='text-gray-500'>:وبسایت</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <ShopSteps />
        <Calculator />
      </div>
    </div>
  );
}
=======
import { Calculator } from '@/components/page/landing';
import { ShopBanner } from './shop-banner';
import { ShopSteps } from './shop-steps';
import type { Shop } from './shop-types';

type ShopPageProps = {
  shop: Shop;
};

export function ShopPage({ shop }: ShopPageProps) {
  return (
    <div className='w-full'>
      <ShopBanner shop={shop} />

      <div className='max-w-screen-2xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
          <div className='bg-white rounded-2xl shadow-md p-6'>
            <h2 className='text-xl font-bold mb-4 text-right'>درباره فروشگاه</h2>
            <p className='text-gray-700 text-right leading-7'>{shop.description}</p>
          </div>

          <div className='bg-white rounded-2xl shadow-md p-6'>
            <h2 className='text-xl font-bold mb-4 text-right'>اطلاعات تماس</h2>
            <div className='space-y-3 text-right'>
              {shop.phoneNumber && (
                <div className='flex items-center justify-end gap-2'>
                  <span className='text-gray-700'>{shop.phoneNumber}</span>
                  <span className='text-gray-500'>:تلفن</span>
                </div>
              )}
              {shop.address && (
                <div className='flex items-start justify-end gap-2'>
                  <span className='text-gray-700 flex-1'>{shop.address}</span>
                  <span className='text-gray-500 whitespace-nowrap'>:آدرس</span>
                </div>
              )}
              {shop.url && (
                <div className='flex items-center justify-end gap-2'>
                  <a
                    href={shop.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline'
                  >
                    {shop.url}
                  </a>
                  <span className='text-gray-500'>:وبسایت</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <ShopSteps />
        <Calculator />
      </div>
    </div>
  );
}
>>>>>>> a47b58a (pwa)
