'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { HomeCategory, ShopType } from './shop-types';

type ShopsMobileFiltersProps = {
  className?: string;
  categories?: HomeCategory[];
  isCategoriesLoading?: boolean;
};

export function ShopsMobileFilters({
  className,
  categories = [],
  isCategoriesLoading,
}: ShopsMobileFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const selectedType = (searchParams.get('type') as ShopType) || '2';
  const selectedCategories = searchParams.getAll('category');

  const onlineEnabled = selectedType === '0' || selectedType === '2';
  const physicalEnabled = selectedType === '1' || selectedType === '2';

  const updateURL = useCallback(
    (updates: { type?: ShopType; categories?: string[] }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.type !== undefined) {
        if (updates.type === '2') {
          params.delete('type');
        } else {
          params.set('type', updates.type);
        }
      }

      if (updates.categories !== undefined) {
        params.delete('category');
        updates.categories.forEach(id => params.append('category', id));
      }

      params.delete('page');

      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router],
  );

  const handleTypeChange = (online: boolean, physical: boolean) => {
    let newType: ShopType;
    if (online && physical) {
      newType = '2';
    } else if (online) {
      newType = '0';
    } else if (physical) {
      newType = '1';
    } else {
      newType = '3';
    }
    updateURL({ type: newType });
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const next = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(id => id !== categoryId);
    updateURL({ categories: next });
  };

  return (
    <div className={cn('flex gap-4 mb-6', className)}>
      <button
        onClick={() => setIsTypeOpen(true)}
        className='flex-1 bg-white rounded-lg shadow-md py-3 px-4 text-center'
      >
        <span className='text-sm font-medium'>نوع فروشگاه</span>
      </button>

      <button
        onClick={() => setIsCategoryOpen(true)}
        className='flex-1 bg-white rounded-lg shadow-md py-3 px-4 text-center'
      >
        <span className='text-sm font-medium'>
          دسته‌بندی
          {selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ''}
        </span>
      </button>

      {isTypeOpen && (
        <div className='fixed inset-0 z-50 flex items-end'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setIsTypeOpen(false)} />
          <div className='relative w-full bg-white rounded-t-3xl p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>نوع فروشگاه</h3>
              <button
                onClick={() => setIsTypeOpen(false)}
                className='p-1 hover:bg-gray-100 rounded-full'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <div className='flex flex-col gap-3'>
              <label className='flex items-center justify-between cursor-pointer py-3 px-4 hover:bg-gray-50 rounded-lg'>
                <span className='text-sm'>آنلاین</span>
                <input
                  type='checkbox'
                  checked={onlineEnabled}
                  onChange={e => handleTypeChange(e.target.checked, physicalEnabled)}
                  disabled={isPending}
                  className='w-4 h-4'
                />
              </label>
              <label className='flex items-center justify-between cursor-pointer py-3 px-4 hover:bg-gray-50 rounded-lg'>
                <span className='text-sm'>حضوری</span>
                <input
                  type='checkbox'
                  checked={physicalEnabled}
                  onChange={e => handleTypeChange(onlineEnabled, e.target.checked)}
                  disabled={isPending}
                  className='w-4 h-4'
                />
              </label>
            </div>
            <Button
              onClick={() => setIsTypeOpen(false)}
              className='w-full mt-6'
              disabled={isPending}
            >
              اعمال فیلتر
            </Button>
          </div>
        </div>
      )}

      {isCategoryOpen && (
        <div className='fixed inset-0 z-50 flex items-end'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setIsCategoryOpen(false)} />
          <div className='relative w-full bg-white rounded-t-3xl p-6 max-h-[80vh] flex flex-col'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>دسته‌بندی</h3>
              <button
                onClick={() => setIsCategoryOpen(false)}
                className='p-1 hover:bg-gray-100 rounded-full'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <div className='flex flex-col gap-1 overflow-y-auto flex-1'>
              {isCategoriesLoading ? (
                <p className='text-sm text-gray-400 py-4 text-center'>در حال بارگذاری...</p>
              ) : categories.length === 0 ? (
                <p className='text-sm text-gray-400 py-4 text-center'>دسته‌بندی‌ای یافت نشد</p>
              ) : (
                categories.map(category => (
                  <label
                    key={category.id}
                    className='flex items-center justify-between cursor-pointer py-3 px-4 hover:bg-gray-50 rounded-lg gap-3'
                  >
                    <span className='text-sm text-right'>{category.name}</span>
                    <input
                      type='checkbox'
                      checked={selectedCategories.includes(category.id)}
                      onChange={e => handleCategoryToggle(category.id, e.target.checked)}
                      disabled={isPending}
                      className='w-4 h-4 shrink-0'
                    />
                  </label>
                ))
              )}
            </div>
            <Button
              onClick={() => setIsCategoryOpen(false)}
              className='w-full mt-6'
              disabled={isPending}
            >
              اعمال فیلتر
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
