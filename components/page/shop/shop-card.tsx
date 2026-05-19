import Link from 'next/link';
import Image from 'next/image';

import type { Shop } from './shop-types';
import { getShopImageUrl } from '@/lib/shop-utils';

type ShopCardProps = {
  shop: Shop;
};

export function ShopCard({ shop }: ShopCardProps) {
  const shopImage = getShopImageUrl(shop.attachmentFilePath);

  return (
    <Link
      href={`/shops/${shop.id}`}
      className='border flex flex-col border-[rgb(147,147,147)] rounded-lg h-[240px] w-full lg:h-[350px] max-w-80 mx-3 lg:mx-0 overflow-hidden hover:shadow-lg transition-shadow'
    >
      <div className='flex-1 overflow-hidden pb-1 flex justify-center items-center relative'>
        <div className='absolute flex gap-2 top-3 right-3 z-10'>
          {(shop.status === 1 || shop.status === 2) && (
            <div className='text-xs bg-white h-6 w-16 rounded-2xl flex items-center justify-center shadow-sm'>
              حضوری
            </div>
          )}
          {(shop.status === 0 || shop.status === 2) && (
            <div className='text-xs bg-white h-6 w-16 rounded-2xl flex items-center justify-center shadow-sm'>
              آنلاین
            </div>
          )}
        </div>
        {shopImage ? (
          <Image
            className='w-full h-full object-cover'
            src={shopImage}
            alt={shop.name || 'فروشگاه'}
            width={320}
            height={240}
            unoptimized
          />
        ) : (
          <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-500'>
            بدون تصویر
          </div>
        )}
      </div>
      <div className='border-t border-[#BEBEBE] px-3 lg:px-9 py-[18px] flex justify-between'>
        <div className='font-bold'>{shop.name}</div>
      </div>
    </Link>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className='border flex flex-col border-[rgb(147,147,147)] rounded-lg h-[240px] w-full lg:h-[350px] max-w-80 mx-3 lg:mx-0 animate-pulse'>
      <div className='flex-1 overflow-hidden pb-1 flex justify-center items-center relative bg-gray-200'>
        <div className='absolute flex gap-2 top-3 right-3'>
          <div className='h-6 w-16 bg-gray-300 rounded-2xl'></div>
          <div className='h-6 w-16 bg-gray-300 rounded-2xl'></div>
        </div>
        <div className='w-full h-full bg-gray-300'></div>
      </div>
      <div className='border-t border-[#BEBEBE] px-3 lg:px-9 py-[18px] flex justify-between'>
        <div className='h-5 bg-gray-300 rounded w-32'></div>
      </div>
    </div>
  );
}

export function ShopListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className='flex-1'>
      <div className='flex justify-center lg:justify-start flex-wrap gap-5 mb-16'>
        {Array.from({ length: count }).map((_, index) => (
          <ShopCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
