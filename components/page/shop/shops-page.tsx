<<<<<<< HEAD
'use client';

import { ShopsBanner } from './shops-banner';
import { ShopsFilters } from './shops-filters';
import { ShopsMobileFilters } from './shops-mobile-filters';
import { ShopsList } from './shops-list';
import type { Shop } from './shop-types';

type ShopsPageProps = {
  shops: Shop[];
  totalPages: number;
  isLoading?: boolean;
};

export function ShopsPage({ shops, totalPages, isLoading }: ShopsPageProps) {
  return (
    <div className='w-full'>
      <ShopsBanner />

      <div className='max-w-screen-2xl mx-auto px-4 py-8'>
        <div className='block lg:hidden mb-6'>
          <ShopsMobileFilters />
        </div>

        <div className='flex gap-6 items-start'>
          <div className='hidden lg:block'>
            <ShopsFilters />
          </div>

          <ShopsList shops={shops} totalPages={totalPages} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
=======
'use client';

import { ShopsBanner } from './shops-banner';
import { ShopsFilters } from './shops-filters';
import { ShopsMobileFilters } from './shops-mobile-filters';
import { ShopsList } from './shops-list';
import type { Shop } from './shop-types';

type ShopsPageProps = {
  shops: Shop[];
  totalPages: number;
  isLoading?: boolean;
};

export function ShopsPage({ shops, totalPages, isLoading }: ShopsPageProps) {
  return (
    <div className='w-full'>
      <ShopsBanner />

      <div className='max-w-screen-2xl mx-auto px-4 py-8'>
        <div className='block lg:hidden mb-6'>
          <ShopsMobileFilters />
        </div>

        <div className='flex gap-6 items-start'>
          <div className='hidden lg:block'>
            <ShopsFilters />
          </div>

          <ShopsList shops={shops} totalPages={totalPages} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
>>>>>>> a47b58a (pwa)
