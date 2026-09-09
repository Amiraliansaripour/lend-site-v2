'use client';

import { Suspense, useMemo } from 'react';

import { ShopsPage, ShopListSkeleton } from '@/components/page/shop';
import { useShopsFilters } from '@/components/page/shop/use-shops-filters';
import { useHomeCategories, useShopsFullPagination } from '@/queries/shop';

const ITEMS_PER_PAGE = 12;

function ShopsPageContent() {
  const {
    type,
    categories: selectedCategories,
    page,
    setShopType,
    setShopCategories,
    setShopPage,
  } = useShopsFilters();

  const filterKey = useMemo(() => [...selectedCategories].sort().join(','), [selectedCategories]);

  const paginationParams = useMemo(
    () => ({
      pageNumber: page,
      pageSize: ITEMS_PER_PAGE,
      status: type,
      filter: filterKey ? filterKey.split(',') : [],
    }),
    [page, type, filterKey],
  );

  const { data, isLoading, isFetching } = useShopsFullPagination(paginationParams);
  const { data: categories = [], isLoading: isCategoriesLoading } = useHomeCategories();

  const shops = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / ITEMS_PER_PAGE));

  return (
    <ShopsPage
      shops={shops}
      totalPages={totalPages}
      page={page}
      isLoading={isLoading && !data}
      isFetching={isFetching && Boolean(data)}
      categories={categories}
      isCategoriesLoading={isCategoriesLoading}
      selectedType={type}
      selectedCategories={selectedCategories}
      onTypeChange={setShopType}
      onCategoriesChange={setShopCategories}
      onPageChange={setShopPage}
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
