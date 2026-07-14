'use client';

import { Suspense, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useCategoryTree, useProductsByCategory } from '@/queries/shop';
import { ShopCategoryTree } from './shop-category-tree';
import { ShopProductList } from './shop-product-list';
import {
  categoryExistsInTree,
  filterActiveCategories,
  findFirstSelectableCategoryId,
} from './category-tree-utils';

type ShopCatalogProps = {
  merchantId: string;
};

function ShopCatalogContent({ merchantId }: ShopCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [isMobileTreeOpen, setIsMobileTreeOpen] = useState(true);

  const categoryFromUrl = searchParams.get('category');

  const {
    data: categories = [],
    isLoading: isTreeLoading,
    isError: isTreeError,
  } = useCategoryTree(merchantId);

  const activeCategories = useMemo(() => filterActiveCategories(categories ?? []), [categories]);

  const selectedCategoryId = useMemo(() => {
    if (!categoryFromUrl) return null;
    if (categoryExistsInTree(activeCategories, categoryFromUrl)) return categoryFromUrl;
    return null;
  }, [categoryFromUrl, activeCategories]);

  const setCategoryInUrl = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('category', categoryId);
      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  // Auto-select first leaf when tree loads and URL has no valid category
  useEffect(() => {
    if (isTreeLoading || activeCategories.length === 0) return;
    if (selectedCategoryId) return;

    const firstId = findFirstSelectableCategoryId(activeCategories);
    if (firstId) setCategoryInUrl(firstId);
  }, [isTreeLoading, activeCategories, selectedCategoryId, setCategoryInUrl]);

  const { data: products = [], isLoading: isProductsLoading } =
    useProductsByCategory(selectedCategoryId);

  const handleSelect = (categoryId: string) => {
    setCategoryInUrl(categoryId);
  };

  return (
    <section className='mb-12'>
      <h2 className='text-xl font-bold mb-6 text-right'>محصولات فروشگاه</h2>

      <div className='flex flex-col lg:flex-row gap-6 items-start'>
        {/* Desktop sidebar */}
        <aside className='hidden lg:block w-full max-w-[300px] shrink-0'>
          <div className='rounded-2xl border border-[#BEBEBE] bg-white p-4 sticky top-4'>
            <h3 className='text-base font-medium mb-3 text-right border-b border-[#A9A9A9] pb-2'>
              دسته‌بندی
            </h3>
            {isTreeError ? (
              <p className='text-sm text-red-500 text-right py-2'>خطا در دریافت دسته‌بندی‌ها</p>
            ) : (
              <ShopCategoryTree
                categories={activeCategories}
                selectedId={selectedCategoryId}
                onSelect={handleSelect}
                isLoading={isTreeLoading}
              />
            )}
          </div>
        </aside>

        {/* Mobile tree */}
        <div className='lg:hidden w-full'>
          <button
            type='button'
            onClick={() => setIsMobileTreeOpen(v => !v)}
            className='w-full flex items-center justify-between rounded-xl border border-[#BEBEBE] bg-white px-4 py-3 text-right'
          >
            <span className='font-medium text-sm'>دسته‌بندی</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-[#686868] transition-transform',
                isMobileTreeOpen && 'rotate-180',
              )}
            />
          </button>
          {isMobileTreeOpen && (
            <div className='mt-2 rounded-xl border border-[#BEBEBE] bg-white p-3 max-h-[320px] overflow-y-auto'>
              {isTreeError ? (
                <p className='text-sm text-red-500 text-right py-2'>خطا در دریافت دسته‌بندی‌ها</p>
              ) : (
                <ShopCategoryTree
                  categories={activeCategories}
                  selectedId={selectedCategoryId}
                  onSelect={handleSelect}
                  isLoading={isTreeLoading}
                />
              )}
            </div>
          )}
        </div>

        {/* Products */}
        <div className='flex-1 w-full min-w-0'>
          <ShopProductList
            products={products ?? []}
            isLoading={isProductsLoading}
            hasSelectedCategory={!!selectedCategoryId}
          />
        </div>
      </div>
    </section>
  );
}

function ShopCatalogFallback() {
  return (
    <section className='mb-12'>
      <div className='h-7 w-40 bg-gray-100 rounded animate-pulse mb-6 mr-auto' />
      <div className='flex gap-6'>
        <div className='hidden lg:block w-[300px] h-[400px] bg-gray-100 rounded-2xl animate-pulse' />
        <div className='flex-1 grid grid-cols-2 md:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='aspect-[3/4] bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ShopCatalog({ merchantId }: ShopCatalogProps) {
  if (!merchantId) return null;

  return (
    <Suspense fallback={<ShopCatalogFallback />}>
      <ShopCatalogContent merchantId={merchantId} />
    </Suspense>
  );
}
