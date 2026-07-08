<<<<<<< HEAD
'use client';

import { useParams } from 'next/navigation';
import { ShopPage } from '@/components/page/shop';
import { useShop } from '@/queries/shop';

export default function ShopPageRoute() {
  const params = useParams();
  const shopId = params.id as string;

  const { data: shop, isLoading } = useShop(shopId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-pulse text-lg'>در حال بارگذاری...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-2'>فروشگاه یافت نشد</h1>
          <p className='text-gray-600'>فروشگاه مورد نظر وجود ندارد یا حذف شده است</p>
        </div>
      </div>
    );
  }

  return <ShopPage shop={shop} />;
}
=======
'use client';

import { useParams } from 'next/navigation';
import { ShopPage } from '@/components/page/shop';
import { useShop } from '@/queries/shop';

export default function ShopPageRoute() {
  const params = useParams();
  const shopId = params.id as string;

  const { data: shop, isLoading } = useShop(shopId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-pulse text-lg'>در حال بارگذاری...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-2'>فروشگاه یافت نشد</h1>
          <p className='text-gray-600'>فروشگاه مورد نظر وجود ندارد یا حذف شده است</p>
        </div>
      </div>
    );
  }

  return <ShopPage shop={shop} />;
}
>>>>>>> a47b58a (pwa)
