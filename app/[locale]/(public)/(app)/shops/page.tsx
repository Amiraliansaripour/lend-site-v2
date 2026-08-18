'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';

import { ShopsPage, ShopListSkeleton } from '@/components/page/shop';
import { useHomeCategories, useShopsFullPagination } from '@/queries/shop';
import type { ShopType } from '@/components/page/shop/shop-types';

const ITEMS_PER_PAGE = 12;

function ShopsPageContent() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const type = (searchParams.get('type') as ShopType) || '2';
  const selectedCategories = useMemo(() => searchParams.getAll('category'), [searchParams]);

  const paginationParams = useMemo(
    () => ({
      pageNumber: page,
      pageSize: ITEMS_PER_PAGE,
      status: type,
      filter: selectedCategories,
    }),
    [page, type, selectedCategories],
  );

  const { data, isLoading } = useShopsFullPagination(paginationParams);
  const { data: categories = [], isLoading: isCategoriesLoading } = useHomeCategories();

  const shops = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / ITEMS_PER_PAGE));

  return (
    <ShopsPage
      shops={shops}
      totalPages={totalPages}
      isLoading={isLoading}
      categories={categories}
      isCategoriesLoading={isCategoriesLoading}
    />
  );
}

export default function ShopsPageRoute() {
  return (
    <Suspense fallback={<ShopListSkeleton />}>
      <ShopsPageContent />
    </Suspense>
  );
}
