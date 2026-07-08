<<<<<<< HEAD
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';

import { ShopsPage, ShopListSkeleton } from '@/components/page/shop';
import { useShops } from '@/queries/shop';
import type { Shop, ShopType } from '@/components/page/shop/shop-types';

const ITEMS_PER_PAGE = 12;

function ShopsPageContent() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const type = (searchParams.get('type') as ShopType) || '2';
  const categories = searchParams.getAll('category');

  const { data: allShops, isLoading } = useShops();

  const { filteredShops, totalPages } = useMemo(() => {
    if (!allShops) return { filteredShops: [], totalPages: 1 };

    let filtered = allShops.filter((shop: Shop) => shop.isActive);

    if (categories.length > 0 && filtered.length > 0) {
      filtered = filtered.filter((shop: Shop) =>
        shop.categoryIds?.some(catId => categories.includes(catId)),
      );
    }

    if (type !== '2') {
      filtered = filtered.filter((shop: Shop) => {
        if (type === '0') return shop.status === 0 || shop.status === 2;
        if (type === '1') return shop.status === 1 || shop.status === 2;
        return true;
      });
    }

    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedShops = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { filteredShops: paginatedShops, totalPages: total };
  }, [allShops, categories, type, page]);

  return <ShopsPage shops={filteredShops} totalPages={totalPages} isLoading={isLoading} />;
}

export default function ShopsPageRoute() {
  return (
    <Suspense fallback={<ShopListSkeleton />}>
      <ShopsPageContent />
    </Suspense>
  );
}
=======
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';

import { ShopsPage, ShopListSkeleton } from '@/components/page/shop';
import { useShops } from '@/queries/shop';
import type { Shop, ShopType } from '@/components/page/shop/shop-types';

const ITEMS_PER_PAGE = 12;

function ShopsPageContent() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const type = (searchParams.get('type') as ShopType) || '2';
  const categories = searchParams.getAll('category');

  const { data: allShops, isLoading } = useShops();

  const { filteredShops, totalPages } = useMemo(() => {
    if (!allShops) return { filteredShops: [], totalPages: 1 };

    let filtered = allShops.filter((shop: Shop) => shop.isActive);

    if (categories.length > 0 && filtered.length > 0) {
      filtered = filtered.filter((shop: Shop) =>
        shop.categoryIds?.some(catId => categories.includes(catId)),
      );
    }

    if (type !== '2') {
      filtered = filtered.filter((shop: Shop) => {
        if (type === '0') return shop.status === 0 || shop.status === 2;
        if (type === '1') return shop.status === 1 || shop.status === 2;
        return true;
      });
    }

    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedShops = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { filteredShops: paginatedShops, totalPages: total };
  }, [allShops, categories, type, page]);

  return <ShopsPage shops={filteredShops} totalPages={totalPages} isLoading={isLoading} />;
}

export default function ShopsPageRoute() {
  return (
    <Suspense fallback={<ShopListSkeleton />}>
      <ShopsPageContent />
    </Suspense>
  );
}
>>>>>>> a47b58a (pwa)
