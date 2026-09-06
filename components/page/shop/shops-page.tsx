'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ShopsBanner } from './shops-banner';
import { ShopsFilters } from './shops-filters';
import { ShopsMobileFilters } from './shops-mobile-filters';
import { ShopsList } from './shops-list';
import type { HomeCategory, Shop, ShopType } from './shop-types';

type ShopsPageProps = {
  shops: Shop[];
  totalPages: number;
  page: number;
  isLoading?: boolean;
  isFetching?: boolean;
  categories?: HomeCategory[];
  isCategoriesLoading?: boolean;
  selectedType: ShopType;
  selectedCategories: string[];
  onTypeChange: (type: ShopType) => void;
  onCategoriesChange: (categories: string[]) => void;
  onPageChange: (page: number) => void;
};

export function ShopsPage({
  shops,
  totalPages,
  page,
  isLoading,
  isFetching,
  categories = [],
  isCategoriesLoading,
  selectedType,
  selectedCategories,
  onTypeChange,
  onCategoriesChange,
  onPageChange,
}: ShopsPageProps) {
  const listShellRef = useRef<HTMLDivElement>(null);
  const minHeightRef = useRef(0);

  // Lock list shell height while refetching so a shorter result set cannot
  // collapse the document and clamp window scroll up to the banner.
  useEffect(() => {
    const el = listShellRef.current;
    if (!el) return;

    if (isFetching) {
      minHeightRef.current = Math.max(minHeightRef.current, el.offsetHeight);
      el.style.minHeight = `${minHeightRef.current}px`;
      return;
    }

    const scrollY = window.scrollY;
    el.style.minHeight = '';
    minHeightRef.current = el.offsetHeight;
    window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
    });
  }, [isFetching, shops]);

  return (
    <div className='w-full'>
      <ShopsBanner />

      <div className='max-w-screen-2xl mx-auto px-4 py-8'>
        <div className='block lg:hidden mb-6'>
          <ShopsMobileFilters
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
            selectedType={selectedType}
            selectedCategories={selectedCategories}
            onTypeChange={onTypeChange}
            onCategoriesChange={onCategoriesChange}
          />
        </div>

        <div className='flex gap-6 items-start'>
          <div className='hidden lg:block'>
            <ShopsFilters
              categories={categories}
              isCategoriesLoading={isCategoriesLoading}
              selectedType={selectedType}
              selectedCategories={selectedCategories}
              onTypeChange={onTypeChange}
              onCategoriesChange={onCategoriesChange}
            />
          </div>

          <div
            ref={listShellRef}
            className={cn(
              'min-w-0 flex-1 transition-opacity',
              isFetching && !isLoading && 'opacity-70',
            )}
          >
            <ShopsList
              shops={shops}
              totalPages={totalPages}
              page={page}
              isLoading={isLoading}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
